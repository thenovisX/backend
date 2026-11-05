<?php
declare(strict_types=1);
/*
 * Pruebas de los pedidos por QR desde la mesa (lib/mesa.php), con una base de datos SQLite de usar y tirar.
 * Se lanzan con:  bash tests/run.sh
 */
$web = $argv[1] ?? '';
if (!is_file("$web/config.php")) { fwrite(STDERR, "Uso: php tests/mesa_test.php <carpeta web con config.php>\n"); exit(2); }
require "$web/lib/bootstrap.php";
require_once "$web/lib/schema.php";
require_once "$web/lib/qr.php";
foreach (schema_sql(true) as $sql) { try { db()->exec($sql); } catch (Throwable $e) {} }
q("INSERT INTO settings (k, v) VALUES ('_schema', ?)", [(string)SCHEMA_VERSION]);
foreach (sample_menu() as $cat => $dishes) {
    q('INSERT INTO categories (name, position) VALUES (?, 0)', [$cat]);
    $cid = (int)db()->lastInsertId();
    foreach ($dishes as [$n, $d, $p, $a]) q("INSERT INTO dishes (category_id, name, description, price, allergens) VALUES (?,?,?,?,?)", [$cid, $n, $d, $p, $a]);
}
$_SERVER['REMOTE_ADDR'] = '81.40.12.7';
$_SERVER['HTTP_HOST'] = 'restaurante.test';
$_SERVER['SCRIPT_NAME'] = '/sala/api.php'; // los QR se generan desde la API de la sala

$fails = 0;
function ok(bool $c, string $m): void { global $fails; echo ($c ? "  ok  " : "  MAL ") . $m . "\n"; if (!$c) $fails++; }
function err(callable $f): string { try { $f(); return ''; } catch (Throwable $e) { return get_class($e) . ': ' . $e->getMessage(); } }
function key_of(string $url): string { return explode('&', explode('#k=', $url)[1])[0]; }
function reset_throttle(): void { q('DELETE FROM login_attempts'); }

echo "Códigos QR\n";
$m = qr_matrix('https://restaurante.test/mesa/#k=t1.AbCdEfGhIjKlMnOpQrStUv&p=1234');
ok(count($m) === 37, 'un enlace de mesa cabe en un QR versión 5 (37×37)');
ok(str_starts_with(qr_svg('hola'), '<svg') && str_contains(qr_svg('hola'), '<path'), 'el QR sale en SVG');
$list = mesa_qr_list();
ok(count($list) === 6, 'un QR por cada mesa del plano (no para la barra)');
ok(str_starts_with($list[0]['url'], 'http://restaurante.test/mesa/#k=t1.'), 'el QR lleva a /mesa/ con la mesa y su clave: ' . $list[0]['url']);
$raw = (string)q("SELECT v FROM sala_kv WHERE k = 'qr_keys'")->fetchColumn();
ok(str_starts_with($raw, ENC_PREFIX), 'las claves de los QR se guardan cifradas');
$k1 = key_of($list[0]['url']);
$k2 = key_of($list[1]['url']);
ok(mesa_info(['k' => $k1])['state'] === 'closed', 'mesa sin abrir: no se puede pedir');
ok(str_contains(err(fn() => mesa_info(['k' => 't1.AAAAAAAAAAAAAAAAAAAAAA'])), 'no vale'), 'una clave inventada no vale');
ok(str_contains(err(fn() => mesa_info(['k' => 't2.' . explode('.', $k1)[1]])), 'no vale'), 'la clave de una mesa no sirve para otra');
mesa_rotate('t1');
ok(str_contains(err(fn() => mesa_info(['k' => $k1])), 'no vale'), 'al cambiar el QR de una mesa, el viejo deja de valer');
ok(mesa_info(['k' => $k2])['state'] === 'closed', '…y el de las demás mesas sigue valiendo');
$k1 = key_of(mesa_qr_list()[0]['url']);
reset_throttle();

echo "Entrar en la mesa\n";
$u = ['id' => 1, 'role' => 'camarero', 'dname' => 'Laura'];
$o = sala_order_open($u, ['tables' => ['t1', 't2'], 'people' => 4]);
ok(preg_match('/^\d{4}$/', $o['pin']) === 1 && $o['qr'], 'al abrir la mesa se crea un código de 4 cifras');
ok(mesa_info(['k' => $k1])['state'] === 'open' && mesa_info(['k' => $k1])['table'] === '1 + 2', 'mesa abierta (y juntada con la 2)');
ok(str_contains(err(fn() => mesa_join(['k' => $k1])), 'código'), 'sin el código no se entra');
$wrong = $o['pin'] === '0000' ? '1111' : '0000';
ok(str_contains(err(fn() => mesa_join(['k' => $k1, 'pin' => $wrong])), 'código'), 'con un código malo no se entra');
$j = mesa_join(['k' => $k2, 'pin' => $o['pin']]);
ok(strlen($j['token']) === 64, 'con el código bueno se entra (desde el QR de la otra mesa juntada)');
$s = mesa_session($j['token']);
ok($s['order']['id'] === $o['id'], 'la sesión del móvil va con el pedido de la mesa');
ok(str_contains(err(fn() => mesa_session(str_repeat('a', 64))), 'MesaAuthError'), 'un token inventado no vale');
for ($i = 0; $i < 12; $i++) err(fn() => mesa_join(['k' => $k1, 'pin' => $wrong]));
ok(str_contains(err(fn() => mesa_join(['k' => $k1, 'pin' => $o['pin']])), 'Demasiados'), 'tras muchos códigos malos se bloquea un rato (contra adivinarlo)');
reset_throttle();

echo "Pedir desde el móvil\n";
$dish = q('SELECT id, price FROM dishes ORDER BY id LIMIT 1')->fetch();
$post = (int)q("SELECT d.id FROM dishes d JOIN categories c ON c.id = d.category_id WHERE c.name = 'Dulces' LIMIT 1")->fetchColumn();
$st = mesa_send($s, ['items' => [
    ['kind' => 'dish', 'dish' => $dish['id'], 'qty' => 2, 'note' => "sin <b>sal</b>\x07", 'price' => 0.01, 'hold' => true],
    ['kind' => 'dish', 'dish' => $post, 'qty' => 1, 'hold' => false],
]]);
ok(count($st['items']) === 2, 'el pedido llega a la mesa');
ok($st['items'][0]['price'] === (float)$dish['price'], 'el precio lo pone el servidor, no el móvil');
ok($st['items'][0]['status'] === 'nuevo' && $st['items'][1]['status'] === 'espera', 'el plato va a cocina y el postre queda en espera (aunque el móvil diga otra cosa)');
ok($st['items'][0]['note'] === 'sin <b>sal</b>', 'la nota se guarda como texto, sin caracteres de control');
$kt = sala_kitchen('cocina');
ok(count($kt['tickets']) >= 1 && $kt['tickets'][0]['by'] === 'Móvil (QR)', 'llega a la pantalla de cocina marcado como «Móvil (QR)»');
ok(str_contains(err(fn() => mesa_send($s, ['items' => [['kind' => 'special', 'name' => 'Langosta', 'price' => 0.5]]])), 'carta'), 'no se pueden pedir platos inventados con precio libre');
ok(str_contains(err(fn() => mesa_send($s, ['items' => [['kind' => 'dish', 'dish' => $dish['id'], 'qty' => 50]]])), 'demasiados'), 'límite de platos por envío');
ok(str_contains(err(fn() => mesa_send($s, ['items' => [['kind' => 'dish', 'dish' => 999999]]])), 'carta'), 'un plato que no existe no entra');
for ($i = 0; $i < 6; $i++) err(fn() => mesa_send($s, ['items' => [['kind' => 'dish', 'dish' => $dish['id']]]]));
ok(str_contains(err(fn() => mesa_send($s, ['items' => [['kind' => 'dish', 'dish' => $dish['id']]]])), 'seguidos'), 'límite de envíos por móvil');
reset_throttle();

echo "Avisos al camarero\n";
mesa_call($s, 'cuenta');
ok(sala_order_get($o['id'])['call']['type'] === 'cuenta', 'pedir la cuenta sale en el pedido de la sala');
sala_order_update($u, ['id' => $o['id'], 'call_done' => true]);
ok(sala_order_get($o['id'])['call'] === null, 'el camarero lo marca como atendido');

echo "Confirmar antes de cocina\n";
sala_prefs_save(['qr_confirm' => true]);
$s = mesa_session($j['token']);
$n = count(sala_order_get($o['id'])['items']);
$st = mesa_send($s, ['items' => [['kind' => 'dish', 'dish' => $dish['id']]]]);
$it = end($st['items']);
ok($it['status'] === 'pendiente', 'con «aceptar antes» el pedido espera al camarero');
$before = sala_order_total(sala_order_get($o['id']));
ok(!in_array($it['id'], array_merge(...array_map(fn($t) => array_column($t['items'], 'id'), sala_kitchen('cocina')['tickets']))), '…y no sale en la cocina');
$k = ['id' => 2, 'role' => 'cocina', 'dname' => 'Cocina'];
ok(err(fn() => sala_item_status($k, $it['id'], 'nuevo')) !== '', 'la cocina no puede aceptarlo por su cuenta');
sala_item_status($u, $it['id'], 'nuevo');
ok(sala_order_total(sala_order_get($o['id'])) > $before, 'al aceptarlo se suma a la cuenta y va a cocina');
sala_prefs_save(['qr_confirm' => false]);

echo "Cerrar y seguridad de la sesión\n";
$pin = $o['pin'];
sala_order_update($u, ['id' => $o['id'], 'new_pin' => true]);
ok(str_contains(err(fn() => mesa_session($j['token'])), 'MesaAuthError'), 'al cambiar el código, los móviles que había dentro tienen que volver a entrar');
$o = sala_order_get($o['id']);
ok($o['pin'] !== '' && preg_match('/^\d{4}$/', $o['pin']) === 1, 'código nuevo');
$j = mesa_join(['k' => $k1, 'pin' => $o['pin']]);
sala_order_update($u, ['id' => $o['id'], 'qr' => false]);
ok(str_contains(err(fn() => mesa_session($j['token'])), 'MesaAuthError') && mesa_info(['k' => $k1])['state'] === 'off', 'apagar el QR de una mesa');
sala_order_update($u, ['id' => $o['id'], 'qr' => true]);
$j = mesa_join(['k' => $k1, 'pin' => $o['pin']]);
sala_prefs_save(['qr_ips' => ['90.1.2.0/24']]);
ok(str_contains(err(fn() => mesa_session($j['token'])), 'wifi'), 'solo desde el wifi del local: desde otra IP no se puede');
sala_prefs_save(['qr_ips' => ['81.40.12.0/24', '2a01:db8::/32']]);
ok(mesa_session($j['token'])['order']['id'] === $o['id'], '…y desde la red del local sí');
ok(err(fn() => sala_prefs_save(['qr_ips' => ['no-es-ip']])) !== '', 'no se guardan IP mal escritas');
sala_prefs_save(['qr_ips' => []]);
$closed = sala_order_close($u, $o['id']);
ok(str_contains(err(fn() => mesa_session($j['token'])), 'MesaAuthError'), 'al cerrar la mesa, el móvil ya no puede pedir (aunque tenga una foto del QR)');
ok(!q('SELECT 1 FROM sala_guests WHERE order_id = ?', [$o['id']])->fetch(), 'y se borran sus sesiones');
$o3 = sala_order_open($u, ['tables' => ['t1']]);
ok(str_contains(err(fn() => mesa_join(['k' => $k1, 'pin' => $pin])), 'código') || $o3['pin'] === $pin, 'en la mesa siguiente el código de antes ya no vale');
q('UPDATE sala_guests SET created_at = ?', [date('Y-m-d H:i:s', time() - MESA_SESSION_MAX - 10)]);
$j = mesa_join(['k' => $k1, 'pin' => $o3['pin']]);
q('UPDATE sala_guests SET created_at = ?', [date('Y-m-d H:i:s', time() - MESA_SESSION_MAX - 10)]);
ok(str_contains(err(fn() => mesa_session($j['token'])), 'MesaAuthError'), 'una sesión de móvil caduca sola');
sala_prefs_save(['qr' => false]);
ok(mesa_info(['k' => $k1])['state'] === 'off', 'el encargado puede apagar los pedidos por QR en todo el local');

echo $fails ? "\n$fails pruebas han fallado\n" : "\nTodo bien\n";
exit($fails ? 1 : 0);
