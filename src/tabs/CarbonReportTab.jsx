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

function CarbonReportTab({event,stats,onUpdate,onViewRaw,dataSource,setDataSource}){
  const [activeSection,setActiveSection]=useState("All Sections");

  // Calculate totals based on data source - use actual calculated values
  const totalCO2_t = (stats.totalActual / 1000).toFixed(2);
  const extrapolatedCO2_t = (stats.extrapolated / 1000).toFixed(2);
  const perPerson = stats.responders > 0 ? (stats.avg / 1000).toFixed(3) : "0.000";
  const transportPct = stats.totalActual > 0 ? ((stats.transportTotal / stats.totalActual) * 100).toFixed(0) : "0";
  const hotelPct = stats.totalActual > 0 ? ((stats.hotelTotal / stats.totalActual) * 100).toFixed(0) : "0";
  const largestContrib = parseFloat(transportPct) >= parseFloat(hotelPct) ? "Transport" : "Accommodation";
  const largestPct = Math.max(parseFloat(transportPct) || 0, parseFloat(hotelPct) || 0);
  
  const hasCSV = stats.csvStats?.hasData;
  const hasSurvey = stats.surveyStats?.validCount > 0 || stats.surveyStats?.total > 0;
  
  const DATA_SOURCES = [
    {key:"all", label:"All Data", desc:"Survey + CSV"},
    {key:"survey", label:"Survey Only", desc:`${stats.surveyStats?.count || 0} responses`},
    {key:"csv", label:"CSV Import", desc:hasCSV ? `${stats.csvStats?.count || 0} entries` : "No data"},
  ];

  const showSection=(name)=>activeSection==="All Sections"||activeSection===name;

  return(
    <div style={{background:T.bg,minHeight:"100%",fontFamily:"'DM Sans',sans-serif",color:T.text}}>
      <div style={{padding:"32px 40px",maxWidth:1200}}>

        {/* ── Data Source Filter ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:13,color:T.textMid,fontWeight:500}}>Data Source:</span>
            <div style={{display:"flex",gap:4,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:3}}>
              {DATA_SOURCES.map(src => {
                const isActive = dataSource === src.key;
                const isDisabled = (src.key === "csv" && !hasCSV) || (src.key === "survey" && !hasSurvey);
                return (
                  <button
                    key={src.key}
                    onClick={() => !isDisabled && setDataSource(src.key)}
                    disabled={isDisabled}
                    style={{
                      background: isActive ? T.accent : "transparent",
                      color: isActive ? "#fff" : isDisabled ? T.textLight : T.textMid,
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 12.5,
                      fontWeight: isActive ? 600 : 400,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.5 : 1,
                      transition: "all 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <span>{src.label}</span>
                    <span style={{fontSize:10,opacity:0.8}}>{src.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {dataSource !== "all" && (
            <div style={{display:"flex",alignItems:"center",gap:6,background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:6,padding:"6px 12px"}}>
              <span style={{fontSize:12}}>⚠️</span>
              <span style={{fontSize:12,color:"#92400e"}}>Filtered view: showing {dataSource === "survey" ? "survey" : "CSV"} data only</span>
            </div>
          )}
        </div>

        {/* ── Executive Summary ── */}
        <DCard style={{marginBottom:28,padding:"28px 28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}>
            <span style={{fontSize:18,color:T.accent}}>🌿</span>
            <h2 style={{fontSize:18,fontWeight:700,color:T.text}}>Executive Summary</h2>
          </div>

          {/* KPI row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
            {[
              {label:"Total Carbon Footprint",value:totalCO2_t,unit:`tonnes CO₂e (${stats.responders} valid entries)`,color:T.text},
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
          
          {/* Source breakdown when showing all data */}
          {dataSource === "all" && hasCSV && hasSurvey && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:24}}>
              <div style={{background:T.accentLight,border:`1px solid ${T.accent}30`,borderRadius:10,padding:"14px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{background:T.accent,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4}}>SURVEY</span>
                  <span style={{fontSize:12,color:T.textMid}}>{stats.surveyStats?.validCount || 0} valid entries</span>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:T.accent,fontFamily:"'DM Mono',monospace"}}>{((stats.surveyStats?.totalEmissions || 0) / 1000).toFixed(2)} t</div>
                <div style={{fontSize:11,color:T.textMid}}>Avg: {((stats.surveyStats?.avgEmissions || 0) / 1000).toFixed(3)} t/person</div>
              </div>
              <div style={{background:"#eff6ff",border:"1px solid #2563eb30",borderRadius:10,padding:"14px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{background:"#2563eb",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4}}>CSV IMPORT</span>
                  <span style={{fontSize:12,color:T.textMid}}>{stats.csvStats?.validCount || 0} valid entries</span>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:"#2563eb",fontFamily:"'DM Mono',monospace"}}>{((stats.csvStats?.totalEmissions || 0) / 1000).toFixed(2)} t</div>
                <div style={{fontSize:11,color:T.textMid}}>Avg: {((stats.csvStats?.avgEmissions || 0) / 1000).toFixed(3)} t/person</div>
              </div>
            </div>
          )}

          {/* Info panels */}
          {[
            {icon:"🔑",title:"Key Drivers Analysis",accent:"#d97706",content:
              stats.submitted.length>0
                ?`${largestContrib} accounted for ${largestPct}% of total emissions, making delegate travel the dominant source of the event's carbon footprint. ${stats.responders} of ${stats.total} participants have valid data entries. ${dataSource === "all" ? "Data includes both survey responses and CSV imports." : dataSource === "survey" ? "Showing survey data only." : "Showing CSV import data only."}`
                :"No participant data available. Invite participants to complete the emissions survey or import CSV data."
            },
            {icon:"⚡",title:"Emission Factors Source",accent:T.accent,content:"All emission factors used in this report are sourced from DEFRA 2025 greenhouse gas conversion factors for company reporting.",link:"View DEFRA 2025 Conversion Factors →"},
            {icon:"⬇",title:"Data Transparency",accent:T.accent,content:"For full transparency and audit purposes, the complete raw participant data used in this report is available for download and review.",link:"View & Download Raw Data →",onLinkClick:onViewRaw},
            {icon:"🔄",title:"Data Quality & Methodology",accent:"#2563eb",content:<span>This report is based on <strong style={{color:T.text}}>{stats.responders} valid data entries</strong> out of {stats.total} total. {dataSource === "all" && hasCSV && hasSurvey ? <><span style={{display:"inline-flex",alignItems:"center",gap:5,background:"#dbeafe",color:"#1d4ed8",border:"1px solid rgba(37,99,235,0.2)",borderRadius:6,padding:"1px 8px",fontSize:11.5,fontWeight:600,marginLeft:4,verticalAlign:"middle"}}>Combined data</span> Includes {stats.surveyStats?.validCount || 0} survey + {stats.csvStats?.validCount || 0} CSV valid entries.</> : dataSource === "survey" ? <><span style={{display:"inline-flex",alignItems:"center",gap:5,background:T.accentLight,color:T.accent,border:"1px solid rgba(15,118,110,0.2)",borderRadius:6,padding:"1px 8px",fontSize:11.5,fontWeight:600,marginLeft:4,verticalAlign:"middle"}}>Survey only</span> {stats.surveyStats?.validCount || 0} valid entries. CSV imports excluded.</> : <><span style={{display:"inline-flex",alignItems:"center",gap:5,background:"#fef3c7",color:"#92400e",border:"1px solid rgba(251,191,36,0.3)",borderRadius:6,padding:"1px 8px",fontSize:11.5,fontWeight:600,marginLeft:4,verticalAlign:"middle"}}>CSV only</span> {stats.csvStats?.validCount || 0} valid entries. Survey data excluded.</>}</span>},
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
