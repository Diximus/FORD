(() => {
'use strict';

/* ================= утилиты ================= */
const PB = (window.PB_URL || location.origin).replace(/\/$/, '');
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const num = n => nf.format(Math.round(+n || 0));
const rub = n => num(n) + ' ₽';
const todayStr = () => new Date().toLocaleDateString('sv-SE');
const agoStr = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toLocaleDateString('sv-SE'); };
const d0 = s => new Date(s.slice(0, 10) + 'T00:00:00');
const daysTo = s => Math.round((d0(s) - d0(todayStr())) / 864e5);
const fmtD = s => s ? s.slice(0, 10).split('-').reverse().join('.') : '—';
const sum = a => a.reduce((s, r) => s + (+r.amount || 0), 0);
const within = (r, a, b) => { const d = r.date.slice(0, 10); return (!a || d > a) && (!b || d <= b); };
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const IC = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  fuel: 'M4 21V5a2 2 0 012-2h6a2 2 0 012 2v16M3 21h12M6 8h6M15 9h2a2 2 0 012 2v5a1.5 1.5 0 003 0V9l-3-3',
  wrench: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  gear: 'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
  cog: 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  box: 'M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8',
  chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  file: 'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5zM14 3v5h5M9 13h6M9 17h6',
  bell: 'M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0',
  plus: 'M12 5v14M5 12h14',
  car: 'M3 17h18M5 17v2M19 17v2M3 13l2-6a2 2 0 012-1.5h10A2 2 0 0119 7l2 6v4H3v-4zM7.5 13h.01M16.5 13h.01',
  trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z',
  cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  check: 'M5 12l5 5 9-10',
  x: 'M6 6l12 12M18 6L6 18',
  refresh: 'M21 12a9 9 0 01-15.5 6.2L3 16M3 12a9 9 0 0115.5-6.2L21 8M21 3v5h-5M3 21v-5h5',
  battery: 'M3 8h18v11H3zM6 8V5h3v3M15 8V5h3v3M6.5 13.5h3M16.5 12v3M15 13.5h3',
  therm: 'M14 14.8V5a2 2 0 10-4 0v9.8a4 4 0 104 0zM12 9v7',
  exit: 'M3 6.2L9 3.8v16.4L3 17.8zM6.6 12h.01M13 4.5h2.5a1.5 1.5 0 011.5 1.5v2.2M13 19.5h2.5a1.5 1.5 0 001.5-1.5v-2.2M12 12h10M18.5 8.5L22 12l-3.5 3.5',
  out: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  wallet: 'M3 7h16a2 2 0 012 2v10H5a2 2 0 01-2-2V7zM3 7l12-3v3M16 14h2',
  speed: 'M12 14l4-4M4 18a9 9 0 1116 0',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  clock: 'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
  clip: 'M21 12l-8.5 8.5a5 5 0 01-7-7L14 5a3.5 3.5 0 015 5l-8.5 8.5a2 2 0 01-3-3L15 8',
};
const ic = (n, s = 20) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n] || ''}"/></svg>`;

const CAT = {
  fuel: { n: 'Заправка', ic: 'fuel', c: '#3b82f6' },
  service: { n: 'ТО', ic: 'wrench', c: '#a855f7' },
  repair: { n: 'Ремонт', ic: 'gear', c: '#f59e0b' },
  insurance: { n: 'Страховка', ic: 'shield', c: '#22c55e' },
  parts: { n: 'Запчасти', ic: 'box', c: '#f97316' },
};
const GROUPS = [
  { k: 'fuel', cats: ['fuel'], n: 'Заправки', ic: 'fuel', c: '#3b82f6', bg: 'rgba(59,130,246,.18)' },
  { k: 'service', cats: ['service', 'repair'], n: 'Ремонт и ТО', ic: 'wrench', c: '#a855f7', bg: 'rgba(168,85,247,.18)' },
  { k: 'insurance', cats: ['insurance'], n: 'Страховка', ic: 'shield', c: '#22c55e', bg: 'rgba(34,197,94,.18)' },
  { k: 'parts', cats: ['parts'], n: 'Запчасти', ic: 'box', c: '#f97316', bg: 'rgba(249,115,22,.18)' },
];
const DOC = { sts: 'СТС', pts: 'ПТС', license: 'Водительское удостоверение', insurance: 'Страховка (ОСАГО/КАСКО)', other: 'Другое' };
const NAV = [
  ['home', 'Главная', 'home'], ['fuel', 'Заправки', 'fuel'], ['service', 'ТО и ремонты', 'wrench'],
  ['insurance', 'Страховка', 'shield'], ['parts', 'Запчасти', 'box'], ['docs', 'Документы', 'file'],
  ['rems', 'Напоминания', 'bell'], ['stats', 'Статистика', 'chart'], ['settings', 'Настройки', 'cog'],
];

/* ================= состояние и API ================= */
const S = {
  token: localStorage.getItem('pbToken') || '',
  user: JSON.parse(localStorage.getItem('pbUser') || 'null'),
  cars: [], carId: localStorage.getItem('carId') || '', records: [], docs: [], rems: [],
  view: 'home', period: 'year', synced: null, authTab: 'login', loading: false,
};
const curCar = () => S.cars.find(c => c.id === S.carId) || S.cars[0] || null;

function errMsg(d) {
  if (!d) return 'Ошибка сети';
  const f = d.data ? Object.entries(d.data).map(([k, v]) => `${k}: ${v.message}`).join('; ') : '';
  return (d.message || 'Ошибка') + (f ? ' — ' + f : '');
}
async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (S.token) headers.Authorization = S.token;
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  let r;
  try { r = await fetch(PB + '/api' + path, { method, headers, body: payload }); }
  catch (e) { throw new Error('Нет связи с сервером'); }
  const data = r.status === 204 ? null : await r.json().catch(() => null);
  if (r.status === 401 && S.token && !path.includes('auth-with')) { logout(true); throw new Error('Сессия истекла, войдите снова'); }
  if (!r.ok) throw new Error(errMsg(data));
  return data;
}
const list = async (col, filter, sort) => (await api(`/collections/${col}/records?perPage=500&filter=${encodeURIComponent(filter || '')}&sort=${encodeURIComponent(sort || '-created')}`)).items;
const create = (col, body) => api(`/collections/${col}/records`, { method: 'POST', body });
const update = (col, id, body) => api(`/collections/${col}/records/${id}`, { method: 'PATCH', body });
const remove = (col, id) => api(`/collections/${col}/records/${id}`, { method: 'DELETE' });
const fileUrl = (rec, name, token) => `${PB}/api/files/${rec.collectionId}/${rec.id}/${encodeURIComponent(name)}${token ? '?token=' + token : ''}`;
let ftok = { v: '', t: 0 };
async function fileToken() {
  if (Date.now() - ftok.t < 80000) return ftok.v;
  const r = await api('/files/token', { method: 'POST' });
  ftok = { v: r.token, t: Date.now() };
  return ftok.v;
}

function toast(msg, err) {
  const t = document.createElement('div');
  t.className = 'toast' + (err ? ' err' : '');
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function saveAuth(r) {
  S.token = r.token; S.user = r.record;
  localStorage.setItem('pbToken', r.token);
  localStorage.setItem('pbUser', JSON.stringify(r.record));
}
function logout(silent) {
  S.token = ''; S.user = null; S.cars = []; S.records = []; S.docs = []; S.rems = [];
  localStorage.removeItem('pbToken'); localStorage.removeItem('pbUser');
  render();
  if (!silent) toast('Вы вышли из аккаунта');
}

async function loadCars() {
  S.cars = await list('cars', '', 'created');
  if (!S.cars.find(c => c.id === S.carId)) S.carId = S.cars[0]?.id || '';
  localStorage.setItem('carId', S.carId);
}
async function loadCarData() {
  const c = curCar();
  if (!c) { S.records = []; S.docs = []; S.rems = []; return; }
  const f = `car="${c.id}"`;
  [S.records, S.docs, S.rems] = await Promise.all([
    list('records', f, '-date,-created'),
    list('documents', f, 'expires,-created'),
    list('reminders', f, 'due,-created'),
  ]);
}
async function refresh(keepView) {
  S.loading = true;
  try {
    await loadCars();
    await loadCarData();
    S.synced = new Date();
  } catch (e) { toast(e.message, true); }
  S.loading = false;
  render();
  notifyDue();
}

/* ================= расчёты ================= */
function totals() {
  const span = { month: 30, year: 365, all: null }[S.period];
  const a = span ? agoStr(span) : null;
  const cur = S.records.filter(r => within(r, a, null));
  let delta = null;
  if (span) {
    const ps = sum(S.records.filter(r => within(r, agoStr(span * 2), a)));
    if (ps > 0) delta = (sum(cur) - ps) / ps * 100;
  }
  return { cur, total: sum(cur), delta };
}
function deadlines() {
  const car = curCar(); const out = [];
  S.docs.forEach(d => {
    if (!d.expires) return;
    const left = daysTo(d.expires), th = d.remind_days || 30;
    out.push({ kind: 'doc', id: d.id, title: DOC[d.type] + (d.title ? ' — ' + d.title : ''), date: d.expires, left, sort: left, alert: left <= th, ic: 'file' });
  });
  S.rems.filter(r => !r.done).forEach(r => {
    if (r.due) {
      const left = daysTo(r.due), th = r.remind_days || 7;
      out.push({ kind: 'rem', id: r.id, title: r.title, date: r.due, left, sort: left, alert: left <= th, ic: 'bell' });
    }
    if (r.due_mileage) {
      const km = r.due_mileage - (car?.mileage || 0);
      out.push({ kind: 'rem', id: r.id, title: r.title, km, sort: km / 50, alert: km <= 500, ic: 'speed', date: '' });
    }
  });
  return out.sort((a, b) => a.sort - b.sort);
}
const dlabel = it => it.km !== undefined
  ? (it.km <= 0 ? 'пробег достигнут' : 'через ' + num(it.km) + ' км')
  : (it.left < 0 ? `просрочено ${-it.left} дн.` : it.left === 0 ? 'сегодня' : `через ${it.left} дн.`);
const dcls = it => { const v = it.km !== undefined ? it.sort : it.left; return v < 0 || (it.km === undefined && v <= 7) ? 'danger' : it.alert ? 'warn' : 'ok'; };
const alertCount = () => deadlines().filter(d => d.alert).length;

function notifyDue() {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (localStorage.getItem('notifDay') === todayStr()) return;
    const items = deadlines().filter(d => d.alert);
    if (!items.length) return;
    localStorage.setItem('notifDay', todayStr());
    new Notification('Автожурнал: ' + curCar().name, { body: items.slice(0, 4).map(i => `${i.title} — ${dlabel(i)}`).join('\n'), icon: 'icon.svg' });
  } catch (_) {}
}

/* ================= вид ================= */
function render() {
  const app = $('#app');
  if (!S.token) { app.innerHTML = authHtml(); return; }
  const car = curCar();
  const bc = alertCount();
  const carSel = S.cars.length ? `<select class="carsel" data-change="car">${S.cars.map(c => `<option value="${c.id}" ${c.id === car?.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>` : '';
  const navBtn = (k, n, i, mob) => `<button data-act="nav" data-v="${k}" class="${S.view === k ? 'on' : ''}">${ic(i, mob ? 22 : 22)}<span>${n}</span>${(k === 'docs' || k === 'rems') && bc && k === 'docs' ? `<span class="badge">${bc}</span>` : ''}</button>`;
  app.innerHTML = `
  <div class="layout">
    <aside class="side">
      <div class="brand">
        ${logoHtml(car)}
        <div><div class="nm">${esc(car?.name || 'Автожурнал')}</div><div class="pl">${esc(car?.plate || '')}</div></div>
        ${carSel}
      </div>
      <nav class="nav">${NAV.map(n => navBtn(n[0], n[1], n[2])).join('')}</nav>
      <div class="foot">Хорошая машина —<br>требует заботы!</div>
    </aside>
    <main class="main">
      <div class="top">
        ${carSel}
        <div class="pill"><span class="dot"></span>Синхронизировано ${S.synced ? 'сегодня, ' + S.synced.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '…'}</div>
        <div class="pill hide-m">${ic('cal', 16)}${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        <button class="icon-btn" data-act="nav" data-v="settings" title="Настройки">${ic('cog')}</button>
        <button class="icon-btn" data-act="logout" title="Выйти из аккаунта">${ic('exit')}</button>
      </div>
      ${car ? viewHtml(car) : welcomeHtml()}
    </main>
  </div>
  <nav class="bottomnav">${NAV.map(n => navBtn(n[0], n[1], n[2], true)).join('')}</nav>`;
  animateOdo();
}

const LOGOS = { ford: 'Ford', lada: 'Lada' };
function guessLogo(name) {
  const n = (name || '').toLowerCase();
  if (/ford|форд/.test(n)) return 'ford';
  if (/lada|лада|ваз|vaz/.test(n)) return 'lada';
  return '';
}
function logoHtml(car) {
  let src = '';
  if (car?.logo) src = fileUrl(car, car.logo);
  else {
    const p = car?.logo_preset === 'none' ? '' : (LOGOS[car?.logo_preset] ? car.logo_preset : guessLogo(car?.name));
    if (p) src = `logos/${p}.png`;
  }
  return src
    ? `<img class="brand-logo" src="${esc(src)}" alt="">`
    : `<div class="logo">${ic('car', 34)}</div>`;
}

function authHtml() {
  const reg = S.authTab === 'reg';
  return `<div class="auth"><form class="box glass" data-form="auth">
    <div class="logo brand" style="align-items:center"><div class="logo">${ic('car', 34)}</div></div>
    <h1>Автожурнал</h1>
    <div class="tabs"><button type="button" data-act="tab" data-v="login" class="${reg ? '' : 'on'}">Вход</button><button type="button" data-act="tab" data-v="reg" class="${reg ? 'on' : ''}">Регистрация</button></div>
    <div class="f"><label>E-mail</label><input name="email" type="email" required autocomplete="username"></div>
    <div class="f"><label>Пароль${reg ? ' (не короче 8 символов)' : ''}</label><input name="password" type="password" required minlength="${reg ? 8 : 1}" autocomplete="${reg ? 'new-password' : 'current-password'}"></div>
    ${reg ? '<div class="f"><label>Повторите пароль</label><input name="passwordConfirm" type="password" required minlength="8" autocomplete="new-password"></div>' : ''}
    <button class="btn primary" style="justify-content:center">${reg ? 'Создать аккаунт' : 'Войти'}</button>
  </form></div>`;
}
function welcomeHtml() {
  return `<div class="welcome"><div class="brand"><div class="logo">${ic('car', 34)}</div></div>
    <h2 style="margin-bottom:8px">Добавьте первый автомобиль</h2>
    <p style="color:var(--mut);margin-bottom:20px">Заправки, ремонты, страховка, документы и напоминания — всё в одном месте.</p>
    <button class="btn primary" data-act="add-car">${ic('plus', 18)} Добавить автомобиль</button></div>`;
}

function viewHtml(car) {
  switch (S.view) {
    case 'home': return homeHtml(car);
    case 'fuel': case 'service': case 'insurance': case 'parts': return recordsHtml(car, S.view);
    case 'docs': return docsHtml();
    case 'rems': return remsHtml(car);
    case 'stats': return statsHtml(car);
    case 'settings': return settingsHtml(car);
  }
  return '';
}

/* ---------- главная ---------- */
function homeHtml(car) {
  const T = totals();
  const bgStyle = car.background ? `style="background-image:url('${fileUrl(car, car.background)}')"` : '';
  const dl = deadlines(), al = dl.filter(d => d.alert);
  const alertHtml = al.length ? `<div class="alert ${al.some(a => dcls(a) === 'danger') ? '' : 'warn'}">${ic('bell', 22)}<div><b>Требует внимания:</b> ${al.slice(0, 3).map(a => `${esc(a.title)} — ${dlabel(a)}`).join('; ')}${al.length > 3 ? ` и ещё ${al.length - 3}` : ''}</div></div>` : '';

  const stats = GROUPS.map(g => {
    const s = sum(T.cur.filter(r => g.cats.includes(r.category)));
    const p = T.total ? s / T.total * 100 : 0;
    return `<div class="stat glass" data-act="nav" data-v="${g.k}"><div class="si" style="background:${g.bg};color:${g.c}">${ic(g.ic, 26)}</div>
      <div><div class="t">${g.n}</div><div class="v">${rub(s)}</div><div class="p">≈ ${nf1.format(p)}%</div><div class="bar"><i style="width:${p}%;background:${g.c}"></i></div></div></div>`;
  }).join('');

  // по месяцам
  const now = new Date(), months = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ key: d.toLocaleDateString('sv-SE').slice(0, 7), n: MONTHS[d.getMonth()], v: 0 }); }
  S.records.forEach(r => { const m = months.find(x => x.key === r.date.slice(0, 7)); if (m) m.v += +r.amount || 0; });
  const mx = niceMax(Math.max(...months.map(m => m.v), 1));
  const bars = months.map((m, i) => `<div class="bcol ${i === 6 ? 'cur' : ''}"><i style="height:${m.v / mx * 100}%"></i>${i === 6 && m.v ? `<span class="tip" style="bottom:calc(${m.v / mx * 100}% + 6px)">${rub(m.v)}</span>` : ''}</div>`).join('');

  // пробег
  const pts = mileagePoints(car);
  const ago = S.records.filter(r => r.mileage && r.date.slice(0, 10) <= agoStr(30)).sort((a, b) => b.date.localeCompare(a.date))[0];
  const dm = ago ? car.mileage - ago.mileage : null;

  const recent = S.records.slice(0, 5).map(recRow).join('');

  return `
  <section class="hero">
    <div class="bg" ${bgStyle}></div>
    ${car.background ? '' : `<div class="empty-ph">${ic('car', 340)}</div>`}
    <div>
      <h1>${esc(car.name)}</h1>
      <div class="sub"><span>${esc(car.subtitle || '')}</span>${plateHtml(car.plate)}</div>
    </div>
    ${statusHtml(car)}
  </section>
  ${alertHtml}
  <div class="period-row">Расходы по категориям
    <select class="period" data-change="period"><option value="month" ${S.period === 'month' ? 'selected' : ''}>за 30 дней</option><option value="year" ${S.period === 'year' ? 'selected' : ''}>за год</option><option value="all" ${S.period === 'all' ? 'selected' : ''}>за всё время</option></select></div>
  <div class="grid4" style="margin-top:8px">${stats}</div>
  <div class="row2">
    <div class="card glass"><h3>${ic('chart', 22)} Расходы по месяцам</h3>
      <div class="bars"><div class="grid">${[1, .5, 0].map(f => `<span style="top:${(1 - f) * 100}%"><b>${f ? shortNum(mx * f) : '0 ₽'}</b></span>`).join('')}</div>${bars}</div>
      <div class="blabels">${months.map(m => `<span>${m.n}</span>`).join('')}</div></div>
    <div class="card glass mile"><h3>${ic('speed', 22)} Пробег</h3>
      ${odoHtml(car.mileage)}
      ${slLine(car)}
      ${dm !== null && dm > 0 ? `<div class="d">▲ +${num(dm)} км с прошлого месяца</div>` : '<div class="d" style="color:var(--mut)">&nbsp;</div>'}
      ${lineChart(pts)}</div>
  </div>
  <div class="row3">
    <div class="card glass"><h3>${ic('clock', 22)} Последние записи <button class="more" data-act="nav" data-v="${S.records[0] ? (GROUPS.find(g => g.cats.includes(S.records[0].category))?.k || 'fuel') : 'fuel'}">Все записи →</button></h3>
      ${S.records.length ? `<table><thead><tr><th>Дата</th><th class="hide-m">Пробег</th><th>Категория</th><th class="hide-m">Описание</th><th class="r">Сумма</th></tr></thead><tbody>${recent}</tbody></table>` : '<div class="empty">Пока нет записей — добавьте первую справа</div>'}</div>
    <div class="card glass"><h3>${ic('bolt', 22)} Быстрые действия</h3>
      <div class="quick">
        <button class="qa b" data-act="add-rec" data-cat="fuel">${ic('fuel', 24)}Добавить заправку</button>
        <button class="qa p" data-act="add-rec" data-cat="service">${ic('wrench', 24)}Добавить ремонт / ТО</button>
        <button class="qa g" data-act="add-rec" data-cat="insurance">${ic('shield', 24)}Добавить страховку</button>
        <button class="qa o" data-act="add-rec" data-cat="parts">${ic('box', 24)}Добавить запчасти</button>
        <button class="qa c" data-act="add-doc">${ic('file', 24)}Загрузить документ</button>
        <button class="qa m" data-act="add-rem">${ic('bell', 24)}Напоминание</button>
      </div></div>
  </div>
  <div class="card glass" style="margin-top:14px"><h3>${ic('bell', 22)} Ближайшие сроки <button class="more" data-act="nav" data-v="docs">Документы →</button></h3>
    ${dl.length ? dl.slice(0, 5).map(dlRow).join('') : '<div class="empty">Добавьте документы со сроком действия или напоминания — они появятся здесь</div>'}</div>`;
}
const LAT = { 'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X' };
function plateCss(t) {
  const m = t.match(/^([A-ZА-ЯЁ]\d{3}[A-ZА-ЯЁ]{2})(\d{2,3})$/);
  const main = m ? m[1] : t, reg = m ? m[2] : '';
  return `<span class="rplate"><span class="rp-main">${esc(main)}</span>` +
    (reg ? `<span class="rp-reg"><b>${esc(reg)}</b><span class="rp-rus"><em>RUS</em><i class="rp-flag"></i></span></span>` : '') + `</span>`;
}
function plateHtml(plate) {
  const t = String(plate || '').toUpperCase().replace(/[^A-ZА-ЯЁ0-9]/g, '');
  if (!t) return '';
  const key = t.replace(/[А-ЯЁ]/g, c => LAT[c] || c);
  if (!/^[A-Z0-9]+$/.test(key)) return plateCss(t);
  // готовая картинка номера: plates/<НОМЕР латиницей>.png, иначе рисуем номер средствами CSS
  return `<img class="plate-img" src="plates/${key}.png?v=2" alt="Госномер ${esc(t)}" data-fb="${esc(plateCss(t))}" onerror="this.outerHTML=this.dataset.fb">`;
}
function statusHtml(car) {
  const has = v => v !== null && v !== undefined && v !== '' && !(v === 0 && !car.mileage_synced);
  const bat = car.battery, fuel = car.fuel_level;
  const batCls = !has(bat) ? '' : bat < 11.8 ? 'bad' : bat < 12.2 ? 'warn' : 'ok';
  const batTxt = !has(bat) ? '' : bat < 11.8 ? 'Разряжен' : bat < 12.2 ? 'Низкий' : 'Норма';
  const batPct = has(bat) ? Math.max(4, Math.min(100, (bat - 11) / 3.5 * 100)) : 0;
  const fuelCls = !has(fuel) ? '' : fuel < 15 ? 'bad' : fuel < 30 ? 'warn' : 'ok';
  const balCls = !has(car.balance) ? '' : car.balance < 50 ? 'bad' : car.balance < 100 ? 'warn' : 'ok';
  const t = x => has(x) ? `${nf.format(x)}°` : '—';
  const when = car.mileage_synced ? new Date(car.mileage_synced).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
  const tile = (cls, icon, label, value, sub, pct) => `<div class="st ${cls}"><div class="st-ic">${ic(icon, 24)}</div><div class="st-b"><div class="st-l">${label}</div><div class="st-v">${value}</div><div class="st-s">${sub || '&nbsp;'}</div>${pct !== undefined ? `<div class="st-bar"><i style="width:${pct}%"></i></div>` : ''}</div></div>`;
  return `<div class="status glass">
    ${tile(batCls, 'battery', 'Аккумулятор', has(bat) ? `${nf1.format(bat)} <small>В</small>` : '—', batTxt, batPct)}
    ${tile(balCls, 'wallet', 'Баланс SIM', has(car.balance) ? `${nf.format(car.balance)} <small>₽</small>` : '—', car.starline_device ? '' : 'нужен StarLine')}
    ${tile('temp', 'therm', 'Температура', `${t(car.temp_cabin)} <small>/ ${t(car.temp_engine)}</small>`, 'салон / двигатель')}
    ${tile(fuelCls, 'fuel', 'Топливо', has(fuel) ? `${nf.format(fuel)} <small>%</small>` : '—', when, has(fuel) ? fuel : 0)}
  </div>`;
}
function slLine(car) {
  if (!car.starline_device) return '';
  const t = car.mileage_synced ? new Date(car.mileage_synced) : null;
  const when = t && !isNaN(t) ? t.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'ещё не обновлялось';
  const fuel = car.fuel_level > 0 ? ` · топливо ${nf.format(car.fuel_level)}%` : '';
  return `<div class="sl-line"><span>StarLine: ${when}${fuel}</span><button class="icon-btn sl-btn" data-act="sync-sl" title="Обновить из StarLine">${ic('refresh', 16)}</button></div>`;
}
function odoHtml(km) {
  const s = String(Math.max(0, Math.round(+km || 0))).padStart(6, '0');
  const cell = d => `<span class="odo-cell"><span class="odo-strip" data-d="${d}">${'0123456789'.split('').map(x => `<i>${x}</i>`).join('')}</span></span>`;
  return `<div class="odo-wrap"><div class="odo" role="img" aria-label="Пробег ${num(km)} км">${s.split('').map(cell).join('')}</div><div class="odo-unit">км</div></div>`;
}
function animateOdo() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.odo-strip').forEach((el, i) => {
      el.style.transitionDelay = (i * 60) + 'ms';
      el.style.transform = `translateY(${-el.dataset.d * 10}%)`;
    });
  }));
}
function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
const shortNum = v => v >= 1000 ? nf1.format(v / 1000) + 'k' : String(Math.round(v));
function mileagePoints(car) {
  const m = new Map();
  S.records.filter(r => r.mileage > 0).sort((a, b) => a.date.localeCompare(b.date)).forEach(r => m.set(r.date.slice(0, 10), r.mileage));
  const pts = [...m.entries()].map(([d, v]) => ({ d, v }));
  return pts.slice(-8);
}
function lineChart(pts) {
  if (pts.length < 2) return '<div class="empty">Добавьте записи с пробегом, чтобы увидеть график</div>';
  const W = 320, H = 130, px = 10, py = 14;
  const mn = Math.min(...pts.map(p => p.v)), mx = Math.max(...pts.map(p => p.v)), rg = (mx - mn) || 1;
  const xy = pts.map((p, i) => [px + i * (W - 2 * px) / (pts.length - 1), H - py - (p.v - mn) / rg * (H - 2 * py)]);
  const line = xy.map(p => p.join(',')).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto"><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22d3ee" stop-opacity=".35"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></linearGradient></defs>
    <polygon points="${px},${H} ${line} ${W - px},${H}" fill="url(#lg)"/><polyline points="${line}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
    ${xy.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#38bdf8" stroke="#0b1633" stroke-width="2"><title>${fmtD(pts[i].d)}: ${num(pts[i].v)} км</title></circle>`).join('')}</svg>
    <div style="display:flex;justify-content:space-between;color:var(--mut);font-size:12px"><span>${fmtD(pts[0].d)}</span><span>${fmtD(pts[pts.length - 1].d)}</span></div>`;
}
function recRow(r, withActs) {
  const c = CAT[r.category];
  return `<tr><td>${fmtD(r.date)}</td><td class="hide-m">${r.mileage ? num(r.mileage) + ' км' : '—'}</td>
    <td><span class="cat" style="color:${c.c}">${ic(c.ic, 18)}<span style="color:#d6e0fb">${c.n}</span></span></td>
    <td class="hide-m">${esc(r.description || '')}${r.liters ? ` <span style="color:var(--mut)">· ${nf1.format(r.liters)} л</span>` : ''}</td>
    <td class="r">${rub(r.amount)}</td>
    ${withActs ? `<td><div class="acts"><button data-act="edit-rec" data-id="${r.id}" title="Изменить">${ic('edit', 16)}</button><button data-act="del-rec" data-id="${r.id}" title="Удалить">${ic('trash', 16)}</button></div></td>` : ''}</tr>`;
}
function dlRow(it) {
  return `<div class="dl"><div class="si stat" style="width:38px;height:38px;border-radius:12px;padding:0;display:grid;place-items:center;background:rgba(59,130,246,.15);cursor:default;border:0">${ic(it.ic, 20)}</div>
    <div class="tx"><div class="tt">${esc(it.title)}</div><div class="ss">${it.date ? 'до ' + fmtD(it.date) : 'по пробегу'}</div></div>
    <span class="badge2 ${dcls(it)}">${dlabel(it)}</span></div>`;
}

/* ---------- списки записей ---------- */
function recordsHtml(car, k) {
  const g = GROUPS.find(x => x.k === k);
  const recs = S.records.filter(r => g.cats.includes(r.category));
  let mini = `<div class="card glass"><div class="k">Всего потрачено</div><div class="v">${rub(sum(recs))}</div></div><div class="card glass"><div class="k">Записей</div><div class="v">${recs.length}</div></div>`;
  if (k === 'fuel') {
    const f = fuelStats();
    mini += `<div class="card glass"><div class="k">Средний расход</div><div class="v">${f.cons ? nf1.format(f.cons) + ' л/100 км' : '—'}</div></div><div class="card glass"><div class="k">Средняя цена литра</div><div class="v">${f.price ? nf1.format(f.price) + ' ₽' : '—'}</div></div>`;
  }
  const extra = k === 'insurance' ? insuranceDocsHint() : '';
  return `<div class="page-h"><h2>${g.n}</h2><div class="sp"></div>
    <button class="btn primary" data-act="add-rec" data-cat="${k === 'service' ? 'service' : g.cats[0]}">${ic('plus', 18)} Добавить</button></div>
    <div class="mini">${mini}</div>${extra}
    <div class="card glass">${recs.length ? `<table><thead><tr><th>Дата</th><th class="hide-m">Пробег</th><th>Категория</th><th class="hide-m">Описание</th><th class="r">Сумма</th><th></th></tr></thead><tbody>${recs.map(r => recRow(r, true)).join('')}</tbody></table>` : '<div class="empty">Записей пока нет</div>'}</div>`;
}
function insuranceDocsHint() {
  const d = S.docs.filter(x => x.type === 'insurance' && x.expires).sort((a, b) => a.expires.localeCompare(b.expires)).pop();
  if (!d) return `<div class="alert warn" style="margin:0 0 14px">${ic('shield', 22)}<div>Загрузите полис в разделе «Документы» и укажите срок — приложение напомнит о продлении.</div></div>`;
  const left = daysTo(d.expires);
  return `<div class="card glass" style="margin-bottom:14px;display:flex;align-items:center;gap:12px">${ic('shield', 26)}<div style="flex:1"><b>Действующий полис</b><div class="ss" style="color:var(--mut)">до ${fmtD(d.expires)}</div></div><span class="badge2 ${left < 0 || left <= 7 ? 'danger' : left <= (d.remind_days || 30) ? 'warn' : 'ok'}">${dlabel({ left })}</span></div>`;
}
function fuelStats() {
  const f = S.records.filter(r => r.category === 'fuel' && r.liters > 0).sort((a, b) => (a.mileage || 0) - (b.mileage || 0) || a.date.localeCompare(b.date));
  const L = f.reduce((s, r) => s + r.liters, 0), A = sum(f);
  const withM = f.filter(r => r.mileage > 0);
  let cons = 0;
  if (withM.length > 1) {
    const km = withM[withM.length - 1].mileage - withM[0].mileage;
    const lit = withM.slice(1).reduce((s, r) => s + r.liters, 0);
    cons = km > 0 ? lit / km * 100 : 0;
  }
  return { cons, price: L ? A / L : 0, liters: L };
}

/* ---------- документы ---------- */
function docsHtml() {
  const cards = S.docs.map(d => {
    const left = d.expires ? daysTo(d.expires) : null;
    const th = d.remind_days || 30;
    const cls = left === null ? 'none' : left < 0 || left <= 7 ? 'danger' : left <= th ? 'warn' : 'ok';
    return `<div class="doc card glass">
      <div class="h"><div class="si" style="width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:rgba(59,130,246,.18)">${ic('file', 24)}</div>
        <div style="flex:1;min-width:0"><div class="t">${esc(DOC[d.type])}</div><div class="s">${esc(d.title || '')}</div></div>
        <div class="acts"><button data-act="edit-doc" data-id="${d.id}">${ic('edit', 16)}</button><button data-act="del-doc" data-id="${d.id}">${ic('trash', 16)}</button></div></div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="badge2 ${cls}">${left === null ? 'без срока' : dlabel({ left })}</span>
        ${d.expires ? `<span class="ss" style="color:var(--mut);font-size:13px">действует до ${fmtD(d.expires)} · напомнить за ${th} дн.</span>` : ''}</div>
      <div class="files">${(d.files || []).map(f => `<span class="chip">${ic('clip', 14)}<button data-act="open-file" data-id="${d.id}" data-f="${esc(f)}" title="${esc(f)}">${esc(shortName(f))}</button><button class="x" data-act="del-file" data-id="${d.id}" data-f="${esc(f)}" title="Удалить файл">${ic('x', 12)}</button></span>`).join('') || '<span class="ss" style="color:var(--mut);font-size:13px">Файлы не загружены</span>'}</div>
    </div>`;
  }).join('');
  return `<div class="page-h"><h2>Документы</h2><div class="sp"></div><button class="btn primary" data-act="add-doc">${ic('plus', 18)} Загрузить документ</button></div>
    <div class="docs">${cards || '<div class="card glass empty" style="grid-column:1/-1">Загрузите СТС, ПТС, права или страховку — можно несколько файлов или фото на документ.</div>'}</div>`;
}
const shortName = f => f.length > 26 ? f.slice(0, 14) + '…' + f.slice(-9) : f;

/* ---------- напоминания ---------- */
function remsHtml(car) {
  const rows = S.rems.map(r => {
    const items = deadlines().filter(d => d.id === r.id && d.kind === 'rem');
    const badges = r.done ? '<span class="badge2 none">выполнено</span>' : items.map(it => `<span class="badge2 ${dcls(it)}">${dlabel(it)}</span>`).join(' ');
    return `<div class="dl ${r.done ? 'done' : ''}"><button class="check ${r.done ? 'on' : ''}" data-act="toggle-rem" data-id="${r.id}" title="Отметить выполненным">${ic('check', 14)}</button>
      <div class="tx"><div class="tt">${esc(r.title)}</div><div class="ss">${[r.due ? 'до ' + fmtD(r.due) : '', r.due_mileage ? 'при пробеге ' + num(r.due_mileage) + ' км' : '', r.note].filter(Boolean).map(esc).join(' · ')}</div></div>
      ${badges}<div class="acts"><button data-act="edit-rem" data-id="${r.id}">${ic('edit', 16)}</button><button data-act="del-rem" data-id="${r.id}">${ic('trash', 16)}</button></div></div>`;
  }).join('');
  return `<div class="page-h"><h2>Напоминания</h2><div class="sp"></div><button class="btn primary" data-act="add-rem">${ic('plus', 18)} Добавить</button></div>
    <div class="card glass">${rows || '<div class="empty">Например: «Замена масла» при пробеге 220 000 км или «Шиномонтаж» до 15.04</div>'}</div>`;
}

/* ---------- статистика ---------- */
function statsHtml(car) {
  const all = sum(S.records);
  const ms = S.records.filter(r => r.mileage > 0).map(r => r.mileage);
  const km = ms.length > 1 ? Math.max(...ms) - Math.min(...ms) : 0;
  const f = fuelStats();
  const byGroup = GROUPS.map(g => ({ g, v: sum(S.records.filter(r => g.cats.includes(r.category))) }));
  const years = {};
  S.records.forEach(r => { const y = r.date.slice(0, 4); years[y] = (years[y] || 0) + (+r.amount || 0); });
  return `<div class="page-h"><h2>Статистика</h2></div>
  <div class="mini">
    <div class="card glass"><div class="k">Всего расходов</div><div class="v">${rub(all)}</div></div>
    <div class="card glass"><div class="k">Стоимость 1 км</div><div class="v">${km ? nf1.format(all / km) + ' ₽' : '—'}</div></div>
    <div class="card glass"><div class="k">Средний расход топлива</div><div class="v">${f.cons ? nf1.format(f.cons) + ' л/100' : '—'}</div></div>
    <div class="card glass"><div class="k">Всего залито</div><div class="v">${num(f.liters)} л</div></div></div>
  <div class="row2" style="grid-template-columns:1fr 1fr">
    <div class="card glass"><h3>По категориям</h3>${byGroup.map(({ g, v }) => `<div class="cbar"><span class="n">${g.n}</span><div class="tr"><div class="bar" style="height:10px"><i style="width:${all ? v / all * 100 : 0}%;background:${g.c}"></i></div></div><span class="a">${rub(v)}</span></div>`).join('')}</div>
    <div class="card glass"><h3>По годам</h3>${Object.keys(years).sort().reverse().map(y => `<div class="cbar"><span class="n">${y}</span><div class="tr"><div class="bar" style="height:10px"><i style="width:${all ? years[y] / all * 100 : 0}%;background:#38bdf8"></i></div></div><span class="a">${rub(years[y])}</span></div>`).join('') || '<div class="empty">Нет данных</div>'}</div>
  </div>`;
}

/* ---------- настройки ---------- */
function settingsHtml(car) {
  const np = 'Notification' in window ? Notification.permission : 'unsupported';
  return `<div class="page-h"><h2>Настройки</h2></div>
  <div class="card glass"><h3>${ic('car', 22)} Автомобили</h3>
    ${S.cars.map(c => `<div class="set-row"><div class="l"><b>${esc(c.name)}</b>${c.id === car.id ? ' <span class="badge2 ok">выбран</span>' : ''}<small>${esc([c.subtitle, c.plate].filter(Boolean).join(' · '))}</small></div>
      ${c.id !== car.id ? `<button class="btn ghost" data-act="pick-car" data-id="${c.id}">Выбрать</button>` : ''}
      <button class="btn ghost" data-act="edit-car" data-id="${c.id}">${ic('edit', 16)} Изменить / фон</button>
      <button class="btn danger" data-act="del-car" data-id="${c.id}">${ic('trash', 16)}</button></div>`).join('')}
    <div class="set-row"><button class="btn primary" data-act="add-car">${ic('plus', 18)} Добавить автомобиль</button></div></div>
  <div class="card glass" style="margin-top:14px"><h3>${ic('bell', 22)} Уведомления</h3>
    <div class="set-row"><div class="l"><b>Уведомления в браузере</b><small>${np === 'granted' ? 'Включены — напомним при открытии приложения' : np === 'denied' ? 'Запрещены в настройках браузера' : np === 'unsupported' ? 'Не поддерживаются этим браузером' : 'Показываем сроки при открытии приложения'}</small></div>
      ${np === 'default' ? `<button class="btn primary" data-act="notif">Включить</button>` : ''}</div>
    <div class="set-row"><div class="l"><b>Серверные напоминания</b><small>Каждый день в 09:00 сервер PocketBase шлёт e-mail и/или push (ntfy) — даже если приложение закрыто. Настройка описана в README.</small></div></div></div>
  <div class="card glass" style="margin-top:14px"><h3>Аккаунт</h3>
    <div class="set-row"><div class="l"><b>${esc(S.user?.email || '')}</b></div><button class="btn ghost" data-act="logout">${ic('exit', 18)} Выйти</button></div></div>`;
}

/* ================= формы ================= */
function fieldHtml(f, v) {
  const val = v ?? f.default ?? '';
  const cls = 'f' + (f.full ? ' full' : '') + (f.type === 'checkbox' ? ' chk' : '');
  const id = 'f_' + f.name;
  let inp;
  switch (f.type) {
    case 'select': inp = `<select id="${id}" name="${f.name}" ${f.required ? 'required' : ''}>${f.options.map(([k, n]) => `<option value="${k}" ${k === val ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`; break;
    case 'textarea': inp = `<textarea id="${id}" name="${f.name}" rows="3">${esc(val)}</textarea>`; break;
    case 'checkbox': inp = `<input id="${id}" type="checkbox" name="${f.name}" ${val ? 'checked' : ''}>`; break;
    case 'file': inp = `<input id="${id}" type="file" name="${f.name}" ${f.accept ? `accept="${f.accept}"` : ''} ${f.multiple ? 'multiple' : ''}>`; break;
    default: inp = `<input id="${id}" type="${f.type || 'text'}" name="${f.name}" value="${esc(String(val).slice(0, f.type === 'date' ? 10 : 999))}" ${f.required ? 'required' : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''} ${f.type === 'number' ? 'step="any" inputmode="decimal"' : ''}>`;
  }
  return f.type === 'checkbox'
    ? `<div class="${cls}">${inp}<label for="${id}">${esc(f.label)}</label></div>`
    : `<div class="${cls}"><label for="${id}">${esc(f.label)}</label>${inp}${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</div>`;
}
function modal({ title, fields, values = {}, submit = 'Сохранить', onSubmit }) {
  const el = document.createElement('div');
  el.className = 'modal-back';
  el.innerHTML = `<form class="modal glass"><div class="modal-h"><h3>${esc(title)}</h3><button type="button" class="icon-btn" data-close>${ic('x')}</button></div>
    <div class="modal-b">${fields.map(f => fieldHtml(f, values[f.name])).join('')}</div>
    <div class="modal-f"><button type="button" class="btn ghost" data-close>Отмена</button><button class="btn primary">${esc(submit)}</button></div></form>`;
  document.body.appendChild(el);
  el.addEventListener('mousedown', e => { if (e.target === el) el.remove(); });
  el.addEventListener('click', e => { if (e.target.closest('[data-close]')) el.remove(); });
  el.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target, fd = new FormData(form), btn = form.querySelector('.btn.primary');
    for (const [k, v] of [...fd.entries()]) if (v instanceof File && !v.name && !v.size) fd.delete(k);
    fields.filter(f => f.type === 'checkbox').forEach(f => fd.set(f.name, form.elements[f.name].checked ? 'true' : 'false'));
    btn.disabled = true;
    try { await onSubmit(fd); el.remove(); }
    catch (err) { toast(err.message, true); btn.disabled = false; }
  });
  const first = el.querySelector('input:not([type=file]),select'); if (first && window.innerWidth > 700) first.focus();
  return el;
}

/* --- автомобиль --- */
function carModal(car) {
  modal({
    title: car ? 'Изменить автомобиль' : 'Новый автомобиль',
    values: car || {},
    fields: [
      { name: 'name', label: 'Название', required: true, full: true, placeholder: 'Ford Focus 2' },
      { name: 'subtitle', label: 'Описание', full: true, placeholder: 'Седан 1.8 л, 125 л.с.' },
      { name: 'plate', label: 'Госномер', placeholder: 'А123АА116' },
      { name: 'year', label: 'Год выпуска', type: 'number' },
      { name: 'mileage', label: 'Пробег, км', type: 'number' },
      { name: 'vin', label: 'VIN' },
      { name: 'starline_device', label: 'StarLine: device_id', full: true, hint: 'Необязательно. Если указать, пробег и топливо будут обновляться из сигнализации раз в час' },
      { name: 'logo_preset', label: 'Логотип в меню', type: 'select', full: true, default: car?.logo_preset || '', options: [['', 'Автоматически по названию'], ...Object.entries(LOGOS), ['none', 'Без логотипа']] },
      { name: 'logo', label: 'Или свой логотип (PNG с прозрачным фоном)', type: 'file', accept: 'image/*', full: true, hint: 'Свой файл заменяет готовый логотип' },
      ...(car?.logo ? [{ name: 'clear_logo', label: 'Убрать свой логотип', type: 'checkbox', full: true }] : []),
      { name: 'background', label: 'Фоновое изображение автомобиля', type: 'file', accept: 'image/*', full: true, hint: 'Лучше всего подходит горизонтальное фото, до 15 МБ' },
      ...(car?.background ? [{ name: 'clear_bg', label: 'Убрать текущий фон', type: 'checkbox', full: true }] : []),
    ],
    onSubmit: async fd => {
      if (fd.get('clear_bg') === 'true') fd.set('background', '');
      fd.delete('clear_bg');
      if (fd.get('clear_logo') === 'true') fd.set('logo', '');
      fd.delete('clear_logo');
      if (car) { await update('cars', car.id, fd); }
      else { fd.set('owner', S.user.id); const r = await create('cars', fd); S.carId = r.id; localStorage.setItem('carId', r.id); S.view = 'home'; }
      toast('Сохранено'); await refresh();
    },
  });
}

/* --- запись --- */
function recModal(cat, rec) {
  const group = GROUPS.find(g => g.cats.includes(cat));
  const catOpts = group.cats.map(c => [c, CAT[c].n]);
  const fuel = cat === 'fuel';
  const fields = [
    { name: 'date', label: 'Дата', type: 'date', required: true, default: todayStr() },
    { name: 'mileage', label: 'Пробег, км', type: 'number', default: curCar()?.mileage || '' },
    ...(catOpts.length > 1 ? [{ name: 'category', label: 'Тип', type: 'select', options: catOpts, default: cat, full: true }] : []),
    ...(fuel ? [{ name: 'liters', label: 'Литров', type: 'number' }] : []),
    { name: 'amount', label: 'Сумма, ₽', type: 'number', required: true },
    { name: 'description', label: 'Описание', full: true, placeholder: fuel ? 'АИ-95, Лукойл' : cat === 'insurance' ? 'ОСАГО, 1 год' : cat === 'parts' ? 'Масляный фильтр' : 'Замена масла и фильтров' },
  ];
  modal({
    title: (rec ? 'Изменить: ' : 'Добавить: ') + group.n.toLowerCase(), fields, values: rec || {},
    onSubmit: async fd => {
      if (!fd.get('category')) fd.set('category', cat);
      if (rec) await update('records', rec.id, fd);
      else { fd.set('car', curCar().id); await create('records', fd); }
      const m = +fd.get('mileage');
      if (m > (curCar().mileage || 0)) await update('cars', curCar().id, { mileage: m });
      toast('Запись сохранена'); await refresh();
    },
  });
}

/* --- документ --- */
function docModal(doc) {
  modal({
    title: doc ? 'Изменить документ' : 'Загрузить документ', values: doc || { remind_days: 30 },
    fields: [
      { name: 'type', label: 'Тип документа', type: 'select', options: Object.entries(DOC), required: true, full: true },
      { name: 'title', label: 'Название / номер', full: true, placeholder: 'ОСАГО РЕСО, полис № …' },
      { name: 'expires', label: 'Действует до', type: 'date', hint: 'Для ПТС и СТС можно оставить пустым' },
      { name: 'remind_days', label: 'Напомнить за (дней)', type: 'number', hint: 'Затем напомним ещё за 14, 7, 3 и 1 день' },
      { name: doc ? 'files+' : 'files', label: doc ? 'Добавить файлы' : 'Файлы (фото или PDF)', type: 'file', accept: 'image/*,application/pdf', multiple: true, full: true, hint: 'Можно выбрать несколько — например, обе стороны документа' },
    ],
    onSubmit: async fd => {
      if (doc) await update('documents', doc.id, fd);
      else { fd.set('car', curCar().id); await create('documents', fd); }
      toast('Документ сохранён'); await refresh();
    },
  });
}

/* --- напоминание --- */
function remModal(rem) {
  modal({
    title: rem ? 'Изменить напоминание' : 'Новое напоминание', values: rem || { remind_days: 7 },
    fields: [
      { name: 'title', label: 'Что напомнить', required: true, full: true, placeholder: 'Замена масла' },
      { name: 'due', label: 'Дата', type: 'date' },
      { name: 'remind_days', label: 'Напомнить за (дней)', type: 'number' },
      { name: 'due_mileage', label: 'Или при пробеге, км', type: 'number', full: true, hint: `Текущий пробег: ${num(curCar()?.mileage)} км. Напомним за 500 км.` },
      { name: 'note', label: 'Заметка', full: true },
    ],
    onSubmit: async fd => {
      if (!fd.get('due') && !+fd.get('due_mileage')) throw new Error('Укажите дату или пробег');
      if (rem) await update('reminders', rem.id, fd);
      else { fd.set('car', curCar().id); fd.set('done', 'false'); await create('reminders', fd); }
      toast('Напоминание сохранено'); await refresh();
    },
  });
}

/* ================= события ================= */
const A = {
  nav: el => { S.view = el.dataset.v; render(); window.scrollTo(0, 0); },
  tab: el => { S.authTab = el.dataset.v; render(); },
  logout: () => { if (confirm('Выйти из аккаунта?')) logout(); },
  'add-car': () => carModal(),
  'edit-car': el => carModal(S.cars.find(c => c.id === el.dataset.id)),
  'pick-car': async el => { S.carId = el.dataset.id; localStorage.setItem('carId', S.carId); S.view = 'home'; await refresh(); },
  'del-car': async el => {
    const c = S.cars.find(x => x.id === el.dataset.id);
    if (!confirm(`Удалить «${c.name}» со всеми записями, документами и напоминаниями? Это необратимо.`)) return;
    try { await remove('cars', c.id); toast('Автомобиль удалён'); await refresh(); } catch (e) { toast(e.message, true); }
  },
  'add-rec': el => recModal(el.dataset.cat),
  'edit-rec': el => { const r = S.records.find(x => x.id === el.dataset.id); recModal(r.category, r); },
  'del-rec': async el => { if (!confirm('Удалить запись?')) return; try { await remove('records', el.dataset.id); await refresh(); } catch (e) { toast(e.message, true); } },
  'add-doc': () => docModal(),
  'edit-doc': el => docModal(S.docs.find(x => x.id === el.dataset.id)),
  'del-doc': async el => { if (!confirm('Удалить документ вместе с файлами?')) return; try { await remove('documents', el.dataset.id); await refresh(); } catch (e) { toast(e.message, true); } },
  'open-file': async el => {
    const d = S.docs.find(x => x.id === el.dataset.id);
    const w = window.open('', '_blank');
    try { const t = await fileToken(); const u = fileUrl(d, el.dataset.f, t); if (w) w.location = u; else location.href = u; }
    catch (e) { if (w) w.close(); toast(e.message, true); }
  },
  'del-file': async el => {
    if (!confirm('Удалить этот файл?')) return;
    try { await update('documents', el.dataset.id, { 'files-': [el.dataset.f] }); await refresh(); } catch (e) { toast(e.message, true); }
  },
  'add-rem': () => remModal(),
  'edit-rem': el => remModal(S.rems.find(x => x.id === el.dataset.id)),
  'del-rem': async el => { if (!confirm('Удалить напоминание?')) return; try { await remove('reminders', el.dataset.id); await refresh(); } catch (e) { toast(e.message, true); } },
  'toggle-rem': async el => { const r = S.rems.find(x => x.id === el.dataset.id); try { await update('reminders', r.id, { done: !r.done }); await refresh(); } catch (e) { toast(e.message, true); } },
  'sync-sl': async el => {
    el.disabled = true;
    try {
      const r = await api('/starline/sync', { method: 'POST' });
      const bad = (r.results || []).find(x => x.error);
      if (bad) throw new Error(bad.error);
      toast('Данные обновлены'); await refresh();
    } catch (e) { toast('StarLine: ' + e.message, true); el.disabled = false; }
  },
  notif: async () => { try { await Notification.requestPermission(); } catch (_) {} render(); notifyDue(); },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el && A[el.dataset.act]) { e.preventDefault(); A[el.dataset.act](el); }
});
document.addEventListener('change', async e => {
  const t = e.target;
  if (t.dataset.change === 'car') { S.carId = t.value; localStorage.setItem('carId', S.carId); await refresh(); }
  if (t.dataset.change === 'period') { S.period = t.value; render(); }
});
document.addEventListener('submit', async e => {
  if (e.target.dataset.form !== 'auth') return;
  e.preventDefault();
  const fd = new FormData(e.target), email = fd.get('email'), password = fd.get('password');
  const btn = e.target.querySelector('.btn.primary'); btn.disabled = true;
  try {
    if (S.authTab === 'reg') {
      if (password !== fd.get('passwordConfirm')) throw new Error('Пароли не совпадают');
      await api('/collections/users/records', { method: 'POST', body: { email, password, passwordConfirm: password } });
    }
    saveAuth(await api('/collections/users/auth-with-password', { method: 'POST', body: { identity: email, password } }));
    await refresh();
  } catch (err) { toast(err.message, true); btn.disabled = false; }
});

/* ================= старт ================= */
(async function init() {
  render();
  if (S.token) {
    try { saveAuth(await api('/collections/users/auth-refresh', { method: 'POST' })); await refresh(); }
    catch (_) { if (S.token) render(); }
  }
  setInterval(() => { if (S.token && !document.hidden && !document.querySelector('.modal-back')) refresh(); }, 5 * 60 * 1000);
})();
})();
