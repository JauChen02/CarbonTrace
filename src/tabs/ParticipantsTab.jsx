// Participants tab — inline-editable table of all event participants.
// Managers can edit origin, transport mode, distance, and hotel nights per row.
// A live CO2 preview updates instantly as values change.
// Changes are committed back to event state via onUpdate.
import { useState } from 'react';
import T from '../theme';
import { EF, HOTEL_KG } from '../constants';
import { calcEm } from '../utils/calcEm';
import { Avatar } from '../components/ui';

// ─── Participants Tab ─────────────────────────────────────────────────────────
function ParticipantsTab({event,onUpdate,stats}){
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({});
  const iSm={background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 8px",color:T.text,fontSize:12.5,width:"100%"};
  function startEdit(p){setEditing(p.id);setForm({origin:p.origin||"",transport:p.transport||"",distance:p.distance||"",hotelNights:p.hotelNights||""});}
  function saveEdit(pid){onUpdate({...event,participants:event.participants.map(p=>p.id===pid?{...p,...form,distance:+form.distance,hotelNights:+form.hotelNights,submitted:true}:p)});setEditing(null);}
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
        <span style={{fontSize:13,color:T.textMid}}>{stats.responders} of {stats.total} participants submitted</span>
        <span style={{fontSize:13,fontWeight:600,color:T.accent}}>Avg: {stats.avg.toFixed(0)} kg CO₂ / person</span>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${T.border}`}}>
              {["Participant","Origin","Transport","Distance","Hotel Nights","CO₂ (kg)","Status",""].map(h=>(
                <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11.5,fontWeight:600,color:T.textMid,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {event.participants.map(p=>{
              const em=p.submitted?calcEm(p):null;
              const isEd=editing===p.id;
              return(
                <tr key={p.id} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:"11px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <Avatar name={p.name} size={28}/>
                      <div><div style={{fontWeight:600,color:T.text}}>{p.name}</div><div style={{fontSize:11,color:T.textLight}}>{p.email}</div></div>
                    </div>
                  </td>
                  {isEd?<>
                    <td style={{padding:"8px"}}><input style={iSm} value={form.origin} onChange={e=>setForm(f=>({...f,origin:e.target.value}))} placeholder="City, Country"/></td>
                    <td style={{padding:"8px"}}><select style={iSm} value={form.transport} onChange={e=>setForm(f=>({...f,transport:e.target.value}))}><option value="">--</option>{Object.keys(EF).map(t=><option key={t} value={t}>{t}</option>)}</select></td>
                    <td style={{padding:"8px"}}><input style={iSm} type="number" value={form.distance} onChange={e=>setForm(f=>({...f,distance:e.target.value}))}/></td>
                    <td style={{padding:"8px"}}><input style={iSm} type="number" value={form.hotelNights} onChange={e=>setForm(f=>({...f,hotelNights:e.target.value}))}/></td>
                    <td style={{padding:"8px",fontFamily:"'DM Mono',monospace",fontWeight:600,color:T.accent}}>{calcEm({transport:form.transport,distance:+form.distance,hotelNights:+form.hotelNights}).toFixed(0)}</td>
                    <td><span style={{background:"#dbeafe",color:"#1d4ed8",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>Editing</span></td>
                    <td style={{padding:"8px"}}><div style={{display:"flex",gap:6}}><button className="btn-p" onClick={()=>saveEdit(p.id)} style={{padding:"5px 12px",fontSize:12}}>Save</button><button className="btn-g" onClick={()=>setEditing(null)} style={{padding:"5px 10px",fontSize:12}}>✕</button></div></td>
                  </>:<>
                    <td style={{padding:"11px 12px",color:p.origin?T.text:T.textLight}}>{p.origin||"—"}</td>
                    <td style={{padding:"11px 12px",color:p.transport?T.text:T.textLight}}>{p.transport||"—"}</td>
                    <td style={{padding:"11px 12px",fontFamily:"'DM Mono',monospace"}}>{p.distance||"—"}</td>
                    <td style={{padding:"11px 12px",fontFamily:"'DM Mono',monospace"}}>{p.hotelNights||"—"}</td>
                    <td style={{padding:"11px 12px",fontFamily:"'DM Mono',monospace",fontWeight:em!==null?700:400,color:em!==null?T.accent:T.textLight}}>{em!==null?em.toFixed(0):"—"}</td>
                    <td style={{padding:"11px 12px"}}><span style={{background:p.submitted?"#dcfce7":"#f3f4f6",color:p.submitted?"#15803d":T.textMid,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{p.submitted?"✓ Submitted":"Pending"}</span></td>
                    <td style={{padding:"11px 8px"}}><button className="btn-g" onClick={()=>startEdit(p)} style={{padding:"5px 12px",fontSize:12}}>Edit</button></td>
                  </>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default ParticipantsTab;
