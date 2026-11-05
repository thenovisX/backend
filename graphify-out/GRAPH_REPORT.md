# Graph Report - backend  (2026-11-05)

## Corpus Check
- 87 files · ~129,878 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 5)

## Summary
- 948 nodes · 2696 edges · 79 communities (30 shown, 49 thin omitted)
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 809 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a1d27e0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dec
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
- Cómo hacer un tema
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
- db
- Auditoría de seguridad (29 de octubre de 2026)
- login
- lang
- ValidationError
- ValidationError
- fotos.php
- settings
- run.sh
- clientes.php
- now

## God Nodes (most connected - your core abstractions)
1. `q()` - 133 edges
2. `settings()` - 72 edges
3. `ValidationError` - 62 edges
4. `t()` - 40 edges
5. `api()` - 35 edges
6. `api()` - 35 edges
7. `now()` - 34 edges
8. `dec()` - 30 edges
9. `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` - 27 edges
10. `lang()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Datos y cifrado` --references--> `enc()`  [INFERRED]
  docs/SALA-Y-COCINA.md → web/lib/cifrado.php
- `Clientes (cookie de sesión, mismo dominio)` --references--> `t()`  [INFERRED]
  API.md → web/lib/i18n.php
- `Cuenta del cliente: atributos `data-*`` --references--> `t()`  [INFERRED]
  TEMA.md → web/lib/i18n.php
- `8.3 `remove_upload()` · Baja · corregido` --references--> `remove_upload()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/carta.php
- `8.2 Enlaces de email con la cabecera Host · Media · corregido` --references--> `base_url()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php

## Import Cycles
- None detected.

## Communities (79 total, 49 thin omitted)

### Community 0 - "dec"
Cohesion: 0.29
Nodes (9): crypto_key(), crypto_ready(), dec(), email_idx(), cfg(), ensure_schema(), installed(), {closure#19}() (+1 more)

### Community 1 - "t"
Cohesion: 0.11
Nodes (23): Funciones disponibles, Idiomas, La carta: `$carta`, csp_nonce(), social_url(), tr(), tr_hash(), asset() (+15 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.11
Nodes (29): 4.2 Carta y precios · cumple, allergen_list(), {closure#2}(), {closure#3}(), delete_category(), delete_dish(), dish_out(), get_dish() (+21 more)

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
Nodes (10): {closure#3}(), tr_after_save(), tr_http(), tr_set(), tr_split(), translatable_texts(), translate_batch(), translate_pending() (+2 more)

### Community 11 - "consent.js"
Cohesion: 0.36
Nodes (9): apply(), choose(), close(), L(), loadScript(), read(), save(), show() (+1 more)

### Community 15 - "Cómo hacer un tema"
Cohesion: 0.04
Nodes (42): 1. Antes de empezar: lo que necesitas, 2.1. Crear la base de datos (MySQL), 2.2. Subir la web, 2.3. Instalar, 2. Poner la web en marcha en Hostinger, 3. La app de gestión, 4.1. Que los emails lleguen bien (Gmail), 4. Primeros ajustes (+34 more)

### Community 55 - "core.php"
Cohesion: 0.14
Nodes (9): clean_hours(), {closure#4}(), cors_allowed(), cors_headers(), is_time(), purge_old_reservations(), rate_limit_cleanup(), smtp_send() (+1 more)

### Community 56 - "sala.js"
Cohesion: 0.09
Nodes (77): addFloor(), addLine(), addMenu(), addTable(), alignTo(), api(), beep(), billRows() (+69 more)

### Community 59 - "reservas.php"
Cohesion: 0.12
Nodes (34): 2.1 IDOR · cumple, 4.1 Reservas concurrentes · **Alta** · corregido, can_cancel(), customer_cancel(), customer_confirm(), customer_reservations(), is_date(), restaurant_mail() (+26 more)

### Community 60 - "auth.php"
Cohesion: 0.20
Nodes (17): 2.3 Protección de endpoints · cumple, 3.3 CSRF · Baja · reforzado, Resumen, logout(), request_token(), require_admin(), require_auth(), require_perm() (+9 more)

### Community 61 - "sala.php"
Cohesion: 0.07
Nodes (26): today(), sala_adjacent(), sala_assign_auto(), sala_assign_clear(), sala_assign_manual(), sala_assign_pending(), sala_assign_store(), sala_assign_valid() (+18 more)

### Community 62 - "q"
Cohesion: 0.19
Nodes (21): active_admins(), user_delete(), {closure#1}(), customer_delete_admin(), customers_list(), erase_by_token(), erase_confirm(), erase_dismiss() (+13 more)

### Community 63 - "settings"
Cohesion: 0.20
Nodes (18): {closure#1}(), {closure#2}(), {closure#4}(), {closure#5}(), {closure#6}(), {closure#7}(), wa_creds_ready(), wa_deliver() (+10 more)

### Community 64 - "Cómo hacer un tema"
Cohesion: 0.09
Nodes (22): Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Datos del restaurante: `$s`, Fotos ampliables, Huecos de foto: `TEMA_FOTOS`, Icono de la app (+14 more)

### Community 65 - "db"
Cohesion: 0.22
Nodes (7): res(), tables_of(), save_category(), db(), make_pdo(), sala_user_out(), sala_user_save()

### Community 66 - "Auditoría de seguridad (29 de octubre de 2026)"
Cohesion: 0.07
Nodes (28): 2.2 Separación de roles · Media · corregido, 2. Control de acceso y autorización, 3.1 SQL / NoSQL injection · cumple, 3.2 XSS · Media · reforzado, 3. Validación de entradas y sanitización, 4.3 Llamadas / APIs de terceros · cumple, 4. Lógica de negocio y condiciones de carrera, 5.2 Spam de reservas · Media · corregido (+20 more)

### Community 67 - "login"
Cohesion: 0.28
Nodes (19): 1.1 Hashing de contraseñas · Baja · corregido, 5.1 Fuerza bruta · **Alta** · corregido, 6.2 Fuga de datos en respuestas · cumple, change_password(), login(), customer_attempts_guard(), customer_login(), customer_out() (+11 more)

### Community 68 - "lang"
Cohesion: 0.20
Nodes (23): days_text(), ranges_text(), day_name(), detect_lang(), fmt_date_l(), i18n_dict(), lang(), lang_url() (+15 more)

### Community 69 - "ValidationError"
Cohesion: 0.19
Nodes (22): user_save(), enc(), ValidationError, user_set_email(), user_store_email(), confirm_url(), sala_bump(), sala_check_tables() (+14 more)

### Community 72 - "ValidationError"
Cohesion: 0.24
Nodes (17): customer_register(), send_activation(), base_url(), dev_log(), send_mail(), str_in(), {closure#1}(), customer_forgot() (+9 more)

### Community 73 - "fotos.php"
Cohesion: 0.35
Nodes (10): {closure#1}(), is_unsplash(), photo(), photo_abs(), photo_alt(), photo_cache_file(), photo_credits(), photo_img() (+2 more)

### Community 74 - "settings"
Cohesion: 0.14
Nodes (20): API, Clientes (cookie de sesión, mismo dominio), Gestión (app; cabecera `X-Token`, que se obtiene con `login`), Públicas (las usa la web), Sala y cocina (`sala/api.php?r=…`, cabecera `X-Token` de `login` con una cuenta de sala), public_info(), carta_on(), carta_toggle() (+12 more)

### Community 77 - "clientes.php"
Cohesion: 0.25
Nodes (14): 1.2 Cookies y tokens · cumple, 1.3 Recuperación de cuenta · cumple, 1.4 Cierre de sesión y rotación · **Alta** · corregido, 1. Autenticación y gestión de sesiones, {closure#1}(), current_customer(), customer_activate(), customer_delete() (+6 more)

### Community 78 - "now"
Cohesion: 0.24
Nodes (10): now(), delete_reservation(), sala_auth(), sala_item_row(), sala_item_status(), sala_items_status(), sala_kitchen(), sala_order_row() (+2 more)

## Knowledge Gaps
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `restaurante.js` to `www/app.js`, `panel/app.js`, `auth.php`, `Auditoría de seguridad (29 de octubre de 2026)`?**
  _High betweenness centrality (0.235) - this node is a cross-community bridge._
- **Are the 119 inferred relationships involving `q()` (e.g. with `3.1 SQL / NoSQL injection · cumple` and `res()`) actually correct?**
  _`q()` has 119 INFERRED edges - model-reasoned connections that need verification._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._
- **Why does `Resumen` connect `auth.php` to `Cómo hacer un tema`, `Auditoría de seguridad (29 de octubre de 2026)`, `restaurante.js`, `ValidationError`, `settings`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Are the 64 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `4.1 Reservas concurrentes · **Alta** · corregido`) actually correct?**
  _`settings()` has 64 INFERRED edges - model-reasoned connections that need verification._
- **Should `www/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10035087719298245 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `dec`, `db`, `Auditoría de seguridad (29 de octubre de 2026)`, `login`, `lib/carta.php`, `ValidationError`, `t`, `lang`, `ValidationError`, `traductor.php`, `settings`, `clientes.php`, `now`, `core.php`, `reservas.php`, `auth.php`, `sala.php`, `settings`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._