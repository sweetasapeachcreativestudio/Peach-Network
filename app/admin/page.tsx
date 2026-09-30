import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function Metric({label,value,note}:{label:string;value:string|number;note:string}){
  return <div className="hq-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

export default async function AdminDashboardPage(){
  const db=createAdminClient();
  const [
    {count:totalUsers},{count:businessCount},{count:creativeCount},
    {data:pending},{data:projects},{data:wallets},{data:memberships},
    {data:disputes},{data:payouts},{data:recentProfiles}
  ]=await Promise.all([
    db.from("profiles").select("*",{count:"exact",head:true}),
    db.from("businesses").select("*",{count:"exact",head:true}),
    db.from("creatives").select("*",{count:"exact",head:true}),
    db.from("creatives").select("id").in("application_status",["submitted","under_review","needs_more_work"]),
    db.from("projects").select("id,title,status,coin_amount,created_at").order("created_at",{ascending:false}).limit(5),
    db.from("coin_wallets").select("available_coins,held_coins"),
    db.from("memberships").select("id,status"),
    db.from("disputes").select("id,status").in("status",["open","under_review"]),
    db.from("creative_payouts").select("amount_cents,status"),
    db.from("profiles").select("id,full_name,email,role,created_at").order("created_at",{ascending:false}).limit(6)
  ]);
  const available=(wallets??[]).reduce((n,w)=>n+(w.available_coins??0),0);
  const held=(wallets??[]).reduce((n,w)=>n+(w.held_coins??0),0);
  const activeMemberships=(memberships??[]).filter(m=>m.status==="active").length;
  const pendingPayout=(payouts??[]).filter(p=>p.status!=="paid").reduce((n,p)=>n+(p.amount_cents??0),0)/100;

  return <div className="hq">
    <aside className="hq-side">
      <Link href="/" className="hq-logo"><img src="/peach-app-logo.png" alt="Peach Network"/></Link>
      <div className="hq-label">PEACH HQ</div>
      <nav>
        <a className="active" href="#overview">Overview</a>
        <Link href="/admin/creatives">Creative Applications <b>{pending?.length??0}</b></Link>
        <Link href="/admin/projects">Projects & Matches</Link>
        <a href="#people">People</a><a href="#coins">Coins & Memberships</a>
        <Link href="/admin/disputes">Disputes <b>{disputes?.length??0}</b></Link>
      </nav>
      <div className="hq-side-bottom"><span>Admin workspace</span><small>Live Supabase data</small><form action="/auth/signout" method="post"><button>Log out</button></form></div>
    </aside>

    <main className="hq-main">
      <header><div><span className="eyebrow">COMMAND CENTER</span><h1>Peach HQ</h1><p>Your network at a glance — real accounts, projects and Peach Coins.</p></div><div className="hq-live"><i/> Live data</div></header>

      <section id="overview" className="hq-metrics">
        <Metric label="TOTAL USERS" value={totalUsers??0} note="Registered Peach accounts"/>
        <Metric label="BUSINESSES" value={businessCount??0} note="Business profiles"/>
        <Metric label="CREATIVES" value={creativeCount??0} note="Creative profiles"/>
        <Metric label="APPLICATIONS" value={pending?.length??0} note="Waiting for review"/>
      </section>

      <section className="hq-grid">
        <div className="hq-card">
          <div className="hq-card-head"><div><span className="eyebrow">WORKFLOW</span><h2>Projects</h2></div><Link href="/admin/projects">View all →</Link></div>
          <div className="hq-stat-row"><div><strong>{projects?.length??0}</strong><span>Recent projects</span></div><div><strong>{(projects??[]).reduce((n,p)=>n+(p.coin_amount??0),0)}</strong><span>Coins in recent work</span></div></div>
          <div className="hq-list">{projects?.length?projects.map(p=><div className="hq-row" key={p.id}><div><strong>{p.title}</strong><small>{p.status?.replaceAll("_"," ")}</small></div><span>{p.coin_amount??0} coins</span></div>):<div className="hq-empty">No projects yet.</div>}</div>
        </div>

        <div className="hq-card" id="coins">
          <div className="hq-card-head"><div><span className="eyebrow">MONEY + COINS</span><h2>Network balance</h2></div></div>
          <div className="hq-money"><strong>{available}</strong><span>available Peach Coins</span></div>
          <div className="hq-mini"><span><b>{held}</b> held in projects</span><span><b>{activeMemberships}</b> active memberships</span><span><b>${pendingPayout.toLocaleString()}</b> pending payouts</span></div>
          <p className="hq-note">These figures come from your current Supabase records, not demo accounts.</p>
        </div>
      </section>

      <section className="hq-card" id="people">
        <div className="hq-card-head"><div><span className="eyebrow">PEOPLE</span><h2>Newest accounts</h2></div><span>{totalUsers??0} total</span></div>
        <div className="hq-people-head"><span>Name</span><span>Role</span><span>Joined</span></div>
        {(recentProfiles??[]).map(p=><div className="hq-person" key={p.id}><div><strong>{p.full_name||"Peach member"}</strong><small>{p.email}</small></div><span className={"hq-role "+p.role}>{p.role}</span><time>{new Date(p.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</time></div>)}
      </section>
    </main>
    <style>{`
      *{box-sizing:border-box}.hq{min-height:100vh;background:#f7f6f1;color:#183126;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.hq-side{position:fixed;inset:0 auto 0 0;width:238px;background:#173328;color:white;padding:28px 20px;display:flex;flex-direction:column}.hq-logo img{width:118px;max-height:48px;object-fit:contain;object-position:left}.hq-label{font-size:11px;letter-spacing:.18em;color:#f5a27f;margin:30px 10px 12px;font-weight:800}.hq-side nav{display:grid;gap:5px}.hq-side nav a{color:#dbe6df;text-decoration:none;padding:12px 13px;border-radius:12px;font-size:14px;font-weight:650;display:flex;justify-content:space-between}.hq-side nav a:hover,.hq-side nav a.active{background:#27493b;color:white}.hq-side nav b{background:#f36c4d;color:white;border-radius:99px;min-width:22px;text-align:center;padding:2px 6px;font-size:11px}.hq-side-bottom{margin-top:auto;border-top:1px solid #345347;padding:18px 10px 0;display:grid;gap:4px}.hq-side-bottom span{font-weight:700}.hq-side-bottom small{color:#9db1a8}.hq-side-bottom button{margin-top:12px;background:transparent;color:#ffd4c3;border:0;padding:0;font-weight:700;cursor:pointer}.hq-main{margin-left:238px;padding:42px 46px 70px;max-width:1500px}.hq-main header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}.eyebrow{font-size:11px;letter-spacing:.14em;font-weight:850;color:#e85d3f}.hq-main h1{font-size:38px;line-height:1;margin:8px 0 8px;letter-spacing:-.04em}.hq-main header p{margin:0;color:#697a72}.hq-live{background:#e8f3eb;border:1px solid #cee2d3;color:#27633d;border-radius:99px;padding:9px 13px;font-size:12px;font-weight:800}.hq-live i{display:inline-block;width:7px;height:7px;background:#31a45b;border-radius:50%;margin-right:6px}.hq-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:14px}.hq-metric,.hq-card{background:white;border:1px solid #e2e6e2;border-radius:18px;box-shadow:0 8px 30px rgba(24,49,38,.045)}.hq-metric{padding:20px}.hq-metric>span{font-size:11px;font-weight:850;letter-spacing:.08em;color:#77877f}.hq-metric strong{display:block;font-size:31px;margin:9px 0 4px;letter-spacing:-.04em}.hq-metric small{color:#8a9891}.hq-grid{display:grid;grid-template-columns:1.45fr .8fr;gap:14px;margin-bottom:14px}.hq-card{padding:24px}.hq-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.hq-card-head h2{margin:4px 0 0;font-size:20px}.hq-card-head a,.hq-card-head>span{color:#d95438;text-decoration:none;font-size:13px;font-weight:750}.hq-stat-row{display:flex;gap:32px;padding:14px 0 18px;border-bottom:1px solid #edf0ed}.hq-stat-row div{display:grid}.hq-stat-row strong{font-size:24px}.hq-stat-row span{font-size:12px;color:#809087}.hq-list{display:grid}.hq-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid #edf0ed}.hq-row:last-child{border:0}.hq-row div{display:grid;gap:3px}.hq-row strong{font-size:14px}.hq-row small{text-transform:capitalize;color:#829087}.hq-row>span{font-size:12px;background:#fff2ec;color:#bd4b31;padding:6px 9px;border-radius:99px;font-weight:800}.hq-empty{padding:25px 0;color:#8a9891}.hq-money{padding:10px 0 22px}.hq-money strong{display:block;font-size:52px;line-height:1;letter-spacing:-.06em}.hq-money span{color:#74847c}.hq-mini{display:grid;gap:0;border-top:1px solid #edf0ed}.hq-mini span{padding:13px 0;border-bottom:1px solid #edf0ed;color:#64756d;font-size:13px}.hq-mini b{color:#183126;margin-right:5px}.hq-note{font-size:11px;line-height:1.5;color:#91a098;margin:16px 0 0}.hq-people-head,.hq-person{display:grid;grid-template-columns:1fr 160px 150px;align-items:center}.hq-people-head{padding:0 10px 10px;color:#8a9891;font-size:10px;font-weight:850;letter-spacing:.08em}.hq-person{padding:13px 10px;border-top:1px solid #edf0ed}.hq-person>div{display:grid;gap:3px}.hq-person strong{font-size:14px}.hq-person small,.hq-person time{font-size:12px;color:#839188}.hq-role{justify-self:start;text-transform:capitalize;background:#eef3ef;padding:5px 9px;border-radius:99px;font-size:11px;font-weight:800}.hq-role.admin{background:#fff0e9;color:#b7472f}.hq-role.creative{background:#eef2ff;color:#4856a6}@media(max-width:900px){.hq-side{position:relative;width:100%;min-height:auto}.hq-side nav{grid-template-columns:repeat(2,1fr)}.hq-side-bottom{display:none}.hq-main{margin-left:0;padding:28px 18px}.hq-metrics{grid-template-columns:repeat(2,1fr)}.hq-grid{grid-template-columns:1fr}.hq-main header{gap:20px}.hq-people-head,.hq-person{grid-template-columns:1fr 90px}.hq-people-head span:last-child,.hq-person time{display:none}}@media(max-width:520px){.hq-metrics{grid-template-columns:1fr 1fr}.hq-metric{padding:16px}.hq-metric strong{font-size:26px}.hq-main h1{font-size:32px}}
    `}</style>
  </div>;
}
