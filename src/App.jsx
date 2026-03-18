// App root — manages top-level state and routes between views.
//
// State:
//   user: logged-in user object (null = show login)
//   nav: { view, eventId } — atomic nav state (avoids race conditions)
//   events: array of all event objects (source of truth for the whole app)
//   surveyToken: { eventId, participantId } when following a survey hash URL
//
// Routing: login → survey (public hash URL) → dashboard → event detail
import { useState, useEffect } from 'react';
import { SEED_EVENTS, USERS } from './data/seed';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EventPage from './pages/EventPage';
import SurveyPage from './pages/SurveyPage';
import T from './theme';
import G from './styles';
import Card from './components/ui/Card';

const STORAGE_KEY = "carbontrace_events";

function loadEvents() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) { /* ignore parse errors */ }
  return SEED_EVENTS;
}

export default function App(){
  const [user,setUser]=useState(null);
  // Single atomic nav state — avoids race between view + selId
  const [nav,setNav]=useState({view:"login",eventId:null});
  const [events,setEvents]=useState(loadEvents);
  const [surveyToken,setSurveyToken]=useState(null);

  // Persist events to localStorage whenever they change
  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  },[events]);

  useEffect(()=>{
    const h=window.location.hash;
    if(h.startsWith("#survey/")){
      const [eid,pid]=h.replace("#survey/","").split("/");
      if(eid&&pid){setSurveyToken({eventId:eid,participantId:parseInt(pid)});setNav({view:"survey",eventId:eid});}
    }
  },[]);

  const updEvent=u=>setEvents(p=>p.map(e=>e.id===u.id?u:e));

  const {view,eventId}=nav;
  const selEvent=events.find(e=>e.id===eventId);

  // survey flow
  if(view==="survey"&&surveyToken){
    const ev=events.find(e=>e.id===surveyToken.eventId);
    const pt=ev?.participants.find(p=>p.id===surveyToken.participantId);
    return <SurveyPage event={ev} participant={pt} onSubmit={data=>{
      if(ev) updEvent({...ev,participants:ev.participants.map(p=>p.id===surveyToken.participantId?{...p,...data,submitted:true}:p)});
      setSurveyToken(null);setNav({view:"survey-done",eventId:null});
    }}/>;
  }
  if(view==="survey-done") return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{G}</style>
      <Card style={{padding:"48px 56px",textAlign:"center",maxWidth:380}} className="fu">
        <div style={{width:56,height:56,borderRadius:"50%",background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 16px"}}>✓</div>
        <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Thank you!</h2>
        <p style={{color:T.textMid,fontSize:14}}>Your emissions data has been recorded.</p>
      </Card>
    </div>
  );

  if(view==="login") return(
    <LoginPage onLogin={(email,pw)=>{
      const u=USERS.find(u=>u.email===email&&u.password===pw);
      if(u){setUser(u);setNav({view:"dashboard",eventId:null});return true;}
      return false;
    }}/>
  );

  if(view==="event"&&selEvent) return(
    <EventPage
      event={selEvent} user={user} onUpdate={updEvent} events={events}
      onBack={()=>setNav({view:"dashboard",eventId:null})}
      onNav={v=>setNav({view:v,eventId:null})}
      onOpenEvent={id=>setNav({view:"event",eventId:id})}
      onLogout={()=>{setUser(null);setNav({view:"login",eventId:null});}}
    />
  );

  // dashboard / events / analytics / reports all show dashboard shell
  return(
    <DashboardPage
      user={user} events={events}
      onNav={v=>setNav({view:v,eventId:null})}
      onOpen={id=>setNav({view:"event",eventId:id})}
      onAdd={e=>setEvents(p=>[...p,e])}
      onLogout={()=>{setUser(null);setNav({view:"login",eventId:null});}}
    />
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
