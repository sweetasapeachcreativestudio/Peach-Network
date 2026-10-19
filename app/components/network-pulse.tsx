import Link from "next/link";
import { NETWORK_UPDATES } from "@/lib/network-feed";
import PeachMascot from "./peach-mascot";

export default function NetworkPulse({ role = "business" }: { role?: "business" | "creative" }) {
  const items = role === "creative" ? NETWORK_UPDATES.filter((x) => x.type !== "launch") : NETWORK_UPDATES;
  return (
    <section className="network-pulse">
      <div className="pulse-head">
        <div>
          <span className="eyebrow">AROUND THE NETWORK</span>
          <h2>Peach Pulse</h2>
          <p>Launches, opportunities and the useful stuff happening inside Peach.</p>
        </div>
        <PeachMascot compact note="Good ideas find good people." />
      </div>
      <div className="pulse-grid">
        {items.map((item) => (
          <Link href={item.href} className="pulse-card" key={item.title}>
            <span className={`pulse-date ${item.type}`}>{item.date}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <strong>Explore →</strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
