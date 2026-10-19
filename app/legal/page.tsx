export default function LegalHome() {
  return (
    <main className="shell" style={{maxWidth:850}}>
      <div className="brand">PE<span className="brand-accent">≡</span>CH</div>
      <p className="muted">LEGAL & POLICIES</p>
      <h1>Peach Network Policies</h1>
      <p className="muted">
        These are launch drafts and should be reviewed by Peach Network's attorney and tax professional before public launch.
      </p>
      <section className="grid">
        <a className="card" href="/legal/terms"><h2>Terms of Service</h2><p>Rules for businesses, creatives, projects and platform use.</p></a>
        <a className="card" href="/legal/privacy"><h2>Privacy Policy</h2><p>How account, project, payment and portfolio information is handled.</p></a>
        <a className="card" href="/legal/peach-coins"><h2>Peach Coin Policy</h2><p>How service credits, rollover, holds, cancellations and disputes work.</p></a>
      </section>
    </main>
  );
}
