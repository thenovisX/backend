# Graph Report - backend  (2026-11-05)

## Corpus Check
- 93 files · ~139,313 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 35 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 6)

## Summary
- 1051 nodes · 2974 edges · 89 communities (37 shown, 52 thin omitted)
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 892 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a1d27e0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mesa.js
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
- now
- sala.php
- dec
- settings
- Cómo hacer un tema
- mesa_test.php
- Auditoría de seguridad (29 de octubre de 2026)
- login
- lang
- schema.php
- q
- fotos.php
- settings
- run.sh
- mesa.php
- sala_bump
- Backend para webs de restaurantes
- qr.php
- erase_confirm
- Sala y cocina
- sala_item_status
- Seguridad y plan de respuesta a incidentes
- 5. WhatsApp automático (opcional)
- Pedidos por QR desde la mesa

## God Nodes (most connected - your core abstractions)
1. `q()` - 139 edges
2. `settings()` - 74 edges
3. `ValidationError` - 67 edges
4. `t()` - 40 edges
5. `now()` - 37 edges
6. `api()` - 35 edges
7. `api()` - 35 edges
8. `dec()` - 30 edges
9. `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` - 27 edges
10. `lang()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `3.1 SQL / NoSQL injection · cumple` --references--> `q()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `6.3 Logs · Baja · corregido` --references--> `dev_log()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `8.2 Enlaces de email con la cabecera Host · Media · corregido` --references--> `base_url()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `Datos y cifrado` --references--> `enc()`  [INFERRED]
  docs/SALA-Y-COCINA.md → web/lib/cifrado.php
- `Clientes (cookie de sesión, mismo dominio)` --references--> `t()`  [INFERRED]
  API.md → web/lib/i18n.php

## Import Cycles
- None detected.

## Communities (89 total, 52 thin omitted)

### Community 0 - "mesa.js"
Cohesion: 0.21
Nodes (33): addLine(), alChips(), api(), applyStatus(), busy(), callSheet(), cartSheet(), closeSheet() (+25 more)

### Community 1 - "t"
Cohesion: 0.11
Nodes (28): Funciones disponibles, Idiomas, La carta: `$carta`, csp_nonce(), ranges_text(), social_url(), tr(), asset() (+20 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.13
Nodes (23): allergen_list(), {closure#2}(), {closure#3}(), dish_out(), menu_data(), menu_delete(), menu_find(), menu_move() (+15 more)

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
Nodes (11): tr_hash(), {closure#3}(), tr_after_save(), tr_http(), tr_set(), tr_split(), translatable_texts(), translate_batch() (+3 more)

### Community 11 - "consent.js"
Cohesion: 0.36
Nodes (9): apply(), choose(), close(), L(), loadScript(), read(), save(), show() (+1 more)

### Community 15 - "Guía de tu web de reservas"
Cohesion: 0.15
Nodes (13): 1. Antes de empezar: lo que necesitas, 2.1. Crear la base de datos (MySQL), 2.2. Subir la web, 2.3. Instalar, 2. Poner la web en marcha en Hostinger, 3. La app de gestión, 4.1. Que los emails lleguen bien (Gmail), 4. Primeros ajustes (+5 more)

### Community 55 - "core.php"
Cohesion: 0.10
Nodes (25): 5.2 Spam de reservas · Media · corregido, 5.3 Límite global de la API · Media · corregido, 5. Rate limiting y prevención de abuso, 7.2 CORS · Media · corregido, save_category(), crypto_key(), crypto_ready(), email_idx() (+17 more)

### Community 56 - "sala.js"
Cohesion: 0.09
Nodes (70): addFloor(), addLine(), addMenu(), addTable(), api(), beep(), billRows(), busy() (+62 more)

### Community 59 - "reservas.php"
Cohesion: 0.18
Nodes (22): 4.1 Reservas concurrentes · **Alta** · corregido, customer_cancel(), is_date(), restaurant_mail(), cancel_by_link(), confirm_by_customer(), create_public_reservation(), day_slots() (+14 more)

### Community 60 - "now"
Cohesion: 0.14
Nodes (23): Sala y cocina (`sala/api.php?r=…`, cabecera `X-Token` de `login` con una cuenta de sala), res(), active_admins(), logout(), request_token(), require_auth(), user_can(), user_delete() (+15 more)

### Community 61 - "sala.php"
Cohesion: 0.06
Nodes (25): public_info(), today(), mesa_tables_label(), sala_adjacent(), sala_assign_pending(), sala_assign_valid(), sala_assignments(), sala_busy() (+17 more)

### Community 62 - "dec"
Cohesion: 0.18
Nodes (15): tables_of(), {closure#1}(), customers_list(), erase_by_token(), erase_dismiss(), erase_find(), erase_pending(), erase_request() (+7 more)

### Community 63 - "settings"
Cohesion: 0.16
Nodes (26): {closure#1}(), with_lang(), confirm_url(), reject_info(), res_admin(), res_out(), whatsapp_text(), {closure#2}() (+18 more)

### Community 64 - "Cómo hacer un tema"
Cohesion: 0.08
Nodes (23): Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Datos del restaurante: `$s`, Fotos ampliables, Huecos de foto: `TEMA_FOTOS`, Icono de la app (+15 more)

### Community 65 - "mesa_test.php"
Cohesion: 0.10
Nodes (25): {closure#1}(), {closure#10}(), {closure#11}(), {closure#12}(), {closure#13}(), {closure#16}(), {closure#17}(), {closure#18}() (+17 more)

### Community 66 - "Auditoría de seguridad (29 de octubre de 2026)"
Cohesion: 0.08
Nodes (32): 2.2 Separación de roles · Media · corregido, 2.3 Protección de endpoints · cumple, 2. Control de acceso y autorización, 3.1 SQL / NoSQL injection · cumple, 3.2 XSS · Media · reforzado, 3.3 CSRF · Baja · reforzado, 3. Validación de entradas y sanitización, 4.2 Carta y precios · cumple (+24 more)

### Community 67 - "login"
Cohesion: 0.25
Nodes (24): 1.1 Hashing de contraseñas · Baja · corregido, 5.1 Fuerza bruta · **Alta** · corregido, 6.2 Fuga de datos en respuestas · cumple, change_password(), login(), customer_attempts_guard(), customer_delete(), customer_login() (+16 more)

### Community 68 - "lang"
Cohesion: 0.18
Nodes (26): days_text(), send_activation(), base_url(), dev_log(), send_mail(), day_name(), detect_lang(), fmt_date_l() (+18 more)

### Community 72 - "q"
Cohesion: 0.13
Nodes (32): 2.1 IDOR · cumple, erase_pending_count(), delete_category(), delete_dish(), get_dish(), move_dish(), save_dish(), toggle_dish() (+24 more)

### Community 73 - "fotos.php"
Cohesion: 0.35
Nodes (10): {closure#1}(), is_unsplash(), photo(), photo_abs(), photo_alt(), photo_cache_file(), photo_credits(), photo_img() (+2 more)

### Community 74 - "settings"
Cohesion: 0.18
Nodes (17): API, Clientes (cookie de sesión, mismo dominio), Gestión (app; cabecera `X-Token`, que se obtiene con `login`), Públicas (las usa la web), carta_on(), carta_toggle(), menus_button(), menus_button_toggle() (+9 more)

### Community 77 - "mesa.php"
Cohesion: 0.14
Nodes (15): {closure#19}(), ip_matches(), ip_rule_valid(), mesa_ip_ok(), mesa_keys(), mesa_new_key(), mesa_order_qr(), mesa_qr_list() (+7 more)

### Community 78 - "sala_bump"
Cohesion: 0.27
Nodes (15): mesa_call(), mesa_kick(), mesa_new_pin(), mesa_status(), sala_bump(), sala_check_tables(), sala_order_add(), sala_order_close() (+7 more)

### Community 79 - "Backend para webs de restaurantes"
Cohesion: 0.18
Nodes (11): 1. Subir la web a Hostinger, 2. App de gestión, 3. Enviar los emails desde Gmail, 4. WhatsApp automático (opcional, API de Meta), Backend para webs de restaurantes, Cómo funcionan las reservas, Desarrollo, Empezar la web de un cliente nuevo (+3 more)

### Community 80 - "qr.php"
Cohesion: 0.27
Nodes (5): qr_gf_mul(), qr_matrix(), qr_penalty(), qr_rs_divisor(), qr_rs_remainder()

### Community 81 - "erase_confirm"
Cohesion: 0.33
Nodes (9): 1.2 Cookies y tokens · cumple, 1.3 Recuperación de cuenta · cumple, 1.4 Cierre de sesión y rotación · **Alta** · corregido, 1. Autenticación y gestión de sesiones, erase_confirm(), current_customer(), customer_logout(), customer_session() (+1 more)

### Community 82 - "Sala y cocina"
Cohesion: 0.22
Nodes (9): Asignación automática de mesas a las reservas, Cómo se entra, Datos y cifrado, El plano (encargado → Plano), Pantalla de cocina, Pedidos por QR, Pedidos (sala), Pruebas (+1 more)

### Community 84 - "sala_item_status"
Cohesion: 0.33
Nodes (7): {closure#15}(), sala_item_row(), sala_item_status(), sala_items_status(), sala_kitchen(), sala_order_row(), sala_orders_open()

### Community 85 - "Seguridad y plan de respuesta a incidentes"
Cohesion: 0.33
Nodes (6): Contactos, Copias de seguridad, Qué protege la web, Revisión legal (octubre 2026), Seguridad y plan de respuesta a incidentes, Si hay una brecha de seguridad (RGPD art. 33 y 34)

### Community 86 - "5. WhatsApp automático (opcional)"
Cohesion: 0.50
Nodes (4): 5.1. Preparar Meta, 5.2. Ponerlo en la app, 5.3. Que los recordatorios salgan a su hora (tarea programada), 5. WhatsApp automático (opcional)

### Community 87 - "Pedidos por QR desde la mesa"
Cohesion: 0.50
Nodes (4): Contra pedidos desde casa (y otros abusos), Cómo se usa, Datos, Pedidos por QR desde la mesa

## Knowledge Gaps
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `restaurante.js` to `www/app.js`, `panel/app.js`, `Auditoría de seguridad (29 de octubre de 2026)`?**
  _High betweenness centrality (0.217) - this node is a cross-community bridge._
- **Are the 125 inferred relationships involving `q()` (e.g. with `3.1 SQL / NoSQL injection · cumple` and `reset_throttle()`) actually correct?**
  _`q()` has 125 INFERRED edges - model-reasoned connections that need verification._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.10873440285204991 - nodes in this community are weakly interconnected._
- **Why does `Resumen` connect `Auditoría de seguridad (29 de octubre de 2026)` to `Cómo hacer un tema`, `lang`, `restaurante.js`, `settings`, `now`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **Are the 66 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `4.1 Reservas concurrentes · **Alta** · corregido`) actually correct?**
  _`settings()` has 66 INFERRED edges - model-reasoned connections that need verification._
- **Should `www/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10035087719298245 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `mesa_test.php`, `Auditoría de seguridad (29 de octubre de 2026)`, `login`, `lib/carta.php`, `lang`, `t`, `traductor.php`, `settings`, `mesa.php`, `sala_bump`, `erase_confirm`, `sala_item_status`, `core.php`, `reservas.php`, `now`, `sala.php`, `dec`, `settings`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._