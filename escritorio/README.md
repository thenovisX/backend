# App de escritorio: mesas, pedidos y cocina en el ordenador del restaurante

Programa para Windows 10/11 que pone en marcha **Sala y cocina** (plano de mesas, pedidos, pantalla de cocina y barra) y los **pedidos por QR** en un ordenador del local. Los móviles y tablets del mismo wifi se conectan a ese ordenador: no hace falta la web publicada ni internet.

Es la misma web de `web/` (no hay código duplicado), servida por un PHP que va dentro de la app y con la base de datos en SQLite.

## Cómo funciona

| Pieza | Qué hace |
|---|---|
| `lanzador/Lanzador.cs` | La ventana de la app («Restaurante Mesas.exe»). La primera vez pide nombre, usuario y contraseña; luego arranca `php -S 0.0.0.0:8080`, enseña la dirección para los móviles, se queda junto al reloj, vuelve a arrancar el servidor si se cae y puede arrancar sola con Windows. |
| `setup.php` | Primera puesta en marcha (lo lanza el lanzador): crea `web/config.php` con SQLite y una clave de cifrado nueva, las tablas, el usuario del panel y una cuenta **Encargado** de Sala y cocina con los mismos datos, y opcionalmente la carta de ejemplo. |
| `router.php` | Hace de `.htaccess`: bloquea `lib/`, `data/`, `config.php`, los `.sqlite` y cualquier script en `uploads/`; cierra `install.php`; añade las cabeceras de seguridad. |
| `local.php` | Página `http://127.0.0.1:8080/local/` (solo desde el propio ordenador) con las direcciones y sus QR para conectar los móviles. |
| `php.ini` | Extensiones que usa la web: pdo_sqlite, sodium, mbstring, gd, curl, openssl, fileinfo, exif y opcache. |
| `instalador.iss` | Instalador (Inno Setup). Se instala para el usuario, sin administrador, en `%LOCALAPPDATA%\Programs\Restaurante Mesas`. Opciones: acceso directo, arrancar con Windows y regla del firewall (solo red local). |
| `build.ps1` | Lo compila todo. |

**La dirección de los QR.** `config.php` lee `base_url` de la variable `RESTAURANTE_BASE_URL`, que pone el lanzador en cada arranque (`http://<IP del ordenador>:<puerto>`). Por defecto la IP es automática; si el router cambia la IP del ordenador, los QR impresos dejan de valer, así que conviene reservarle una IP fija en el router o escribirla en «Ajustes».

**Datos.** Todo queda en la carpeta de la app: `web/data/restaurante.sqlite`, `web/config.php` (la clave de cifrado) y `web/uploads/`. El instalador no los toca al actualizar ni al desinstalar. Registro del servidor: `web/data/servidor.log`.

**Límites.** El servidor de PHP atiende las peticiones de una en una. Para un local con la cocina, unos cuantos camareros y los móviles de los clientes va sobrado (cada petición tarda milisegundos y las pantallas solo descargan datos cuando algo cambia), pero no es para cientos de conexiones a la vez. Sin HTTPS en la red local, el navegador no deja mantener la pantalla encendida (wake lock) ni las notificaciones del panel; todo lo demás funciona igual.

## Compilar

```powershell
winget install --id JRSoftware.InnoSetup -e --scope user   # una vez, para el instalador
powershell -ExecutionPolicy Bypass -File escritorio\build.ps1 -Version 1.0.0
```

Descarga el PHP oficial de windows.php.net (comprobado con su SHA-256) en `escritorio/vendor/`, compila el lanzador con el `csc.exe` de .NET Framework 4 que trae Windows y deja en `escritorio/dist/`:

- `Instalar-Restaurante-Mesas-1.0.0.exe`: el instalador.
- `Restaurante-Mesas-portatil-1.0.0.zip`: la misma app sin instalar (se descomprime y se abre `Restaurante Mesas.exe`).

`vendor/` y `dist/` no se suben al repositorio.
