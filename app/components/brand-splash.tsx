"use client";
import { useEffect, useState } from "react";

export default function BrandSplash() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!sessionStorage.getItem("peach-splash-seen-v112")) {
        setShow(true);
        sessionStorage.setItem("peach-splash-seen-v112", "1");
        const t = setTimeout(() => setShow(false), 2850);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);
  if (!show) return null;

  return (
    <div className="brand-splash v112" aria-hidden="true">
      <div className="splash-stage">
        <div className="splash-build">
          <span className="splash-pe">PE</span>
          <span className="splash-a-build"><i/><i/><i/></span>
          <span className="splash-ch">CH</span>
        </div>
        <div className="splash-network-word">NETWORK</div>
        <div className="splash-tagline">Good ideas find good people.</div>
        <img className="splash-real-logo" src="/brand/peach-network-logo.png" alt="" />
      </div>
    </div>
  );
}
