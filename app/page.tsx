import Link from "next/link";
import BrandSplash from "./components/brand-splash";
import { PeachBrand, PoweredBy } from "./components/brand";
import { ArrowIcon, CameraIcon, PaletteIcon, PenIcon, SparkIcon, VideoIcon } from "./components/icons";

const specialties = [
  { title: "Photographers", text: "Showcase your work. Get hired.", icon: <CameraIcon />, image: "/brand/hero-creative.jpg" },
  { title: "Video Editors", text: "Turn your talent into opportunity.", icon: <VideoIcon />, image: "/brand/login-creative.jpg" },
  { title: "Designers", text: "Create. Collaborate. Grow.", icon: <PaletteIcon />, image: "/brand/business-owner.jpg" },
  { title: "Writers", text: "Your words matter here.", icon: <PenIcon />, image: "/brand/hero-creative.jpg" },
];

export default function Home() {
  return (
    <main className="public-page pn-public">
      <BrandSplash />
      <header className="pn-public-header">
        <PeachBrand full />
        <nav className="pn-public-nav" aria-label="Public navigation">
          <a href="#how">How it works</a>
          <a href="#people">Creatives</a>
          <Link href="/auth?role=creative&mode=signup">Join the Network</Link>
        </nav>
        <Link href="/auth?mode=signin" className="btn btn-dark btn-small">Sign In</Link>
      </header>

      <section className="pn-landing-hero">
        <div className="pn-landing-copy">
          <span className="eyebrow"><SparkIcon /> CREATIVE HELP WITHOUT THE HUNT</span>
          <h1>The right creative.<br/><em>Right when you need them.</em></h1>
          <p>Peach Network connects businesses with vetted creative talent and gives creatives a better way to find real opportunities, grow their work and be seen.</p>
          <div className="pn-hero-actions">
            <Link href="/auth?role=business&mode=signup" className="btn btn-primary btn-large">Find a Creative <ArrowIcon /></Link>
            <Link href="/auth?role=business&mode=signup" className="btn btn-outline btn-large">Post a Project</Link>
          </div>
          <div className="pn-hero-proof">
            <div className="pn-proof-faces"><img src="/brand/hero-creative.jpg" alt="Creative member"/><img src="/brand/login-creative.jpg" alt="Creative member"/><img src="/brand/business-owner.jpg" alt="Business owner"/></div>
            <div><strong>Real people. Real creative work.</strong><span>Peach handles the search so you can focus on the project.</span></div>
          </div>
        </div>

        <div className="pn-landing-photo">
          <img src="/brand/hero-creative.jpg" alt="Smiling creative professional"/>
          <div className="pn-photo-scrim" />
          <div className="pn-photo-note">
            <small>GOOD IDEAS GROW HERE</small>
            <strong>More creatives.<br/>Stronger businesses.<br/>A sweeter South.</strong>
          </div>
          <div className="pn-ai-float">
            <span className="pn-peach-badge">🍑</span>
            <div><small>PEACH MATCH AI</small><strong>Tell us the project.</strong><span>We’ll help find the right people.</span></div>
          </div>
        </div>
      </section>

      <section className="pn-quick-grid" aria-label="Quick actions">
        <Link href="/auth?role=business&mode=signup"><span className="pn-quick-icon">✎</span><div><strong>Post a Project</strong><span>Get matched fast</span></div><b>›</b></Link>
        <Link href="/auth?role=business&mode=signup"><span className="pn-quick-icon">⌕</span><div><strong>Find Creatives</strong><span>By specialty + fit</span></div><b>›</b></Link>
        <Link href="/auth?role=creative&mode=signup"><span className="pn-quick-icon">◎</span><div><strong>Join the Network</strong><span>For real opportunities</span></div><b>›</b></Link>
      </section>

      <section id="how" className="pn-how-section">
        <div className="pn-section-title"><span className="eyebrow">HOW PEACH WORKS</span><h2>Good ideas find good people.</h2><p>No public bidding pile. No guessing who fits. Peach helps shape the project and privately surfaces qualified creatives.</p></div>
        <div className="pn-how-grid">
          <article><span>01</span><h3>Tell Peach what you need.</h3><p>Describe the project in plain language. Peach guides the scope and estimates the likely coin range.</p></article>
          <article className="featured"><span>02</span><h3>Peach Match finds the fit.</h3><p>Specialty, portfolio, availability, level and reliability all help determine the shortlist.</p></article>
          <article><span>03</span><h3>Create together.</h3><p>Messages, proofs, progress, revisions and approvals stay attached to one clear project space.</p></article>
        </div>
      </section>

      <section id="people" className="pn-specialty-section">
        <div className="pn-section-title compact"><span className="eyebrow">PEOPLE MAKE THE NETWORK</span><h2>Creative talent has a place here.</h2></div>
        <div className="pn-specialty-grid">
          {specialties.map((item)=><article key={item.title}>
            <img src={item.image} alt=""/>
            <div className="pn-specialty-overlay"><span>{item.icon}</span><strong>{item.title}</strong><p>{item.text}</p></div>
          </article>)}
          <article className="business-specialty"><div className="pn-business-specialty-copy"><span>♙</span><strong>Businesses</strong><p>Find the right creative. Get it done.</p></div></article>
        </div>
      </section>

      <section className="pn-network-strip">
        <div><span className="eyebrow">PEACH NETWORK</span><h2>More than a marketplace.</h2><p>Events, Peach Academy, creative spotlights, hub news and community opportunities all belong in the same ecosystem.</p></div>
        <Link href="/auth?role=creative&mode=signup" className="btn btn-primary">Join Peach Network</Link>
      </section>

      <footer className="public-footer pn-footer">
        <PeachBrand full />
        <PoweredBy />
        <div className="footer-links"><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><Link href="/legal/peach-coins">Peach Coin Policy</Link></div>
      </footer>
    </main>
  );
}
