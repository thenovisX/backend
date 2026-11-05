# Graph Report - restaurante-app-mesas  (2026-11-05)

## Corpus Check
- 99 files · ~148,785 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 37 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 6)

## Summary
- 1159 nodes · 3175 edges · 97 communities (35 shown, 62 thin omitted)
- Extraction: 72% EXTRACTED · 28% INFERRED · 0% AMBIGUOUS · INFERRED: 903 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `919f4109`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mesa.php
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
- Backend para webs de restaurantes
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
- legal_secciones
- Auditoría de seguridad (29 de octubre de 2026)
- login
- lang
- MainForm
- ValidationError
- fotos.php
- mesa.js
- run.sh
- Lanzador.cs
- Server
- SetupForm
- API
- Guía de tu web de reservas
- abrir
- Sala y cocina
- README.md
- .Main
- .LocalIPv4
- Seguridad y plan de respuesta a incidentes
- .PhpArgs
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
8. `MainForm` - 31 edges
9. `dec()` - 30 edges
10. `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` - 27 edges

## Surprising Connections (you probably didn't know these)
- `Datos y cifrado` --references--> `enc()`  [INFERRED]
  docs/SALA-Y-COCINA.md → web/lib/cifrado.php
- `3.1 SQL / NoSQL injection · cumple` --references--> `q()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `6.3 Logs · Baja · corregido` --references--> `dev_log()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `Cómo funciona` --references--> `base_url()`  [INFERRED]
  escritorio/README.md → web/lib/core.php
- `Fotos ampliables` --references--> `photo_img()`  [INFERRED]
  TEMA.md → web/lib/fotos.php

## Import Cycles
- None detected.

## Communities (97 total, 62 thin omitted)

### Community 0 - "mesa.php"
Cohesion: 0.06
Nodes (44): {closure#1}(), {closure#10}(), {closure#11}(), {closure#12}(), {closure#13}(), {closure#15}(), {closure#16}(), {closure#17}() (+36 more)

### Community 1 - "pagina.php"
Cohesion: 0.12
Nodes (26): Funciones disponibles, La carta: `$carta`, csp_nonce(), ranges_text(), social_url(), tr(), asset(), body_end() (+18 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.08
Nodes (47): Gestión (app; cabecera `X-Token`, que se obtiene con `login`), 4.2 Carta y precios · cumple, 4.3 Llamadas / APIs de terceros · cumple, 4. Lógica de negocio y condiciones de carrera, 8.1 Reinstalación con `install.php` · **Alta** · corregido, 8.2 Enlaces de email con la cabecera Host · Media · corregido, 8.3 `remove_upload()` · Baja · corregido, 8. Hallazgos adicionales (+39 more)

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

### Community 15 - "Backend para webs de restaurantes"
Cohesion: 0.18
Nodes (11): 1. Subir la web a Hostinger, 2. App de gestión, 3. Enviar los emails desde Gmail, 4. WhatsApp automático (opcional, API de Meta), Backend para webs de restaurantes, Cómo funcionan las reservas, Desarrollo, Empezar la web de un cliente nuevo (+3 more)

### Community 55 - "core.php"
Cohesion: 0.11
Nodes (24): save_category(), crypto_key(), crypto_ready(), dec(), email_idx(), enc(), cfg(), clean_hours() (+16 more)

### Community 56 - "sala.js"
Cohesion: 0.08
Nodes (88): addFloor(), addLine(), addMenu(), addTable(), alignTo(), alignVertex(), api(), beep() (+80 more)

### Community 59 - "reservas.php"
Cohesion: 0.11
Nodes (36): 2.1 IDOR · cumple, 4.1 Reservas concurrentes · **Alta** · corregido, erase_confirm(), can_cancel(), {closure#1}(), customer_cancel(), customer_confirm(), customer_export() (+28 more)

### Community 60 - "now"
Cohesion: 0.10
Nodes (25): Sala y cocina (`sala/api.php?r=…`, cabecera `X-Token` de `login` con una cuenta de sala), 6.2 Fuga de datos en respuestas · cumple, res(), tables_of(), public_info(), active_admins(), logout(), request_token() (+17 more)

### Community 61 - "sala.php"
Cohesion: 0.06
Nodes (48): {closure#19}(), ip_rule_valid(), mesa_call(), mesa_kick(), mesa_new_pin(), sala_adjacent(), sala_assign_auto(), sala_assign_clear() (+40 more)

### Community 62 - "q"
Cohesion: 0.23
Nodes (16): {closure#1}(), customer_delete_admin(), customers_list(), erase_by_token(), erase_dismiss(), erase_find(), erase_pending(), erase_pending_count() (+8 more)

### Community 63 - "settings"
Cohesion: 0.20
Nodes (20): settings(), MesaAuthError, {closure#1}(), {closure#2}(), {closure#4}(), {closure#5}(), {closure#6}(), {closure#7}() (+12 more)

### Community 64 - "Cómo hacer un tema"
Cohesion: 0.10
Nodes (17): Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Datos del restaurante: `$s`, Fotos ampliables, Huecos de foto: `TEMA_FOTOS`, Icono de la app (+9 more)

### Community 65 - "legal_secciones"
Cohesion: 0.33
Nodes (5): Idiomas, mail_via_google(), legal_aviso_traduccion(), legal_policies(), legal_secciones()

### Community 66 - "Auditoría de seguridad (29 de octubre de 2026)"
Cohesion: 0.08
Nodes (32): 2.2 Separación de roles · Media · corregido, 2.3 Protección de endpoints · cumple, 2. Control de acceso y autorización, 3.1 SQL / NoSQL injection · cumple, 3.2 XSS · Media · reforzado, 3.3 CSRF · Baja · reforzado, 3. Validación de entradas y sanitización, 5.2 Spam de reservas · Media · corregido (+24 more)

### Community 67 - "login"
Cohesion: 0.16
Nodes (35): 1.1 Hashing de contraseñas · Baja · corregido, 1.2 Cookies y tokens · cumple, 1.3 Recuperación de cuenta · cumple, 1.4 Cierre de sesión y rotación · **Alta** · corregido, 1. Autenticación y gestión de sesiones, 5.1 Fuerza bruta · **Alta** · corregido, change_password(), login() (+27 more)

### Community 68 - "lang"
Cohesion: 0.20
Nodes (21): days_text(), send_mail(), smtp_send(), day_name(), detect_lang(), fmt_date_l(), i18n_dict(), lang() (+13 more)

### Community 72 - "ValidationError"
Cohesion: 0.35
Nodes (11): delete_category(), ValidationError, customer_reset(), reset_create(), reset_find(), reset_password_ok(), reset_use(), user_forgot() (+3 more)

### Community 73 - "fotos.php"
Cohesion: 0.35
Nodes (10): {closure#1}(), is_unsplash(), photo(), photo_abs(), photo_alt(), photo_cache_file(), photo_credits(), photo_img() (+2 more)

### Community 74 - "mesa.js"
Cohesion: 0.21
Nodes (33): addLine(), alChips(), api(), applyStatus(), busy(), callSheet(), cartSheet(), closeSheet() (+25 more)

### Community 80 - "API"
Cohesion: 0.20
Nodes (8): API, Clientes (cookie de sesión, mismo dominio), Pedidos por QR (`mesa/api.php?r=…`, cabecera `X-Mesa` de `join`; sin CORS), Públicas (las usa la web), Contra pedidos desde casa (y otros abusos), Cómo se usa, Datos, Pedidos por QR desde la mesa

### Community 81 - "Guía de tu web de reservas"
Cohesion: 0.20
Nodes (9): 1. Antes de empezar: lo que necesitas, 3. La app de gestión, 4.1. Que los emails lleguen bien (Gmail), 4. Primeros ajustes, 6.1. Sala y cocina: mesas, pedidos y pantalla de cocina, 6. El día a día, 7. Preguntas frecuentes, Guía de tu web de reservas (+1 more)

### Community 82 - "abrir"
Cohesion: 0.33
Nodes (6): Menús y carta principal, carta_on(), menus_public(), al_icon(), html_lang(), abrir()

### Community 83 - "Sala y cocina"
Cohesion: 0.22
Nodes (9): Asignación automática de mesas a las reservas, Cómo se entra, Datos y cifrado, El plano (encargado → Plano), Pantalla de cocina, Pedidos por QR, Pedidos (sala), Pruebas (+1 more)

### Community 84 - "README.md"
Cohesion: 0.29
Nodes (3): App de escritorio: mesas, pedidos y cocina en el ordenador del restaurante, Compilar, Cómo funciona

### Community 88 - "Seguridad y plan de respuesta a incidentes"
Cohesion: 0.33
Nodes (6): Contactos, Copias de seguridad, Qué protege la web, Revisión legal (octubre 2026), Seguridad y plan de respuesta a incidentes, Si hay una brecha de seguridad (RGPD art. 33 y 34)

### Community 90 - "2. Poner la web en marcha en Hostinger"
Cohesion: 0.50
Nodes (4): 2.1. Crear la base de datos (MySQL), 2.2. Subir la web, 2.3. Instalar, 2. Poner la web en marcha en Hostinger

### Community 91 - "5. WhatsApp automático (opcional)"
Cohesion: 0.50
Nodes (4): 5.1. Preparar Meta, 5.2. Ponerlo en la app, 5.3. Que los recordatorios salgan a su hora (tarea programada), 5. WhatsApp automático (opcional)

## Knowledge Gaps
- **1 isolated node(s):** `Running`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 277 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `restaurante.js` to `www/app.js`, `panel/app.js`, `Auditoría de seguridad (29 de octubre de 2026)`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Are the 125 inferred relationships involving `q()` (e.g. with `3.1 SQL / NoSQL injection · cumple` and `reset_throttle()`) actually correct?**
  _`q()` has 125 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Running` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `mesa.php` be split into smaller, more focused modules?**
  _Cohesion score 0.05628415300546448 - nodes in this community are weakly interconnected._
- **Why does `Resumen` connect `Auditoría de seguridad (29 de octubre de 2026)` to `Cómo hacer un tema`, `now`, `lib/carta.php`, `restaurante.js`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Are the 66 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `4.1 Reservas concurrentes · **Alta** · corregido`) actually correct?**
  _`settings()` has 66 INFERRED edges - model-reasoned connections that need verification._
- **Should `pagina.php` be split into smaller, more focused modules?**
  _Cohesion score 0.12043010752688173 - nodes in this community are weakly interconnected._