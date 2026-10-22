# Backend para webs de restaurantes

Base reutilizable para hacer la web de un restaurante. Para cada cliente solo hay que hacer el diseño, en `web/tema/`; todo lo demás ya funciona:

- **Reservas** en 3 pasos con confirmación por WhatsApp (al pulsar «Reservar» se elige entre reservar online o llamar; llamar se desactiva con un aviso cuando el restaurante está cerrado), aforo con tiempo de mesa (una reserva a las 14:00 con 90 min ocupa sitio hasta las 15:30), días cerrados y antelación mínima.
- **Cuentas de clientes** con activación por email, historial, cancelación gratis, descarga y borrado de datos.
- **Carta** con secciones, fotos, precios, platos agotados y los 14 alérgenos con iconos.
- **App de gestión** para el móvil (Android y web/iPhone): peticiones, reservas de hoy, calendario, carta y ajustes con buscador.
- **Usuarios con permisos**: el administrador crea usuarios (por ejemplo, camareros que solo ven las reservas) y decide si pueden gestionar reservas, cambiar la carta o los ajustes.
- **Horario de cocina** opcional: las reservas se ofrecen solo con la cocina abierta y la web lo muestra bajo el horario.
- **Emails** desde el hosting o desde Gmail.
- **Cuatro idiomas** (español, inglés, portugués y gallego) con banderas circulares. Los textos fijos, la ventana de reserva, las cookies, los textos legales, los errores y los emails y WhatsApp al cliente están traducidos a mano (`web/lib/lang/` y `web/lib/legal/`). La carta, la frase corta, la presentación y las políticas se traducen solas al guardar (MyMemory gratis, o Google Translate con clave) y se corrigen en la app: Ajustes → Idiomas de la web. El nombre y los datos de contacto no se traducen. Cada tema añade los suyos en `web/tema/lang.php`.
- **Menús**: tantos como se quiera (del día, degustación, infantil…), con precio, días, apartados (primero, segundo, postre, café…), suplementos, alérgenos y foto por plato y nota; página propia y botón «Ver menús» activable; cada uno con su interruptor, y la carta principal también se puede quitar de la web. Todo desde Carta en la app.
- **Fotos ampliables**: cualquier `<img data-zoom>` se abre a pantalla grande con flechas, deslizar y teclado.
- **Legal**: aviso legal, condiciones, privacidad y cookies (RGPD, LOPDGDD, LSSI y guía de la AEPD, revisados en octubre de 2026). Aviso de cookies con Google Analytics, Tag Manager y el píxel de Meta solo con consentimiento.
- **SEO** (descripción, datos estructurados, sitemap, Search Console) e **instalable como app** (PWA).
- **Seguridad**: datos personales cifrados, borrado a las 24 h y bloqueo por intentos fallidos. Ver [SEGURIDAD.md](SEGURIDAD.md).

Incluye un tema de ejemplo («Base») para que la web funcione desde el primer momento.

```
web/                → lo que se sube a Hostinger
  tema/             → EL DISEÑO: lo único que cambias en cada proyecto (ver TEMA.md)
  index.php, cuenta.php, legal.php, confirmar.php, carta.php, reservar.php
                    → «puertas»: hacen la lógica y llaman al tema. No se tocan. carta.php y reservar.php
                      solo se ven si el tema tiene esas páginas (si no, llevan a la portada).
  api/              → API que usan la web y la app
  lib/              → el backend (reservas, clientes, carta, emails, textos legales…)
  sdk/              → JavaScript y CSS comunes: ventana de reserva, aviso de cookies, cuenta
  panel/            → la app de gestión en versión web (copia de app/www)
  install.php       → instalador
app/                → la app Android (Capacitor); app/www es el código de la app
scripts/            → utilidades (copiar el panel, generar iconos)
TEMA.md             → cómo hacer un tema: variables, funciones y atributos que hay disponibles
API.md              → todas las rutas de la API
```

---

## Empezar la web de un cliente nuevo

1. En GitHub, abre este repositorio y pulsa **Use this template → Create a new repository**. Ponle el nombre del cliente (por ejemplo `web-casa-marisa`) y márcalo como **Private**.
   (Si no ves el botón: Settings → General → marca **Template repository**.)
2. Haz el diseño **solo dentro de `web/tema/`**. Puedes partir del tema Base o borrarlo y empezar de cero. Lo que tiene que tener está en [TEMA.md](TEMA.md).
3. Cada vez que subas cambios a `main`, GitHub prepara sola la rama **`hostinger`** con la web lista para publicar.
4. En Hostinger: conecta esa rama y abre `install.php` (pasos abajo).
5. En la app de gestión, rellena los datos del cliente: nombre, contacto, horario, carta, titular y NIF, y (si quieres) el Gmail para los emails.

### Pasar una mejora del backend a webs que ya están hechas

Como el diseño está separado, basta con copiar del repositorio `backend-restaurante` a la web del cliente estas carpetas y archivos, **sin tocar `web/tema/`**:

`web/api/`, `web/lib/`, `web/sdk/`, `web/panel/`, `app/www/`, `web/index.php`, `web/cuenta.php`, `web/legal.php`, `web/confirmar.php`, `web/carta.php`, `web/reservar.php`, `web/foto.php`, `web/icon.php`, `web/manifest.php`, `web/sitemap.php`, `web/robots.php`, `web/sw.js`, `web/install.php` y `web/.htaccess`.

La base de datos se actualiza sola al abrir la web: las tablas y columnas nuevas se añaden sin perder datos.

---

## 1. Subir la web a Hostinger

### Opción A: con Git (se actualiza sola)

La rama **`hostinger`** contiene solo la web, con `index.php` en la raíz. **No conectes `main`**: ahí la web está dentro de `web/` y daría error 404.

1. En hPanel → **Archivos → Administrador de archivos**, vacía `public_html` (Hostinger exige que esté vacía).
2. En **Avanzado → Git → Crear un nuevo repositorio**:
   - Repositorio: la dirección del repositorio del cliente.
   - Rama: **`hostinger`**
   - Directorio: déjalo **vacío**.
   - Si el repositorio es privado, Hostinger te da una clave SSH: añádela en GitHub → Settings → Deploy keys.
3. Pulsa **Crear** y luego **Desplegar**. Activa el **despliegue automático** y pega la URL del webhook en GitHub → Settings → Webhooks.

### Instalar

1. Abre `https://dominio-del-cliente.com/install.php` y rellena:
   - la base de datos: **SQLite** (la más sencilla, no hay que crear nada) o MySQL (créala antes en hPanel → Bases de datos; el servidor es `localhost`);
   - el nombre del restaurante y el email donde llegan las reservas;
   - el usuario y la contraseña de la app de gestión.
2. Cuando termine, **borra `install.php`**.
3. En hPanel → **Seguridad → SSL**, comprueba que el certificado está activo.

Guarda una copia de `config.php`: sin él no se pueden leer los datos cifrados.

## 2. App de gestión

**Android:** el APK se genera a mano desde GitHub → **Actions** → «Compilar app Android y web» → **Run workflow**, y aparece en **Releases**. **Un mismo APK vale para todos los clientes**: al abrirla, pide la dirección de la web.

**iPhone:** desde Safari, abre `https://dominio-del-cliente.com/panel/` → Compartir → **Añadir a pantalla de inicio**.

**Desde el ordenador:** `https://dominio-del-cliente.com/panel/` (el menú pasa al lateral).

## 3. Enviar los emails desde Gmail

1. En la cuenta de Google, activa la **verificación en 2 pasos**.
2. En **myaccount.google.com/apppasswords**, crea una contraseña («Web restaurante») y copia las 16 letras.
3. En la app: **Ajustes → Envío de emails**. Pon el Gmail y esa contraseña, activa el interruptor, guarda y pulsa **Enviar un email de prueba**.

Sirve igual para el correo de Hostinger (smtp.hostinger.com, puerto 465).

## Cómo funcionan las reservas

1. El cliente reserva en la web (teléfono obligatorio, email opcional). Ve «Petición realizada».
2. En la app aparece en **Peticiones**. Al pulsar **Confirmar por WhatsApp** se abre WhatsApp con el mensaje y el enlace.
3. El cliente abre el enlace, ve sus datos y pulsa **Confirmar mi reserva** (abrir el enlace no confirma: WhatsApp lo abre solo para la vista previa). La app avisa.
4. Desde el mismo enlace puede **cancelarla**. Si el restaurante la cancela o la borra en la app, el enlace dice «Reserva cancelada».
5. Si el cliente puso email o tiene cuenta, recibe también los avisos por email.

Los enlaces no ocupan espacio aparte: cada reserva guarda una clave de 32 caracteres (unos 100 bytes cifrada).

---

## Desarrollo

**Probar en tu ordenador** (PHP 8.1 o superior con GD, sodium y pdo_sqlite):

```bash
cd web && php -S localhost:8080
# Abre http://localhost:8080/install.php y elige SQLite
```

**Cambiar la app de gestión**: edita `app/www/` y ejecuta `./scripts/build-panel.sh` para copiarla a `web/panel/`.

**Compilar el APK en tu PC** (Android SDK y JDK 21): `cd app && npm install && npm run apk`.

**Google Play**: crea tu propia clave de firma y sustituye `app/android/keystore/app.keystore`. La incluida es pública y solo sirve para instalar el APK a mano.
