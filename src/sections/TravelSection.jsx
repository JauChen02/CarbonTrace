// Travel Emissions section — largest and most complex report section.
//
// Contains three sub-sections:
//   1. Delegate Travel: donut + bar charts, per-mode breakdown rows.
//   2. Emissions by Region: stacked bar + per-region rows (classifyRegion).
//   3. Local Transport: organizer-arranged legs (ferry, coach etc.)
//      with inline add/edit/delete via LegEditor.
//
// All helpers (classifyRegion, REGION_KEYWORDS, REGION_COLORS, legCO2,
// LOCAL_MODES, LegEditor) are co-located here as they're not used elsewhere.
import { useState } from 'react';
import T from '../theme';
import { EF, LOCAL_EF } from '../constants';
import { calcEm } from '../utils/calcEm';
import { DCard } from '../components/ui/DCard';
import { hexToRgb } from '../utils/helpers';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── Travel Section ───────────────────────────────────────────────────────────
// ─── Region classifier ───────────────────────────────────────────────────────
const REGION_KEYWORDS = {
  "UK & Ireland": [
    "uk","united kingdom","england","scotland","wales","northern ireland","ireland",
    "london","manchester","birmingham","bristol","cambridge","oxford","southampton",
    "glasgow","edinburgh","leeds","newcastle","belfast","cardiff","bath","reading",
    "stevenage","woking","andover","luton","newport","basingstoke","sussex",
    "south wales","isle of wight","wells","portsmouth","brighton","coventry",
  ],
  "Asia Pacific": [
    "japan","tokyo","osaka","kyoto","okinawa","takamatsu","nagoya","hiroshima","sendai","sapporo",
    "south korea","korea","seoul","busan","daegu","incheon","gwangju",
    "taiwan","taipei","taichung","kaohsiung","hsinchu",
    "china","beijing","shanghai","shenzhen","guangzhou","chengdu","hong kong","macau",
    "india","mumbai","delhi","bangalore","chennai","hyderabad","pune","kolkata","kharagpur",
    "singapore","malaysia","kuala lumpur","indonesia","jakarta","thailand","bangkok",
    "vietnam","hanoi","ho chi minh","philippines","manila","australia","sydney","melbourne",
    "new zealand","auckland",
  ],
  "Europe": [
    "germany","berlin","munich","hamburg","frankfurt","cologne","stuttgart","düsseldorf",
    "dusseldorf","dortmund","essen","bochum","aachen","karlsruhe","heidelberg","freiburg",
    "ilmenau","chemnitz","erlangen","jena","tubingen","tübingen","leipzig","dresden","zweibrucken",
    "france","paris","grenoble","toulouse","lyon","marseille","bordeaux","nantes","voiron",
    "switzerland","zurich","zürich","bern","geneva","lausanne","basel",
    "netherlands","amsterdam","rotterdam","delft","eindhoven","enschede","leiden","utrecht",
    "belgium","brussels","leuven","bruges","ghent","namur","liège","liege","antwerp",
    "spain","madrid","barcelona","bilbao","valencia","seville","sabadell",
    "italy","rome","milan","naples","turin","florence","bologna","venice","lecce","lamezia",
    "sweden","stockholm","gothenburg","malmö","malmo","lund","linkoping","goteborg",
    "denmark","copenhagen","aarhus","odense",
    "finland","helsinki","espoo","vantaa","tampere","turku",
    "austria","vienna","wien","graz","linz","salzburg","innsbruck",
    "norway","oslo","bergen","trondheim",
    "poland","warsaw","krakow","wroclaw",
    "portugal","lisbon","porto","coimbra",
    "czech republic","prague","czechia","brno",
    "greece","athens","thessaloniki",
    "hungary","budapest",
    "romania","bucharest",
    "croatia","zagreb",
  ],
  "Americas": [
    "usa","united states","us","america","new york","los angeles","san francisco",
    "chicago","boston","dallas","houston","seattle","san jose","washington","miami",
    "canada","toronto","montreal","vancouver","ottawa","calgary",
    "brazil","são paulo","sao paulo","rio de janeiro","brasilia",
    "mexico","mexico city","monterrey",
    "argentina","buenos aires",
    "chile","santiago",
    "colombia","bogota",
    "peru","lima",
  ],
  "Middle East": [
    "israel","tel aviv","jerusalem","haifa","beersheba",
    "saudi arabia","riyadh","jeddah","mecca","medina",
    "uae","dubai","abu dhabi","united arab emirates",
    "turkey","istanbul","ankara","izmir","bursa",
    "iran","tehran",
    "egypt","cairo","alexandria",
    "jordan","amman",
    "lebanon","beirut",
    "qatar","doha",
    "kuwait","bahrain","oman","muscat",
  ],
  "Africa": [
    "south africa","johannesburg","cape town","nigeria","lagos","abuja",
    "kenya","nairobi","ethiopia","addis ababa","ghana","accra",
    "egypt","cairo","morocco","casablanca","rabat","tunisia","algeria",
  ],
};

function classifyRegion(origin){
  if(!origin||origin.trim()==="") return "Unknown";
  const low=origin.toLowerCase();
  // UK & Ireland checked first (before Europe) since city names can overlap
  const order=["UK & Ireland","Asia Pacific","Europe","Americas","Middle East","Africa"];
  for(const region of order){
    const kws=REGION_KEYWORDS[region]||[];
    if(kws.some(kw=>low.includes(kw))) return region;
  }
  return "Other";
}

const REGION_COLORS={
  "UK & Ireland":"#16a34a",
  "Europe":"#2563eb",
  "Asia Pacific":"#ea580c",
  "Americas":"#7c3aed",
  "Middle East":"#d97706",
  "Africa":"#0284c7",
  "Other":"#6b7280",
  "Unknown":"#9ca3af",
};

// ─── Local Transport leg emission helper ─────────────────────────────────────
function legCO2(leg){
  return (leg.factor||0)*(leg.oneWayKm||0)*2*(leg.participantCount||0)/1000; // tonnes
}

// ─── Local Transport inline editor (single leg) ──────────────────────────────
const LOCAL_MODES=[
  {key:"Ferry",  icon:"⛴️"},
  {key:"Coach",  icon:"🚌"},
  {key:"Bus",    icon:"🚌"},
  {key:"Train",  icon:"🚆"},
  {key:"Car",    icon:"🚗"},
  {key:"Other",  icon:"🚲"},
];
function LegEditor({leg,totalInvited,onSave,onCancel}){
  const [f,setF]=useState({
    mode:leg?.mode||"Ferry",
    icon:leg?.icon||"⛴️",
    description:leg?.description||"",
    oneWayKm:leg?.oneWayKm||0,
    factor:leg?.factor||(LOCAL_EF["Ferry"]||0.01871),
    participantCount:leg?.participantCount??totalInvited,
    notes:leg?.notes||"",
  });
  const up=(k,v)=>setF(p=>({...p,[k]:v}));
  const co2Preview=legCO2(f);
  const selectedMode=LOCAL_MODES.find(m=>m.key===f.mode)||LOCAL_MODES[0];

  return(
    <div style={{background:T.bg,border:`1px solid ${T.accent}44`,borderRadius:10,padding:"18px 20px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        {/* Mode */}
        <div>
          <label style={{fontSize:11.5,color:T.textLight,fontWeight:600,display:"block",marginBottom:5}}>Mode</label>
          <select value={f.mode} onChange={e=>{const m=LOCAL_MODES.find(x=>x.key===e.target.value)||LOCAL_MODES[0];up("mode",m.key);up("icon",m.icon);up("factor",LOCAL_EF[m.key]||EF["Other"]);}}
            style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,color:T.text}}>
            {LOCAL_MODES.map(m=><option key={m.key} value={m.key}>{m.icon} {m.key}</option>)}
          </select>
        </div>
        {/* Description */}
        <div>
          <label style={{fontSize:11.5,color:T.textLight,fontWeight:600,display:"block",marginBottom:5}}>Route / Description</label>
          <input value={f.description} onChange={e=>up("description",e.target.value)} placeholder="e.g. Venue → Hotel"
            style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,color:T.text}}/>
        </div>
        {/* One-way distance */}
        <div>
          <label style={{fontSize:11.5,color:T.textLight,fontWeight:600,display:"block",marginBottom:5}}>One-way distance (km)</label>
          <input type="number" min="0" step="0.1" value={f.oneWayKm} onChange={e=>up("oneWayKm",parseFloat(e.target.value)||0)}
            style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,color:T.text,fontFamily:"'DM Mono',monospace"}}/>
        </div>
        {/* Emission factor */}
        <div>
          <label style={{fontSize:11.5,color:T.textLight,fontWeight:600,display:"block",marginBottom:5}}>Emission factor (kg CO₂e/km)</label>
          <input type="number" min="0" step="0.00001" value={f.factor} onChange={e=>up("factor",parseFloat(e.target.value)||0)}
            style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,color:T.text,fontFamily:"'DM Mono',monospace"}}/>
        </div>
        {/* Participant count */}
        <div>
          <label style={{fontSize:11.5,color:T.textLight,fontWeight:600,display:"block",marginBottom:5}}>Participants</label>
          <input type="number" min="0" value={f.participantCount} onChange={e=>up("participantCount",parseInt(e.target.value)||0)}
            style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,color:T.text,fontFamily:"'DM Mono',monospace"}}/>
          <div style={{fontSize:11,color:T.textLight,marginTop:3}}>Default: all {totalInvited} invited</div>
        </div>
        {/* Notes */}
        <div>
          <label style={{fontSize:11.5,color:T.textLight,fontWeight:600,display:"block",marginBottom:5}}>Notes (optional)</label>
          <input value={f.notes} onChange={e=>up("notes",e.target.value)} placeholder="e.g. Return trip included"
            style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,color:T.text}}/>
        </div>
      </div>
      {/* CO₂ preview */}
      <div style={{background:T.accentLight,borderRadius:8,padding:"10px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:13,color:T.accent,fontWeight:600}}>Estimated emissions:</span>
        <span style={{fontSize:16,fontWeight:800,fontFamily:"'DM Mono',monospace",color:T.accent}}>{co2Preview.toFixed(3)} t CO₂e</span>
        <span style={{fontSize:12,color:T.textMid}}>({f.oneWayKm} km × 2 × {f.participantCount} pax × {f.factor} kg/km)</span>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button className="btn-p" onClick={()=>onSave({...leg,...f})} style={{fontSize:13,padding:"8px 20px"}}>Save Leg</button>
        <button className="btn-g" onClick={onCancel} style={{fontSize:13,padding:"8px 16px"}}>Cancel</button>
      </div>
    </div>
  );
}

function TravelSection({stats,event,onUpdate}){
  const [editingId,setEditingId]=useState(null); // leg id being edited, "new", or null
  const legs=event?.localTransport||[];
  const totalInvited=event?.totalInvited||0;

  const delegateTotal=(stats.transportTotal/1000);
  const localTotal=legs.reduce((a,l)=>a+legCO2(l),0);
  const grandTotal=(delegateTotal+localTotal).toFixed(2);

  const modes=Object.entries(stats.tMap).map(([name,v])=>({
    name, emissions:+(v.emissions/1000).toFixed(3),
    emissionsKg:+v.emissions.toFixed(1),
    count:v.count,
    avgDist:v.count>0?Math.round(v.totalDist/v.count):0,
    pct:stats.transportTotal>0?+((v.emissions/stats.transportTotal)*100).toFixed(1):0,
  })).sort((a,b)=>b.emissionsKg-a.emissionsKg);

  // ── Emissions by region ────────────────────────────────────────────────────
  const regionMap={};
  (event?.participants||[]).filter(p=>p.submitted&&p.distance>0).forEach(p=>{
    const region=classifyRegion(p.origin);
    if(!regionMap[region]) regionMap[region]={count:0,emissions:0};
    regionMap[region].count++;
    regionMap[region].emissions+=calcEm(p);
  });
  const regionData=Object.entries(regionMap)
    .map(([name,v])=>({name,count:v.count,emissionsKg:v.emissions,emissionsTon:+(v.emissions/1000).toFixed(2)}))
    .sort((a,b)=>b.emissionsKg-a.emissionsKg);
  const regionTotal=regionData.reduce((a,r)=>a+r.emissionsKg,0);

  const modeColors={"Air travel":"#ea580c","Train":"#2563eb","Car":"#16a34a","Coach/Bus":"#d97706","Carpool":"#7c3aed","Other":"#6b7280","Unknown":"#9ca3af"};
  const CHART_CLR=modes.map(m=>modeColors[m.name]||"#6b7280");
  const donutData=modes.map((m,i)=>({name:m.name,value:m.pct,color:CHART_CLR[i]}));
  const barData=modes.map((m,i)=>({name:m.name,"tCO₂e":m.emissions,fill:CHART_CLR[i]}));

  function saveLeg(updated){
    let newLegs;
    if(editingId==="new") newLegs=[...legs,{...updated,id:`lt-${Date.now()}`}];
    else newLegs=legs.map(l=>l.id===editingId?updated:l);
    onUpdate({...event,localTransport:newLegs});
    setEditingId(null);
  }
  function deleteLeg(id){
    onUpdate({...event,localTransport:legs.filter(l=>l.id!==id)});
  }

  return(
    <DCard style={{marginBottom:20}}>
      {/* Header */}
      <div style={{padding:"22px 28px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:9,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>✈️</div>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:T.text}}>Travel Emissions</div>
            <div style={{fontSize:13,color:T.textMid,marginTop:2}}>The largest contributor to event carbon footprint</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:26,fontWeight:800,fontFamily:"'DM Mono',monospace",color:T.accent}}>{grandTotal}</div>
          <div style={{fontSize:12,color:T.textLight}}>tonnes CO₂e</div>
          {legs.length>0&&<div style={{fontSize:11,color:T.textLight,marginTop:2}}>delegate + local transport</div>}
        </div>
      </div>

      <div style={{padding:"22px 28px"}}>
        {/* Methodology box */}
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"18px 22px",marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{color:T.accent,fontSize:15}}>ⓘ</span>
            <span style={{fontWeight:700,fontSize:14,color:T.accent}}>Methodology & Assumptions</span>
          </div>
          <p style={{fontSize:13,color:T.textMid,lineHeight:1.7,marginBottom:10}}>
            Delegate transport emissions are calculated from participant-reported travel modes and distances. Return journeys are assumed. Local transport legs are organizer-arranged and calculated for all attendees. Emission factors are sourced from DEFRA 2025 conversion factors.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 32px"}}>
            {Object.entries(EF).map(([mode,factor])=>(
              <div key={mode} style={{fontSize:12.5,color:T.textMid,lineHeight:1.9}}>
                · {mode}: <span style={{color:T.text,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{factor} kg CO₂e/passenger km</span>
              </div>
            ))}
            {Object.entries(LOCAL_EF).map(([mode,factor])=>(
              <div key={"local-"+mode} style={{fontSize:12.5,color:T.textMid,lineHeight:1.9}}>
                · {mode} (local): <span style={{color:T.text,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{factor} kg CO₂e/passenger km</span>
              </div>
            ))}
            <div style={{fontSize:12.5,color:T.textMid,lineHeight:1.9}}>· All distances are one-way; return trips calculated as 2× distance</div>
          </div>
        </div>

        {/* ── Delegate Travel sub-section ── */}
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"20px 24px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:T.accent,fontSize:16}}>✈️</span>
              <span style={{fontWeight:700,fontSize:14,color:T.text}}>Delegate Travel (Home to Event)</span>
            </div>
            <div style={{textAlign:"right"}}>
              <span style={{fontSize:18,fontWeight:800,fontFamily:"'DM Mono',monospace",color:T.accent}}>{delegateTotal.toFixed(2)}</span>
              <span style={{fontSize:12,color:T.textLight,marginLeft:4}}>t CO₂e</span>
            </div>
          </div>

          {modes.length>0 ? (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,alignItems:"center"}}>
              <div style={{position:"relative"}}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" startAngle={90} endAngle={-270}>
                      {donutData.map((e,i)=><Cell key={i} fill={e.color} stroke="transparent"/>)}
                    </Pie>
                    <Tooltip formatter={v=>[`${v}%`,"Share"]} contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.text}}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                  {modes[0]&&<><div style={{fontSize:13,fontWeight:700,color:modeColors[modes[0].name]||T.accent}}>{modes[0].name}</div><div style={{fontSize:18,fontWeight:800,fontFamily:"'DM Mono',monospace",color:T.text}}>{modes[0].pct}%</div></>}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px 16px",justifyContent:"center",marginTop:8}}>
                  {modes.map((m,i)=>(
                    <div key={m.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:CHART_CLR[i]}}/>
                      <span style={{color:CHART_CLR[i],fontWeight:600}}>{m.name} {m.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} layout="vertical" margin={{top:0,right:20,left:60,bottom:0}}>
                    <XAxis type="number" tick={{fill:T.textMid,fontSize:11}} unit=" t"/>
                    <YAxis type="category" dataKey="name" tick={{fill:T.textMid,fontSize:12}} width={55}/>
                    <Tooltip formatter={v=>[`${v} tCO₂e`,"Emissions"]} contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.text}} cursor={{fill:"rgba(0,0,0,0.03)"}}/>
                    <Bar dataKey="tCO₂e" radius={[0,4,4,0]} maxBarSize={24}>
                      {barData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : <div style={{color:T.textLight,textAlign:"center",padding:48,fontSize:13}}>No travel data submitted yet</div>}
        </div>

        {/* Per-mode breakdown rows */}
        {modes.map((m,i)=>(
          <div key={m.name} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 22px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:9,background:`rgba(${hexToRgb(CHART_CLR[i]||"#6b7280")},0.1)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                {m.name==="Air travel"?"✈️":m.name==="Train"?"🚆":m.name==="Car"?"🚗":m.name==="Coach/Bus"?"🚌":m.name==="Carpool"?"👥":"🚲"}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:CHART_CLR[i]||T.text}}>{m.name}</div>
                <div style={{fontSize:12,color:T.textLight,marginTop:2}}>~{m.count} delegate{m.count!==1?"s":""} · Avg {m.avgDist.toLocaleString()} km one-way</div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:18,fontWeight:800,fontFamily:"'DM Mono',monospace",color:T.text}}>{m.emissions}</div>
              <div style={{fontSize:12,color:T.textLight}}>tonnes CO₂e</div>
            </div>
          </div>
        ))}
        {modes.length===0&&<div style={{color:T.textLight,textAlign:"center",padding:32,fontSize:13}}>No transport data submitted yet.</div>}

        {/* ── Emissions by Region ── */}
        {regionData.length>0&&(
          <div style={{marginTop:28}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:32,height:32,borderRadius:8,background:"#fef9c3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🌍</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:T.text}}>Emissions by Region</div>
                <div style={{fontSize:12,color:T.textMid}}>Delegate travel grouped by origin region · survey respondents only</div>
              </div>
            </div>

            {/* Stacked bar */}
            <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 20px",marginBottom:12}}>
              <div style={{fontSize:12,color:T.textLight,marginBottom:8,fontWeight:500}}>Share of delegate travel emissions</div>
              <div style={{display:"flex",height:12,borderRadius:6,overflow:"hidden",marginBottom:10}}>
                {regionData.map(r=>{
                  const pct=regionTotal>0?(r.emissionsKg/regionTotal*100):0;
                  return pct>0&&(
                    <div key={r.name} title={`${r.name}: ${pct.toFixed(1)}%`}
                      style={{width:`${pct}%`,background:REGION_COLORS[r.name]||"#6b7280",transition:"width 0.3s"}}/>
                  );
                })}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px 18px"}}>
                {regionData.map(r=>{
                  const pct=regionTotal>0?(r.emissionsKg/regionTotal*100).toFixed(1):0;
                  return(
                    <div key={r.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:REGION_COLORS[r.name]||"#6b7280",flexShrink:0}}/>
                      <span style={{color:REGION_COLORS[r.name]||T.textMid,fontWeight:600}}>{r.name}</span>
                      <span style={{color:T.textLight}}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-region rows */}
            {regionData.map(r=>{
              const pct=regionTotal>0?(r.emissionsKg/regionTotal*100).toFixed(1):0;
              const color=REGION_COLORS[r.name]||"#6b7280";
              return(
                <div key={r.name} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"14px 20px",marginBottom:8,display:"flex",alignItems:"center",gap:14}}>
                  {/* Color dot */}
                  <div style={{width:10,height:10,borderRadius:"50%",background:color,flexShrink:0}}/>
                  {/* Region name + count */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,color:color}}>{r.name}</div>
                    <div style={{fontSize:12,color:T.textLight,marginTop:2}}>~{r.count} delegate{r.count!==1?"s":""}</div>
                  </div>
                  {/* Progress bar */}
                  <div style={{flex:2,maxWidth:240}}>
                    <div style={{height:6,borderRadius:3,background:T.border,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width 0.4s"}}/>
                    </div>
                    <div style={{fontSize:11,color:T.textLight,marginTop:3,textAlign:"right"}}>{pct}% of transport</div>
                  </div>
                  {/* Emissions value */}
                  <div style={{textAlign:"right",minWidth:90}}>
                    <div style={{fontSize:18,fontWeight:800,fontFamily:"'DM Mono',monospace",color:T.text}}>{r.emissionsTon}</div>
                    <div style={{fontSize:12,color:T.textLight}}>t CO₂e</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Local Transport sub-section ── */}
        <div style={{marginTop:28}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🗺️</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:T.text}}>Local Transport</div>
                <div style={{fontSize:12,color:T.textMid}}>Organizer-arranged transport · applies to all attendees</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:18,fontWeight:800,fontFamily:"'DM Mono',monospace",color:"#2563eb"}}>{localTotal.toFixed(3)}</div>
                <div style={{fontSize:12,color:T.textLight}}>t CO₂e</div>
              </div>
              {editingId!=="new"&&(
                <button className="btn-g" onClick={()=>setEditingId("new")}
                  style={{fontSize:12.5,padding:"7px 14px",display:"flex",alignItems:"center",gap:5,borderColor:"#bfdbfe",color:"#2563eb"}}>
                  + Add Leg
                </button>
              )}
            </div>
          </div>

          {/* New leg editor */}
          {editingId==="new"&&(
            <div style={{marginBottom:12}}>
              <LegEditor leg={null} totalInvited={totalInvited} onSave={saveLeg} onCancel={()=>setEditingId(null)}/>
            </div>
          )}

          {/* Existing legs */}
          {legs.length===0&&editingId!=="new"&&(
            <div style={{background:T.bg,border:`2px dashed ${T.border}`,borderRadius:10,padding:"24px",textAlign:"center"}}>
              <div style={{fontSize:13,color:T.textLight,marginBottom:8}}>No local transport legs added yet</div>
              <div style={{fontSize:12.5,color:T.textLight}}>Add organizer-arranged transport (shuttles, ferries, coaches) that applies to all attendees</div>
            </div>
          )}

          {legs.map(leg=>{
            const co2=legCO2(leg);
            const isEditing=editingId===leg.id;
            return(
              <div key={leg.id} style={{marginBottom:10}}>
                {isEditing?(
                  <LegEditor leg={leg} totalInvited={totalInvited} onSave={saveLeg} onCancel={()=>setEditingId(null)}/>
                ):(
                  <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:9,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{leg.icon||"🚌"}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:"#2563eb"}}>{leg.mode}{leg.description?` · ${leg.description}`:""}</div>
                        <div style={{fontSize:12,color:T.textLight,marginTop:2}}>
                          Return trip: {(leg.oneWayKm*2).toFixed(1)} km ({leg.oneWayKm} km each way)
                          {" · "}Factor: <span style={{fontFamily:"'DM Mono',monospace"}}>{leg.factor}</span> kg CO₂e/km
                          {" · "}{leg.participantCount} attendees
                          {leg.notes&&<> · {leg.notes}</>}
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:18,fontWeight:800,fontFamily:"'DM Mono',monospace",color:"#2563eb"}}>{co2.toFixed(3)}</div>
                        <div style={{fontSize:12,color:T.textLight}}>t CO₂e</div>
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>setEditingId(leg.id)} title="Edit"
                          style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 9px",cursor:"pointer",fontSize:13,color:T.textMid}}>✎</button>
                        <button onClick={()=>deleteLeg(leg.id)} title="Delete"
                          style={{background:"none",border:"1px solid #fecaca",borderRadius:6,padding:"5px 9px",cursor:"pointer",fontSize:13,color:"#dc2626"}}>✕</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Total footer */}
          {legs.length>0&&(
            <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
              <span style={{fontSize:13,fontWeight:600,color:"#2563eb"}}>Total Local Transport ({legs.length} leg{legs.length!==1?"s":""})</span>
              <div>
                <span style={{fontSize:18,fontWeight:800,fontFamily:"'DM Mono',monospace",color:"#2563eb"}}>{localTotal.toFixed(3)}</span>
                <span style={{fontSize:12,color:"#2563eb",marginLeft:5}}>t CO₂e</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DCard>
  );
}


export default TravelSection;
