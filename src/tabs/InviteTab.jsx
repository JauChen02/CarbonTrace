// Invite tab — participant management and survey link generation.
// Add participants individually (name + email form) or bulk (newline-separated).
// Generates a hash-based survey URL for each participant and provides
// a one-click copy button. Sends invitation emails with survey links.
import { useState } from 'react';
import T from '../theme';
import Card from '../components/ui/Card';
import { Avatar } from '../components/ui';

// Simulated email sending (placeholder - replace with real email service later)
async function sendInviteEmail(participant, event, surveyLink) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Log the email that would be sent (for development)
  console.log(`[Email] To: ${participant.email}`);
  console.log(`[Email] Subject: You're invited to ${event.name} - Carbon Footprint Survey`);
  console.log(`[Email] Body:
    Hi ${participant.name},
    
    You've been invited to participate in the carbon footprint survey for ${event.name}.
    
    Event Details:
    - Event: ${event.name}
    - Date: ${event.date}${event.endDate ? ` - ${event.endDate}` : ''}
    - Location: ${event.location}
    
    Please complete the survey using the link below:
    ${surveyLink}
    
    This survey helps us calculate and offset the carbon emissions from the event.
    
    Thank you for participating!
    The CarbonTrace Team
  `);
  
  return { success: true };
}

// ─── Invite Tab ───────────────────────────────────────────────────────────────
function InviteTab({event,onUpdate}){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [bulk,setBulk]=useState("");
  const [showBulk,setShowBulk]=useState(false);
  const [copied,setCopied]=useState(null);
  const [sending,setSending]=useState({}); // {participantId: true} while sending
  const [sent,setSent]=useState({}); // {participantId: true} after sent
  const [sendingAll,setSendingAll]=useState(false);
  
  const iS={background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13.5,color:T.text};
  
  function add(){if(!email.trim())return;const id=Math.max(0,...event.participants.map(p=>p.id))+1;onUpdate({...event,participants:[...event.participants,{id,name:name||email,email,origin:"",transport:"",distance:0,hotelNights:0,submitted:false,invited:false}],totalInvited:event.totalInvited+1});setName("");setEmail("");}
  function addBulk(){const lines=bulk.split("\n").map(l=>l.trim()).filter(Boolean);if(!lines.length)return;let id=Math.max(0,...event.participants.map(p=>p.id))+1;const ps=lines.map(e=>({id:id++,name:e.split("@")[0],email:e,origin:"",transport:"",distance:0,hotelNights:0,submitted:false,invited:false}));onUpdate({...event,participants:[...event.participants,...ps],totalInvited:event.totalInvited+ps.length});setBulk("");setShowBulk(false);}
  function link(p){return `${window.location.origin}${window.location.pathname}#survey/${event.id}/${p.id}`;}
  function copy(p){navigator.clipboard.writeText(link(p));setCopied(p.id);setTimeout(()=>setCopied(null),2000);}
  
  async function sendInvite(p) {
    setSending(s => ({...s, [p.id]: true}));
    try {
      await sendInviteEmail(p, event, link(p));
      setSent(s => ({...s, [p.id]: true}));
      // Update participant as invited
      const updatedParticipants = event.participants.map(pt => 
        pt.id === p.id ? {...pt, invited: true, invitedAt: new Date().toISOString()} : pt
      );
      onUpdate({...event, participants: updatedParticipants});
    } finally {
      setSending(s => ({...s, [p.id]: false}));
    }
  }
  
  async function sendAllInvites() {
    const pending = event.participants.filter(p => !p.invited && !p.submitted);
    if (pending.length === 0) return;
    setSendingAll(true);
    for (const p of pending) {
      await sendInvite(p);
    }
    setSendingAll(false);
  }
  
  const pendingCount = event.participants.filter(p => !p.invited && !p.submitted).length;
  return(
    <div>
      <Card style={{padding:"20px 22px",marginBottom:18}}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>Add Participant & Generate Survey Link</div>
        <div style={{display:"flex",gap:10,marginBottom:10}}>
          <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={{...iS,maxWidth:190}}/>
          <input placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} style={{...iS,flex:1}}/>
          <button className="btn-p" onClick={add} style={{whiteSpace:"nowrap"}}>Add + Generate</button>
        </div>
        <button onClick={()=>setShowBulk(!showBulk)} style={{background:"none",border:"none",color:T.accent,cursor:"pointer",fontSize:13,fontWeight:500}}>{showBulk?"▾":"▸"} Bulk add (paste emails)</button>
        {showBulk&&<div style={{marginTop:10}}><textarea rows={4} value={bulk} onChange={e=>setBulk(e.target.value)} placeholder={"one@example.com\ntwo@example.com"} style={{...iS,width:"100%",resize:"vertical",display:"block",marginBottom:8}}/><button className="btn-p" onClick={addBulk}>Add All</button></div>}
      </Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:13.5,fontWeight:600}}>Survey Links & Invitations</div>
        {pendingCount > 0 && (
          <button 
            className="btn-p" 
            onClick={sendAllInvites} 
            disabled={sendingAll}
            style={{fontSize:12,padding:"8px 16px",opacity:sendingAll?0.7:1}}
          >
            {sendingAll ? "Sending..." : `Send All Invites (${pendingCount})`}
          </button>
        )}
      </div>
      <div style={{border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
        {event.participants.length===0&&<div style={{padding:40,textAlign:"center",color:T.textLight,fontSize:13}}>No participants yet.</div>}
        {event.participants.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:14,padding:"11px 16px",borderBottom:`1px solid ${T.border}`}}>
            <Avatar name={p.name} size={30}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,fontWeight:600}}>{p.name}</div>
              <div style={{fontSize:11.5,color:T.textLight}}>{p.email}</div>
            </div>
            <span style={{
              background: p.submitted ? "#dcfce7" : p.invited ? "#dbeafe" : "#f3f4f6",
              color: p.submitted ? "#15803d" : p.invited ? "#1d4ed8" : T.textMid,
              padding:"2px 10px",
              borderRadius:20,
              fontSize:11,
              fontWeight:600
            }}>
              {p.submitted ? "Completed" : p.invited ? "Invited" : "Not Invited"}
            </span>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:T.textLight,background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 9px",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{link(p)}</div>
            <button onClick={()=>copy(p)} className={copied===p.id?"btn-p":"btn-g"} style={{whiteSpace:"nowrap",fontSize:12,padding:"6px 13px"}}>{copied===p.id?"Copied":"Copy"}</button>
            {!p.submitted && (
              <button 
                onClick={()=>sendInvite(p)} 
                disabled={sending[p.id]}
                className={p.invited ? "btn-g" : "btn-p"}
                style={{whiteSpace:"nowrap",fontSize:12,padding:"6px 13px",opacity:sending[p.id]?0.7:1}}
              >
                {sending[p.id] ? "Sending..." : p.invited ? "Resend" : "Send Invite"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


export default InviteTab;
