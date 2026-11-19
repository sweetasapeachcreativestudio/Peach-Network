"use client";

import React, { useState } from "react";

export function SidebarAvatar({
  logoUrl,
  label,
}: {
  logoUrl?: string | null;
  label: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = (label?.trim()?.[0] || "P").toUpperCase();

  if (logoUrl && !imageFailed) {
    return (
      <span className="peach-user-avatar">
        <img
          src={logoUrl}
          alt={label}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className="peach-user-avatar peach-user-initial" aria-hidden="true">
      {initial}
    </span>
  );
}
