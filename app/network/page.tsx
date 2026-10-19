import Link from "next/link";
import { PeachBrand } from "../components/brand";

const events=[
 {month:'SEP',day:'20',title:'Peach Creative Mixer',type:'Community',text:'A night for creatives, founders and local businesses to meet, talk and make connections.'},
 {month:'OCT',day:'05',title:'Portfolio Power Hour',type:'Peach Academy',text:'A practical session for creatives who want stronger portfolios and clearer positioning.'},
 {month:'OCT',day:'18',title:'Business + Creative Workshop',type:'Workshop',text:'Learn how to brief creative work, manage revisions and build healthier collaborations.'},
];
const news=[
 {title:'Peach Match AI is in beta',text:'Businesses can describe a project in plain language and Peach helps shape the brief before matching.'},
 {title:'Creative applications are open',text:'Peach is reviewing new creatives by specialty, portfolio readiness and availability.'},
 {title:'Peach Academy is growing',text:'New learning sessions, mentor touchpoints and portfolio-building resources are being added.'},
];
export default function NetworkPage(){return <main className="pn-network-page"><header className="pn-public-header"><PeachBrand full/><Link href="/auth?mode=signin" className="btn btn-dark btn-small">Sign In</Link></header><section className="pn-network-hero"><div><span className="eyebrow">AROUND THE NETWORK</span><h1>Where Peach comes alive.</h1><p>Events, workshops, creative spotlights, opportunities and the news that keeps the Network connected.</p></div><div className="pn-network-hero-photo"><img src="/brand/login-creative.jpg" alt="Creative community member"/><span>Good people create great things.</span></div></section><section className="pn-network-grid"><div><div className="pn-section-title compact"><span className="eyebrow">UPCOMING EVENTS</span><h2>Come meet your people.</h2></div><div className="pn-event-list">{events.map(e=><article key={e.title}><div className="pn-date-card"><span>{e.month}</span><strong>{e.day}</strong></div><div><small>{e.type}</small><h3>{e.title}</h3><p>{e.text}</p><button className="text-link">Save the date →</button></div></article>)}</div></div><div><div className="pn-section-title compact"><span className="eyebrow">PEACH PULSE</span><h2>Network news.</h2></div><div className="pn-news-list">{news.map((n,i)=><article key={n.title}><span>{i===0?'🍑':'✦'}</span><div><h3>{n.title}</h3><p>{n.text}</p></div></article>)}</div></div></section></main>}
