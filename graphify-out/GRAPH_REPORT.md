# Graph Report - backend  (2026-11-05)

## Corpus Check
- 93 files · ~141,520 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 35 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 6)

## Summary
- 952 nodes · 2716 edges · 78 communities (28 shown, 50 thin omitted)
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 809 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9ba3cad0`
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
- Cómo hacer un tema
- www/sw.js
- build-panel.sh
- panel/sw.js
- web/sw.js
- core.php
- sala.js
- CLAUDE.md
- q
- auth.php
- sala.php
- q
- settings
- Cómo hacer un tema
- legal_secciones
- Auditoría de seguridad (29 de octubre de 2026)
- login
- lang
- base_url
- ValidationError
- fotos.php
- API
- run.sh
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
- `Clientes (cookie de sesión, mismo dominio)` --references--> `t()`  [INFERRED]
  API.md → web/lib/i18n.php
- `5.2 Spam de reservas · Media · corregido` --references--> `reservation_spam_guard()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/reservas.php
- `3.1 SQL / NoSQL injection · cumple` --references--> `q()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `Cuenta del cliente: atributos `data-*`` --references--> `t()`  [INFERRED]
  TEMA.md → web/lib/i18n.php
- `Datos y cifrado` --references--> `enc()`  [INFERRED]
  docs/SALA-Y-COCINA.md → web/lib/cifrado.php

## Import Cycles
- None detected.

## Communities (78 total, 50 thin omitted)

### Community 1 - "t"
Cohesion: 0.12
Nodes (24): Funciones disponibles, Idiomas, La carta: `$carta`, csp_nonce(), social_url(), tr(), asset(), body_end() (+16 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.14
Nodes (28): Gestión (app; cabecera `X-Token`, que se obtiene con `login`), carta_on(), carta_toggle(), {closure#3}(), delete_dish(), menu_delete(), menu_find(), menu_move() (+20 more)

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
Nodes (42): 1. Antes de empezar: lo que necesitas, 2.1. Crear la base de datos (MySQL), 2.2. Subir la web, 2.3. Instalar, 2. Poner la web en marcha en Hostinger, 3. La app de gestión, 4.1. Que los emails lleguen bien (Gmail), 4. Primeros ajustes (+34 more)

### Community 55 - "core.php"
Cohesion: 0.10
Nodes (23): res(), tables_of(), save_category(), crypto_key(), crypto_ready(), dec(), email_idx(), enc() (+15 more)

### Community 56 - "sala.js"
Cohesion: 0.08
Nodes (80): addFloor(), addLine(), addMenu(), addTable(), alignTo(), api(), beep(), billRows() (+72 more)

### Community 59 - "q"
Cohesion: 0.12
Nodes (34): 4.1 Reservas concurrentes · **Alta** · corregido, erase_pending_count(), delete_category(), get_dish(), move_dish(), save_dish(), toggle_dish(), is_date() (+26 more)

### Community 60 - "auth.php"
Cohesion: 0.19
Nodes (15): Sala y cocina (`sala/api.php?r=…`, cabecera `X-Token` de `login` con una cuenta de sala), active_admins(), logout(), request_token(), require_auth(), user_can(), user_delete(), user_out() (+7 more)

### Community 61 - "sala.php"
Cohesion: 0.06
Nodes (37): public_info(), today(), sala_adjacent(), sala_assign_auto(), sala_assign_clear(), sala_assign_manual(), sala_assign_pending(), sala_assign_store() (+29 more)

### Community 62 - "q"
Cohesion: 0.26
Nodes (12): {closure#1}(), customer_delete_admin(), customers_list(), erase_by_token(), erase_dismiss(), erase_find(), erase_pending(), erase_request() (+4 more)

### Community 63 - "settings"
Cohesion: 0.14
Nodes (27): {closure#1}(), with_lang(), confirm_url(), reject_info(), res_admin(), res_out(), whatsapp_text(), {closure#1}() (+19 more)

### Community 64 - "Cómo hacer un tema"
Cohesion: 0.08
Nodes (23): Pendiente / recomendaciones, Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Datos del restaurante: `$s`, Fotos ampliables, Huecos de foto: `TEMA_FOTOS` (+15 more)

### Community 65 - "legal_secciones"
Cohesion: 0.50
Nodes (3): mail_via_google(), legal_policies(), legal_secciones()

### Community 66 - "Auditoría de seguridad (29 de octubre de 2026)"
Cohesion: 0.06
Nodes (38): 2.2 Separación de roles · Media · corregido, 2.3 Protección de endpoints · cumple, 2. Control de acceso y autorización, 3.1 SQL / NoSQL injection · cumple, 3.2 XSS · Media · reforzado, 3.3 CSRF · Baja · reforzado, 3. Validación de entradas y sanitización, 4.2 Carta y precios · cumple (+30 more)

### Community 67 - "login"
Cohesion: 0.25
Nodes (23): 1.1 Hashing de contraseñas · Baja · corregido, 5.1 Fuerza bruta · **Alta** · corregido, 6.2 Fuga de datos en respuestas · cumple, change_password(), login(), customer_attempts_guard(), customer_delete(), customer_login() (+15 more)

### Community 68 - "lang"
Cohesion: 0.19
Nodes (23): days_text(), ranges_text(), send_mail(), day_name(), detect_lang(), fmt_date_l(), i18n_dict(), lang() (+15 more)

### Community 69 - "base_url"
Cohesion: 0.29
Nodes (8): allergen_list(), {closure#2}(), dish_out(), menu_data(), base_url(), carta_publica(), sala_carta(), sala_course_guess()

### Community 72 - "ValidationError"
Cohesion: 0.26
Nodes (13): send_activation(), dev_log(), {closure#1}(), customer_forgot(), customer_reset(), reset_create(), reset_find(), reset_password_ok() (+5 more)

### Community 73 - "fotos.php"
Cohesion: 0.35
Nodes (10): {closure#1}(), is_unsplash(), photo(), photo_abs(), photo_alt(), photo_cache_file(), photo_credits(), photo_img() (+2 more)

### Community 74 - "API"
Cohesion: 0.40
Nodes (4): API, Clientes (cookie de sesión, mismo dominio), Pedidos por QR (`mesa/api.php?r=…`, cabecera `X-Mesa` de `join`; sin CORS), Públicas (las usa la web)

### Community 77 - "now"
Cohesion: 0.14
Nodes (31): 1.2 Cookies y tokens · cumple, 1.3 Recuperación de cuenta · cumple, 1.4 Cierre de sesión y rotación · **Alta** · corregido, 1. Autenticación y gestión de sesiones, 2.1 IDOR · cumple, erase_confirm(), can_cancel(), current_customer() (+23 more)

## Knowledge Gaps
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `restaurante.js` to `www/app.js`, `panel/app.js`, `Auditoría de seguridad (29 de octubre de 2026)`?**
  _High betweenness centrality (0.233) - this node is a cross-community bridge._
- **Are the 119 inferred relationships involving `q()` (e.g. with `3.1 SQL / NoSQL injection · cumple` and `res()`) actually correct?**
  _`q()` has 119 INFERRED edges - model-reasoned connections that need verification._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.11954022988505747 - nodes in this community are weakly interconnected._
- **Why does `Resumen` connect `Auditoría de seguridad (29 de octubre de 2026)` to `Cómo hacer un tema`, `lib/carta.php`, `base_url`, `restaurante.js`, `auth.php`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **Are the 64 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `4.1 Reservas concurrentes · **Alta** · corregido`) actually correct?**
  _`settings()` has 64 INFERRED edges - model-reasoned connections that need verification._
- **Should `www/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10035087719298245 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `t`, `Auditoría de seguridad (29 de octubre de 2026)`, `login`, `lib/carta.php`, `base_url`, `lang`, `ValidationError`, `traductor.php`, `now`, `core.php`, `auth.php`, `sala.php`, `q`, `settings`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._