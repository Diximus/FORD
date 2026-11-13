// Работа с StarLine API: вход и чтение obd_params (пробег, топливо).
// Переменные окружения: STARLINE_APP_ID, STARLINE_SECRET, STARLINE_LOGIN, STARLINE_PASS

const ID = "https://id.starline.ru/apiV3";
const DEV = "https://developer.starline.ru/json/v2";

// SHA-1 (в $security его нет, а StarLine требует sha1 от пароля)
function sha1(str) {
  const e = unescape(encodeURIComponent(str));
  const b = [];
  for (let i = 0; i < e.length; i++) b.push(e.charCodeAt(i));
  const len = b.length;
  b.push(0x80);
  while (b.length % 64 !== 56) b.push(0);
  const bits = len * 8, hi = Math.floor(bits / 4294967296), lo = bits >>> 0;
  [hi, lo].forEach((n) => { for (let i = 3; i >= 0; i--) b.push((n >>> (i * 8)) & 0xff); });
  const rotl = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;
  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
  for (let o = 0; o < b.length; o += 64) {
    const w = [];
    for (let i = 0; i < 16; i++) w[i] = ((b[o + 4 * i] << 24) | (b[o + 4 * i + 1] << 16) | (b[o + 4 * i + 2] << 8) | b[o + 4 * i + 3]) >>> 0;
    for (let i = 16; i < 80; i++) w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    let a = h0, bb = h1, c = h2, d = h3, ee = h4;
    for (let i = 0; i < 80; i++) {
      let f, k;
      if (i < 20) { f = (bb & c) | (~bb & d); k = 0x5A827999; }
      else if (i < 40) { f = bb ^ c ^ d; k = 0x6ED9EBA1; }
      else if (i < 60) { f = (bb & c) | (bb & d) | (c & d); k = 0x8F1BBCDC; }
      else { f = bb ^ c ^ d; k = 0xCA62C1D6; }
      const t = (rotl(a, 5) + (f >>> 0) + ee + k + w[i]) >>> 0;
      ee = d; d = c; c = rotl(bb, 30); bb = a; a = t;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + bb) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + ee) >>> 0;
  }
  return [h0, h1, h2, h3, h4].map((x) => ("00000000" + x.toString(16)).slice(-8)).join("");
}

function form(o) {
  return Object.keys(o).map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(o[k])).join("&");
}
function must(res, what) {
  if (res.statusCode !== 200) throw new Error(what + ": HTTP " + res.statusCode);
  return res.json;
}

function login() {
  const appId = $os.getenv("STARLINE_APP_ID");
  const secret = $os.getenv("STARLINE_SECRET");
  const user = $os.getenv("STARLINE_LOGIN");
  const pass = $os.getenv("STARLINE_PASS");
  if (!appId || !secret || !user || !pass) throw new Error("не заданы переменные STARLINE_*");

  let r = must($http.send({
    url: ID + "/application/getCode/?" + form({ appId: appId, secret: $security.md5(secret) }),
    method: "GET", timeout: 30,
  }), "getCode");
  const code = r.desc.code;

  r = must($http.send({
    url: ID + "/application/getToken/?" + form({ appId: appId, secret: $security.md5(secret + code) }),
    method: "GET", timeout: 30,
  }), "getToken");
  const appToken = r.desc.token;

  r = must($http.send({
    url: ID + "/user/login/", method: "POST", timeout: 30,
    headers: { "Content-Type": "application/x-www-form-urlencoded", token: appToken },
    body: form({ login: user, pass: sha1(pass) }),
  }), "login");
  if (r.state !== 1) throw new Error("вход не удался");
  const slid = r.desc.user_token;

  const res = $http.send({
    url: DEV + "/auth.slid", method: "POST", timeout: 30,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slid_token: slid }),
  });
  must(res, "auth.slid");
  let slnet = res.cookies && res.cookies["slnet"] ? res.cookies["slnet"].value : "";
  if (!slnet) {
    const sc = [].concat((res.headers && (res.headers["set_cookie"] || res.headers["Set-Cookie"])) || []);
    sc.forEach((c) => { const m = String(c).match(/slnet=([^;]+)/); if (m) slnet = m[1]; });
  }
  if (!slnet) throw new Error("нет сессии slnet");
  return "slnet=" + slnet;
}

function obdParams(cookie, deviceId) {
  const r = must($http.send({
    url: DEV + "/device/" + encodeURIComponent(deviceId) + "/obd_params",
    method: "GET", timeout: 30, headers: { Cookie: cookie },
  }), "obd_params");
  return r.obd_params || {};
}

function infoOf(cookie, deviceId) {
  const r = must($http.send({
    url: DEV + "/device/" + encodeURIComponent(deviceId) + "/info",
    method: "GET", timeout: 30, headers: { Cookie: cookie },
  }), "info");
  return r.info || {};
}

// Обновляет пробег и топливо у машин с заполненным starline_device.
// ownerId — ограничить машинами одного пользователя (для ручной кнопки).
function syncAll(ownerId) {
  const cars = ownerId
    ? $app.findRecordsByFilter("cars", "starline_device != '' && owner = {:o}", "", 100, 0, { o: ownerId })
    : $app.findRecordsByFilter("cars", "starline_device != ''", "", 100, 0);
  if (!cars.length) return [];
  const cookie = login();
  const out = [];
  cars.forEach((car) => {
    try {
      const p = obdParams(cookie, car.getString("starline_device"));
      const km = p.mileage && Number(p.mileage.val);
      const fuel = p.fuel && Number(p.fuel.val);
      let changed = false;
      // пробег только растёт: защита от сбоев и сброса данных
      if (km > 0 && km > car.getFloat("mileage")) { car.set("mileage", Math.round(km)); changed = true; }
      if (fuel >= 0 && fuel <= 100 && fuel !== car.getFloat("fuel_level")) { car.set("fuel_level", fuel); changed = true; }
      // состояние: АКБ, баланс SIM, температуры (необязательно, сбой не мешает пробегу)
      try {
        const inf = infoOf(cookie, car.getString("starline_device"));
        const num = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
        const bal = inf.balance && inf.balance.active ? num(inf.balance.active.value) : NaN;
        [["battery", num(inf.battery)], ["balance", bal], ["temp_cabin", num(inf.ctemp)], ["temp_engine", num(inf.etemp)]]
          .forEach((x) => { if (isFinite(x[1])) car.set(x[0], x[1]); });
      } catch (e) {
        console.log("starline info: " + e);
      }
      car.set("mileage_synced", new Date().toISOString());
      $app.save(car);
      out.push({ car: car.getString("name"), mileage: km, fuel: fuel, changed: changed });
    } catch (e) {
      out.push({ car: car.getString("name"), error: String(e) });
    }
  });
  return out;
}

module.exports = { syncAll };
