# Graph Report - backend  (2026-11-04)

## Corpus Check
- 87 files · ~127,924 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 5)

## Summary
- 938 nodes · 2656 edges · 77 communities (27 shown, 50 thin omitted)
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 809 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c5729ea5`
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
- now
- sala.php
- q
- settings
- Cómo hacer un tema
- create_public_reservation
- Auditoría de seguridad (29 de octubre de 2026)
- login
- lang
- schema.php
- ValidationError
- fotos.php
- tr
- run.sh

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

## Communities (77 total, 50 thin omitted)

### Community 0 - "dec"
Cohesion: 0.23
Nodes (13): tables_of(), crypto_key(), crypto_ready(), dec(), email_idx(), enc(), cfg(), ensure_schema() (+5 more)

### Community 1 - "t"
Cohesion: 0.15
Nodes (22): Funciones disponibles, La carta: `$carta`, csp_nonce(), ranges_text(), t(), asset(), body_end(), {closure#3}() (+14 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.08
Nodes (45): API, Clientes (cookie de sesión, mismo dominio), Gestión (app; cabecera `X-Token`, que se obtiene con `login`), Públicas (las usa la web), 4.2 Carta y precios · cumple, Menús y carta principal, allergen_list(), carta_on() (+37 more)

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
Cohesion: 0.11
Nodes (19): Pendiente / recomendaciones, Reglas legales para el diseño, {closure#1}(), erase_url(), send_activation(), base_url(), clean_hours(), {closure#4}() (+11 more)

### Community 56 - "sala.js"
Cohesion: 0.10
Nodes (67): addFloor(), addLine(), addMenu(), addTable(), api(), beep(), billRows(), busy() (+59 more)

### Community 59 - "reservas.php"
Cohesion: 0.13
Nodes (28): 2.1 IDOR · cumple, erase_confirm(), can_cancel(), {closure#1}(), customer_cancel(), customer_confirm(), customer_reservations(), restaurant_mail() (+20 more)

### Community 60 - "now"
Cohesion: 0.18
Nodes (16): Sala y cocina (`sala/api.php?r=…`, cabecera `X-Token` de `login` con una cuenta de sala), 6.2 Fuga de datos en respuestas · cumple, res(), public_info(), active_admins(), logout(), request_token(), require_auth() (+8 more)

### Community 61 - "sala.php"
Cohesion: 0.06
Nodes (32): {closure#19}(), sala_adjacent(), sala_assign_manual(), sala_assign_valid(), sala_assignments(), sala_busy(), sala_find_tables(), sala_fingerprint() (+24 more)

### Community 62 - "q"
Cohesion: 0.14
Nodes (29): customer_delete_admin(), customers_list(), erase_by_token(), erase_dismiss(), erase_find(), erase_pending(), erase_pending_count(), erase_request() (+21 more)

### Community 63 - "settings"
Cohesion: 0.19
Nodes (21): mail_via_google(), settings(), legal_secciones(), {closure#1}(), {closure#2}(), {closure#4}(), {closure#5}(), {closure#6}() (+13 more)

### Community 64 - "Cómo hacer un tema"
Cohesion: 0.10
Nodes (18): Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Datos del restaurante: `$s`, Fotos ampliables, Huecos de foto: `TEMA_FOTOS`, Icono de la app (+10 more)

### Community 65 - "create_public_reservation"
Cohesion: 0.18
Nodes (18): 4.1 Reservas concurrentes · **Alta** · corregido, save_category(), db(), is_date(), make_pdo(), settings_save(), today(), create_public_reservation() (+10 more)

### Community 66 - "Auditoría de seguridad (29 de octubre de 2026)"
Cohesion: 0.07
Nodes (36): 1.2 Cookies y tokens · cumple, 1.3 Recuperación de cuenta · cumple, 1. Autenticación y gestión de sesiones, 2.2 Separación de roles · Media · corregido, 2.3 Protección de endpoints · cumple, 2. Control de acceso y autorización, 3.1 SQL / NoSQL injection · cumple, 3.2 XSS · Media · reforzado (+28 more)

### Community 67 - "login"
Cohesion: 0.19
Nodes (31): 1.1 Hashing de contraseñas · Baja · corregido, 1.4 Cierre de sesión y rotación · **Alta** · corregido, 5.1 Fuerza bruta · **Alta** · corregido, change_password(), login(), current_customer(), customer_activate(), customer_attempts_guard() (+23 more)

### Community 68 - "lang"
Cohesion: 0.25
Nodes (15): day_name(), detect_lang(), fmt_date_l(), i18n_dict(), lang(), lang_url(), langs_on(), month_name() (+7 more)

### Community 72 - "ValidationError"
Cohesion: 0.35
Nodes (12): ValidationError, customer_reset(), reset_create(), reset_find(), reset_password_ok(), reset_use(), user_forgot(), user_reset() (+4 more)

### Community 73 - "fotos.php"
Cohesion: 0.35
Nodes (10): {closure#1}(), is_unsplash(), photo(), photo_abs(), photo_alt(), photo_cache_file(), photo_credits(), photo_img() (+2 more)

### Community 74 - "tr"
Cohesion: 0.20
Nodes (10): Idiomas, tr(), legal_aviso_traduccion(), legal_policies(), carta_publica(), {closure#1}(), {closure#2}(), politicas() (+2 more)

## Knowledge Gaps
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `restaurante.js` to `www/app.js`, `panel/app.js`, `Auditoría de seguridad (29 de octubre de 2026)`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **Are the 119 inferred relationships involving `q()` (e.g. with `3.1 SQL / NoSQL injection · cumple` and `res()`) actually correct?**
  _`q()` has 119 INFERRED edges - model-reasoned connections that need verification._
- **Should `www/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10035087719298245 - nodes in this community are weakly interconnected._
- **Why does `Resumen` connect `Auditoría de seguridad (29 de octubre de 2026)` to `Cómo hacer un tema`, `lib/carta.php`, `restaurante.js`, `core.php`, `now`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **Are the 64 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `4.1 Reservas concurrentes · **Alta** · corregido`) actually correct?**
  _`settings()` has 64 INFERRED edges - model-reasoned connections that need verification._
- **Should `panel/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10035087719298245 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `dec`, `create_public_reservation`, `Auditoría de seguridad (29 de octubre de 2026)`, `login`, `lib/carta.php`, `lang`, `ValidationError`, `traductor.php`, `tr`, `core.php`, `reservas.php`, `now`, `sala.php`, `settings`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._