<?php
declare(strict_types=1);

/*
 * Códigos QR sin librerías externas: modo byte, corrección de errores M (aguanta ~15 % del código
 * tapado o sucio), versiones 1 a 10 (hasta 213 bytes, de sobra para un enlace).
 * Sigue la norma ISO/IEC 18004 (el mismo algoritmo que la librería de Nayuki). Devuelve un SVG.
 */

// Versión => [códigos de corrección por bloque, [códigos de datos de cada bloque]]
const QR_M = [
    1 => [10, [16]], 2 => [16, [28]], 3 => [26, [44]], 4 => [18, [32, 32]], 5 => [24, [43, 43]],
    6 => [16, [27, 27, 27, 27]], 7 => [18, [31, 31, 31, 31]], 8 => [22, [38, 38, 39, 39]],
    9 => [22, [36, 36, 36, 37, 37]], 10 => [26, [43, 43, 43, 43, 44]],
];
const QR_ALIGN = [1 => [], 2 => [6, 18], 3 => [6, 22], 4 => [6, 26], 5 => [6, 30], 6 => [6, 34],
    7 => [6, 22, 38], 8 => [6, 24, 42], 9 => [6, 26, 46], 10 => [6, 28, 50]];

function qr_gf_mul(int $x, int $y): int
{
    $z = 0;
    for ($i = 7; $i >= 0; $i--) {
        $z = (($z << 1) ^ (($z >> 7) * 0x11D)) & 0xFF;
        $z ^= (($y >> $i) & 1) * $x;
    }
    return $z;
}

function qr_rs_divisor(int $degree): array
{
    $r = array_fill(0, $degree, 0);
    $r[$degree - 1] = 1;
    $root = 1;
    for ($i = 0; $i < $degree; $i++) {
        for ($j = 0; $j < $degree; $j++) {
            $r[$j] = qr_gf_mul($r[$j], $root);
            if ($j + 1 < $degree) $r[$j] ^= $r[$j + 1];
        }
        $root = qr_gf_mul($root, 0x02);
    }
    return $r;
}

function qr_rs_remainder(array $data, array $div): array
{
    $r = array_fill(0, count($div), 0);
    foreach ($data as $b) {
        $f = $b ^ array_shift($r);
        $r[] = 0;
        foreach ($div as $i => $d) $r[$i] ^= qr_gf_mul($d, $f);
    }
    return $r;
}

/** Matriz del QR: lista de filas con true (oscuro) / false (claro). */
function qr_matrix(string $text): array
{
    $len = strlen($text);
    $ver = 0;
    foreach (QR_M as $v => [, $blocks]) {
        if (4 + ($v < 10 ? 8 : 16) + 8 * $len <= array_sum($blocks) * 8) { $ver = $v; break; }
    }
    if (!$ver) throw new RuntimeException('Texto demasiado largo para un código QR');
    [$ecLen, $blocks] = QR_M[$ver];
    $cap = array_sum($blocks) * 8;

    // 1) Datos en bits: modo byte, longitud, texto, terminador y relleno
    $bits = [];
    $put = function (int $val, int $n) use (&$bits): void { for ($i = $n - 1; $i >= 0; $i--) $bits[] = ($val >> $i) & 1; };
    $put(4, 4);
    $put($len, $ver < 10 ? 8 : 16);
    for ($i = 0; $i < $len; $i++) $put(ord($text[$i]), 8);
    $put(0, min(4, $cap - count($bits)));
    $put(0, (8 - count($bits) % 8) % 8);
    for ($pad = 0xEC; count($bits) < $cap; $pad ^= 0xEC ^ 0x11) $put($pad, 8);
    $bytes = [];
    foreach (array_chunk($bits, 8) as $c) $bytes[] = (int)bindec(implode('', $c));

    // 2) Bloques con su corrección de errores (Reed-Solomon), intercalados
    $div = qr_rs_divisor($ecLen);
    $dataB = [];
    $ecB = [];
    $k = 0;
    foreach ($blocks as $n) {
        $d = array_slice($bytes, $k, $n);
        $k += $n;
        $dataB[] = $d;
        $ecB[] = qr_rs_remainder($d, $div);
    }
    $code = [];
    for ($i = 0; $i < max($blocks); $i++) foreach ($dataB as $d) if (isset($d[$i])) $code[] = $d[$i];
    for ($i = 0; $i < $ecLen; $i++) foreach ($ecB as $e) $code[] = $e[$i];

    // 3) Patrones fijos
    $size = 17 + 4 * $ver;
    $m = array_fill(0, $size, array_fill(0, $size, false));
    $fn = $m;
    $set = function (int $x, int $y, bool $dark) use (&$m, &$fn): void { $m[$y][$x] = $dark; $fn[$y][$x] = true; };
    for ($i = 0; $i < $size; $i++) { $set(6, $i, $i % 2 === 0); $set($i, 6, $i % 2 === 0); }
    foreach ([[3, 3], [$size - 4, 3], [3, $size - 4]] as [$cx, $cy]) {
        for ($dy = -4; $dy <= 4; $dy++) for ($dx = -4; $dx <= 4; $dx++) {
            $x = $cx + $dx;
            $y = $cy + $dy;
            $dist = max(abs($dx), abs($dy));
            if ($x >= 0 && $x < $size && $y >= 0 && $y < $size) $set($x, $y, $dist !== 2 && $dist !== 4);
        }
    }
    $al = QR_ALIGN[$ver];
    $na = count($al);
    foreach ($al as $i => $ax) foreach ($al as $j => $ay) {
        if (($i === 0 && $j === 0) || ($i === 0 && $j === $na - 1) || ($i === $na - 1 && $j === 0)) continue;
        for ($dy = -2; $dy <= 2; $dy++) for ($dx = -2; $dx <= 2; $dx++) $set($ax + $dx, $ay + $dy, max(abs($dx), abs($dy)) !== 1);
    }
    $format = function (int $mask) use ($set, $size): void {
        $data = (0 << 3) | $mask; // nivel M = 00
        $rem = $data;
        for ($i = 0; $i < 10; $i++) $rem = ($rem << 1) ^ (($rem >> 9) * 0x537);
        $b = (($data << 10) | $rem) ^ 0x5412;
        $bit = fn(int $i) => (($b >> $i) & 1) === 1;
        for ($i = 0; $i <= 5; $i++) $set(8, $i, $bit($i));
        $set(8, 7, $bit(6));
        $set(8, 8, $bit(7));
        $set(7, 8, $bit(8));
        for ($i = 9; $i < 15; $i++) $set(14 - $i, 8, $bit($i));
        for ($i = 0; $i < 8; $i++) $set($size - 1 - $i, 8, $bit($i));
        for ($i = 8; $i < 15; $i++) $set(8, $size - 15 + $i, $bit($i));
        $set(8, $size - 8, true);
    };
    $format(0); // reserva el sitio; se reescribe con la máscara buena
    if ($ver >= 7) {
        $rem = $ver;
        for ($i = 0; $i < 12; $i++) $rem = ($rem << 1) ^ (($rem >> 11) * 0x1F25);
        $b = ($ver << 12) | $rem;
        for ($i = 0; $i < 18; $i++) {
            $dark = (($b >> $i) & 1) === 1;
            $a = $size - 11 + $i % 3;
            $c = intdiv($i, 3);
            $set($a, $c, $dark);
            $set($c, $a, $dark);
        }
    }

    // 4) Los datos en zigzag
    $i = 0;
    $total = count($code) * 8;
    for ($right = $size - 1; $right >= 1; $right -= 2) {
        if ($right === 6) $right = 5;
        $up = (($right + 1) & 2) === 0;
        for ($v = 0; $v < $size; $v++) for ($j = 0; $j < 2; $j++) {
            $x = $right - $j;
            $y = $up ? $size - 1 - $v : $v;
            if (!$fn[$y][$x] && $i < $total) {
                $m[$y][$x] = (($code[$i >> 3] >> (7 - ($i & 7))) & 1) === 1;
                $i++;
            }
        }
    }

    // 5) La máscara que deja el código más fácil de leer
    $masked = function (int $mask) use ($m, $fn, $size): array {
        for ($y = 0; $y < $size; $y++) for ($x = 0; $x < $size; $x++) {
            if ($fn[$y][$x]) continue;
            $inv = match ($mask) {
                0 => ($x + $y) % 2 === 0,
                1 => $y % 2 === 0,
                2 => $x % 3 === 0,
                3 => ($x + $y) % 3 === 0,
                4 => (intdiv($x, 3) + intdiv($y, 2)) % 2 === 0,
                5 => ($x * $y) % 2 + ($x * $y) % 3 === 0,
                6 => (($x * $y) % 2 + ($x * $y) % 3) % 2 === 0,
                default => (($x + $y) % 2 + ($x * $y) % 3) % 2 === 0,
            };
            if ($inv) $m[$y][$x] = !$m[$y][$x];
        }
        return $m;
    };
    $best = null;
    $bestScore = PHP_INT_MAX;
    for ($mask = 0; $mask < 8; $mask++) {
        $format($mask);
        $mm = $masked($mask);
        // $format escribe en $m; se copian también los bits de formato de esta máscara
        foreach ($fn as $y => $row) foreach ($row as $x => $isFn) if ($isFn) $mm[$y][$x] = $m[$y][$x];
        $s = qr_penalty($mm);
        if ($s < $bestScore) { $bestScore = $s; $best = $mm; }
    }
    return $best;
}

/** Puntuación de la norma: cuanto más baja, más fácil de leer para la cámara. */
function qr_penalty(array $m): int
{
    $size = count($m);
    $p = 0;
    $lines = [];
    for ($i = 0; $i < $size; $i++) {
        $row = '';
        $col = '';
        for ($j = 0; $j < $size; $j++) { $row .= $m[$i][$j] ? '1' : '0'; $col .= $m[$j][$i] ? '1' : '0'; }
        $lines[] = $row;
        $lines[] = $col;
    }
    foreach ($lines as $l) {
        // Tiras de 5 o más módulos del mismo color
        if (preg_match_all('/0{5,}|1{5,}/', $l, $mm)) foreach ($mm[0] as $run) $p += 3 + strlen($run) - 5;
        // Algo parecido a los cuadros de las esquinas
        $p += 40 * (substr_count('0000' . $l, '00001011101') + substr_count($l . '0000', '10111010000'));
    }
    $dark = 0;
    for ($y = 0; $y < $size; $y++) for ($x = 0; $x < $size; $x++) {
        if ($m[$y][$x]) $dark++;
        if ($y < $size - 1 && $x < $size - 1) {
            $c = $m[$y][$x];
            if ($c === $m[$y][$x + 1] && $c === $m[$y + 1][$x] && $c === $m[$y + 1][$x + 1]) $p += 3;
        }
    }
    $total = $size * $size;
    $p += 10 * max(0, (int)ceil(abs($dark * 20 - $total * 10) / $total) - 1);
    return $p;
}

/** El QR en SVG (con su margen blanco de 4 módulos). */
function qr_svg(string $text, string $label = ''): string
{
    $m = qr_matrix($text);
    $size = count($m);
    $b = 4;
    $d = '';
    foreach ($m as $y => $row) {
        for ($x = 0; $x < $size; $x++) {
            if (!$row[$x]) continue;
            $run = 1;
            while ($x + $run < $size && $row[$x + $run]) $run++;
            $d .= 'M' . ($x + $b) . ' ' . ($y + $b) . 'h' . $run . 'v1h-' . $run . 'z';
            $x += $run - 1;
        }
    }
    $full = $size + 2 * $b;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' . $full . ' ' . $full . '" shape-rendering="crispEdges" role="img" aria-label="'
        . htmlspecialchars($label !== '' ? $label : 'Código QR', ENT_QUOTES, 'UTF-8') . '">'
        . '<rect width="' . $full . '" height="' . $full . '" fill="#fff"/><path fill="#000" d="' . $d . '"/></svg>';
}
