// Carbon Report tab — the primary reporting view shown to event managers.
// Contains the executive summary (KPI cards + info panels) and the section
// filter button group, then renders each emission section in sequence.
// Sections: Travel, Accommodation, Venue Energy, Food & Beverage,
//           Materials & Waste, Digital, Data Quality.
import { useState } from 'react';
import T from '../theme';
import { SECTIONS, SECTION_ICONS, SC } from '../constants';
import { DCard } from '../components/ui/DCard';
import { hexToRgb } from '../utils/helpers';
import OffsettingCard from '../sections/OffsettingCard';
import TravelSection from '../sections/TravelSection';
import AccomSection from '../sections/AccomSection';
import VenueEnergySection from '../sections/VenueEnergySection';
import FoodBevSection from '../sections/FoodBevSection';
import MaterialsSection from '../sections/MaterialsSection';
import DigitalSection from '../sections/DigitalSection';
import PlaceholderSection from '../sections/PlaceholderSection';
import DataQualitySection from '../sections/DataQualitySection';

function CarbonReportTab({event,stats,onUpdate,onViewRaw}){
  const [activeSection,setActiveSection]=useState("All Sections");

  const totalCO2_t=(stats.extrapolated/1000).toFixed(2);
  const perPerson=(stats.avg/1000).toFixed(3);
  const transportPct=stats.totalActual>0?((stats.transportTotal/stats.totalActual)*100).toFixed(0):"—";
  const hotelPct=stats.totalActual>0?((stats.hotelTotal/stats.totalActual)*100).toFixed(0):"—";
  const largestContrib=parseFloat(transportPct)>=parseFloat(hotelPct)?"Transport":"Accommodation";
  const largestPct=Math.max(parseFloat(transportPct)||0,parseFloat(hotelPct)||0);

  const showSection=(name)=>activeSection==="All Sections"||activeSection===name;

  return(
    <div style={{background:T.bg,minHeight:"100%",fontFamily:"'DM Sans',sans-serif",color:T.text}}>

      {/* ── Report Header ── */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"28px 40px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
              <span style={{fontSize:24,fontWeight:800,letterSpacing:-0.5,color:T.text}}>{event.name}</span>
              <span style={{background:T.accentLight,color:T.accent,border:`1px solid rgba(15,118,110,0.25)`,padding:"3px 10px",borderRadius:20,fontSize:11.5,fontWeight:600}}>Carbon Report</span>
            </div>
            <div style={{color:T.textMid,fontSize:13.5}}>{event.description}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 14px"}}>
            <div style={{width:22,height:22,borderRadius:5,background:"linear-gradient(135deg,#14b8a6,#0f766e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🌍</div>
            <div style={{fontSize:11,color:T.textLight,letterSpacing:0.5}}>Powered by</div>
            <span style={{color:T.text,fontWeight:700,fontSize:13}}>CarbonTrace</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:24,fontSize:13,color:T.textMid}}>
          {event.date&&<span>🗓 {event.date}{event.endDate?` – ${event.endDate}`:""}</span>}
          {event.location&&<span>📍 {event.location}</span>}
          <span>👥 {stats.total} Participants</span>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}>
          <button className="btn-g" onClick={onViewRaw} style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}>
            📄 View Raw Data
          </button>
          <button className="btn-p" style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}>
            ⬇ Download PDF Report
          </button>
        </div>
      </div>

      <div style={{padding:"32px 40px",maxWidth:1200}}>

        {/* ── Executive Summary ── */}
        <DCard style={{marginBottom:28,padding:"28px 28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}>
            <span style={{fontSize:18,color:T.accent}}>🌿</span>
            <h2 style={{fontSize:18,fontWeight:700,color:T.text}}>Executive Summary</h2>
          </div>

          {/* KPI row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
            {[
              {label:"Total Carbon Footprint",value:totalCO2_t,unit:"tonnes CO₂e",color:T.text},
              {label:"Per-Participant Emission",value:perPerson,unit:"tonnes CO₂e per person",color:T.accent},
              {label:"Largest Contributor",value:`${largestPct}%`,unit:largestContrib,color:"#ea580c"},
            ].map(item=>(
              <div key={item.label} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"18px 20px"}}>
                <div style={{fontSize:12,color:T.textLight,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:item.color,opacity:0.8}}/>
                  {item.label}
                </div>
                <div style={{fontSize:28,fontWeight:800,color:item.color,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{item.value}</div>
                <div style={{fontSize:12,color:T.textLight,marginTop:5}}>{item.unit}</div>
              </div>
            ))}
            <OffsettingCard event={event} onUpdate={onUpdate}/>
          </div>

          {/* Info panels */}
          {[
            {icon:"🔑",title:"Key Drivers Analysis",accent:"#d97706",content:
              stats.submitted.length>0
                ?`${largestContrib} accounted for ${largestPct}% of total emissions, making delegate travel the dominant source of the event's carbon footprint. ${stats.responders} of ${stats.total} participants submitted survey responses; emissions for ${stats.total-stats.responders} incomplete entries have been extrapolated using the average emission profile of valid respondents. All figures are derived exclusively from first-party survey data — CSV imports are excluded from calculations.`
                :"No participant data submitted yet. Invite participants to complete the emissions survey to generate a key drivers analysis."
            },
            {icon:"⚡",title:"Emission Factors Source",accent:T.accent,content:"All emission factors used in this report are sourced from DEFRA 2025 greenhouse gas conversion factors for company reporting.",link:"View DEFRA 2025 Conversion Factors →"},
            {icon:"⬇",title:"Data Transparency",accent:T.accent,content:"For full transparency and audit purposes, the complete raw participant data used in this report is available for download and review.",link:"View & Download Raw Data →",onLinkClick:onViewRaw},
            {icon:"🔄",title:"Data Quality & Methodology",accent:"#2563eb",content:<span>This report is based on <strong style={{color:T.text}}>{stats.responders} valid survey responses</strong> out of {stats.total} total registrations. Emissions for {stats.total-stats.responders} incomplete entries have been extrapolated using the average emission profile of valid respondents. All calculations use emission factors from DEFRA 2025 guidelines and are subject to audit verification. <span style={{display:"inline-flex",alignItems:"center",gap:5,background:T.accentLight,color:T.accent,border:`1px solid rgba(15,118,110,0.2)`,borderRadius:6,padding:"1px 8px",fontSize:11.5,fontWeight:600,marginLeft:4,verticalAlign:"middle"}}>Survey data only</span> CSV imports are excluded from all calculations.</span>},
          ].map(panel=>(
            <div key={panel.title} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"18px 22px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:15,color:panel.accent}}>{panel.icon}</span>
                <span style={{fontWeight:700,fontSize:14,color:panel.accent}}>{panel.title}</span>
              </div>
              <div style={{fontSize:13.5,color:T.textMid,lineHeight:1.7}}>{panel.content}</div>
              {panel.link&&<div onClick={panel.onLinkClick||undefined} style={{color:T.accent,fontSize:13,marginTop:8,cursor:panel.onLinkClick?"pointer":"default",fontWeight:500}}>{panel.link}</div>}
            </div>
          ))}
        </DCard>

        {/* ── Section filter button group ── */}
        <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:24,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:4,flexWrap:"wrap"}}>
          {SECTIONS.map(s=>{
            const isActive=activeSection===s;
            const col=SC[s]||T.accent;
            return(
              <button key={s} onClick={()=>setActiveSection(s)}
                style={{background:isActive?(s==="All Sections"?T.accent:`rgba(${hexToRgb(col)},0.08)`):"transparent",color:isActive?(s==="All Sections"?"#fff":col):T.textMid,border:isActive&&s!=="All Sections"?`1px solid rgba(${hexToRgb(col)},0.3)`:"1px solid transparent",borderRadius:7,padding:"7px 14px",fontSize:13,fontWeight:isActive?600:400,cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
                <span style={{fontSize:13}}>{SECTION_ICONS[s]}</span>{s}
              </button>
            );
          })}
        </div>

        {/* ── Section content ── */}
        {showSection("Travel")    && <TravelSection    stats={stats} event={event} onUpdate={onUpdate}/>}
        {showSection("Accommodation") && <AccomSection stats={stats}/>}
        {showSection("Venue Energy")  && <VenueEnergySection event={event} onUpdate={onUpdate}/>}
        {showSection("Food & Beverage")&&<FoodBevSection event={event} onUpdate={onUpdate}/>}
        {showSection("Materials & Waste")&&<MaterialsSection event={event} onUpdate={onUpdate}/>}
        {showSection("Digital")       && <DigitalSection event={event} onUpdate={onUpdate}/>}
        {showSection("Data Quality")  && <DataQualitySection stats={stats} event={event}/>}
      </div>
    </div>
  );
}


export default CarbonReportTab;
