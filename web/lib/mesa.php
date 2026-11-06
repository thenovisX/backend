<?php
declare(strict_types=1);

/*
 * Pedidos desde el móvil con el QR de la mesa (web/mesa/). Lo pedido llega al pedido de la mesa en
 * «Sala y cocina» y de ahí a la pantalla de cocina (o barra), igual que si lo apuntara el camarero.
 *
 * Para que nadie pida desde casa con una foto del QR:
 *  - El QR de cada mesa lleva una clave secreta aleatoria (no se puede adivinar la de otra mesa) y el
 *    encargado puede cambiarla cuando quiera (los QR viejos dejan de valer).
 *  - Solo se puede pedir con la mesa ABIERTA por un camarero (cuando se sientan los clientes).
 *  - Hace falta el CÓDIGO de 4 cifras de esa mesa, que es nuevo cada vez que se abre y solo lo ve el
 *    camarero (se lo dice a los clientes o les enseña su QR, que ya lo lleva dentro).
 *  - Al cerrar la mesa, se cierran todas las sesiones de los móviles; y como mucho duran 5 horas.
 *  - Opcional: solo desde el wifi del local (lista de IP) y que el camarero acepte cada pedido.
 *  - Límites: intentos de código, envíos por móvil, platos por envío, y solo platos de la carta con
 *    los precios del servidor.
 */

class MesaAuthError extends RuntimeException {}

const MESA_SESSION_MAX = 5 * 3600;   // una sesión de móvil dura como mucho 5 horas…
const MESA_SESSION_IDLE = 2 * 3600;  // …o 2 horas sin usarla
const MESA_GUESTS_MAX = 30;          // móviles conectados a la vez a un mismo pedido
const MESA_SENDS_MAX = 6;            // envíos por móvil cada 10 minutos
const MESA_LINES_MAX = 25;           // líneas por envío
const MESA_UNITS_MAX = 30;           // platos (contando cantidades) por envío
const MESA_QTY_MAX = 10;             // de un mismo plato por envío
const MESA_PIN_TRIES = 12;           // códigos fallados por mesa cada 15 minutos (luego el camarero lo cambia)

/* ---------- Claves de los QR de las mesas ---------- */

function mesa_new_pin(): string
{
    return str_pad((string)random_int(0, 9999), 4, '0', STR_PAD_LEFT);
}

function mesa_new_key(): string
{
    return rtrim(strtr(base64_encode(random_bytes(16)), '+/', '-_'), '=');
}

/** Claves de todas las mesas (se crean las que falten). Se guardan cifradas. */
function mesa_keys(): array
{
    $keys = sala_kv_get('qr_keys', []);
    $keys = is_array($keys) ? $keys : [];
    $changed = false;
    foreach (sala_layout()['tables'] as $t) {
        if ($t['kind'] === 'mesa' && empty($keys[$t['id']])) { $keys[$t['id']] = mesa_new_key(); $changed = true; }
    }
    if ($changed) sala_kv_set('qr_keys', $keys);
    return $keys;
}

/** Cambia la clave del QR de una mesa (o de todas): los QR impresos antes dejan de valer. */
function mesa_rotate(?string $tid): void
{
    $keys = mesa_keys();
    foreach ($keys as $id => $k) if ($tid === null || $id === $tid) $keys[$id] = mesa_new_key();
    sala_kv_set('qr_keys', $keys);
}

function mesa_url(string $tid, string $key, string $pin = ''): string
{
    return base_url() . '/mesa/#k=' . $tid . '.' . $key . ($pin !== '' ? '&p=' . $pin : '');
}

/** QR de todas las mesas para imprimirlos (encargado). */
function mesa_qr_list(): array
{
    require_once __DIR__ . '/qr.php';
    $keys = mesa_keys();
    $l = sala_layout();
    $floors = array_column($l['floors'], 'name', 'id');
    $out = [];
    foreach ($l['tables'] as $t) {
        if ($t['kind'] !== 'mesa') continue;
        $url = mesa_url($t['id'], $keys[$t['id']]);
        $out[] = ['id' => $t['id'], 'name' => $t['name'], 'floor' => $floors[$t['floor']] ?? '', 'url' => $url, 'svg' => qr_svg($url, 'QR de la mesa ' . $t['name'])];
    }
    return $out;
}

/** QR de un pedido abierto con el código ya dentro: el camarero lo enseña en su móvil y los clientes entran sin teclear. */
function mesa_order_qr(int $orderId): array
{
    require_once __DIR__ . '/qr.php';
    $o = sala_order_get($orderId);
    if ($o['status'] !== 'abierta') throw new ValidationError('Este pedido ya está cerrado');
    $tid = $o['tables'][0] ?? '';
    $keys = mesa_keys();
    if (!isset($keys[$tid])) throw new ValidationError('La mesa ya no existe en el plano');
    $url = mesa_url($tid, $keys[$tid], $o['pin']);
    $n = (int)q('SELECT COUNT(*) FROM sala_guests WHERE order_id = ?', [$orderId])->fetchColumn();
    return ['pin' => $o['pin'], 'qr' => $o['qr'], 'url' => $url, 'svg' => qr_svg($url, 'QR para pedir desde el móvil'), 'phones' => $n,
        'enabled' => (bool)sala_prefs()['qr'], 'need_pin' => (bool)sala_prefs()['qr_pin'], 'locked' => mesa_pin_locked($o)];
}

/** Contador de códigos fallados de un pedido: va con el código actual, así que cambiar el código lo pone a cero. */
function mesa_pin_bucket(array $o): string
{
    return 'mesa-pin-order|' . $o['id'] . '|' . hash('sha256', $o['pin']);
}

/** ¿Se ha bloqueado el código de la mesa por demasiados intentos fallidos? (lo ve el camarero) */
function mesa_pin_locked(array $o): bool
{
    $key = hash('sha256', mesa_pin_bucket($o) . '|' . (cfg()['secret'] ?? ''));
    return (int)q('SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND at > ?', [$key, date('Y-m-d H:i:s', time() - 900)])->fetchColumn() >= MESA_PIN_TRIES;
}

/** Cierra las sesiones de los móviles de un pedido (al cerrar la mesa o cambiar el código). */
function mesa_kick(int $orderId): void
{
    q('DELETE FROM sala_guests WHERE order_id = ?', [$orderId]);
}

/* ---------- IP del local (opcional) ---------- */

function ip_rule_valid(string $rule): bool
{
    $p = explode('/', $rule, 2);
    $bin = @inet_pton($p[0]);
    if ($bin === false) return false;
    if (!isset($p[1])) return true;
    return ctype_digit($p[1]) && (int)$p[1] >= 8 && (int)$p[1] <= strlen($bin) * 8;
}

function ip_matches(string $ip, string $rule): bool
{
    $p = explode('/', $rule, 2);
    $a = @inet_pton($ip);
    $b = @inet_pton($p[0]);
    if ($a === false || $b === false || strlen($a) !== strlen($b)) return false;
    $bits = isset($p[1]) ? (int)$p[1] : strlen($a) * 8;
    $bytes = intdiv($bits, 8);
    if (substr($a, 0, $bytes) !== substr($b, 0, $bytes)) return false;
    $rem = $bits % 8;
    if ($rem === 0) return true;
    $mask = (0xFF << (8 - $rem)) & 0xFF;
    return (ord($a[$bytes]) & $mask) === (ord($b[$bytes]) & $mask);
}

/** IP real del cliente (sin cifrar), solo para comparar con la lista del local. */
function mesa_remote_ip(): string
{
    return (string)($_SERVER['REMOTE_ADDR'] ?? '');
}

/** ¿La petición viene de una de las redes del local que ha puesto el encargado? (false si no ha puesto ninguna) */
function mesa_on_local_wifi(): bool
{
    $ips = sala_prefs()['qr_ips'];
    return $ips && mesa_ip_ok(['qr_ips' => $ips]);
}

function mesa_ip_ok(array $prefs): bool
{
    if (!$prefs['qr_ips']) return true;
    $ip = mesa_remote_ip();
    foreach ($prefs['qr_ips'] as $rule) if (ip_matches($ip, (string)$rule)) return true;
    return false;
}

/* ---------- Entrada del cliente ---------- */

/** La mesa de un QR («t3.clave»). Si la clave no vale, cuenta como intento fallido. */
function mesa_table(string $k): array
{
    // Las claves tienen 128 bits (no se pueden adivinar): este límite solo frena a quien las prueba en bucle. No se
    // aplica desde el wifi del local, donde todos los móviles comparten IP y un gracioso dejaría a todos sin pedir.
    $bad = mesa_on_local_wifi() ? null : throttle_check('mesa-key|' . client_ip(), 30, 900, 'Demasiados códigos QR no válidos. Espera 15 minutos.');
    if (preg_match('/^([td][a-z0-9]{1,16})\.([A-Za-z0-9_-]{22})$/', $k, $m)) {
        $keys = sala_kv_get('qr_keys', []);
        if (is_array($keys) && isset($keys[$m[1]]) && hash_equals((string)$keys[$m[1]], $m[2])) {
            foreach (sala_layout()['tables'] as $t) if ($t['id'] === $m[1] && $t['kind'] === 'mesa') return $t;
        }
    }
    if ($bad !== null) throttle_hit($bad);
    throw new ValidationError('Este código QR no vale o se ha cambiado. Pide ayuda al camarero.');
}

/** Pedido abierto en el que está esa mesa (sola o junto con otras). */
function mesa_order_for(string $tid): ?array
{
    foreach (q("SELECT * FROM sala_orders WHERE status = 'abierta' ORDER BY id")->fetchAll() as $r) {
        $o = sala_order_row($r);
        if (in_array($tid, $o['tables'], true)) return $o;
    }
    return null;
}

function mesa_tables_label(array $ids): string
{
    $names = array_column(sala_layout()['tables'], 'name', 'id');
    return implode(' + ', array_map(fn($t) => $names[$t] ?? '?', $ids));
}

/** Lo primero que pide el móvil al escanear: de qué mesa es y si se puede pedir. */
function mesa_info(array $in): array
{
    $t = mesa_table((string)($in['k'] ?? ''));
    $prefs = sala_prefs();
    $o = mesa_order_for($t['id']);
    $state = 'open';
    if (!$prefs['qr']) $state = 'off';
    elseif (!mesa_ip_ok($prefs)) $state = 'wifi';
    elseif (!$o) $state = 'closed';
    elseif (!$o['qr']) $state = 'off';
    return ['restaurant' => (string)settings()['name'], 'table' => $o ? mesa_tables_label($o['tables']) : $t['name'], 'state' => $state, 'need_pin' => (bool)$prefs['qr_pin']];
}

/** Entrar en la mesa con el código del camarero. Devuelve la sesión del móvil. */
function mesa_join(array $in): array
{
    $t = mesa_table((string)($in['k'] ?? ''));
    $prefs = sala_prefs();
    if (!$prefs['qr']) throw new ValidationError('Ahora mismo no se puede pedir desde el móvil. Pide al camarero.');
    if (!mesa_ip_ok($prefs)) throw new ValidationError('Para pedir desde el móvil conéctate al wifi del restaurante.');
    $o = mesa_order_for($t['id']);
    if (!$o) throw new ValidationError('La mesa aún no está abierta. Pide al camarero que la abra.');
    if (!$o['qr']) throw new ValidationError('En esta mesa se pide al camarero.');
    if ($prefs['qr_pin']) {
        $msg = 'Demasiados códigos incorrectos. Espera 15 minutos o pide al camarero que cambie el código de la mesa.';
        // El intento se apunta ANTES de comprobar el código: así, mandando muchos a la vez no se prueban más de la cuenta.
        // El límite de la mesa va con su código actual: si alguien lo bloquea a propósito, el camarero pulsa «Cambiar
        // código» y la mesa vuelve a funcionar. El de la IP no cuenta en el wifi del local (todos comparten IP).
        $taken = [];
        if (!mesa_on_local_wifi()) $taken[] = throttle_take('mesa-pin-ip|' . client_ip(), 40, 900, $msg);
        $taken[] = throttle_take(mesa_pin_bucket($o), MESA_PIN_TRIES, 900, $msg);
        $pin = preg_replace('/\D/', '', (string)($in['pin'] ?? '')) ?? '';
        if ($o['pin'] === '' || !hash_equals($o['pin'], $pin)) {
            throw new ValidationError('Ese código no es el de esta mesa. Te lo da el camarero.');
        }
        foreach ($taken as $tk) throttle_undo($tk); // los aciertos no cuentan
    }
    if ((int)q('SELECT COUNT(*) FROM sala_guests WHERE order_id = ?', [$o['id']])->fetchColumn() >= MESA_GUESTS_MAX) {
        throw new ValidationError('Hay demasiados móviles conectados a esta mesa. Pide al camarero.');
    }
    $token = bin2hex(random_bytes(32));
    q('INSERT INTO sala_guests (token, order_id, table_id, created_at, last_used) VALUES (?, ?, ?, ?, ?)', [hash('sha256', $token), $o['id'], $t['id'], now(), now()]);
    sala_bump();
    return ['token' => $token, 'restaurant' => (string)settings()['name'], 'table' => mesa_tables_label($o['tables'])];
}

/** Sesión del móvil a partir de su token (cabecera X-Mesa). Lanza MesaAuthError si ya no vale. */
function mesa_session(string $token): array
{
    $gone = 'La mesa se ha cerrado o tu sesión ha caducado. Vuelve a escanear el QR de la mesa.';
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) throw new MesaAuthError($gone);
    $hash = hash('sha256', $token);
    $g = q('SELECT g.table_id, g.created_at AS g_created, g.last_used, o.* FROM sala_guests g JOIN sala_orders o ON o.id = g.order_id WHERE g.token = ?', [$hash])->fetch();
    if (!$g || $g['status'] !== 'abierta' || strtotime($g['g_created']) < time() - MESA_SESSION_MAX || strtotime($g['last_used']) < time() - MESA_SESSION_IDLE) {
        q('DELETE FROM sala_guests WHERE token = ?', [$hash]);
        throw new MesaAuthError($gone);
    }
    $o = sala_order_row($g);
    $prefs = sala_prefs();
    if (!$prefs['qr'] || !$o['qr']) throw new MesaAuthError('El restaurante ha desactivado los pedidos desde el móvil en esta mesa. Pide al camarero.');
    if (!mesa_ip_ok($prefs)) throw new MesaAuthError('Para pedir desde el móvil conéctate al wifi del restaurante.');
    if (strtotime($g['last_used']) < time() - 60) q('UPDATE sala_guests SET last_used = ? WHERE token = ?', [now(), $hash]);
    return ['hash' => $hash, 'order' => $o, 'prefs' => $prefs];
}

/* ---------- Pedir ---------- */

/** Carta para el móvil: lo mismo que ve el camarero, sin datos internos. */
function mesa_carta(): array
{
    $c = sala_carta();
    $base = base_url() . '/';
    foreach ($c['categories'] as &$cat) {
        unset($cat['barra'], $cat['position']);
        $cat['dishes'] = array_map(function ($d) use ($base) {
            $photo = $d['photo'] ?? '';
            return ['id' => $d['id'], 'name' => $d['name'], 'description' => $d['description'], 'price' => $d['price'], 'allergens' => $d['allergens'],
                // Solo fotos subidas a esta web (la página del móvil no carga nada de fuera)
                'photo' => str_starts_with($photo, $base) ? $photo : ''];
        }, $cat['dishes']);
    }
    unset($cat);
    $c['specials'] = array_map(fn($s) => ['name' => $s['name'], 'price' => $s['price'], 'course' => $s['course'], 'desc' => $s['desc'] ?? ''], $c['specials']);
    return $c;
}

/** Lo que lleva pedido la mesa (lo ve cualquiera de los móviles de la mesa). */
function mesa_status(array $s, string $since = ''): array
{
    $rev = sala_rev();
    if ($since !== '' && hash_equals($rev, $since)) return ['rev' => $rev, 'same' => true];
    $o = sala_order_get($s['order']['id']);
    $items = array_map(fn($i) => ['id' => $i['id'], 'name' => $i['name'], 'sub' => $i['sub'], 'qty' => $i['qty'], 'price' => $i['price'],
        'status' => $i['status'], 'course' => $i['course'], 'note' => $i['note'], 'qr' => $i['qr'], 'at' => substr($i['sent_at'], 11, 5)],
        array_values(array_filter($o['items'], fn($i) => $i['status'] !== 'anulado')));
    return ['rev' => $rev, 'table' => mesa_tables_label($o['tables']), 'items' => $items, 'total' => sala_order_total($o),
        'call' => $o['call'] ? $o['call']['type'] : '', 'confirm' => (bool)$s['prefs']['qr_confirm']];
}

function mesa_send(array $s, array $in): array
{
    $msg = 'Has enviado muchos pedidos seguidos. Espera unos minutos o pide al camarero.';
    $byPhone = throttle_check('mesa-send|' . $s['hash'], MESA_SENDS_MAX, 600, $msg);
    $byOrder = throttle_check('mesa-send-order|' . $s['order']['id'], MESA_SENDS_MAX * 3, 600, $msg);
    // En el bloqueo: si el camarero cierra la mesa justo a la vez, lo pedido no se cuela en un pedido ya cerrado
    reservation_lock();
    try {
        sala_order_add(['dname' => 'Móvil (QR)', 'role' => 'qr'], ['id' => $s['order']['id'], 'items' => (array)($in['items'] ?? [])], true);
        db()->commit();
    } catch (Throwable $e) {
        if (db()->inTransaction()) db()->rollBack();
        throw $e;
    }
    throttle_hit($byPhone);
    throttle_hit($byOrder);
    return mesa_status($s);
}

/** Llamar al camarero o pedir la cuenta: sale en la sala, en la mesa. */
function mesa_call(array $s, string $type): array
{
    if (!in_array($type, ['camarero', 'cuenta'], true)) throw new ValidationError('Aviso no válido');
    $hit = throttle_check('mesa-call|' . $s['hash'], 5, 600, 'Ya hemos avisado al camarero. Enseguida viene.');
    sala_order_mutate($s['order']['id'], function (array $o) use ($type) {
        if ($o['status'] !== 'abierta') throw new MesaAuthError('La mesa se ha cerrado. Si necesitas algo, pide al camarero.');
        $o['call'] = ['type' => $type, 'at' => now()];
        return $o;
    });
    throttle_hit($hit);
    return mesa_status($s);
}
