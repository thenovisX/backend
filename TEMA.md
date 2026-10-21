# Cómo hacer un tema

El tema es el diseño de la web. Vive entero en `web/tema/` y es lo único que cambia de un cliente a otro. El backend le da los datos y se encarga de reservas, cuentas, emails, cookies y textos legales.

## Archivos obligatorios

| Archivo | Para qué | Variables que recibe |
|---|---|---|
| `tema.php` | Configuración: nombre, versión, colores, huecos de foto. **Solo constantes** (lo leen también la API y el panel). | — |
| `inicio.php` | Portada (`/`) | `$carta` |
| `cuenta.php` | Entrar, registrarse y «Mi cuenta» (`cuenta.php`) | `$reservas`, `$activada`, `$enlace_caducado`, `$registro` |
| `legal.php` | Información legal (`legal.php`) | `$secciones` |
| `confirmar.php` | Página del enlace del WhatsApp (`confirmar.php`) | `$ok`, `$estado`, `$reserva`, `$fecha`, `$error`, `$ics_url` |

Todas reciben también `$s` (los ajustes del restaurante) y `$cliente` (el cliente con sesión, o `null`).

El resto es libre: `partes.php` (cabecera y pie compartidos), `assets/` (CSS, JS, fuentes, imágenes). Para enlazar un archivo de `assets/` con su versión: `<?= asset('tema.css') ?>`.

## Lo que tiene que tener cada página (obligatorio)

```php
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= h($s['name']) ?></title>
<?php head_tags(); ?>          <!-- SEO, aviso de cookies, iconos de la app, estilos del SDK -->
<link rel="stylesheet" href="<?= asset('tema.css') ?>">
</head>
<body>
  …tu diseño…
  <footer>
    … enlaces a legal.php#aviso, legal.php#privacidad, legal.php#cookies …
    <?= cookies_link() ?>      <!-- «Configurar cookies»: obligatorio por ley -->
  </footer>
<?php body_end(); ?>           <!-- ventana de reserva + SDK -->
</body>
</html>
```

## Reglas legales para el diseño

- **Nada de recursos de otras webs**: ni Google Fonts desde Google, ni imágenes o scripts de otros dominios. Descarga las fuentes a `tema/assets/fonts/` (las de Google Fonts tienen licencia libre). La política de privacidad dice que todo se sirve desde el propio servidor.
- **Mapas**: si incrustas Google Maps, cárgalo solo cuando el visitante pulse un botón («Mostrar el mapa») y pon `const TEMA_GOOGLE_MAPS = true;` en `tema.php`. Así se añade el aviso en la página de cookies.
- **No cambies los textos legales** desde el tema: salen de `lib/legal.php` y se rellenan solos.
- **Muestra la información de alérgenos** en la carta (los iconos con su nombre o la leyenda).

## Datos del restaurante: `$s`

`name`, `tagline` (frase corta), `description` (presentación), `address`, `city`, `phone`, `whatsapp`, `email`, `instagram`, `facebook`, `tiktok`, `tripadvisor`, `maps_url`, `ribbon` (frases destacadas, separadas por comas), `footer_title`, `hours`, `closed_dates`, `late_minutes`, `policies`, `max_people`, `days_ahead`, `owner_name`, `owner_nif`.

Imprime siempre con `h()`: `<?= h($s['name']) ?>`.

## Funciones disponibles

| Función | Devuelve |
|---|---|
| `h($texto)` | Texto escapado para HTML |
| `asset('archivo.css')` | `tema/assets/archivo.css?v=…` |
| `photo_img('portada', 1200, '100vw')` | `<img>` completo con `srcset` y `alt` |
| `photo('portada', 1200)` / `photo_abs(...)` | Solo la dirección de la foto (relativa / completa) |
| `photo_credits()` | Autores de las fotos de ejemplo que siguen puestas (para el pie) |
| `horario()` | `[['dia' => 'Lunes', 'texto' => '13:00–16:00', 'hoy' => bool], …]` |
| `horario_hoy()` | Horario de hoy, `'Cerrado'` o `'Cerrado hoy'` |
| `politicas()` | `[['titulo' => 'Grupos', 'texto' => '…'], …]` |
| `redes()` | `['Instagram' => url, …]` (solo las configuradas) |
| `tel_href($tel)`, `wa_href()`, `maps_href()` | Enlaces para llamar, WhatsApp y «Cómo llegar» |
| `al_icon('gluten', 22, 'Gluten')` | Icono de un alérgeno |
| `precio(12.5)` | `12,50 €` |
| `cookies_link()` | Enlace «Configurar cookies» |
| `menu_data(false)` | La carta (ya viene en `$carta` en la portada) |

### La carta: `$carta`

```php
$carta['categories'] = [
  ['id' => 3, 'name' => 'Entrantes', 'dishes' => [
     ['id' => 7, 'name' => 'Pulpo', 'description' => '…', 'price' => 24.0, 'allergens' => ['moluscos'],
      'photo' => 'https://…/uploads/…jpg' o '', 'featured' => true],
  ]],
];
$carta['allergens'] = [['key' => 'gluten', 'name' => 'Gluten', 'abbr' => 'GL', 'desc' => '…'], …];  // los 14
```

Solo vienen los platos disponibles y las secciones con platos.

## Huecos de foto: `TEMA_FOTOS`

```php
const TEMA_FOTOS = [
    'portada' => ['label' => 'Portada', 'src' => 'https://images.unsplash.com/photo-…', 'alt' => '…', 'by' => 'Autor', 'url' => 'https://unsplash.com/photos/…'],
    'sala'    => ['label' => 'Nosotros', 'src' => 'tema/assets/img/sala.jpg', 'alt' => '…'],
];
```

Cada hueco aparece en la app (Ajustes → Fotos de la web) con su `label` para que el cliente ponga la suya. La primera es la principal (Google y redes sociales). Las fotos de Unsplash se descargan una vez y se sirven desde el propio servidor.

## Reservar: `data-book`

Cualquier elemento con `data-book` abre la ventana de reserva, por ejemplo `<a href="#reservar" data-book>Reservar</a>`. No hace falta nada más.

Para que la ventana y el aviso de cookies combinen con tu diseño, define estas variables en tu CSS:

```css
:root {
  --r-bg: #fff;            /* fondo */
  --r-text: #222;          /* texto */
  --r-muted: #666;         /* texto secundario */
  --r-line: rgba(0,0,0,.14);
  --r-field: transparent;  /* fondo de los campos */
  --r-accent: #b4532a;     /* botón principal y elementos elegidos */
  --r-accent-text: #fff;
  --r-radius: 14px;
  --r-btn-radius: 999px;
  --r-font: "Mi fuente", sans-serif;
  --r-font-title: "Mi fuente de títulos", serif;
}
```

Todas sus clases empiezan por `bk-` (reserva) y `ck-` (cookies): no uses esos prefijos en tu tema.

## Cuenta del cliente: atributos `data-*`

El SDK da el comportamiento; el tema solo pone el HTML.

| Atributo | Qué hace |
|---|---|
| `<form data-api="c_login">` | Entrar. Campos `email`, `password`. Al terminar va a `cuenta.php`. |
| `<form data-api="c_register">` | Crear cuenta. Campos `name`, `email`, `phone`, `password`, `privacy` (casilla) y `website` (campo trampa oculto). |
| `<form data-api="c_profile">` | Guardar datos. `name`, `phone`, `email`, `password`, `new_password`. |
| `<form data-api="c_delete" data-confirm="¿Seguro?">` | Borrar la cuenta. Campo `password`. |
| `<p data-error>` dentro del form | Ahí se escribe el error. |
| `<div data-tabs>` + botones `role="tab" aria-controls="id"` | Pestañas (Entrar / Crear cuenta). |
| `<div data-registro-ok hidden>` | Se muestra al registrarse («Revisa tu email»). Dentro: `<b data-registro-email>`, `<button data-resend>`. |
| `<button data-cancel="ID" data-when="texto">` | Cancelar una reserva. |
| `<button data-confirm-res="ID">` | Confirmar una reserva que espera al cliente. |
| `<button data-logout>` | Cerrar sesión. |
| `<a href="api/?r=c_export" download>` | Descargar sus datos. |

## Instalar como app

`<button data-install hidden>` aparece cuando el navegador permite instalar. Opcionales: `data-install-help` (instrucciones genéricas), `data-install-ios hidden` (instrucciones para iPhone) y `data-install-done hidden` (ya instalada).

## JavaScript propio

En `window.Restaurante` tienes:

- `Restaurante.api('slots&date=2026-11-02')` y `Restaurante.api('reserve', {...})`: llamadas a la API (ver API.md);
- `Restaurante.abrirReserva()`;
- `Restaurante.toast('Texto')`;
- `Restaurante.datos`: horario, días cerrados y cliente.

Eventos en `document`: `restaurante:antes-de-reservar`, `restaurante:reserva-abierta`, `restaurante:reserva` (con la respuesta) y `restaurante:c_login`, `restaurante:c_register`…

Si quieres hacer tu propia ventana de reserva, llama a `body_end(['reserva' => false])` y usa la API.

## Icono de la app

Por defecto se genera con la inicial del restaurante y los colores de `TEMA_COLORES`. Para usar un logo, pon un PNG cuadrado (512×512 o más) en `tema/assets/icono.png`.
