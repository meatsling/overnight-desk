/* sw.js — service worker: web push display + minimal shell cache. Stub (STEP 4). */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  const d = e.data ? e.data.json() : { title: "Desk", body: "" };
  e.waitUntil(self.registration.showNotification(d.title || "Desk", { body: d.body || "", icon: "icons/icon-192.png" }));
});
