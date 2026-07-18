self.addEventListener("install", (event) => {
  const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, "");
  const withScope = (path) => `${scopePath}${path}`;

  event.waitUntil(
    caches
      .open("plantcare-calendar-v1")
      .then((cache) => cache.addAll([withScope("/"), withScope("/es/"), withScope("/en/"), withScope("/manifest.webmanifest")]))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
