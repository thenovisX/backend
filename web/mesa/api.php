<?php
declare(strict_types=1);

/*
 * API de los pedidos desde el móvil con el QR de la mesa (mesa/api.php?r=<ruta>). La lógica está en lib/mesa.php.
 * Sin CORS: solo la puede usar la página de la propia web (mesa/index.html). Sesión en la cabecera X-Mesa.
 */

require dirname(__DIR__) . '/lib/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");

if (!installed()) fail('La web aún no está instalada.', 503);
// Todos los móviles conectados al wifi del local comparten IP: límite propio
api_rate_limit('mesa', (int)(cfg()['rate_limit_mesa'] ?? 600));
lang('es');

$r = (string)($_GET['r'] ?? '');
$in = input();

try {
    switch ($r) {
        case 'info':
            only_post();
            out(mesa_info($in));
        case 'join':
            only_post();
            out(mesa_join($in));
    }
    $t = (string)($_SERVER['HTTP_X_MESA'] ?? '');
    $s = mesa_session($t);
    switch ($r) {
        case 'carta':
            out(mesa_carta());
        case 'status':
            out(mesa_status($s, (string)($_GET['rev'] ?? '')));
        case 'send':
            only_post();
            out(mesa_send($s, $in));
        case 'call':
            only_post();
            out(mesa_call($s, (string)($in['type'] ?? '')));
        case 'leave':
            only_post();
            q('DELETE FROM sala_guests WHERE token = ?', [$s['hash']]);
            out(true);
    }
    fail('Ruta desconocida', 404);
} catch (MesaAuthError $e) {
    fail($e->getMessage(), 401);
} catch (ValidationError $e) {
    fail($e->getMessage(), 422);
} catch (Throwable $e) {
    if (db()->inTransaction()) db()->rollBack();
    error_log('[restaurante] mesa: ' . $e);
    fail(!empty(cfg()['debug']) ? $e->getMessage() : 'Error en el servidor. Inténtalo de nuevo.', 500);
}
