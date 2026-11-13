/// <reference path="../pb_data/types.d.ts" />
// Добавляет автомобилям логотип: готовый (logo_preset) или свой файл (logo).
migrate((app) => {
  const cars = app.findCollectionByNameOrId("cars");
  cars.fields.add(new TextField({ name: "logo_preset" }));
  cars.fields.add(new FileField({
    name: "logo", maxSelect: 1, maxSize: 5 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
  }));
  app.save(cars);
}, (app) => {
  const cars = app.findCollectionByNameOrId("cars");
  cars.fields.removeByName("logo_preset");
  cars.fields.removeByName("logo");
  app.save(cars);
});
