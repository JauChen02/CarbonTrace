// Public participant survey — accessible via a hash URL (no login required).
// 4-step form: origin city → transport mode → distance → hotel nights.
// Shows a live CO2 preview that updates as the participant fills in fields.
// On submit, calls onSubmit(participantId, data) which updates the event in App state.
import { useState } from 'react';
import T from '../theme';
import { EF } from '../constants';
import { calcEm } from '../utils/calcEm';

// ─── Survey ───────────────────────────────────────────────────────────────────
function SurveyPage({event,participant,onSubmit}){
  const [form,setForm]=useState({origin:"",transport:"",distance:"",hotelNights:""});
  const [step,setStep]=useState(0);
  if(!event||!participant) return(<div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><style>{G}</style><Card style={{padding:"48px 56px",textAlign:"center"}}><div style={{fontSize:14,color:T.textMid}}>Invalid survey link. Please contact your event organiser.</div></Card></div>);
  const steps=[
    {key:"origin",title:"Where did you travel from?",desc:"Enter the city and country you departed from.",optional:false,field:<input placeholder="e.g. Paris, France" value={form.origin} onChange={e=>setForm(f=>({...f,origin:e.target.value}))} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 14px",fontSize:14,color:T.text,marginTop:10}}/>},
    {key:"transport",title:"How did you travel?",desc:"Select your primary mode of transport.",optional:true,field:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:12}}>{Object.keys(EF).map(t=><button key={t} onClick={()=>setForm(f=>({...f,transport:t}))} style={{background:form.transport===t?T.accent:T.surface,border:`1.5px solid ${form.transport===t?T.accent:T.border}`,borderRadius:10,padding:"12px 8px",color:form.transport===t?"white":T.textMid,fontSize:13,cursor:"pointer",transition:"all 0.15s",fontWeight:form.transport===t?600:400}}>{t==="Air travel"?"✈️":t==="Train"?"🚆":t==="Car"?"🚗":t==="Coach/Bus"?"🚌":t==="Carpool"?"👥":"🚲"} {t}</button>)}</div>},
    {key:"distance",title:"Approximate travel distance?",desc:"One-way km. Round-trip calculated automatically.",optional:true,field:<div style={{marginTop:12}}><input type="number" placeholder="e.g. 450" value={form.distance} onChange={e=>setForm(f=>({...f,distance:e.target.value}))} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 14px",fontSize:14,color:T.text}}/>{form.distance&&form.transport&&<div style={{marginTop:8,color:T.accent,fontSize:13,background:T.accentLight,padding:"9px 12px",borderRadius:8}}>≈ {(EF[form.transport]*+form.distance*2).toFixed(1)} kg CO₂ (round-trip)</div>}</div>},
    {key:"hotelNights",title:"How many nights are you staying?",desc:"Accommodation nights at the event venue (optional).",optional:true,field:<div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>{[0,1,2,3,4,5,6,7].map(n=><button key={n} onClick={()=>setForm(f=>({...f,hotelNights:n.toString()}))} style={{width:50,height:50,background:form.hotelNights===n.toString()?T.accent:T.surface,border:`1.5px solid ${form.hotelNights===n.toString()?T.accent:T.border}`,borderRadius:8,color:form.hotelNights===n.toString()?"white":T.textMid,fontSize:15,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontWeight:600,transition:"all 0.15s"}}>{n}</button>)}</div>},
  ];
  const cur=steps[step];
  const canGo=cur.optional||!!form[cur.key];
  const isLast=step===steps.length-1;
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      <style>{G}</style>
      <div style={{height:3,background:T.border}}><div style={{height:"100%",background:T.accentMid,width:`${((step+1)/steps.length)*100}%`,transition:"width 0.4s ease"}}/></div>
      <div style={{height:54,background:T.surface,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",padding:"0 26px",gap:10}}>
        <div style={{width:26,height:26,borderRadius:6,background:"linear-gradient(135deg,#14b8a6,#0f766e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🌍</div>
        <span style={{fontWeight:700,fontSize:14.5}}>CarbonTrace</span>
        <span style={{color:T.textLight}}>·</span>
        <span style={{color:T.textMid,fontSize:13}}>{event.name}</span>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
        <div style={{width:"100%",maxWidth:500}} className="fu">
          {step===0&&<Card style={{padding:"14px 18px",marginBottom:22,borderColor:"#a7f3d0"}}><div style={{fontWeight:600,marginBottom:2,fontSize:13.5}}>Hi, {participant.name} 👋</div><div style={{color:T.textMid,fontSize:13,lineHeight:1.6}}>{event.name} is tracking carbon footprint. Takes ~2 min. Optional questions can be skipped.</div></Card>}
          <div style={{fontSize:11.5,color:T.textMid,fontWeight:600,letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Step {step+1} of {steps.length}{cur.optional&&<span style={{color:T.textLight}}> · Optional</span>}</div>
          <h2 style={{fontSize:26,fontWeight:700,marginBottom:6,lineHeight:1.2}}>{cur.title}</h2>
          <p style={{color:T.textMid,fontSize:13.5}}>{cur.desc}</p>
          {cur.field}
          <div style={{display:"flex",gap:10,marginTop:26}}>
            {step>0&&<button className="btn-g" onClick={()=>setStep(s=>s-1)} style={{flex:1}}>← Back</button>}
            <button className="btn-p" onClick={()=>isLast?onSubmit({origin:form.origin,transport:form.transport,distance:+form.distance||0,hotelNights:+form.hotelNights||0}):setStep(s=>s+1)} disabled={!canGo} style={{flex:2,justifyContent:"center",opacity:canGo?1:0.45}}>{isLast?"Submit →":cur.optional?"Next →":"Continue →"}</button>
          </div>
          <div style={{display:"flex",gap:6,marginTop:18,justifyContent:"center"}}>{steps.map((_,i)=><div key={i} style={{width:i===step?18:6,height:6,borderRadius:3,background:i<=step?T.accentMid:"#e5e7eb",transition:"all 0.3s"}}/>)}</div>
        </div>
      </div>
    </div>
  );
}

export default SurveyPage;
