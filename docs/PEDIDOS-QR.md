# Pedidos por QR desde la mesa

Cada mesa del plano tiene su código QR. Los clientes lo escanean con el móvil, ven la carta y piden. El pedido entra en el pedido de esa mesa en **Sala y cocina** (marcado con «QR») y llega a la pantalla de cocina o de barra como cualquier comanda.

- Página del cliente: `web/mesa/` (`index.html`, `mesa.js`, `mesa.css`), hecha para el móvil.
- API del cliente: `web/mesa/api.php`. Lógica: `web/lib/mesa.php`. Generador de QR sin librerías: `web/lib/qr.php`.
- Pruebas: `bash tests/run.sh` (incluye `tests/mesa_test.php`).

## Cómo se usa

1. **Imprimir los QR** (encargado): Sala y cocina → Preferencias → «Pedidos desde el móvil (QR)» → «Ver e imprimir los QR». Sale una hoja con un QR por mesa y su nombre. Se recortan y se pegan en cada mesa.
2. **Se sientan los clientes**: el camarero abre la mesa como siempre. Al abrirla se crea un **código de 4 cifras** que solo ve el camarero (botón «QR · código 1234» en el pedido).
3. **El cliente escanea el QR de la mesa** y escribe el código que le da el camarero. O, más rápido, el camarero pulsa el botón del código y le enseña su pantalla: ese QR ya lleva el código dentro.
4. **El cliente pide**: carta por secciones, alérgenos, fotos, menús (elige un plato de cada apartado), especiales del día, cantidades y notas para la cocina. Puede ver lo que lleva pedido la mesa y su estado (en cocina, listo, servido), **llamar al camarero** o **pedir la cuenta**.
5. **En la sala**: la mesa parpadea y suena un aviso cuando llaman, piden la cuenta o hay un pedido por aceptar. Los platos pedidos por QR llevan la etiqueta «QR».
6. **Al cerrar la mesa**, todos los móviles conectados dejan de poder pedir.

## Contra pedidos desde casa (y otros abusos)

| Riesgo | Qué lo impide |
|---|---|
| Alguien hace una foto del QR y pide desde casa | Solo se puede pedir con la mesa **abierta por un camarero** y con el **código de esa vez** (nuevo cada vez que se abre la mesa). Al cerrar la mesa se cierran todas las sesiones. |
| Adivinar el código | 4 cifras con bloqueo: 12 fallos por mesa y 20 por conexión cada 15 minutos. Además el camarero puede **cambiar el código** (saca a los móviles que ya estaban dentro). |
| Adivinar el QR de otra mesa | Cada QR lleva una clave aleatoria de 128 bits; la de una mesa no sirve para otra. 30 intentos con QR malos por conexión cada 15 minutos. |
| Un QR robado o publicado | El encargado puede **cambiar el QR** de una mesa o de todas; los impresos dejan de valer. |
| Alguien de otra mesa con el código | Código por mesa; el camarero puede apagar el QR de esa mesa o cambiar el código. |
| Sesiones que se quedan abiertas | Caducan a las 5 horas, o a las 2 horas sin usarse, y al cerrar la mesa. Como mucho 30 móviles por mesa. |
| Pedidos falsos o en masa | 6 envíos por móvil y 18 por mesa cada 10 minutos; como mucho 25 líneas, 30 platos y 10 de un mismo plato por envío. Límite de peticiones propio (600 por minuto y por IP, `rate_limit_mesa` en config.php, alto porque todos los móviles del wifi comparten IP). |
| Cambiar precios o inventarse platos | Nombres y precios salen siempre de la carta del servidor. Desde el móvil no se pueden pedir platos con nombre o precio libres, ni elegir pase o «en espera» (los postres quedan en espera solos). |
| Código malicioso en las notas | Las notas se guardan como texto (sin caracteres de control, 120 como mucho) y se muestran siempre escapadas. La página tiene CSP estricta (solo scripts propios, sin estilos en línea), sin CORS y sin cookies. |
| Fugas de la clave del QR | La clave va después de `#` en el enlace: el navegador nunca la manda al servidor ni sale en los registros. `Referrer-Policy: no-referrer` y `noindex`. |
| Ver datos de otras mesas | La sesión del móvil solo da acceso a su pedido. No se ven nombres de camareros ni datos de reservas. |

**Opcionales** (Preferencias → Pedidos desde el móvil):

- **El camarero acepta cada pedido** antes de que llegue a la cocina (el pedido sale como «Por aceptar (QR)» y no cuenta en la cuenta hasta aceptarlo; si se cierra la mesa sin aceptarlo, no se cobra).
- **Solo desde el wifi del local**: lista de IP o redes (`81.40.12.7` o `81.40.12.0/24`). El botón «Añadir la IP de esta conexión» la rellena desde un dispositivo conectado al wifi del restaurante. Ojo: si la compañía cambia la IP del local, hay que actualizarla. Si la web va detrás de un proxy o CDN (p. ej. Cloudflare), `REMOTE_ADDR` es la del proxy y esta opción no sirve tal cual.
- Quitar el código de 4 cifras (no recomendado: sin él, cualquiera con una foto del QR podría pedir mientras la mesa está abierta).
- Apagar los pedidos por QR en todo el local, o solo en una mesa (desde su pedido).

## Datos

- Las claves de los QR se guardan cifradas en `sala_kv` (`qr_keys`). El código de la mesa y los avisos van dentro de los datos cifrados del pedido.
- Tabla nueva `sala_guests` (versión 12 de la base de datos, se crea sola al actualizar): sesiones de los móviles, guardadas como huella SHA-256 del token, atadas a un pedido abierto.
