/// <reference path="../pb_data/types.d.ts" />
// Требуется PocketBase v0.23 или новее.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  const created = { type: "autodate", name: "created", onCreate: true };
  const updated = { type: "autodate", name: "updated", onCreate: true, onUpdate: true };

  // ---------- Автомобили ----------
  const cars = new Collection({
    type: "base",
    name: "cars",
    listRule: "owner = @request.auth.id",
    viewRule: "owner = @request.auth.id",
    createRule: "@request.auth.id != '' && @request.body.owner = @request.auth.id",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id",
    fields: [
      { type: "relation", name: "owner", required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: true },
      { type: "text", name: "name", required: true },
      { type: "text", name: "subtitle" },
      { type: "number", name: "year" },
      { type: "text", name: "plate" },
      { type: "text", name: "vin" },
      { type: "number", name: "mileage" },
      {
        type: "file", name: "background", maxSelect: 1, maxSize: 15 * 1024 * 1024,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
      },
      created, updated,
    ],
  });
  app.save(cars);

  const own = "car.owner = @request.auth.id";
  const ownCreate = "@request.auth.id != '' && @request.body.car.owner = @request.auth.id";
  const rules = {
    listRule: own, viewRule: own, createRule: ownCreate, updateRule: own, deleteRule: own,
  };

  // ---------- Записи расходов ----------
  app.save(new Collection({
    type: "base",
    name: "records",
    ...rules,
    fields: [
      { type: "relation", name: "car", required: true, collectionId: cars.id, maxSelect: 1, cascadeDelete: true },
      { type: "select", name: "category", required: true, maxSelect: 1, values: ["fuel", "service", "repair", "insurance", "parts"] },
      { type: "date", name: "date", required: true },
      { type: "number", name: "mileage" },
      { type: "number", name: "liters" },
      { type: "text", name: "description" },
      { type: "number", name: "amount" },
      created, updated,
    ],
  }));

  // ---------- Документы (СТС, ПТС, права, страховка) ----------
  app.save(new Collection({
    type: "base",
    name: "documents",
    ...rules,
    fields: [
      { type: "relation", name: "car", required: true, collectionId: cars.id, maxSelect: 1, cascadeDelete: true },
      { type: "select", name: "type", required: true, maxSelect: 1, values: ["sts", "pts", "license", "insurance", "other"] },
      { type: "text", name: "title" },
      { type: "file", name: "files", maxSelect: 10, maxSize: 25 * 1024 * 1024, protected: true },
      { type: "date", name: "expires" },
      { type: "number", name: "remind_days" },
      { type: "text", name: "notified_on" },
      created, updated,
    ],
  }));

  // ---------- Напоминания ----------
  app.save(new Collection({
    type: "base",
    name: "reminders",
    ...rules,
    fields: [
      { type: "relation", name: "car", required: true, collectionId: cars.id, maxSelect: 1, cascadeDelete: true },
      { type: "text", name: "title", required: true },
      { type: "date", name: "due" },
      { type: "number", name: "due_mileage" },
      { type: "number", name: "remind_days" },
      { type: "text", name: "note" },
      { type: "bool", name: "done" },
      { type: "text", name: "notified_on" },
      created, updated,
    ],
  }));
}, (app) => {
  for (const n of ["reminders", "documents", "records", "cars"]) {
    try { app.delete(app.findCollectionByNameOrId(n)); } catch (_) {}
  }
});
