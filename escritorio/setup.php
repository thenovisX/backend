<?php
declare(strict_types=1);

/*
 * Primera puesta en marcha de la app de escritorio (lo lanza el lanzador, no se abre en el navegador).
 * Hace lo mismo que web/install.php pero con SQLite y sin formulario web:
 *   - crea web/config.php (la dirección la pone el lanzador en cada arranque: RESTAURANTE_BASE_URL),
 *   - crea las tablas, el usuario del panel y una cuenta «Encargado» de Sala y cocina con los mismos datos,
 *   - opcionalmente, una carta de ejemplo.
 *
 * Datos por variables de entorno (para que la contraseña no salga en la lista de procesos):
 *   RM_WEB (carpeta web), RM_NAME, RM_USER, RM_PASS, RM_SAMPLE (1/0)
 * Sale con código 0 si todo va bien; si no, escribe el motivo y sale con 1.
 */

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }

$web = rtrim((string)getenv('RM_WEB'), '\\/');
$name = trim((string)getenv('RM_NAME')) ?: 'Mi restaurante';
$user = mb_strtolower(trim((string)getenv('RM_USER')));
$pass = (string)getenv('RM_PASS');
$sample = getenv('RM_SAMPLE') === '1';

function fail_setup(string $m): never { fwrite(STDOUT, $m . "\n"); exit(1); }

if ($web === '' || !is_file("$web/lib/core.php")) fail_setup('No encuentro la carpeta de la web.');
if (is_file("$web/config.php")) fail_setup('Ya está configurado.');
if (!preg_match('/^[a-z0-9._-]{3,40}$/', $user)) fail_setup('El usuario tiene que tener de 3 a 40 letras sin espacios (puede llevar números, puntos y guiones).');
if (strlen($pass) < 8) fail_setup('La contraseña necesita al menos 8 caracteres.');
if (!function_exists('sodium_crypto_secretbox')) fail_setup('Falta la extensión sodium de PHP.');
if (!class_exists('PDO') || !in_array('sqlite', PDO::getAvailableDrivers(), true)) fail_setup('Falta la extensión pdo_sqlite de PHP.');

if (!is_dir("$web/data")) mkdir("$web/data", 0755, true);
$secret = bin2hex(random_bytes(32));
$dbPath = "$web/data/restaurante.sqlite";
// config.php: la dirección para los QR y enlaces la da el lanzador en cada arranque (puede cambiar la IP)
$config = "<?php\n// Creado por la app de escritorio. No lo compartas: «secret» es la clave de cifrado de los datos.\nreturn [\n"
    . "    'db_driver' => 'sqlite',\n"
    . "    'db_path'   => __DIR__ . '/data/restaurante.sqlite',\n"
    . "    'timezone'  => 'Europe/Madrid',\n"
    . "    'secret'    => " . var_export($secret, true) . ",\n"
    . "    'base_url'  => (string)(getenv('RESTAURANTE_BASE_URL') ?: ''),\n"
    . "    'rate_limit' => 240,\n"
    . "    'rate_limit_sala' => 3000,   // todas las pantallas del local llegan desde la misma red\n"
    . "    'rate_limit_mesa' => 1200,\n"
    . "    'debug'     => false,\n"
    . "    'escritorio' => true,\n"
    . "];\n";

// Las funciones de la web leen config.php: se escribe primero en un temporal y se mueve al final
$tmp = "$web/config.php.tmp";
file_put_contents($tmp, $config);
try {
    rename($tmp, "$web/config.php");
    require "$web/lib/bootstrap.php";
    require_once "$web/lib/schema.php";
    $pdo = db();
    foreach (schema_sql(true) as $sql) {
        try { $pdo->exec($sql); } catch (PDOException $e) { if (!str_starts_with($sql, 'CREATE INDEX')) throw $e; }
    }
    $pdo->beginTransaction();
    $pdo->prepare('INSERT INTO users (username, pass_hash, created_at) VALUES (?, ?, ?)')
        ->execute([$user, pass_hash($pass), date('Y-m-d H:i:s')]);
    $pdo->exec('DELETE FROM settings');
    $set = $pdo->prepare('INSERT INTO settings (k, v) VALUES (?, ?)');
    $initial = SETTINGS_DEFAULTS;
    $initial['name'] = mb_substr($name, 0, 80);
    foreach ($initial as $k => $v) $set->execute([$k, json_encode($v, JSON_UNESCAPED_UNICODE)]);
    $set->execute(['_schema', (string)SCHEMA_VERSION]);
    if ($sample) {
        $ci = $pdo->prepare('INSERT INTO categories (name, position) VALUES (?, ?)');
        $di = $pdo->prepare('INSERT INTO dishes (category_id, name, description, price, allergens, photo, available, featured, position) VALUES (?,?,?,?,?,?,1,?,?)');
        $cp = 0;
        foreach (sample_menu() as $cat => $dishes) {
            $ci->execute([$cat, ++$cp]);
            $cid = (int)$pdo->lastInsertId();
            foreach ($dishes as $i => [$n, $d, $p, $a, $feat]) $di->execute([$cid, $n, $d, $p, $a, '', $feat, $i + 1]);
        }
    }
    $pdo->commit();
    // Cuenta de Sala y cocina para el dueño (encargado), con el mismo usuario y contraseña
    sala_user_save(['username' => 'instalacion'], ['username' => $user, 'name' => $name, 'role' => 'encargado', 'password' => $pass, 'active' => true]);
} catch (Throwable $e) {
    @unlink($tmp);
    @unlink("$web/config.php");
    @unlink($dbPath);
    fail_setup('No se pudo crear la base de datos: ' . $e->getMessage());
}
echo "ok\n";
exit(0);
