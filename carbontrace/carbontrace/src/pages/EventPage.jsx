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
      <span style={{color:T.textLight}}>/ Events /</span>
      <button onClick={()=>isRawData&&setTab("report")} style={{background:"none",border:"none",cursor:isRawData?"pointer":"default",padding:0,color:isRawData?T.accent:T.text,fontWeight:600,fontSize:15}}>{event.name}</button>
      {isRawData&&<><span style={{color:T.textLight}}>/</span><span style={{color:T.text,fontWeight:600}}>Raw Data</span></>}
    </span>
  );

  return(
    <Shell user={user} active="event" activeEventId={event.id} events={events} onNav={onNav} onOpenEvent={onOpenEvent} onLogout={onLogout} noPad={tab==="report"||isRawData}
      title={breadcrumb}
      actions={<StatusBadge status={event.status}/>}>

      {!isRawData && tab!=="report" && (
        <div className="fu" style={{padding:"28px 30px 0"}}>
          <p style={{fontSize:13.5,color:T.textMid,marginBottom:4}}>📍 {event.location} &nbsp;·&nbsp; 🗓 {event.date}{event.endDate?` → ${event.endDate}`:""}</p>
          {event.description&&<p style={{fontSize:13.5,color:T.textLight,marginBottom:20}}>{event.description}</p>}
          <div style={{display:"flex",gap:14,marginBottom:24}}>
            <KpiCard label="Invited"          value={stats.total}/>
            <KpiCard label="Valid Responses"   value={`${stats.responders}/${stats.total}`}   sub="complete entries" accent={T.accent}/>
            <KpiCard label="Response Rate"    value={`${stats.responseRate.toFixed(0)}%`}      accent={stats.responseRate>70?"#16a34a":"#f59e0b"}/>
            <KpiCard label="Actual CO₂"       value={`${stats.totalActual.toFixed(0)} kg`}    sub="from valid entries"/>
            <KpiCard label="Extrapolated CO₂" value={`${(stats.extrapolated/1000).toFixed(2)}t`} sub="full event est." accent={T.accent}/>
          </div>
        </div>
      )}

      {!isRawData && (
        <div style={tab==="report"?{}:{padding:"0 30px"}}>
          <div style={{borderBottom:`1px solid ${T.border}`,display:"flex",paddingLeft:tab==="report"?30:8,background:T.surface,position:tab==="report"?"sticky":"static",top:tab==="report"?57:0,zIndex:30}}>
            {TABS.map(([k,l])=>(
              <button key={k} className={`tab${tab===k?" on":""}`} onClick={()=>setTab(k)} style={k==="report"?{color:tab==="report"?T.accent:T.textMid}:{}}>{l}</button>
            ))}
          </div>
        </div>
      )}

      {isRawData        && <RawDataPage event={event} stats={stats} onUpdate={onUpdate}/>}
      {!isRawData && tab==="report"   && <CarbonReportTab event={event} stats={stats} onUpdate={onUpdate} onViewRaw={()=>setTab("rawdata")}/>}
      {!isRawData && tab==="overview" && <div style={{padding:"24px 30px"}}><OverviewTab event={event} stats={stats}/></div>}
      {!isRawData && tab==="participants"&&<div style={{padding:"24px 30px"}}><ParticipantsTab event={event} onUpdate={onUpdate} stats={stats}/></div>}
      {!isRawData && tab==="invite"   && <div style={{padding:"24px 30px"}}><InviteTab event={event} onUpdate={onUpdate}/></div>}
      {!isRawData && tab==="analytics"&& <div style={{padding:"24px 30px"}}><AnalyticsTab event={event} stats={stats}/></div>}
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── RAW DATA PAGE ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── CSV parser ──────────────────────────────────────────────────────────────

export default EventPage;
