<?php
declare(strict_types=1);

/*
 * Sala y cocina: un programa aparte del panel para el servicio.
 *  - Plano por plantas: la forma de cada sala, las mesas (tamaño, forma, plazas) y mesas fusionadas.
 *  - Pedidos por mesa: platos de la carta, menús, especiales y notas para la cocina.
 *  - Pantalla de cocina: las comandas nuevas, en orden de llegada, que se van marcando.
 *  - Asignación automática de mesas a las reservas (juntando mesas si hace falta), según las
 *    preferencias del restaurante.
 * Tiene sus propias cuentas (se crean desde el panel, Ajustes → Cuenta) y su propia API (sala/api.php):
 * una cuenta de la sala no puede entrar en el panel ni al revés.
 * Todo el contenido (plano, pedidos, notas, asignaciones y nombres) se guarda cifrado con enc().
 */

const SALA_ROLES = [
    'encargado' => 'Encargado: sala, pedidos, cocina, plano y preferencias',
    'camarero'  => 'Camarero: sala y pedidos',
    'cocina'    => 'Cocina: solo la pantalla de cocina',
];
const SALA_COURSES = [0 => 'Bebidas', 1 => 'Entrantes', 2 => 'Principales', 3 => 'Postres'];
// «pendiente»: pedido desde el móvil de la mesa (QR) que el camarero aún no ha aceptado (si se pide confirmar)
const SALA_ITEM_ST = ['pendiente', 'espera', 'nuevo', 'preparando', 'listo', 'servido', 'anulado'];
const SALA_PREFS_DEFAULT = [
    'assign'     => 'crear',  // off | crear (al entrar la reserva) | confirmar (cuando se acepta o confirma)
    'merge'      => true,     // juntar mesas si no hay ninguna que sirva sola
    'max_merge'  => 3,        // como mucho cuántas mesas se juntan
    'merge_loss' => 0,        // plazas que se pierden en cada unión (p. ej. 2 si se juntan por la cabecera)
    'max_spare'  => 2,        // sitios vacíos que se aceptan antes de probar a juntar mesas más pequeñas
    'minutes'    => 0,        // cuánto dura una mesa (0 = el «tiempo de mesa» de las reservas, o 90 min)
    'gap'        => 40,       // distancia máxima entre dos mesas para que cuenten como juntas (en el plano)
    'floors'     => [],       // plantas donde se asigna solo, por orden de preferencia (vacío = todas)
    'no_kitchen' => [],       // categorías de la carta que van a la barra y no a la cocina
    'specials'   => [],       // especiales del día: [{name, price, course}]
    // Pedidos desde el móvil con el QR de la mesa (lib/mesa.php)
    'qr'         => true,     // se puede pedir desde el móvil
    'qr_pin'     => true,     // hace falta el código de 4 cifras que da el camarero al abrir la mesa
    'qr_confirm' => false,    // el camarero acepta cada pedido antes de que llegue a la cocina
    'qr_ips'     => [],       // solo desde estas IP o redes (el wifi del local); vacío = desde cualquier conexión
];

/* ---------- Almacén (sala_kv): plano y preferencias, cifrados ---------- */

function sala_kv_get(string $k, $def = null)
{
    $v = q('SELECT v FROM sala_kv WHERE k = ?', [$k])->fetchColumn();
    if ($v === false) return $def;
    $j = json_decode(dec((string)$v), true);
    return $j === null ? $def : $j;
}

function sala_kv_set(string $k, $v, bool $plain = false): void
{
    $txt = json_encode($v, JSON_UNESCAPED_UNICODE);
    if (!$plain) $txt = enc($txt);
    if (q('UPDATE sala_kv SET v = ? WHERE k = ?', [$txt, $k])->rowCount() === 0) {
        try { q('INSERT INTO sala_kv (k, v) VALUES (?, ?)', [$k, $txt]); }
        catch (Throwable $e) { q('UPDATE sala_kv SET v = ? WHERE k = ?', [$txt, $k]); }
    }
}

/** Marca que algo ha cambiado: las pantallas abiertas lo ven en su próxima consulta. */
function sala_bump(): void
{
    static $last = '';
    $v = (string)(int)(microtime(true) * 1000);
    if ($v === $last) $v .= mt_rand(1, 9);
    $last = $v;
    sala_kv_set('rev', $v, true);
}

function sala_rev(): string
{
    return (string)(q("SELECT v FROM sala_kv WHERE k = 'rev'")->fetchColumn() ?: '0');
}

/* ---------- Cuentas de la sala (se crean desde el panel) ---------- */

function sala_user_out(array $u): array
{
    return ['id' => (int)$u['id'], 'username' => $u['username'], 'name' => dec($u['name']), 'role' => $u['role'],
        'active' => (bool)$u['active'], 'created_at' => $u['created_at']];
}

function sala_users_list(): array
{
    return array_map('sala_user_out', q('SELECT * FROM sala_users ORDER BY username')->fetchAll());
}

function sala_user_save(array $me, array $in): array
{
    $id = (int)($in['id'] ?? 0);
    $username = mb_strtolower(trim((string)($in['username'] ?? '')));
    if (!preg_match('/^[a-z0-9._-]{3,40}$/', $username)) throw new ValidationError('El usuario tiene que tener de 3 a 40 letras sin espacios (puede llevar números, puntos y guiones)');
    $name = mb_substr(trim((string)($in['name'] ?? '')), 0, 60);
    $role = array_key_exists((string)($in['role'] ?? ''), SALA_ROLES) ? (string)$in['role'] : 'camarero';
    $active = filter_var($in['active'] ?? true, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    $pass = (string)($in['password'] ?? '');
    if ($pass !== '' && strlen($pass) < 8) throw new ValidationError('La contraseña necesita al menos 8 caracteres');
    if (q('SELECT id FROM sala_users WHERE username = ? AND id <> ?', [$username, $id])->fetch()) throw new ValidationError('Ya hay una cuenta de sala con ese nombre');
    if ($id) {
        if (!q('SELECT id FROM sala_users WHERE id = ?', [$id])->fetch()) throw new ValidationError('La cuenta no existe');
        q('UPDATE sala_users SET username = ?, name = ?, role = ?, active = ? WHERE id = ?', [$username, enc($name), $role, $active, $id]);
        if ($pass !== '') q('UPDATE sala_users SET pass_hash = ? WHERE id = ?', [pass_hash($pass), $id]);
        if (!$active || $pass !== '') q('DELETE FROM sala_tokens WHERE user_id = ?', [$id]);
        audit('sala_cuenta_editada', 0, "Cuenta de sala «{$username}» editada por {$me['username']}");
    } else {
        if ($pass === '') throw new ValidationError('Pon una contraseña para la cuenta nueva');
        q('INSERT INTO sala_users (username, name, pass_hash, role, active, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [$username, enc($name), pass_hash($pass), $role, $active, now()]);
        $id = (int)db()->lastInsertId();
        audit('sala_cuenta_creada', 0, "Cuenta de sala «{$username}» creada por {$me['username']}");
    }
    return sala_user_out(q('SELECT * FROM sala_users WHERE id = ?', [$id])->fetch());
}

function sala_user_delete(array $me, int $id): void
{
    $u = q('SELECT * FROM sala_users WHERE id = ?', [$id])->fetch();
    if (!$u) return;
    q('DELETE FROM sala_tokens WHERE user_id = ?', [$id]);
    q('DELETE FROM sala_users WHERE id = ?', [$id]);
    audit('sala_cuenta_borrada', 0, "Cuenta de sala «{$u['username']}» borrada por {$me['username']}");
}

function sala_login(array $in): array
{
    $user = mb_strtolower(str_in($in, 'username', 60, true, 'usuario'));
    $pass = (string)($in['password'] ?? '');
    $byIp = throttle_check('sala-ip|' . client_ip(), 10, 900);
    $byUser = throttle_check('sala-user|' . $user, 20, 900);
    $u = q('SELECT * FROM sala_users WHERE username = ?', [$user])->fetch();
    if (!pass_verify($pass, $u ? $u['pass_hash'] : null)) {
        throttle_hit($byIp);
        throttle_hit($byUser);
        throw new ValidationError('Usuario o contraseña incorrectos');
    }
    if (!(int)$u['active']) throw new ValidationError('Esta cuenta está desactivada. Habla con el encargado.');
    throttle_clear($byIp);
    throttle_clear($byUser);
    if (pass_needs_rehash($u['pass_hash'])) q('UPDATE sala_users SET pass_hash = ? WHERE id = ?', [pass_hash($pass), $u['id']]);
    q('DELETE FROM sala_tokens WHERE last_used < ? OR created_at < ?', [date('Y-m-d H:i:s', time() - TOKEN_DAYS * 86400), date('Y-m-d H:i:s', time() - TOKEN_MAX_DAYS * 86400)]);
    $token = bin2hex(random_bytes(32));
    q('INSERT INTO sala_tokens (token, user_id, created_at, last_used) VALUES (?, ?, ?, ?)', [hash('sha256', $token), $u['id'], now(), now()]);
    sala_purge();
    return ['token' => $token, 'me' => sala_user_out($u), 'restaurant' => settings()['name']];
}

function sala_auth(): array
{
    $t = request_token();
    if ($t === '') fail('Inicia sesión', 401);
    $hash = hash('sha256', $t);
    $u = q('SELECT u.*, t.last_used, t.created_at AS token_created FROM sala_tokens t JOIN sala_users u ON u.id = t.user_id WHERE t.token = ?', [$hash])->fetch();
    if (!$u || strtotime($u['last_used']) < time() - TOKEN_DAYS * 86400 || strtotime($u['token_created']) < time() - TOKEN_MAX_DAYS * 86400) {
        if ($u) q('DELETE FROM sala_tokens WHERE token = ?', [$hash]);
        fail('La sesión ha caducado. Vuelve a entrar.', 401);
    }
    if (!(int)$u['active']) fail('Esta cuenta está desactivada. Habla con el encargado.', 401);
    unset($u['pass_hash']);
    if (strtotime($u['last_used']) < time() - 300) q('UPDATE sala_tokens SET last_used = ? WHERE token = ?', [now(), $hash]);
    $u['dname'] = dec($u['name']) ?: $u['username'];
    return $u;
}

function sala_logout(): void
{
    $t = request_token();
    if ($t) q('DELETE FROM sala_tokens WHERE token = ?', [hash('sha256', $t)]);
}

function sala_require(array $u, string ...$roles): void
{
    if (!in_array($u['role'], $roles, true)) fail('Tu cuenta no puede hacer esto. Pídeselo al encargado.', 403);
}

/* ---------- Plano: plantas, mesas y mesas fusionadas ---------- */

function sala_layout_default(): array
{
    $t = fn(string $id, string $n, int $x, int $y, string $sh, int $seats, int $w = 90, int $h = 90) =>
        ['id' => $id, 'floor' => 'f1', 'kind' => 'mesa', 'name' => $n, 'shape' => $sh, 'x' => $x, 'y' => $y, 'w' => $w, 'h' => $h, 'seats' => $seats, 'auto' => true, 'join' => true];
    return [
        'rev' => 1,
        'floors' => [['id' => 'f1', 'name' => 'Sala', 'level' => 0, 'w' => 1000, 'h' => 700,
            'shape' => [[0, 0], [1000, 0], [1000, 700], [0, 700]]]],
        'tables' => [
            $t('t1', '1', 80, 80, 'rect', 2, 80, 80), $t('t2', '2', 200, 80, 'rect', 2, 80, 80), $t('t3', '3', 320, 80, 'rect', 4, 120, 80),
            $t('t4', '4', 80, 260, 'rect', 4), $t('t5', '5', 200, 260, 'rect', 4), $t('t6', '6', 420, 280, 'round', 6, 130, 130),
            ['id' => 'd1', 'floor' => 'f1', 'kind' => 'deco', 'name' => 'Barra', 'shape' => 'rect', 'x' => 700, 'y' => 80, 'w' => 220, 'h' => 60, 'seats' => 0, 'auto' => false, 'join' => false],
        ],
        'groups' => [],
    ];
}

function sala_layout(): array
{
    $l = sala_kv_get('layout');
    return is_array($l) && !empty($l['floors']) ? $l : sala_layout_default();
}

function sala_layout_clean(array $in): array
{
    $int = fn($v, int $min, int $max) => max($min, min($max, (int)round((float)$v)));
    $id = fn($v, string $p) => preg_match('/^' . $p . '[a-z0-9]{1,16}$/', (string)$v) ? (string)$v : '';
    $floors = [];
    foreach (array_slice((array)($in['floors'] ?? []), 0, 12) as $f) {
        $fid = $id($f['id'] ?? '', 'f');
        if ($fid === '' || isset($floors[$fid])) continue;
        $w = $int($f['w'] ?? 1000, 300, 4000);
        $h = $int($f['h'] ?? 700, 300, 4000);
        $pts = [];
        foreach (array_slice((array)($f['shape'] ?? []), 0, 40) as $p) {
            if (is_array($p) && count($p) >= 2) $pts[] = [$int($p[0], 0, $w), $int($p[1], 0, $h)];
        }
        if (count($pts) < 3) $pts = [[0, 0], [$w, 0], [$w, $h], [0, $h]];
        $floors[$fid] = ['id' => $fid, 'name' => mb_substr(trim((string)($f['name'] ?? '')), 0, 40) ?: 'Planta',
            'level' => $int($f['level'] ?? 0, -5, 30), 'w' => $w, 'h' => $h, 'shape' => $pts];
    }
    if (!$floors) throw new ValidationError('Tiene que haber al menos una planta');
    $tables = [];
    foreach (array_slice((array)($in['tables'] ?? []), 0, 400) as $t) {
        $tid = $id($t['id'] ?? '', '[td]');
        $fid = (string)($t['floor'] ?? '');
        if ($tid === '' || isset($tables[$tid]) || !isset($floors[$fid])) continue;
        $deco = ($t['kind'] ?? '') === 'deco';
        $tables[$tid] = [
            'id' => $tid, 'floor' => $fid, 'kind' => $deco ? 'deco' : 'mesa',
            'name' => mb_substr(trim((string)($t['name'] ?? '')), 0, 24) ?: ($deco ? 'Elemento' : 'Mesa'),
            'shape' => ($t['shape'] ?? '') === 'round' ? 'round' : 'rect',
            'x' => $int($t['x'] ?? 0, 0, $floors[$fid]['w']), 'y' => $int($t['y'] ?? 0, 0, $floors[$fid]['h']),
            'w' => $int($t['w'] ?? 80, 20, 1500), 'h' => $int($t['h'] ?? 80, 20, 1500),
            'seats' => $deco ? 0 : $int($t['seats'] ?? 2, 1, 60),
            'auto' => !$deco && filter_var($t['auto'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'join' => !$deco && filter_var($t['join'] ?? true, FILTER_VALIDATE_BOOLEAN),
        ];
    }
    $groups = [];
    $used = [];
    foreach (array_slice((array)($in['groups'] ?? []), 0, 100) as $g) {
        $gid = $id($g['id'] ?? '', 'g');
        if ($gid === '' || isset($groups[$gid])) continue;
        $ids = [];
        foreach ((array)($g['tables'] ?? []) as $tid) {
            $tid = (string)$tid;
            if (isset($tables[$tid]) && $tables[$tid]['kind'] === 'mesa' && !isset($used[$tid]) && !in_array($tid, $ids, true)) $ids[] = $tid;
        }
        if (count($ids) < 2) continue;
        $floor = $tables[$ids[0]]['floor'];
        if (array_filter($ids, fn($x) => $tables[$x]['floor'] !== $floor)) throw new ValidationError('Solo se pueden fusionar mesas de la misma planta');
        foreach ($ids as $x) $used[$x] = true;
        $groups[$gid] = ['id' => $gid, 'name' => mb_substr(trim((string)($g['name'] ?? '')), 0, 40),
            'tables' => $ids, 'seats' => $int($g['seats'] ?? 0, 0, 300), 'auto' => filter_var($g['auto'] ?? true, FILTER_VALIDATE_BOOLEAN)];
    }
    return ['floors' => array_values($floors), 'tables' => array_values($tables), 'groups' => array_values($groups)];
}

function sala_layout_save(array $in): array
{
    $cur = sala_layout();
    if ((int)($in['rev'] ?? 0) !== (int)($cur['rev'] ?? 1)) {
        throw new ValidationError('Otra persona ha cambiado el plano mientras lo editabas. Recarga para ver sus cambios.');
    }
    $l = sala_layout_clean($in) + ['rev' => (int)($cur['rev'] ?? 1) + 1];
    $l['rev'] = (int)($cur['rev'] ?? 1) + 1;
    sala_kv_set('layout', $l);
    sala_bump();
    return $l;
}

/** Plazas de una fusión: las que se hayan puesto o la suma de las mesas menos lo que se pierde en las uniones. */
function sala_group_seats(array $g, array $byId, array $prefs): int
{
    if ((int)($g['seats'] ?? 0) > 0) return (int)$g['seats'];
    $sum = array_sum(array_map(fn($t) => (int)($byId[$t]['seats'] ?? 0), $g['tables']));
    return max(1, $sum - (int)$prefs['merge_loss'] * (count($g['tables']) - 1));
}

/* ---------- Preferencias del restaurante ---------- */

function sala_prefs(): array
{
    $p = sala_kv_get('prefs', []);
    return array_merge(SALA_PREFS_DEFAULT, is_array($p) ? array_intersect_key($p, SALA_PREFS_DEFAULT) : []);
}

function sala_prefs_save(array $in): array
{
    $p = sala_prefs();
    $int = fn($v, int $min, int $max) => max($min, min($max, (int)$v));
    if (isset($in['assign'])) $p['assign'] = in_array($in['assign'], ['off', 'crear', 'confirmar'], true) ? $in['assign'] : 'crear';
    if (isset($in['merge'])) $p['merge'] = filter_var($in['merge'], FILTER_VALIDATE_BOOLEAN);
    foreach (['max_merge' => [2, 6], 'merge_loss' => [0, 4], 'max_spare' => [0, 20], 'minutes' => [0, 600], 'gap' => [0, 300]] as $k => [$a, $b]) {
        if (isset($in[$k])) $p[$k] = $int($in[$k], $a, $b);
    }
    if (isset($in['floors'])) $p['floors'] = array_values(array_filter(array_map('strval', (array)$in['floors']), fn($x) => preg_match('/^f[a-z0-9]{1,16}$/', $x)));
    if (isset($in['no_kitchen'])) $p['no_kitchen'] = array_values(array_unique(array_map('intval', (array)$in['no_kitchen'])));
    foreach (['qr', 'qr_pin', 'qr_confirm'] as $k) {
        if (isset($in[$k])) $p[$k] = filter_var($in[$k], FILTER_VALIDATE_BOOLEAN);
    }
    if (isset($in['qr_ips'])) {
        $ips = [];
        foreach (array_slice((array)$in['qr_ips'], 0, 20) as $ip) {
            $ip = trim((string)$ip);
            if ($ip === '') continue;
            if (!ip_rule_valid($ip)) throw new ValidationError("«{$ip}» no es una IP válida (ejemplos: 81.40.12.7 o 81.40.12.0/24)");
            $ips[] = $ip;
        }
        $p['qr_ips'] = array_values(array_unique($ips));
    }
    if (isset($in['specials'])) {
        $p['specials'] = [];
        foreach (array_slice((array)$in['specials'], 0, 40) as $s) {
            $name = mb_substr(trim((string)($s['name'] ?? '')), 0, 80);
            if ($name === '') continue;
            $p['specials'][] = ['name' => $name, 'price' => round(max(0, min(9999, (float)($s['price'] ?? 0))), 2),
                'course' => $int($s['course'] ?? 2, 0, 3), 'desc' => mb_substr(trim((string)($s['desc'] ?? '')), 0, 160)];
        }
    }
    sala_kv_set('prefs', $p);
    sala_bump();
    return $p;
}

/** Minutos que una reserva ocupa la mesa. */
function sala_minutes(array $prefs): int
{
    return (int)$prefs['minutes'] ?: ((int)(settings()['table_minutes'] ?? 0) ?: 90);
}

/* ---------- Asignación automática de mesas a las reservas ---------- */

/** Asignaciones guardadas de un día, solo de reservas que siguen activas: [reservation_id => ['tables'=>[], 'manual'=>bool, 'time'=>, 'people'=>]] */
function sala_assignments(string $date): array
{
    $ph = implode(',', array_fill(0, count(RES_ACTIVE), '?'));
    $rows = q("SELECT a.reservation_id, a.data, r.rtime, r.people FROM sala_assign a JOIN reservations r ON r.id = a.reservation_id
               WHERE a.rdate = ? AND r.rdate = ? AND r.deleted = 0 AND r.status IN ($ph)", array_merge([$date, $date], RES_ACTIVE))->fetchAll();
    $o = [];
    foreach ($rows as $r) {
        $d = json_decode(dec($r['data']), true) ?: [];
        $o[(int)$r['reservation_id']] = ['tables' => array_values((array)($d['tables'] ?? [])), 'manual' => !empty($d['manual']),
            'time' => $r['rtime'], 'people' => (int)$r['people']];
    }
    return $o;
}

/** Mesas ocupadas por otras reservas que se solapan con [hora, hora + duración). */
function sala_busy(string $date, string $time, int $excludeRes, ?array $assignments = null): array
{
    $prefs = sala_prefs();
    $dur = sala_minutes($prefs) * 60;
    $start = strtotime("$date $time");
    $busy = [];
    foreach ($assignments ?? sala_assignments($date) as $rid => $a) {
        if ($rid === $excludeRes) continue;
        $s2 = strtotime("$date {$a['time']}");
        if ($start < $s2 + $dur && $s2 < $start + $dur) foreach ($a['tables'] as $t) $busy[$t] = true;
    }
    return $busy;
}

/** Dos mesas están «juntas» si se tocan (o casi) por un lado. */
function sala_adjacent(array $a, array $b, int $gap): bool
{
    $dx = max(0, max($a['x'] - ($b['x'] + $b['w']), $b['x'] - ($a['x'] + $a['w'])));
    $dy = max(0, max($a['y'] - ($b['y'] + $b['h']), $b['y'] - ($a['y'] + $a['h'])));
    $ox = min($a['x'] + $a['w'], $b['x'] + $b['w']) - max($a['x'], $b['x']);
    $oy = min($a['y'] + $a['h'], $b['y'] + $b['h']) - max($a['y'], $b['y']);
    return ($dx <= $gap && $oy > 0) || ($dy <= $gap && $ox > 0);
}

/**
 * Busca sitio para $people personas: primero una mesa (o fusión ya hecha) que sirva sola, la más ajustada;
 * si sobran más sitios de los que el restaurante acepta, o no hay ninguna, prueba a juntar mesas vecinas.
 * Devuelve la lista de mesas o null si no cabe en ningún sitio.
 */
function sala_find_tables(int $people, string $date, string $time, int $excludeRes = 0, ?array $layout = null, ?array $assignments = null): ?array
{
    $prefs = sala_prefs();
    $layout ??= sala_layout();
    $busy = sala_busy($date, $time, $excludeRes, $assignments);
    $byId = [];
    foreach ($layout['tables'] as $t) if ($t['kind'] === 'mesa') $byId[$t['id']] = $t;
    $floorOrder = [];
    foreach ($layout['floors'] as $i => $f) $floorOrder[$f['id']] = 100 + $i;
    if ($prefs['floors']) {
        $allowed = [];
        foreach ($prefs['floors'] as $i => $fid) if (isset($floorOrder[$fid])) $allowed[$fid] = $i;
        if ($allowed) $floorOrder = $allowed;
    }

    $inGroup = [];
    $units = [];
    foreach ($layout['groups'] as $g) {
        foreach ($g['tables'] as $t) $inGroup[$t] = true;
        $floor = $byId[$g['tables'][0]]['floor'] ?? '';
        if (!isset($floorOrder[$floor]) || empty($g['auto'])) continue;
        if (array_filter($g['tables'], fn($t) => isset($busy[$t]))) continue;
        $units[] = ['tables' => $g['tables'], 'seats' => sala_group_seats($g, $byId, $prefs), 'rank' => $floorOrder[$floor]];
    }
    $free = [];
    foreach ($byId as $id => $t) {
        if (isset($inGroup[$id]) || isset($busy[$id]) || empty($t['auto']) || !isset($floorOrder[$t['floor']])) continue;
        $free[$id] = $t;
        $units[] = ['tables' => [$id], 'seats' => (int)$t['seats'], 'rank' => $floorOrder[$t['floor']]];
    }
    $score = fn($u) => [$u['seats'] - $people, count($u['tables']), $u['rank']];
    $best = null;
    foreach ($units as $u) {
        if ($u['seats'] < $people) continue;
        if ($best === null || $score($u) < $score($best)) $best = $u;
    }
    if ($best !== null && $best['seats'] - $people <= (int)$prefs['max_spare']) return $best['tables'];
    if (!$prefs['merge']) return $best['tables'] ?? null;

    // Juntar mesas vecinas libres de la misma planta (conjuntos conectados de 2 a max_merge mesas)
    $joinable = array_filter($free, fn($t) => !empty($t['join']));
    $ids = array_keys($joinable);
    $nb = [];
    foreach ($ids as $a) foreach ($ids as $b) {
        if ($a !== $b && $joinable[$a]['floor'] === $joinable[$b]['floor'] && sala_adjacent($joinable[$a], $joinable[$b], (int)$prefs['gap'])) $nb[$a][] = $b;
    }
    $max = max(2, (int)$prefs['max_merge']);
    $seen = [];
    $combo = null;
    $frontier = array_map(fn($id) => [$id], $ids);
    $checked = 0;
    for ($size = 2; $size <= $max && $frontier && $checked < 20000; $size++) {
        $next = [];
        foreach ($frontier as $set) {
            foreach ($set as $member) foreach ($nb[$member] ?? [] as $n) {
                if (in_array($n, $set, true)) continue;
                $s2 = $set;
                $s2[] = $n;
                sort($s2);
                $key = implode(',', $s2);
                if (isset($seen[$key])) continue;
                $seen[$key] = true;
                if (++$checked > 20000) break 3;
                $seats = array_sum(array_map(fn($x) => (int)$joinable[$x]['seats'], $s2)) - (int)$prefs['merge_loss'] * ($size - 1);
                $u = ['tables' => $s2, 'seats' => $seats, 'rank' => $floorOrder[$joinable[$s2[0]]['floor']]];
                if ($seats >= $people) {
                    if ($combo === null || $score($u) < $score($combo)) $combo = $u;
                } else {
                    $next[] = $s2;
                }
            }
        }
        // Con una combinación que ya sirve no se buscan otras de más mesas
        if ($combo !== null) break;
        $frontier = $next;
    }
    if ($best === null) return $combo['tables'] ?? null;
    if ($combo !== null && $combo['seats'] - $people < $best['seats'] - $people) return $combo['tables'];
    return $best['tables'];
}

function sala_assign_store(int $resId, string $date, array $tables, bool $manual): void
{
    $data = enc(json_encode(['tables' => array_values($tables), 'manual' => $manual]));
    // (MySQL cuenta 0 filas si nada cambia: por eso el INSERT puede chocar con la fila que ya existe)
    if (q('UPDATE sala_assign SET rdate = ?, data = ?, updated_at = ? WHERE reservation_id = ?', [$date, $data, now(), $resId])->rowCount() === 0) {
        try { q('INSERT INTO sala_assign (reservation_id, rdate, data, updated_at) VALUES (?, ?, ?, ?)', [$resId, $date, $data, now()]); }
        catch (Throwable $e) { /* ya estaba */ }
    }
    sala_bump();
}

function sala_assign_clear(int $resId): void
{
    q('DELETE FROM sala_assign WHERE reservation_id = ?', [$resId]);
    sala_bump();
}

/** ¿Sigue valiendo la asignación? (las mesas existen, caben y nadie más las tiene a esa hora) */
function sala_assign_valid(array $tables, array $res, array $layout, ?array $assignments = null): bool
{
    if (!$tables) return false;
    $prefs = sala_prefs();
    $byId = [];
    foreach ($layout['tables'] as $t) if ($t['kind'] === 'mesa') $byId[$t['id']] = $t;
    foreach ($tables as $t) if (!isset($byId[$t])) return false;
    $busy = sala_busy($res['rdate'], $res['rtime'], (int)$res['id'], $assignments);
    foreach ($tables as $t) if (isset($busy[$t])) return false;
    foreach ($layout['groups'] as $g) {
        if (!array_diff($g['tables'], $tables) && !array_diff($tables, $g['tables'])) return sala_group_seats($g, $byId, $prefs) >= (int)$res['people'];
    }
    $seats = array_sum(array_map(fn($t) => (int)$byId[$t]['seats'], $tables)) - (int)$prefs['merge_loss'] * (count($tables) - 1);
    return $seats >= (int)$res['people'];
}

/** ¿Toca asignar mesa a esta reserva según lo que quiere el restaurante? */
function sala_should_assign(array $res, array $prefs): bool
{
    if ($prefs['assign'] === 'off' || (int)$res['deleted'] || !in_array($res['status'], RES_ACTIVE, true)) return false;
    if ($res['rdate'] < today()) return false;
    return $prefs['assign'] === 'crear' || in_array($res['status'], ['esperando', 'confirmada'], true);
}

/**
 * Se llama al crear, editar o cambiar de estado una reserva. Asigna (o reasigna) mesa si hace falta.
 * Nunca rompe la reserva: si algo falla, se apunta en el registro y ya está.
 */
function sala_on_reservation(int $id): void
{
    if (!function_exists('db')) return;
    $own = false;
    try {
        $res = q('SELECT id, rdate, rtime, people, status, deleted FROM reservations WHERE id = ?', [$id])->fetch();
        if (!$res) return;
        $prefs = sala_prefs();
        $cur = q('SELECT data FROM sala_assign WHERE reservation_id = ?', [$id])->fetchColumn();
        $cur = $cur === false ? null : (json_decode(dec((string)$cur), true) ?: null);
        if (!in_array($res['status'], RES_ACTIVE, true) || (int)$res['deleted']) {
            if ($cur) sala_assign_clear($id);
            return;
        }
        $layout = sala_layout();
        if ($cur && sala_assign_valid((array)$cur['tables'], $res, $layout)) return;
        if (!sala_should_assign($res, $prefs)) {
            if ($cur) sala_assign_clear($id); // ya no vale y no se reasigna sola
            return;
        }
        if (!db()->inTransaction()) { reservation_lock(); $own = true; }
        $tables = sala_find_tables((int)$res['people'], $res['rdate'], $res['rtime'], $id, $layout);
        if ($tables) sala_assign_store($id, $res['rdate'], $tables, false);
        elseif ($cur) sala_assign_clear($id);
        if ($own) db()->commit();
    } catch (Throwable $e) {
        if ($own && db()->inTransaction()) db()->rollBack();
        error_log('[restaurante] Asignar mesa a la reserva #' . $id . ': ' . $e->getMessage());
    }
}

/** Reservas del día que aún no tienen mesa (p. ej. creadas antes de configurar el plano). */
function sala_assign_pending(string $date): void
{
    if ($date < today() || sala_prefs()['assign'] === 'off') return;
    $ph = implode(',', array_fill(0, count(RES_ACTIVE), '?'));
    $ids = q("SELECT r.id FROM reservations r LEFT JOIN sala_assign a ON a.reservation_id = r.id
              WHERE r.rdate = ? AND r.deleted = 0 AND r.status IN ($ph) AND a.reservation_id IS NULL ORDER BY r.rtime, r.id LIMIT 60",
        array_merge([$date], RES_ACTIVE))->fetchAll(PDO::FETCH_COLUMN);
    foreach ($ids as $id) sala_on_reservation((int)$id);
}

/** Asignación a mano desde la sala (el camarero elige las mesas). Lista vacía = quitar la mesa. */
function sala_assign_manual(int $resId, array $tables): array
{
    $res = q('SELECT id, rdate, rtime, people, status, deleted FROM reservations WHERE id = ?', [$resId])->fetch();
    if (!$res || (int)$res['deleted'] || !in_array($res['status'], RES_ACTIVE, true)) throw new ValidationError('La reserva no existe o está cancelada');
    $layout = sala_layout();
    $valid = [];
    foreach ($layout['tables'] as $t) if ($t['kind'] === 'mesa') $valid[$t['id']] = true;
    $tables = array_values(array_unique(array_filter(array_map('strval', $tables), fn($t) => isset($valid[$t]))));
    if (!$tables) { sala_assign_clear($resId); return []; }
    $busy = sala_busy($res['rdate'], $res['rtime'], $resId);
    foreach ($tables as $t) if (isset($busy[$t])) throw new ValidationError('Alguna de esas mesas ya tiene otra reserva a esa hora');
    sala_assign_store($resId, $res['rdate'], $tables, true);
    return $tables;
}

/** Vuelve a buscar mesa automáticamente (botón «Asignar sola»), aunque la asignación automática esté apagada. */
function sala_assign_auto(int $resId): array
{
    $res = q('SELECT id, rdate, rtime, people, status, deleted FROM reservations WHERE id = ?', [$resId])->fetch();
    if (!$res || (int)$res['deleted'] || !in_array($res['status'], RES_ACTIVE, true)) throw new ValidationError('La reserva no existe o está cancelada');
    $tables = sala_find_tables((int)$res['people'], $res['rdate'], $res['rtime'], $resId);
    if (!$tables) throw new ValidationError('No hay mesas libres (ni juntando mesas) para esa hora');
    sala_assign_store($resId, $res['rdate'], $tables, false);
    return $tables;
}

/** Nombre de las mesas de una reserva para el panel («Mesa 4 + 5»). '' si no tiene. */
function sala_res_label(int $resId, string $date): string
{
    static $cache = [];
    try {
        if (!isset($cache[$date])) {
            $names = [];
            foreach (sala_layout()['tables'] as $t) $names[$t['id']] = $t['name'];
            $cache[$date] = [];
            foreach (sala_assignments($date) as $rid => $a) {
                $cache[$date][$rid] = implode(' + ', array_map(fn($t) => $names[$t] ?? '?', $a['tables']));
            }
        }
    } catch (Throwable $e) {
        return ''; // sin tablas de la sala todavía
    }
    return $cache[$date][$resId] ?? '';
}

/* ---------- Pedidos ---------- */

function sala_order_row(array $r): array
{
    $d = json_decode(dec($r['data']), true) ?: [];
    return ['id' => (int)$r['id'], 'status' => $r['status'], 'opened_at' => $r['opened_at'], 'closed_at' => $r['closed_at'],
        'tables' => array_values((array)($d['tables'] ?? [])), 'people' => (int)($d['people'] ?? 0), 'note' => (string)($d['note'] ?? ''),
        'res' => (int)($d['res'] ?? 0), 'by' => (string)($d['by'] ?? ''), 'total' => (float)($d['total'] ?? 0),
        // Pedidos por QR: código de la mesa, si se puede pedir desde el móvil y si llaman al camarero
        'pin' => (string)($d['pin'] ?? ''), 'qr' => !empty($d['qr']), 'call' => is_array($d['call'] ?? null) ? $d['call'] : null];
}

function sala_item_row(array $r): array
{
    $d = json_decode(dec($r['data']), true) ?: [];
    return ['id' => (int)$r['id'], 'order' => (int)$r['order_id'], 'batch' => (int)$r['batch'], 'status' => $r['status'],
        'dest' => $r['dest'], 'course' => (int)$r['course'], 'sent_at' => $r['created_at'], 'updated_at' => $r['updated_at'],
        'name' => (string)($d['name'] ?? ''), 'qty' => (int)($d['qty'] ?? 1), 'price' => (float)($d['price'] ?? 0),
        'note' => (string)($d['note'] ?? ''), 'kind' => (string)($d['kind'] ?? 'dish'), 'sub' => (string)($d['sub'] ?? ''),
        'allergens' => array_values((array)($d['allergens'] ?? [])), 'by' => (string)($d['by'] ?? ''), 'qr' => !empty($d['qr'])];
}

/** Pedidos abiertos con sus platos. */
function sala_orders_open(): array
{
    $orders = [];
    foreach (q("SELECT * FROM sala_orders WHERE status = 'abierta' ORDER BY id")->fetchAll() as $r) $orders[(int)$r['id']] = sala_order_row($r) + ['items' => []];
    if ($orders) {
        $ph = implode(',', array_fill(0, count($orders), '?'));
        foreach (q("SELECT * FROM sala_items WHERE order_id IN ($ph) ORDER BY id", array_keys($orders))->fetchAll() as $i) {
            $orders[(int)$i['order_id']]['items'][] = sala_item_row($i);
        }
    }
    return array_values($orders);
}

function sala_order_get(int $id): array
{
    $r = q('SELECT * FROM sala_orders WHERE id = ?', [$id])->fetch();
    if (!$r) throw new ValidationError('El pedido no existe');
    $o = sala_order_row($r);
    $o['items'] = array_map('sala_item_row', q('SELECT * FROM sala_items WHERE order_id = ? ORDER BY id', [$id])->fetchAll());
    return $o;
}

function sala_order_save_data(int $id, array $o): void
{
    $data = ['tables' => $o['tables'], 'people' => $o['people'], 'note' => $o['note'], 'res' => $o['res'], 'by' => $o['by'], 'total' => $o['total'] ?? 0,
        'pin' => $o['pin'] ?? '', 'qr' => !empty($o['qr']), 'call' => $o['call'] ?? null];
    q('UPDATE sala_orders SET data = ? WHERE id = ?', [enc(json_encode($data, JSON_UNESCAPED_UNICODE)), $id]);
}

/** Comprueba las mesas de un pedido: existen y no están en otro pedido abierto. */
function sala_check_tables(array $tables, int $exceptOrder = 0): array
{
    $valid = [];
    foreach (sala_layout()['tables'] as $t) if ($t['kind'] === 'mesa') $valid[$t['id']] = true;
    $tables = array_values(array_unique(array_filter(array_map('strval', $tables), fn($t) => isset($valid[$t]))));
    if (!$tables) throw new ValidationError('Elige al menos una mesa');
    foreach (sala_orders_open() as $o) {
        if ($o['id'] !== $exceptOrder && array_intersect($o['tables'], $tables)) throw new ValidationError('Alguna de esas mesas ya tiene un pedido abierto');
    }
    return $tables;
}

function sala_order_open(array $u, array $in): array
{
    $pdo = db();
    reservation_lock(); // dos camareros abriendo la misma mesa a la vez: el segundo ve la mesa ocupada
    try {
        $tables = sala_check_tables((array)($in['tables'] ?? []));
        $o = ['tables' => $tables, 'people' => max(0, min(300, (int)($in['people'] ?? 0))), 'note' => mb_substr(trim((string)($in['note'] ?? '')), 0, 300),
            'res' => max(0, (int)($in['res'] ?? 0)), 'by' => $u['dname'], 'total' => 0,
            'pin' => mesa_new_pin(), 'qr' => (bool)sala_prefs()['qr'], 'call' => null];
        q("INSERT INTO sala_orders (status, data, opened_at) VALUES ('abierta', ?, ?)", [enc(json_encode($o, JSON_UNESCAPED_UNICODE)), now()]);
        $id = (int)$pdo->lastInsertId();
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
    sala_bump();
    return sala_order_get($id);
}

/** Cambiar personas, nota o mesas (mover el pedido o juntarle otra mesa). */
function sala_order_update(array $u, array $in): array
{
    $o = sala_order_get((int)($in['id'] ?? 0));
    if ($o['status'] !== 'abierta') throw new ValidationError('Este pedido ya está cerrado');
    if (isset($in['tables'])) $o['tables'] = sala_check_tables((array)$in['tables'], $o['id']);
    if (isset($in['people'])) $o['people'] = max(0, min(300, (int)$in['people']));
    if (isset($in['note'])) $o['note'] = mb_substr(trim((string)$in['note']), 0, 300);
    // Pedidos por QR: atender una llamada, encender o apagar el QR de la mesa, o cambiar el código
    if (!empty($in['call_done'])) $o['call'] = null;
    if (isset($in['qr'])) $o['qr'] = filter_var($in['qr'], FILTER_VALIDATE_BOOLEAN);
    if (!empty($in['new_pin']) || (isset($in['qr']) && !$o['qr'])) {
        if (!empty($in['new_pin'])) $o['pin'] = mesa_new_pin();
        mesa_kick($o['id']); // los móviles que ya estaban dentro tienen que volver a entrar
    }
    sala_order_save_data($o['id'], $o);
    sala_bump();
    return sala_order_get($o['id']);
}

/** Pase por defecto según el nombre de la categoría (el camarero lo puede cambiar). */
function sala_course_guess(string $cat): int
{
    $c = mb_strtolower($cat);
    if (preg_match('/postre|dulce|tarta|helado|sobremesa/u', $c)) return 3;
    if (preg_match('/bebida|vino|cervez|refresco|caf[eé]|c[oó]ctel|cocktail|copa|licor|agua/u', $c)) return 0;
    if (preg_match('/entrante|empezar|compartir|tapa|ensalada|primer|aperitivo|raci[oó]n|picar/u', $c)) return 1;
    return 2;
}

/**
 * Añadir platos a un pedido. Los precios y nombres salen siempre de la carta del servidor.
 * $guest: lo pide el cliente desde su móvil (QR): solo platos de la carta, menús y especiales del día
 * (nada con nombre o precio libre), con límites de cantidad, y el pase y la espera los decide el servidor.
 */
function sala_order_add(array $u, array $in, bool $guest = false): array
{
    $o = sala_order_get((int)($in['id'] ?? 0));
    if ($o['status'] !== 'abierta') throw new ValidationError('Este pedido ya está cerrado');
    $lines = array_slice((array)($in['items'] ?? []), 0, 80);
    if (!$lines) throw new ValidationError('No hay nada que enviar');
    if ($guest) {
        if (count($lines) > MESA_LINES_MAX) throw new ValidationError('Son demasiados platos de golpe. Envía una parte y luego el resto.');
        $units = array_sum(array_map(fn($l) => max(1, (int)($l['qty'] ?? 1)), $lines));
        if ($units > MESA_UNITS_MAX) throw new ValidationError('Son demasiados platos de golpe (máximo ' . MESA_UNITS_MAX . '). Si sois un grupo grande, pide al camarero.');
        foreach ($lines as &$l) {
            $l = (array)$l;
            if (($l['kind'] ?? '') === 'special' && !(isset($l['special']) && is_numeric($l['special']))) throw new ValidationError('Ese plato no está en la carta');
            if ((int)($l['qty'] ?? 1) > MESA_QTY_MAX) throw new ValidationError('Como mucho ' . MESA_QTY_MAX . ' de cada plato por envío');
            $l['note'] = mb_substr(trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', (string)($l['note'] ?? '')) ?? ''), 0, 120);
            unset($l['course'], $l['hold'], $l['name'], $l['price']);
            foreach ((array)($l['choices'] ?? []) as $k => $ch) $l['choices'][$k] = ['c' => (int)(((array)$ch)['c'] ?? -1), 'd' => (int)(((array)$ch)['d'] ?? -1)];
        }
        unset($l);
    }
    $prefs = sala_prefs();
    $cats = [];
    foreach (q('SELECT id, name FROM categories')->fetchAll() as $c) $cats[(int)$c['id']] = $c['name'];
    $menus = [];
    foreach (menus_all() as $m) $menus[$m['id']] = $m;
    $course = fn($v, int $def) => isset($v) && is_numeric($v) && (int)$v >= 0 && (int)$v <= 3 ? (int)$v : $def;
    $rows = [];
    foreach ($lines as $l) {
        $qty = max(1, min(99, (int)($l['qty'] ?? 1)));
        $note = mb_substr(trim((string)($l['note'] ?? '')), 0, 200);
        $hold = filter_var($l['hold'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $kind = (string)($l['kind'] ?? 'dish');
        if ($kind === 'dish') {
            $d = q('SELECT * FROM dishes WHERE id = ?', [(int)($l['dish'] ?? 0)])->fetch();
            if (!$d) throw new ValidationError('Uno de los platos ya no está en la carta');
            $cid = (int)$d['category_id'];
            $rows[] = ['name' => $d['name'], 'price' => (float)$d['price'], 'qty' => $qty, 'note' => $note, 'kind' => 'dish', 'sub' => '',
                'allergens' => $d['allergens'] === '' ? [] : explode(',', $d['allergens']),
                'course' => $course($l['course'] ?? null, sala_course_guess($cats[$cid] ?? '')),
                'dest' => in_array($cid, $prefs['no_kitchen'], true) ? 'barra' : 'cocina', 'hold' => $hold];
        } elseif ($kind === 'menu') {
            $m = $menus[(string)($l['menu'] ?? '')] ?? null;
            if (!$m || !$m['on']) throw new ValidationError('Ese menú no está activo');
            $first = true;
            foreach ((array)($l['choices'] ?? []) as $ch) {
                $ci = (int)($ch['c'] ?? -1);
                $di = (int)($ch['d'] ?? -1);
                $dish = $m['courses'][$ci]['dishes'][$di] ?? null;
                if (!$dish) throw new ValidationError('Falta elegir algún plato del menú');
                $cname = (string)$m['courses'][$ci]['name'];
                $rows[] = ['name' => $dish['name'], 'price' => ($first ? (float)$m['price'] : 0) + (float)$dish['extra'], 'qty' => $qty,
                    'note' => $note, 'kind' => 'menu', 'sub' => $m['title'] . ($cname !== '' ? " · $cname" : ''), 'allergens' => $dish['allergens'],
                    'course' => $course($ch['course'] ?? null, min(3, $ci + 1)), 'dest' => 'cocina', 'hold' => $hold || !empty($ch['hold'])];
                $first = false;
            }
            if ($first) throw new ValidationError('Elige los platos del menú');
        } elseif ($kind === 'special') {
            $sp = isset($l['special']) && is_numeric($l['special']) ? ($prefs['specials'][(int)$l['special']] ?? null) : null;
            if ($guest && !$sp) throw new ValidationError('Ese plato especial ya no está disponible');
            $name = $sp ? $sp['name'] : mb_substr(trim((string)($l['name'] ?? '')), 0, 80);
            if ($name === '') throw new ValidationError('Escribe el nombre del plato especial');
            $price = $sp ? (float)$sp['price'] : round(max(0, min(9999, (float)($l['price'] ?? 0))), 2);
            $c = $course($l['course'] ?? null, $sp ? (int)$sp['course'] : 2);
            $rows[] = ['name' => $name, 'price' => $price, 'qty' => $qty, 'note' => $note, 'kind' => 'special', 'sub' => 'Especial', 'allergens' => [],
                'course' => $c, 'dest' => $c === 0 ? 'barra' : 'cocina', 'hold' => $hold];
        } else {
            throw new ValidationError('Tipo de plato no válido');
        }
    }
    $batch = (int)q('SELECT COALESCE(MAX(batch), 0) + 1 FROM sala_items WHERE order_id = ?', [$o['id']])->fetchColumn();
    foreach ($rows as $r) {
        $data = ['name' => $r['name'], 'price' => $r['price'], 'qty' => $r['qty'], 'note' => $r['note'], 'kind' => $r['kind'], 'sub' => $r['sub'],
            'allergens' => $r['allergens'], 'by' => $u['dname']] + ($guest ? ['qr' => true] : []);
        // Desde el móvil los postres salen en espera (como al tomar nota) y, si el restaurante lo pide, todo
        // espera a que el camarero lo acepte
        $hold = $guest ? $r['course'] === 3 : $r['hold'];
        $st = $guest && $prefs['qr_confirm'] ? 'pendiente' : ($hold ? 'espera' : 'nuevo');
        q('INSERT INTO sala_items (order_id, batch, status, dest, course, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [$o['id'], $batch, $st, $r['dest'], $r['course'], enc(json_encode($data, JSON_UNESCAPED_UNICODE)), now(), now()]);
    }
    sala_bump();
    return sala_order_get($o['id']);
}

/** Cambiar el estado de un plato. La cocina solo lo marca en preparación o listo. */
function sala_item_status(array $u, int $itemId, string $status): array
{
    if (!in_array($status, SALA_ITEM_ST, true)) throw new ValidationError('Estado no válido');
    if ($u['role'] === 'cocina' && !in_array($status, ['nuevo', 'preparando', 'listo'], true)) throw new ValidationError('Desde la cocina solo se marca «en preparación» o «listo».');
    $it = q('SELECT i.*, o.status AS ost FROM sala_items i JOIN sala_orders o ON o.id = i.order_id WHERE i.id = ?', [$itemId])->fetch();
    if (!$it) throw new ValidationError('El plato no existe');
    if ($it['ost'] !== 'abierta') throw new ValidationError('Ese pedido ya está cerrado');
    if ($u['role'] === 'cocina' && in_array($it['status'], ['pendiente', 'espera'], true)) throw new ValidationError('Ese plato aún no ha llegado a la cocina');
    if ($status === 'pendiente' && $it['status'] !== 'pendiente') throw new ValidationError('Estado no válido');
    if ($it['status'] === 'pendiente' && in_array($status, ['nuevo', 'espera'], true)) {
        // Pedido por QR aceptado por el camarero: para la cocina cuenta desde ahora
        q('UPDATE sala_items SET status = ?, updated_at = ?, created_at = ? WHERE id = ?', [$status, now(), now(), $itemId]);
    } else {
        q('UPDATE sala_items SET status = ?, updated_at = ? WHERE id = ?', [$status, now(), $itemId]);
    }
    sala_bump();
    return sala_item_row(q('SELECT * FROM sala_items WHERE id = ?', [$itemId])->fetch());
}

/** Varios platos de golpe (p. ej. «todo listo» en una comanda). */
function sala_items_status(array $u, array $ids, string $status): int
{
    $n = 0;
    foreach (array_slice(array_unique(array_map('intval', $ids)), 0, 100) as $id) {
        sala_item_status($u, $id, $status);
        $n++;
    }
    return $n;
}

/** «Marchar»: los platos en espera de un pase pasan a la cocina. */
function sala_order_fire(array $u, int $orderId, int $course): array
{
    $o = sala_order_get($orderId);
    if ($o['status'] !== 'abierta') throw new ValidationError('Este pedido ya está cerrado');
    // Lo que se marcha sale como una comanda nueva, con la hora de ahora
    $batch = (int)q('SELECT COALESCE(MAX(batch), 0) + 1 FROM sala_items WHERE order_id = ?', [$orderId])->fetchColumn();
    $sql = "UPDATE sala_items SET status = 'nuevo', batch = ?, updated_at = ?, created_at = ? WHERE order_id = ? AND status = 'espera'";
    $args = [$batch, now(), now(), $orderId];
    if ($course >= 0) { $sql .= ' AND course = ?'; $args[] = $course; }
    q($sql, $args);
    sala_bump();
    return sala_order_get($orderId);
}

function sala_order_total(array $o): float
{
    $t = 0.0;
    foreach ($o['items'] as $i) if (!in_array($i['status'], ['anulado', 'pendiente'], true)) $t += $i['price'] * $i['qty'];
    return round($t, 2);
}

/** Cerrar la mesa: se guarda el total y la mesa queda libre. */
function sala_order_close(array $u, int $id): array
{
    $o = sala_order_get($id);
    if ($o['status'] !== 'abierta') throw new ValidationError('Este pedido ya está cerrado');
    $o['total'] = sala_order_total($o);
    $o['call'] = null;
    sala_order_save_data($id, $o);
    // Lo pedido por QR que nadie aceptó no se cobra
    q("UPDATE sala_items SET status = 'anulado', updated_at = ? WHERE order_id = ? AND status = 'pendiente'", [now(), $id]);
    q("UPDATE sala_items SET status = 'servido', updated_at = ? WHERE order_id = ? AND status NOT IN ('anulado', 'servido')", [now(), $id]);
    mesa_kick($id); // los móviles de la mesa ya no pueden pedir
    q("UPDATE sala_orders SET status = 'cerrada', closed_at = ? WHERE id = ?", [now(), $id]);
    sala_bump();
    return sala_order_get($id);
}

/** Volver a abrir un pedido cerrado por error (si su mesa sigue libre). */
function sala_order_reopen(array $u, int $id): array
{
    $o = sala_order_get($id);
    if ($o['status'] === 'abierta') return $o;
    sala_check_tables($o['tables'], $id);
    q("UPDATE sala_orders SET status = 'abierta', closed_at = NULL WHERE id = ?", [$id]);
    sala_bump();
    return sala_order_get($id);
}

/** Pedidos cerrados de hoy (para ver lo cobrado y reabrir uno por error). */
function sala_orders_closed_today(): array
{
    $rows = q("SELECT * FROM sala_orders WHERE status = 'cerrada' AND closed_at >= ? ORDER BY closed_at DESC LIMIT 100", [today() . ' 00:00:00'])->fetchAll();
    return array_map('sala_order_row', $rows);
}

/* ---------- Pantalla de cocina ---------- */

/**
 * Comandas para la cocina (o la barra): cada envío de un pedido es una comanda, la más antigua primero.
 * Las que tienen todo listo bajan a «Listo para servir» hasta que el camarero las sirve.
 */
function sala_kitchen(string $dest): array
{
    $dest = $dest === 'barra' ? 'barra' : 'cocina';
    $orders = [];
    foreach (q("SELECT * FROM sala_orders WHERE status = 'abierta'")->fetchAll() as $r) $orders[(int)$r['id']] = sala_order_row($r);
    $tickets = [];
    if ($orders) {
        $ph = implode(',', array_fill(0, count($orders), '?'));
        $rows = q("SELECT * FROM sala_items WHERE dest = ? AND order_id IN ($ph) AND status IN ('espera', 'nuevo', 'preparando', 'listo') ORDER BY created_at, id",
            array_merge([$dest], array_keys($orders)))->fetchAll();
        foreach ($rows as $row) {
            $i = sala_item_row($row);
            $key = $i['order'] . '-' . $i['batch'] . ($i['status'] === 'espera' ? 'e' : '');
            if (!isset($tickets[$key])) {
                $o = $orders[$i['order']];
                $tickets[$key] = ['key' => $key, 'order' => $o['id'], 'tables' => $o['tables'], 'people' => $o['people'], 'note' => $o['note'],
                    'by' => $i['by'] ?: $o['by'], 'sent_at' => $i['sent_at'], 'items' => [], 'hold' => $i['status'] === 'espera'];
            }
            $tickets[$key]['items'][] = $i;
            if ($i['sent_at'] < $tickets[$key]['sent_at']) $tickets[$key]['sent_at'] = $i['sent_at'];
        }
    }
    $tickets = array_values($tickets);
    usort($tickets, fn($a, $b) => [$a['hold'], $a['sent_at']] <=> [$b['hold'], $b['sent_at']]);
    return ['tickets' => $tickets, 'now' => now()];
}

/* ---------- Estado completo para la sala ---------- */

function sala_reservations(string $date): array
{
    $ph = implode(',', array_fill(0, count(RES_ACTIVE), '?'));
    $rows = q("SELECT id, name, rtime, people, notes, status FROM reservations WHERE rdate = ? AND deleted = 0 AND status IN ($ph) ORDER BY rtime, id",
        array_merge([$date], RES_ACTIVE))->fetchAll();
    $as = sala_assignments($date);
    return array_map(fn($r) => ['id' => (int)$r['id'], 'name' => dec($r['name']), 'time' => $r['rtime'], 'people' => (int)$r['people'],
        'notes' => dec($r['notes']), 'status' => $r['status'], 'tables' => $as[(int)$r['id']]['tables'] ?? [],
        'manual' => $as[(int)$r['id']]['manual'] ?? false], $rows);
}

/** Huella de lo que ve la sala: si no ha cambiado, la pantalla no vuelve a descargarlo todo. */
function sala_fingerprint(string $date): string
{
    $r = q('SELECT COUNT(*) AS n, MAX(updated_at) AS u, MAX(seq) AS s FROM reservations WHERE rdate = ?', [$date])->fetch();
    return sala_rev() . '.' . substr(sha1($date . '|' . $r['n'] . '|' . $r['u'] . '|' . $r['s']), 0, 10);
}

function sala_state(string $date, string $since): array
{
    if (!is_date($date)) throw new ValidationError('Fecha no válida');
    $fp = sala_fingerprint($date);
    if ($since !== '' && hash_equals($fp, $since)) return ['rev' => $fp, 'same' => true];
    sala_assign_pending($date);
    $fp = sala_fingerprint($date);
    $prefs = sala_prefs();
    return [
        'rev' => $fp, 'date' => $date, 'today' => today(), 'now' => now(),
        'layout' => sala_layout(), 'orders' => sala_orders_open(), 'reservations' => sala_reservations($date),
        'minutes' => sala_minutes($prefs), 'merge_loss' => (int)$prefs['merge_loss'],
    ];
}

/** Carta para tomar pedidos: platos disponibles, menús activos y especiales. */
function sala_carta(): array
{
    $prefs = sala_prefs();
    $cats = menu_data(false)['categories'];
    foreach ($cats as &$c) {
        $c['course'] = sala_course_guess($c['name']);
        $c['barra'] = in_array($c['id'], $prefs['no_kitchen'], true);
        $c['dishes'] = array_map(fn($d) => array_intersect_key($d, array_flip(['id', 'name', 'description', 'price', 'allergens'])), $c['dishes']);
    }
    unset($c);
    $menus = array_values(array_filter(menus_all(), fn($m) => $m['on']));
    $menus = array_map(fn($m) => ['id' => $m['id'], 'title' => $m['title'], 'price' => $m['price'], 'note' => $m['note'],
        'courses' => array_map(fn($c) => ['name' => $c['name'], 'dishes' => array_map(fn($d) => ['name' => $d['name'], 'extra' => $d['extra'], 'allergens' => $d['allergens']], $c['dishes'])], $m['courses'])], $menus);
    return ['categories' => $cats, 'menus' => $menus, 'specials' => $prefs['specials'], 'courses' => SALA_COURSES, 'allergens' => allergen_list()];
}

/** Limpieza: pedidos cerrados de hace más de 30 días y asignaciones de días pasados. */
function sala_purge(): void
{
    try {
        $old = q("SELECT id FROM sala_orders WHERE status = 'cerrada' AND closed_at < ?", [date('Y-m-d H:i:s', time() - 30 * 86400)])->fetchAll(PDO::FETCH_COLUMN);
        foreach (array_chunk($old, 200) as $chunk) {
            $ph = implode(',', array_fill(0, count($chunk), '?'));
            q("DELETE FROM sala_items WHERE order_id IN ($ph)", $chunk);
            q("DELETE FROM sala_orders WHERE id IN ($ph)", $chunk);
        }
        q('DELETE FROM sala_assign WHERE rdate < ?', [date('Y-m-d', time() - 86400)]);
        q('DELETE FROM sala_guests WHERE created_at < ?', [date('Y-m-d H:i:s', time() - MESA_SESSION_MAX)]);
    } catch (Throwable $e) {
        error_log('[restaurante] Limpieza de la sala: ' . $e->getMessage());
    }
}
