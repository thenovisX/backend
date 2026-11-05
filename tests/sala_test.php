<?php
declare(strict_types=1);
/*
 * Pruebas de «Sala y cocina» con una base de datos SQLite de usar y tirar.
 * Se lanzan con:  bash tests/run.sh   (copia web/ a una carpeta temporal con su config.php)
 */
$web = $argv[1] ?? '';
if (!is_file("$web/config.php")) { fwrite(STDERR, "Uso: php tests/sala_test.php <carpeta web con config.php>\n"); exit(2); }
require "$web/lib/bootstrap.php";
require_once "$web/lib/schema.php";
foreach (schema_sql(true) as $sql) { try { db()->exec($sql); } catch (Throwable $e) {} }
q("INSERT INTO settings (k, v) VALUES ('_schema', ?)", [(string)SCHEMA_VERSION]);
q("INSERT INTO settings (k, v) VALUES ('table_minutes', '90')");
foreach (sample_menu() as $cat => $dishes) {
    q('INSERT INTO categories (name, position) VALUES (?, 0)', [$cat]);
    $cid = (int)db()->lastInsertId();
    foreach ($dishes as [$n, $d, $p, $a]) q("INSERT INTO dishes (category_id, name, description, price, allergens) VALUES (?,?,?,?,?)", [$cid, $n, $d, $p, $a]);
}

$fails = 0;
function ok(bool $c, string $m): void { global $fails; echo ($c ? "  ok  " : "  MAL ") . $m . "\n"; if (!$c) $fails++; }
function res(string $time, int $people, string $status = 'confirmada', string $date = ''): int {
    $date = $date ?: date('Y-m-d', strtotime('+1 day'));
    q("INSERT INTO reservations (name, phone, rdate, rtime, people, notes, status, source, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [enc('Cliente'), enc('600000000'), $date, $time, $people, enc(''), $status, 'panel', now(), now()]);
    $id = (int)db()->lastInsertId();
    sala_on_reservation($id);
    return $id;
}
function tables_of(int $id): array {
    $v = q('SELECT data FROM sala_assign WHERE reservation_id = ?', [$id])->fetchColumn();
    return $v === false ? [] : (json_decode(dec($v), true)['tables'] ?? []);
}

echo "Plano\n";
$l = sala_layout();
ok(count($l['floors']) === 1 && count($l['tables']) === 7, 'plano de ejemplo con una planta y mesas');
ok(sala_kv_get('layout') === null, 'el plano de ejemplo no se guarda hasta editarlo');
$l['floors'][] = ['id' => 'f2', 'name' => 'Terraza', 'level' => 1, 'w' => 800, 'h' => 500, 'shape' => [[0, 0], [800, 0], [800, 500], [0, 500]]];
$l['tables'][] = ['id' => 't7', 'floor' => 'f2', 'kind' => 'mesa', 'name' => 'T1', 'shape' => 'round', 'x' => 50, 'y' => 50, 'w' => 80, 'h' => 80, 'r' => 30, 'seats' => 8, 'auto' => false];
$saved = sala_layout_save($l);
ok($saved['rev'] === 2 && count($saved['floors']) === 2, 'guardar plano con una planta nueva');
$t7 = array_values(array_filter($saved['tables'], fn($t) => $t['id'] === 't7'))[0];
ok($t7['r'] === 30, 'el giro de una mesa se guarda');
$raw = (string)q("SELECT v FROM sala_kv WHERE k = 'layout'")->fetchColumn();
ok(str_starts_with($raw, ENC_PREFIX) && !str_contains($raw, 'Terraza'), 'el plano se guarda cifrado');
try { sala_layout_save($l); ok(false, 'guardar con una versión vieja falla'); } catch (ValidationError $e) { ok(true, 'guardar con una versión vieja falla'); }
$bad = $saved; $bad['groups'] = [['id' => 'gx', 'tables' => ['t1', 't7']]];
try { sala_layout_save($bad); ok(false, 'no se fusionan mesas de plantas distintas'); } catch (ValidationError $e) { ok(true, 'no se fusionan mesas de plantas distintas'); }

echo "Asignación automática\n";
$a = res('21:00', 2);
ok(tables_of($a) === ['t1'], '2 personas → la mesa de 2 más ajustada (t1)');
$b = res('21:00', 2);
ok(tables_of($b) === ['t2'], 'otra de 2 a la misma hora → t2');
$c = res('21:30', 4);
ok(count(tables_of($c)) === 1 && in_array(tables_of($c)[0], ['t3', 't4', 't5'], true), '4 personas → una mesa de 4');
$d = res('21:00', 8);
$td = tables_of($d);
sort($td);
ok(count($td) >= 2, '8 personas sin mesa de 8 (la de la terraza no es automática) → se juntan mesas: ' . implode('+', $td));
$e = res('23:00', 2);
ok(tables_of($e) === ['t1'], 'a las 23:00 la t1 vuelve a estar libre (tiempo de mesa 90 min)');
q("UPDATE reservations SET status = 'cancelada' WHERE id = ?", [$a]);
sala_on_reservation($a);
ok(tables_of($a) === [], 'cancelar libera la mesa');
$f = res('21:15', 2);
ok(tables_of($f) === ['t1'], 'y la siguiente la aprovecha');
sala_prefs_save(['assign' => 'confirmar']);
$g = res('14:00', 2, 'pendiente');
ok(tables_of($g) === [], 'modo «al confirmar»: una petición pendiente no coge mesa');
q("UPDATE reservations SET status = 'confirmada' WHERE id = ?", [$g]);
sala_on_reservation($g);
ok(tables_of($g) !== [], '…y al confirmarla sí');
sala_prefs_save(['assign' => 'crear', 'merge' => false]);
$h = res('21:00', 12);
ok(tables_of($h) === [], 'sin permitir juntar mesas, 12 personas se quedan sin mesa');
sala_prefs_save(['merge' => true]);
ok(sala_assign_manual($h, ['t7']) === ['t7'], 'asignar a mano una mesa concreta');
try { sala_assign_manual($b, ['t1']); ok(false, 'no deja asignar a mano una mesa ocupada'); } catch (ValidationError $e) { ok(true, 'no deja asignar a mano una mesa ocupada'); }
$raw = (string)q('SELECT data FROM sala_assign WHERE reservation_id = ?', [$h])->fetchColumn();
ok(str_starts_with($raw, ENC_PREFIX), 'las asignaciones van cifradas');
ok(sala_res_label($b, date('Y-m-d', strtotime('+1 day'))) === '2', 'el panel ve el nombre de la mesa');

echo "Pedidos y cocina\n";
q("INSERT INTO sala_users (username, name, pass_hash, role, active, created_at) VALUES ('laura', ?, ?, 'camarero', 1, ?)", [enc('Laura'), pass_hash('secreto123'), now()]);
$u = ['id' => 1, 'role' => 'camarero', 'dname' => 'Laura'];
$k = ['id' => 2, 'role' => 'cocina', 'dname' => 'Cocina'];
$o = sala_order_open($u, ['tables' => ['t4'], 'people' => 3]);
ok($o['status'] === 'abierta' && $o['tables'] === ['t4'], 'abrir la mesa t4');
try { sala_order_open($u, ['tables' => ['t4']]); ok(false, 'no se abre dos veces la misma mesa'); } catch (ValidationError $e) { ok(true, 'no se abre dos veces la misma mesa'); }
$dish = q('SELECT id, price FROM dishes ORDER BY id LIMIT 1')->fetch();
$post = q("SELECT d.id FROM dishes d JOIN categories c ON c.id = d.category_id WHERE c.name = 'Dulces' LIMIT 1")->fetchColumn();
$o = sala_order_add($u, ['id' => $o['id'], 'items' => [
    ['kind' => 'dish', 'dish' => $dish['id'], 'qty' => 2, 'note' => 'sin limón', 'price' => 0.01],
    ['kind' => 'dish', 'dish' => $post, 'qty' => 1, 'hold' => true],
    ['kind' => 'special', 'name' => 'Lubina del día', 'price' => 21.5, 'course' => 2],
]]);
ok(count($o['items']) === 3, 'añadir 3 platos');
ok($o['items'][0]['price'] === (float)$dish['price'], 'el precio sale de la carta, no del navegador');
ok($o['items'][1]['status'] === 'espera' && $o['items'][1]['course'] === 3, 'el postre queda en espera y va en el pase de postres');
$raw = (string)q('SELECT data FROM sala_items LIMIT 1')->fetchColumn();
ok(str_starts_with($raw, ENC_PREFIX) && !str_contains($raw, 'limón'), 'los platos y las notas van cifrados');
$kt = sala_kitchen('cocina');
ok(count($kt['tickets']) === 2 && !$kt['tickets'][0]['hold'] && $kt['tickets'][1]['hold'], 'cocina: una comanda en marcha y otra en espera');
ok($kt['tickets'][0]['items'][0]['note'] === 'sin limón', 'la cocina ve la nota');
sala_item_status($k, $o['items'][0]['id'], 'listo');
try { sala_item_status($k, $o['items'][0]['id'], 'anulado'); ok(false, 'la cocina no puede anular'); } catch (Throwable $e) { ok(true, 'la cocina no puede anular'); }
$o = sala_order_fire($u, $o['id'], 3);
ok($o['items'][1]['status'] === 'nuevo', 'marchar postres los manda a la cocina');
$o = sala_order_close($u, $o['id']);
ok($o['status'] === 'cerrada' && abs($o['total'] - (2 * $dish['price'] + 21.5 + $o['items'][1]['price'])) < 0.01, 'cerrar la mesa calcula el total');
ok(sala_kitchen('cocina')['tickets'] === [], 'al cerrar, la cocina ya no ve la mesa');
$o2 = sala_order_open($u, ['tables' => ['t4', 't5']]);
ok($o2['tables'] === ['t4', 't5'], 'la mesa vuelve a estar libre y se puede abrir junta con otra');

echo "Cuentas\n";
$tok = sala_login(['username' => 'laura', 'password' => 'secreto123']);
ok(strlen($tok['token']) === 64, 'entrar con una cuenta de sala');
try { sala_login(['username' => 'laura', 'password' => 'mal']); ok(false, 'contraseña mala'); } catch (ValidationError $e) { ok(true, 'contraseña mala rechazada'); }
ok(!q('SELECT 1 FROM tokens')->fetch(), 'una sesión de sala no es una sesión del panel');
ok(str_starts_with((string)q("SELECT name FROM sala_users WHERE username = 'laura'")->fetchColumn(), ENC_PREFIX), 'el nombre de la cuenta va cifrado');

echo $fails ? "\n$fails pruebas han fallado\n" : "\nTodo bien\n";
exit($fails ? 1 : 0);
