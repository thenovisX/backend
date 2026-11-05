<?php
declare(strict_types=1);

/*
 * Router para el servidor de PHP (php -S) de la app de escritorio.
 * Hace lo mismo que los .htaccess de la web publicada: no deja abrir lib/, data/, config.php ni ejecutar
 * nada dentro de uploads/, y añade las cabeceras de seguridad. Además sirve /local/, la página de inicio
 * del ordenador del restaurante (solo se abre desde el propio ordenador).
 *
 * Lo arranca el lanzador:  php -S 0.0.0.0:8080 -t web escritorio/router.php
 */

$web = (string)($_SERVER['DOCUMENT_ROOT'] ?? '');
$path = rawurldecode((string)parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH));
$path = '/' . ltrim(str_replace('\\', '/', $path), '/');

function deny(int $code = 403): bool
{
    http_response_code($code);
    header('Content-Type: text/plain; charset=utf-8');
    echo $code === 404 ? 'No encontrado' : 'Prohibido';
    return true;
}

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: SAMEORIGIN');
header('Permissions-Policy: camera=(self), geolocation=(), microphone=()');

// Nada de rutas raras (.., archivos ocultos, flujos de PHP)
if (str_contains($path, '..') || str_contains($path, "\0") || preg_match('#/\.#', $path)) return deny();
// Lo mismo que web/.htaccess, web/lib/.htaccess y web/data/.htaccess
if (preg_match('#^/(.*/)?(lib|data)(/|$)#i', $path)) return deny();
if (preg_match('#(^|/)(config\.php|config\.sample\.php|[^/]*\.sqlite[^/]*)$#i', $path)) return deny();
// En uploads/ solo hay fotos: no se ejecuta nada (web/uploads/.htaccess)
if (preg_match('#^/uploads/.*\.(php\d?|phtml|phar|pl|py|cgi|sh)$#i', $path)) return deny();
// El instalador de la web no hace falta: la app crea la configuración ella sola
if (preg_match('#^/install\.php$#i', $path)) return deny(404);

// robots.txt y sitemap.xml (como en .htaccess)
if ($path === '/robots.txt') { $_SERVER['SCRIPT_NAME'] = '/robots.php'; require $web . '/robots.php'; return true; }
if ($path === '/sitemap.xml') { $_SERVER['SCRIPT_NAME'] = '/sitemap.php'; require $web . '/sitemap.php'; return true; }

// Página de inicio del ordenador del restaurante (direcciones y QR para conectar los móviles)
if ($path === '/local' || str_starts_with($path, '/local/')) {
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    if (!in_array($ip, ['127.0.0.1', '::1'], true)) return deny(404);
    require __DIR__ . '/local.php';
    return true;
}

// Carpetas: index.php o index.html (php -S lo hace solo, pero solo si la URL acaba en /)
$file = $web . $path;
if (is_dir($file)) {
    if (!str_ends_with($path, '/')) {
        $q = (string)($_SERVER['QUERY_STRING'] ?? '');
        header('Location: ' . $path . '/' . ($q !== '' ? '?' . $q : ''), true, 301);
        return true;
    }
    return false;
}
if (!is_file($file)) {
    // Rutas que no existen: la web pública decide (404 propio)
    if (!preg_match('#\.(css|js|png|jpe?g|webp|svg|ico|woff2?|ttf|webmanifest|json|txt|map)$#i', $path)) return false;
    return deny(404);
}

// Archivos estáticos y PHP: los sirve php -S tal cual
return false;
