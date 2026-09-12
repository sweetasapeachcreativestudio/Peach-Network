import Link from "next/link";
import BrandSplash from "./components/brand-splash";
import { PeachBrand, PoweredBy } from "./components/brand";
import { ArrowIcon, CameraIcon, GlobeIcon, PaletteIcon, PenIcon, SparkIcon, VideoIcon } from "./components/icons";

function StoryIllustration({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1) {
    return (
      <div className="story-art story-art-one" aria-hidden="true">
        <div className="human human-owner"><span className="head"/><span className="hair"/><span className="body"/></div>
        <div className="mini-laptop"><span>Need a flyer + reel</span></div>
        <div className="paper-stack"><i/><i/><i/></div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="story-art story-art-two" aria-hidden="true">
        <div className="match-orbit">
          <span className="match-card m1"><PenIcon/></span>
          <span className="match-card m2"><VideoIcon/></span>
          <span className="match-card m3"><CameraIcon/></span>
          <span className="match-center"><i/><i/><i/></span>
        </div>
      </div>
    );
  }
  return (
    <div className="story-art story-art-three" aria-hidden="true">
      <div className="human human-owner small"><span className="head"/><span className="hair"/><span className="body"/></div>
      <div className="project-board"><b>Fall Campaign</b><span className="project-line"><i style={{width:"78%"}}/></span><small>Proof ready</small></div>
      <div className="human human-creative"><span className="head"/><span className="hair"/><span className="body"/></div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="public-page">
      <BrandSplash />
      <header className="public-header">
        <PeachBrand full />
        <Link href="/auth?mode=signin" className="btn btn-dark btn-small">Sign In</Link>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow"><SparkIcon /> Creative help without the hunt.</span>
          <h1>The right creative.<br/><em>Right when you need them.</em></h1>
          <p>Peach Network connects businesses with vetted designers, photographers, editors and creative professionals — while helping creatives find real opportunities to grow.</p>
          <div className="hero-actions">
            <Link href="/auth?role=business&mode=signup" className="btn btn-primary btn-large">Find a Creative <ArrowIcon /></Link>
            <Link href="/auth?role=creative&mode=signup" className="btn btn-soft btn-large">Join the Network</Link>
          </div>
          <Link href="/auth?mode=signin" className="returning-link">Already part of Peach Network? <strong>Sign in here →</strong></Link>
        </div>

        <div className="hero-visual" aria-label="Peach Network connects business owners and creative professionals">
          <div className="hero-photo-card business-person">
            <div className="portrait-illustration portrait-business"><span className="face"/><span className="hair"/><span className="shirt"/></div>
            <div className="photo-caption"><strong>Small business owner</strong><span>Needs a brand refresh</span></div>
          </div>
          <div className="hero-match-card">
            <span className="match-bars"><i/><i/><i/></span>
            <small>PEACH MATCH</small>
            <strong>We found your creative.</strong>
            <span>Brand Designer · 94% match</span>
          </div>
          <div className="hero-photo-card creative-person">
            <div className="portrait-illustration portrait-creative"><span className="face"/><span className="hair"/><span className="shirt"/></div>
            <div className="photo-caption"><strong>Creative professional</strong><span>Ready for the project</span></div>
          </div>
        </div>
      </section>

      <section className="audience-section">
        <div className="section-heading">
          <span className="eyebrow">Choose your side of the Network</span>
          <h2>One network. Two clear doors.</h2>
        </div>
        <div className="audience-grid">
          <Link href="/auth?role=business&mode=signup" className="audience-card business-card">
            <div className="audience-art"><GlobeIcon/><PaletteIcon/><PenIcon/></div>
            <span className="audience-kicker">FOR BUSINESSES</span>
            <h3>I need a creative.</h3>
            <p>Tell Peach what you need. We help scope the project, estimate your Peach Coins and match you with the right vetted creative.</p>
            <span className="card-cta">Find my creative <ArrowIcon /></span>
          </Link>
          <Link href="/auth?role=creative&mode=signup" className="audience-card creative-card">
            <div className="audience-art"><CameraIcon/><VideoIcon/><PenIcon/></div>
            <span className="audience-kicker">FOR CREATIVES</span>
            <h3>I’m a creative.</h3>
            <p>Build your Peach profile, receive private matched opportunities, track projects and grow through the Network.</p>
            <span className="card-cta">Join the Network <ArrowIcon /></span>
          </Link>
        </div>
      </section>

      <section className="story-section">
        <div className="section-heading centered">
          <span className="eyebrow">HOW PEACH WORKS</span>
          <h2>Less searching. More creating.</h2>
          <p>A simple visual story of what happens after you tell Peach what you need.</p>
        </div>
        <div className="story-grid">
          <article className="story-panel"><StoryIllustration step={1}/><span className="story-number">01</span><h3>Tell Peach the project.</h3><p>Choose what you need, answer a few guided questions and see a Peach Coin estimate.</p></article>
          <article className="story-panel featured"><StoryIllustration step={2}/><span className="story-number">02</span><h3>We find your match.</h3><p>Peach Match considers specialty, level, availability and project fit — no public bidding pile.</p></article>
          <article className="story-panel"><StoryIllustration step={3}/><span className="story-number">03</span><h3>Create together.</h3><p>Chat, share proofs, follow the progress bar and approve the final work in one project space.</p></article>
        </div>
      </section>

      <section className="trust-strip">
        <strong>Real creatives. Clear projects. Human support.</strong>
        <p>Built for businesses that need creative help and creatives who deserve better opportunities.</p>
      </section>

      <footer className="public-footer">
        <PeachBrand full />
        <PoweredBy />
        <div className="footer-links"><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><Link href="/legal/peach-coins">Peach Coin Policy</Link></div>
      </footer>
    </main>
  );
}
