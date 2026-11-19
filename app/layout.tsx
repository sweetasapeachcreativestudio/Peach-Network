import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import PWARegister from "./pwa-register";
import type { Metadata } from "next";
import BrandSplash from "./components/brand-splash";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Peach Network",
  description: "On-demand creative platform connecting businesses with vetted local commercial designers. Operated by Sweet As A Peach Creative Agency in Birmingham, Alabama.",
  applicationName: "Peach Network",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable} suppressHydrationWarning>
      <body className={plusJakarta.className} suppressHydrationWarning>
        <BrandSplash />
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
