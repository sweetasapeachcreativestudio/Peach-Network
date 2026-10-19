import type { ReactNode } from "react";

export function Icon({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return <span className="icon-shell" style={{ width: size + 14, height: size + 14 }}>{children}</span>;
}

const svgProps = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const HomeIcon = () => <svg {...svgProps}><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9 21v-6h6v6"/></svg>;
export const FolderIcon = () => <svg {...svgProps}><path d="M3 6h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>;
export const MessageIcon = () => <svg {...svgProps}><path d="M4 5h16v11H9l-5 4Z"/><path d="M8 9h8M8 12h5"/></svg>;
export const WalletIcon = () => <svg {...svgProps}><path d="M4 7h15a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3h12"/><path d="M16 11h5v4h-5a2 2 0 1 1 0-4Z"/></svg>;
export const UserIcon = () => <svg {...svgProps}><circle cx="12" cy="8" r="4"/><path d="M4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6"/></svg>;
export const BellIcon = () => <svg {...svgProps}><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7"/><path d="M10 20h4"/></svg>;
export const SparkIcon = () => <svg {...svgProps}><path d="m12 2 1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9Z"/></svg>;
export const ArrowIcon = () => <svg {...svgProps}><path d="M5 12h14M14 7l5 5-5 5"/></svg>;
export const CameraIcon = () => <svg {...svgProps}><path d="M4 7h4l2-2h4l2 2h4v12H4Z"/><circle cx="12" cy="13" r="3.5"/></svg>;
export const VideoIcon = () => <svg {...svgProps}><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></svg>;
export const PenIcon = () => <svg {...svgProps}><path d="m4 20 4.5-1 9.8-9.8-3.5-3.5L5 15.5Z"/><path d="m13.8 6.7 3.5 3.5"/></svg>;
export const GlobeIcon = () => <svg {...svgProps}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>;
export const PaletteIcon = () => <svg {...svgProps}><path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="9" cy="6.5" r="1"/><circle cx="14" cy="6.5" r="1"/></svg>;
export const CheckIcon = () => <svg {...svgProps}><path d="m5 12 4 4 10-10"/></svg>;
export const ClockIcon = () => <svg {...svgProps}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
export const CoinsIcon = () => <svg {...svgProps}><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></svg>;
