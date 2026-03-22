// Events dashboard — the main landing page after login.
//
// DashboardPage: KPI summary row + grid of event cards.
// NewEventModal: inline modal for creating a new event with default field values.
import { useState } from 'react';
import T from '../theme';
import Shell from '../components/layout/Shell';
import { Card, KpiCard, StatusBadge, ProgressBar } from '../components/ui';
import { computeStats } from '../utils/computeStats';

function DashboardPage({user,events,onNav,onOpen,onAdd,onLogout}){
  const [modal,setModal]=useState(false);
  // Pre-compute stats for all events to avoid repeated calculations
  const eventStats = events.map(e => ({ event: e, stats: computeStats(e) }));
  const concludedEmit = eventStats.filter(es => es.event.status === "concluded").reduce((a, es) => a + es.stats.extrapolated, 0);
  // Use actual participant count (survey + csv) instead of totalInvited
  const totalPx = eventStats.reduce((a, es) => a + es.stats.total, 0);
  // Response rate = total survey submitted / total survey invited (aggregate across all events)
  const totalSurveySubmitted = eventStats.reduce((a, es) => a + es.stats.surveyStats.count, 0);
  const totalSurveyInvited = eventStats.reduce((a, es) => a + es.stats.surveyStats.total, 0);
  const avgResp = totalSurveyInvited > 0 ? (totalSurveySubmitted / totalSurveyInvited) * 100 : 0;
  return(
    <Shell user={user} active="dashboard" events={events} onNav={onNav} onOpenEvent={onOpen} onLogout={onLogout} title="Events" actions={<button className="btn-p" onClick={()=>setModal(true)}>+ New Event</button>}>
      <div className="fu">
        <div style={{display:"flex",gap:14,marginBottom:28}}>
          <KpiCard label="Total Events"       value={events.length}                          icon="◈"/>
          <KpiCard label="Total Participants" value={totalPx}                                icon="👥" accent={T.accent}/>
          <KpiCard label="Avg Response Rate"  value={`${avgResp.toFixed(0)}%`}               icon="📬" accent={avgResp>60?"#16a34a":"#f59e0b"}/>
          <KpiCard label="Total CO₂ (est.)"   value={`${(concludedEmit/1000).toFixed(1)}t`} sub="concluded events" icon="🌍" accent={T.accent}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h2 style={{fontSize:15,fontWeight:700}}>Your Events</h2>
          <span style={{fontSize:12.5,color:T.textMid}}>{events.length} events</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:16}}>
          {events.map(event=>{
            const s=computeStats(event);
            return(
              <Card key={event.id} className="card-lift" onClick={()=>onOpen(event.id)} style={{padding:"22px 24px",display:"flex",flexDirection:"column",height:"100%"}}>
                {/* Fixed height header section */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{flex:1,paddingRight:10,minWidth:0}}>
                    <div style={{fontSize:15.5,fontWeight:700,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{event.name}</div>
                    <div style={{fontSize:12.5,color:T.textMid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {event.location}</div>
                  </div>
                  <StatusBadge status={event.status}/>
                </div>
                {/* Fixed height description area - 2 lines max */}
                <div style={{height:40,marginBottom:14}}>
                  <p style={{fontSize:13,color:T.textLight,lineHeight:1.5,margin:0,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{event.description || "\u00A0"}</p>
                </div>
                {/* Progress bar - always at same position */}
                <ProgressBar value={s.responseRate}/>
                {/* Stats footer - Response rate based on survey only */}
                <div style={{display:"flex",marginTop:"auto",paddingTop:14,borderTop:`1px solid ${T.border}`}}>
                  {[
                    ["Survey Resp.",`${s.surveyStats.count}/${s.surveyStats.total}`],
                    ["Rate",s.surveyStats.total > 0 ? `${s.responseRate.toFixed(0)}%` : "N/A"],
                    ...(event.status==="concluded"?[["CO2 est.",`${(s.extrapolated/1000).toFixed(2)}t`]]:[])
                  ].map(([lbl,val],j)=>(
                    <div key={lbl} style={{flex:1,borderLeft:j>0?`1px solid ${T.border}`:"none",paddingLeft:j>0?14:0}}>
                      <div style={{fontSize:11,color:T.textLight,fontWeight:500,marginBottom:2}}>{lbl}</div>
                      <div style={{fontSize:15.5,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{val}</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      {modal&&<NewEventModal onClose={()=>setModal(false)} onAdd={e=>{onAdd(e);setModal(false);}}/>}
    </Shell>
  );
}


function NewEventModal({onClose,onAdd}){
  const [f,setF]=useState({name:"",location:"",date:"",endDate:"",description:""});
  const [error,setError]=useState("");
  const iS={width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13.5,color:T.text};
  const lS={fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:5};
  
  const handleCreate = () => {
    if(!f.name.trim()) { setError("Event name is required"); return; }
    if(!f.location.trim()) { setError("Location is required"); return; }
    if(!f.date) { setError("Start date is required"); return; }
    
    const newEvent = {
      id: `evt-${Date.now()}`,
      name: f.name.trim(),
      location: f.location.trim(),
      date: f.date,
      endDate: f.endDate || f.date,
      description: f.description.trim(),
      status: "upcoming",
      participants: [],
      totalInvited: 0,
      offsettingStatus: "pending",
      offsettingNote: "Strategy in development",
      localTransport: [],
      venueEnergy: { status: "estimated", gridFactor: 0.177, durationDays: 1, items: [] },
      foodBev: { status: "estimated", wastePct: 15, localSourcingPct: 50, meals: [] },
      materials: { status: "estimated", items: [] },
      digital: { status: "estimated", items: [] }
    };
    
    onAdd(newEvent);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}} onClick={onClose}>
      <Card style={{padding:"32px 36px",width:480}} className="fu" onClick={e=>e.stopPropagation()}>
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:22}}>Create New Event</h2>
        {error && <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"10px 12px",marginBottom:16,fontSize:13,color:"#dc2626"}}>{error}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          {[["Event Name *","name","text","e.g. Climate Summit 2026"],["Location *","location","text","City, Country"]].map(([l,k,t,ph])=>(
            <div key={k}><label style={lS}>{l}</label><input type={t} placeholder={ph} value={f[k]} onChange={e=>{setF(p=>({...p,[k]:e.target.value}));setError("");}} style={iS}/></div>
          ))}
          <div style={{display:"flex",gap:10}}>
            {[["Start Date *","date"],["End Date","endDate"]].map(([l,k])=>(
              <div key={k} style={{flex:1}}><label style={lS}>{l}</label><input type="date" value={f[k]} onChange={e=>{setF(p=>({...p,[k]:e.target.value}));setError("");}} style={iS}/></div>
            ))}
          </div>
          <div><label style={lS}>Description</label><textarea rows={3} value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))} style={{...iS,resize:"vertical"}} placeholder="Brief description of the event..."/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:22}}>
          <button className="btn-g" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn-p" onClick={handleCreate} style={{flex:2,justifyContent:"center"}}>Create Event</button>
        </div>
      </Card>
    </div>
  );
}


export { DashboardPage, NewEventModal };
export default DashboardPage;
