# Graph Report - backend  (2026-10-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 599 nodes · 1589 edges · 55 communities (11 shown, 44 thin omitted)
- Extraction: 73% EXTRACTED · 27% INFERRED · 0% AMBIGUOUS · INFERRED: 431 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a3ecd525`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 14
- Community 15
- Community 17
- Community 18
- Community 21
- Community 22

## God Nodes (most connected - your core abstractions)
1. `q()` - 82 edges
2. `settings()` - 55 edges
3. `ValidationError` - 38 edges
4. `t()` - 31 edges
5. `api()` - 30 edges
6. `api()` - 30 edges
7. `render()` - 24 edges
8. `render()` - 24 edges
9. `lang()` - 23 edges
10. `toast()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `{closure#3}()` --calls--> `ValidationError`  [INFERRED]
  web/lib/carta.php → web/lib/core.php
- `ensure_schema()` --calls--> `schema_sql()`  [INFERRED]
  web/lib/core.php → web/lib/schema.php
- `move_category()` --calls--> `q()`  [INFERRED]
  web/lib/carta.php → web/lib/core.php
- `{closure#2}()` --calls--> `base_url()`  [INFERRED]
  web/lib/carta.php → web/lib/core.php
- `menus_button()` --calls--> `settings()`  [INFERRED]
  web/lib/carta.php → web/lib/core.php

## Import Cycles
- None detected.

## Communities (55 total, 44 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (100): active_admins(), change_password(), login(), logout(), request_token(), require_admin(), require_auth(), require_perm() (+92 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (74): public_info(), {closure#1}(), {closure#3}(), {closure#4}(), {closure#1}(), erase_url(), carta_on(), days_text() (+66 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (64): api(), askNotifications(), boot(), busy(), catOpen(), catOpenSave(), closeSheet(), dayStrip() (+56 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (64): api(), askNotifications(), boot(), busy(), catOpen(), catOpenSave(), closeSheet(), dayStrip() (+56 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (33): allergen_list(), carta_toggle(), {closure#2}(), {closure#3}(), delete_dish(), dish_out(), get_dish(), menu_data() (+25 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (31): runs-on, steps, concurrency, cancel-in-progress, group, ANDROID_KEY_PASSWORD, ANDROID_KEYSTORE_PASSWORD, jobs (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (30): addDays(), api(), callStatus(), emit(), esc(), isClosed(), iso(), lbBuild() (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (20): dependencies, @capacitor/android@^8.5.3, @capacitor/core@^8.5.3, @capacitor/local-notifications@^8.3.1, description, devDependencies, @capacitor/assets@^3.0.5, @capacitor/cli@^8.5.3 (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, jobs, publicar, name, permissions, contents (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.19
Nodes (12): tr_hash(), {closure#3}(), tr_after_save(), tr_http(), tr_set(), tr_split(), translatable_texts(), translate_batch() (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.36
Nodes (9): apply(), choose(), close(), L(), loadScript(), read(), save(), show() (+1 more)

## Knowledge Gaps
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `q()` connect `Community 0` to `Community 1`, `Community 4`, `Community 9`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 71 inferred relationships involving `q()` (e.g. with `active_admins()` and `change_password()`) actually correct?**
  _`q()` has 71 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05654465175900869 - nodes in this community are weakly interconnected._
- **Why does `settings()` connect `Community 1` to `Community 0`, `Community 9`, `Community 4`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 47 inferred relationships involving `settings()` (e.g. with `public_info()` and `login()`) actually correct?**
  _`settings()` has 47 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05568039950062422 - nodes in this community are weakly interconnected._
- **Why does `t()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._