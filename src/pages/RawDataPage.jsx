// Raw Data subpage — navigated to from the "View Raw Data" button in Carbon Report.
//
// Two tabs:
//   Participant Data: merged table of survey responses + CSV import rows.
//     Filters: validity (All/Valid/Invalid) and source (All/Survey/CSV).
//     Survey rows are read-only; CSV rows are replaceable by re-uploading.
//   Emission Factors: reference tables for all DEFRA 2025 factors used in calculations.
//
// Data layer architecture:
//   Layer 1 (Survey): always present, never overwritten by CSV uploads.
//   Layer 2 (CSV import): optional supplementary data, freely replaceable.
//   Download exports the merged view with Source and Validity columns.
import { useState, useRef } from 'react';
import T from '../theme';
import { EF, LOCAL_EF, HOTEL_KG } from '../constants';
import { Card } from '../components/ui';
import { SourceBadge, ValidityBadge, isRowValid } from '../components/ui/Badges';
import { calcEm } from '../utils/calcEm';
import { parseCSV } from '../utils/parseCSV';

function RawDataPage({event,onUpdate,stats}){
  const [activeTab,setActiveTab]=useState("participants"); // participants | factors
  const [search,setSearch]=useState("");
  const [sourceFilter,setSourceFilter]=useState("all"); // all | survey | csv
  const [validFilter,setValidFilter]=useState("all");   // all | valid | invalid
  const [sortCol,setSortCol]=useState(null);
  const [sortDir,setSortDir]=useState("asc");
  const [dragOver,setDragOver]=useState(false);
  const fileRef=React.useRef();

  const csvImport=event.csvData||null;

  // ── Layer 1: Survey rows ────────────────────────────────────────────────────
  const SURVEY_COLS=["Name","Email","Origin","Transport","Distance (km)","Hotel Nights","CO₂ (kg)","Status"];
  const surveyRows=event.participants.map(p=>{
    const co2=p.submitted?calcEm(p):null;
    return {
      _source:"Survey",_submitted:p.submitted,_co2:co2,
      "Name":p.name,"Email":p.email,"Origin":p.origin||"",
      "Transport":p.transport||"","Distance (km)":p.distance||"",
      "Hotel Nights":p.hotelNights||"",
      "CO₂ (kg)":co2!==null?co2.toFixed(2):"",
      "Status":p.submitted?"Submitted":"Pending",
    };
  });

  // ── Layer 2: CSV import rows ────────────────────────────────────────────────
  const csvRows=(csvImport?.rows||[]).map(r=>({...r,_source:"CSV"}));

  // ── Merged column set ───────────────────────────────────────────────────────
  const csvExtraCols=csvImport?csvImport.headers.filter(h=>!SURVEY_COLS.includes(h)):[];
  const allCols=[...SURVEY_COLS,...csvExtraCols];

  const combinedRows=[
    ...surveyRows,
    ...csvRows.map(r=>{const f={...r};allCols.forEach(c=>{if(!(c in f))f[c]="";});return f;}),
  ];

  // ── Counts for filter labels ────────────────────────────────────────────────
  const validSurveyCount=surveyRows.filter(r=>isRowValid(r)===true).length;
  const invalidSurveyCount=surveyRows.filter(r=>isRowValid(r)===false).length;
  const csvCount=csvRows.length;
  const surveySubmitted=surveyRows.filter(r=>r._submitted).length;
  const surveyPending=surveyRows.length-surveySubmitted;
  const surveyTotalCO2=surveyRows.filter(r=>r._co2!==null).reduce((a,r)=>a+(r._co2||0),0);

  // ── Filtering pipeline ──────────────────────────────────────────────────────
  const filtered=combinedRows
    .filter(r=>{
      if(sourceFilter==="survey") return r._source==="Survey";
      if(sourceFilter==="csv")    return r._source==="CSV";
      return true;
    })
    .filter(r=>{
      if(validFilter==="valid")   return isRowValid(r)===true;
      if(validFilter==="invalid") return isRowValid(r)===false;
      return true;
    })
    .filter(r=>{
      if(!search) return true;
      const q=search.toLowerCase();
      return allCols.some(h=>String(r[h]??"").toLowerCase().includes(q));
    });

  const displayRows=[...filtered].sort((a,b)=>{
    if(!sortCol) return 0;
    let av=a[sortCol]??"", bv=b[sortCol]??"";
    const an=parseFloat(av),bn=parseFloat(bv);
    if(!isNaN(an)&&!isNaN(bn)){av=an;bv=bn;}
    else{av=String(av).toLowerCase();bv=String(bv).toLowerCase();}
    return sortDir==="asc"?(av>bv?1:av<bv?-1:0):(av<bv?1:av>bv?-1:0);
  });

  function toggleSort(c){
    if(sortCol===c)setSortDir(d=>d==="asc"?"desc":"asc");
    else{setSortCol(c);setSortDir("asc");}
  }

  // ── CSV upload ──────────────────────────────────────────────────────────────
  function handleFile(file){
    if(!file||!file.name.endsWith(".csv")) return;
    const reader=new FileReader();
    reader.onload=e=>{
      const parsed=parseCSV(e.target.result);
      onUpdate({...event,csvData:{fileName:file.name,uploadedAt:new Date().toISOString(),...parsed}});
    };
    reader.readAsText(file);
  }
  function onDrop(e){e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}
  function removeCSV(){onUpdate({...event,csvData:null});}

  // ── Download ────────────────────────────────────────────────────────────────
  function downloadCSV(){
    const exportCols=["Source","Validity",...allCols];
    const rows=combinedRows.map(r=>{
      const v=isRowValid(r);
      return[r._source,v===null?"N/A":v?"Valid":"Invalid",...allCols.map(h=>r[h]??"")];
    });
    const csv=[[...exportCols],...rows]
      .map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","))
      .join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`${event.name.replace(/\s+/g,"_")}_raw_data.csv`;a.click();
    URL.revokeObjectURL(url);
  }

  // ── Emission factors table data ─────────────────────────────────────────────
  const delegateEFs=[
    {mode:"Air travel",icon:"✈️",factor:EF["Air travel"],unit:"kg CO₂e/passenger km",notes:"International economy average, with RFI uplift"},
    {mode:"Train",icon:"🚆",factor:EF["Train"],unit:"kg CO₂e/passenger km",notes:"National Rail average"},
    {mode:"Car",icon:"🚗",factor:EF["Car"],unit:"kg CO₂e/km",notes:"Average petrol/diesel car"},
    {mode:"Coach/Bus",icon:"🚌",factor:EF["Coach/Bus"],unit:"kg CO₂e/passenger km",notes:"Average coach"},
    {mode:"Carpool",icon:"👥",factor:EF["Carpool"],unit:"kg CO₂e/km",notes:"Average car ÷ 2 occupants"},
    {mode:"Ferry",icon:"⛴️",factor:EF["Ferry"],unit:"kg CO₂e/passenger km",notes:"Foot passenger, cross-channel average"},
    {mode:"Other",icon:"🚲",factor:EF["Other"],unit:"kg CO₂e/passenger km",notes:"Local bus average (fallback)"},
  ];
  const localEFs=Object.entries(LOCAL_EF).map(([mode,factor])=>({mode,factor,unit:"kg CO₂e/passenger km",notes:"Organizer-arranged local transport"}));
  const otherEFs=[
    {mode:"Hotel (per room night)",icon:"🏨",factor:HOTEL_KG,unit:"kg CO₂e/room/night",notes:"UK average hotel energy intensity"},
    {mode:"UK Grid Electricity",icon:"⚡",factor:0.17700,unit:"kg CO₂e/kWh",notes:"UK national grid, 2025"},
  ];

  const modeColors={"Air travel":"#ea580c","Train":"#2563eb","Car":"#16a34a","Coach/Bus":"#d97706","Carpool":"#7c3aed","Ferry":"#0284c7","Other":"#6b7280"};

  return(
    <div style={{background:T.bg,minHeight:"100%",padding:"28px 30px",fontFamily:"'DM Sans',sans-serif"}}>

      {/* ── Page header ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Raw Data</h2>
          <p style={{fontSize:13.5,color:T.textMid}}>
            {combinedRows.length} total rows
            {" · "}<span style={{color:T.accent,fontWeight:600}}>{surveyRows.length} survey</span>
            {" · "}<span style={{color:"#16a34a",fontWeight:600}}>{validSurveyCount} valid</span>
            {" · "}<span style={{color:"#dc2626",fontWeight:600}}>{invalidSurveyCount} invalid</span>
            {csvImport&&<>{" · "}<span style={{color:"#2563eb",fontWeight:600}}>{csvCount} CSV import</span></>}
          </p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {csvImport&&(
            <button className="btn-g" onClick={removeCSV}
              style={{fontSize:13,display:"flex",alignItems:"center",gap:6,color:"#dc2626",border:"1px solid #fecaca"}}>
              ✕ Remove CSV
            </button>
          )}
          <button className="btn-g" onClick={()=>fileRef.current.click()}
            style={{fontSize:13,display:"flex",alignItems:"center",gap:6}}>
            ↑ {csvImport?"Replace CSV":"Import CSV"}
          </button>
          <button className="btn-p" onClick={downloadCSV}
            style={{fontSize:13,display:"flex",alignItems:"center",gap:6}}>
            ⬇ Download CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}}
            onChange={e=>handleFile(e.target.files[0])}/>
        </div>
      </div>

      {/* ── Top-level tabs ── */}
      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,marginBottom:20,background:T.surface,borderRadius:"10px 10px 0 0",overflow:"hidden",border:`1px solid ${T.border}`}}>
        {[
          ["participants",`Participant Data (${combinedRows.length})`],
          ["factors","Emission Factors"],
        ].map(([k,l])=>(
          <button key={k} onClick={()=>setActiveTab(k)}
            style={{background:activeTab===k?T.bg:"transparent",color:activeTab===k?T.accent:T.textMid,
              border:"none",borderBottom:activeTab===k?`2px solid ${T.accent}`:"2px solid transparent",
              padding:"12px 22px",fontSize:13.5,fontWeight:activeTab===k?700:500,cursor:"pointer",
              transition:"all 0.14s",whiteSpace:"nowrap"}}>
            {l}
          </button>
        ))}
      </div>

      {/* ════ PARTICIPANT DATA TAB ════ */}
      {activeTab==="participants"&&(
        <>
          {/* ── Two source KPI cards ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            <Card style={{padding:"18px 22px",borderLeft:`3px solid ${T.accent}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:T.accent,letterSpacing:0.3,textTransform:"uppercase",marginBottom:4}}>Survey Responses</div>
                  <div style={{fontSize:12.5,color:T.textMid}}>Collected via CarbonTrace survey links · read-only</div>
                </div>
                <span style={{background:T.accentLight,color:T.accent,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{surveyRows.length} rows</span>
              </div>
              <div style={{display:"flex",gap:20}}>
                {[
                  {label:"Valid",   value:validSurveyCount,   color:"#16a34a"},
                  {label:"Invalid", value:invalidSurveyCount, color:"#dc2626"},
                  {label:"Total CO₂",value:`${(surveyTotalCO2/1000).toFixed(2)}t`,color:T.text},
                ].map(s=>(
                  <div key={s.label}>
                    <div style={{fontSize:11,color:T.textLight,marginBottom:3}}>{s.label}</div>
                    <div style={{fontSize:17,fontWeight:700,fontFamily:"'DM Mono',monospace",color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card style={{padding:"18px 22px",borderLeft:`3px solid ${csvImport?"#2563eb":T.border}`,opacity:csvImport?1:0.6}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:csvImport?"#2563eb":T.textLight,letterSpacing:0.3,textTransform:"uppercase",marginBottom:4}}>CSV Import</div>
                  <div style={{fontSize:12.5,color:T.textMid}}>
                    {csvImport?<>Uploaded {new Date(csvImport.uploadedAt).toLocaleDateString()} · replaceable</>:"No CSV uploaded yet · drag & drop below"}
                  </div>
                </div>
                {csvImport&&<span style={{background:"#eff6ff",color:"#2563eb",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{csvCount} rows</span>}
              </div>
              {csvImport
                ?<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {csvImport.headers.slice(0,6).map(h=>(
                    <span key={h} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,padding:"2px 8px",fontSize:11.5,color:T.textMid}}>{h}</span>
                  ))}
                  {csvImport.headers.length>6&&<span style={{fontSize:11.5,color:T.textLight}}>+{csvImport.headers.length-6} more</span>}
                </div>
                :<div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={onDrop} onClick={()=>fileRef.current.click()}
                  style={{border:`2px dashed ${dragOver?T.accentMid:T.border}`,borderRadius:8,padding:"14px",background:dragOver?T.accentLight:"transparent",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
                  <span style={{fontSize:12.5,color:T.textMid}}>📂 Drag & drop a CSV or click to browse</span>
                </div>
              }
            </Card>
          </div>

          {/* ── Filter bar ── */}
          <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
            {/* Validity filter */}
            <div style={{display:"flex",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden",flexShrink:0}}>
              {[
                ["all",     `All (${surveyRows.length+csvCount})`,"",       T.text],
                ["valid",   `Valid (${validSurveyCount})`,        "#dcfce7","#16a34a"],
                ["invalid", `Invalid (${invalidSurveyCount})`,    "#fee2e2","#dc2626"],
              ].map(([v,l,bg,col])=>{
                const active=validFilter===v;
                return(
                  <button key={v} onClick={()=>setValidFilter(v)}
                    style={{background:active?(bg||T.bg):"transparent",color:active?col:T.textMid,
                      border:"none",borderRight:`1px solid ${T.border}`,padding:"8px 14px",
                      fontSize:12.5,fontWeight:active?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>
                    {l}
                  </button>
                );
              })}
            </div>
            {/* Source filter */}
            <div style={{display:"flex",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden",flexShrink:0}}>
              {[
                ["all",   "All Sources"],
                ["survey","Survey"],
                ["csv",   "CSV Import"],
              ].map(([v,l])=>{
                const active=sourceFilter===v;
                const col=v==="survey"?T.accent:v==="csv"?"#2563eb":T.text;
                return(
                  <button key={v} onClick={()=>setSourceFilter(v)}
                    style={{background:active?(v==="survey"?T.accentLight:v==="csv"?"#eff6ff":T.bg):"transparent",
                      color:active?col:T.textMid,border:"none",borderRight:`1px solid ${T.border}`,
                      padding:"8px 14px",fontSize:12.5,fontWeight:active?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>
                    {l}
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div style={{flex:1,minWidth:180,position:"relative"}}>
              <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:T.textLight,fontSize:13,pointerEvents:"none"}}>🔍</span>
              <input placeholder="Search across all columns…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px 8px 34px",fontSize:13.5,color:T.text}}/>
            </div>
            <span style={{fontSize:12,color:T.textLight,whiteSpace:"nowrap"}}>{displayRows.length} of {combinedRows.length} rows</span>
          </div>

          {/* ── Merged table ── */}
          <Card style={{overflow:"hidden"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                    <th style={{padding:"10px 14px",fontSize:11.5,fontWeight:600,color:T.textMid,whiteSpace:"nowrap",minWidth:100}}>Source</th>
                    <th style={{padding:"10px 14px",fontSize:11.5,fontWeight:600,color:T.textMid,whiteSpace:"nowrap",minWidth:90}}>Validity</th>
                    {allCols.map(h=>(
                      <th key={h} onClick={()=>toggleSort(h)}
                        style={{padding:"10px 14px",textAlign:"left",fontSize:11.5,fontWeight:600,
                          color:sortCol===h?T.accent:T.textMid,whiteSpace:"nowrap",cursor:"pointer",userSelect:"none",minWidth:110}}>
                        {h} {sortCol===h?(sortDir==="asc"?"↑":"↓"):<span style={{opacity:0.25}}>↕</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.length===0&&(
                    <tr><td colSpan={allCols.length+2} style={{padding:48,textAlign:"center",color:T.textLight,fontSize:13}}>
                      {validFilter==="invalid"&&invalidSurveyCount===0?"All survey entries are valid — no invalid rows"
                        :sourceFilter==="csv"&&!csvImport?"No CSV imported yet"
                        :"No matching rows"}
                    </td></tr>
                  )}
                  {displayRows.map((r,i)=>{
                    const isSurveyRow=r._source==="Survey";
                    const valid=isRowValid(r);
                    const rowBorderColor=valid===false?"#fecaca40":isSurveyRow?T.accent+"30":"#2563eb30";
                    return(
                      <tr key={i} style={{borderBottom:`1px solid ${T.border}`,
                        background:valid===false?"#fff5f5":i%2===0?"transparent":T.bg,
                        borderLeft:`3px solid ${rowBorderColor}`}}>
                        <td style={{padding:"10px 14px"}}><SourceBadge source={r._source}/></td>
                        <td style={{padding:"10px 14px"}}><ValidityBadge valid={valid}/></td>
                        {allCols.map(h=>{
                          const val=r[h]??"";
                          const isStatus=h==="Status";
                          const isCO2=h==="CO₂ (kg)"||h==="CO2 (kg)";
                          const isNum=val!==""&&!isNaN(parseFloat(val))&&isFinite(val);
                          const missing=val==="";
                          return(
                            <td key={h} style={{padding:"10px 14px",textAlign:isNum?"right":"left",
                              fontFamily:isNum||isCO2?"'DM Mono',monospace":"inherit",
                              color:missing?T.textLight:isCO2?T.accent:T.text,
                              fontWeight:isCO2&&!missing?700:400}}>
                              {isStatus&&val
                                ?<span style={{background:val==="Submitted"?"#dcfce7":"#fef9c3",color:val==="Submitted"?"#15803d":"#92400e",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{val}</span>
                                :(val||"—")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{padding:"11px 16px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:T.bg}}>
              <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.textLight}}>
                  <span style={{width:10,height:3,background:T.accent,borderRadius:2,display:"inline-block"}}/>Survey responses are read-only
                </span>
                <span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.textLight}}>
                  <span style={{width:10,height:3,background:"#dc2626",borderRadius:2,display:"inline-block"}}/>Invalid rows highlighted in red · excluded from calculations
                </span>
              </div>
              <button className="btn-g" onClick={downloadCSV} style={{fontSize:12,padding:"6px 14px",display:"flex",alignItems:"center",gap:5}}>⬇ Download merged CSV</button>
            </div>
          </Card>
        </>
      )}

      {/* ════ EMISSION FACTORS TAB ════ */}
      {activeTab==="factors"&&(
        <div style={{display:"flex",flexDirection:"column",gap:20}}>

          {/* Delegate Transport */}
          <Card style={{overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>✈️</span>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>Delegate Transport</div>
                <div style={{fontSize:12,color:T.textMid}}>Applied to participant-reported travel · DEFRA 2025</div>
              </div>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                  {["Mode","Factor","Unit","Notes"].map(h=>(
                    <th key={h} style={{padding:"9px 16px",textAlign:h==="Factor"?"right":"left",fontSize:11.5,fontWeight:600,color:T.textMid}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {delegateEFs.map((row,i)=>(
                  <tr key={row.mode} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"transparent":T.bg}}>
                    <td style={{padding:"11px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:28,height:28,borderRadius:7,background:`${modeColors[row.mode]||"#6b7280"}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{row.icon}</div>
                        <span style={{fontWeight:600,color:modeColors[row.mode]||T.text}}>{row.mode}</span>
                      </div>
                    </td>
                    <td style={{padding:"11px 16px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:14,color:T.accent}}>{row.factor}</td>
                    <td style={{padding:"11px 16px",color:T.textMid,fontSize:12.5}}>{row.unit}</td>
                    <td style={{padding:"11px 16px",color:T.textLight,fontSize:12.5}}>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Local Transport */}
          <Card style={{overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>🗺️</span>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>Local Transport</div>
                <div style={{fontSize:12,color:T.textMid}}>Applied to organizer-arranged legs · DEFRA 2025</div>
              </div>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                  {["Mode","Factor","Unit","Notes"].map(h=>(
                    <th key={h} style={{padding:"9px 16px",textAlign:h==="Factor"?"right":"left",fontSize:11.5,fontWeight:600,color:T.textMid}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {localEFs.map((row,i)=>(
                  <tr key={row.mode} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"transparent":T.bg}}>
                    <td style={{padding:"11px 16px",fontWeight:600,color:"#2563eb"}}>{row.mode}</td>
                    <td style={{padding:"11px 16px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:14,color:"#2563eb"}}>{row.factor}</td>
                    <td style={{padding:"11px 16px",color:T.textMid,fontSize:12.5}}>{row.unit}</td>
                    <td style={{padding:"11px 16px",color:T.textLight,fontSize:12.5}}>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Other factors */}
          <Card style={{overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>🏨</span>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>Accommodation & Energy</div>
                <div style={{fontSize:12,color:T.textMid}}>Applied to hotel nights and venue electricity · DEFRA 2025</div>
              </div>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                  {["Category","Factor","Unit","Notes"].map(h=>(
                    <th key={h} style={{padding:"9px 16px",textAlign:h==="Factor"?"right":"left",fontSize:11.5,fontWeight:600,color:T.textMid}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {otherEFs.map((row,i)=>(
                  <tr key={row.mode} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"transparent":T.bg}}>
                    <td style={{padding:"11px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:16}}>{row.icon}</span>
                        <span style={{fontWeight:600,color:T.text}}>{row.mode}</span>
                      </div>
                    </td>
                    <td style={{padding:"11px 16px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:14,color:T.accent}}>{row.factor}</td>
                    <td style={{padding:"11px 16px",color:T.textMid,fontSize:12.5}}>{row.unit}</td>
                    <td style={{padding:"11px 16px",color:T.textLight,fontSize:12.5}}>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Source attribution */}
          <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:18}}>✅</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#15803d",marginBottom:2}}>DEFRA 2025 Greenhouse Gas Conversion Factors</div>
              <div style={{fontSize:12.5,color:"#166534"}}>All emission factors sourced from the official UK Government conversion factors for company reporting, updated annually.</div>
            </div>
            <a href="https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025" target="_blank" rel="noreferrer"
              style={{marginLeft:"auto",flexShrink:0,color:T.accent,fontSize:12.5,fontWeight:600,textDecoration:"none",whiteSpace:"nowrap"}}>
              View official source →
            </a>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Offsetting Status Card ───────────────────────────────────────────────────

export default RawDataPage;
