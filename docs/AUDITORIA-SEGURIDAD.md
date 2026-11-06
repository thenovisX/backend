# Auditoría de seguridad (29 de octubre de 2026)

Revisión de código y arquitectura de la web del restaurante (PHP 8.1 sin framework, API en `web/api/index.php`, lógica en `web/lib/`, panel/app en `app/www` → `web/panel`). Para cada comprobación se indica el estado **antes** de esta revisión, el archivo afectado, la severidad y lo que se ha corregido.

Severidad: **Crítica** (compromiso directo y fácil) · **Alta** (compromiso de cuentas o datos con condiciones realistas) · **Media** (requiere condiciones concretas o tiene impacto limitado) · **Baja** (endurecimiento / buenas prácticas).

## Resumen

| # | Comprobación | Antes | Severidad | Ahora |
|---|---|---|---|---|
| 1 | Hashing de contraseñas | bcrypt coste 10 (`PASSWORD_DEFAULT`) | Baja | ✅ Argon2id (o bcrypt 12) y rehash automático al entrar |
| 2 | Flags de cookies/tokens | ✅ Cookie `HttpOnly`, `Secure`, `SameSite=Lax`; panel con token por cabecera | — | ✅ Sin cambios |
| 3 | Tokens de recuperación | ✅ 256 bits, 1 h, un solo uso, solo se guarda la huella | — | ✅ Sin cambios |
| 4 | Cierre de sesión / rotación | Las sesiones de cliente seguían vivas tras cambiar o recuperar la contraseña; tokens del panel sin caducidad absoluta | **Alta** | ✅ Corregido |
| 5 | IDOR en reservas | ✅ Todo filtra por `customer_id` o por token secreto | — | ✅ Sin cambios |
| 6 | Separación de roles | Empleados sin permiso de ajustes veían la URL del cron con su clave | Media | ✅ Corregido |
| 7 | Protección de endpoints | ✅ Toda ruta de gestión pasa por `require_auth()` y `require_perm()`/`require_admin()` | — | ✅ Sin cambios |
| 8 | SQL injection | ✅ Todas las consultas con sentencias preparadas (PDO) | — | ✅ Sin cambios |
| 9 | XSS | ✅ Escapado con `h()`/`esc()`/`textContent`; sin CSP | Media | ✅ CSP con nonce añadida |
| 10 | CSRF | ✅ `SameSite=Lax` + comprobación de `Origin` | Baja | ✅ También `Sec-Fetch-Site` |
| 11 | Reservas concurrentes | Comprobar aforo y guardar no era atómico: sobre-reserva en MySQL, error 500 en SQLite | **Alta** | ✅ Bloqueo en base de datos |
| 12 | Precios de la carta | ✅ No hay pedidos ni pagos; precios solo desde el panel y validados en servidor | — | ✅ Sin cambios |
| 13 | APIs de terceros | ✅ Tokens de Meta, Google y SMTP cifrados en servidor y nunca enviados al panel | — | ✅ Sin cambios |
| 14 | Fuerza bruta | Límite solo por IP (ataques repartidos sin tope); altas y reenvíos sin límite (bombardeo de emails); enumeración de cuentas por tiempo de respuesta y en el registro | **Alta** | ✅ Corregido |
| 15 | Spam de reservas | Solo 5/hora por IP | Media | ✅ +10/día por IP y máx. 3 activas por email/cuenta |
| 16 | Rate limiting global | No había | Media | ✅ 240 peticiones/min por IP en la API |
| 17 | Datos mínimos (PII) | ✅ Nombre y teléfono obligatorios; email opcional; datos cifrados y borrados a las 24 h | — | ✅ Sin cambios |
| 18 | Fuga de datos en la API | ✅ Sin huellas ni tokens en las respuestas | — | ✅ Sin cambios |
| 19 | Logs | Trazas de error podían incluir argumentos (contraseñas); con `debug` se registraban enlaces con tokens | Baja | ✅ Corregido |
| 20 | Gestión de secretos | ✅ `config.php` fuera de git y bloqueado por `.htaccess`; secretos de terceros cifrados en BD | — | ✅ Secreto nuevo de 256 bits en instalaciones nuevas |
| 21 | CORS | `Access-Control-Allow-Origin: *` | Media | ✅ Lista blanca |
| 22 | Cabeceras HTTP | ✅ HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy en `.htaccess`; **faltaba CSP** | Media | ✅ CSP en web, API y panel |
| — | Extra: reinstalación | `install.php` se podía volver a ejecutar si la BD fallaba | **Alta** | ✅ Bloqueado si existe `config.php` |
| — | Extra: Host header | Enlaces de email construidos con la cabecera `Host` | Media | ✅ `base_url` fijo en `config.php` |
| — | Extra: borrado de archivos | `remove_upload()` aceptaba `uploads/../…` | Baja | ✅ Solo nombres sueltos de `uploads/` |

## 1. Autenticación y gestión de sesiones

### 1.1 Hashing de contraseñas · Baja · corregido
- **Antes:** `password_hash($pass, PASSWORD_DEFAULT)` (bcrypt coste 10) en `web/lib/auth.php`, `clientes.php`, `recuperar.php` e `install.php`.
- **Riesgo:** bcrypt 10 es aceptable pero está por debajo de lo recomendado hoy (OWASP: Argon2id, o bcrypt ≥ 12).
- **Corrección:** `pass_hash()` / `pass_needs_rehash()` / `pass_verify()` en `web/lib/core.php`. Usa Argon2id si PHP lo incluye y si no bcrypt coste 12. Al entrar, las huellas antiguas se rehacen solas, así que nadie tiene que cambiar su contraseña.

### 1.2 Cookies y tokens · cumple
- Clientes: sesión PHP con cookie `HttpOnly`, `Secure` (si hay HTTPS), `SameSite=Lax`, `use_strict_mode` y `session_regenerate_id()` al entrar (`web/lib/clientes.php`, `customer_session()`).
- Panel: token aleatorio de 256 bits enviado en la cabecera `X-Token` (no es cookie, así que no hay CSRF). En BD solo se guarda su SHA-256. El token vive en `localStorage` de la app; por eso es importante la CSP (punto 3.2).

### 1.3 Recuperación de cuenta · cumple
- `web/lib/recuperar.php`: token de 256 bits, válido 60 min, de un solo uso (marcado de forma atómica con `UPDATE … WHERE used_at IS NULL`), solo se guarda la huella, pedir otro anula el anterior y la respuesta no revela si la cuenta existe.

### 1.4 Cierre de sesión y rotación · **Alta** · corregido
- **Antes:** cambiar la contraseña desde «Mi cuenta» o recuperarla por email **no cerraba las demás sesiones del cliente** (sesiones PHP en archivos que no se podían enumerar). Quien hubiera robado la sesión seguía dentro después de que la víctima cambiara la contraseña. Los tokens del panel solo caducaban por inactividad (90 días): un token robado y usado de vez en cuando no caducaba nunca.
- **Corrección:**
  - `current_customer()` compara una huella de la contraseña guardada en la sesión (`$_SESSION['pv']`, `pass_fingerprint()`). Si la contraseña cambia, las demás sesiones dejan de valer al momento. La sesión desde la que se cambia sigue, con identificador nuevo.
  - `require_auth()` (`web/lib/auth.php`): caducidad absoluta de 180 días (`TOKEN_MAX_DAYS`) además de los 90 de inactividad; el token caducado se borra.
  - Ya existía y se mantiene: logout borra el token/sesión en servidor y la cookie; recuperar la contraseña del panel borra todos sus tokens.

## 2. Control de acceso y autorización

### 2.1 IDOR · cumple
- Cliente: `customer_cancel()`, `customer_confirm()`, `customer_reservations()` y `customer_export()` filtran por `customer_id` de la sesión (`WHERE id = ? AND customer_id = ?`). Cambiar el id en el payload no da acceso a reservas ajenas.
- Enlaces de WhatsApp/email (`confirmar.php`, `borrar-datos.php`): necesitan un token secreto de 128/256 bits comparado con `hash_equals()`.

### 2.2 Separación de roles · Media · corregido
- Roles: **cliente** (sesión de la web, solo sus datos), **empleado** (`staff` con permisos `reservas`, `carta`, `ajustes`) y **administrador** (usuarios, clientes y borrados RGPD).
- **Fallo:** `GET api/?r=settings` lo podía leer cualquier empleado, aunque no tuviera el permiso de ajustes, e incluía `cron_url` con la clave del cron. **Corregido** en `web/api/index.php`: sin `ajustes` no se envían `cron_url`, `smtp_error` ni `wa_error`.
- Decisión de diseño (informativa): todos los empleados pueden **ver** reservas con teléfono y notas, porque las necesitan para atender. Si se quisiera restringir, habría que añadir un permiso «ver datos de contacto».

### 2.3 Protección de endpoints · cumple
- `web/api/index.php`: las rutas públicas van antes de `require_auth()`; las de gestión, después, y cada escritura llama a `only_post()` + `require_perm()` o `require_admin()`. Las de cliente usan `require_customer()` + `same_origin_only()`.

## 3. Validación de entradas y sanitización

### 3.1 SQL / NoSQL injection · cumple
- `q()` en `web/lib/core.php` usa siempre `prepare()` + `execute()`. Las únicas interpolaciones son constantes del código (listas de `?` y nombres de tabla fijos).

### 3.2 XSS · Media · reforzado
- **Estado:** el servidor escapa con `h()` (`htmlspecialchars`, `ENT_QUOTES`) y `json_encode(..., JSON_HEX_TAG)`; el panel usa `esc()` en todas las plantillas con datos de clientes (nombres, notas, descripciones) y `textContent` en avisos. No se ha encontrado ningún XSS explotable.
- **Faltaba** una segunda barrera: no había Content-Security-Policy, y un XSS en el panel podría robar el token de `localStorage`.
- **Corrección:**
  - Web: `send_csp()` (`web/lib/core.php`, se envía desde `web/lib/pagina.php`). Solo scripts propios, los que llevan nonce por petición y los de Google Analytics/Tag Manager y el píxel de Meta (que solo se cargan con consentimiento); `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'`.
  - El único manejador en línea (`onsubmit` de `confirmar.php`) pasa a `data-confirm` gestionado por `web/sdk/restaurante.js`.
  - API: `default-src 'none'; frame-ancestors 'none'`.
  - Panel (`app/www/index.html` y `web/panel/index.html`): CSP en `<meta>` con `script-src 'self'`.
  - Opciones en `config.php`: `'csp' => false` la quita; `'csp_report_only' => true` solo avisa.

### 3.3 CSRF · Baja · reforzado
- Cookies `SameSite=Lax` + `same_origin_only()` en todas las rutas de cliente que cambian algo. Ahora, si el navegador no manda `Origin`, también se rechaza `Sec-Fetch-Site: cross-site/same-site`. El panel usa cabecera `X-Token`, inmune a CSRF. `confirmar.php` y `borrar-datos.php` funcionan con token secreto en el formulario.

## 4. Lógica de negocio y condiciones de carrera

### 4.1 Reservas concurrentes · **Alta** · corregido
- **Antes:** `create_public_reservation()` (`web/lib/reservas.php`) abría una transacción, leía el aforo con `day_slots()` y luego insertaba. En MySQL/InnoDB (REPEATABLE READ) dos peticiones simultáneas leen el mismo aforo libre y **las dos se guardan: sobre-reserva**. En SQLite la segunda fallaba con «database is locked» (error 500).
- **Corrección:** `reservation_lock()` modifica una fila fija de `settings` (`_res_lock`) al empezar la transacción. En MySQL deja la fila bloqueada hasta el commit; en SQLite coge el bloqueo de escritura. La segunda petición espera y ya ve las plazas ocupadas.
- **Prueba:** aforo 4, cuatro peticiones simultáneas de 2 personas a la misma hora → 2 aceptadas, 2 «Esa hora ya está completa», total 4 personas.

### 4.2 Carta y precios · cumple
- No hay pedidos ni pagos online: la carta solo se muestra. Los precios solo los cambia el panel con permiso `carta` y se validan en servidor (`save_dish()`, `menu_save()`: 0–9999, redondeo a 2 decimales). El cliente nunca envía precios.

### 4.3 Llamadas / APIs de terceros · cumple
- No hay WebRTC ni telefonía tipo Twilio; las llamadas son enlaces `tel:` y `wa.me`. La API de WhatsApp (Meta), Google Translate y SMTP se llaman solo desde el servidor (`web/lib/whatsapp.php`, `traductor.php`, `core.php`). Sus claves se guardan cifradas con libsodium y `settings_admin()` las vacía antes de mandar los ajustes al panel.

## 5. Rate limiting y prevención de abuso

### 5.1 Fuerza bruta · **Alta** · corregido
- **Antes:** login del panel y de clientes: 10 fallos por IP cada 15 min. Un ataque repartido entre muchas IP no tenía límite por cuenta. El registro y el reenvío de activación no contaban intentos, así que se podía usar la web para bombardear buzones. Además el registro decía «Ya hay una cuenta con ese email» y el login respondía antes cuando el usuario no existía (sin calcular la huella), dos formas de saber qué cuentas existen.
- **Corrección** (`throttle_check()` / `throttle_hit()` en `web/lib/core.php`):
  - Panel: 10 fallos/IP **y** 20 fallos/usuario cada 15 min. Clientes: igual por IP y por email.
  - Registro y reenvío: 5 por IP y hora. Recuperar contraseña: 5 por IP cada 15 min (ya existía).
  - Contraseña actual (cambiar contraseña, cambiar email, borrar cuenta): 5 fallos por cuenta cada 15 min.
  - `pass_verify()` calcula una huella falsa cuando la cuenta no existe (mismo tiempo de respuesta).
  - El registro responde siempre «revisa tu email». Si la cuenta ya existía, al dueño le llega un aviso con el enlace para recuperar la contraseña.

### 5.2 Spam de reservas · Media · corregido
- `reservation_spam_guard()` (`web/lib/reservas.php`): 5 por hora y 10 al día por IP y como mucho 3 reservas activas (pendientes, esperando o confirmadas, de hoy en adelante) por email o por cuenta. Se mantienen la trampa anti-bots y la aceptación obligatoria de las políticas.

### 5.3 Límite global de la API · Media · corregido
- `api_rate_limit()`: 240 peticiones por minuto y por IP en toda la API (responde `429` con `Retry-After`). Usa APCu si existe; si no, un archivo pequeño por IP en `data/limites/` (bloqueado por `.htaccess`, se limpia solo). Se ajusta con `'rate_limit'` en `config.php` (0 lo desactiva).

## 6. Protección de datos (RGPD / LOPDGDD)

### 6.1 Datos mínimos · cumple
- Reserva: nombre y teléfono (obligatorios), email y notas (opcionales). Cuenta: nombre, email, contraseña y teléfono opcional. Datos personales cifrados (XSalsa20-Poly1305) y borrados 24 h después de la reserva; IP solo como huella. Portabilidad (`c_export`) y borrado (`borrar-datos.php`) disponibles.
- Ajuste menor: el aviso por email de una petición de borrado ya no lleva el teléfono completo (solo los 3 últimos dígitos); el teléfono está en el panel.

### 6.2 Fuga de datos en respuestas · cumple
- `user_out()`, `customer_out()`, `res_out()` y `public_info()` devuelven listas cerradas de campos. `require_auth()` quita `pass_hash`. Ninguna respuesta lleva huellas, tokens de otros usuarios ni claves de terceros. Los errores 500 no muestran detalles salvo con `debug`.

### 6.3 Logs · Baja · corregido
- `zend.exception_ignore_args = 1` en `web/lib/bootstrap.php`: las trazas que se escriben con `error_log()` ya no llevan los argumentos de las funciones, donde podía aparecer una contraseña.
- Los enlaces con tokens (activación y recuperación) solo se escriben en el log con `debug` **y** desde `localhost` (`dev_log()`), nunca en producción.

## 7. Infraestructura, secretos y cabeceras

### 7.1 Secretos · cumple
- El equivalente a `.env` en este proyecto es `web/config.php` (credenciales de BD y `secret`). Está en `.gitignore`, `.htaccess` lo bloquea y lo genera `install.php`. No hay ningún secreto en el historial de git (revisado). Las claves de Meta, Google y SMTP van cifradas en la BD y nunca salen hacia la app.
- Instalaciones nuevas: `secret` de 256 bits (antes 128).

### 7.2 CORS · Media · corregido
- **Antes:** `Access-Control-Allow-Origin: *` en toda la API.
- **Ahora:** `cors_headers()` solo responde a la propia web, a la app (`https://localhost`, `capacitor://localhost`, `http://localhost:*`) y a los orígenes que se añadan en `config.php` (`'cors_origins' => ['https://…']`), con `Vary: Origin`.

### 7.3 Cabeceras HTTP · Media · corregido
- `.htaccess` ya ponía `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy`. **Faltaba `Content-Security-Policy`**: añadida (ver 3.2).

## 8. Hallazgos adicionales

### 8.1 Reinstalación con `install.php` · **Alta** · corregido
- **Antes:** el instalador solo se bloqueaba si `config.php` existía **y** la base de datos respondía. Si `install.php` no se había borrado y la BD fallaba un momento (MySQL caído), cualquiera podía reinstalar con SQLite, crear su propio administrador y sobrescribir `config.php`, con lo que el restaurante perdía también la clave de los datos cifrados.
- **Ahora:** si existe `config.php`, `install.php` no hace nada.

### 8.2 Enlaces de email con la cabecera Host · Media · corregido
- **Antes:** `base_url()` usaba `$_SERVER['HTTP_HOST']`. Si el servidor acepta cualquier `Host` (VPS con un único sitio por defecto), un atacante podía pedir la recuperación de contraseña de otro usuario con `Host: atacante.com`. La víctima recibía un enlace legítimo que apuntaba al dominio del atacante y, al abrirlo, le entregaba el token.
- **Ahora:** `install.php` guarda `base_url` en `config.php` y `base_url()` la usa. Sin ella, se valida el formato del Host. **Webs ya instaladas: añadir `'base_url' => 'https://dominio',` a `config.php`.**

### 8.3 `remove_upload()` · Baja · corregido
- Solo comprobaba que la ruta empezara por `uploads/`, así que `uploads/../config.php` también valía. Hoy no se le pasa nada que venga del usuario, pero se endurece: solo nombres de archivo sueltos dentro de `uploads/`.

## Pendiente / recomendaciones

- Añadir `base_url` a `config.php` en las webs ya instaladas (incluida la de «Novia») y copiar allí estos cambios.
- Las reservas apuntadas desde el panel siguen sin comprobar el aforo (decisión de diseño; ya estaba en el backlog).
- Tests automáticos y CI: siguen sin existir; las pruebas de esta revisión se hicieron a mano con el servidor de PHP y Chromium.
- Si algún tema incrusta otros servicios (por ejemplo, vídeos de YouTube), hay que añadir su dominio en `send_csp()`.

---

# Segunda revisión (5 de noviembre de 2026): Sala y cocina y pedidos por QR

Desde la primera auditoría entraron tres módulos nuevos: **Sala y cocina** (#11), el **editor del plano** (#12) y los **pedidos por QR** desde la mesa (#13). Esta revisión se centra en ellos (`web/sala/`, `web/mesa/`, `web/lib/sala.php`, `web/lib/mesa.php`, `web/lib/qr.php`) y vuelve a pasar por lo demás. Además de leer el código, se arrancó la web en local (servidor de PHP con 16 procesos y SQLite) y se atacó con scripts: roles, fuerza bruta en paralelo, precios y platos manipulados, XSS en las notas, sesiones después de cerrar la mesa y cabeceras.

| # | Comprobación | Antes | Severidad | Ahora |
|---|---|---|---|---|
| S1 | Bloqueo del código de la mesa | Cualquiera con una foto antigua del QR podía meter 12 códigos malos y dejar **esa mesa sin pedir por QR 15 minutos**, aunque el camarero cambiara el código. Además, mandando muchos a la vez se comprobaban más de 12 (14 con 16 a la vez) | **Media** | ✅ El intento se apunta antes de comprobarlo (`throttle_take()`); el bloqueo va con el código actual, «Cambiar el código» lo quita y el camarero ve el aviso |
| S2 | Platos agotados | Se podía pedir desde el móvil un plato **quitado de la carta o agotado** mandando su número (la cocina lo recibía) | **Media** | ✅ Solo platos con `available = 1` (móvil y camarero) |
| S3 | Cambios a la vez en un pedido | Leer-cambiar-guardar sin bloqueo: «llamar al camarero» desde el móvil podía deshacer un cambio de mesa hecho a la vez; un envío del móvil justo al cerrar la mesa podía quedar en un pedido ya cerrado y sin cobrar | Baja | ✅ `sala_order_mutate()` con bloqueo en BD para actualizar, cerrar, llamar y enviar |
| S4 | Wifi compartido | Todos los móviles del wifi comparten IP: 30 QR falsos o 20 códigos malos de un solo cliente **bloqueaban los pedidos por QR de todo el local** | Baja | ✅ Sin límite por IP desde las redes del local (Preferencias → IP); 40 códigos por IP en el resto |
| S5 | Versión de PHP | La cabecera `X-Powered-By` decía la versión exacta de PHP | Baja | ✅ Quitada (PHP y `.htaccess`) |
| S6 | Roles de la sala | ✅ Cocina solo ve la cocina y marca «en preparación / listo»; el camarero no toca plano, preferencias ni QR (probado ruta por ruta: 403) | — | ✅ Sin cambios |
| S7 | Sesiones de la sala y del móvil | ✅ Tokens de 256 bits, solo se guarda la huella, caducan; los del móvil mueren al cerrar la mesa o cambiar el código (probado: 401 tras cerrar y tras reabrir) | — | ✅ Sin cambios |
| S8 | IDOR en los pedidos por QR | ✅ El móvil solo ve y pide en su pedido (la sesión lleva el pedido; un `id` en la petición se ignora) | — | ✅ Sin cambios |
| S9 | Precios y platos inventados | ✅ Nombre, precio, pase y espera los pone el servidor; especiales solo de la lista del encargado; límites de cantidad | — | ✅ Sin cambios |
| S10 | XSS | ✅ `sala.js` y `mesa.js` escapan con `esc()` todo lo que viene de clientes (notas, nombres); el QR es SVG generado en el servidor con la etiqueta escapada; CSP sin scripts en línea | — | ✅ Sin cambios |
| S11 | Clave del QR | ✅ 128 bits, va en el `#` de la URL (no se envía al servidor ni en el Referer), cifrada en BD, se puede cambiar | — | ✅ Sin cambios |
| S12 | SQL injection | ✅ Todo con sentencias preparadas también en los módulos nuevos | — | ✅ Sin cambios |

## Pendiente / recomendaciones (segunda revisión)

- **Bares con wifi:** poner la IP pública del local en Sala → Preferencias → «Solo desde el wifi». Así nadie pide desde casa y un cliente no puede bloquear a los demás.
- El resto de límites de intentos (entrar al panel, a la sala y a la cuenta de cliente) siguen con «comprobar y luego apuntar»: con muchas peticiones a la vez se cuelan unos pocos intentos más. Con contraseñas de 8 o más caracteres no es explotable; si se quiere, se pueden pasar a `throttle_take()`.
- Camareros y encargados ven las reservas (nombre y notas) de cualquier día en la sala. Es lo esperado para atender, pero si se quiere restringir habría que limitarlo a hoy y mañana.
- Los tokens de la sala y del panel viven en `localStorage`: la CSP es lo que los protege; no añadir scripts en línea ni de otros dominios.
- No se ha probado contra MySQL real ni contra la web desplegada (solo en local). Para escanear la web publicada hace falta su dirección y permiso del dueño.

---

# Tercera revisión (6 de noviembre de 2026): todo el proyecto, toma de nota y app de Windows

Se repasa todo lo anterior y lo nuevo desde la segunda revisión: el **editor de sala** (#15), la **toma de nota** en el móvil (#16, aún sin fusionar) y la **app de Windows** para la red del local (rama `claude/app-escritorio-mesas`, aún sin PR). Esta rama parte de la de la segunda revisión (#14, sin fusionar), así que la incluye.

| # | Comprobación | Antes | Severidad | Ahora |
|---|---|---|---|---|
| T1 | App de Windows: archivos privados por la red | `escritorio/router.php` bloquea `config.php`, `lib/`, `data/` y los `.sqlite` comparando la URL, pero en Windows la misma ruta se puede escribir de otras formas: `config.php.` o `config.php ` (Windows quita el punto o espacio final), `config.php::$DATA` (flujo de NTFS) o nombres cortos 8.3 (`RESTAU~1.SQL`). Ninguna coincide con la lista ni acaba en `.php`, así que `php -S` serviría el archivo tal cual: **la clave de cifrado de `config.php` o la base de datos entera**, a cualquiera del wifi. No se ha podido probar en Windows (solo en Linux) | **Alta** (si se confirma) | 🔧 Arreglo preparado para la rama de la app (no está en esta rama porque la app aún no está en `main`): rechaza `:`, `~` y puntos o espacios finales, y vuelve a comprobar con la ruta real del disco (`realpath`). Bloquea también los `.log` |
| T2 | Fuerza bruta con peticiones a la vez | Entrar en el panel, en la sala o en la cuenta de cliente, y las contraseñas al cambiar email o borrar la cuenta, usaban «comprobar y luego apuntar». Probado con 30 intentos a la vez contra la sala: **se comprobaron 18 contraseñas** en vez de 10 | **Media** | ✅ Todos con `throttle_take()` (se apunta antes de comprobar). Mismo ataque: exactamente 10 |
| T3 | Menús pedidos por QR | El móvil podía mandar varios platos del mismo apartado de un menú (p. ej. tres segundos y dos postres): **todos salían a cocina por el precio de un menú** | **Media** | ✅ Un plato por apartado (móvil y camarero), con prueba automática |
| T4 | Bloqueo de los camareros desde el wifi | En la web publicada todos los móviles del local comparten IP: 10 contraseñas malas de un cliente del wifi **dejaban sin poder entrar en la sala a todos los camareros** 15 minutos | Baja | ✅ Si el local tiene puestas sus IP (Preferencias de la sala), el límite por IP sube a 60; sigue el de 20 por usuario |
| T5 | App de Windows: sin cifrar en el wifi | El servidor del PC va por `http://`: contraseñas y sesiones de camareros y del encargado viajan sin cifrar por el wifi, que en un bar suele ser el mismo que usan los clientes para pedir por QR | **Media** | ⏳ Pendiente (ver recomendaciones) |
| T6 | App de Windows: panel abierto al wifi | El panel completo (carta, ajustes, cuentas) se puede abrir desde cualquier móvil del wifi; solo lo protege la contraseña | Baja | ⏳ Pendiente (ver recomendaciones) |
| T7 | Toma de nota (#16) | ✅ Todo lo que sale en pantalla pasa por `esc()`; el borrador va en `localStorage` del propio móvil y al enviarlo el servidor vuelve a poner nombres y precios | — | ✅ Sin cambios |
| T8 | Editor de sala (#15) | ✅ El servidor limita y limpia todo (`sala_layout_clean()`): ids, tamaños, esquinas, nombres; solo el encargado guarda; control de versión para no pisar cambios | — | ✅ Sin cambios |
| T9 | App de Windows: resto | ✅ `/local/` solo desde el propio PC; instalador sin administrador; PHP descargado con SHA-256; contraseña inicial por variable de entorno (no en la lista de procesos); `install.php` cerrado; firewall solo red local | — | ✅ Sin cambios |

## Pendiente / recomendaciones (tercera revisión)

- **Aplicar el arreglo T1 en la rama de la app** antes de dar el instalador a nadie, y probarlo en Windows: con la app arrancada, `http://127.0.0.1:8080/config.php.` y `http://127.0.0.1:8080/config.php::$DATA` tienen que dar 404.
- **Sincronización de la app con la web:** no se ha revisado. El código está solo en el PC de desarrollo (no se ha subido a GitHub) y el PC no estaba conectado. Cuando se suba, revisar sobre todo la API de sincronización de la web (protegida con un usuario administrador): que no se pueda usar con una cuenta sin permisos, que los datos que sube la app se validen igual que los del panel y dónde guarda la app esa contraseña.
- **T5:** lo ideal es un wifi para el personal y otro para los clientes, con el PC en el del personal y los QR desactivados o, si se quieren QR, servir la app con HTTPS (certificado propio del local). Mientras tanto, como mínimo, wifi con contraseña WPA2/WPA3 y no abierta.
- **T6:** en la app de Windows se podría limitar el panel al propio PC (como `/local/`) o a una lista de IP del personal.
- La regla del firewall vale en cualquier perfil de red (también «Público»): si el PC es un portátil que se conecta a otros wifis, quitar la regla o cerrar la app fuera del local.
