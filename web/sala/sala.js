/* Sala y cocina: plano de mesas, pedidos por mesa y pantalla de cocina.
 * Programa aparte del panel, con sus propias cuentas (se crean en el panel: Ajustes → Cuenta → Sala y cocina). */
(function () {
  'use strict';

  /* ---------- Utilidades ---------- */
  const LS = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* sin almacenamiento */ } },
  };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  /** Hora del restaurante (la del servidor), aunque el reloj o la zona horaria del dispositivo estén mal. */
  let skew = 0;
  const clock = () => new Date(Date.now() + skew);
  const syncClock = (serverNow) => { const t = new Date(String(serverNow).replace(' ', 'T')).getTime(); if (t) skew = t - Date.now(); };
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };
  const euro = (n) => Number(n || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  const uid = (p) => p + Math.random().toString(36).slice(2, 9);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const norm = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const ROLE = { encargado: 'Encargado', camarero: 'Camarero', cocina: 'Cocina' };
  const COURSES = { 0: 'Bebidas', 1: 'Entrantes', 2: 'Principales', 3: 'Postres' };
  const ST = { pendiente: 'Por aceptar (QR)', espera: 'En espera', nuevo: 'En cocina', preparando: 'Preparando', listo: 'Listo', servido: 'Servido', anulado: 'Anulado' };
  const NOTE_CHIPS = ['Sin gluten', 'Sin lactosa', 'Alergia', 'Sin sal', 'Poco hecho', 'Al punto', 'Muy hecho', 'Para compartir', 'Sin cebolla', 'Para niño'];
  const API = new URL('api.php', location.href).href;
  const PANEL = new URL('../panel/', location.href).href;

  /* ---------- Estado ---------- */
  const S = {
    token: LS.get('sala_token') || '',
    me: (() => { try { return JSON.parse(LS.get('sala_me') || 'null'); } catch (e) { return null; } })(),
    restaurant: LS.get('sala_rest') || '',
    view: LS.get('sala_view') || '',
    floor: LS.get('sala_floor') || '',
    date: iso(clock()),
    time: '',            // '' = ahora
    st: null,            // estado de la sala (plano, pedidos, reservas)
    rev: '',
    carta: null,
    orderId: 0,
    cat: '',
    q: '',
    drafts: (() => { try { return JSON.parse(LS.get('sala_drafts') || '{}'); } catch (e) { return {}; } })(),
    dest: LS.get('sala_dest') || 'cocina',
    kRev: '',
    k: null,
    kSeen: null,
    sound: LS.get('sala_sound') === '1',
    readySeen: null,
    ed: null,            // editor de plano
  };
  const role = () => (S.me ? S.me.role : '');
  const canSala = () => ['encargado', 'camarero'].includes(role());
  const isBoss = () => role() === 'encargado';
  const saveDrafts = () => LS.set('sala_drafts', JSON.stringify(S.drafts));

  /* ---------- API ---------- */
  async function api(route, { body = null, query = '' } = {}) {
    const opts = { method: 'GET', headers: {} };
    if (S.token) opts.headers['X-Token'] = S.token;
    if (body) { opts.method = 'POST'; opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    let res, json;
    try { res = await fetch(`${API}?r=${route}${query}`, opts); } catch (e) { throw new Error('Sin conexión. Revisa el wifi.'); }
    try { json = await res.json(); } catch (e) { throw new Error(`El servidor no responde bien (código ${res.status}).`); }
    if (res.status === 401 && route !== 'login') { logoutLocal(); throw new Error(json.error || 'Vuelve a entrar'); }
    if (!json.ok) throw new Error(json.error || 'Algo ha fallado');
    return json.data;
  }

  /* ---------- Avisos y sonido ---------- */
  function toast(msg, type = '') {
    const t = document.createElement('div');
    t.className = 't ' + type;
    t.textContent = msg;
    $('#toast').appendChild(t);
    setTimeout(() => t.remove(), type === 'err' ? 5000 : 3200);
  }
  let audio = null;
  function beep(times = 2) {
    if (!S.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      for (let i = 0; i < times; i++) {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.type = 'sine';
        o.frequency.value = i % 2 ? 660 : 880;
        const t0 = audio.currentTime + i * 0.28;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.24);
        o.connect(g).connect(audio.destination);
        o.start(t0);
        o.stop(t0 + 0.26);
      }
    } catch (e) { /* sin sonido */ }
  }
  function toggleSound() {
    S.sound = !S.sound;
    LS.set('sala_sound', S.sound ? '1' : '0');
    if (S.sound) beep(1);
  }
  let wake = null;
  async function keepAwake() {
    try { if ('wakeLock' in navigator && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch (e) { /* no disponible */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.view === 'cocina') keepAwake(); });

  /* ---------- Hoja (ventana) ---------- */
  function openSheet(title, html, after) {
    closeSheet();
    const w = document.createElement('div');
    w.className = 'sheet-wrap';
    w.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="sheet-h"><h2>${esc(title)}</h2><button class="x" type="button" aria-label="Cerrar">×</button></div>
      <div class="sheet-b">${html}</div></div>`;
    document.body.appendChild(w);
    w.addEventListener('click', (e) => { if (e.target === w) closeSheet(); });
    $('.x', w).addEventListener('click', closeSheet);
    const body = $('.sheet-b', w);
    if (after) after(body);
    const f = $('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select', body);
    if (f && window.matchMedia('(pointer: fine)').matches) f.focus();
    return body;
  }
  function closeSheet() { const w = $('.sheet-wrap'); if (w) w.remove(); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
  function busy(btn, on, label) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.textContent = label || 'Un momento…'; }
    else { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
  }

  /* ---------- Entrada ---------- */
  function renderLogin(msg) {
    document.body.className = '';
    $('#app').innerHTML = `<div class="gate"><div class="gate-box">
      <h1>Sala y cocina</h1>
      <p>Mesas, pedidos y pantalla de cocina${S.restaurant ? ' de ' + esc(S.restaurant) : ''}. Entra con la cuenta que te ha dado el encargado.</p>
      <form id="login" novalidate>
        <label>Usuario <input name="username" autocomplete="username" autocapitalize="off" required></label>
        <label>Contraseña <input name="password" type="password" autocomplete="current-password" required></label>
        <button class="btn btn-main" type="submit">Entrar</button>
        ${msg ? `<p role="alert">${esc(msg)}</p>` : ''}
      </form>
      <small>Las cuentas se crean en el panel de gestión: Ajustes → Cuenta → «Sala y cocina».</small>
    </div></div>`;
    $('#login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      const b = $('button', f);
      busy(b, true, 'Entrando…');
      try {
        const d = await api('login', { body: { username: f.username.value.trim(), password: f.password.value } });
        S.token = d.token; S.me = d.me; S.restaurant = d.restaurant;
        LS.set('sala_token', d.token); LS.set('sala_me', JSON.stringify(d.me)); LS.set('sala_rest', d.restaurant);
        S.view = '';
        start();
      } catch (err) { busy(b, false); toast(err.message, 'err'); }
    });
  }
  function logoutLocal() {
    S.token = ''; S.me = null; S.st = null; S.rev = ''; S.k = null; S.kRev = '';
    LS.del('sala_token'); LS.del('sala_me');
    stopTimers();
    renderLogin();
  }

  /* ---------- Marco y navegación ---------- */
  function views() {
    const v = [];
    if (canSala()) v.push(['sala', 'Sala']);
    v.push(['cocina', 'Cocina']);
    if (isBoss()) v.push(['plano', 'Plano'], ['prefs', 'Preferencias']);
    return v;
  }
  function start() {
    if (!S.token || !S.me) return renderLogin();
    const ok = views().map((v) => v[0]);
    if (S.view === 'pedido' && !canSala()) S.view = '';
    if (!ok.includes(S.view) && S.view !== 'pedido') S.view = ok[0];
    $('#app').innerHTML = `
      <header class="bar">
        <div class="bar-name"><span>${esc(S.restaurant || 'Sala y cocina')}</span><small>Sala y cocina</small></div>
        <nav class="nav" aria-label="Secciones">${views().map(([k, l]) => `<button type="button" data-v="${k}">${l}</button>`).join('')}</nav>
        <div class="who"><span>${esc(S.me.name || S.me.username)} · ${ROLE[S.me.role]}</span><button type="button" data-out>Salir</button></div>
      </header>
      <main id="view"></main>`;
    $('.nav').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) go(b.dataset.v); });
    $('[data-out]').addEventListener('click', async () => {
      if (!confirm('¿Salir de esta cuenta en este dispositivo?')) return;
      try { await api('logout', { body: {} }); } catch (e) { /* da igual */ }
      logoutLocal();
    });
    go(S.view);
    api('me').then((d) => { S.me = d.me; LS.set('sala_me', JSON.stringify(d.me)); }).catch(() => {});
  }
  function go(v, keep) {
    if (S.view === 'plano' && v !== 'plano' && S.ed && S.ed.dirty && !confirm('Tienes cambios en el plano sin guardar. ¿Salir sin guardarlos?')) return;
    if (v !== 'plano') S.ed = null;
    S.view = v;
    if (v !== 'pedido') LS.set('sala_view', v);
    document.body.className = v === 'cocina' ? 'k' : '';
    $$('.nav [data-v]').forEach((b) => { if (b.dataset.v === v || (v === 'pedido' && b.dataset.v === 'sala')) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    if (!keep) window.scrollTo(0, 0);
    stopTimers();
    ({ sala: viewSala, pedido: viewPedido, cocina: viewCocina, plano: viewPlano, prefs: viewPrefs })[v]();
  }
  let timer = null;
  let clockT = null;
  function stopTimers() { clearInterval(timer); clearInterval(clockT); timer = null; clockT = null; }
  function every(ms, fn) { clearInterval(timer); timer = setInterval(() => { if (document.visibilityState === 'visible') fn(); }, ms); }
  const view = () => $('#view');
  function errBox(err) { view().innerHTML = `<div class="card"><p>${esc(err.message)}</p><button class="btn btn-sm" data-retry>Reintentar</button></div>`; $('[data-retry]').addEventListener('click', () => go(S.view)); }

  /* ---------- Datos de la sala ---------- */
  async function loadState(force) {
    const d = await api('state', { query: `&date=${S.date}&rev=${force ? '' : encodeURIComponent(S.rev)}` });
    if (d.same) return false;
    syncClock(d.now);
    S.st = d;
    S.rev = d.rev;
    noticeReady();
    return true;
  }
  const layout = () => S.st.layout;
  const tById = () => Object.fromEntries(layout().tables.map((t) => [t.id, t]));
  const tName = (ids) => { const m = tById(); return ids.map((id) => (m[id] ? m[id].name : '?')).join(' + '); };
  const tLabel = (ids) => (ids.length ? `Mesa ${tName(ids)}` : 'Sin mesa');
  const groupOf = (tid) => layout().groups.find((g) => g.tables.includes(tid));
  const orderOf = (tid) => S.st.orders.find((o) => o.tables.includes(tid));
  const viewMin = () => (S.time ? toMin(S.time) : (S.date === iso(clock()) ? toMin(hm(clock())) : toMin('13:00')));
  function seatsOf(ids) {
    const m = tById();
    const g = layout().groups.find((x) => x.tables.length === ids.length && x.tables.every((t) => ids.includes(t)));
    if (g && g.seats) return g.seats;
    return Math.max(1, ids.reduce((a, id) => a + ((m[id] && m[id].seats) || 0), 0) - (S.st.merge_loss || 0) * (ids.length - 1));
  }
  /** Reserva que ocupa (o va a ocupar pronto) una mesa a la hora que se está mirando. */
  function resFor(tid, soon) {
    const t = viewMin();
    const dur = S.st.minutes || 90;
    return S.st.reservations.find((r) => r.tables.includes(tid) && toMin(r.time) <= t && t < toMin(r.time) + dur)
      || (soon ? S.st.reservations.find((r) => r.tables.includes(tid) && toMin(r.time) > t && toMin(r.time) - t <= 60) : null);
  }
  function tableStatus(t) {
    if (t.kind !== 'mesa') return 'deco';
    const today = S.date === iso(clock());
    const o = today ? orderOf(t.id) : null;
    if (o) return o.call || o.items.some((i) => i.status === 'listo' || i.status === 'pendiente') ? 'ocupada aviso' : 'ocupada';
    const r = resFor(t.id, false);
    if (r) return 'reservada';
    if (resFor(t.id, true)) return 'proxima';
    return 'libre';
  }
  /** Avisa al camarero cuando la cocina marca algo como listo. */
  function noticeReady() {
    if (!S.st) return;
    const now = new Set();
    S.st.orders.forEach((o) => {
      o.items.forEach((i) => { if (i.status === 'listo') now.add(i.id); if (i.status === 'pendiente') now.add('p' + i.id); });
      if (o.call) now.add(`c${o.id}|${o.call.at}`);
    });
    if (S.readySeen) {
      let ring = false;
      S.st.orders.forEach((o) => {
        if (o.items.some((i) => i.status === 'listo' && !S.readySeen.has(i.id))) { toast(`${tLabel(o.tables)}: listo para servir`, 'ok'); ring = true; }
        if (o.items.some((i) => i.status === 'pendiente' && !S.readySeen.has('p' + i.id))) { toast(`${tLabel(o.tables)}: pedido desde el móvil por aceptar`); ring = true; }
        if (o.call && !S.readySeen.has(`c${o.id}|${o.call.at}`)) { toast(`${tLabel(o.tables)}: ${o.call.type === 'cuenta' ? 'piden la cuenta' : 'llaman al camarero'}`); ring = true; }
      });
      if (ring) beep(2);
    }
    S.readySeen = now;
  }

  /* ---------- Dibujo del plano (SVG) ---------- */
  function chairs(t) {
    if (t.kind !== 'mesa' || !t.seats) return '';
    const n = Math.min(t.seats, 40);
    const pts = [];
    const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
    if (t.shape === 'round') {
      for (let i = 0; i < n; i++) {
        const a = (2 * Math.PI * i) / n - Math.PI / 2;
        pts.push([cx + (t.w / 2 + 11) * Math.cos(a), cy + (t.h / 2 + 11) * Math.sin(a)]);
      }
    } else {
      const per = 2 * (t.w + t.h);
      let top = Math.round((n * t.w) / per), bottom = Math.round((n * t.w) / per), left = Math.round((n * t.h) / per);
      if (n <= 2 && t.w >= t.h) { top = n > 1 ? 1 : 1; bottom = n > 1 ? 1 : 0; left = 0; }
      let right = n - top - bottom - left;
      if (right < 0) { left = Math.max(0, left + right); right = 0; }
      const side = (k, f) => { for (let i = 0; i < k; i++) pts.push(f((i + 0.5) / k)); };
      side(top, (p) => [t.x + p * t.w, t.y - 11]);
      side(bottom, (p) => [t.x + p * t.w, t.y + t.h + 11]);
      side(left, (p) => [t.x - 11, t.y + p * t.h]);
      side(right, (p) => [t.x + t.w + 11, t.y + p * t.h]);
    }
    return pts.map(([x, y]) => `<circle class="ch" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8"/>`).join('');
  }
  function tableSVG(t, cls, sub) {
    const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
    const fs = Math.max(13, Math.min(34, Math.min(t.w, t.h) * 0.34));
    const top = t.shape === 'round'
      ? `<ellipse class="top" cx="${cx}" cy="${cy}" rx="${t.w / 2}" ry="${t.h / 2}"/>`
      : `<rect class="top" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="${t.kind === 'deco' ? 4 : 10}"/>`;
    const s2 = sub !== undefined ? sub : (t.kind === 'mesa' ? `${t.seats} pl.` : '');
    const two = s2 && t.h >= 54;
    return `<g class="tb ${cls}" data-t="${t.id}" role="button" tabindex="0" aria-label="${esc((t.kind === 'mesa' ? 'Mesa ' : '') + t.name)}">${chairs(t)}${top}
      <text x="${cx}" y="${two ? cy - fs * 0.32 : cy}" font-size="${fs}">${esc(t.name)}</text>
      ${two ? `<text class="s" x="${cx}" y="${cy + fs * 0.62}" font-size="${Math.max(11, fs * 0.45)}">${esc(s2)}</text>` : ''}</g>`;
  }
  function groupSVG(g, byId, cls = '') {
    const ts = g.tables.map((id) => byId[id]).filter(Boolean);
    if (!ts.length) return '';
    const x = Math.min(...ts.map((t) => t.x)) - 22, y = Math.min(...ts.map((t) => t.y)) - 22;
    const x2 = Math.max(...ts.map((t) => t.x + t.w)) + 22, y2 = Math.max(...ts.map((t) => t.y + t.h)) + 22;
    return `<rect class="grp ${cls}" data-g="${g.id}" x="${x}" y="${y}" width="${x2 - x}" height="${y2 - y}" rx="18"/>
      <text class="grp-l" x="${x + 8}" y="${y - 6}">${esc(g.name || 'Fusión ' + ts.map((t) => t.name).join('+'))}</text>`;
  }
  function floorSVG(floor, inner, extra = '') {
    const pts = floor.shape.map((p) => p.join(',')).join(' ');
    return `<svg class="map" viewBox="-40 -40 ${floor.w + 80} ${floor.h + 80}" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="gr" width="50" height="50" patternUnits="userSpaceOnUse"><path class="gridl" d="M50 0H0V50" fill="none"/></pattern>
      <clipPath id="clip-${floor.id}"><polygon points="${pts}"/></clipPath></defs>
      <polygon class="room" points="${pts}"/>
      <rect x="0" y="0" width="${floor.w}" height="${floor.h}" fill="url(#gr)" clip-path="url(#clip-${floor.id})" pointer-events="none"/>
      ${inner}${extra}</svg>`;
  }
  function floorTabs(floors, cur, extra = '') {
    return `<div class="floors" role="tablist" aria-label="Plantas">${floors.map((f) => `<button type="button" role="tab" data-f="${f.id}" aria-selected="${f.id === cur}">${esc(f.name)}</button>`).join('')}${extra}</div>`;
  }
  const sortedFloors = (l) => l.floors.slice().sort((a, b) => b.level - a.level);
  function curFloor(l) {
    const fs = sortedFloors(l);
    let f = fs.find((x) => x.id === S.floor);
    if (!f) f = fs.find((x) => x.level === 0) || fs[fs.length - 1];
    S.floor = f.id;
    LS.set('sala_floor', f.id);
    return f;
  }

  /* ---------- Vista: Sala ---------- */
  async function viewSala() {
    if (!S.st) view().innerHTML = '<div class="spin dark" aria-label="Cargando"></div>';
    try { await loadState(true); } catch (err) { return errBox(err); }
    paintSala();
    every(4000, async () => { try { if (await loadState()) paintSala(true); } catch (e) { /* reintenta */ } });
    clockT = setInterval(() => { if (!S.time && $('.map')) paintMap(); }, 30000);
  }
  function paintSala(soft) {
    if (S.view !== 'sala') return;
    const l = layout();
    const f = curFloor(l);
    const today = S.date === iso(clock());
    const listScroll = soft && $('.rlist') ? $('.rlist').scrollTop : 0;
    view().innerHTML = `<div class="sala">
      <section class="card">
        <div class="tools">
          ${floorTabs(sortedFloors(l), f.id)}
          <span class="grow"></span>
          <input class="inp" type="date" id="s-date" value="${S.date}" aria-label="Día">
          <input class="inp" type="time" id="s-time" value="${S.time || (today ? hm(clock()) : '13:00')}" step="900" aria-label="Hora">
          ${S.time || !today ? '<button class="btn btn-quiet btn-sm" type="button" data-now>Ahora</button>' : ''}
          ${today ? '<button class="btn btn-quiet btn-sm" type="button" data-closed>Cobradas hoy</button>' : ''}
        </div>
        <div class="map-wrap view" id="map"></div>
        <div class="legend"><span><i class="lg-libre"></i>Libre</span><span><i class="lg-prox"></i>Reserva en menos de 1 h</span><span><i class="lg-res"></i>Reservada</span><span><i class="lg-ocu"></i>Ocupada</span><span><i class="lg-av"></i>Plato listo, llaman o pedido por QR</span></div>
      </section>
      <aside class="card side">
        <h2>Reservas ${today ? 'de hoy' : 'del ' + S.date.split('-').reverse().join('/')} <small>${S.st.reservations.length}</small></h2>
        <div class="rlist">${resList()}</div>
      </aside></div>`;
    paintMap();
    if (listScroll) $('.rlist').scrollTop = listScroll;
    $$('.floors [data-f]').forEach((b) => b.addEventListener('click', () => { S.floor = b.dataset.f; paintSala(); }));
    $('#s-date').addEventListener('change', async (e) => { S.date = e.target.value || iso(clock()); S.time = ''; S.rev = ''; await viewSala(); });
    $('#s-time').addEventListener('change', (e) => { S.time = e.target.value; paintSala(); });
    const now = $('[data-now]');
    if (now) now.addEventListener('click', async () => { const wasOther = S.date !== iso(clock()); S.time = ''; S.date = iso(clock()); if (wasOther) { S.rev = ''; await viewSala(); } else paintSala(); });
    const closed = $('[data-closed]');
    if (closed) closed.addEventListener('click', showClosed);
    $$('[data-res]').forEach((b) => b.addEventListener('click', () => showRes(Number(b.dataset.res))));
  }
  function paintMap() {
    const box = $('#map');
    if (!box || !S.st) return;
    const l = layout();
    const f = curFloor(l);
    const byId = tById();
    const ts = l.tables.filter((t) => t.floor === f.id);
    const groups = l.groups.filter((g) => byId[g.tables[0]] && byId[g.tables[0]].floor === f.id);
    const today = S.date === iso(clock());
    const sub = (t) => {
      if (t.kind !== 'mesa') return '';
      const o = today ? orderOf(t.id) : null;
      if (o && o.call) return o.call.type === 'cuenta' ? 'Pide la cuenta' : 'Llama';
      if (o && o.items.some((i) => i.status === 'pendiente')) return 'Pedido QR';
      if (o) return `${o.people || ''}${o.people ? ' pers · ' : ''}${Math.max(0, Math.round((clock().getTime() - new Date(o.opened_at.replace(' ', 'T')).getTime()) / 60000))} min`;
      const r = resFor(t.id, true);
      if (r) return `${r.time} · ${r.people}p`;
      return `${t.seats} pl.`;
    };
    // Las fusiones automáticas de las reservas también se dibujan (línea discontinua)
    const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
    const resGroups = S.st.reservations.filter((r) => r.tables.length > 1 && resFor(r.tables[0], true) === r && !groups.some((g) => same(g.tables, r.tables)))
      .map((r) => ({ id: 'r' + r.id, name: `${r.name.split(' ')[0]} ${r.time}`, tables: r.tables }));
    box.innerHTML = floorSVG(f, groups.concat(resGroups).map((g) => groupSVG(g, byId)).join('') + ts.map((t) => tableSVG(t, tableStatus(t), sub(t))).join(''));
    const open = (el) => { const t = byId[el.dataset.t]; if (t && t.kind === 'mesa') tapTable(t); };
    $$('.tb', box).forEach((g) => {
      g.addEventListener('click', () => open(g));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(g); } });
    });
  }
  function resList() {
    const rs = S.st.reservations;
    if (!rs.length) return '<p class="empty">No hay reservas este día.</p>';
    const t = viewMin();
    const dur = S.st.minutes || 90;
    return rs.map((r) => `<button type="button" class="rv${toMin(r.time) <= t && t < toMin(r.time) + dur ? ' now' : ''}" data-res="${r.id}">
        <b>${esc(r.time)}</b>
        <span><p>${esc(r.name)} · ${r.people} pers.${r.status !== 'confirmada' ? ` <small>(${r.status === 'pendiente' ? 'sin aceptar' : 'sin confirmar'})</small>` : ''}</p>
        <p class="mesa${r.tables.length ? '' : ' no'}">${esc(tLabel(r.tables))}${r.manual ? ' <small>(a mano)</small>' : ''}</p>
        ${r.notes ? `<small>${esc(r.notes)}</small>` : ''}</span></button>`).join('');
  }

  /** Pulsar una mesa: si tiene pedido, se abre; si no, se ofrece abrirla (sola, con su reserva o junto a otras). */
  function tapTable(t) {
    const today = S.date === iso(clock());
    const o = today ? orderOf(t.id) : null;
    if (o) { S.orderId = o.id; go('pedido'); return; }
    const all = S.st.reservations.filter((r) => r.tables.includes(t.id));
    const near = resFor(t.id, true);
    const g = groupOf(t.id);
    const base = near ? near.tables : (g ? g.tables : [t.id]);
    const l = layout();
    const sameFloor = l.tables.filter((x) => x.kind === 'mesa' && x.floor === t.floor);
    const busyIds = new Set(S.st.orders.flatMap((x) => x.tables));
    openSheet(`Mesa ${t.name}`, `
      <p class="help">${t.seats} plazas${g ? ` · fusionada en «${esc(g.name || tName(g.tables))}»` : ''}</p>
      ${all.length ? `<div class="field">Reservas de esta mesa<div class="stack">${all.map((r) => `<button type="button" class="rv" data-res="${r.id}"><b>${esc(r.time)}</b><span><p>${esc(r.name)} · ${r.people} pers.</p>${r.notes ? `<small>${esc(r.notes)}</small>` : ''}</span></button>`).join('')}</div></div>` : '<p class="help">No tiene reservas este día.</p>'}
      ${today ? `<form class="form" id="open-f" novalidate>
        ${near ? `<label class="switch-row">Es la reserva de ${esc(near.name)} (${esc(near.time)}, ${near.people} pers.) <span class="sw"><input type="checkbox" name="res" checked><span></span></span></label>` : ''}
        <div class="field">Mesas <div class="chips">${sameFloor.map((x) => `<label><input type="checkbox" name="tables" value="${x.id}" ${base.includes(x.id) ? 'checked' : ''} ${busyIds.has(x.id) ? 'disabled' : ''}><span>${esc(x.name)}</span></label>`).join('')}</div>
          <span class="help">Marca varias para juntarlas en un solo pedido.</span></div>
        <div class="row"><label>Personas <input name="people" type="number" inputmode="numeric" min="0" max="300" value="${near ? near.people : ''}" placeholder="${t.seats}"></label></div>
        <label>Nota de la mesa <input name="note" maxlength="300" placeholder="Cumpleaños, trona, tienen prisa…" value="${near && near.notes ? esc(near.notes) : ''}"></label>
        <button class="btn btn-main" type="submit">Abrir mesa y tomar nota</button>
      </form>` : '<p class="help">Solo se pueden abrir mesas del día de hoy.</p>'}`, (body) => {
      $$('[data-res]', body).forEach((b) => b.addEventListener('click', () => showRes(Number(b.dataset.res))));
      const f = $('#open-f', body);
      if (!f) return;
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const b = $('button[type=submit]', f);
        const tables = $$('[name=tables]:checked', f).map((x) => x.value);
        busy(b, true, 'Abriendo…');
        try {
          const ord = await api('order_open', { body: { tables, people: Number(f.people.value) || 0, note: f.note.value, res: near && f.res && f.res.checked ? near.id : 0 } });
          closeSheet();
          S.rev = '';
          S.orderId = ord.id;
          go('pedido');
        } catch (err) { busy(b, false); toast(err.message, 'err'); }
      });
    });
  }

  /** Detalle de una reserva: cambiar sus mesas a mano o que las busque sola. */
  function showRes(id) {
    const r = S.st.reservations.find((x) => x.id === id);
    if (!r) return;
    const l = layout();
    const fl = Object.fromEntries(l.floors.map((f) => [f.id, f.name]));
    const mesas = l.tables.filter((t) => t.kind === 'mesa');
    openSheet(`${r.name}`, `
      <dl class="detail"><dt>Hora</dt><dd>${esc(r.time)}</dd><dt>Personas</dt><dd>${r.people}</dd>
        <dt>Mesa</dt><dd>${esc(tLabel(r.tables))}${r.tables.length ? ` (${seatsOf(r.tables)} plazas)` : ''}</dd>
        ${r.notes ? `<dt>Notas</dt><dd>${esc(r.notes)}</dd>` : ''}</dl>
      <form class="form" id="as-f" novalidate>
        <div class="field">Cambiar las mesas
          ${l.floors.map((f) => `<p class="help">${esc(fl[f.id])}</p><div class="chips">${mesas.filter((t) => t.floor === f.id).map((t) => `<label><input type="checkbox" name="t" value="${t.id}" ${r.tables.includes(t.id) ? 'checked' : ''}><span>${esc(t.name)} · ${t.seats}</span></label>`).join('')}</div>`).join('')}
        </div>
        <div class="actions">
          <button class="btn" type="submit">Guardar mesas</button>
          <button class="btn btn-line" type="button" data-auto>Buscar mesa sola</button>
          ${r.tables.length ? '<button class="btn btn-danger" type="button" data-clear>Quitar mesa</button>' : ''}
        </div>
      </form>`, (body) => {
      const f = $('#as-f', body);
      const send = async (route, payload, b, msg) => {
        busy(b, true);
        try { const d = await api(route, { body: payload }); closeSheet(); toast(msg(d)); await loadState(true); paintSala(); }
        catch (err) { busy(b, false); toast(err.message, 'err'); }
      };
      f.addEventListener('submit', (e) => { e.preventDefault(); send('assign_set', { reservation: r.id, tables: $$('[name=t]:checked', f).map((x) => x.value) }, $('button[type=submit]', f), (d) => (d.tables.length ? `Asignada: ${tLabel(d.tables)}` : 'Reserva sin mesa')); });
      $('[data-auto]', f).addEventListener('click', (e) => send('assign_auto', { reservation: r.id }, e.currentTarget, (d) => `Asignada: ${tLabel(d.tables)}`));
      const c = $('[data-clear]', f);
      if (c) c.addEventListener('click', (e) => send('assign_set', { reservation: r.id, tables: [] }, e.currentTarget, () => 'Reserva sin mesa'));
    });
  }

  async function showClosed() {
    let d;
    try { d = await api('closed_today'); } catch (err) { toast(err.message, 'err'); return; }
    const total = d.orders.reduce((a, o) => a + o.total, 0);
    openSheet('Mesas cobradas hoy', d.orders.length ? `
      <table class="bill">${d.orders.map((o) => `<tr><td>${esc(o.closed_at.slice(11, 16))} · ${esc(tLabel(o.tables))}${o.people ? ` · ${o.people} pers.` : ''}</td><td>${euro(o.total)} <button class="btn btn-quiet btn-sm" type="button" data-re="${o.id}">Reabrir</button></td></tr>`).join('')}</table>
      <div class="total"><span>Total del día</span><span>${euro(total)}</span></div>` : '<p class="empty">Todavía no se ha cerrado ninguna mesa hoy.</p>', (body) => {
      $$('[data-re]', body).forEach((b) => b.addEventListener('click', async () => {
        if (!confirm('¿Volver a abrir este pedido? La mesa vuelve a quedar ocupada.')) return;
        try { const o = await api('order_reopen', { body: { id: Number(b.dataset.re) } }); closeSheet(); S.rev = ''; S.orderId = o.id; go('pedido'); }
        catch (err) { toast(err.message, 'err'); }
      }));
    });
  }

  /* ---------- Vista: Pedido de una mesa ---------- */
  let order = null;
  async function viewPedido() {
    view().innerHTML = '<div class="spin dark" aria-label="Cargando"></div>';
    try {
      const [o, c] = await Promise.all([api('order', { query: `&id=${S.orderId}` }), S.carta ? Promise.resolve(S.carta) : api('carta')]);
      if (!S.st) await loadState(true);
      order = o;
      S.carta = c;
    } catch (err) { return errBox(err); }
    if (order.status !== 'abierta') { toast('Este pedido ya está cerrado'); go('sala'); return; }
    if (!S.cat) S.cat = S.carta.categories.length ? 'c' + S.carta.categories[0].id : 'esp';
    paintPedido();
    every(5000, async () => {
      try {
        const o = await api('order', { query: `&id=${S.orderId}` });
        if (o.status !== 'abierta') { toast('Otra persona ha cerrado esta mesa'); go('sala'); return; }
        const was = JSON.stringify(order.items.map((i) => [i.id, i.status]));
        order = o;
        if (was !== JSON.stringify(o.items.map((i) => [i.id, i.status]))) paintComanda();
        await loadState();
      } catch (e) { /* reintenta */ }
    });
  }
  const draft = () => (S.drafts[S.orderId] = S.drafts[S.orderId] || []);
  function paintPedido() {
    view().innerHTML = `
      <div class="ped-head">
        <button class="btn btn-quiet btn-sm" type="button" data-back>← Sala</button>
        <h1>${esc(tLabel(order.tables))}</h1>
        <span class="meta">${order.people ? order.people + ' pers. · ' : ''}abierta a las ${esc(order.opened_at.slice(11, 16))} por ${esc(order.by)}${order.note ? ' · ' + esc(order.note) : ''}</span>
        <span class="grow"></span>
        <button class="btn btn-quiet btn-sm" type="button" data-qr>${order.qr ? `QR · código ${esc(order.pin)}` : 'QR apagado'}</button>
        <button class="btn btn-quiet btn-sm" type="button" data-edit>Personas, nota y mesas</button>
      </div>
      <div class="ped">
        <section class="card">
          <input class="inp" type="search" id="q" placeholder="Buscar plato…" value="${esc(S.q)}" autocomplete="off" style="margin-bottom:8px">
          <div class="ctabs" role="tablist" aria-label="Carta"></div>
          <div id="dishes"></div>
        </section>
        <section class="card comanda" id="comanda"></section>
      </div>`;
    $('[data-back]').addEventListener('click', () => go('sala'));
    $('[data-edit]').addEventListener('click', editOrder);
    $('[data-qr]').addEventListener('click', qrSheet);
    $('#q').addEventListener('input', (e) => { S.q = e.target.value; paintDishes(); });
    paintDishes();
    paintComanda();
  }
  function paintDishes() {
    const c = S.carta;
    const tabs = c.categories.map((x) => ['c' + x.id, x.name]);
    if (c.menus.length) tabs.push(['menus', 'Menús']);
    tabs.push(['esp', 'Especiales']);
    $('.ctabs').innerHTML = tabs.map(([k, n]) => `<button type="button" role="tab" data-cat="${k}" aria-selected="${!S.q && S.cat === k}">${esc(n)}</button>`).join('');
    $$('.ctabs [data-cat]').forEach((b) => b.addEventListener('click', () => { S.cat = b.dataset.cat; S.q = ''; $('#q').value = ''; paintDishes(); }));
    const al = (list) => (list && list.length ? `<span class="al" title="Alérgenos">${list.map((k) => esc((c.allergens.find((a) => a.key === k) || { abbr: k }).abbr)).join(' ')}</span>` : '');
    const dishBtn = (d, cat) => `<button type="button" class="dish" data-dish="${d.id}" data-cid="${cat.id}"><b>${esc(d.name)}</b><span>${al(d.allergens)}<i>${euro(d.price)}</i></span></button>`;
    let html = '';
    if (S.q.trim()) {
      const q = norm(S.q.trim());
      const hits = [];
      c.categories.forEach((cat) => cat.dishes.forEach((d) => { if (norm(d.name).includes(q)) hits.push(dishBtn(d, cat)); }));
      html = hits.length ? `<div class="dishes">${hits.join('')}</div>` : '<p class="empty">Ningún plato con ese nombre. Puedes añadirlo como especial.</p>';
    } else if (S.cat === 'menus') {
      html = `<div class="dishes">${c.menus.map((m, i) => `<button type="button" class="dish" data-menu="${i}"><b>${esc(m.title)}</b><span><i>${m.courses.length} platos</i><i>${euro(m.price)}</i></span></button>`).join('')}</div>`;
    } else if (S.cat === 'esp') {
      html = `<div class="dishes">${c.specials.map((s, i) => `<button type="button" class="dish" data-sp="${i}"><b>${esc(s.name)}</b><span><i>${esc(COURSES[s.course])}</i><i>${euro(s.price)}</i></span></button>`).join('')}
        <button type="button" class="dish" data-free><b>+ Otro plato o bebida</b><span><i>Escribe el nombre y el precio</i></span></button></div>
        ${c.specials.length ? '' : '<p class="help" style="margin-top:8px">El encargado puede dejar los especiales del día preparados en Preferencias.</p>'}`;
    } else {
      const cat = c.categories.find((x) => 'c' + x.id === S.cat) || c.categories[0];
      html = cat ? `<div class="dishes">${cat.dishes.map((d) => dishBtn(d, cat)).join('')}</div>` : '<p class="empty">La carta está vacía.</p>';
    }
    $('#dishes').innerHTML = html;
    $$('#dishes [data-dish]').forEach((b) => b.addEventListener('click', () => {
      const cat = c.categories.find((x) => x.id === Number(b.dataset.cid));
      const d = cat.dishes.find((x) => x.id === Number(b.dataset.dish));
      addLine({ kind: 'dish', dish: d.id, name: d.name, price: d.price, course: cat.course, allergens: d.allergens, barra: cat.barra });
    }));
    $$('#dishes [data-menu]').forEach((b) => b.addEventListener('click', () => addMenu(c.menus[Number(b.dataset.menu)])));
    $$('#dishes [data-sp]').forEach((b) => b.addEventListener('click', () => {
      const s = c.specials[Number(b.dataset.sp)];
      addLine({ kind: 'special', special: Number(b.dataset.sp), name: s.name, price: s.price, course: s.course });
    }));
    const fr = $('#dishes [data-free]');
    if (fr) fr.addEventListener('click', () => addLine({ kind: 'special', name: '', price: 0, course: 2, free: true }));
  }
  function noteField(val = '') {
    return `<label>Nota para la cocina <textarea name="note" rows="2" maxlength="200" placeholder="Sin gluten, poco hecho…">${esc(val)}</textarea></label>
      <div class="chips" data-nchips>${NOTE_CHIPS.map((n) => `<button type="button" class="chip-btn" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>`;
  }
  function wireNotes(f) {
    $$('[data-n]', f).forEach((b) => b.addEventListener('click', () => {
      const ta = f.note;
      ta.value = ta.value.trim() ? ta.value.trim().replace(/[,.]?$/, ', ') + b.dataset.n.toLowerCase() : b.dataset.n;
    }));
  }
  function stepper(name, v) {
    return `<div class="stepper"><button type="button" data-st="-1" aria-label="Uno menos">−</button><output name="${name}">${v}</output><button type="button" data-st="1" aria-label="Uno más">+</button></div>`;
  }
  function wireStepper(f) {
    $$('[data-st]', f).forEach((b) => b.addEventListener('click', () => {
      const o = $('output', b.parentNode);
      o.value = o.textContent = String(Math.max(1, Math.min(99, Number(o.textContent) + Number(b.dataset.st))));
    }));
  }
  const courseChips = (cur) => `<div class="field">Pase<div class="chips">${Object.entries(COURSES).map(([k, n]) => `<label><input type="radio" name="course" value="${k}" ${Number(k) === cur ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></div>`;
  /** Añadir un plato a la comanda (todavía sin enviar). */
  function addLine(line) {
    openSheet(line.free ? 'Otro plato o bebida' : line.name, `
      <form class="form" id="add-f" novalidate>
        ${line.free ? `<div class="row"><label>Nombre <input name="name" maxlength="80" required></label><label>Precio (€) <input name="price" type="number" step="0.01" min="0" inputmode="decimal" value=""></label></div>` : `<p class="help">${euro(line.price)}${line.allergens && line.allergens.length ? ' · Alérgenos: ' + esc(line.allergens.join(', ')) : ''}${line.barra ? ' · va a la barra' : ''}</p>`}
        <div class="row"><span class="field">Cantidad ${stepper('qty', 1)}</span></div>
        ${courseChips(line.course)}
        ${noteField()}
        <label class="switch-row">Esperar: la cocina no lo empieza hasta que lo marches <span class="sw"><input type="checkbox" name="hold" ${line.course === 3 ? 'checked' : ''}><span></span></span></label>
        <button class="btn btn-main" type="submit">Añadir a la comanda</button>
      </form>`, (body) => {
      const f = $('#add-f', body);
      wireStepper(f); wireNotes(f);
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const l = { ...line, qty: Number($('output', f).textContent), note: f.note.value.trim(), course: Number(f.course.value), hold: f.hold.checked, key: uid('l') };
        if (line.free) {
          l.name = f.name.value.trim();
          l.price = Math.max(0, Number(String(f.price.value).replace(',', '.')) || 0);
          if (!l.name) { toast('Escribe el nombre', 'err'); return; }
          l.dest = l.course === 0 ? 'barra' : 'cocina';
          delete l.free;
        }
        draft().push(l);
        saveDrafts();
        closeSheet();
        paintComanda();
      });
    });
  }
  /** Menú: un plato de cada pase. */
  function addMenu(m) {
    openSheet(m.title, `
      <form class="form" id="menu-f" novalidate>
        <p class="help">${euro(m.price)}${m.note ? ' · ' + esc(m.note) : ''}</p>
        ${m.courses.map((c, ci) => `<div class="field">${esc(c.name || 'Plato ' + (ci + 1))}<div class="chips">${c.dishes.map((d, di) => `<label><input type="radio" name="c${ci}" value="${di}" ${c.dishes.length === 1 ? 'checked' : ''}><span>${esc(d.name)}${d.extra ? ` (+${euro(d.extra)})` : ''}</span></label>`).join('')}</div></div>`).join('')}
        <div class="row"><span class="field">Cuántos menús iguales ${stepper('qty', 1)}</span></div>
        ${noteField()}
        <label class="switch-row">Esperar los segundos y el postre hasta marcharlos <span class="sw"><input type="checkbox" name="hold" checked><span></span></span></label>
        <button class="btn btn-main" type="submit">Añadir menú</button>
      </form>`, (body) => {
      const f = $('#menu-f', body);
      wireStepper(f); wireNotes(f);
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const choices = [];
        for (let ci = 0; ci < m.courses.length; ci++) {
          if (!m.courses[ci].dishes.length) continue;
          const v = $(`[name=c${ci}]:checked`, f);
          if (!v) { toast(`Elige: ${m.courses[ci].name || 'plato ' + (ci + 1)}`, 'err'); return; }
          choices.push({ c: ci, d: Number(v.value), hold: f.hold.checked && ci > 0, course: Math.min(3, ci + 1) });
        }
        const names = choices.map((ch) => m.courses[ch.c].dishes[ch.d].name);
        const price = m.price + choices.reduce((a, ch) => a + (m.courses[ch.c].dishes[ch.d].extra || 0), 0);
        draft().push({ kind: 'menu', menu: m.id, name: m.title, detail: names.join(' / '), price, qty: Number($('output', f).textContent), note: f.note.value.trim(), choices, course: 1, key: uid('l') });
        saveDrafts();
        closeSheet();
        paintComanda();
      });
    });
  }
  function paintComanda() {
    const box = $('#comanda');
    if (!box) return;
    const d = draft();
    const items = order.items;
    const holdCourses = [...new Set(items.filter((i) => i.status === 'espera').map((i) => i.course))].sort();
    const byCourse = {};
    items.forEach((i) => { (byCourse[i.course] = byCourse[i.course] || []).push(i); });
    const total = items.filter((i) => i.status !== 'anulado' && i.status !== 'pendiente').reduce((a, i) => a + i.price * i.qty, 0) + d.reduce((a, l) => a + l.price * l.qty, 0);
    const pend = items.filter((i) => i.status === 'pendiente');
    box.innerHTML = `
      ${order.call ? `<div class="qr-alert"><b>${order.call.type === 'cuenta' ? 'Piden la cuenta' : 'Llaman al camarero'}</b><span>desde el móvil, a las ${esc(order.call.at.slice(11, 16))}</span><button class="btn btn-ok btn-sm" type="button" data-calldone>Atendido</button></div>` : ''}
      ${pend.length ? `<div class="qr-alert"><b>Pedido desde el móvil: ${pend.reduce((a, i) => a + i.qty, 0)} plato(s) por aceptar</b><span>${pend.map((i) => `${i.qty}× ${esc(i.name)}`).join(', ')}</span>
        <span class="row"><button class="btn btn-ok btn-sm" type="button" data-pend="ok">Aceptar y enviar a cocina</button><button class="btn btn-danger btn-sm" type="button" data-pend="no">Rechazar</button></span></div>` : ''}
      <h2>Por enviar</h2>
      ${d.length ? `<div class="lines">${d.map((l) => `<button type="button" class="line draft" data-dl="${l.key}">
          <span class="q">${l.qty}×</span><span><p>${esc(l.name)}</p>${l.detail ? `<small>${esc(l.detail)}</small>` : ''}<small>${esc(COURSES[l.course])}${l.hold ? ' · en espera' : ''}</small>${l.note ? `<small class="nota">${esc(l.note)}</small>` : ''}</span><span>${euro(l.price * l.qty)}</span></button>`).join('')}</div>
        <div class="actions"><button class="btn btn-main" type="button" data-send>Enviar a cocina (${d.reduce((a, l) => a + l.qty, 0)})</button><button class="btn btn-quiet" type="button" data-dclear>Vaciar</button></div>`
        : '<p class="help">Toca los platos de la carta para añadirlos. Luego envíalos a la cocina de una vez.</p>'}
      <h2 style="margin-top:14px">Enviado</h2>
      ${items.length ? Object.keys(byCourse).sort().map((c) => `<div class="course-h"><span>${esc(COURSES[c])}</span>${holdCourses.includes(Number(c)) ? `<button class="btn btn-warn btn-sm" type="button" data-fire="${c}">Marchar ${esc(COURSES[c].toLowerCase())}</button>` : ''}</div>
        <div class="lines">${byCourse[c].map((i) => `<button type="button" class="line ln-${i.status}" data-it="${i.id}">
          <span class="q">${i.qty}×</span><span><p>${esc(i.name)}${i.qr ? ' <span class="tag-qr" title="Pedido desde el móvil">QR</span>' : ''}</p>${i.sub ? `<small>${esc(i.sub)}</small>` : ''}${i.note ? `<small class="nota">${esc(i.note)}</small>` : ''}</span>
          <span><span class="st st-${i.status}">${ST[i.status]}</span><small>${euro(i.price * i.qty)}</small></span></button>`).join('')}</div>`).join('') : '<p class="help">Aún no se ha enviado nada.</p>'}
      <div class="total"><span>Total</span><span>${euro(total)}</span></div>
      <div class="actions">${holdCourses.length > 1 ? '<button class="btn btn-warn" type="button" data-fire="-1">Marchar todo</button>' : ''}<button class="btn btn-ok" type="button" data-close>Cuenta y cerrar mesa</button></div>`;
    $$('[data-dl]', box).forEach((b) => b.addEventListener('click', () => {
      if (!confirm('¿Quitar este plato de la comanda?')) return;
      S.drafts[S.orderId] = d.filter((l) => l.key !== b.dataset.dl);
      saveDrafts();
      paintComanda();
    }));
    const dc = $('[data-dclear]', box);
    if (dc) dc.addEventListener('click', () => { if (confirm('¿Vaciar lo que falta por enviar?')) { S.drafts[S.orderId] = []; saveDrafts(); paintComanda(); } });
    const send = $('[data-send]', box);
    if (send) send.addEventListener('click', async () => {
      busy(send, true, 'Enviando…');
      try {
        order = await api('order_add', { body: { id: order.id, items: d.map((l) => ({ kind: l.kind, dish: l.dish, menu: l.menu, choices: l.choices, special: l.special, name: l.name, price: l.price, qty: l.qty, note: l.note, course: l.course, hold: l.hold })) } });
        S.drafts[S.orderId] = [];
        saveDrafts();
        toast('Enviado a cocina', 'ok');
        paintComanda();
      } catch (err) { busy(send, false); toast(err.message, 'err'); }
    });
    $$('[data-fire]', box).forEach((b) => b.addEventListener('click', async () => {
      busy(b, true, '…');
      try { order = await api('order_fire', { body: { id: order.id, course: Number(b.dataset.fire) } }); toast('Marchado: la cocina ya lo tiene', 'ok'); paintComanda(); }
      catch (err) { busy(b, false); toast(err.message, 'err'); }
    }));
    $$('[data-it]', box).forEach((b) => b.addEventListener('click', () => itemSheet(items.find((i) => i.id === Number(b.dataset.it)))));
    $('[data-close]', box).addEventListener('click', closeOrder);
    const cd = $('[data-calldone]', box);
    if (cd) cd.addEventListener('click', async () => {
      busy(cd, true, '…');
      try { order = await api('order_update', { body: { id: order.id, call_done: true } }); S.rev = ''; paintComanda(); }
      catch (err) { busy(cd, false); toast(err.message, 'err'); }
    });
    $$('[data-pend]', box).forEach((b) => b.addEventListener('click', async () => {
      const ok = b.dataset.pend === 'ok';
      if (!ok && !confirm('¿Rechazar lo que han pedido desde el móvil? No llega a la cocina ni se cobra.')) return;
      busy(b, true, '…');
      try {
        // Al aceptar, los postres quedan en espera como siempre; el resto va a la cocina
        const later = pend.filter((i) => ok && i.course === 3).map((i) => i.id);
        const now = pend.filter((i) => !later.includes(i.id)).map((i) => i.id);
        if (now.length) await api('item_status', { body: { ids: now, status: ok ? 'nuevo' : 'anulado' } });
        if (later.length) await api('item_status', { body: { ids: later, status: 'espera' } });
        order = await api('order', { query: `&id=${order.id}` });
        S.rev = '';
        toast(ok ? 'Aceptado: la cocina ya lo tiene' : 'Pedido rechazado', ok ? 'ok' : '');
        paintComanda();
      } catch (err) { busy(b, false); toast(err.message, 'err'); }
    }));
  }
  function itemSheet(i) {
    if (!i) return;
    const btn = (st, label, cls = 'btn-line') => (i.status !== st ? `<button class="btn ${cls}" type="button" data-s="${st}">${label}</button>` : '');
    openSheet(`${i.qty}× ${i.name}`, `
      <dl class="detail"><dt>Estado</dt><dd><span class="st st-${i.status}">${ST[i.status]}</span></dd><dt>Pase</dt><dd>${esc(COURSES[i.course])}</dd>
        ${i.note ? `<dt>Nota</dt><dd>${esc(i.note)}</dd>` : ''}<dt>Enviado</dt><dd>${esc(i.sent_at.slice(11, 16))} por ${esc(i.by)}</dd><dt>Importe</dt><dd>${euro(i.price * i.qty)}</dd></dl>
      <div class="actions">
        ${i.status === 'pendiente' ? `${btn(i.course === 3 ? 'espera' : 'nuevo', 'Aceptar', 'btn-ok')}${btn('anulado', 'Rechazar', 'btn-danger')}` : `
        ${i.status === 'espera' ? btn('nuevo', 'Marchar ya', 'btn-warn') : ''}
        ${i.status !== 'anulado' ? btn('servido', 'Servido', 'btn-ok') : ''}
        ${i.status === 'anulado' ? btn('nuevo', 'Recuperar') : btn('anulado', 'Anular (no se cobra)', 'btn-danger')}`}
      </div>`, (body) => {
      $$('[data-s]', body).forEach((b) => b.addEventListener('click', async () => {
        if (b.dataset.s === 'anulado' && i.status !== 'pendiente' && !confirm('¿Anular este plato? Desaparece de la cocina y no se cobra.')) return;
        busy(b, true, '…');
        try { await api('item_status', { body: { id: i.id, status: b.dataset.s } }); order = await api('order', { query: `&id=${order.id}` }); closeSheet(); paintComanda(); }
        catch (err) { busy(b, false); toast(err.message, 'err'); }
      }));
    });
  }
  function editOrder() {
    const l = layout();
    const floor = (tById()[order.tables[0]] || {}).floor;
    const busyIds = new Set(S.st.orders.filter((o) => o.id !== order.id).flatMap((o) => o.tables));
    openSheet('Personas, nota y mesas', `
      <form class="form" id="eo-f" novalidate>
        <div class="row"><label>Personas <input name="people" type="number" min="0" max="300" inputmode="numeric" value="${order.people || ''}"></label></div>
        <label>Nota de la mesa <input name="note" maxlength="300" value="${esc(order.note)}"></label>
        <div class="field">Mesas (para mover el pedido o juntar otra mesa)
          ${l.floors.map((f) => `<p class="help">${esc(f.name)}</p><div class="chips">${l.tables.filter((t) => t.kind === 'mesa' && t.floor === f.id).map((t) => `<label><input type="checkbox" name="t" value="${t.id}" ${order.tables.includes(t.id) ? 'checked' : ''} ${busyIds.has(t.id) ? 'disabled' : ''}><span>${esc(t.name)}</span></label>`).join('')}</div>`).join('')}
          ${floor ? '' : ''}
        </div>
        <button class="btn" type="submit">Guardar</button>
      </form>`, (body) => {
      const f = $('#eo-f', body);
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const b = $('button[type=submit]', f);
        busy(b, true);
        try {
          order = await api('order_update', { body: { id: order.id, people: Number(f.people.value) || 0, note: f.note.value, tables: $$('[name=t]:checked', f).map((x) => x.value) } });
          closeSheet(); S.rev = ''; await loadState(true); paintPedido();
        } catch (err) { busy(b, false); toast(err.message, 'err'); }
      });
    });
  }
  /** QR de la mesa para pedir desde el móvil: el código, el QR con el código dentro y los ajustes de esta mesa. */
  async function qrSheet() {
    let q;
    try { q = await api('order_qr', { query: `&id=${order.id}` }); } catch (err) { return toast(err.message, 'err'); }
    const off = !q.enabled;
    openSheet(`Pedir desde el móvil · ${tLabel(order.tables)}`, `
      ${off ? '<p class="help" style="color:var(--pimenton)">Los pedidos por QR están apagados en todo el local (Preferencias).</p>' : ''}
      ${q.qr && !off ? `<div class="qr-show">
          <div class="qr-img">${q.svg}</div>
          <div><p class="help">${q.need_pin ? 'Código de la mesa' : 'No hace falta código (está quitado en Preferencias)'}</p>
            ${q.need_pin ? `<p class="qr-pin">${esc(q.pin)}</p>` : ''}
            <p class="help">Que escaneen este QR con el móvil (ya lleva el código) o el QR pegado en la mesa${q.need_pin ? ' y escriban el código' : ''}.</p>
            <p class="help">${q.phones ? `${q.phones} móvil(es) conectado(s) a esta mesa.` : 'Aún no hay ningún móvil conectado.'}</p></div>
        </div>` : ''}
      <label class="switch-row">Se puede pedir desde el móvil en esta mesa <span class="sw"><input type="checkbox" data-qron ${q.qr ? 'checked' : ''}><span></span></span></label>
      ${q.qr && q.need_pin ? '<div class="actions"><button class="btn btn-line" type="button" data-newpin>Cambiar el código</button></div><p class="help">Cambiar el código saca a los móviles que ya estaban dentro (por si alguien lo ha visto desde otra mesa).</p>' : ''}`, (body) => {
      $('[data-qron]', body).addEventListener('change', async (e) => {
        try { order = await api('order_update', { body: { id: order.id, qr: e.target.checked } }); S.rev = ''; paintPedido(); qrSheet(); }
        catch (err) { e.target.checked = !e.target.checked; toast(err.message, 'err'); }
      });
      const np = $('[data-newpin]', body);
      if (np) np.addEventListener('click', async () => {
        if (!confirm('¿Cambiar el código? Los móviles que ya estaban dentro tendrán que escribir el nuevo.')) return;
        busy(np, true, '…');
        try { order = await api('order_update', { body: { id: order.id, new_pin: true } }); paintPedido(); qrSheet(); }
        catch (err) { busy(np, false); toast(err.message, 'err'); }
      });
    });
  }
  function billRows(items) {
    const m = new Map();
    items.filter((i) => i.status !== 'anulado' && i.status !== 'pendiente').forEach((i) => {
      const k = i.kind === 'menu' ? i.sub.split(' · ')[0] + '|menu|' + i.batch : i.name + '|' + i.price;
      const r = m.get(k) || { name: i.kind === 'menu' ? i.sub.split(' · ')[0] : i.name, qty: 0, amount: 0, menu: i.kind === 'menu' };
      if (i.kind === 'menu') { r.amount += i.price * i.qty; r.qty = Math.max(r.qty, i.qty); } else { r.qty += i.qty; r.amount += i.price * i.qty; }
      m.set(k, r);
    });
    return [...m.values()];
  }
  function closeOrder() {
    const d = draft();
    const rows = billRows(order.items);
    const total = rows.reduce((a, r) => a + r.amount, 0);
    const cooking = order.items.filter((i) => ['espera', 'nuevo', 'preparando', 'pendiente'].includes(i.status)).length;
    openSheet(`Cuenta · ${tLabel(order.tables)}`, `
      <table class="bill">${rows.map((r) => `<tr><td>${r.qty}× ${esc(r.name)}</td><td>${euro(r.amount)}</td></tr>`).join('')}</table>
      <div class="total"><span>Total</span><span>${euro(total)}</span></div>
      ${order.people > 1 ? `<p class="help">Entre ${order.people}: ${euro(total / order.people)} cada uno.</p>` : ''}
      ${d.length ? `<p class="help" style="color:var(--pimenton)">Ojo: hay ${d.length} plato(s) sin enviar que no salen en la cuenta.</p>` : ''}
      ${cooking ? `<p class="help" style="color:var(--pimenton)">Ojo: la cocina aún tiene ${cooking} plato(s) de esta mesa sin terminar.</p>` : ''}
      <div class="actions"><button class="btn btn-line" type="button" data-print>Imprimir cuenta</button><button class="btn btn-ok" type="button" data-do>Cobrada: cerrar mesa</button></div>`, (body) => {
      $('[data-print]', body).addEventListener('click', () => {
        $('#print').innerHTML = `<h1>${esc(S.restaurant)}</h1><p>${esc(tLabel(order.tables))} · ${clock().toLocaleString('es-ES')}</p>
          <table>${rows.map((r) => `<tr><td>${r.qty}× ${esc(r.name)}</td><td>${euro(r.amount)}</td></tr>`).join('')}</table>
          <p><b>TOTAL ${euro(total)}</b></p><p>IVA incluido. ¡Gracias!</p>`;
        window.print();
      });
      $('[data-do]', body).addEventListener('click', async (e) => {
        if ((d.length || cooking) && !confirm('Hay platos sin enviar o sin terminar. ¿Cerrar la mesa igualmente?')) return;
        busy(e.currentTarget, true, 'Cerrando…');
        try {
          await api('order_close', { body: { id: order.id } });
          delete S.drafts[order.id];
          saveDrafts();
          closeSheet();
          toast(`Mesa cerrada: ${euro(total)}`, 'ok');
          S.rev = '';
          go('sala');
        } catch (err) { busy(e.currentTarget, false); toast(err.message, 'err'); }
      });
    });
  }

  /* ---------- Vista: Cocina ---------- */
  async function viewCocina() {
    document.body.className = 'k';
    view().innerHTML = `<div class="k-top">
        <span class="clock" id="clock">${hm(clock())}</span>
        <div class="seg" role="group" aria-label="Pantalla">${['cocina', 'barra'].map((d) => `<button type="button" data-dest="${d}" aria-pressed="${S.dest === d}">${d === 'cocina' ? 'Cocina' : 'Barra'}</button>`).join('')}</div>
        <span id="k-count"></span>
        <button class="btn btn-quiet btn-sm${S.sound ? ' is-on' : ''}" type="button" data-sound>${S.sound ? 'Sonido activado' : 'Activar sonido'}</button>
        <button class="btn btn-quiet btn-sm" type="button" data-full>Pantalla completa</button>
      </div><div id="k-body"><div class="spin" aria-label="Cargando" style="margin:40px auto"></div></div>`;
    $$('[data-dest]').forEach((b) => b.addEventListener('click', () => { S.dest = b.dataset.dest; LS.set('sala_dest', S.dest); S.kRev = ''; S.kSeen = null; viewCocina(); }));
    $('[data-sound]').addEventListener('click', (e) => { toggleSound(); e.currentTarget.classList.toggle('is-on', S.sound); e.currentTarget.textContent = S.sound ? 'Sonido activado' : 'Activar sonido'; });
    $('[data-full]').addEventListener('click', () => { keepAwake(); const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().catch(() => {}); });
    keepAwake();
    await kLoad(true);
    every(3000, () => kLoad(false));
    clockT = setInterval(() => { const c = $('#clock'); if (c) c.textContent = hm(clock()); paintKitchen(); }, 20000);
  }
  async function kLoad(force) {
    try {
      const d = await api('kitchen', { query: `&dest=${S.dest}&rev=${force ? '' : encodeURIComponent(S.kRev)}` });
      if (d.same) return;
      S.kRev = d.rev;
      S.k = d;
      syncClock(d.now);
      const fresh = d.tickets.filter((t) => !t.hold && S.kSeen && !S.kSeen.has(t.key));
      S.kFresh = new Set(fresh.map((t) => t.key));
      if (fresh.length) beep(3);
      S.kSeen = new Set(d.tickets.map((t) => t.key));
      paintKitchen();
    } catch (err) {
      const b = $('#k-body');
      if (b && !S.k) b.innerHTML = `<p class="k-empty">${esc(err.message)}</p>`;
    }
  }
  function paintKitchen() {
    const box = $('#k-body');
    if (!box || !S.k) return;
    const now = clock().getTime();
    const names = S.k.names || {};
    const label = (ids) => 'Mesa ' + ids.map((id) => names[id] || '?').join(' + ');
    const mins = (t) => Math.max(0, Math.floor((now - new Date(t.replace(' ', 'T')).getTime()) / 60000));
    const active = [];
    const ready = [];
    S.k.tickets.forEach((t) => (t.items.every((i) => i.status === 'listo') ? ready : active).push(t));
    const card = (t, done) => {
      const m = mins(t.sent_at);
      const cls = t.hold ? 'hold' : (done ? '' : (m >= 20 ? 't-red' : m >= 10 ? 't-amber' : ''));
      const byC = {};
      t.items.forEach((i) => { (byC[i.course] = byC[i.course] || []).push(i); });
      return `<article class="tk ${cls}${S.kFresh && S.kFresh.has(t.key) ? ' new' : ''}">
        <div class="tk-h"><b>${esc(label(t.tables))}</b><span class="mins">${t.hold ? 'Espera' : m + "'"}</span>
          <small>${t.people ? t.people + ' pers. · ' : ''}${esc(t.sent_at.slice(11, 16))} · ${esc(t.by)}</small></div>
        ${t.note ? `<div class="tk-note">${esc(t.note)}</div>` : ''}
        ${Object.keys(byC).sort().map((c) => `${Object.keys(byC).length > 1 ? `<p class="course-h">${esc(COURSES[c])}</p>` : ''}<ul>${byC[c].map((i) => `<li class="ki-${i.status}"><button type="button" data-ki="${i.id}" data-ks="${i.status}" ${t.hold ? 'disabled' : ''}>
            <span class="q">${i.qty}</span><span><span class="n">${esc(i.name)}</span>${i.sub ? `<small>${esc(i.sub)}</small>` : ''}${i.allergens && i.allergens.length ? `<small>Alérgenos: ${esc(i.allergens.join(', '))}</small>` : ''}${i.note ? `<span class="nota">${esc(i.note)}</span>` : ''}</span>
            <span class="st st-${i.status}">${ST[i.status]}</span></button></li>`).join('')}</ul>`).join('')}
        ${t.hold ? '' : `<div class="tk-f">${done ? `<button class="btn btn-quiet btn-sm" type="button" data-kall="${t.key}" data-to="preparando">Deshacer</button>` : `<button class="btn btn-ok" type="button" data-kall="${t.key}" data-to="listo">Todo listo</button>`}</div>`}
      </article>`;
    };
    const cnt = $('#k-count');
    if (cnt) cnt.textContent = `${active.filter((t) => !t.hold).length} en marcha · ${ready.length} para servir`;
    box.innerHTML = `${active.length ? `<div class="tickets">${active.map((t) => card(t, false)).join('')}</div>` : `<p class="k-empty">No hay comandas pendientes${S.dest === 'barra' ? ' en la barra' : ''}.</p>`}
      ${ready.length ? `<section class="k-ready"><h2>Listo para servir (desaparece cuando el camarero lo sirve)</h2><div class="tickets">${ready.map((t) => card(t, true)).join('')}</div></section>` : ''}`;
    // Tocar un plato: nuevo → preparando → listo (y tocar uno listo lo devuelve a preparando)
    $$('[data-ki]', box).forEach((b) => b.addEventListener('click', () => {
      const next = { nuevo: 'preparando', preparando: 'listo', listo: 'preparando' }[b.dataset.ks];
      if (next) kSet([Number(b.dataset.ki)], next);
    }));
    $$('[data-kall]', box).forEach((b) => b.addEventListener('click', () => {
      const t = S.k.tickets.find((x) => x.key === b.dataset.kall);
      if (t) kSet(t.items.map((i) => i.id), b.dataset.to);
    }));
  }
  async function kSet(ids, status) {
    // Se ve al momento; luego se confirma con el servidor
    S.k.tickets.forEach((t) => t.items.forEach((i) => { if (ids.includes(i.id)) i.status = status; }));
    paintKitchen();
    try { await api('item_status', { body: ids.length === 1 ? { id: ids[0], status } : { ids, status } }); }
    catch (err) { toast(err.message, 'err'); }
    S.kRev = '';
    kLoad(false);
  }

  /* ---------- Vista: Editor del plano (encargado) ---------- */
  const SNAP = 10;
  const snap = (v) => Math.round(v / SNAP) * SNAP;
  const SHAPES = {
    rect: (w, h) => [[0, 0], [w, 0], [w, h], [0, h]],
    L: (w, h) => [[0, 0], [w * 0.55, 0], [w * 0.55, h * 0.5], [w, h * 0.5], [w, h], [0, h]],
    U: (w, h) => [[0, 0], [w * 0.3, 0], [w * 0.3, h * 0.55], [w * 0.7, h * 0.55], [w * 0.7, 0], [w, 0], [w, h], [0, h]],
    T: (w, h) => [[0, 0], [w, 0], [w, h * 0.4], [w * 0.7, h * 0.4], [w * 0.7, h], [w * 0.3, h], [w * 0.3, h * 0.4], [0, h * 0.4]],
  };
  async function viewPlano() {
    view().innerHTML = '<div class="spin dark" aria-label="Cargando"></div>';
    try { await loadState(true); } catch (err) { return errBox(err); }
    S.ed = { l: clone(layout()), dirty: false, mode: 'mover', sel: null, merge: [], vsel: -1 };
    paintEditor();
  }
  const edFloor = () => { const e = S.ed; let f = e.l.floors.find((x) => x.id === S.floor); if (!f) { f = sortedFloors(e.l)[0]; S.floor = f.id; } return f; };
  function markDirty() { S.ed.dirty = true; const d = $('#ed-dirty'); if (d) d.hidden = false; }
  function paintEditor() {
    const e = S.ed;
    const l = e.l;
    const f = edFloor();
    view().innerHTML = `
      <div class="tools">
        ${floorTabs(sortedFloors(l), f.id, `<button type="button" data-addf="up">+ Planta arriba</button><button type="button" data-addf="down">+ Planta abajo</button>`)}
        <span class="grow"></span>
        <span id="ed-dirty" ${e.dirty ? '' : 'hidden'}>Cambios sin guardar<i class="dirty-dot"></i></span>
        <button class="btn btn-quiet btn-sm" type="button" data-undo>Descartar</button>
        <button class="btn btn-main btn-sm" type="button" data-save>Guardar plano</button>
      </div>
      <div class="ed">
        <section class="card">
          <div class="tools">
            <div class="seg" role="group" aria-label="Modo">${[['mover', 'Mover y cambiar tamaño'], ['forma', 'Forma de la sala'], ['fusionar', 'Fusionar mesas']].map(([k, n]) => `<button type="button" data-mode="${k}" aria-pressed="${e.mode === k}">${n}</button>`).join('')}</div>
            ${e.mode === 'mover' ? `<button class="btn btn-quiet btn-sm" type="button" data-add="rect">+ Mesa cuadrada</button><button class="btn btn-quiet btn-sm" type="button" data-add="round">+ Mesa redonda</button><button class="btn btn-quiet btn-sm" type="button" data-add="deco">+ Barra, puerta…</button>` : ''}
            ${e.mode === 'forma' ? `${Object.keys(SHAPES).map((k) => `<button class="btn btn-quiet btn-sm" type="button" data-preset="${k}">${k === 'rect' ? 'Rectángulo' : 'Forma ' + k}</button>`).join('')}` : ''}
            ${e.mode === 'fusionar' ? `<span class="help">Toca las mesas que quieres juntar (${e.merge.length} elegidas)</span><button class="btn btn-sm" type="button" data-merge ${e.merge.length < 2 ? 'disabled' : ''}>Fusionar</button>` : ''}
          </div>
          <div class="map-wrap" id="ed-map"></div>
          <p class="help" style="margin-top:6px">${{
            mover: 'Arrastra las mesas para moverlas. Con una mesa elegida, arrastra el punto rojo de la esquina para cambiar su tamaño. Flechas del teclado: mover poco a poco; Supr: borrar.',
            forma: 'Arrastra los puntos blancos para dar forma a la sala. Toca un punto rosa (en mitad de una pared) para añadir una esquina. Elige una esquina y pulsa «Quitar esquina» para borrarla.',
            fusionar: 'Las mesas fusionadas funcionan como una sola para pedidos y reservas (para eventos o grupos). Toca la línea discontinua de una fusión para cambiarla o separarla.',
          }[e.mode]}</p>
        </section>
        <aside class="card props" id="props"></aside>
      </div>`;
    $$('.floors [data-f]').forEach((b) => b.addEventListener('click', () => { S.floor = b.dataset.f; e.sel = null; e.merge = []; e.vsel = -1; paintEditor(); }));
    $$('[data-addf]').forEach((b) => b.addEventListener('click', () => addFloor(b.dataset.addf)));
    $$('[data-mode]').forEach((b) => b.addEventListener('click', () => { e.mode = b.dataset.mode; e.sel = null; e.merge = []; e.vsel = -1; paintEditor(); }));
    $$('[data-add]').forEach((b) => b.addEventListener('click', () => addTable(b.dataset.add)));
    $$('[data-preset]').forEach((b) => b.addEventListener('click', () => {
      if (!confirm('¿Cambiar la forma de la sala? Se pierde la forma actual.')) return;
      f.shape = SHAPES[b.dataset.preset](f.w, f.h).map(([x, y]) => [snap(x), snap(y)]);
      markDirty(); paintEditor();
    }));
    const mg = $('[data-merge]');
    if (mg) mg.addEventListener('click', () => {
      const name = prompt('Nombre de la fusión (opcional), p. ej. «Comunión García»', '') ?? '';
      l.groups = l.groups.filter((g) => !g.tables.some((t) => e.merge.includes(t)));
      l.groups.push({ id: uid('g'), name: name.trim(), tables: e.merge.slice(), seats: 0, auto: true });
      e.sel = { g: l.groups[l.groups.length - 1].id };
      e.merge = [];
      markDirty(); paintEditor();
    });
    $('[data-undo]').addEventListener('click', () => { if (!e.dirty || confirm('¿Descartar los cambios del plano?')) { S.ed = null; viewPlano(); } });
    $('[data-save]').addEventListener('click', saveLayout);
    paintEdMap();
    paintProps();
  }
  function addFloor(dir) {
    const l = S.ed.l;
    const lv = l.floors.map((f) => f.level);
    const level = dir === 'up' ? Math.max(...lv) + 1 : Math.min(...lv) - 1;
    const name = prompt('Nombre de la planta', level > 0 ? `Planta ${level}` : (level < 0 ? 'Sótano' : 'Planta baja'));
    if (name === null) return;
    const f = { id: uid('f'), name: name.trim() || 'Planta', level, w: 1000, h: 700, shape: SHAPES.rect(1000, 700) };
    l.floors.push(f);
    S.floor = f.id;
    S.ed.sel = { f: f.id };
    markDirty(); paintEditor();
  }
  function addTable(kind) {
    const f = edFloor();
    const l = S.ed.l;
    const mesas = l.tables.filter((t) => t.kind === 'mesa');
    const nextName = String(mesas.reduce((a, t) => Math.max(a, parseInt(t.name, 10) || 0), 0) + 1);
    const t = kind === 'deco'
      ? { id: uid('d'), floor: f.id, kind: 'deco', name: 'Barra', shape: 'rect', x: snap(f.w / 2 - 100), y: snap(f.h / 2 - 30), w: 200, h: 60, seats: 0, auto: false, join: false }
      : { id: uid('t'), floor: f.id, kind: 'mesa', name: nextName, shape: kind === 'round' ? 'round' : 'rect', x: snap(f.w / 2 - 45), y: snap(f.h / 2 - 45), w: 90, h: 90, seats: kind === 'round' ? 6 : 4, auto: true, join: true };
    l.tables.push(t);
    S.ed.sel = { t: t.id };
    markDirty(); paintEdMap(); paintProps();
  }
  function paintEdMap() {
    const e = S.ed;
    const box = $('#ed-map');
    if (!box) return;
    const f = edFloor();
    const byId = Object.fromEntries(e.l.tables.map((t) => [t.id, t]));
    const ts = e.l.tables.filter((t) => t.floor === f.id);
    const gs = e.l.groups.filter((g) => byId[g.tables[0]] && byId[g.tables[0]].floor === f.id);
    const selT = e.sel && e.sel.t ? byId[e.sel.t] : null;
    let extra = '';
    if (e.mode === 'mover' && selT) extra = `<rect class="hnd" data-h="1" x="${selT.x + selT.w - 11}" y="${selT.y + selT.h - 11}" width="22" height="22" rx="5"/>`;
    if (e.mode === 'forma') {
      const p = f.shape;
      extra = p.map((a, i) => { const b = p[(i + 1) % p.length]; return `<circle class="mid" data-mid="${i}" cx="${(a[0] + b[0]) / 2}" cy="${(a[1] + b[1]) / 2}" r="12"/>`; }).join('')
        + p.map((a, i) => `<circle class="vx${e.vsel === i ? ' on' : ''}" data-vx="${i}" cx="${a[0]}" cy="${a[1]}" r="15"/>`).join('');
    }
    const cls = (t) => (t.kind === 'deco' ? 'deco' : 'libre') + ((selT && selT.id === t.id) || e.merge.includes(t.id) ? ' sel' : '');
    box.innerHTML = floorSVG(f, gs.map((g) => groupSVG(g, byId, e.sel && e.sel.g === g.id ? 'sel' : '')).join('') + ts.map((t) => tableSVG(t, cls(t))).join(''), extra);
    const svg = $('svg', box);
    // Las fusiones se pueden tocar en su línea
    $$('.grp', svg).forEach((r) => { r.style.pointerEvents = 'stroke'; r.style.strokeWidth = '10'; r.addEventListener('click', () => { e.sel = { g: r.dataset.g }; paintEdMap(); paintProps(); }); });
    wireEditor(svg, f);
  }
  function svgPt(svg, ev) {
    const p = svg.createSVGPoint();
    p.x = ev.clientX; p.y = ev.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  function wireEditor(svg, f) {
    const e = S.ed;
    let drag = null;
    let raf = 0;
    const redraw = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; paintEdMap(); }); };
    svg.addEventListener('pointerdown', (ev) => {
      const p = svgPt(svg, ev);
      const tEl = ev.target.closest('[data-t]');
      if (e.mode === 'forma') {
        const vx = ev.target.closest('[data-vx]');
        const mid = ev.target.closest('[data-mid]');
        if (vx) { e.vsel = Number(vx.dataset.vx); drag = { kind: 'vx', i: e.vsel }; }
        else if (mid) {
          const i = Number(mid.dataset.mid);
          f.shape.splice(i + 1, 0, [snap(p.x), snap(p.y)]);
          e.vsel = i + 1; drag = { kind: 'vx', i: i + 1 };
          markDirty(); redraw();
        } else { e.vsel = -1; }
        paintProps();
      } else if (e.mode === 'fusionar') {
        if (tEl) {
          const t = e.l.tables.find((x) => x.id === tEl.dataset.t);
          if (t && t.kind === 'mesa') {
            e.merge = e.merge.includes(t.id) ? e.merge.filter((x) => x !== t.id) : e.merge.concat(t.id);
            paintEditor();
          }
        }
        return;
      } else if (ev.target.closest('[data-h]') && e.sel && e.sel.t) {
        const t = e.l.tables.find((x) => x.id === e.sel.t);
        drag = { kind: 'size', t, ox: p.x - (t.x + t.w), oy: p.y - (t.y + t.h) };
      } else if (tEl) {
        const t = e.l.tables.find((x) => x.id === tEl.dataset.t);
        e.sel = { t: t.id };
        drag = { kind: 'move', t, ox: p.x - t.x, oy: p.y - t.y, moved: false };
        paintProps(); redraw();
      } else {
        e.sel = { f: f.id };
        paintProps(); redraw();
      }
      if (drag) { svg.setPointerCapture(ev.pointerId); ev.preventDefault(); }
    });
    svg.addEventListener('pointermove', (ev) => {
      if (!drag) return;
      const p = svgPt(svg, ev);
      if (drag.kind === 'move') {
        const x = Math.max(0, Math.min(f.w - 20, snap(p.x - drag.ox)));
        const y = Math.max(0, Math.min(f.h - 20, snap(p.y - drag.oy)));
        if (x !== drag.t.x || y !== drag.t.y) { drag.t.x = x; drag.t.y = y; drag.moved = true; markDirty(); redraw(); }
      } else if (drag.kind === 'size') {
        const w = Math.max(30, snap(p.x - drag.ox - drag.t.x));
        const h = Math.max(30, snap(p.y - drag.oy - drag.t.y));
        if (w !== drag.t.w || h !== drag.t.h) { drag.t.w = w; drag.t.h = h; markDirty(); redraw(); }
      } else if (drag.kind === 'vx') {
        const pt = [Math.max(0, Math.min(f.w, snap(p.x))), Math.max(0, Math.min(f.h, snap(p.y)))];
        f.shape[drag.i] = pt; markDirty(); redraw();
      }
    });
    const end = () => { if (drag) { drag = null; paintProps(); } };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
  }
  document.addEventListener('keydown', (ev) => {
    const e = S.ed;
    if (S.view !== 'plano' || !e || !e.sel || !e.sel.t || ev.target.closest('input, textarea, select') || $('.sheet-wrap')) return;
    const t = e.l.tables.find((x) => x.id === e.sel.t);
    if (!t) return;
    const d = ev.shiftKey ? 50 : SNAP;
    const mv = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[ev.key];
    if (mv) { ev.preventDefault(); t.x = Math.max(0, t.x + mv[0]); t.y = Math.max(0, t.y + mv[1]); markDirty(); paintEdMap(); }
    if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); deleteTable(t); }
  });
  function deleteTable(t) {
    const e = S.ed;
    if (!confirm(`¿Borrar ${t.kind === 'mesa' ? 'la mesa' : ''} «${t.name}»?`)) return;
    e.l.tables = e.l.tables.filter((x) => x.id !== t.id);
    e.l.groups = e.l.groups.map((g) => ({ ...g, tables: g.tables.filter((x) => x !== t.id) })).filter((g) => g.tables.length > 1);
    e.sel = null;
    markDirty(); paintEdMap(); paintProps();
  }
  function paintProps() {
    const e = S.ed;
    const box = $('#props');
    if (!box) return;
    const f = edFloor();
    const t = e.sel && e.sel.t ? e.l.tables.find((x) => x.id === e.sel.t) : null;
    const g = e.sel && e.sel.g ? e.l.groups.find((x) => x.id === e.sel.g) : null;
    const sw = (name, label, on) => `<label class="switch-row">${label} <span class="sw"><input type="checkbox" name="${name}" ${on ? 'checked' : ''}><span></span></span></label>`;
    if (e.mode === 'forma') {
      box.innerHTML = `<h3>Forma de «${esc(f.name)}»</h3><p class="help">${f.shape.length} esquinas.</p>
        <button class="btn btn-danger btn-sm" type="button" data-delv ${e.vsel < 0 || f.shape.length <= 3 ? 'disabled' : ''}>Quitar esquina</button>
        ${floorForm(f)}`;
      const dv = $('[data-delv]', box);
      dv.addEventListener('click', () => { f.shape.splice(e.vsel, 1); e.vsel = -1; markDirty(); paintEdMap(); paintProps(); });
      wireFloorForm(box, f);
      return;
    }
    if (t) {
      const isM = t.kind === 'mesa';
      box.innerHTML = `<h3>${isM ? 'Mesa' : 'Elemento'} «${esc(t.name)}»</h3>
        <form class="form" id="tp" novalidate>
          <div class="row"><label>Nombre <input name="name" maxlength="24" value="${esc(t.name)}"></label>${isM ? `<label>Plazas <input name="seats" type="number" min="1" max="60" inputmode="numeric" value="${t.seats}"></label>` : ''}</div>
          <div class="field">Forma<div class="chips"><label><input type="radio" name="shape" value="rect" ${t.shape === 'rect' ? 'checked' : ''}><span>Cuadrada / rectangular</span></label><label><input type="radio" name="shape" value="round" ${t.shape === 'round' ? 'checked' : ''}><span>Redonda / ovalada</span></label></div></div>
          <div class="row"><label>Ancho <input name="w" type="number" min="20" max="1500" step="10" value="${t.w}"></label><label>Alto <input name="h" type="number" min="20" max="1500" step="10" value="${t.h}"></label></div>
          ${isM ? sw('auto', 'Se puede asignar sola a las reservas', t.auto) + sw('join', 'Se puede juntar con las de al lado', t.join) : ''}
          <div class="actions"><button class="btn btn-quiet btn-sm" type="button" data-rot>Girar</button><button class="btn btn-quiet btn-sm" type="button" data-dup>Duplicar</button><button class="btn btn-danger btn-sm" type="button" data-del>Borrar</button></div>
        </form>`;
      const fm = $('#tp', box);
      fm.addEventListener('input', () => {
        t.name = fm.name.value.slice(0, 24) || t.name;
        if (isM) t.seats = Math.max(1, Math.min(60, Number(fm.seats.value) || 1));
        t.shape = fm.shape.value;
        t.w = Math.max(20, Number(fm.w.value) || t.w);
        t.h = Math.max(20, Number(fm.h.value) || t.h);
        if (isM) { t.auto = fm.auto.checked; t.join = fm.join.checked; }
        markDirty(); paintEdMap();
      });
      fm.addEventListener('change', () => { $('h3', box).textContent = `${isM ? 'Mesa' : 'Elemento'} «${t.name}»`; });
      $('[data-rot]', fm).addEventListener('click', () => { [t.w, t.h] = [t.h, t.w]; markDirty(); paintEdMap(); paintProps(); });
      $('[data-dup]', fm).addEventListener('click', () => {
        const n = { ...t, id: uid(t.kind === 'mesa' ? 't' : 'd'), x: Math.min(f.w - t.w, t.x + t.w + 30), name: isM ? String((parseInt(t.name, 10) || 0) + 1) : t.name };
        e.l.tables.push(n); e.sel = { t: n.id }; markDirty(); paintEdMap(); paintProps();
      });
      $('[data-del]', fm).addEventListener('click', () => deleteTable(t));
      return;
    }
    if (g) {
      const byId = Object.fromEntries(e.l.tables.map((x) => [x.id, x]));
      const sum = g.tables.reduce((a, id) => a + ((byId[id] && byId[id].seats) || 0), 0);
      box.innerHTML = `<h3>Fusión: mesas ${esc(g.tables.map((id) => (byId[id] || {}).name).join(' + '))}</h3>
        <form class="form" id="gp" novalidate>
          <label>Nombre (opcional) <input name="name" maxlength="40" value="${esc(g.name)}" placeholder="Evento, comunión…"></label>
          <label>Plazas <input name="seats" type="number" min="0" max="300" value="${g.seats || ''}" placeholder="${sum}"><span class="help">Vacío = la suma de las mesas (${sum}).</span></label>
          ${sw('auto', 'Se puede asignar sola a las reservas', g.auto)}
          <button class="btn btn-danger btn-sm" type="button" data-split>Separar las mesas</button>
        </form>`;
      const fm = $('#gp', box);
      fm.addEventListener('input', () => { g.name = fm.name.value; g.seats = Number(fm.seats.value) || 0; g.auto = fm.auto.checked; markDirty(); paintEdMap(); });
      $('[data-split]', fm).addEventListener('click', () => { e.l.groups = e.l.groups.filter((x) => x.id !== g.id); e.sel = null; markDirty(); paintEdMap(); paintProps(); });
      return;
    }
    box.innerHTML = `<h3>Planta «${esc(f.name)}»</h3>${floorForm(f)}
      <p class="help" style="margin-top:12px">${e.l.tables.filter((x) => x.floor === f.id && x.kind === 'mesa').length} mesas en esta planta. Toca una mesa para cambiarla.</p>`;
    wireFloorForm(box, f);
  }
  function floorForm(f) {
    return `<form class="form" id="fp" novalidate style="margin-top:10px">
      <label>Nombre de la planta <input name="name" maxlength="40" value="${esc(f.name)}"></label>
      <div class="row"><label>Ancho <input name="w" type="number" min="300" max="4000" step="50" value="${f.w}"></label><label>Fondo <input name="h" type="number" min="300" max="4000" step="50" value="${f.h}"></label></div>
      <p class="help">Altura: ${f.level > 0 ? `${f.level}ª planta` : f.level < 0 ? 'bajo tierra' : 'planta baja'}.</p>
      <div class="actions"><button class="btn btn-quiet btn-sm" type="button" data-lv="1">Subir</button><button class="btn btn-quiet btn-sm" type="button" data-lv="-1">Bajar</button>
      ${S.ed.l.floors.length > 1 ? '<button class="btn btn-danger btn-sm" type="button" data-delf>Borrar planta</button>' : ''}</div></form>`;
  }
  function wireFloorForm(box, f) {
    const fm = $('#fp', box);
    if (!fm) return;
    fm.addEventListener('change', () => {
      const w = Math.max(300, Math.min(4000, Number(fm.w.value) || f.w));
      const h = Math.max(300, Math.min(4000, Number(fm.h.value) || f.h));
      if (w !== f.w || h !== f.h) { f.shape = f.shape.map(([x, y]) => [Math.round((x * w) / f.w), Math.round((y * h) / f.h)]); f.w = w; f.h = h; }
      f.name = fm.name.value.trim() || f.name;
      markDirty(); paintEditor();
    });
    $$('[data-lv]', fm).forEach((b) => b.addEventListener('click', () => {
      const d = Number(b.dataset.lv);
      const other = S.ed.l.floors.find((x) => x.level === f.level + d);
      if (other) other.level = f.level;
      f.level += d;
      markDirty(); paintEditor();
    }));
    const del = $('[data-delf]', fm);
    if (del) del.addEventListener('click', () => {
      const n = S.ed.l.tables.filter((x) => x.floor === f.id).length;
      if (!confirm(`¿Borrar la planta «${f.name}»${n ? ` y sus ${n} mesas y elementos` : ''}?`)) return;
      const l = S.ed.l;
      const gone = new Set(l.tables.filter((x) => x.floor === f.id).map((x) => x.id));
      l.tables = l.tables.filter((x) => x.floor !== f.id);
      l.groups = l.groups.filter((g) => !g.tables.some((x) => gone.has(x)));
      l.floors = l.floors.filter((x) => x.id !== f.id);
      S.floor = '';
      S.ed.sel = null;
      markDirty(); paintEditor();
    });
  }
  async function saveLayout() {
    const b = $('[data-save]');
    busy(b, true, 'Guardando…');
    try {
      const l = await api('layout_save', { body: S.ed.l });
      S.ed.l = clone(l);
      S.ed.dirty = false;
      if (S.st) S.st.layout = l;
      S.rev = '';
      toast('Plano guardado. Ya se ve en todas las pantallas.', 'ok');
      paintEditor();
    } catch (err) { busy(b, false); toast(err.message, 'err'); }
  }

  /* ---------- Vista: Preferencias (encargado) ---------- */
  async function viewPrefs() {
    view().innerHTML = '<div class="spin dark" aria-label="Cargando"></div>';
    let d;
    try { [d] = await Promise.all([api('prefs'), loadState(true)]); } catch (err) { return errBox(err); }
    const p = d.prefs;
    const floors = layout().floors;
    const order = p.floors.filter((id) => floors.some((f) => f.id === id)).concat(floors.filter((f) => !p.floors.includes(f.id)).map((f) => f.id));
    const fname = Object.fromEntries(floors.map((f) => [f.id, f.name]));
    const radio = (v, label, help) => `<label class="switch-row" style="justify-content:flex-start"><input type="radio" name="assign" value="${v}" ${p.assign === v ? 'checked' : ''}> <span><b>${label}</b><br><span class="help">${help}</span></span></label>`;
    view().innerHTML = `<div class="prefs-grid">
      <section class="card">
        <form class="form" id="pf" novalidate>
          <h2 style="margin:0">Mesas para las reservas</h2>
          <div class="field">¿Cuándo se asigna mesa a una reserva?
            ${radio('crear', 'En cuanto entra la reserva', 'También las peticiones de la web que aún no has aceptado: así guardas el sitio.')}
            ${radio('confirmar', 'Cuando la aceptas o el cliente la confirma', 'Las peticiones sin aceptar no ocupan mesa en el plano.')}
            ${radio('off', 'Nunca sola, la elijo yo', 'Las mesas se asignan a mano desde la sala.')}
          </div>
          <label class="switch-row">Juntar mesas si no hay una que sirva sola <span class="sw"><input type="checkbox" name="merge" ${p.merge ? 'checked' : ''}><span></span></span></label>
          <div class="row">
            <label>Juntar como mucho <input name="max_merge" type="number" min="2" max="6" value="${p.max_merge}"><span class="help">mesas</span></label>
            <label>Plazas que se pierden al juntar dos <input name="merge_loss" type="number" min="0" max="4" value="${p.merge_loss}"><span class="help">p. ej. 2 si se pegan por la cabecera</span></label>
          </div>
          <div class="row">
            <label>Sitios vacíos que aceptas <input name="max_spare" type="number" min="0" max="20" value="${p.max_spare}"><span class="help">Si sobran más (2 personas en una mesa de 8), prueba antes a juntar mesas pequeñas.</span></label>
            <label>Cuánto dura una mesa <input name="minutes" type="number" min="0" max="600" step="15" value="${p.minutes || ''}" placeholder="${d.table_minutes || 90}"><span class="help">minutos. Vacío = el «tiempo de mesa» de las reservas (${d.table_minutes || 90} min).</span></label>
          </div>
          <label>Distancia para que dos mesas cuenten como juntas <input name="gap" type="number" min="0" max="300" step="10" value="${p.gap}"><span class="help">en el plano (cada cuadro de la cuadrícula mide 50).</span></label>
          <div class="field">Plantas donde se asigna sola, en orden de preferencia
            <div class="stack" id="fl-order">${order.map((id) => `<div class="row" data-fl="${id}"><label class="switch-row grow" style="padding:4px 0">${esc(fname[id])} <span class="sw"><input type="checkbox" name="fl" value="${id}" ${!p.floors.length || p.floors.includes(id) ? 'checked' : ''}><span></span></span></label><button class="btn btn-quiet btn-sm" type="button" data-up aria-label="Subir ${esc(fname[id])}">↑</button></div>`).join('')}</div>
          </div>
          <h2 style="margin:10px 0 0">Cocina y barra</h2>
          <div class="field">Categorías que van a la barra (no salen en la pantalla de cocina)
            <div class="chips">${d.categories.map((c) => `<label><input type="checkbox" name="nk" value="${c.id}" ${p.no_kitchen.includes(c.id) ? 'checked' : ''}><span>${esc(c.name)}</span></label>`).join('')}</div>
          </div>
          <button class="btn btn-main" type="submit">Guardar preferencias</button>
        </form>
      </section>
      <section class="card">
        <form class="form" id="spf" novalidate>
          <h2 style="margin:0">Especiales del día</h2>
          <p class="help">Platos que no están en la carta (el pescado del día, un postre especial…). Salen en la pestaña «Especiales» al tomar nota.</p>
          <div id="sp-rows">${(p.specials.length ? p.specials : [{ name: '', price: '', course: 2 }]).map(specRow).join('')}</div>
          <button class="btn btn-quiet btn-sm" type="button" data-addsp>+ Añadir especial</button>
          <button class="btn btn-main" type="submit">Guardar especiales</button>
        </form>
      </section>
      <section class="card">
        <form class="form" id="qrf" novalidate>
          <h2 style="margin:0">Pedidos desde el móvil (QR)</h2>
          <p class="help">Cada mesa tiene su QR. Los clientes lo escanean, ven la carta y piden; el pedido llega a la mesa en la sala y a la cocina, marcado con «QR».</p>
          <label class="switch-row">Se puede pedir desde el móvil <span class="sw"><input type="checkbox" name="qr" ${p.qr ? 'checked' : ''}><span></span></span></label>
          <label class="switch-row"><span>Pedir el código de la mesa <span class="help" style="display:block">Recomendado. Es un número de 4 cifras nuevo cada vez que se abre la mesa; lo ve el camarero en el pedido. Sin él, alguien con una foto del QR podría pedir desde fuera.</span></span> <span class="sw"><input type="checkbox" name="qr_pin" ${p.qr_pin ? 'checked' : ''}><span></span></span></label>
          <label class="switch-row"><span>El camarero acepta cada pedido antes de que llegue a la cocina <span class="help" style="display:block">Si está apagado, va directo a la cocina (los postres quedan en espera, como siempre).</span></span> <span class="sw"><input type="checkbox" name="qr_confirm" ${p.qr_confirm ? 'checked' : ''}><span></span></span></label>
          <label>Solo desde el wifi del local (opcional)
            <textarea class="inp" name="qr_ips" rows="2" placeholder="Una IP o red por línea, p. ej. 81.40.12.7 o 81.40.12.0/24">${esc(p.qr_ips.join('\n'))}</textarea>
            <span class="help">Vacío = desde cualquier conexión (también datos móviles). Si la rellenas, solo se puede pedir conectado al wifi del restaurante. Ojo: si tu compañía te cambia la IP, habrá que actualizarla.</span></label>
          <div class="row"><button class="btn btn-quiet btn-sm" type="button" data-myip>Añadir la IP de esta conexión</button></div>
          <button class="btn btn-main" type="submit">Guardar</button>
          <h2 style="margin:10px 0 0">QR de las mesas</h2>
          <div class="row"><button class="btn btn-line" type="button" data-qrprint>Ver e imprimir los QR</button><button class="btn btn-danger" type="button" data-qrrot>Cambiar todos los QR</button></div>
          <p class="help">Cambiar los QR invalida los que ya están impresos (por ejemplo, si alguien se ha llevado uno). Habrá que imprimirlos y ponerlos de nuevo.</p>
        </form>
      </section></div>`;
    const pf = $('#pf');
    $$('[data-up]', pf).forEach((b) => b.addEventListener('click', () => { const row = b.closest('[data-fl]'); if (row.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling); }));
    pf.addEventListener('submit', async (e) => {
      e.preventDefault();
      const b = $('button[type=submit]', pf);
      const fl = $$('[data-fl]', pf).filter((r) => $('input', r).checked).map((r) => r.dataset.fl);
      busy(b, true, 'Guardando…');
      try {
        await api('prefs_save', { body: {
          assign: pf.assign.value, merge: pf.merge.checked, max_merge: Number(pf.max_merge.value), merge_loss: Number(pf.merge_loss.value),
          max_spare: Number(pf.max_spare.value), minutes: Number(pf.minutes.value) || 0, gap: Number(pf.gap.value),
          floors: fl.length === floors.length ? fl : fl, no_kitchen: $$('[name=nk]:checked', pf).map((x) => Number(x.value)),
        } });
        S.carta = null;
        toast('Preferencias guardadas', 'ok');
      } catch (err) { toast(err.message, 'err'); }
      busy(b, false);
    });
    wireQrPrefs();
    const spf = $('#spf');
    $('[data-addsp]', spf).addEventListener('click', () => { $('#sp-rows').insertAdjacentHTML('beforeend', specRow({ name: '', price: '', course: 2 })); wireSpec(); });
    const wireSpec = () => $$('[data-delsp]', spf).forEach((b) => { b.onclick = () => b.closest('.spec').remove(); });
    wireSpec();
    spf.addEventListener('submit', async (e) => {
      e.preventDefault();
      const b = $('button[type=submit]', spf);
      const specials = $$('.spec', spf).map((r) => ({ name: $('[name=sn]', r).value.trim(), price: Number(String($('[name=sp]', r).value).replace(',', '.')) || 0, course: Number($('[name=sc]', r).value) })).filter((s) => s.name);
      busy(b, true, 'Guardando…');
      try { await api('prefs_save', { body: { specials } }); S.carta = null; toast('Especiales guardados', 'ok'); }
      catch (err) { toast(err.message, 'err'); }
      busy(b, false);
    });
  }
  function wireQrPrefs() {
    const f = $('#qrf');
    if (!f) return;
    const ipList = () => f.qr_ips.value.split(/[\s,;]+/).filter(Boolean);
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const b = $('button[type=submit]', f);
      busy(b, true, 'Guardando…');
      try {
        await api('prefs_save', { body: { qr: f.qr.checked, qr_pin: f.qr_pin.checked, qr_confirm: f.qr_confirm.checked, qr_ips: ipList() } });
        toast('Guardado', 'ok');
      } catch (err) { toast(err.message, 'err'); }
      busy(b, false);
    });
    $('[data-myip]', f).addEventListener('click', async () => {
      try {
        const { ip } = await api('my_ip');
        const list = ipList();
        if (!list.includes(ip)) list.push(ip);
        f.qr_ips.value = list.join('\n');
        toast(`Añadida ${ip}. Pulsa «Guardar».`);
      } catch (err) { toast(err.message, 'err'); }
    });
    $('[data-qrprint]', f).addEventListener('click', async () => { try { qrPrintSheet(await api('qr_list')); } catch (err) { toast(err.message, 'err'); } });
    $('[data-qrrot]', f).addEventListener('click', async (e) => {
      const b = e.currentTarget;
      if (!confirm('¿Cambiar los QR de TODAS las mesas? Los que están impresos dejarán de funcionar.')) return;
      busy(b, true, '…');
      try { qrPrintSheet(await api('qr_rotate', { body: {} })); toast('QR cambiados. Imprime los nuevos.', 'ok'); } catch (err) { toast(err.message, 'err'); }
      busy(b, false);
    });
  }
  /** Los QR de todas las mesas, para imprimirlos (uno por mesa, con su nombre). */
  function qrPrintSheet(d) {
    openSheet('QR de las mesas', `
      <p class="help">Imprímelos y pega cada uno en su mesa. Cada QR solo sirve para su mesa y solo deja pedir cuando la mesa está abierta.</p>
      <div class="actions"><button class="btn btn-main" type="button" data-print>Imprimir</button></div>
      <div class="qr-grid">${d.tables.map((t) => `<div class="qr-card"><div class="qr-img">${t.svg}</div><b>Mesa ${esc(t.name)}</b><small>${esc(t.floor)}</small>
        <button class="btn btn-quiet btn-sm" type="button" data-rot="${esc(t.id)}">Cambiar este QR</button></div>`).join('')}</div>`, (body) => {
      $('[data-print]', body).addEventListener('click', () => {
        $('#print').innerHTML = `<div class="qr-sheet">${d.tables.map((t) => `<div class="qr-card"><p>${esc(d.restaurant)}</p><div class="qr-img">${t.svg}</div><b>Mesa ${esc(t.name)}</b><small>Escanea para ver la carta y pedir</small></div>`).join('')}</div>`;
        document.body.classList.add('print-qr');
        window.print();
        setTimeout(() => document.body.classList.remove('print-qr'), 500);
      });
      $$('[data-rot]', body).forEach((b) => b.addEventListener('click', async () => {
        if (!confirm('¿Cambiar el QR de esta mesa? El que está impreso dejará de funcionar.')) return;
        busy(b, true, '…');
        try { qrPrintSheet(await api('qr_rotate', { body: { table: b.dataset.rot } })); toast('QR cambiado. Imprime el nuevo.', 'ok'); }
        catch (err) { busy(b, false); toast(err.message, 'err'); }
      }));
    });
  }
  function specRow(s) {
    return `<div class="spec"><input class="inp" name="sn" maxlength="80" placeholder="Lubina del día" value="${esc(s.name)}" aria-label="Nombre">
      <input class="inp" name="sp" type="number" min="0" step="0.5" inputmode="decimal" placeholder="€" value="${esc(s.price)}" aria-label="Precio">
      <select class="inp" name="sc" aria-label="Pase">${Object.entries(COURSES).map(([k, n]) => `<option value="${k}" ${Number(k) === Number(s.course) ? 'selected' : ''}>${n}</option>`).join('')}</select>
      <button class="x" type="button" data-delsp aria-label="Quitar">×</button></div>`;
  }

  /* ---------- Arranque ---------- */
  start();
})();
