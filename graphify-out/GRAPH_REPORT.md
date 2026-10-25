# Graph Report - backend  (2026-10-25)

## Corpus Check
- 77 files · ~96,528 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 4)

## Summary
- 670 nodes · 1779 edges · 59 communities (14 shown, 45 thin omitted)
- Extraction: 71% EXTRACTED · 29% INFERRED · 0% AMBIGUOUS · INFERRED: 511 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `67380ec2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- q
- settings
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

## God Nodes (most connected - your core abstractions)
1. `q()` - 86 edges
2. `settings()` - 65 edges
3. `ValidationError` - 40 edges
4. `t()` - 33 edges
5. `api()` - 31 edges
6. `api()` - 31 edges
7. `render()` - 25 edges
8. `lang()` - 25 edges
9. `render()` - 25 edges
10. `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Datos del restaurante: `$s`` --references--> `h()`  [INFERRED]
  TEMA.md → web/lib/core.php
- `Fotos ampliables` --references--> `photo_img()`  [INFERRED]
  TEMA.md → web/lib/fotos.php
- `Públicas (las usa la web)` --references--> `erase_request()`  [INFERRED]
  API.md → web/lib/borrado.php
- `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` --references--> `web_photo_reset()`  [INFERRED]
  API.md → web/lib/carta.php
- `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` --references--> `menu_save()`  [INFERRED]
  API.md → web/lib/carta.php

## Import Cycles
- None detected.

## Communities (59 total, 45 thin omitted)

### Community 0 - "q"
Cohesion: 0.05
Nodes (111): Gestión (app; cabecera `X-Token`, que se obtiene con `login`), active_admins(), change_password(), login(), logout(), request_token(), require_admin(), require_auth() (+103 more)

### Community 1 - "settings"
Cohesion: 0.06
Nodes (65): Funciones disponibles, Idiomas, La carta: `$carta`, Menús y carta principal, public_info(), {closure#1}(), {closure#3}(), {closure#4}() (+57 more)

### Community 2 - "www/app.js"
Cohesion: 0.11
Nodes (65): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+57 more)

### Community 3 - "panel/app.js"
Cohesion: 0.11
Nodes (65): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+57 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.09
Nodes (41): allergen_list(), {closure#2}(), {closure#3}(), delete_dish(), dish_out(), get_dish(), menu_data(), menu_delete() (+33 more)

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
Cohesion: 0.06
Nodes (30): 1. Subir la web a Hostinger, 2. App de gestión, 3. Enviar los emails desde Gmail, 4. WhatsApp automático (opcional, API de Meta), Backend para webs de restaurantes, Cómo funcionan las reservas, Desarrollo, Empezar la web de un cliente nuevo (+22 more)

### Community 55 - "whatsapp.php"
Cohesion: 0.20
Nodes (18): {closure#1}(), {closure#2}(), {closure#4}(), {closure#5}(), {closure#6}(), {closure#7}(), wa_creds_ready(), wa_deliver() (+10 more)

### Community 56 - "API"
Cohesion: 0.50
Nodes (3): API, Clientes (cookie de sesión, mismo dominio), Públicas (las usa la web)

## Knowledge Gaps
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `settings()` connect `settings` to `q`, `traductor.php`, `lib/carta.php`, `whatsapp.php`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 75 inferred relationships involving `q()` (e.g. with `active_admins()` and `change_password()`) actually correct?**
  _`q()` has 75 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.05120375807398708 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `settings`, `lib/carta.php`, `traductor.php`, `whatsapp.php`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Are the 57 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `public_info()`) actually correct?**
  _`settings()` has 57 INFERRED edges - model-reasoned connections that need verification._
- **Should `settings` be split into smaller, more focused modules?**
  _Cohesion score 0.06361570918532944 - nodes in this community are weakly interconnected._
- **Why does `Cómo hacer un tema` connect `Cómo hacer un tema` to `settings`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._