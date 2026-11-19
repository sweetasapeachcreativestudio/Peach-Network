"use client";

import React from "react";

interface LogoutButtonProps {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function LogoutButton({ label = "Log out", className, style }: LogoutButtonProps) {
  function clearClientAuth() {
    try {
      window.localStorage.removeItem("peach_session");
      window.localStorage.removeItem("peach_role");
    } catch {}
  }

  return (
    <form action="/auth/signout" method="post" onSubmit={clearClientAuth} style={{ margin: 0 }}>
      <button type="submit" className={className} style={style}>
        {label}
      </button>
    </form>
  );
}
