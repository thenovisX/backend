# Graph Report - backend  (2026-10-27)

## Corpus Check
- 80 files · ~105,070 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 4)

## Summary
- 719 nodes · 1964 edges · 67 communities (19 shown, 48 thin omitted)
- Extraction: 69% EXTRACTED · 31% INFERRED · 0% AMBIGUOUS · INFERRED: 608 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `151e0fed`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- q
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
- settings
- abrir
- CLAUDE.md
- politicas
- t
- t
- lang
- Cómo hacer un tema
- schema.php

## God Nodes (most connected - your core abstractions)
1. `q()` - 101 edges
2. `settings()` - 70 edges
3. `ValidationError` - 50 edges
4. `t()` - 41 edges
5. `api()` - 33 edges
6. `api()` - 33 edges
7. `now()` - 26 edges
8. `lang()` - 26 edges
9. `render()` - 25 edges
10. `render()` - 25 edges

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

## Communities (67 total, 48 thin omitted)

### Community 0 - "q"
Cohesion: 0.06
Nodes (108): active_admins(), change_password(), login(), logout(), request_token(), require_admin(), require_auth(), require_perm() (+100 more)

### Community 1 - "pagina.php"
Cohesion: 0.18
Nodes (9): tr(), asset(), carta_publica(), {closure#1}(), {closure#2}(), settings_tr(), tema_color(), tema_render() (+1 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (68): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+60 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (68): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+60 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.09
Nodes (40): Gestión (app; cabecera `X-Token`, que se obtiene con `login`), allergen_list(), carta_toggle(), {closure#2}(), {closure#3}(), dish_out(), menu_data(), menu_delete() (+32 more)

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
Cohesion: 0.05
Nodes (33): 1. Antes de empezar: lo que necesitas, 2.1. Crear la base de datos (MySQL), 2.2. Subir la web, 2.3. Instalar, 2. Poner la web en marcha en Hostinger, 3. La app de gestión, 4.1. Que los emails lleguen bien (Gmail), 4. Primeros ajustes (+25 more)

### Community 55 - "settings"
Cohesion: 0.10
Nodes (51): {closure#1}(), customer_cancel(), base_url(), restaurant_mail(), settings(), settings_admin(), fmt_date_l(), with_lang() (+43 more)

### Community 56 - "abrir"
Cohesion: 0.14
Nodes (12): API, Clientes (cookie de sesión, mismo dominio), Públicas (las usa la web), Menús y carta principal, public_info(), carta_on(), days_text(), menus_public() (+4 more)

### Community 59 - "politicas"
Cohesion: 0.29
Nodes (6): Idiomas, mail_via_google(), legal_aviso_traduccion(), legal_policies(), legal_secciones(), politicas()

### Community 63 - "t"
Cohesion: 0.23
Nodes (16): Funciones disponibles, La carta: `$carta`, ranges_text(), social_url(), t(), body_end(), {closure#3}(), cookies_link() (+8 more)

### Community 64 - "t"
Cohesion: 0.25
Nodes (5): Datos del restaurante: `$s`, {closure#1}(), {closure#3}(), {closure#4}(), h()

### Community 65 - "lang"
Cohesion: 0.27
Nodes (13): day_name(), detect_lang(), i18n_dict(), lang(), lang_url(), langs_on(), month_name(), t_msg() (+5 more)

### Community 66 - "Cómo hacer un tema"
Cohesion: 0.15
Nodes (13): Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Fotos ampliables, Huecos de foto: `TEMA_FOTOS`, Icono de la app, Instalar como app (+5 more)

## Knowledge Gaps
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `q()` connect `q` to `pagina.php`, `lib/carta.php`, `traductor.php`, `settings`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 90 inferred relationships involving `q()` (e.g. with `active_admins()` and `change_password()`) actually correct?**
  _`q()` has 90 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.05554802872239534 - nodes in this community are weakly interconnected._
- **Why does `settings()` connect `settings` to `q`, `lang`, `pagina.php`, `lib/carta.php`, `traductor.php`, `abrir`, `politicas`, `t`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 62 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `public_info()`) actually correct?**
  _`settings()` has 62 INFERRED edges - model-reasoned connections that need verification._
- **Should `www/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1021843761569789 - nodes in this community are weakly interconnected._
- **Why does `Cómo hacer un tema` connect `Cómo hacer un tema` to `t`, `Cómo hacer un tema`, `abrir`, `politicas`, `t`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._