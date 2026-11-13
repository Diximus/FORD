/// <reference path="../pb_data/types.d.ts" />
// Состояние автомобиля из StarLine: АКБ, баланс SIM, температуры.
migrate((app) => {
  const cars = app.findCollectionByNameOrId("cars");
  ["battery", "balance", "temp_cabin", "temp_engine"].forEach((n) => cars.fields.add(new NumberField({ name: n })));
  app.save(cars);
}, (app) => {
  const cars = app.findCollectionByNameOrId("cars");
  ["battery", "balance", "temp_cabin", "temp_engine"].forEach((n) => cars.fields.removeByName(n));
  app.save(cars);
});
