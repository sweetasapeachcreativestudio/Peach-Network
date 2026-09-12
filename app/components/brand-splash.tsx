"use client";

import { useEffect, useState } from "react";

export default function BrandSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("peach-splash-seen");
      if (!seen) {
        setShow(true);
        sessionStorage.setItem("peach-splash-seen", "1");
        const timer = window.setTimeout(() => setShow(false), 1900);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // sessionStorage can be unavailable in strict browser modes.
    }
  }, []);

  if (!show) return null;

  return (
    <div className="brand-splash" aria-hidden="true">
      <div className="brand-splash-inner">
        <div className="splash-bars">
          <span />
          <span />
          <span />
        </div>
        <img src="/brand/peach-network-logo.png" alt="" className="splash-logo" />
      </div>
    </div>
  );
}
