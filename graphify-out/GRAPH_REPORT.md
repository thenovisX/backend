# Graph Report - backend  (2026-11-05)

## Corpus Check
- 93 files · ~143,330 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 35 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 6)

## Summary
- 1076 nodes · 3058 edges · 91 communities (39 shown, 52 thin omitted)
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 905 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0fc3f386`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- schema.php
- t
- www/app.js
- panel/app.js
- lib/carta.php
- with
- restaurante.js
- package.json
- hostinger.yml
- traductor.php
- ExampleInstrumentedTest.java
- consent.js
- make_icons.py
- MainActivity.java
- Guía de tu web de reservas
- www/sw.js
- build-panel.sh
- panel/sw.js
- web/sw.js
- core.php
- sala.js
- CLAUDE.md
- reservas.php
- auth.php
- sala.php
- q
- settings
- Cómo hacer un tema
- settings
- Auditoría de seguridad (29 de octubre de 2026)
- login
- i18n.php
- mesa_test.php
- ValidationError
- fotos.php
- mesa.js
- run.sh
- clientes.php
- mesa.php
- now
- sala_layout
- sala_prefs
- Backend para webs de restaurantes
- qr.php
- Sala y cocina
- README.md
- abrir
- Seguridad y plan de respuesta a incidentes
- sala_order_row
- 5. WhatsApp automático (opcional)

## God Nodes (most connected - your core abstractions)
1. `q()` - 142 edges
2. `settings()` - 74 edges
3. `ValidationError` - 68 edges
4. `t()` - 40 edges
5. `now()` - 38 edges
6. `api()` - 35 edges
7. `api()` - 35 edges
8. `dec()` - 30 edges
9. `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` - 27 edges
10. `lang()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `8.3 `remove_upload()` · Baja · corregido` --references--> `remove_upload()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/carta.php
- `Datos y cifrado` --references--> `enc()`  [INFERRED]
  docs/SALA-Y-COCINA.md → web/lib/cifrado.php
- `3.1 SQL / NoSQL injection · cumple` --references--> `q()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `Pendiente / recomendaciones (segunda revisión)` --references--> `throttle_take()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `6.3 Logs · Baja · corregido` --references--> `dev_log()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php

## Import Cycles
- None detected.

## Communities (91 total, 52 thin omitted)

### Community 1 - "t"
Cohesion: 0.11
Nodes (26): Funciones disponibles, Idiomas, La carta: `$carta`, csp_nonce(), ranges_text(), social_url(), day_name(), tr() (+18 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.09
Nodes (40): Gestión (app; cabecera `X-Token`, que se obtiene con `login`), 4.2 Carta y precios · cumple, 4.3 Llamadas / APIs de terceros · cumple, 4. Lógica de negocio y condiciones de carrera, allergen_list(), carta_toggle(), {closure#2}(), {closure#3}() (+32 more)

### Community 5 - "with"
Cohesion: 0.06
Nodes (31): runs-on, steps, concurrency, cancel-in-progress, group, ANDROID_KEY_PASSWORD, ANDROID_KEYSTORE_PASSWORD, jobs (+23 more)

### Community 6 - "restaurante.js"
Cohesion: 0.17
Nodes (30): addDays(), api(), callStatus(), emit(), esc(), isClosed(), iso(), lbBuild() (+22 more)

### Community 7 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, @capacitor/android@^8.5.3, @capacitor/core@^8.5.3, @capacitor/local-notifications@^8.3.1, description, devDependencies, @capacitor/assets@^3.0.5, @capacitor/cli@^8.5.3 (+12 more)

### Community 8 - "hostinger.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, jobs, publicar, name, on, push (+11 more)

### Community 9 - "traductor.php"
Cohesion: 0.19
Nodes (12): tr_hash(), {closure#3}(), tr_after_save(), tr_http(), tr_set(), tr_split(), translatable_texts(), translate_batch() (+4 more)

### Community 11 - "consent.js"
Cohesion: 0.36
Nodes (9): apply(), choose(), close(), L(), loadScript(), read(), save(), show() (+1 more)

### Community 15 - "Guía de tu web de reservas"
Cohesion: 0.15
Nodes (13): 1. Antes de empezar: lo que necesitas, 2.1. Crear la base de datos (MySQL), 2.2. Subir la web, 2.3. Instalar, 2. Poner la web en marcha en Hostinger, 3. La app de gestión, 4.1. Que los emails lleguen bien (Gmail), 4. Primeros ajustes (+5 more)

### Community 55 - "core.php"
Cohesion: 0.12
Nodes (21): save_category(), crypto_key(), crypto_ready(), dec(), email_idx(), enc(), cfg(), clean_hours() (+13 more)

### Community 56 - "sala.js"
Cohesion: 0.08
Nodes (80): addFloor(), addLine(), addMenu(), addTable(), alignTo(), api(), beep(), billRows() (+72 more)

### Community 59 - "reservas.php"
Cohesion: 0.12
Nodes (37): 2.1 IDOR · cumple, 4.1 Reservas concurrentes · **Alta** · corregido, erase_confirm(), can_cancel(), customer_cancel(), customer_confirm(), customer_reservations(), is_date() (+29 more)

### Community 60 - "auth.php"
Cohesion: 0.16
Nodes (14): Sala y cocina (`sala/api.php?r=…`, cabecera `X-Token` de `login` con una cuenta de sala), res(), tables_of(), active_admins(), logout(), request_token(), user_can(), user_delete() (+6 more)

### Community 61 - "sala.php"
Cohesion: 0.06
Nodes (10): mesa_new_pin(), {closure#17}(), sala_assignments(), sala_fingerprint(), sala_items_status(), sala_order_apply(), sala_res_label(), sala_reservations() (+2 more)

### Community 62 - "q"
Cohesion: 0.22
Nodes (16): customer_delete_admin(), customers_list(), erase_by_token(), erase_dismiss(), erase_find(), erase_pending(), erase_pending_count(), erase_request() (+8 more)

### Community 63 - "settings"
Cohesion: 0.19
Nodes (20): fmt_date_l(), wa_href(), {closure#1}(), {closure#2}(), {closure#4}(), {closure#5}(), {closure#6}(), {closure#7}() (+12 more)

### Community 64 - "Cómo hacer un tema"
Cohesion: 0.10
Nodes (17): Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Datos del restaurante: `$s`, Fotos ampliables, Huecos de foto: `TEMA_FOTOS`, Icono de la app (+9 more)

### Community 65 - "settings"
Cohesion: 0.21
Nodes (23): {closure#1}(), erase_url(), send_activation(), base_url(), dev_log(), mail_via_google(), send_mail(), settings() (+15 more)

### Community 66 - "Auditoría de seguridad (29 de octubre de 2026)"
Cohesion: 0.07
Nodes (37): 2.2 Separación de roles · Media · corregido, 2.3 Protección de endpoints · cumple, 2. Control de acceso y autorización, 3.1 SQL / NoSQL injection · cumple, 3.2 XSS · Media · reforzado, 3.3 CSRF · Baja · reforzado, 3. Validación de entradas y sanitización, 5.2 Spam de reservas · Media · corregido (+29 more)

### Community 67 - "login"
Cohesion: 0.26
Nodes (25): 1.1 Hashing de contraseñas · Baja · corregido, 5.1 Fuerza bruta · **Alta** · corregido, 6.2 Fuga de datos en respuestas · cumple, change_password(), login(), customer_attempts_guard(), customer_delete(), customer_login() (+17 more)

### Community 68 - "i18n.php"
Cohesion: 0.29
Nodes (9): detect_lang(), i18n_dict(), lang_url(), langs_on(), month_name(), t_msg(), tema_lang(), flag_svg() (+1 more)

### Community 69 - "mesa_test.php"
Cohesion: 0.11
Nodes (23): {closure#10}(), {closure#11}(), {closure#12}(), {closure#13}(), {closure#14}(), {closure#15}(), {closure#17}(), {closure#18}() (+15 more)

### Community 72 - "ValidationError"
Cohesion: 0.20
Nodes (16): customer_export(), audit(), customer_reset(), reset_create(), reset_find(), reset_password_ok(), reset_use(), user_forgot() (+8 more)

### Community 73 - "fotos.php"
Cohesion: 0.35
Nodes (10): {closure#1}(), is_unsplash(), photo(), photo_abs(), photo_alt(), photo_cache_file(), photo_credits(), photo_img() (+2 more)

### Community 74 - "mesa.js"
Cohesion: 0.13
Nodes (41): API, Clientes (cookie de sesión, mismo dominio), Pedidos por QR (`mesa/api.php?r=…`, cabecera `X-Mesa` de `join`; sin CORS), Públicas (las usa la web), Contra pedidos desde casa (y otros abusos), Cómo se usa, Datos, Pedidos por QR desde la mesa (+33 more)

### Community 77 - "clientes.php"
Cohesion: 0.28
Nodes (12): 1.2 Cookies y tokens · cumple, 1.3 Recuperación de cuenta · cumple, 1.4 Cierre de sesión y rotación · **Alta** · corregido, 1. Autenticación y gestión de sesiones, {closure#1}(), current_customer(), customer_activate(), customer_login_session() (+4 more)

### Community 78 - "mesa.php"
Cohesion: 0.13
Nodes (16): {closure#1}(), {closure#2}(), {closure#3}(), {closure#9}(), {closure#6}(), ip_matches(), mesa_info(), mesa_ip_ok() (+8 more)

### Community 79 - "now"
Cohesion: 0.21
Nodes (17): now(), sala_assign_auto(), sala_assign_clear(), sala_assign_manual(), sala_assign_store(), sala_bump(), sala_check_tables(), sala_item_status() (+9 more)

### Community 80 - "sala_layout"
Cohesion: 0.18
Nodes (16): {closure#21}(), ip_rule_valid(), mesa_keys(), mesa_new_key(), mesa_order_qr(), mesa_qr_list(), mesa_rotate(), mesa_url() (+8 more)

### Community 81 - "sala_prefs"
Cohesion: 0.21
Nodes (13): public_info(), today(), sala_adjacent(), sala_assign_pending(), sala_assign_valid(), sala_busy(), sala_find_tables(), sala_group_seats() (+5 more)

### Community 82 - "Backend para webs de restaurantes"
Cohesion: 0.18
Nodes (11): 1. Subir la web a Hostinger, 2. App de gestión, 3. Enviar los emails desde Gmail, 4. WhatsApp automático (opcional, API de Meta), Backend para webs de restaurantes, Cómo funcionan las reservas, Desarrollo, Empezar la web de un cliente nuevo (+3 more)

### Community 83 - "qr.php"
Cohesion: 0.27
Nodes (5): qr_gf_mul(), qr_matrix(), qr_penalty(), qr_rs_divisor(), qr_rs_remainder()

### Community 84 - "Sala y cocina"
Cohesion: 0.22
Nodes (9): Asignación automática de mesas a las reservas, Cómo se entra, Datos y cifrado, El plano (encargado → Plano), Pantalla de cocina, Pedidos por QR, Pedidos (sala), Pruebas (+1 more)

### Community 86 - "abrir"
Cohesion: 0.29
Nodes (7): Menús y carta principal, carta_on(), days_text(), menus_public(), al_icon(), html_lang(), abrir()

### Community 87 - "Seguridad y plan de respuesta a incidentes"
Cohesion: 0.33
Nodes (6): Contactos, Copias de seguridad, Qué protege la web, Revisión legal (octubre 2026), Seguridad y plan de respuesta a incidentes, Si hay una brecha de seguridad (RGPD art. 33 y 34)

### Community 88 - "sala_order_row"
Cohesion: 0.50
Nodes (5): mesa_order_for(), sala_item_row(), sala_kitchen(), sala_order_row(), sala_orders_open()

### Community 89 - "5. WhatsApp automático (opcional)"
Cohesion: 0.50
Nodes (4): 5.1. Preparar Meta, 5.2. Ponerlo en la app, 5.3. Que los recordatorios salgan a su hora (tarea programada), 5. WhatsApp automático (opcional)

## Knowledge Gaps
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `restaurante.js` to `www/app.js`, `panel/app.js`, `README.md`, `Auditoría de seguridad (29 de octubre de 2026)`?**
  _High betweenness centrality (0.246) - this node is a cross-community bridge._
- **Are the 126 inferred relationships involving `q()` (e.g. with `3.1 SQL / NoSQL injection · cumple` and `reset_throttle()`) actually correct?**
  _`q()` has 126 INFERRED edges - model-reasoned connections that need verification._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.10752688172043011 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `t`, `lib/carta.php`, `traductor.php`, `core.php`, `reservas.php`, `auth.php`, `sala.php`, `settings`, `settings`, `Auditoría de seguridad (29 de octubre de 2026)`, `login`, `mesa_test.php`, `ValidationError`, `clientes.php`, `mesa.php`, `now`, `sala_layout`, `sala_prefs`, `sala_order_row`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Are the 66 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `4.1 Reservas concurrentes · **Alta** · corregido`) actually correct?**
  _`settings()` has 66 INFERRED edges - model-reasoned connections that need verification._
- **Should `www/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10035087719298245 - nodes in this community are weakly interconnected._
- **Why does `editSalaUser()` connect `panel/app.js` to `restaurante.js`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._