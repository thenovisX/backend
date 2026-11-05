<?php
declare(strict_types=1);

/*
 * API de «Sala y cocina» (sala/api.php?r=<ruta>). Va aparte de la API del panel:
 * usa sus propias cuentas y sesiones (cabecera X-Token, que da r=login).
 */

require dirname(__DIR__) . '/lib/bootstrap.php';

cors_headers();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if (!installed()) fail('La web aún no está instalada.', 503);
// Las pantallas de la sala consultan cada pocos segundos y suelen compartir la IP del local: límite propio y más alto
api_rate_limit('sala', (int)(cfg()['rate_limit_sala'] ?? 1200));
lang('es');

$r = (string)($_GET['r'] ?? '');
$in = input();
$id = (int)($in['id'] ?? $_GET['id'] ?? 0);

try {
    if ($r === 'login') {
        only_post();
        out(sala_login($in));
    }

    $u = sala_auth();
    $all = ['encargado', 'camarero', 'cocina'];
    $sala = ['encargado', 'camarero'];
    switch ($r) {
        case 'me':
            out(['me' => sala_user_out($u), 'restaurant' => settings()['name'], 'today' => today()]);
        case 'logout':
            only_post();
            sala_logout();
            out(true);

        /* Sala */
        case 'state':
            sala_require($u, ...$sala);
            out(sala_state((string)($_GET['date'] ?? today()), (string)($_GET['rev'] ?? '')));
        case 'carta':
            sala_require($u, ...$sala);
            out(sala_carta());
        case 'order':
            sala_require($u, ...$sala);
            out(sala_order_get($id));
        case 'order_open':
            only_post();
            sala_require($u, ...$sala);
            out(sala_order_open($u, $in));
        case 'order_update':
            only_post();
            sala_require($u, ...$sala);
            out(sala_order_update($u, $in));
        case 'order_add':
            only_post();
            sala_require($u, ...$sala);
            out(sala_order_add($u, $in));
        case 'order_fire':
            only_post();
            sala_require($u, ...$sala);
            out(sala_order_fire($u, $id, (int)($in['course'] ?? -1)));
        case 'order_close':
            only_post();
            sala_require($u, ...$sala);
            out(sala_order_close($u, $id));
        case 'order_reopen':
            only_post();
            sala_require($u, ...$sala);
            out(sala_order_reopen($u, $id));
        case 'closed_today':
            sala_require($u, ...$sala);
            out(['orders' => sala_orders_closed_today()]);
        case 'assign_set':
            only_post();
            sala_require($u, ...$sala);
            out(['tables' => sala_assign_manual((int)($in['reservation'] ?? 0), (array)($in['tables'] ?? []))]);
        case 'assign_auto':
            only_post();
            sala_require($u, ...$sala);
            out(['tables' => sala_assign_auto((int)($in['reservation'] ?? 0))]);

        /* Cocina y barra */
        case 'kitchen':
            sala_require($u, ...$all);
            $dest = (string)($_GET['dest'] ?? 'cocina');
            $rev = sala_rev();
            if (($since = (string)($_GET['rev'] ?? '')) !== '' && hash_equals($rev, $since)) out(['rev' => $rev, 'same' => true]);
            $l = sala_layout();
            out(['rev' => $rev, 'names' => array_column($l['tables'], 'name', 'id')] + sala_kitchen($dest));
        case 'item_status':
            only_post();
            sala_require($u, ...$all);
            if (!empty($in['ids'])) out(['n' => sala_items_status($u, (array)$in['ids'], (string)($in['status'] ?? ''))]);
            out(sala_item_status($u, $id, (string)($in['status'] ?? '')));

        /* Plano y preferencias (encargado) */
        case 'layout_save':
            only_post();
            sala_require($u, 'encargado');
            out(sala_layout_save($in));
        case 'prefs':
            sala_require($u, 'encargado');
            $cats = array_map(fn($c) => ['id' => (int)$c['id'], 'name' => $c['name']], q('SELECT id, name FROM categories ORDER BY position, id')->fetchAll());
            out(['prefs' => sala_prefs(), 'categories' => $cats, 'table_minutes' => (int)(settings()['table_minutes'] ?? 0)]);
        case 'prefs_save':
            only_post();
            sala_require($u, 'encargado');
            out(['prefs' => sala_prefs_save($in)]);
    }
    fail('Ruta desconocida', 404);
} catch (ValidationError $e) {
    fail($e->getMessage(), 422);
} catch (Throwable $e) {
    if (db()->inTransaction()) db()->rollBack();
    error_log('[restaurante] sala: ' . $e);
    fail(!empty(cfg()['debug']) ? $e->getMessage() : 'Error en el servidor. Inténtalo de nuevo.', 500);
}
