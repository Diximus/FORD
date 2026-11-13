/// <reference path="../pb_data/types.d.ts" />
// Раз в час подтягивает пробег и топливо из StarLine.
cronAdd("starlineSync", "17 * * * *", () => {
  try {
    const res = require(`${__hooks}/starline_lib.js`).syncAll();
    res.forEach((r) => { if (r.error) console.log("starline: " + r.car + ": " + r.error); });
  } catch (e) {
    console.log("starline sync: " + e);
  }
});

// Кнопка «Обновить» в приложении.
routerAdd("POST", "/api/starline/sync", (e) => {
  try {
    const res = require(`${__hooks}/starline_lib.js`).syncAll(e.auth.id);
    return e.json(200, { results: res });
  } catch (err) {
    return e.json(500, { message: String(err) });
  }
}, $apis.requireAuth());
