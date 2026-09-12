export default function AdminHQ() {
  return (
    <main className="shell">
      <div className="brand">PE<span className="brand-accent">≡</span>CH</div>
      <p className="muted">NETWORK · HQ</p>

      <h1 style={{fontSize:38}}>Peach HQ</h1>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><a className="btn btn-primary" href="/admin/creatives">Review Creative Applications</a><a className="btn btn-outline" href="/admin/projects">Manage Peach Matches</a></div>
      <section className="grid grid-3">
        <div className="card"><p className="muted">CREATIVES TO REVIEW</p><div className="big">4</div></div>
        <div className="card"><p className="muted">ACTIVE PROJECTS</p><div className="big">6</div></div>
        <div className="card"><p className="muted">PAYOUTS PENDING</p><div className="big">$1,240</div></div>
      </section>

      <section className="grid grid-2" style={{marginTop:18}}>
        <div className="card">
          <h2>Needs Attention</h2>
          <p><strong>Product Promo Reel</strong><br/><span className="muted">No progress update in 48 hours.</span></p>
          <p><strong>Logo Refresh</strong><br/><span className="muted">Refund request needs evidence review.</span></p>
        </div>
        <div className="card">
          <h2>Money Guardrail</h2>
          <p className="muted">Projects below the configured target margin should require admin approval.</p>
          <div className="big">35–40%</div>
          <p>Initial target gross contribution margin</p>
        </div>
      </section>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:12}}><a className="btn btn-outline" href="/admin/disputes">Disputes & Evidence</a><a className="btn btn-outline" href="/admin/payouts">Creative Payouts</a></div>
</main>
  );
}
