/// <reference path="../pb_data/types.d.ts" />
// Ежедневные напоминания о сроках документов и задачах (PocketBase v0.23+).
// Отправка: e-mail владельцу (нужен SMTP в Settings → Mail) и/или push через ntfy,
// если задана переменная окружения NTFY_URL, например https://ntfy.sh/my-secret-topic

cronAdd("carJournalReminders", "0 9 * * *", () => {
  const today = new Date().toISOString().slice(0, 10);
  const dayMs = 86400000;
  const daysLeft = (s) =>
    Math.round((new Date(s.slice(0, 10) + "T00:00:00Z") - new Date(today + "T00:00:00Z")) / dayMs);

  // Напоминаем в день порога, затем за 14/7/3/1 день, в день срока и раз в неделю после просрочки
  const shouldNotify = (left, threshold) => {
    if (left > threshold) return false;
    if (left < 0) return left % 7 === 0;
    return left === threshold || [14, 7, 3, 1, 0].indexOf(left) !== -1;
  };

  const DOC = { sts: "СТС", pts: "ПТС", license: "Водительское удостоверение", insurance: "Страховка", other: "Документ" };
  const perOwner = {}; // ownerId -> { email, lines: [] }
  const touched = [];

  const collect = (rec, text) => {
    const car = $app.findRecordById("cars", rec.getString("car"));
    const ownerId = car.getString("owner");
    if (!perOwner[ownerId]) {
      const u = $app.findRecordById("users", ownerId);
      perOwner[ownerId] = { email: u.email(), lines: [] };
    }
    perOwner[ownerId].lines.push(car.getString("name") + ": " + text);
    touched.push(rec);
  };

  try {
    // Документы
    const docs = $app.findRecordsByFilter("documents", "expires != ''", "", 1000, 0);
    docs.forEach((d) => {
      if (d.getString("notified_on") === today) return;
      const left = daysLeft(d.getString("expires"));
      const th = d.getInt("remind_days") || 30;
      if (!shouldNotify(left, th)) return;
      const name = (DOC[d.getString("type")] || "Документ") + (d.getString("title") ? " (" + d.getString("title") + ")" : "");
      const when = left < 0 ? "просрочено на " + -left + " дн." : left === 0 ? "срок истекает сегодня" : "осталось " + left + " дн.";
      collect(d, name + " — " + when);
    });

    // Напоминания по дате
    const rems = $app.findRecordsByFilter("reminders", "done = false && due != ''", "", 1000, 0);
    rems.forEach((r) => {
      if (r.getString("notified_on") === today) return;
      const left = daysLeft(r.getString("due"));
      const th = r.getInt("remind_days") || 7;
      if (!shouldNotify(left, th)) return;
      const when = left < 0 ? "просрочено на " + -left + " дн." : left === 0 ? "сегодня" : "через " + left + " дн.";
      collect(r, r.getString("title") + " — " + when);
    });
  } catch (e) {
    console.log("car-journal reminders: " + e);
    return;
  }

  const ntfyUrl = $os.getenv("NTFY_URL");
  Object.keys(perOwner).forEach((id) => {
    const { email, lines } = perOwner[id];
    const text = lines.join("\n");

    try {
      const meta = $app.settings().meta;
      $app.newMailClient().send(new MailerMessage({
        from: { address: meta.senderAddress, name: meta.senderName },
        to: [{ address: email }],
        subject: "Автожурнал: напоминания (" + lines.length + ")",
        html: "<p>" + lines.map((l) => l.replace(/</g, "&lt;")).join("</p><p>") + "</p>",
      }));
    } catch (e) {
      console.log("car-journal mail: " + e);
    }

    if (ntfyUrl) {
      try {
        $http.send({ url: ntfyUrl, method: "POST", body: "Автожурнал\n" + text, timeout: 15 });
      } catch (e) {
        console.log("car-journal ntfy: " + e);
      }
    }
  });

  touched.forEach((rec) => {
    try {
      rec.set("notified_on", today);
      $app.save(rec);
    } catch (e) {
      console.log("car-journal save: " + e);
    }
  });
});
