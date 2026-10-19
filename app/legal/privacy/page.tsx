export default function Privacy() {
  return (
    <main className="shell" style={{maxWidth:850}}>
      <div className="brand">PE<span className="brand-accent">≡</span>CH</div>
      <p className="muted">DRAFT · ATTORNEY REVIEW REQUIRED</p>
      <h1>Privacy Policy</h1>

      <section className="card">
        <h2>Information Peach may process</h2>
        <p>Account information, business information, creative applications and portfolios, project messages, files, progress updates, transaction records, dispute evidence and support communications may be processed to operate Peach Network.</p>

        <h2>Banking and payment data</h2>
        <p>Peach Network is designed so raw card and creative bank-account information is handled by payment providers such as Stripe rather than stored directly in Peach's application database.</p>

        <h2>Why information is used</h2>
        <p>Information may be used to authenticate users, match projects, coordinate work, process payments and payouts, maintain project records, prevent abuse, resolve disputes, provide support and improve the service.</p>

        <h2>Project files</h2>
        <p>Project files are intended to be private to authorized project participants and Peach administrators. Download links are temporary signed links rather than permanent public URLs.</p>

        <h2>Service providers</h2>
        <p>Peach may rely on infrastructure, authentication, storage, payment and communication providers to operate the platform. Production launch documents should identify the providers actually enabled at launch.</p>

        <h2>Retention and deletion</h2>
        <p>Production policy should define retention periods for account, transaction, project and dispute records while preserving records that Peach is legally required or reasonably needs to keep.</p>

        <h2>Contact</h2>
        <p>Before launch, replace this section with Peach Network's official privacy contact email and business mailing information.</p>
      </section>
    </main>
  );
}
