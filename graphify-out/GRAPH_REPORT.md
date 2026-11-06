# Graph Report - backend  (2026-11-06)

## Corpus Check
- 93 files · ~144,588 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 35 file(s) not represented in the graph (top: .xml 10, (none) 8, .css 6)

## Summary
- 1080 nodes · 3062 edges · 89 communities (37 shown, 52 thin omitted)
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 905 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b2721c80`
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
- Guía de tu web de reservas
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
- settings
- Auditoría de seguridad (29 de octubre de 2026)
- login
- Pedidos por QR desde la mesa
- mesa_test.php
- mesa_join
- fotos.php
- mesa.js
- run.sh
- 2. Poner la web en marcha en Hostinger
- mesa.php
- today
- Backend para webs de restaurantes
- qr.php
- Sala y cocina
- README.md
- settings
- Seguridad y plan de respuesta a incidentes
- mesa_info
- 5. WhatsApp automático (opcional)

## God Nodes (most connected - your core abstractions)
1. `q()` - 142 edges
2. `settings()` - 74 edges
3. `ValidationError` - 68 edges
4. `t()` - 40 edges
5. `now()` - 38 edges
6. `api()` - 35 edges
7. `api()` - 35 edges
8. `dec()` - 30 edges
9. `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` - 27 edges
10. `lang()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Datos y cifrado` --references--> `enc()`  [INFERRED]
  docs/SALA-Y-COCINA.md → web/lib/cifrado.php
- `1.2 Cookies y tokens · cumple` --references--> `customer_session()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/clientes.php
- `3.1 SQL / NoSQL injection · cumple` --references--> `q()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `6.3 Logs · Baja · corregido` --references--> `dev_log()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php
- `8.2 Enlaces de email con la cabecera Host · Media · corregido` --references--> `base_url()`  [INFERRED]
  docs/AUDITORIA-SEGURIDAD.md → web/lib/core.php

## Import Cycles
- None detected.

## Communities (89 total, 52 thin omitted)

### Community 1 - "t"
Cohesion: 0.11
Nodes (26): Funciones disponibles, Idiomas, La carta: `$carta`, ranges_text(), social_url(), tr(), asset(), carta_publica() (+18 more)

### Community 2 - "www/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 3 - "panel/app.js"
Cohesion: 0.10
Nodes (70): api(), askNotifications(), autoSend(), boot(), busy(), catOpen(), catOpenSave(), closeSheet() (+62 more)

### Community 4 - "lib/carta.php"
Cohesion: 0.10
Nodes (28): 8.1 Reinstalación con `install.php` · **Alta** · corregido, 8.2 Enlaces de email con la cabecera Host · Media · corregido, 8.3 `remove_upload()` · Baja · corregido, 8. Hallazgos adicionales, allergen_list(), {closure#2}(), {closure#3}(), dish_out() (+20 more)

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

### Community 15 - "Guía de tu web de reservas"
Cohesion: 0.22
Nodes (9): 1. Antes de empezar: lo que necesitas, 3. La app de gestión, 4.1. Que los emails lleguen bien (Gmail), 4. Primeros ajustes, 6.1. Sala y cocina: mesas, pedidos y pantalla de cocina, 6. El día a día, 7. Preguntas frecuentes, Guía de tu web de reservas (+1 more)

### Community 55 - "core.php"
Cohesion: 0.09
Nodes (29): 5.1 Fuerza bruta · **Alta** · corregido, 7.2 CORS · Media · corregido, save_category(), crypto_key(), crypto_ready(), dec(), enc(), cfg() (+21 more)

### Community 56 - "sala.js"
Cohesion: 0.08
Nodes (80): addFloor(), addLine(), addMenu(), addTable(), alignTo(), api(), beep(), billRows() (+72 more)

### Community 59 - "reservas.php"
Cohesion: 0.14
Nodes (29): 2.1 IDOR · cumple, erase_confirm(), can_cancel(), customer_cancel(), customer_confirm(), customer_reservations(), is_date(), now() (+21 more)

### Community 60 - "auth.php"
Cohesion: 0.13
Nodes (18): Sala y cocina (`sala/api.php?r=…`, cabecera `X-Token` de `login` con una cuenta de sala), res(), tables_of(), active_admins(), logout(), request_token(), require_auth(), user_can() (+10 more)

### Community 61 - "sala.php"
Cohesion: 0.05
Nodes (52): {closure#23}(), ip_rule_valid(), mesa_new_pin(), mesa_table(), {closure#17}(), sala_adjacent(), sala_assign_auto(), sala_assign_clear() (+44 more)

### Community 62 - "q"
Cohesion: 0.14
Nodes (31): customer_delete_admin(), customers_list(), erase_by_token(), erase_dismiss(), erase_find(), erase_pending(), erase_pending_count(), erase_summary() (+23 more)

### Community 63 - "settings"
Cohesion: 0.18
Nodes (24): fmt_date_l(), with_lang(), reject_info(), whatsapp_text(), {closure#1}(), {closure#2}(), {closure#4}(), {closure#5}() (+16 more)

### Community 64 - "Cómo hacer un tema"
Cohesion: 0.10
Nodes (19): Archivos obligatorios, Confirmar la reserva: el botón es obligatorio, Cuenta del cliente: atributos `data-*`, Cómo hacer un tema, Datos del restaurante: `$s`, Fotos ampliables, Huecos de foto: `TEMA_FOTOS`, Icono de la app (+11 more)

### Community 65 - "settings"
Cohesion: 0.19
Nodes (25): {closure#1}(), erase_request(), erase_url(), send_activation(), base_url(), dev_log(), send_mail(), day_name() (+17 more)

### Community 66 - "Auditoría de seguridad (29 de octubre de 2026)"
Cohesion: 0.08
Nodes (31): 1.2 Cookies y tokens · cumple, 1.3 Recuperación de cuenta · cumple, 1. Autenticación y gestión de sesiones, 2.2 Separación de roles · Media · corregido, 2.3 Protección de endpoints · cumple, 2. Control de acceso y autorización, 3.1 SQL / NoSQL injection · cumple, 3.2 XSS · Media · reforzado (+23 more)

### Community 67 - "login"
Cohesion: 0.15
Nodes (35): 1.1 Hashing de contraseñas · Baja · corregido, 1.4 Cierre de sesión y rotación · **Alta** · corregido, 6.2 Fuga de datos en respuestas · cumple, Pendiente / recomendaciones (segunda revisión), Segunda revisión (5 de noviembre de 2026): Sala y cocina y pedidos por QR, change_password(), login(), email_idx() (+27 more)

### Community 68 - "Pedidos por QR desde la mesa"
Cohesion: 0.33
Nodes (4): Contra pedidos desde casa (y otros abusos), Cómo se usa, Datos, Pedidos por QR desde la mesa

### Community 69 - "mesa_test.php"
Cohesion: 0.13
Nodes (18): {closure#10}(), {closure#11}(), {closure#12}(), {closure#13}(), {closure#14}(), {closure#15}(), {closure#16}(), {closure#17}() (+10 more)

### Community 72 - "mesa_join"
Cohesion: 0.33
Nodes (6): {closure#25}(), {closure#4}(), {closure#5}(), {closure#7}(), {closure#8}(), mesa_join()

### Community 73 - "fotos.php"
Cohesion: 0.35
Nodes (10): {closure#1}(), is_unsplash(), photo(), photo_abs(), photo_alt(), photo_cache_file(), photo_credits(), photo_img() (+2 more)

### Community 74 - "mesa.js"
Cohesion: 0.21
Nodes (33): addLine(), alChips(), api(), applyStatus(), busy(), callSheet(), cartSheet(), closeSheet() (+25 more)

### Community 77 - "2. Poner la web en marcha en Hostinger"
Cohesion: 0.50
Nodes (4): 2.1. Crear la base de datos (MySQL), 2.2. Subir la web, 2.3. Instalar, 2. Poner la web en marcha en Hostinger

### Community 78 - "mesa.php"
Cohesion: 0.15
Nodes (15): {closure#6}(), ip_matches(), mesa_ip_ok(), mesa_keys(), mesa_new_key(), mesa_on_local_wifi(), mesa_order_qr(), mesa_pin_bucket() (+7 more)

### Community 81 - "today"
Cohesion: 0.14
Nodes (13): 4.1 Reservas concurrentes · **Alta** · corregido, 4.2 Carta y precios · cumple, 4.3 Llamadas / APIs de terceros · cumple, 4. Lógica de negocio y condiciones de carrera, public_info(), days_text(), menus_public(), csp_nonce() (+5 more)

### Community 82 - "Backend para webs de restaurantes"
Cohesion: 0.18
Nodes (11): 1. Subir la web a Hostinger, 2. App de gestión, 3. Enviar los emails desde Gmail, 4. WhatsApp automático (opcional, API de Meta), Backend para webs de restaurantes, Cómo funcionan las reservas, Desarrollo, Empezar la web de un cliente nuevo (+3 more)

### Community 83 - "qr.php"
Cohesion: 0.27
Nodes (5): qr_gf_mul(), qr_matrix(), qr_penalty(), qr_rs_divisor(), qr_rs_remainder()

### Community 84 - "Sala y cocina"
Cohesion: 0.22
Nodes (9): Asignación automática de mesas a las reservas, Cómo se entra, Datos y cifrado, El plano (encargado → Plano), Pantalla de cocina, Pedidos por QR, Pedidos (sala), Pruebas (+1 more)

### Community 86 - "settings"
Cohesion: 0.15
Nodes (20): API, Clientes (cookie de sesión, mismo dominio), Gestión (app; cabecera `X-Token`, que se obtiene con `login`), Pedidos por QR (`mesa/api.php?r=…`, cabecera `X-Mesa` de `join`; sin CORS), Públicas (las usa la web), carta_on(), carta_toggle(), menus_button() (+12 more)

### Community 87 - "Seguridad y plan de respuesta a incidentes"
Cohesion: 0.33
Nodes (6): Contactos, Copias de seguridad, Qué protege la web, Revisión legal (octubre 2026), Seguridad y plan de respuesta a incidentes, Si hay una brecha de seguridad (RGPD art. 33 y 34)

### Community 88 - "mesa_info"
Cohesion: 0.22
Nodes (9): {closure#1}(), {closure#2}(), {closure#3}(), {closure#9}(), mesa_info(), mesa_order_for(), mesa_status(), mesa_tables_label() (+1 more)

### Community 89 - "5. WhatsApp automático (opcional)"
Cohesion: 0.50
Nodes (4): 5.1. Preparar Meta, 5.2. Ponerlo en la app, 5.3. Que los recordatorios salgan a su hora (tarea programada), 5. WhatsApp automático (opcional)

## Knowledge Gaps
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `restaurante.js` to `www/app.js`, `panel/app.js`, `login`, `Auditoría de seguridad (29 de octubre de 2026)`, `README.md`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **Are the 126 inferred relationships involving `q()` (e.g. with `3.1 SQL / NoSQL injection · cumple` and `reset_throttle()`) actually correct?**
  _`q()` has 126 INFERRED edges - model-reasoned connections that need verification._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.11088709677419355 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `settings`, `Auditoría de seguridad (29 de octubre de 2026)`, `login`, `lib/carta.php`, `mesa_test.php`, `t`, `mesa_join`, `traductor.php`, `mesa.php`, `today`, `settings`, `core.php`, `mesa_info`, `reservas.php`, `auth.php`, `sala.php`, `settings`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Are the 66 inferred relationships involving `settings()` (e.g. with `Gestión (app; cabecera `X-Token`, que se obtiene con `login`)` and `4.1 Reservas concurrentes · **Alta** · corregido`) actually correct?**
  _`settings()` has 66 INFERRED edges - model-reasoned connections that need verification._
- **Should `www/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10035087719298245 - nodes in this community are weakly interconnected._
- **Why does `editSalaUser()` connect `panel/app.js` to `restaurante.js`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._