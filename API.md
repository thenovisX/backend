# API

Todas las rutas son `api/?r=<ruta>`. Las respuestas son JSON: `{"ok": true, "data": …}` o `{"ok": false, "error": "mensaje para el usuario"}`.
GET para leer y POST con JSON (`Content-Type: application/json`) para escribir.

## Públicas (las usa la web)

| Ruta | Método | Datos | Devuelve |
|---|---|---|---|
| `ping` | GET | — | nombre del restaurante |
| `info` | GET | — | nombre, frase, contacto, horario, días cerrados, políticas |
| `menu` | GET | — | carta: `categories` (con `dishes`) y `allergens` |
| `slots&date=AAAA-MM-DD` | GET | — | `open`, `reason`, `slots: [{time, left}]` |
| `reserve` | POST | `date`, `time`, `people`, `name`, `phone`, `email`?, `notes`?, `privacy: 1`, `website: ''` | `id`, `when`, `message`, `linked` (sale en una cuenta), `email` |

Límite: 5 reservas por hora desde la misma conexión. `website` es un campo trampa para bots y tiene que ir vacío.

## Clientes (cookie de sesión, mismo dominio)

| Ruta | Método | Datos |
|---|---|---|
| `c_me` | GET | — (cliente con sesión o `null`) |
| `c_register` | POST | `name`, `email`, `phone`?, `password`, `privacy: 1` → envía el email de activación |
| `c_resend` | POST | `email` |
| `c_login` | POST | `email`, `password` |
| `c_logout` | POST | — |
| `c_reservations` | GET | — (`upcoming`, `past`) |
| `c_confirm` | POST | `id` |
| `c_cancel` | POST | `id` |
| `c_profile` | POST | `name`, `phone`, `email`, `password`?, `new_password`? |
| `c_delete` | POST | `password` |
| `c_export` | GET | — (descarga JSON con todos sus datos) |

## Gestión (app; cabecera `X-Token`, que se obtiene con `login`)

Todos los usuarios pueden leer reservas y carta. Para cambiar hacen falta permisos: `reservas` (estado, guardar, borrar y cerrar días), `carta` (secciones y platos) y `ajustes` (ajustes, fotos y email de prueba). El administrador los tiene todos y gestiona los usuarios. Sin permiso, la API responde 403.

| Ruta | Método | Datos |
|---|---|---|
| `login` | POST | `username`, `password` → `token` y `me` (rol y permisos) |
| `logout`, `me` | POST / GET | — |
| `users` | GET | (administrador) lista de usuarios y permisos posibles |
| `user_save` | POST | (administrador) `id`?, `username`, `name`, `password`?, `role` (`admin` o `staff`), `perms` (`reservas`, `carta`, `ajustes`), `active` |
| `user_delete` | POST | (administrador) `id` |
| `reservations&from=&to=` | GET | reservas entre dos fechas |
| `requests` | GET | `nuevas` y `esperando` |
| `month&month=AAAA-MM` | GET | resumen por día |
| `changes&since=N` | GET | novedades desde el número N (avisos) |
| `slots_admin&date=` | GET | plazas sin las reglas de antelación |
| `reservation_status` | POST | `id`, `status` (`esperando`, `confirmada`, `rechazada`, `cancelada`) |
| `reservation_save` | POST | `id`? y los datos de la reserva |
| `reservation_delete` | POST | `id` (desaparece de la app; el enlace del cliente dirá «cancelada») |
| `admin_menu` | GET | carta completa, también lo agotado |
| `category_save`, `category_move`, `category_delete` | POST | `id`, `name` / `dir` |
| `dish_save` | POST multipart | `id`?, `name`, `price`, `category_id`, `description`, `allergens` (separados por comas), `available`, `featured`, `photo` (archivo), `remove_photo` |
| `dish_toggle`, `dish_move`, `dish_delete` | POST | `id`, `available` / `dir` |
| `settings` | GET | ajustes (sin la contraseña del correo) + huecos de foto del tema |
| `settings_save` | POST | cualquier ajuste |
| `web_photo` / `web_photo_reset` | POST | `key` (hueco de `TEMA_FOTOS`), `photo` (archivo) |
| `mail_test` | POST | `to`? → envía un email de prueba |
| `password` | POST | `current`, `new` |
