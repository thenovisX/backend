# Graph Report - backend  (2026-11-05)

## Corpus Check
- 93 files · ~142,910 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 35 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 6)

## Summary
- 1071 nodes · 3042 edges · 86 communities (36 shown, 50 thin omitted)
- Extraction: 71% EXTRACTED · 29% INFERRED · 0% AMBIGUOUS · INFERRED: 895 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0fc3f386`
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
- Cómo hacer un tema
- www/sw.js
- build-panel.sh
- panel/sw.js
- web/sw.js
- core.php
- sala.js
- CLAUDE.md
- reservas.php
- db
- sala.php
- q
- whatsapp.php
- Cómo hacer un tema
- legal_secciones
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
- t
- qr.php
- abrir
- h
- sala_prefs_save

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
- `5.3 Límite global de la API · Media · corregido` --references--> `api_rate_limit()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `Reglas legales para el diseño` --references--> `send_csp()`  [INFERRED]
  TEMA.md → web/lib/core.php
- `6.3 Logs · Baja · corregido` --references--> `dev_log()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `8.2 Enlaces de email con la cabecera Host · Media · corregido` --references--> `base_url()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php

## Import Cycles
- None detected.

## Communities (86 total, 50 thin omitted)

### Community 0 - "mesa_test.php"
Cohesion: 0.12
Nodes (21): {closure#10}(), {closure#11}(), {closure#12}(), {closure#13}(), {closure#15}(), {closure#16}(), {closure#17}(), {closure#18}() (+13 more)

### Community 1 - "pagina.php"
Cohesion: 0.19
Nodes (11): tr(), asset(), carta_publica(), {closure#1}(), {closure#2}(), head_tags(), politicas(), settings_tr() (+3 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.10
Nodes (33): 4.2 Carta y precios · cumple, 4.3 Llamadas / APIs de terceros · cumple, 4. Lógica de negocio y condiciones de carrera, allergen_list(), {closure#2}(), {closure#3}(), delete_dish(), dish_out() (+25 more)

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

### Community 15 - "Cómo hacer un tema"
Cohesion: 0.04
Nodes (43): 1. Antes de empezar: lo que necesitas, 2.1. Crear la base de datos (MySQL), 2.2. Subir la web, 2.3. Instalar, 2. Poner la web en marcha en Hostinger, 3. La app de gestión, 4.1. Que los emails lleguen bien (Gmail), 4. Primeros ajustes (+35 more)

### Community 55 - "core.php"
Cohesion: 0.09
Nodes (32): Pendiente / recomendaciones, crypto_key(), crypto_ready(), dec(), email_idx(), enc(), send_activation(), api_rate_limit() (+24 more)

### Community 56 - "sala.js"
Cohesion: 0.08
Nodes (88): addFloor(), addLine(), addMenu(), addTable(), alignTo(), alignVertex(), api(), beep() (+80 more)

### Community 59 - "reservas.php"
Cohesion: 0.12
Nodes (36): 2.1 IDOR · cumple, 4.1 Reservas concurrentes · **Alta** · corregido, can_cancel(), customer_cancel(), customer_confirm(), customer_reservations(), is_date(), restaurant_mail() (+28 more)

### Community 60 - "db"
Cohesion: 0.17
Nodes (9): Sala y cocina (`sala/api.php?r=…`, cabecera `X-Token` de `login` con una cuenta de sala), res(), tables_of(), logout(), save_category(), db(), make_pdo(), sala_user_out() (+1 more)

### Community 61 - "sala.php"
Cohesion: 0.06
Nodes (12): mesa_carta(), {closure#20}(), sala_carta(), sala_course_guess(), sala_fingerprint(), sala_item_row(), sala_items_status(), sala_kitchen() (+4 more)

### Community 62 - "q"
Cohesion: 0.19
Nodes (22): active_admins(), user_delete(), user_save(), {closure#1}(), customer_delete_admin(), customers_list(), erase_by_token(), erase_confirm() (+14 more)

### Community 63 - "whatsapp.php"
Cohesion: 0.42
Nodes (8): {closure#1}(), {closure#2}(), {closure#4}(), {closure#5}(), {closure#6}(), {closure#7}(), wa_first_name(), wa_people()

### Community 64 - "Cómo hacer un tema"
Cohesion: 0.15
Nodes (13): Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Fotos ampliables, Huecos de foto: `TEMA_FOTOS`, Icono de la app, Instalar como app (+5 more)

### Community 65 - "legal_secciones"
Cohesion: 0.33
Nodes (5): Idiomas, mail_via_google(), legal_aviso_traduccion(), legal_policies(), legal_secciones()

### Community 66 - "Auditoría de seguridad (29 de octubre de 2026)"
Cohesion: 0.06
Nodes (43): 1.2 Cookies y tokens · cumple, 1.3 Recuperación de cuenta · cumple, 1. Autenticación y gestión de sesiones, 2.2 Separación de roles · Media · corregido, 2.3 Protección de endpoints · cumple, 2. Control de acceso y autorización, 3.1 SQL / NoSQL injection · cumple, 3.2 XSS · Media · reforzado (+35 more)

### Community 67 - "login"
Cohesion: 0.17
Nodes (32): 1.1 Hashing de contraseñas · Baja · corregido, 1.4 Cierre de sesión y rotación · **Alta** · corregido, 5.1 Fuerza bruta · **Alta** · corregido, change_password(), login(), {closure#1}(), current_customer(), customer_activate() (+24 more)

### Community 68 - "lang"
Cohesion: 0.24
Nodes (16): day_name(), detect_lang(), fmt_date_l(), i18n_dict(), lang(), lang_url(), langs_on(), month_name() (+8 more)

### Community 69 - "mesa.php"
Cohesion: 0.13
Nodes (13): {closure#1}(), {closure#2}(), {closure#3}(), ip_matches(), mesa_info(), mesa_ip_ok(), mesa_order_for(), mesa_remote_ip() (+5 more)

### Community 72 - "ValidationError"
Cohesion: 0.16
Nodes (29): delete_category(), now(), ValidationError, mesa_call(), mesa_kick(), mesa_new_pin(), customer_reset(), reset_find() (+21 more)

### Community 73 - "fotos.php"
Cohesion: 0.35
Nodes (10): {closure#1}(), is_unsplash(), photo(), photo_abs(), photo_alt(), photo_cache_file(), photo_credits(), photo_img() (+2 more)

### Community 74 - "mesa.js"
Cohesion: 0.14
Nodes (40): API, Clientes (cookie de sesión, mismo dominio), Pedidos por QR (`mesa/api.php?r=…`, cabecera `X-Mesa` de `join`; sin CORS), Contra pedidos desde casa (y otros abusos), Cómo se usa, Datos, Pedidos por QR desde la mesa, addLine() (+32 more)

### Community 77 - "settings"
Cohesion: 0.22
Nodes (17): Gestión (app; cabecera `X-Token`, que se obtiene con `login`), carta_toggle(), menus_button(), menus_button_toggle(), settings(), settings_save(), wa_href(), month_summary() (+9 more)

### Community 78 - "sala_prefs"
Cohesion: 0.20
Nodes (15): today(), sala_adjacent(), sala_assign_pending(), sala_assign_valid(), sala_assignments(), sala_busy(), sala_find_tables(), sala_group_seats() (+7 more)

### Community 79 - "sala_layout"
Cohesion: 0.23
Nodes (14): mesa_keys(), mesa_new_key(), mesa_order_qr(), mesa_qr_list(), mesa_rotate(), mesa_table(), mesa_url(), qr_svg() (+6 more)

### Community 80 - "t"
Cohesion: 0.27
Nodes (13): Funciones disponibles, La carta: `$carta`, ranges_text(), social_url(), t(), {closure#3}(), cookies_link(), horario() (+5 more)

### Community 81 - "qr.php"
Cohesion: 0.27
Nodes (5): qr_gf_mul(), qr_matrix(), qr_penalty(), qr_rs_divisor(), qr_rs_remainder()

### Community 82 - "abrir"
Cohesion: 0.25
Nodes (8): Públicas (las usa la web), Menús y carta principal, carta_on(), days_text(), menus_public(), al_icon(), html_lang(), abrir()

### Community 83 - "h"
Cohesion: 0.25
Nodes (5): Datos del restaurante: `$s`, {closure#1}(), {closure#3}(), {closure#4}(), h()

### Community 84 - "sala_prefs_save"
Cohesion: 0.67
Nodes (3): {closure#19}(), ip_rule_valid(), sala_prefs_save()

## Knowledge Gaps
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `restaurante.js` to `www/app.js`, `panel/app.js`, `Auditoría de seguridad (29 de octubre de 2026)`?**
  _High betweenness centrality (0.253) - this node is a cross-community bridge._
- **Are the 125 inferred relationships involving `q()` (e.g. with `3.1 SQL / NoSQL injection · cumple` and `reset_throttle()`) actually correct?**
  _`q()` has 125 INFERRED edges - model-reasoned connections that need verification._
- **Should `mesa_test.php` be split into smaller, more focused modules?**
  _Cohesion score 0.11692307692307692 - nodes in this community are weakly interconnected._
- **Why does `Resumen` connect `Auditoría de seguridad (29 de octubre de 2026)` to `h`, `lib/carta.php`, `restaurante.js`, `core.php`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **Are the 66 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `4.1 Reservas concurrentes · **Alta** · corregido`) actually correct?**
  _`settings()` has 66 INFERRED edges - model-reasoned connections that need verification._
- **Should `www/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10035087719298245 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `mesa_test.php`, `pagina.php`, `Auditoría de seguridad (29 de octubre de 2026)`, `login`, `lib/carta.php`, `mesa.php`, `lang`, `ValidationError`, `traductor.php`, `settings`, `sala_prefs`, `sala_layout`, `core.php`, `reservas.php`, `db`, `sala.php`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._