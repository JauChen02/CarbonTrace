// Offsetting Status KPI card — 4th card in the executive summary grid.
// Inline editor (click ✎) lets managers set status and add a custom note.
// Four states: Pending / In Progress / Completed / Not Planned.
import { useState } from 'react';
import T from '../theme';
import { OFFSET_STATUSES } from '../constants';

function OffsettingCard({event,onUpdate}){
  const [editing,setEditing]=useState(false);
  const current=OFFSET_STATUSES.find(s=>s.key===(event.offsettingStatus||"pending"))||OFFSET_STATUSES[0];
  const note=event.offsettingNote||current.sub;
  const [draftStatus,setDraftStatus]=useState(current.key);
  const [draftNote,setDraftNote]=useState(note);

  function save(){
    onUpdate({...event,offsettingStatus:draftStatus,offsettingNote:draftNote});
    setEditing(false);
  }
  function open(){setDraftStatus(current.key);setDraftNote(note);setEditing(true);}

  return(
    <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"18px 20px",position:"relative"}}>
      <div style={{fontSize:12,color:T.textLight,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:current.color,opacity:0.8}}/>
          Offsetting Status
        </span>
        <button onClick={open} title="Edit offsetting status"
          style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:T.textLight,padding:"2px 6px",borderRadius:5,lineHeight:1}}
          onMouseEnter={e=>e.currentTarget.style.background=T.border}
          onMouseLeave={e=>e.currentTarget.style.background="none"}>
          ✎
        </button>
      </div>

      {!editing?(
        <>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{background:current.bg,color:current.color,border:`1px solid ${current.color}33`,borderRadius:20,padding:"4px 14px",fontSize:16,fontWeight:800,fontFamily:"'DM Mono',monospace"}}>
              {current.icon} {current.label}
            </span>
          </div>
          <div style={{fontSize:12,color:T.textLight,marginTop:4}}>{note}</div>
        </>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {/* Status picker */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {OFFSET_STATUSES.map(s=>(
              <label key={s.key} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"5px 8px",borderRadius:7,background:draftStatus===s.key?s.bg:"transparent",border:`1px solid ${draftStatus===s.key?s.color+"44":T.border}`,transition:"all 0.12s"}}>
                <input type="radio" name="offsetStatus" value={s.key} checked={draftStatus===s.key} onChange={()=>setDraftStatus(s.key)} style={{accentColor:s.color}}/>
                <span style={{fontSize:12.5,fontWeight:draftStatus===s.key?700:400,color:draftStatus===s.key?s.color:T.text}}>{s.icon} {s.label}</span>
              </label>
            ))}
          </div>
          {/* Note field */}
          <input value={draftNote} onChange={e=>setDraftNote(e.target.value)}
            placeholder="Short note (e.g. provider, timeline…)"
            style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 10px",fontSize:12.5,color:T.text,width:"100%"}}/>
          {/* Actions */}
          <div style={{display:"flex",gap:6}}>
            <button onClick={save} className="btn-p" style={{flex:1,fontSize:12,padding:"6px 0",justifyContent:"center"}}>Save</button>
            <button onClick={()=>setEditing(false)} className="btn-g" style={{flex:1,fontSize:12,padding:"6px 0",justifyContent:"center"}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── CARBON REPORT TAB ───────────────────────────────────────────────────────

export default OffsettingCard;
