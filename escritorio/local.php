<?php
declare(strict_types=1);

/*
 * Página de inicio del ordenador del restaurante: http://127.0.0.1:<puerto>/local/
 * Solo se abre desde el propio ordenador (lo comprueba router.php). Enseña las direcciones para los móviles
 * y tablets del local, con un QR para no tener que escribirlas.
 */

$web = (string)$_SERVER['DOCUMENT_ROOT'];
require $web . '/lib/bootstrap.php';
require_once $web . '/lib/qr.php';

$base = base_url();
$links = [
    ['Sala y pedidos', 'Para los camareros: el plano de mesas y los pedidos.', $base . '/sala/'],
    ['Cocina y barra', 'Para la pantalla o tablet de la cocina (entra con una cuenta «Cocina»).', $base . '/sala/'],
    ['Panel', 'La carta, los ajustes y las cuentas de Sala y cocina.', $base . '/panel/'],
];
$local = 'http://127.0.0.1:' . (int)($_SERVER['SERVER_PORT'] ?? 8080);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Restaurante · Mesas y cocina en este ordenador</title>
<style>
  body { font: 16px/1.5 system-ui, sans-serif; background: #F2F4F3; color: #14313F; margin: 0; padding: 24px 16px; }
  main { max-width: 980px; margin: 0 auto; }
  h1 { font-size: 1.6rem; margin: 0 0 4px; }
  .sub { color: #4C6470; margin: 0 0 20px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
  .card { background: #fff; border: 1px solid #D6DBD8; border-radius: 14px; padding: 18px; }
  .card h2 { font-size: 1.15rem; margin: 0 0 4px; }
  .card p { margin: 0 0 10px; color: #4C6470; font-size: .95rem; }
  .qr svg { width: 100%; max-width: 220px; height: auto; display: block; margin: 8px auto; }
  .url { font-family: ui-monospace, Consolas, monospace; font-size: .95rem; word-break: break-all; background: #F2F4F3; padding: 6px 8px; border-radius: 8px; }
  a.btn { display: inline-block; margin-top: 10px; background: #14313F; color: #fff; text-decoration: none; padding: 8px 14px; border-radius: 8px; }
  .note { background: #FFF6E0; border: 1px solid #F0D9A0; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: .95rem; }
  .note li { margin: 4px 0; }
</style>
</head>
<body>
<main>
  <h1>Mesas, pedidos y cocina en este ordenador</h1>
  <p class="sub">Los móviles y tablets tienen que estar conectados al <strong>mismo wifi</strong> que este ordenador. Escanea el QR con la cámara o escribe la dirección en el navegador.</p>
  <div class="grid">
    <?php foreach ($links as [$title, $desc, $url]): ?>
    <section class="card">
      <h2><?= h($title) ?></h2>
      <p><?= h($desc) ?></p>
      <div class="qr"><?= qr_svg($url, 'QR de ' . $title) ?></div>
      <div class="url"><?= h($url) ?></div>
      <a class="btn" href="<?= h($local . parse_url($url, PHP_URL_PATH)) ?>">Abrir aquí</a>
    </section>
    <?php endforeach; ?>
  </div>
  <div class="note">
    <strong>Para empezar</strong>
    <ol>
      <li>Entra en el <strong>Panel</strong> con el usuario que creaste al instalar. Pon tu carta y, en Ajustes → Cuenta → <strong>Sala y cocina</strong>, crea las cuentas de los camareros y de la cocina.</li>
      <li>Con el mismo usuario puedes entrar ya en <strong>Sala y pedidos</strong> como encargado y dibujar el plano.</li>
      <li>Los QR de cada mesa se imprimen en Sala y cocina → Preferencias → «Pedidos desde el móvil (QR)».</li>
      <li>Los QR impresos llevan la dirección <span class="url"><?= h($base) ?></span>. Si el router le cambia la dirección a este ordenador, dejarían de funcionar: pide que le reserven siempre la misma IP (o elige una dirección fija en el lanzador).</li>
    </ol>
  </div>
</main>
</body>
</html>
