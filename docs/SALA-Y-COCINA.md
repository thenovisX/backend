# Sala y cocina

Programa aparte del panel para el servicio: el plano del local, los pedidos de cada mesa y la pantalla de la cocina. Está en `web/sala/` y se abre en `https://tu-web.com/sala/`.

## Cómo se entra

- Las cuentas se crean en el **panel**: Ajustes → Cuenta → **Sala y cocina** (solo los administradores). Ahí está también el botón «Abrir Sala y cocina», y en la cabecera del panel hay un icono que lleva directamente.
- Las cuentas de la sala **no sirven para el panel**, y los usuarios del panel no sirven para la sala. Cada una tiene su propia tabla (`sala_users`), sus sesiones (`sala_tokens`) y su API (`web/sala/api.php`).
- Tres tipos de cuenta:
  - **Encargado**: todo (sala, pedidos, cocina, dibujar el plano y las preferencias).
  - **Camarero**: sala y pedidos (también ve la pantalla de cocina).
  - **Cocina**: solo la pantalla de cocina (marca los platos en preparación y listos).
- Mismas protecciones que el panel: contraseña con Argon2id, bloqueo tras 10 fallos por IP o 20 por usuario en 15 minutos, la sesión caduca a los 90 días sin uso. Al cambiar la contraseña o desactivar una cuenta se cierran sus sesiones.

## El plano (encargado → Plano)

- **Plantas**: «+ Planta arriba» y «+ Planta abajo». Cada una con su nombre, tamaño y altura (se puede subir y bajar). Las plantas salen en pestañas.
- **Forma de la sala**: rectángulo, L, U o T de partida, y luego se arrastran las esquinas; tocando el punto rosa de una pared se añade una esquina.
- **Mesas**: cuadradas o redondas, con nombre, plazas y tamaño (se arrastran para moverlas y por la esquina roja para cambiar el tamaño; también con las flechas del teclado). Las sillas se dibujan solas según las plazas. También hay elementos que no son mesas (barra, puerta, columna…).
- Cada mesa tiene dos interruptores: **se puede asignar sola a las reservas** y **se puede juntar con las de al lado**.
- **Fusionar mesas** (para eventos o grupos fijos): se eligen varias mesas y se fusionan. Funcionan como una sola para pedidos y reservas hasta que se separan. Se les puede poner nombre y plazas.
- El plano se guarda entero con un número de versión: si dos personas lo editan a la vez, la segunda recibe un aviso en lugar de pisar los cambios.

## Asignación automática de mesas a las reservas

Cuando entra una reserva (por la web o apuntada en el panel), se le busca mesa según las **Preferencias**:

- **Cuándo**: en cuanto entra la reserva, cuando se acepta o el cliente la confirma, o nunca (a mano).
- Primero busca **una mesa o fusión que sirva sola**, la más ajustada (la que deja menos sitios vacíos). Si sobran más sitios de los que el restaurante acepta («Sitios vacíos que aceptas»), o no hay ninguna, **junta mesas vecinas** de la misma planta (como mucho las que diga «Juntar como mucho», restando las plazas que se pierden en cada unión).
- Dos mesas cuentan como vecinas si se tocan por un lado o están a menos de la «distancia» configurada.
- Respeta las **plantas permitidas y su orden de preferencia**, y el **tiempo de mesa** (una mesa queda ocupada desde la hora de la reserva hasta que pasa ese tiempo).
- Si se cambia la reserva (más personas, otra hora) y ya no cabe, se busca otra. Si se cancela, rechaza o borra, la mesa queda libre.
- Desde la sala, en «Reservas de hoy», se pueden cambiar las mesas de una reserva a mano, pedir que la busque sola o quitársela. En el panel, cada reserva muestra su mesa.
- Si algo falla al asignar, la reserva se guarda igual (el fallo solo se apunta en el registro del servidor).

## Pedidos (sala)

- En la **Sala** se ve el plano con el estado de cada mesa: libre, reserva en menos de una hora, reservada, ocupada y con plato listo para servir (parpadea). Se puede mirar otro día u otra hora.
- Al tocar una mesa libre se **abre la mesa** (sola, con su reserva o junto con otras mesas). Al tocar una ocupada se abre su pedido.
- En el pedido: la carta por categorías con buscador, los **menús** activos (se elige un plato de cada apartado), los **especiales del día** (los prepara el encargado en Preferencias) y «Otro plato o bebida» con nombre y precio libres.
- Cada plato lleva **cantidad, pase** (bebidas, entrantes, principales, postres) y **nota para la cocina** (con atajos: sin gluten, poco hecho…). Se puede dejar **en espera** y «marcharlo» después (los postres salen en espera por defecto).
- Los platos se van añadiendo a «Por enviar» y se mandan a la cocina de una vez. Los precios y nombres los pone siempre el servidor desde la carta, no el móvil.
- Un plato enviado se puede marcar como servido o anular (no se cobra).
- **Cuenta y cerrar mesa**: total, total por persona, imprimir la cuenta y cerrar. «Cobradas hoy» muestra lo cerrado del día y permite reabrir una mesa cerrada por error.

## Pantalla de cocina

- Comandas ordenadas por hora de llegada (la más antigua primero), con la mesa, personas, camarero, minutos que lleva (verde, ámbar a los 10 min y rojo a los 20), los platos agrupados por pase, alérgenos y notas resaltadas.
- Tocar un plato lo pasa a **preparando** y luego a **listo**; «Todo listo» marca la comanda entera. Las comandas listas bajan a «Listo para servir» hasta que el camarero las sirve, y al camarero le salta un aviso.
- Las comandas en espera salen en gris al final hasta que se marchan.
- **Barra**: las categorías marcadas en Preferencias como «van a la barra» (y las bebidas sueltas) no salen en la cocina sino en la pantalla «Barra».
- Se actualiza sola cada 3 segundos (la sala cada 4), con sonido al llegar una comanda nueva (hay que pulsar «Activar sonido» una vez) y botón de pantalla completa que evita que la tablet se apague.
- Las consultas solo descargan datos cuando algo ha cambiado (número de versión), y la API de la sala tiene su propio límite de peticiones (1200 por minuto y por IP, `rate_limit_sala` en config.php), porque todas las pantallas del local comparten la misma IP.

## Datos y cifrado

- Todo el contenido se guarda **cifrado** con la misma clave que los datos personales (`enc()`, libsodium): el plano, las preferencias, los pedidos (mesas, personas, nota), cada plato (nombre, precio, cantidad, nota), las asignaciones de mesa y los nombres de las cuentas. En claro solo quedan los datos técnicos para ordenar y filtrar (estado, pase, cocina/barra, fechas).
- Los pedidos cerrados se borran a los 30 días y las asignaciones de días pasados al día siguiente.
- Tablas nuevas (versión 11 de la base de datos, se crean solas al actualizar): `sala_kv`, `sala_users`, `sala_tokens`, `sala_orders`, `sala_items`, `sala_assign`.

## Pruebas

`bash tests/run.sh` crea una base de datos SQLite temporal y prueba el plano, la asignación automática (mesa ajustada, juntar mesas, tiempo de mesa, cancelar, modo «al confirmar»), los pedidos, la cocina, las cuentas y que todo quede cifrado.

## Pedidos por QR

Los clientes pueden pedir desde el móvil escaneando el QR de su mesa: ver [PEDIDOS-QR.md](PEDIDOS-QR.md).
