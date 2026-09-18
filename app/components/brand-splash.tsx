"use client";

import { useEffect, useState } from "react";

export default function BrandSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2550);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="brand-splash pn-splash" aria-hidden="true">
      <div className="pn-splash-fruit">
        <span className="pn-peach-shape" />
        <span className="pn-leaf-shape" />
      </div>
      <div className="pn-splash-lockup">
        <div className="pn-splash-word">
          <span>PE</span>
          <span className="pn-splash-a">
            <i />
            <i />
          </span>
          <span>CH</span>
        </div>
        <div className="pn-splash-network">NETWORK</div>
        <p>Good ideas find good people.</p>
        <div className="pn-splash-progress">
          <span />
        </div>
      </div>
    </div>
  );
}
