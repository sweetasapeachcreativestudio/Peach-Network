import type { ReactNode } from "react";
import "./globals.css";
import PWARegister from "./pwa-register";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peach Network",
  description: "Vetted creative talent, matched to the work that needs them.",
  applicationName: "Peach Network",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
