// Event detail page.
// Manages tab state (report / overview / participants / invites / analytics)
// and the Raw Data subpage with its breadcrumb navigation.
// Passes onUpdate down to every tab so they can mutate event data.
import { useState } from 'react';
import T from '../theme';
import Shell from '../components/layout/Shell';
import { StatusBadge, KpiCard } from '../components/ui';
import { computeStats } from '../utils/computeStats';
import RawDataPage from './RawDataPage';
import CarbonReportTab from '../tabs/CarbonReportTab';
import OverviewTab from '../tabs/OverviewTab';
import ParticipantsTab from '../tabs/ParticipantsTab';
import InviteTab from '../tabs/InviteTab';
import AnalyticsTab from '../tabs/AnalyticsTab';

function EventPage({event,user,onUpdate,onBack,onNav,onOpenEvent,onLogout,events}){
  const [tab,setTab]=useState("report");
  const stats=computeStats(event);
  const TABS=[["report","Carbon Report"],["overview","Overview"],["participants","Participants"],["invite","Send Invites"],["analytics","Analytics"]];

  const isRawData=tab==="rawdata";

  const breadcrumb=(
    <span style={{display:"flex",alignItems:"center",gap:8}}>
      <button className="btn-g" onClick={isRawData?()=>setTab("report"):onBack} style={{padding:"5px 12px",fontSize:12.5}}>← Back</button>
      <span style={{color:T.textLight}}>/</span>
      <button onClick={()=>onNav("dashboard")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:T.accent,fontWeight:500,fontSize:14}}>Events</button>
      <span style={{color:T.textLight}}>/</span>
      <button onClick={()=>isRawData&&setTab("report")} style={{background:"none",border:"none",cursor:isRawData?"pointer":"default",padding:0,color:isRawData?T.accent:T.text,fontWeight:600,fontSize:15}}>{event.name}</button>
      {isRawData&&<><span style={{color:T.textLight}}>/</span><span style={{color:T.text,fontWeight:600}}>Raw Data</span></>}
    </span>
  );

  return(
    <Shell user={user} active="event" activeEventId={event.id} events={events} onNav={onNav} onOpenEvent={onOpenEvent} onLogout={onLogout} noPad noBorder={!isRawData}
      title={breadcrumb}
      actions={<StatusBadge status={event.status}/>}>

      {/* Tab navigation - always in the same position */}
      {!isRawData && (
        <div style={{position:"sticky",top:57,zIndex:30,background:T.surface,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",paddingLeft:30}}>
            {TABS.map(([k,l])=>(
              <button key={k} className={`tab${tab===k?" on":""}`} onClick={()=>setTab(k)}>{l}</button>
            ))}
          </div>
        </div>
      )}

      {/* Shared header for non-report tabs - event info and actions */}
      {!isRawData && tab!=="report" && (
        <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"20px 30px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:24,fontSize:13,color:T.textMid,marginBottom:12}}>
            {event.date&&<span>📅 {event.date}{event.endDate?` - ${event.endDate}`:""}</span>}
            {event.location&&<span>📍 {event.location}</span>}
            <span>👥 {stats.total} Participants</span>
          </div>
          {event.description&&<p style={{fontSize:13.5,color:T.textLight,marginBottom:14}}>{event.description}</p>}
          <div style={{display:"flex",gap:10}}>
            <button className="btn-g" onClick={()=>setTab("rawdata")} style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}>
              📄 View Raw Data
            </button>
            <button className="btn-p" style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}>
              ⬇ Download PDF Report
            </button>
          </div>
        </div>
      )}

      {/* Tab content */}
      {isRawData && <RawDataPage event={event} stats={stats} onUpdate={onUpdate}/>}
      {!isRawData && tab==="report" && <CarbonReportTab event={event} stats={stats} onUpdate={onUpdate} onViewRaw={()=>setTab("rawdata")}/>}
      {!isRawData && tab==="overview" && <div style={{padding:"24px 30px"}}><OverviewTab event={event} stats={stats}/></div>}
      {!isRawData && tab==="participants" && <div style={{padding:"24px 30px"}}><ParticipantsTab event={event} onUpdate={onUpdate} stats={stats}/></div>}
      {!isRawData && tab==="invite" && <div style={{padding:"24px 30px"}}><InviteTab event={event} onUpdate={onUpdate}/></div>}
      {!isRawData && tab==="analytics" && <div style={{padding:"24px 30px"}}><AnalyticsTab event={event} stats={stats}/></div>}
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── RAW DATA PAGE ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── CSV parser ──────────────────────────────────────────────────────────────

export default EventPage;
