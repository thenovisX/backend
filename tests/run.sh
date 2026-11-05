#!/usr/bin/env bash
# Lanza las pruebas en una copia temporal de web/ con SQLite (no toca nada de la web real).
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cp -r web "$tmp/web"
rm -f "$tmp/web/config.php"
cat > "$tmp/web/config.php" <<PHP
<?php return ['db_driver' => 'sqlite', 'db_path' => '$tmp/test.sqlite', 'timezone' => 'Europe/Madrid', 'secret' => 'pruebas-$(date +%s)', 'debug' => true];
PHP
php tests/sala_test.php "$tmp/web"
