"use client";

import { useEffect, useState } from "react";

export default function BrandSplash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setShow(false), 2650);
    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="brand-splash v12-splash" aria-hidden="true">
      <div className="v12-splash-stage">
        <div className="v12-wordmark">
          <span className="v12-side v12-pe">PE</span>
          <span className="v12-a-mark">
            <span className="v12-a-left" />
            <span className="v12-a-right" />
            <i className="v12-a-bar v12-bar-1" />
            <i className="v12-a-bar v12-bar-2" />
            <i className="v12-a-bar v12-bar-3" />
          </span>
          <span className="v12-side v12-ch">CH</span>
        </div>
        <div className="v12-network-word">NETWORK</div>
        <p>Good ideas find good people.</p>
      </div>
    </div>
  );
}
