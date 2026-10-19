import Link from "next/link";

export function PeachBrand({ full = false, href = "/" }: { full?: boolean; href?: string }) {
  return (
    <Link href={href} className={`peach-brand ${full ? "peach-brand-full" : "peach-brand-compact"}`} aria-label="Peach Network home">
      <img
        src={full ? "/brand/peach-network-logo.png" : "/brand/peach-wordmark.png"}
        alt="Peach Network"
      />
    </Link>
  );
}

export function PoweredBy() {
  return (
    <div className="powered-by">
      Powered by <strong>Sweet As A Peach Creative Agency</strong>
    </div>
  );
}
