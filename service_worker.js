const CACHE_NAME = "cryptocache-v4";
const urlsToCache = [
  "/encrypt-decrypt/",  
  "/encrypt-decrypt/index.html",
  "/encrypt-decrypt/main.dart.js",
  "/encrypt-decrypt/flutter.js",
  "/encrypt-decrypt/favicon.png", // Example asset (Make sure it exists)
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url, { mode: "no-cors" });
          if (!response.ok && response.type !== "opaque") {
            throw new Error(`Failed to fetch ${url}: ${response.status}`);
          }
          await cache.put(url, response);
          console.log(`✅ Cached: ${url}`);
        } catch (error) {
          console.error(`❌ Cache failed: ${url}`, error);
        }
      }
    })()
  );
});

// Activate event: Remove old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log(`🗑 Deleting old cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: Serve from cache or fetch from network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch((error) => {
      console.error("❌ Fetch error:", error);
      return new Response("Network error occurred", {
        status: 408,
        statusText: "Network Timeout",
      });
    })
  );
});
