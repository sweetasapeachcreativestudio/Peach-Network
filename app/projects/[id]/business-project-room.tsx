'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/client';
import {briefSections,roomStage,roomStatus,type RoomFile,type VaultAsset} from '@/lib/project-room';
import styles from './business-project-room.module.css';
import { ProofFilePreviewer } from './proof-file-previewer';

type Project={
  id:string;
  title:string;
  description:string|null;
  category:string;
  assigned_creative_id:string|null;
  status:string;
  coin_amount:number;
  due_at:string|null;
  revision_rounds:number;
  current_revision_round:number|null
};

type Props={
  proofThumbnail?:string|null;
  project:Project;
  creative:{name:string;avatar:string|null;specialty:string|null;hub?:string|null}|null;
  businessName:string;
  files:RoomFile[];
  assets:VaultAsset[];
  messages:{id:string;message:string;sender:string;created_at:string}[];
  requests:{id:string;request_type:string;note:string}[];
  initialBrief:boolean;
  previewUrls?:Record<string,string>
};

type Panel='brief'|'proof'|'revision'|'chat'|'upload'|'approve'|'dispute'|'buy_revision'|null;

export default function BusinessProjectRoom({project:p,creative,businessName,files,assets,messages,requests,initialBrief,proofThumbnail,previewUrls={}}:Props){
 const router=useRouter(),dialog=useRef<HTMLDialogElement>(null),fileInput=useRef<HTMLInputElement>(null);
 const [panel,setPanel]=useState<Panel>(initialBrief?'brief':null);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 const [message,setMessage]=useState('');
 const [revision,setRevision]=useState('');
 const [preview,setPreview]=useState<{url:string;mime:string}|null>(null);
 const [disputeStatement,setDisputeStatement]=useState('');
 const [disputeResolution,setDisputeResolution]=useState<'full_refund'|'half_refund'|'send_new_creative'>('full_refund');

 // Extra revisions state
 const [revisionRounds,setRevisionRounds]=useState(p.revision_rounds || 3);
 const [buyingRevision,setBuyingRevision]=useState(false);

 // Deliverables check-off state
 const [checkedPieces,setCheckedPieces]=useState<Record<number,boolean>>({});
 const [activeFeedbackIndex,setActiveFeedbackIndex]=useState<number|null>(null);
 const [feedbackText,setFeedbackText]=useState('');
 const [checkingIndex,setCheckingIndex]=useState<number|null>(null);

 const brief=briefSections(p.description),stage=roomStage(p.status),proofs=files.filter(f=>f.file_kind==='proof'),latest=proofs[0],finals=files.filter(f=>f.file_kind==='final'),unlocked=['approved','completed'].includes(p.status),canApprove=['proof_uploaded','submitted'].includes(p.status),canRevise=['proof_uploaded','submitted'].includes(p.status)&&(p.current_revision_round??0)<revisionRounds,closed=['completed','cancelled'].includes(p.status);

 // Parse deliverables list from project description
 const deliverableItems: string[] = (() => {
   if (!p.description) return ["Commercial design deliverable", "Production-ready vector assets", "Commercial rights release"];
   const lines = p.description.split("\n");
   const items: string[] = [];
   for (const line of lines) {
     const trimmed = line.trim();
     if (trimmed.startsWith("•") || trimmed.startsWith("-") || /^\d+\.\s/.test(trimmed)) {
       const clean = trimmed.replace(/^[•\-\d\.]+\s*/, "").trim();
       if (clean && !clean.toLowerCase().startsWith("category") && !clean.toLowerCase().startsWith("pricing")) {
         items.push(clean);
       }
     }
   }
   return items.length > 0 ? items : [
     "Production-ready vector source assets (.AI, .SVG, .PDF)",
     "Web & social optimized exports (.PNG, .JPG)",
     "Commercial usage rights release"
   ];
 })();

 useEffect(()=>{const el=dialog.current;if(!el)return;if(panel&&!el.open)el.showModal();if(!panel&&el.open)el.close();},[panel]);
 useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState==='visible'&&!panel&&!busy)router.refresh()},30000);return()=>clearInterval(timer)},[router,panel,busy]);

 async function post(url:string,body:unknown){
   setBusy(true);setNotice('');
   try{
     const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
     const d=await r.json();
     if(!r.ok)throw Error(d.error||'Please try again.');
     setPanel(null);setMessage('');setRevision('');
     setNotice(d.vaultSynced===false?'Approval saved. Your files are unlocked; use Save to Brand Vault below to retry saving them.':'Saved. Your project is up to date.');
     router.refresh();
   }catch(e){
     setNotice(e instanceof Error?e.message:'Please try again.');
   }finally{
     setBusy(false);
   }
 }

 // Buy 1 Revision for 1 Peach Coin ($50)
 async function handleBuyRevision() {
   setBuyingRevision(true);
   setNotice('');
   try {
     const r = await fetch('/api/projects/buy-revision', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ projectId: p.id }),
     });
     const d = await r.json();
     if (!r.ok) throw new Error(d.error || 'Failed to purchase revision.');

     setRevisionRounds(d.newTotalRounds);
     setNotice(`✓ Added 1 revision round (1 Peach Coin / $50 USD held in escrow). You now have ${d.newTotalRounds} revision rounds.`);
     router.refresh();
   } catch (e: any) {
     setNotice(e.message || 'Could not purchase revision.');
   } finally {
     setBuyingRevision(false);
   }
 }

 // Check off deliverable piece (Approved to move on)
 async function handleCheckPiece(index: number, text: string) {
   setCheckingIndex(index);
   setNotice('');
   try {
     const r = await fetch('/api/projects/check-deliverable', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         projectId: p.id,
         deliverableIndex: index,
         deliverableText: text,
         approved: true,
       }),
     });
     const d = await r.json();
     if (!r.ok) throw new Error(d.error || 'Failed to check deliverable.');

     setCheckedPieces((prev) => ({ ...prev, [index]: true }));
     setNotice(`✓ Deliverable checked off: "${text}". Creative has been notified to proceed!`);
     router.refresh();
   } catch (e: any) {
     setNotice(e.message || 'Could not check off piece.');
   } finally {
     setCheckingIndex(null);
   }
 }

 // Send feedback on deliverable (Tell creative what's wrong)
 async function handleSendDeliverableFeedback(index: number, text: string) {
   if (!feedbackText.trim()) return;
   setCheckingIndex(index);
   setNotice('');
   try {
     const r = await fetch('/api/projects/check-deliverable', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         projectId: p.id,
         deliverableIndex: index,
         deliverableText: text,
         approved: false,
         feedback: feedbackText.trim(),
       }),
     });
     const d = await r.json();
     if (!r.ok) throw new Error(d.error || 'Failed to submit feedback.');

     setCheckedPieces((prev) => ({ ...prev, [index]: false }));
     setActiveFeedbackIndex(null);
     setFeedbackText('');
     setNotice(`Revision note sent to creative for "${text}".`);
     router.refresh();
   } catch (e: any) {
     setNotice(e.message || 'Could not send feedback.');
   } finally {
     setCheckingIndex(null);
   }
 }

 async function submitDispute(){
   if(!disputeStatement.trim()){setNotice('Explain why you are requesting a dispute.');return}
   setBusy(true);setNotice('');
   try{
     const r=await fetch('/api/disputes/open',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId:p.id,statement:disputeStatement.trim(),requestedResolution:disputeResolution})});
     const d=await r.json();
     if(!r.ok)throw Error(d.error||'Could not submit dispute.');
     setPanel(null);setDisputeStatement('');
     setNotice('Dispute submitted to Peach Admins. Your escrow coins remain secured.');
     router.refresh();
   }catch(e){
     setNotice(e instanceof Error?e.message:'Could not submit dispute.');
   }finally{
     setBusy(false);
   }
 }

 async function showProof(){
   setPreview(null);setPanel('proof');
   if(!latest)return;
   try{
     const r=await fetch(`/api/projects/files/${latest.id}/download?preview=1`);
     const d=await r.json();
     if(!r.ok)throw Error(d.error||'Could not open proof.');
     setPreview({url:d.url??'',mime:d.downloadOnly?'':latest.mime_type??''});
   }catch(e){
     setNotice(e instanceof Error?e.message:'Could not open proof.');
   }
 }

 async function upload(){
   const file=fileInput.current?.files?.[0];
   if(!file){setNotice('Choose a file first.');return}
   if(file.size>25*1024*1024){setNotice('Choose a file 25 MB or smaller.');return}
   setBusy(true);setNotice('');
   try{
     const prepare=await fetch('/api/projects/files',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId:p.id,kind:'asset',action:'upload',name:file.name})});
     const signed=await prepare.json();
     if(!prepare.ok)throw Error(signed.error||'Upload failed.');
     const {error}=await createClient().storage.from('project-files').uploadToSignedUrl(signed.path,signed.token,file,{contentType:file.type||'application/octet-stream'});
     if(error)throw Error(error.message);
     const r=await fetch('/api/projects/files',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId:p.id,kind:'asset',path:signed.path,name:file.name})});
     const d=await r.json();
     if(!r.ok)throw Error(d.error||'Upload failed.');
     setPanel(null);setNotice('File added to your project.');router.refresh();
   }catch(e){
     setNotice(e instanceof Error?e.message:'Upload failed.');
   }finally{
     setBusy(false);
   }
 }

 const open=(value:Panel)=>{setNotice('');setPanel(value)};
 const download=(f:RoomFile)=><a className={styles.file} key={f.id} href={`/api/projects/files/${f.id}/download`}><span><strong>{f.original_name}</strong><small>{f.note||f.file_kind.replaceAll('_',' ')}</small></span><b>Download</b></a>;
 const vaultRows=assets.map(a=><div className={styles.file} key={a.id}><span><strong>{a.label}</strong><small>{a.value||a.original_name} · Brand Vault{a.notes?` · ${a.notes}`:''}</small></span>{a.storage_path&&<a href={`/api/brand-vault/${a.id}?project=${p.id}`}>Download</a>}</div>);

 return (
  <div className={styles.room}>
    {/* Room Topbar */}
    <header className={styles.header}>
      <div>
        <div className={styles.topline}>
          <Link href="/business/projects">← Back to Projects</Link>
          <span className={styles.badge}>{closed?'Project Room':'Active Project Room'}</span>
        </div>
        <h1>{p.title}</h1>
        <div className={styles.metadata}>
          <strong>{p.category} · {p.coin_amount} Peach Coins (${p.coin_amount * 50} USD)</strong>
          {creative && (
            <span>
              Assigned creative: <strong>{creative.name}</strong> ({creative.hub || 'Birmingham Hub'})
            </span>
          )}
          <span className={styles.proofBadge}>{roomStatus(p.status)}</span>
          <span>{p.due_at?`Due ${new Date(p.due_at).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'America/Chicago'})}`:'Flexible deadline'}</span>
        </div>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        {latest && <button className={styles.primary} onClick={showProof}>Review Proof</button>}
        {!closed && p.status!=='dispute_review' && (
          <button style={{padding:'8px 14px',borderRadius:12,fontSize:11,fontWeight:750,background:'#fff',color:'#b91c1c',border:'1px solid #fecaca',cursor:'pointer'}} onClick={()=>open('dispute')}>
            Dispute Project
          </button>
        )}
      </div>
    </header>

    {p.status==='dispute_review' && (
      <div style={{background:'#fffbeb',border:'1px solid #fde68a',padding:'12px 16px',borderRadius:14,margin:'12px 0',color:'#92400e',fontSize:13,fontWeight:600}}>
        ⚠️ This project is currently under administrative dispute review. Escrow coins remain secured while Peach HQ reviews statements.
      </div>
    )}

    {notice && <p className={styles.notice} role="status">{notice}</p>}

    {requests.length>0 && (
      <section className={styles.request}>
        <strong>Your creative needs something from you.</strong>
        {requests.map(r => (
          <div key={r.id}>
            <p>{r.request_type.replaceAll('_',' ')}: {r.note}</p>
            <button disabled={busy} onClick={()=>post('/api/projects/client-request/resolve',{projectId:p.id,requestId:r.id})}>Mark sent</button>
          </div>
        ))}
      </section>
    )}

    {/* DELIVERABLE CHECKLIST & APPROVAL BARRIER (REQUIREMENT: Business checks off each piece so creative knows to move on) */}
    <div style={{background:'#fff',border:'2px solid #C84E2D',borderRadius:20,padding:'20px 24px',marginBottom:24,boxShadow:'0 2px 8px rgba(200,78,45,0.06)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12,marginBottom:14,borderBottom:'1px solid #F2C2B2',paddingBottom:12}}>
        <div>
          <span style={{fontSize:10,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.05em',background:'#C84E2D',color:'#fff',padding:'3px 10px',borderRadius:20}}>
            Deliverables Checklist
          </span>
          <h2 style={{fontSize:18,fontWeight:900,color:'#0B2D22',margin:'6px 0 2px'}}>
            Check Off Pieces As Completed
          </h2>
          <p style={{fontSize:12,color:'#55655E',margin:0}}>
            Check off each piece as you review it so your creative knows whether to proceed or make adjustments.
          </p>
        </div>

        {/* Buy More Revisions button */}
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div style={{fontSize:12,fontWeight:800,color:'#0B2D22',background:'#FFF2EB',padding:'8px 14px',borderRadius:12,border:'1px solid #F2C2B2'}}>
            Revisions: <strong style={{color:'#C84E2D'}}>{p.current_revision_round ?? 0} of {revisionRounds} used</strong> (3 included)
          </div>
          <button
            type="button"
            onClick={handleBuyRevision}
            disabled={buyingRevision}
            style={{background:'#0B2D22',color:'#fff',padding:'8px 14px',borderRadius:12,fontSize:11,fontWeight:800,border:'none',cursor:'pointer'}}
          >
            {buyingRevision ? 'Adding Revision...' : '+ Buy 1 Revision (1 Coin / $50)'}
          </button>
        </div>
      </div>

      <div style={{display:'grid',gap:10}}>
        {deliverableItems.map((item, idx) => {
          const isChecked = checkedPieces[idx];
          const isChecking = checkingIndex === idx;
          const isFeedbackOpen = activeFeedbackIndex === idx;

          return (
            <div
              key={idx}
              style={{
                background: isChecked ? '#F0FDF4' : '#FFF9F6',
                border: isChecked ? '1.5px solid #86EFAC' : '1px solid #F2C2B2',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
                <div style={{display:'flex',alignItems:'center',gap:10,flex:1,minWidth:200}}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: isChecked ? '#16A34A' : '#E5E7EB',
                      color: isChecked ? '#fff' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {isChecked ? '✓' : idx + 1}
                  </span>
                  <div>
                    <strong style={{fontSize: 13, color: '#0B2D22', display: 'block'}}>
                      {item}
                    </strong>
                    <span style={{fontSize: 11, color: isChecked ? '#15803D' : '#78877E', fontWeight: 600}}>
                      {isChecked ? 'Approved! Creative cleared to proceed' : 'Pending business review & approval'}
                    </span>
                  </div>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <button
                    type="button"
                    onClick={() => handleCheckPiece(idx, item)}
                    disabled={isChecking}
                    style={{
                      background: isChecked ? '#16A34A' : '#C84E2D',
                      color: '#fff',
                      padding: '7px 12px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {isChecked ? '✓ Checked & Approved' : 'Check Off Piece · Approved to Move On'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFeedbackIndex(isFeedbackOpen ? null : idx)}
                    style={{
                      background: '#fff',
                      color: '#991B1B',
                      border: '1px solid #FECACA',
                      padding: '7px 12px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isFeedbackOpen ? 'Cancel' : "Tell Creative What's Wrong"}
                  </button>
                </div>
              </div>

              {/* Inline Revision Feedback Input for this piece */}
              {isFeedbackOpen && (
                <div style={{background: '#fff', border: '1px solid #FCA5A5', borderRadius: 10, padding: 10, marginTop: 4}}>
                  <label style={{fontSize: 11, fontWeight: 800, color: '#991B1B', display: 'block', marginBottom: 4}}>
                    What needs adjustment on "{item}"?
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Explain clearly what should be adjusted, changed, or replaced..."
                    style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #E5E7EB',fontSize:12,minHeight:60}}
                  />
                  <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:6}}>
                    <button
                      type="button"
                      onClick={() => setActiveFeedbackIndex(null)}
                      style={{background:'none',border:'none',fontSize:11,fontWeight:700,color:'#6B7280',cursor:'pointer'}}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isChecking || !feedbackText.trim()}
                      onClick={() => handleSendDeliverableFeedback(idx, item)}
                      style={{background:'#991B1B',color:'#fff',padding:'6px 12px',borderRadius:8,fontSize:11,fontWeight:800,border:'none',cursor:'pointer'}}
                    >
                      {isChecking ? 'Sending...' : 'Send Revision Feedback to Board'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>

    {/* Project Workspace Grid */}
    <div className={styles.grid}>
      {/* 1. Brief Card */}
      <section className={`${styles.card} ${styles.brief}`}>
        <div className={styles.cardHead}>
          <span className={styles.badge}>Project Brief</span>
          <button className={styles.textButton} onClick={()=>open('brief')}>Open Drawer →</button>
        </div>
        <h2>{p.title}</h2>
        <p className={styles.clamp}>{brief.objective}</p>
        <div className={styles.inset}>
          <p><strong>Deliverables:</strong> {brief.format||'See the agreed project brief'}</p>
          <p><strong>Vibe / Style:</strong> {brief.style||'See brand assets and brief'}</p>
          <p><strong>Revisions:</strong> {revisionRounds} included rounds (1 Peach Coin for extras)</p>
        </div>
        <button onClick={()=>open('brief')}>View Full Brief & Specs →</button>
      </section>

      {/* 2. Proofs & Revisions Card */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.proofBadge}>Proofs & Revisions</span>
          <small>{p.current_revision_round??0} of {revisionRounds} revisions used</small>
        </div>
        <div className={styles.proofArea}>
          <div className={styles.proofThumb} style={{cursor:latest?'pointer':'default'}} onClick={()=>latest&&showProof()} title={latest?'Click to expand proof in high-resolution viewer':'Proofs will appear here'}>
            {latest ? (
              <>
                {proofThumbnail && latest.mime_type?.startsWith('image/') ? (
                  <img className={styles.thumbImage} src={proofThumbnail} alt="Latest project proof"/>
                ) : (
                  <span>{latest.original_name.split('.').pop()?.toUpperCase()}</span>
                )}
                <strong>{latest.original_name}</strong>
                <small>Creative proof · Click to expand</small>
              </>
            ) : (
              <>
                <span>↗</span>
                <strong>Your proof will appear here</strong>
              </>
            )}
          </div>
          <div>
            <h2>{latest?'Your proof is ready':roomStatus(p.status)}</h2>
            <p>{latest?`Uploaded ${new Date(latest.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:'Your creative will share the first proof when ready.'}</p>
            <div className={styles.inset}>
              <strong>{revisionRounds} revision rounds included</strong>
              <p>Review your proof and check off deliverables or request revisions.</p>
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
          <button className={styles.primary} disabled={!latest} onClick={showProof}>Expand Proof</button>
          <button disabled={!canRevise} onClick={()=>open('revision')}>Request Revision</button>
          <button onClick={handleBuyRevision} disabled={buyingRevision}>+ Buy Revision (1 Coin)</button>
        </div>
      </section>

      {/* 3. Timeline Card */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.blueBadge}>Project Timeline</span>
          <small>{closed?p.status==='completed'?'Complete':'Cancelled':`Stage ${stage+1} of 4`}</small>
        </div>
        <ol className={styles.timeline}>
          {['Brief & Creative Match','Work in Progress','Proof Review','Final Delivery'].map((title,i) => (
            <li key={title} className={i===stage?styles.current:i<stage?styles.done:''}>
              <span>{i<stage?'✓':i+1}</span>
              <div>
                <strong>{title}</strong>
                <small>{i===stage?roomStatus(p.status):i<stage?'Complete':'Coming next'}</small>
              </div>
            </li>
          ))}
        </ol>
        <div className={styles.inset}>
          {p.due_at?`Delivery due ${new Date(p.due_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/Chicago'})} CT`:'Delivery timing will be agreed with your creative.'}
        </div>
      </section>

      {/* 4. Creative Card */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.badge}>Your Creative</span>
          <small>{creative?.hub || 'Birmingham Hub'}</small>
        </div>
        <div className={styles.person}>
          {creative?.avatar ? (
            <img src={creative.avatar} alt={`${creative.name} profile`}/>
          ) : (
            <span>{creative?.name.slice(0,1)||'P'}</span>
          )}
          <div>
            <h2>{creative?.name||'Finding your creative'}</h2>
            <p>{creative?.specialty||'Your matched specialist will appear here.'}</p>
            <strong style={{fontSize:11,color:'#C84E2D'}}>{creative?.hub || 'Birmingham Hub'}</strong>
          </div>
        </div>
        <div className={styles.inset}>
          <p>Direct communication and file sharing enabled in this project room.</p>
          <p>{assets.length} brand assets ready for this project.</p>
        </div>
        <button className={styles.dark} onClick={()=>open('chat')}>
          Message {creative?.name.split(' ')[0]||'your creative'}
        </button>
      </section>

      {/* 5. Project Assets & Send Materials Card */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.neutralBadge}>Project Assets ({files.filter(f=>f.file_kind!=='final').length+assets.length})</span>
          <small>Logos, Videos & Brand Vault</small>
        </div>
        <div className={styles.fileList}>
          {vaultRows.slice(0,2)}
          {files.filter(f=>f.file_kind!=='final').slice(0,2).map(download)}
          {!assets.length && !files.length && <p>No files yet. Send logos, brand guidelines or videos below.</p>}
        </div>
        <button onClick={()=>open('upload')}>Send Assets & Upload Files →</button>
      </section>

      {/* 6. Messages Card */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.badge}>Project Messages</span>
          <small>{messages.length} messages</small>
        </div>
        <div className={styles.messages}>
          {messages.slice(-2).map(m => (
            <article key={m.id}>
              <strong>{m.sender}</strong>
              <p>{m.message}</p>
              <small>{new Date(m.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</small>
            </article>
          ))}
          {!messages.length && <p>No messages yet. Send a kickoff greeting to your creative.</p>}
        </div>
        <button onClick={()=>open('chat')}>Open Message Board →</button>
      </section>

      {/* 7. Payment Status Card */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.greenBadge}>Payment Status</span>
          <small>{p.status==='completed'?'Project completed':p.assigned_creative_id?'Coins committed':'Matching'}</small>
        </div>
        <h2>{p.coin_amount} Peach Coins (${p.coin_amount * 50} USD)</h2>
        <p>{p.status==='completed'?'This project has been completed.':creative?'Coins were committed into escrow when creative accepted.':'Coins are committed into escrow when creative accepts.'}</p>
        <div className={styles.protection}>
          <strong>You review before sign-off.</strong>
          <p>{p.status==='approved'?'Your approval is recorded. Peach handles the payout review.':'Review the work and approve it here when you are ready.'}</p>
        </div>
        <small>Escrow protects your funds until final sign-off.</small>
      </section>

      {/* 8. Final Delivery & Brand Vault */}
      <section className={`${styles.card} ${styles.delivery}`}>
        <div className={styles.cardHead}>
          <span className={styles.neutralBadge}>Final Delivery & Brand Vault</span>
          <small>{unlocked?'Available after approval':'Pending approval'}</small>
        </div>
        <h2>Final Files & Brand Vault Handoff</h2>
        <p>{p.status==='approved'&&!finals.length?'Your proof is approved. Your creative can now prepare the final files.':unlocked?'Your approved files are ready to download and save for future projects.':'Review the proof first. Final source downloads unlock after final delivery approval.'}</p>
        <div className={styles.finalList}>
          {finals.map(f=>unlocked?download(f):<div className={styles.file} key={f.id}><strong>{f.original_name}</strong><small>Pending approval</small></div>)}
          {!finals.length && <div className={styles.inset}>Final deliverables will appear here when your creative uploads them.</div>}
        </div>
        <div className={styles.buttons}>
          {canApprove && (
            <button className={styles.primary} onClick={()=>open('approve')}>
              {p.status==='submitted'?'Approve Final Delivery':'Approve Proof'}
            </button>
          )}
          {unlocked && finals.length>0 && (
            <button disabled={busy} onClick={()=>post('/api/projects/vault-sync',{projectId:p.id})}>
              Save Final Files to Brand Vault
            </button>
          )}
          <Link href="/business/vault">Open Brand Vault →</Link>
        </div>
      </section>
    </div>

    {/* High-Res Proof File Previewer */}
    <div style={{marginTop:28}}>
      <ProofFilePreviewer
        projectId={p.id}
        files={files}
        initialPreviewUrls={previewUrls}
        title="Project Proofs & Deliverables Workspace"
        isOwnerOrClient={true}
        canApprove={canApprove}
        canRevise={canRevise}
        onApproveProof={()=>open('approve')}
        onRequestRevision={()=>open('revision')}
      />
    </div>

    {/* Drawers / Dialogs */}
    <dialog aria-label="Project details" ref={dialog} className={styles.dialog} onCancel={()=>setPanel(null)} onClick={e=>{if(e.target===dialog.current)setPanel(null)}}>
      <div className={styles.drawer}>
        <button className={styles.close} aria-label="Close drawer" onClick={()=>setPanel(null)}>✕</button>
        <small className={styles.drawerLabel}>Project Room / {panel==='brief'?'Project Brief':panel}</small>

        {panel==='brief' && (
          <>
            <h2>Project Brief & Creative Scope</h2>
            <p>Agreed scope, deliverables, and reference material.</p>
            <h3>1. Project Objective & Narrative</h3>
            <p className={styles.pre}>{brief.objective}</p>
            <p>{p.coin_amount} Peach Coins (${p.coin_amount * 50} USD) · {revisionRounds} included revision rounds</p>
            <h3>2. Exact Deliverables & Formats</h3>
            <p className={styles.pre}>{brief.format||'Deliverables are described in the project objective above.'}</p>
            {brief.details && (
              <>
                <h3>Content & Required Details</h3>
                <p className={styles.pre}>{brief.details}</p>
              </>
            )}
            <h3>3. Creative Direction & Brand Rules</h3>
            <p>{brief.style||'Use the business’s saved brand assets and agreed direction.'}</p>
            <h3>4. Uploaded Assets & References ({assets.length+files.filter(f=>f.file_kind==='asset').length})</h3>
            {vaultRows}
            {files.filter(f=>f.file_kind==='asset').map(download)}
          </>
        )}

        {panel==='proof' && (
          <>
            <h2>Proof Review</h2>
            {latest ? (
              <>
                <p>{latest.original_name}</p>
                {preview ? (
                  preview.mime==='application/pdf' ? (
                    <iframe sandbox="allow-same-origin" className={styles.preview} src={preview.url} title="Project proof preview"/>
                  ) : ['image/png','image/jpeg','image/webp'].includes(preview.mime) ? (
                    <img className={styles.preview} src={preview.url} alt="Project proof"/>
                  ) : (
                    <p>This format is available as a download.</p>
                  )
                ) : (
                  <p>Loading secure preview…</p>
                )}
                {download(latest)}
                <div className={styles.buttons}>
                  {canApprove && (
                    <button className={styles.primary} onClick={()=>open('approve')}>
                      {p.status==='submitted'?'Approve Final Delivery':'Approve Proof'}
                    </button>
                  )}
                  {canRevise && <button onClick={()=>open('revision')}>Request Revision</button>}
                </div>
              </>
            ) : (
              <p>No proof has been uploaded yet.</p>
            )}
          </>
        )}

        {panel==='revision' && (
          <>
            <h2>Request a Revision</h2>
            <p>{revisionRounds-(p.current_revision_round??0)} included rounds remaining. Put all changes for this round into one message.</p>
            <label>Your feedback
              <textarea value={revision} onChange={e=>setRevision(e.target.value)} placeholder="Tell your creative exactly what should change." maxLength={6000}/>
            </label>
            <div style={{display:'flex',gap:10,marginTop:12}}>
              <button className={styles.primary} disabled={busy||!revision.trim()||!canRevise} onClick={()=>post('/api/projects/revisions',{projectId:p.id,requestText:revision.trim()})}>
                Send Revision Request
              </button>
              <button onClick={handleBuyRevision} disabled={buyingRevision}>
                + Buy 1 More Revision (1 Coin)
              </button>
            </div>
          </>
        )}

        {panel==='chat' && (
          <>
            <h2>Your Project Conversation</h2>
            <p>{businessName} · {creative?.name||'Peach project team'} ({creative?.hub || 'Birmingham Hub'})</p>
            <div className={styles.thread}>
              {messages.map(m => (
                <article key={m.id}>
                  <strong>{m.sender}</strong>
                  <p className={styles.pre}>{m.message}</p>
                  <small>{new Date(m.created_at).toLocaleString()}</small>
                </article>
              ))}
            </div>
            <label>Message
              <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write to your creative…" maxLength={6000}/>
            </label>
            <button className={styles.primary} disabled={busy||!message.trim()} onClick={()=>post('/api/projects/messages',{projectId:p.id,body:message.trim()})}>
              Send Message
            </button>
          </>
        )}

        {panel==='upload' && (
          <>
            <h2>Send Brand Assets & References</h2>
            <p>Send your creative logos, video clips, style guidelines, or product photos.</p>
            {vaultRows}
            {files.filter(f=>f.file_kind!=='final').map(download)}
            {!closed && (
              <>
                <label>Upload an additional file (Video, Logo, Image, PDF)
                  <input ref={fileInput} type="file"/>
                </label>
                <small>Up to 25 MB per file.</small>
                <button disabled={busy} className={styles.primary} onClick={upload}>
                  {busy?'Uploading…':'Upload & Send to Creative'}
                </button>
              </>
            )}
            <Link href="/business/vault">Manage Brand Vault →</Link>
          </>
        )}

        {panel==='approve' && (
          <>
            <h2>{p.status==='submitted'?'Approve Final Delivery?':'Approve This Proof?'}</h2>
            <p>{p.status==='submitted'?'Confirm that the delivery meets your agreed brief. Approval unlocks the final downloads and saves them to your Brand Vault. Peach will review the creative payout.':'Confirm that this proof meets your brief. Your creative can then prepare the final delivery.'}</p>
            <div className={styles.buttons}>
              <button className={styles.primary} disabled={busy||!canApprove} onClick={()=>post('/api/projects/approve',{projectId:p.id})}>
                {busy?'Saving…':'Yes, Approve'}
              </button>
              <button disabled={busy} onClick={()=>setPanel(null)}>Keep Reviewing</button>
            </div>
          </>
        )}

        {panel==='dispute' && (
          <>
            <h2>Dispute Project &amp; Request Admin Resolution</h2>
            <p>Projects underway cannot be cancelled directly. Submit this dispute to Peach administrators. Coins remain protected in escrow.</p>
            <div style={{background:'#faf8f5',padding:12,borderRadius:10,margin:'10px 0',fontSize:12}}>
              <strong>Escrow Commitment:</strong> {p.coin_amount} Peach Coins (${p.coin_amount*50} USD)
            </div>
            <label>Reason for dispute or cancellation request
              <textarea value={disputeStatement} onChange={e=>setDisputeStatement(e.target.value)} placeholder="Explain what happened (e.g. creative unresponsive, quality issues, scope disagreement)..." maxLength={4000}/>
            </label>
            <label>Requested Resolution
              <select value={disputeResolution} onChange={e=>setDisputeResolution(e.target.value as any)} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid #d1d5db',marginTop:4}}>
                <option value="full_refund">Full Refund (100% coins back to wallet)</option>
                <option value="half_refund">Half Refund (50% to you, 50% cash to creative)</option>
                <option value="send_new_creative">Send a New Creative (Reassign from network)</option>
              </select>
            </label>
            <div className={styles.buttons} style={{marginTop:16}}>
              <button className={styles.primary} style={{background:'#b91c1c'}} disabled={busy||!disputeStatement.trim()} onClick={submitDispute}>
                {busy?'Submitting…':'Submit Dispute to Peach Admins'}
              </button>
              <button disabled={busy} onClick={()=>setPanel(null)}>Keep Working</button>
            </div>
          </>
        )}

        {notice && <p role="status" className={styles.notice}>{notice}</p>}
      </div>
    </dialog>
  </div>
 );
}
