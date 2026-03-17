// App sidebar: CarbonTrace logo, collapsible Events dropdown, user profile, logout.
// The Events list shows all events with colour-coded status dots.
// The active event is highlighted; clicking any event navigates directly to it.
import { useState } from 'react';
import T from '../../theme';

function Sidebar({user,active,activeEventId,events,onNav,onOpenEvent,onLogout}){
  const [eventsOpen,setEventsOpen]=useState(true);
  const [profileOpen,setProfileOpen]=useState(false);
  const isEventActive=active==="event";
  return(
    <div style={{width:220,background:T.sidebar,display:"flex",flexDirection:"column",height:"100vh",position:"fixed",left:0,top:0,zIndex:50,overflowY:"auto"}}>
      <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:30,height:30,borderRadius:7,background:"linear-gradient(135deg,#14b8a6,#0f766e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>&#x1F30D;</div>
          <span style={{color:"white",fontWeight:700,fontSize:15,letterSpacing:-0.3}}>CarbonTrace</span>
        </div>
      </div>
      <nav style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:2}}>
        <button
          className={`sb-item${!isEventActive&&active==="dashboard"?" active":""}`}
          onClick={()=>{setEventsOpen(o=>!o);onNav("dashboard");}}
          style={{justifyContent:"space-between"}}
        >
          <span style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14,opacity:0.75}}>&#x25C8;</span>Events
          </span>
          <span style={{fontSize:10,opacity:0.5,transform:eventsOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block"}}>&#x25BC;</span>
        </button>
        {eventsOpen&&(
          <div style={{marginLeft:10,marginTop:2,display:"flex",flexDirection:"column",gap:1}}>
            {events.map(ev=>{
              const isActive=isEventActive&&activeEventId===ev.id;
              const statusDot={concluded:"#16a34a",active:"#2563eb",upcoming:"#d97706"}[ev.status]||"#6b7280";
              return(
                <button key={ev.id}
                  onClick={()=>onOpenEvent(ev.id)}
                  style={{background:isActive?"rgba(255,255,255,0.08)":"transparent",border:"none",width:"100%",textAlign:"left",borderRadius:6,padding:"7px 10px",fontSize:12.5,cursor:"pointer",color:isActive?"#ffffff":"#9ca3af",display:"flex",alignItems:"center",gap:8,transition:"all 0.13s"}}
                >
                  <div style={{width:6,height:6,borderRadius:"50%",background:statusDot,flexShrink:0}}/>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{ev.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>
      <div style={{padding:"14px 14px",borderTop:"1px solid rgba(255,255,255,0.06)",position:"relative"}}>
        <button
          onClick={()=>setProfileOpen(o=>!o)}
          style={{display:"flex",alignItems:"center",gap:9,width:"100%",background:"transparent",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}
        >
          <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#14b8a6,#0f766e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"white",fontWeight:700}}>
            {user.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
          </div>
          <div style={{flex:1,overflow:"hidden"}}>
            <div style={{color:"white",fontSize:12.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
            <div style={{color:T.sidebarText,fontSize:11}}>Event Manager</div>
          </div>
          <span style={{fontSize:10,opacity:0.5,transform:profileOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block",color:T.sidebarText}}>&#x25B2;</span>
        </button>
        {profileOpen&&(
          <div style={{position:"absolute",bottom:"100%",left:10,right:10,marginBottom:8,background:T.card,borderRadius:8,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",border:`1px solid ${T.border}`,overflow:"hidden"}}>
            <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`}}>
              <div style={{fontSize:12.5,fontWeight:600,color:T.text}}>{user.name}</div>
              <div style={{fontSize:11,color:T.textMid}}>{user.email}</div>
            </div>
            <button
              onClick={onLogout}
              style={{width:"100%",padding:"10px 14px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",fontSize:12.5,color:"#ef4444",display:"flex",alignItems:"center",gap:8,transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <span style={{fontSize:14}}>&#x21E5;</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
