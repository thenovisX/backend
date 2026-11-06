# Graph Report - backend  (2026-11-06)

## Corpus Check
- 93 files · ~145,978 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 35 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 6)

## Summary
- 1075 nodes · 3048 edges · 89 communities (38 shown, 51 thin omitted)
- Extraction: 71% EXTRACTED · 29% INFERRED · 0% AMBIGUOUS · INFERRED: 895 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d59bdd3e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mesa_test.php
- pagina.php
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
- README.md
- www/sw.js
- build-panel.sh
- panel/sw.js
- web/sw.js
- core.php
- sala.js
- CLAUDE.md
- reservas.php
- ValidationError
- sala.php
- q
- whatsapp.php
- Cómo hacer un tema
- auth.php
- Auditoría de seguridad (29 de octubre de 2026)
- login
- lang
- mesa.php
- ValidationError
- fotos.php
- mesa.js
- run.sh
- settings
- sala_prefs
- sala_layout
- Backend para webs de restaurantes
- qr.php
- Guía de tu web de reservas
- Sala y cocina
- Pedidos por QR desde la mesa
- 2. Poner la web en marcha en Hostinger
- 5. WhatsApp automático (opcional)
- schema.php

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
- `8.3 `remove_upload()` · Baja · corregido` --references--> `remove_upload()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/carta.php
- `Datos y cifrado` --references--> `enc()`  [INFERRED]
  docs/SALA-Y-COCINA.md → web/lib/cifrado.php
- `5.3 Límite global de la API · Media · corregido` --references--> `api_rate_limit()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `8.2 Enlaces de email con la cabecera Host · Media · corregido` --references--> `base_url()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `6.3 Logs · Baja · corregido` --references--> `dev_log()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php

## Import Cycles
- None detected.

## Communities (89 total, 51 thin omitted)

### Community 0 - "mesa_test.php"
Cohesion: 0.12
Nodes (21): {closure#10}(), {closure#11}(), {closure#12}(), {closure#13}(), {closure#15}(), {closure#16}(), {closure#17}(), {closure#18}() (+13 more)

### Community 1 - "pagina.php"
Cohesion: 0.11
Nodes (24): Funciones disponibles, Idiomas, La carta: `$carta`, ranges_text(), social_url(), tr(), asset(), {closure#1}() (+16 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.11
Nodes (28): allergen_list(), {closure#3}(), dish_out(), menu_data(), menu_delete(), menu_find(), menu_move(), menu_norm() (+20 more)

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

### Community 15 - "README.md"
Cohesion: 0.18
Nodes (6): Contactos, Copias de seguridad, Qué protege la web, Revisión legal (octubre 2026), Seguridad y plan de respuesta a incidentes, Si hay una brecha de seguridad (RGPD art. 33 y 34)

### Community 55 - "core.php"
Cohesion: 0.10
Nodes (35): {closure#2}(), crypto_key(), crypto_ready(), dec(), email_idx(), enc(), customer_register(), send_activation() (+27 more)

### Community 56 - "sala.js"
Cohesion: 0.08
Nodes (88): addFloor(), addLine(), addMenu(), addTable(), alignTo(), alignVertex(), api(), beep() (+80 more)

### Community 59 - "reservas.php"
Cohesion: 0.11
Nodes (39): 2.1 IDOR · cumple, 4.1 Reservas concurrentes · **Alta** · corregido, res(), erase_confirm(), save_category(), customer_cancel(), customer_confirm(), db() (+31 more)

### Community 60 - "ValidationError"
Cohesion: 0.24
Nodes (16): customer_delete_admin(), delete_category(), customer_export(), audit(), ValidationError, customer_reset(), reset_find(), reset_password_ok() (+8 more)

### Community 61 - "sala.php"
Cohesion: 0.06
Nodes (12): mesa_new_pin(), {closure#17}(), {closure#22}(), sala_fingerprint(), sala_item_row(), sala_items_status(), sala_kitchen(), sala_order_apply() (+4 more)

### Community 62 - "q"
Cohesion: 0.14
Nodes (22): tables_of(), {closure#1}(), customers_list(), erase_by_token(), erase_dismiss(), erase_find(), erase_pending(), erase_pending_count() (+14 more)

### Community 63 - "whatsapp.php"
Cohesion: 0.17
Nodes (20): MesaAuthError, wa_href(), {closure#1}(), {closure#2}(), {closure#4}(), {closure#5}(), {closure#6}(), {closure#7}() (+12 more)

### Community 64 - "Cómo hacer un tema"
Cohesion: 0.09
Nodes (21): Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Datos del restaurante: `$s`, Fotos ampliables, Huecos de foto: `TEMA_FOTOS`, Icono de la app (+13 more)

### Community 65 - "auth.php"
Cohesion: 0.20
Nodes (14): Sala y cocina (`sala/api.php?r=…`, cabecera `X-Token` de `login` con una cuenta de sala), 1.4 Cierre de sesión y rotación · **Alta** · corregido, active_admins(), logout(), request_token(), require_auth(), user_can(), user_delete() (+6 more)

### Community 66 - "Auditoría de seguridad (29 de octubre de 2026)"
Cohesion: 0.06
Nodes (37): 1.2 Cookies y tokens · cumple, 1.3 Recuperación de cuenta · cumple, 1. Autenticación y gestión de sesiones, 2.2 Separación de roles · Media · corregido, 2.3 Protección de endpoints · cumple, 2. Control de acceso y autorización, 3.1 SQL / NoSQL injection · cumple, 3.2 XSS · Media · reforzado (+29 more)

### Community 67 - "login"
Cohesion: 0.17
Nodes (31): 1.1 Hashing de contraseñas · Baja · corregido, 5.1 Fuerza bruta · **Alta** · corregido, 6.2 Fuga de datos en respuestas · cumple, change_password(), login(), can_cancel(), {closure#1}(), current_customer() (+23 more)

### Community 68 - "lang"
Cohesion: 0.23
Nodes (20): days_text(), day_name(), detect_lang(), fmt_date_l(), i18n_dict(), lang(), lang_url(), langs_on() (+12 more)

### Community 69 - "mesa.php"
Cohesion: 0.14
Nodes (15): {closure#1}(), {closure#2}(), {closure#3}(), ip_matches(), mesa_info(), mesa_ip_ok(), mesa_order_for(), mesa_order_qr() (+7 more)

### Community 72 - "ValidationError"
Cohesion: 0.19
Nodes (19): now(), mesa_call(), sala_assign_auto(), sala_assign_clear(), sala_assign_manual(), sala_assign_store(), sala_bump(), sala_check_tables() (+11 more)

### Community 73 - "fotos.php"
Cohesion: 0.35
Nodes (10): {closure#1}(), is_unsplash(), photo(), photo_abs(), photo_alt(), photo_cache_file(), photo_credits(), photo_img() (+2 more)

### Community 74 - "mesa.js"
Cohesion: 0.21
Nodes (33): addLine(), alChips(), api(), applyStatus(), busy(), callSheet(), cartSheet(), closeSheet() (+25 more)

### Community 77 - "settings"
Cohesion: 0.22
Nodes (13): API, Clientes (cookie de sesión, mismo dominio), Gestión (app; cabecera `X-Token`, que se obtiene con `login`), Pedidos por QR (`mesa/api.php?r=…`, cabecera `X-Mesa` de `join`; sin CORS), Públicas (las usa la web), carta_on(), carta_toggle(), menus_button() (+5 more)

### Community 78 - "sala_prefs"
Cohesion: 0.16
Nodes (17): public_info(), today(), body_end(), sala_adjacent(), sala_assign_pending(), sala_assign_valid(), sala_assignments(), sala_busy() (+9 more)

### Community 79 - "sala_layout"
Cohesion: 0.22
Nodes (13): {closure#19}(), ip_rule_valid(), mesa_keys(), mesa_new_key(), mesa_rotate(), mesa_table(), sala_kv_get(), sala_kv_set() (+5 more)

### Community 80 - "Backend para webs de restaurantes"
Cohesion: 0.18
Nodes (11): 1. Subir la web a Hostinger, 2. App de gestión, 3. Enviar los emails desde Gmail, 4. WhatsApp automático (opcional, API de Meta), Backend para webs de restaurantes, Cómo funcionan las reservas, Desarrollo, Empezar la web de un cliente nuevo (+3 more)

### Community 81 - "qr.php"
Cohesion: 0.27
Nodes (5): qr_gf_mul(), qr_matrix(), qr_penalty(), qr_rs_divisor(), qr_rs_remainder()

### Community 82 - "Guía de tu web de reservas"
Cohesion: 0.22
Nodes (9): 1. Antes de empezar: lo que necesitas, 3. La app de gestión, 4.1. Que los emails lleguen bien (Gmail), 4. Primeros ajustes, 6.1. Sala y cocina: mesas, pedidos y pantalla de cocina, 6. El día a día, 7. Preguntas frecuentes, Guía de tu web de reservas (+1 more)

### Community 83 - "Sala y cocina"
Cohesion: 0.22
Nodes (9): Asignación automática de mesas a las reservas, Cómo se entra, Datos y cifrado, El plano (encargado → Plano), Pantalla de cocina, Pedidos por QR, Pedidos (sala), Pruebas (+1 more)

### Community 84 - "Pedidos por QR desde la mesa"
Cohesion: 0.33
Nodes (4): Contra pedidos desde casa (y otros abusos), Cómo se usa, Datos, Pedidos por QR desde la mesa

### Community 86 - "2. Poner la web en marcha en Hostinger"
Cohesion: 0.50
Nodes (4): 2.1. Crear la base de datos (MySQL), 2.2. Subir la web, 2.3. Instalar, 2. Poner la web en marcha en Hostinger

### Community 87 - "5. WhatsApp automático (opcional)"
Cohesion: 0.50
Nodes (4): 5.1. Preparar Meta, 5.2. Ponerlo en la app, 5.3. Que los recordatorios salgan a su hora (tarea programada), 5. WhatsApp automático (opcional)

## Knowledge Gaps
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `restaurante.js` to `www/app.js`, `panel/app.js`, `Auditoría de seguridad (29 de octubre de 2026)`?**
  _High betweenness centrality (0.196) - this node is a cross-community bridge._
- **Are the 125 inferred relationships involving `q()` (e.g. with `3.1 SQL / NoSQL injection · cumple` and `reset_throttle()`) actually correct?**
  _`q()` has 125 INFERRED edges - model-reasoned connections that need verification._
- **Should `mesa_test.php` be split into smaller, more focused modules?**
  _Cohesion score 0.11692307692307692 - nodes in this community are weakly interconnected._
- **Why does `Resumen` connect `Auditoría de seguridad (29 de octubre de 2026)` to `Cómo hacer un tema`, `auth.php`, `lib/carta.php`, `restaurante.js`, `core.php`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Are the 66 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `4.1 Reservas concurrentes · **Alta** · corregido`) actually correct?**
  _`settings()` has 66 INFERRED edges - model-reasoned connections that need verification._
- **Should `pagina.php` be split into smaller, more focused modules?**
  _Cohesion score 0.11264367816091954 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `mesa_test.php`, `auth.php`, `Auditoría de seguridad (29 de octubre de 2026)`, `login`, `lib/carta.php`, `pagina.php`, `mesa.php`, `lang`, `ValidationError`, `traductor.php`, `settings`, `sala_prefs`, `sala_layout`, `core.php`, `reservas.php`, `ValidationError`, `sala.php`, `whatsapp.php`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._