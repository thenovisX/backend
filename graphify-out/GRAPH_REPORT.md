# Graph Report - backend  (2026-10-25)

## Corpus Check
- 80 files · ~100,444 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 4)

## Summary
- 692 nodes · 1893 edges · 72 communities (24 shown, 48 thin omitted)
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 577 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `466fbd5f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- core.php
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
- whatsapp.php
- API
- CLAUDE.md
- reservas.php
- now
- q
- clientes.php
- settings
- t
- lang
- Cómo hacer un tema
- ValidationError
- fotos.php
- schema.php

## God Nodes (most connected - your core abstractions)
1. `q()` - 97 edges
2. `settings()` - 68 edges
3. `ValidationError` - 48 edges
4. `t()` - 37 edges
5. `api()` - 33 edges
6. `api()` - 33 edges
7. `lang()` - 26 edges
8. `render()` - 25 edges
9. `render()` - 25 edges
10. `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Fotos ampliables` --references--> `photo_img()`  [INFERRED]
  TEMA.md → web/lib/fotos.php
- `Clientes (cookie de sesión, mismo dominio)` --references--> `t()`  [INFERRED]
  API.md → web/lib/i18n.php
- `Cuenta del cliente: atributos `data-*`` --references--> `t()`  [INFERRED]
  TEMA.md → web/lib/i18n.php
- `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` --references--> `user_save()`  [INFERRED]
  API.md → web/lib/auth.php
- `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` --references--> `user_delete()`  [INFERRED]
  API.md → web/lib/auth.php

## Import Cycles
- None detected.

## Communities (72 total, 48 thin omitted)

### Community 0 - "core.php"
Cohesion: 0.12
Nodes (25): {closure#2}(), save_category(), crypto_key(), crypto_ready(), dec(), enc(), send_activation(), base_url() (+17 more)

### Community 1 - "pagina.php"
Cohesion: 0.13
Nodes (12): lang_url(), asset(), {closure#1}(), {closure#2}(), flag_svg(), html_lang(), selector_idioma(), settings_tr() (+4 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (68): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+60 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (68): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+60 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.11
Nodes (33): Gestión (app; cabecera `X-Token`, que se obtiene con `login`), allergen_list(), carta_toggle(), {closure#3}(), delete_dish(), dish_out(), get_dish(), menu_data() (+25 more)

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
Nodes (19): concurrency, cancel-in-progress, group, jobs, publicar, name, permissions, contents (+11 more)

### Community 9 - "traductor.php"
Cohesion: 0.19
Nodes (12): tr_hash(), {closure#3}(), tr_after_save(), tr_http(), tr_set(), tr_split(), translatable_texts(), translate_batch() (+4 more)

### Community 11 - "consent.js"
Cohesion: 0.36
Nodes (9): apply(), choose(), close(), L(), loadScript(), read(), save(), show() (+1 more)

### Community 15 - "Cómo hacer un tema"
Cohesion: 0.10
Nodes (17): 1. Subir la web a Hostinger, 2. App de gestión, 3. Enviar los emails desde Gmail, 4. WhatsApp automático (opcional, API de Meta), Backend para webs de restaurantes, Cómo funcionan las reservas, Desarrollo, Empezar la web de un cliente nuevo (+9 more)

### Community 55 - "whatsapp.php"
Cohesion: 0.19
Nodes (20): {closure#1}(), {closure#2}(), {closure#4}(), {closure#5}(), {closure#6}(), {closure#7}(), wa_api_ready(), wa_creds_ready() (+12 more)

### Community 56 - "API"
Cohesion: 0.40
Nodes (4): API, Clientes (cookie de sesión, mismo dominio), Públicas (las usa la web), carta_on()

### Community 59 - "reservas.php"
Cohesion: 0.16
Nodes (26): customer_cancel(), customer_confirm(), is_date(), restaurant_mail(), today(), with_lang(), cancel_by_link(), confirm_by_customer() (+18 more)

### Community 60 - "now"
Cohesion: 0.15
Nodes (23): active_admins(), change_password(), login(), logout(), request_token(), require_admin(), require_auth(), require_perm() (+15 more)

### Community 61 - "q"
Cohesion: 0.21
Nodes (18): {closure#1}(), customer_delete_admin(), customers_list(), erase_by_token(), erase_confirm(), erase_dismiss(), erase_find(), erase_pending() (+10 more)

### Community 62 - "clientes.php"
Cohesion: 0.22
Nodes (19): email_idx(), can_cancel(), {closure#1}(), current_customer(), customer_attempts_guard(), customer_delete(), customer_login(), customer_login_session() (+11 more)

### Community 63 - "settings"
Cohesion: 0.18
Nodes (16): Funciones disponibles, Idiomas, La carta: `$carta`, public_info(), mail_via_google(), settings(), social_url(), legal_aviso_traduccion() (+8 more)

### Community 64 - "t"
Cohesion: 0.17
Nodes (13): Archivos obligatorios, Datos del restaurante: `$s`, {closure#1}(), {closure#3}(), {closure#4}(), h(), ranges_text(), t() (+5 more)

### Community 65 - "lang"
Cohesion: 0.26
Nodes (16): day_name(), detect_lang(), fmt_date_l(), i18n_dict(), lang(), langs_on(), month_name(), t_msg() (+8 more)

### Community 66 - "Cómo hacer un tema"
Cohesion: 0.13
Nodes (15): Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Fotos ampliables, Huecos de foto: `TEMA_FOTOS`, Icono de la app, Instalar como app, JavaScript propio (+7 more)

### Community 67 - "ValidationError"
Cohesion: 0.33
Nodes (13): ValidationError, customer_reset(), reset_create(), reset_find(), reset_guard(), reset_password_ok(), reset_use(), user_forgot() (+5 more)

### Community 68 - "fotos.php"
Cohesion: 0.35
Nodes (10): {closure#1}(), is_unsplash(), photo(), photo_abs(), photo_alt(), photo_cache_file(), photo_credits(), photo_img() (+2 more)

## Knowledge Gaps
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `q()` connect `q` to `core.php`, `lang`, `ValidationError`, `lib/carta.php`, `traductor.php`, `whatsapp.php`, `reservas.php`, `now`, `clientes.php`, `settings`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 86 inferred relationships involving `q()` (e.g. with `active_admins()` and `change_password()`) actually correct?**
  _`q()` has 86 INFERRED edges - model-reasoned connections that need verification._
- **Should `core.php` be split into smaller, more focused modules?**
  _Cohesion score 0.11942959001782531 - nodes in this community are weakly interconnected._
- **Why does `settings()` connect `settings` to `core.php`, `lang`, `Cómo hacer un tema`, `t`, `lib/carta.php`, `fotos.php`, `pagina.php`, `ValidationError`, `traductor.php`, `whatsapp.php`, `API`, `reservas.php`, `now`, `q`, `clientes.php`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Are the 60 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `public_info()`) actually correct?**
  _`settings()` has 60 INFERRED edges - model-reasoned connections that need verification._
- **Should `pagina.php` be split into smaller, more focused modules?**
  _Cohesion score 0.13450292397660818 - nodes in this community are weakly interconnected._
- **Why does `Cómo hacer un tema` connect `Cómo hacer un tema` to `t`, `settings`, `Cómo hacer un tema`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._