/// <reference path="../pb_data/types.d.ts" />
// Поля для синхронизации пробега и топлива из StarLine.
migrate((app) => {
  const cars = app.findCollectionByNameOrId("cars");
  cars.fields.add(new TextField({ name: "starline_device" }));
  cars.fields.add(new NumberField({ name: "fuel_level" }));
  cars.fields.add(new TextField({ name: "mileage_synced" }));
  app.save(cars);
}, (app) => {
  const cars = app.findCollectionByNameOrId("cars");
  ["starline_device", "fuel_level", "mileage_synced"].forEach((n) => cars.fields.removeByName(n));
  app.save(cars);
});
