import Link from "next/link";
import { PeachBrand, PoweredBy } from "../components/brand";
import PeachMascot from "../components/peach-mascot";
import { ArrowIcon } from "../components/icons";
import { NETWORK_UPDATES } from "@/lib/network-feed";

const events = [
  { date: "SEP 18", title: "Peach Network Membership Opening", type: "Network", text: "A first look at Peach Coin plans, Peach Match and the new way businesses can work with the network." },
  { date: "COMING", title: "Peach Creative Meetup", type: "Community", text: "A casual gathering for creatives and business owners to meet, talk shop and make useful connections." },
  { date: "COMING", title: "Portfolio + Career Workshop", type: "Peach Academy", text: "Practical portfolio feedback, career guidance and a chance to learn from other creatives in the network." },
];

export default function NetworkPage() {
  return <main className="v12-network-page">
    <header className="v12-public-header"><PeachBrand full/><nav><Link href="/">Home</Link><Link href="/network">Events + News</Link><Link href="/auth?role=creative&mode=signup">For Creatives</Link></nav><div className="v12-header-actions"><Link href="/auth?mode=signin" className="v12-signin">Sign In</Link><Link href="/auth?role=business&mode=signup" className="btn btn-dark btn-small">Join Peach</Link></div></header>

    <section className="v12-network-hero">
      <div><span className="eyebrow">PEACH PULSE</span><h1>What’s happening around the Network.</h1><p>Events, education, new opportunities and member stories — without making the app feel noisy.</p></div>
      <div className="v12-network-hero-photo"><img src="/people/network-hero.jpg" alt="Happy creative community members together"/><div>come for the work.<br/>stay for the people. ♡</div></div>
    </section>

    <section className="v12-events-section"><div className="v12-section-title"><span className="eyebrow">UPCOMING</span><h2>Events + learning</h2></div><div className="v12-event-grid">{events.map(event => <article key={event.title}><span>{event.date}</span><small>{event.type}</small><h3>{event.title}</h3><p>{event.text}</p><button className="text-link" type="button">Details coming soon</button></article>)}</div></section>

    <section className="v12-news-section"><div className="v12-section-title"><span className="eyebrow">NETWORK NEWS</span><h2>The latest from Peach</h2></div><div className="v12-news-list">{NETWORK_UPDATES.map(item => <Link href={item.href} className="v12-news-row" key={item.title}><span>{item.date}</span><div><strong>{item.title}</strong><p>{item.body}</p></div><ArrowIcon/></Link>)}</div></section>

    <section className="v12-network-cta"><div><span className="eyebrow">A LITTLE PEACH ENERGY</span><h2>Good ideas find good people.</h2><p>The network should help you find work — and also give you people worth knowing.</p></div><PeachMascot note="More people. More possibility. Less weird bidding. 🍑"/></section>
    <footer className="public-footer"><PeachBrand full/><PoweredBy/><div className="footer-links"><Link href="/">Home</Link><Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link></div></footer>
  </main>
}
