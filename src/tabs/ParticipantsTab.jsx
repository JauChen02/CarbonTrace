// Participants tab — inline-editable table of all event participants.
// Managers can edit origin, transport mode, distance, and hotel nights per row.
// A live CO2 preview updates instantly as values change.
// Changes are committed back to event state via onUpdate.
// Shows both survey participants and CSV imported participants with source badges.
import { useState } from 'react';
import T from '../theme';
import { EF, HOTEL_KG } from '../constants';
import { calcEm } from '../utils/calcEm';
import { Avatar } from '../components/ui';
import { SourceBadge } from '../components/ui/Badges';

// ─── Participants Tab ─────────────────────────────────────────────────────────
function ParticipantsTab({event,onUpdate,stats}){
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({});
  const [sourceFilter,setSourceFilter]=useState("all"); // all | survey | import
  const iSm={background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 8px",color:T.text,fontSize:12.5,width:"100%"};
  const lS={fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:5};
  
  // Survey participants (from event.participants)
  const surveyParticipants = event.participants.map(p => ({
    ...p,
    _source: "Survey",
    _editable: true
  }));
  
  // CSV imported participants (from event.csvData)
  const csvParticipants = (event.csvData?.rows || []).map((row, idx) => ({
    id: `csv-${idx}`,
    name: row["Name"] || row["name"] || "Unknown",
    email: row["Email"] || row["email"] || "",
    origin: row["Origin"] || row["origin"] || "",
    transport: row["Transport"] || row["transport"] || "",
    distance: parseFloat(row["Distance (km)"] || row["distance"] || 0) || 0,
    hotelNights: parseFloat(row["Hotel Nights"] || row["hotelNights"] || 0) || 0,
    submitted: true, // CSV data is considered submitted
    _source: "CSV",
    _editable: false // CSV data is read-only in participants tab
  }));
  
  // Merge all participants
  const allParticipants = [...surveyParticipants, ...csvParticipants];
  
  // Filter by source
  const filteredParticipants = allParticipants.filter(p => {
    if (sourceFilter === "survey") return p._source === "Survey";
    if (sourceFilter === "import") return p._source === "CSV";
    return true;
  });
  
  // Calculate stats for display
  const surveyCount = surveyParticipants.length;
  const csvCount = csvParticipants.length;
  const totalCount = allParticipants.length;
  const submittedCount = allParticipants.filter(p => p.submitted).length;
  
  function startEdit(p){setEditing(p.id);setForm({origin:p.origin||"",transport:p.transport||"",distance:p.distance||"",hotelNights:p.hotelNights||""});}
  function saveEdit(pid){onUpdate({...event,participants:event.participants.map(p=>p.id===pid?{...p,...form,distance:+form.distance,hotelNights:+form.hotelNights,submitted:true}:p)});setEditing(null);}
  
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontSize:13,color:T.textMid}}>
            {submittedCount} of {totalCount} participants submitted
          </span>
          {csvCount > 0 && (
            <span style={{fontSize:12,color:T.textLight}}>
              ({surveyCount} survey · {csvCount} imported)
            </span>
          )}
        </div>
        <span style={{fontSize:13,fontWeight:600,color:T.accent}}>Avg: {stats.avg.toFixed(0)} kg CO₂ / person</span>
      </div>
      
      {/* Source filter */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <div style={{display:"flex",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden"}}>
          {[
            ["all", `All (${totalCount})`],
            ["survey", `Survey (${surveyCount})`],
            ["import", `Import (${csvCount})`],
          ].map(([v, l]) => {
            const active = sourceFilter === v;
            const col = v === "survey" ? T.accent : v === "import" ? "#2563eb" : T.text;
            return (
              <button key={v} onClick={() => setSourceFilter(v)}
                style={{
                  background: active ? (v === "survey" ? T.accentLight : v === "import" ? "#eff6ff" : T.bg) : "transparent",
                  color: active ? col : T.textMid,
                  border: "none",
                  borderRight: `1px solid ${T.border}`,
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: active ? 700 : 400,
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}>
                {l}
              </button>
            );
          })}
        </div>
      </div>
      
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${T.border}`}}>
              {["Source","Participant","Origin","Transport","Distance","Hotel Nights","CO₂ (kg)","Status",""].map(h=>(
                <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11.5,fontWeight:600,color:T.textMid,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.length === 0 && (
              <tr>
                <td colSpan={9} style={{padding:32,textAlign:"center",color:T.textLight,fontSize:13}}>
                  {sourceFilter === "import" && csvCount === 0 
                    ? "No CSV imported yet. Import participants from the Raw Data page."
                    : "No participants found"}
                </td>
              </tr>
            )}
            {filteredParticipants.map(p=>{
              const em=p.submitted?calcEm(p):null;
              const isEd=editing===p.id;
              const isSurvey = p._source === "Survey";
              const rowBorderColor = isSurvey ? T.accent + "30" : "#2563eb30";
              return(
                <tr key={p.id} style={{borderBottom:`1px solid ${T.border}`,borderLeft:`3px solid ${rowBorderColor}`}}>
                  <td style={{padding:"11px 12px"}}><SourceBadge source={p._source}/></td>
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
                    <td style={{padding:"8px"}}><div style={{display:"flex",gap:6}}><button className="btn-p" onClick={()=>saveEdit(p.id)} style={{padding:"5px 12px",fontSize:12}}>Save</button><button className="btn-g" onClick={()=>setEditing(null)} style={{padding:"5px 10px",fontSize:12}}>X</button></div></td>
                  </>:<>
                    <td style={{padding:"11px 12px",color:p.origin?T.text:T.textLight}}>{p.origin||"—"}</td>
                    <td style={{padding:"11px 12px",color:p.transport?T.text:T.textLight}}>{p.transport||"—"}</td>
                    <td style={{padding:"11px 12px",fontFamily:"'DM Mono',monospace"}}>{p.distance||"—"}</td>
                    <td style={{padding:"11px 12px",fontFamily:"'DM Mono',monospace"}}>{p.hotelNights||"—"}</td>
                    <td style={{padding:"11px 12px",fontFamily:"'DM Mono',monospace",fontWeight:em!==null?700:400,color:em!==null?T.accent:T.textLight}}>{em!==null?em.toFixed(0):"—"}</td>
                    <td style={{padding:"11px 12px"}}><span style={{background:p.submitted?"#dcfce7":"#f3f4f6",color:p.submitted?"#15803d":T.textMid,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{p.submitted?"Submitted":"Pending"}</span></td>
                    <td style={{padding:"11px 8px"}}>
                      {p._editable ? (
                        <button className="btn-g" onClick={()=>startEdit(p)} style={{padding:"5px 12px",fontSize:12}}>Edit</button>
                      ) : (
                        <span style={{fontSize:11,color:T.textLight}}>Read-only</span>
                      )}
                    </td>
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
