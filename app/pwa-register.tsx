"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // Installation is optional; app still works as a normal website.
        });
      } else {
        // In development / preview, proactively unregister any stale service workers
        // and clear old caches to avoid serving mismatched JS chunks
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister().catch(() => {});
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key).catch(() => {});
            }
          });
        }
      }
    }
  }, []);

  return null;
}
