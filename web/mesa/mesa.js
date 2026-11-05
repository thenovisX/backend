/* Pedir desde la mesa: los clientes escanean el QR de su mesa, ven la carta y piden desde el móvil.
 * Lo que piden llega al pedido de la mesa en «Sala y cocina» y a la pantalla de cocina. */
(() => {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const euro = (n) => Number(n || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  const LS = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* modo privado */ } },
    del: (k) => { try { localStorage.removeItem(k); } catch (e) { /* modo privado */ } },
  };
  const API = new URL('api.php', location.href).href;
  const COURSES = { 0: 'Bebidas', 1: 'Entrantes', 2: 'Principales', 3: 'Postres' };
  const ST = {
    pendiente: 'Esperando al camarero', espera: 'Saldrá más tarde', nuevo: 'En cocina', preparando: 'Preparándose',
    listo: '¡Listo! Ya os lo traen', servido: 'Servido',
  };
  const NOTE_CHIPS = ['Sin gluten', 'Sin lactosa', 'Sin cebolla', 'Poco hecho', 'Al punto', 'Muy hecho', 'Para compartir'];

  // La clave del QR va después de «#»: el navegador no la manda nunca al servidor ni sale en los registros.
  // Si el QR lleva también el código («p», el que enseña el camarero), se usa y se quita de la dirección.
  const H = new URLSearchParams(location.hash.slice(1));
  const K = (H.get('k') || '').trim();
  let PIN = (H.get('p') || '').replace(/\D/g, '').slice(0, 4);
  if (H.has('p') && K) history.replaceState(null, '', '#k=' + K);
  const TOK = 'mesa_tok|' + K;
  const CART = 'mesa_cart|' + K;

  const S = {
    token: LS.get(TOK) || '',
    restaurant: '',
    table: '',
    carta: null,
    st: null,
    rev: '',
    tab: 'carta',
    cart: (() => { try { return JSON.parse(LS.get(CART) || '[]'); } catch (e) { return []; } })(),
    readySeen: null,
  };
  const saveCart = () => LS.set(CART, JSON.stringify(S.cart));

  /* ---------- API ---------- */
  async function api(route, body, query = '') {
    const opts = { method: 'GET', headers: {}, cache: 'no-store', credentials: 'omit' };
    if (S.token) opts.headers['X-Mesa'] = S.token;
    if (body) { opts.method = 'POST'; opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    let res, json;
    try { res = await fetch(`${API}?r=${route}${query}`, opts); } catch (e) { throw new Error('Sin conexión. Revisa los datos o el wifi y vuelve a intentarlo.'); }
    try { json = await res.json(); } catch (e) { throw new Error('El restaurante no responde ahora mismo. Inténtalo en un momento.'); }
    if (!json.ok) {
      const err = new Error(json.error || 'Algo ha fallado');
      if (res.status === 401) { err.auth = true; S.token = ''; LS.del(TOK); }
      throw err;
    }
    return json.data;
  }

  /* ---------- Avisos ---------- */
  function toast(msg, type = '') {
    // Un aviso cada vez, para no tapar la pantalla del móvil
    const box = $('#toast');
    box.textContent = '';
    const t = document.createElement('div');
    t.className = 't ' + type;
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.remove(), type ? 3500 : 1800);
  }
  function busy(btn, on, label) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.textContent = label || 'Un momento…'; }
    else { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
  }

  /* ---------- Hoja (ventana desde abajo) ---------- */
  function openSheet(title, html, after) {
    closeSheet();
    const w = document.createElement('div');
    w.className = 'sheet-wrap';
    w.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="sheet-h"><h2>${esc(title)}</h2><button class="x" type="button" aria-label="Cerrar">×</button></div>
      <div class="sheet-b">${html}</div></div>`;
    document.body.appendChild(w);
    document.body.classList.add('locked');
    w.addEventListener('click', (e) => { if (e.target === w) closeSheet(); });
    $('.x', w).addEventListener('click', closeSheet);
    if (after) after($('.sheet-b', w));
  }
  function closeSheet() { const w = $('.sheet-wrap'); if (w) w.remove(); document.body.classList.remove('locked'); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

  /* ---------- Pantallas de entrada ---------- */
  function gate(title, text, { retry = false, icon = 'info' } = {}) {
    stopPoll();
    $('#app').innerHTML = `<div class="gate"><div class="gate-box">
      ${S.restaurant ? `<p class="gate-rest">${esc(S.restaurant)}</p>` : ''}
      <div class="gate-ic ic-${icon}" aria-hidden="true"></div>
      <h1>${esc(title)}</h1><p>${esc(text)}</p>
      ${retry ? '<button class="btn btn-main" type="button" data-retry>Volver a intentarlo</button>' : ''}
    </div></div>`;
    const r = $('[data-retry]');
    if (r) r.addEventListener('click', () => start());
  }

  function pinScreen(msg) {
    stopPoll();
    $('#app').innerHTML = `<div class="gate"><div class="gate-box">
      <p class="gate-rest">${esc(S.restaurant)}</p>
      <h1>Mesa ${esc(S.table)}</h1>
      <p>Escribe el código de 4 cifras de la mesa. Te lo da el camarero (o escanea el QR que te enseña).</p>
      <form id="pin-f" novalidate autocomplete="off">
        <label class="sr" for="pin">Código de la mesa</label>
        <input id="pin" class="pin" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="one-time-code" placeholder="····" aria-describedby="pin-msg">
        <p id="pin-msg" class="pin-msg" role="alert">${msg ? esc(msg) : ''}</p>
        <button class="btn btn-main" type="submit">Ver la carta y pedir</button>
      </form>
      <p class="gate-small">Así nos aseguramos de que los pedidos se hacen desde la mesa.</p>
    </div></div>`;
    const f = $('#pin-f');
    const inp = $('#pin');
    inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 4); if (inp.value.length === 4) f.requestSubmit(); });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (inp.value.length !== 4) { $('#pin-msg').textContent = 'Son 4 cifras.'; return; }
      const b = $('button[type=submit]', f);
      busy(b, true, 'Entrando…');
      try { await join(inp.value); }
      catch (err) { busy(b, false); inp.value = ''; $('#pin-msg').textContent = err.message; inp.focus(); }
    });
    setTimeout(() => inp.focus(), 50);
  }

  async function join(pin) {
    const d = await api('join', { k: K, pin });
    S.token = d.token;
    LS.set(TOK, d.token);
    S.table = d.table;
    S.restaurant = d.restaurant;
    await enter();
  }

  async function start() {
    if (!/^[td][a-z0-9]{1,16}\.[A-Za-z0-9_-]{22}$/.test(K)) {
      return gate('Escanea el QR de tu mesa', 'Este enlace no está completo. Abre la cámara del móvil y escanea el código QR que hay en la mesa.', { icon: 'qr' });
    }
    $('#app').innerHTML = '<div class="splash"><div class="spin" aria-label="Cargando"></div></div>';
    if (S.token) {
      try { await enter(); return; } catch (err) { if (!err.auth) return gate('No hemos podido cargar la carta', err.message, { retry: true, icon: 'warn' }); }
    }
    let info;
    try { info = await api('info', { k: K }); }
    catch (err) { return gate('Este QR no funciona', err.message, { retry: !/no vale/.test(err.message), icon: 'warn' }); }
    S.restaurant = info.restaurant;
    S.table = info.table;
    document.title = `Mesa ${info.table} · ${info.restaurant}`;
    if (info.state === 'closed') return gate(`Mesa ${info.table}`, 'La mesa aún no está abierta. Cuando el camarero os siente y la abra, podréis pedir desde aquí.', { retry: true, icon: 'wait' });
    if (info.state === 'wifi') return gate('Conéctate al wifi del restaurante', 'Para pedir desde el móvil tienes que estar conectado al wifi del local. Pide la clave al camarero.', { retry: true, icon: 'wifi' });
    if (info.state === 'off') return gate(`Mesa ${info.table}`, 'Ahora mismo no se puede pedir desde el móvil en esta mesa. El camarero os toma nota enseguida.', { retry: true, icon: 'info' });
    if (!info.need_pin) {
      try { await join(''); } catch (err) { gate('No hemos podido entrar', err.message, { retry: true, icon: 'warn' }); }
      return;
    }
    if (PIN.length === 4) {
      const p = PIN;
      PIN = '';
      try { await join(p); return; } catch (err) { return pinScreen(err.message); }
    }
    pinScreen('');
  }

  /* ---------- Dentro de la mesa ---------- */
  async function enter() {
    const [c, st] = await Promise.all([S.carta ? Promise.resolve(S.carta) : api('carta'), api('status')]);
    S.carta = c;
    applyStatus(st);
    document.title = `Mesa ${S.table}${S.restaurant ? ' · ' + S.restaurant : ''}`;
    // Quita del carrito lo que ya no está en la carta
    S.cart = S.cart.filter(lineStillValid);
    saveCart();
    frame();
    startPoll();
  }

  function lineStillValid(l) {
    const c = S.carta;
    if (l.kind === 'dish') return c.categories.some((cat) => cat.dishes.some((d) => d.id === l.dish));
    if (l.kind === 'menu') return c.menus.some((m) => m.id === l.menu);
    if (l.kind === 'special') return !!c.specials[l.special] && c.specials[l.special].name === l.name;
    return false;
  }

  function applyStatus(st) {
    if (st.same) return false;
    S.st = st;
    S.rev = st.rev;
    if (st.table) S.table = st.table;
    const ready = new Set(st.items.filter((i) => i.status === 'listo').map((i) => i.id));
    if (S.readySeen) {
      const fresh = st.items.filter((i) => i.status === 'listo' && !S.readySeen.has(i.id));
      if (fresh.length) toast(`¡${fresh.length === 1 ? fresh[0].name + ' está listo' : 'Hay platos listos'}! Ya os lo traen.`, 'ok');
    }
    S.readySeen = ready;
    return true;
  }

  let poll = null;
  function startPoll() {
    stopPoll();
    poll = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const st = await api('status', null, `&rev=${encodeURIComponent(S.rev)}`);
        if (applyStatus(st)) { paintTabs(); if (S.tab === 'pedido') paintPedido(); }
      } catch (err) {
        if (err.auth) { closeSheet(); gate('La mesa se ha cerrado', err.message, { retry: true, icon: 'info' }); }
      }
    }, 8000);
  }
  function stopPoll() { clearInterval(poll); poll = null; }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && poll) S.rev = ''; });

  function frame() {
    $('#app').innerHTML = `
      <header class="top">
        <div class="top-t"><small>${esc(S.restaurant)}</small><h1>Mesa ${esc(S.table)}</h1></div>
        <button class="btn-call" type="button" data-call aria-label="Llamar al camarero o pedir la cuenta"><span class="ic-bell" aria-hidden="true"></span>Camarero</button>
      </header>
      <nav class="tabs" role="tablist" aria-label="Secciones">
        <button type="button" role="tab" data-tab="carta">Carta</button>
        <button type="button" role="tab" data-tab="pedido">Lo pedido <span class="badge" id="n-sent"></span></button>
      </nav>
      <main id="view"></main>
      <div class="cartbar" id="cartbar" hidden><button type="button" class="btn btn-main" data-cart></button></div>`;
    $$('[data-tab]').forEach((b) => b.addEventListener('click', () => { S.tab = b.dataset.tab; paintTab(); window.scrollTo(0, 0); }));
    $('[data-call]').addEventListener('click', callSheet);
    $('[data-cart]').addEventListener('click', cartSheet);
    paintTab();
  }
  function paintTabs() {
    $$('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === S.tab)));
    const n = S.st.items.reduce((a, i) => a + i.qty, 0);
    const badge = $('#n-sent');
    if (badge) badge.textContent = n ? String(n) : '';
    paintCartBar();
  }
  function paintTab() {
    paintTabs();
    if (S.tab === 'pedido') paintPedido(); else paintCarta();
  }
  function paintCartBar() {
    const bar = $('#cartbar');
    if (!bar) return;
    const n = S.cart.reduce((a, l) => a + l.qty, 0);
    bar.hidden = !n;
    document.body.classList.toggle('has-cart', !!n);
    if (n) $('[data-cart]', bar).innerHTML = `<span>Ver mi pedido <b>${n}</b></span><span>${euro(cartTotal())}</span>`;
  }
  const cartTotal = () => S.cart.reduce((a, l) => a + l.price * l.qty, 0);

  /* ---------- Carta ---------- */
  function alChips(list, full) {
    if (!list || !list.length) return '';
    const al = S.carta.allergens;
    return `<span class="al">${list.map((k) => { const a = al.find((x) => x.key === k) || { abbr: k, name: k }; return `<i title="${esc(a.name)}">${esc(full ? a.name : a.abbr)}</i>`; }).join('')}</span>`;
  }
  const inCart = (pred) => S.cart.filter(pred).reduce((a, l) => a + l.qty, 0);

  function paintCarta() {
    const c = S.carta;
    const secs = [];
    if (c.specials.length) secs.push(['esp', 'Especiales del día']);
    c.categories.forEach((cat) => secs.push(['c' + cat.id, cat.name]));
    if (c.menus.length) secs.push(['menus', 'Menús']);
    const dish = (d) => {
      const n = inCart((l) => l.kind === 'dish' && l.dish === d.id);
      return `<article class="dish${n ? ' in' : ''}">
        <button type="button" class="dish-b" data-dish="${d.id}">
          <span class="dish-t"><b>${esc(d.name)}</b>${d.description ? `<span class="desc">${esc(d.description)}</span>` : ''}${alChips(d.allergens)}<span class="price">${euro(d.price)}</span></span>
          ${d.photo ? `<img src="${esc(d.photo)}" alt="" loading="lazy" decoding="async">` : ''}
        </button>
        <button type="button" class="add" data-quick="${d.id}" aria-label="Añadir ${esc(d.name)}">${n ? `<b>${n}</b>` : '+'}</button>
      </article>`;
    };
    const special = (s, i) => {
      const n = inCart((l) => l.kind === 'special' && l.special === i);
      return `<article class="dish${n ? ' in' : ''}"><button type="button" class="dish-b" data-sp="${i}"><span class="dish-t"><b>${esc(s.name)}</b>${s.desc ? `<span class="desc">${esc(s.desc)}</span>` : ''}<span class="price">${euro(s.price)}</span></span></button>
        <button type="button" class="add" data-spq="${i}" aria-label="Añadir ${esc(s.name)}">${n ? `<b>${n}</b>` : '+'}</button></article>`;
    };
    const menu = (m) => `<article class="dish"><button type="button" class="dish-b" data-menu="${esc(m.id)}"><span class="dish-t"><b>${esc(m.title)}</b>
      <span class="desc">${m.courses.map((x) => esc(x.name)).filter(Boolean).join(' · ') || m.courses.length + ' platos'}${m.note ? ' · ' + esc(m.note) : ''}</span><span class="price">${euro(m.price)}</span></span></button>
      <button type="button" class="add" data-menu="${esc(m.id)}" aria-label="Elegir ${esc(m.title)}">+</button></article>`;
    $('#view').innerHTML = `
      <nav class="cats" aria-label="Secciones de la carta">${secs.map(([k, n]) => `<a href="#s-${k}" data-go="${k}">${esc(n)}</a>`).join('')}</nav>
      ${c.specials.length ? `<section id="s-esp" class="sec"><h2>Especiales del día</h2>${c.specials.map(special).join('')}</section>` : ''}
      ${c.categories.map((cat) => `<section id="s-c${cat.id}" class="sec"><h2>${esc(cat.name)}</h2>${cat.dishes.map(dish).join('')}</section>`).join('')}
      ${c.menus.length ? `<section id="s-menus" class="sec"><h2>Menús</h2>${c.menus.map(menu).join('')}</section>` : ''}
      ${!secs.length ? '<p class="empty">La carta está vacía ahora mismo. Pide al camarero.</p>' : ''}
      <p class="legal">Precios con IVA incluido. Si tienes alguna alergia o intolerancia, avisa también al camarero.</p>`;
    $$('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      const sec = document.getElementById('s-' + a.dataset.go);
      if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - stickyH(), behavior: 'smooth' });
    }));
    const findDish = (id) => { for (const cat of c.categories) { const d = cat.dishes.find((x) => x.id === id); if (d) return d; } return null; };
    $$('[data-dish]').forEach((b) => b.addEventListener('click', () => dishSheet(findDish(Number(b.dataset.dish)))));
    $$('[data-quick]').forEach((b) => b.addEventListener('click', () => { const d = findDish(Number(b.dataset.quick)); addLine({ kind: 'dish', dish: d.id, name: d.name, price: d.price, qty: 1, note: '' }); }));
    $$('[data-sp]').forEach((b) => b.addEventListener('click', () => specialSheet(Number(b.dataset.sp))));
    $$('[data-spq]').forEach((b) => b.addEventListener('click', () => { const i = Number(b.dataset.spq); const s = c.specials[i]; addLine({ kind: 'special', special: i, name: s.name, price: s.price, qty: 1, note: '' }); }));
    $$('[data-menu]').forEach((b) => b.addEventListener('click', () => menuSheet(c.menus.find((m) => m.id === b.dataset.menu))));
    spyCats();
  }
  const stickyH = () => ($('.tabs') ? $('.tabs').getBoundingClientRect().bottom : 0) + ($('.cats') ? $('.cats').offsetHeight : 0) + 6;

  // Marca en la barra de secciones la que se está viendo
  let spy = null;
  function spyCats() {
    if (spy) spy.disconnect();
    if (!('IntersectionObserver' in window)) return;
    spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const k = en.target.id.slice(2);
        $$('.cats a').forEach((a) => a.classList.toggle('on', a.dataset.go === k));
        const on = $(`.cats a[data-go="${k}"]`);
        if (on && on.scrollIntoView) on.parentNode.scrollTo({ left: on.offsetLeft - 16, behavior: 'smooth' });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.sec').forEach((s) => spy.observe(s));
  }

  function addLine(line) {
    const same = S.cart.find((l) => l.kind === line.kind && l.dish === line.dish && l.special === line.special && l.menu === line.menu
      && JSON.stringify(l.choices || null) === JSON.stringify(line.choices || null) && l.note === line.note);
    if (same) same.qty = Math.min(10, same.qty + line.qty);
    else S.cart.push(Object.assign({ key: Math.random().toString(36).slice(2) }, line));
    saveCart();
    toast(`Añadido: ${line.qty > 1 ? line.qty + '× ' : ''}${line.name}`);
    if (S.tab === 'carta') {
      const y = window.scrollY;
      paintCarta();
      window.scrollTo(0, y);
    }
    paintCartBar();
  }

  function noteField() {
    return `<label class="fld">¿Alguna indicación para la cocina? <span class="opt">(opcional)</span>
      <textarea name="note" maxlength="120" rows="2" placeholder="Por ejemplo: sin cebolla"></textarea></label>
      <div class="chips">${NOTE_CHIPS.map((n) => `<button type="button" class="chip" data-chip="${esc(n)}">${esc(n)}</button>`).join('')}</div>`;
  }
  function wireNote(body) {
    const ta = $('[name=note]', body);
    $$('[data-chip]', body).forEach((b) => b.addEventListener('click', () => {
      const v = ta.value.trim();
      ta.value = (v ? v + ', ' : '') + b.dataset.chip.toLowerCase();
      ta.value = ta.value.slice(0, 120);
    }));
  }
  function stepper(v = 1) {
    return `<div class="stepper" role="group" aria-label="Cantidad"><button type="button" data-st="-1" aria-label="Uno menos">−</button><output>${v}</output><button type="button" data-st="1" aria-label="Uno más">+</button></div>`;
  }
  function wireStepper(body, onChange) {
    const out = $('.stepper output', body);
    $$('[data-st]', body).forEach((b) => b.addEventListener('click', () => {
      out.textContent = String(Math.max(1, Math.min(10, Number(out.textContent) + Number(b.dataset.st))));
      if (onChange) onChange(Number(out.textContent));
    }));
    return () => Number(out.textContent);
  }

  function dishSheet(d) {
    if (!d) return;
    openSheet(d.name, `
      ${d.photo ? `<img class="hero" src="${esc(d.photo)}" alt="">` : ''}
      ${d.description ? `<p class="lead">${esc(d.description)}</p>` : ''}
      ${d.allergens && d.allergens.length ? `<p class="fld-t">Alérgenos</p>${alChips(d.allergens, true)}` : ''}
      ${noteField()}
      <div class="sheet-f">${stepper(1)}<button class="btn btn-main grow" type="button" data-add>Añadir · ${euro(d.price)}</button></div>`, (body) => {
      wireNote(body);
      const add = $('[data-add]', body);
      const qty = wireStepper(body, (n) => { add.textContent = `Añadir · ${euro(d.price * n)}`; });
      add.addEventListener('click', () => {
        addLine({ kind: 'dish', dish: d.id, name: d.name, price: d.price, qty: qty(), note: $('[name=note]', body).value.trim() });
        closeSheet();
      });
    });
  }

  function specialSheet(i) {
    const s = S.carta.specials[i];
    if (!s) return;
    openSheet(s.name, `
      <p class="lead">${s.desc ? esc(s.desc) + ' · ' : ''}Especial del día · ${esc(COURSES[s.course] || '')}</p>
      ${noteField()}
      <div class="sheet-f">${stepper(1)}<button class="btn btn-main grow" type="button" data-add>Añadir · ${euro(s.price)}</button></div>`, (body) => {
      wireNote(body);
      const add = $('[data-add]', body);
      const qty = wireStepper(body, (n) => { add.textContent = `Añadir · ${euro(s.price * n)}`; });
      add.addEventListener('click', () => { addLine({ kind: 'special', special: i, name: s.name, price: s.price, qty: qty(), note: $('[name=note]', body).value.trim() }); closeSheet(); });
    });
  }

  function menuSheet(m) {
    if (!m) return;
    openSheet(m.title, `
      <p class="lead">${euro(m.price)} por persona${m.note ? ' · ' + esc(m.note) : ''}. Elige un plato de cada apartado.</p>
      <form id="menu-f" novalidate>
        ${m.courses.map((c, ci) => `<fieldset class="mc"><legend>${esc(c.name || 'Plato ' + (ci + 1))}</legend>
          ${c.dishes.map((d, di) => `<label class="opt-row"><input type="radio" name="c${ci}" value="${di}" ${c.dishes.length === 1 ? 'checked' : ''}>
            <span><b>${esc(d.name)}</b>${d.extra ? ` <small>+${euro(d.extra)}</small>` : ''}${alChips(d.allergens)}</span></label>`).join('')}
        </fieldset>`).join('')}
        ${noteField()}
        <p class="pin-msg" id="menu-msg" role="alert"></p>
        <div class="sheet-f">${stepper(1)}<button class="btn btn-main grow" type="submit">Añadir menú</button></div>
      </form>`, (body) => {
      wireNote(body);
      const f = $('#menu-f', body);
      const qty = wireStepper(body);
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const choices = [];
        for (let ci = 0; ci < m.courses.length; ci++) {
          const r = $(`[name=c${ci}]:checked`, f);
          if (!r) { $('#menu-msg', body).textContent = `Elige un plato en «${m.courses[ci].name || 'Plato ' + (ci + 1)}».`; return; }
          choices.push({ c: ci, d: Number(r.value) });
        }
        const picked = choices.map((ch) => m.courses[ch.c].dishes[ch.d]);
        addLine({ kind: 'menu', menu: m.id, choices, name: m.title, detail: picked.map((d) => d.name).join(' · '),
          price: m.price + picked.reduce((a, d) => a + (Number(d.extra) || 0), 0), qty: qty(), note: $('[name=note]', f).value.trim() });
        closeSheet();
      });
    });
  }

  /* ---------- Mi pedido (carrito) ---------- */
  function cartSheet() {
    if (!S.cart.length) return;
    const confirmTxt = S.st && S.st.confirm ? 'El camarero lo revisa y lo pasa a la cocina.' : 'Va directo a la cocina. Los postres se preparan cuando terminéis los platos principales.';
    openSheet('Tu pedido', `
      <div class="lines">${S.cart.map((l) => `<div class="line" data-k="${esc(l.key)}">
        <span class="line-t"><b>${esc(l.name)}</b>${l.detail ? `<small>${esc(l.detail)}</small>` : ''}${l.note ? `<small class="nota">${esc(l.note)}</small>` : ''}<small>${euro(l.price * l.qty)}</small></span>
        <div class="stepper sm" role="group" aria-label="Cantidad de ${esc(l.name)}"><button type="button" data-q="-1" aria-label="Uno menos">${l.qty === 1 ? '<span class="ic-del" aria-hidden="true"></span>' : '−'}</button><output>${l.qty}</output><button type="button" data-q="1" aria-label="Uno más">+</button></div>
      </div>`).join('')}</div>
      <div class="total"><span>Total de este pedido</span><span>${euro(cartTotal())}</span></div>
      <p class="help">${esc(confirmTxt)}</p>
      <div class="sheet-f"><button class="btn btn-main grow" type="button" data-send>Enviar pedido</button></div>
      <button class="btn-link" type="button" data-more>Seguir mirando la carta</button>`, (body) => {
      $$('[data-q]', body).forEach((b) => b.addEventListener('click', () => {
        const key = b.closest('[data-k]').dataset.k;
        const l = S.cart.find((x) => x.key === key);
        l.qty += Number(b.dataset.q);
        if (l.qty <= 0) S.cart = S.cart.filter((x) => x !== l);
        l.qty = Math.min(10, l.qty);
        saveCart();
        paintCartBar();
        if (S.tab === 'carta') { const y = window.scrollY; paintCarta(); window.scrollTo(0, y); }
        if (S.cart.length) cartSheet(); else closeSheet();
      }));
      $('[data-more]', body).addEventListener('click', closeSheet);
      $('[data-send]', body).addEventListener('click', async (e) => {
        const b = e.currentTarget;
        busy(b, true, 'Enviando…');
        try {
          const st = await api('send', { items: S.cart.map((l) => ({ kind: l.kind, dish: l.dish, special: l.special, menu: l.menu, choices: l.choices, qty: l.qty, note: l.note })) });
          S.cart = [];
          saveCart();
          applyStatus(st);
          closeSheet();
          S.tab = 'pedido';
          paintTab();
          window.scrollTo(0, 0);
          toast(S.st.confirm ? '¡Pedido enviado! El camarero lo revisa enseguida.' : '¡Pedido enviado a la cocina!', 'ok');
        } catch (err) {
          busy(b, false);
          if (err.auth) { closeSheet(); return gate('La mesa se ha cerrado', err.message, { retry: true }); }
          toast(err.message, 'err');
        }
      });
    });
  }

  /* ---------- Lo pedido ---------- */
  function paintPedido() {
    const st = S.st;
    const items = st.items;
    const order = ['listo', 'pendiente', 'preparando', 'nuevo', 'espera', 'servido'];
    const sorted = items.slice().sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || a.course - b.course || a.id - b.id);
    $('#view').innerHTML = `
      ${st.call ? `<div class="callnote"><span class="ic-bell" aria-hidden="true"></span>${st.call === 'cuenta' ? 'Hemos pedido la cuenta al camarero. Enseguida os la trae.' : 'Hemos avisado al camarero. Enseguida viene.'}</div>` : ''}
      ${items.length ? `<div class="sent">${sorted.map((i) => `<div class="sent-i s-${esc(i.status)}">
          <span class="q">${i.qty}×</span>
          <span class="line-t"><b>${esc(i.name)}</b>${i.sub ? `<small>${esc(i.sub)}</small>` : ''}${i.note ? `<small class="nota">${esc(i.note)}</small>` : ''}<span class="pill p-${esc(i.status)}">${esc(ST[i.status] || i.status)}</span></span>
          <span class="amt">${euro(i.price * i.qty)}</span></div>`).join('')}</div>
        <div class="total"><span>Total hasta ahora</span><span>${euro(st.total)}</span></div>
        ${items.some((i) => i.status === 'pendiente') ? '<p class="help">Lo que está «esperando al camarero» aún no se ha pasado a la cocina ni se cobra.</p>' : ''}`
        : '<div class="empty"><p><b>Aún no habéis pedido nada.</b></p><p>Elegid en la carta y enviad el pedido: llega directo al restaurante.</p></div>'}
      <div class="acts">
        <button class="btn btn-line" type="button" data-c="camarero"><span class="ic-bell" aria-hidden="true"></span>Llamar al camarero</button>
        <button class="btn btn-line" type="button" data-c="cuenta">Pedir la cuenta</button>
      </div>
      <button class="btn btn-main wide" type="button" data-tocarta>Ver la carta</button>`;
    $$('[data-c]').forEach((b) => b.addEventListener('click', () => doCall(b.dataset.c, b)));
    $('[data-tocarta]').addEventListener('click', () => { S.tab = 'carta'; paintTab(); window.scrollTo(0, 0); });
  }

  function callSheet() {
    openSheet('Avisar al camarero', `
      <p class="lead">Le sale un aviso en la sala, en tu mesa.</p>
      <div class="acts col">
        <button class="btn btn-main" type="button" data-c="camarero"><span class="ic-bell" aria-hidden="true"></span>Que venga el camarero</button>
        <button class="btn btn-line" type="button" data-c="cuenta">Pedir la cuenta</button>
      </div>`, (body) => {
      $$('[data-c]', body).forEach((b) => b.addEventListener('click', async () => { await doCall(b.dataset.c, b); closeSheet(); }));
    });
  }
  async function doCall(type, b) {
    busy(b, true, 'Avisando…');
    try {
      applyStatus(await api('call', { type }));
      toast(type === 'cuenta' ? 'Hemos pedido la cuenta. Enseguida os la traen.' : 'Hemos avisado al camarero.', 'ok');
      paintTabs();
      if (S.tab === 'pedido') paintPedido();
    } catch (err) {
      busy(b, false);
      if (err.auth) return gate('La mesa se ha cerrado', err.message, { retry: true });
      toast(err.message, 'err');
    }
  }

  start();
})();
