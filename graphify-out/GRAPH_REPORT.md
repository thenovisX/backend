# Graph Report - backend  (2026-10-29)

## Corpus Check
- 81 files · ~107,179 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 4)

## Summary
- 763 nodes · 2085 edges · 66 communities (18 shown, 48 thin omitted)
- Extraction: 68% EXTRACTED · 32% INFERRED · 0% AMBIGUOUS · INFERRED: 677 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `151e0fed`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- base_url
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
- CLAUDE.md
- q
- now
- clientes.php
- Auditoría de seguridad (29 de octubre de 2026)
- login
- schema.php

## God Nodes (most connected - your core abstractions)
1. `q()` - 101 edges
2. `settings()` - 70 edges
3. `ValidationError` - 48 edges
4. `t()` - 40 edges
5. `api()` - 33 edges
6. `api()` - 33 edges
7. `lang()` - 26 edges
8. `render()` - 25 edges
9. `render()` - 25 edges
10. `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` - 25 edges

## Surprising Connections (you probably didn't know these)
- `8.3 `remove_upload()` · Baja · corregido` --references--> `remove_upload()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/carta.php
- `3.1 SQL / NoSQL injection · cumple` --references--> `q()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `5.3 Límite global de la API · Media · corregido` --references--> `api_rate_limit()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `6.3 Logs · Baja · corregido` --references--> `dev_log()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `8.2 Enlaces de email con la cabecera Host · Media · corregido` --references--> `base_url()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php

## Import Cycles
- None detected.

## Communities (66 total, 48 thin omitted)

### Community 0 - "base_url"
Cohesion: 0.20
Nodes (22): {closure#2}(), crypto_key(), crypto_ready(), dec(), email_idx(), enc(), customer_register(), customer_resend() (+14 more)

### Community 1 - "t"
Cohesion: 0.05
Nodes (69): Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Datos del restaurante: `$s`, Fotos ampliables, Funciones disponibles, Huecos de foto: `TEMA_FOTOS` (+61 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (68): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+60 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (68): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+60 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.09
Nodes (36): API, Clientes (cookie de sesión, mismo dominio), Gestión (app; cabecera `X-Token`, que se obtiene con `login`), Públicas (las usa la web), carta_on(), {closure#3}(), menu_delete(), menu_find() (+28 more)

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
Cohesion: 0.05
Nodes (33): 1. Antes de empezar: lo que necesitas, 2.1. Crear la base de datos (MySQL), 2.2. Subir la web, 2.3. Instalar, 2. Poner la web en marcha en Hostinger, 3. La app de gestión, 4.1. Que los emails lleguen bien (Gmail), 4. Primeros ajustes (+25 more)

### Community 55 - "core.php"
Cohesion: 0.16
Nodes (7): 7.2 CORS · Media · corregido, clean_hours(), cors_allowed(), cors_headers(), is_time(), purge_old_reservations(), rate_limit_cleanup()

### Community 59 - "q"
Cohesion: 0.05
Nodes (110): 2.1 IDOR · cumple, 4.1 Reservas concurrentes · **Alta** · corregido, 4.2 Carta y precios · cumple, 4.3 Llamadas / APIs de terceros · cumple, 4. Lógica de negocio y condiciones de carrera, public_info(), {closure#1}(), customer_delete_admin() (+102 more)

### Community 60 - "now"
Cohesion: 0.16
Nodes (21): 2.3 Protección de endpoints · cumple, 6.1 Datos mínimos · cumple, 6.2 Fuga de datos en respuestas · cumple, 6.3 Logs · Baja · corregido, 6. Protección de datos (RGPD / LOPDGDD), Resumen, active_admins(), logout() (+13 more)

### Community 62 - "clientes.php"
Cohesion: 0.28
Nodes (12): 1.2 Cookies y tokens · cumple, 1.3 Recuperación de cuenta · cumple, 1.4 Cierre de sesión y rotación · **Alta** · corregido, 1. Autenticación y gestión de sesiones, {closure#1}(), current_customer(), customer_login_session(), customer_logout() (+4 more)

### Community 66 - "Auditoría de seguridad (29 de octubre de 2026)"
Cohesion: 0.11
Nodes (20): 2.2 Separación de roles · Media · corregido, 2. Control de acceso y autorización, 3.1 SQL / NoSQL injection · cumple, 3.2 XSS · Media · reforzado, 3.3 CSRF · Baja · reforzado, 3. Validación de entradas y sanitización, 5.2 Spam de reservas · Media · corregido, 5.3 Límite global de la API · Media · corregido (+12 more)

### Community 67 - "login"
Cohesion: 0.27
Nodes (18): 1.1 Hashing de contraseñas · Baja · corregido, 5.1 Fuerza bruta · **Alta** · corregido, change_password(), login(), customer_attempts_guard(), customer_delete(), customer_login(), customer_out() (+10 more)

## Knowledge Gaps
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `q()` connect `q` to `base_url`, `t`, `Auditoría de seguridad (29 de octubre de 2026)`, `login`, `lib/carta.php`, `traductor.php`, `core.php`, `now`, `clientes.php`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Are the 87 inferred relationships involving `q()` (e.g. with `3.1 SQL / NoSQL injection · cumple` and `active_admins()`) actually correct?**
  _`q()` has 87 INFERRED edges - model-reasoned connections that need verification._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.05154320987654321 - nodes in this community are weakly interconnected._
- **Why does `settings()` connect `q` to `base_url`, `t`, `login`, `lib/carta.php`, `traductor.php`, `core.php`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 62 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `4.1 Reservas concurrentes · **Alta** · corregido`) actually correct?**
  _`settings()` has 62 INFERRED edges - model-reasoned connections that need verification._
- **Should `www/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1021843761569789 - nodes in this community are weakly interconnected._
- **Why does `Resumen` connect `now` to `base_url`, `t`, `Auditoría de seguridad (29 de octubre de 2026)`, `lib/carta.php`, `restaurante.js`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._