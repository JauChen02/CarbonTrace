// Analytics tab — deeper charts and AI insights.
// Charts: average emissions by transport mode (bar),
//         transport vs hotel per-participant comparison (stacked bar).
// AI Insights: sends event stats to Claude claude-sonnet-4-20250514 via the
//   Anthropic API and streams back a natural-language analysis.
import { useState } from 'react';
import T from '../theme';
import { EF, HOTEL_KG } from '../constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({event,stats}){
  const [insight,setInsight]=useState("");
  const [busy,setBusy]=useState(false);
  const CLR=["#0d9488","#2563eb","#f59e0b","#ef4444","#8b5cf6","#10b981"];
  const barData=Object.entries(stats.tMap).map(([name,v],i)=>({name,"Avg CO₂ (kg)":+(v.emissions/v.count).toFixed(1),count:v.count,fill:CLR[i%CLR.length]}));
  const hotelData=stats.submitted.filter(p=>p.hotelNights>0).map(p=>({name:p.name.split(" ")[0],hotelKg:+(p.hotelNights*HOTEL_KG).toFixed(1),transportKg:+((EF[p.transport]||EF["Other"])*p.distance*2).toFixed(1)})).sort((a,b)=>(b.hotelKg+b.transportKg)-(a.hotelKg+a.transportKg)).slice(0,10);
  async function generate(){
    setBusy(true);setInsight("");
    const s=`Event: ${event.name} in ${event.location}. ${stats.total} participants, ${stats.responders} responded (${stats.responseRate.toFixed(0)}%). CO₂: ${stats.totalActual.toFixed(0)} kg actual, ${stats.extrapolated.toFixed(0)} kg extrapolated. Avg: ${stats.avg.toFixed(0)} kg/person. Transport: ${JSON.stringify(stats.tMap)}.`;
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`You are a sustainability consultant. Provide 3–4 specific, data-driven carbon reduction recommendations. Be concise and use exact numbers. ${s}`}]})});const data=await res.json();setInsight(data.content?.map(b=>b.text||"").join("")||"No insights.");}catch{setInsight("Unable to connect.");}
    setBusy(false);
  }
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:22}}>
        <div>
          <div style={{fontSize:13.5,fontWeight:600,marginBottom:14}}>Avg Emissions by Transport</div>
          {barData.length>0?<ResponsiveContainer width="100%" height={240}><BarChart data={barData} margin={{top:5,right:20,left:0,bottom:40}}><XAxis dataKey="name" tick={{fill:T.textMid,fontSize:11}} angle={-20} textAnchor="end"/><YAxis tick={{fill:T.textMid,fontSize:11}} unit=" kg"/><Tooltip contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12}} formatter={(v,n,p)=>[`${v} kg avg (${p.payload.count} people)`,"Avg CO₂"]}/><Bar dataKey="Avg CO₂ (kg)" radius={[4,4,0,0]}>{barData.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar></BarChart></ResponsiveContainer>:<div style={{color:T.textLight,textAlign:"center",padding:60,fontSize:13}}>No data</div>}
        </div>
        <div>
          <div style={{fontSize:13.5,fontWeight:600,marginBottom:14}}>Transport vs Accommodation</div>
          {hotelData.length>0?<ResponsiveContainer width="100%" height={240}><BarChart data={hotelData} margin={{top:5,right:20,left:0,bottom:40}}><XAxis dataKey="name" tick={{fill:T.textMid,fontSize:11}} angle={-30} textAnchor="end"/><YAxis tick={{fill:T.textMid,fontSize:11}} unit=" kg"/><Tooltip contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12}}/><Legend wrapperStyle={{fontSize:12}}/><Bar dataKey="transportKg" name="Transport" fill="#2563eb" stackId="a"/><Bar dataKey="hotelKg" name="Hotel" fill="#f59e0b" stackId="a" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>:<div style={{color:T.textLight,textAlign:"center",padding:60,fontSize:13}}>No data with hotel stays</div>}
        </div>
      </div>
      <Card style={{padding:"22px 24px",border:`1px solid #a7f3d0`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:14.5,fontWeight:700,display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{background:T.accentLight,borderRadius:6,padding:"3px 8px",fontSize:13}}>✨</span>AI Sustainability Insights</div>
            <div style={{fontSize:12.5,color:T.textMid}}>Data-driven recommendations powered by Claude</div>
          </div>
          <button className="btn-p" onClick={generate} disabled={busy||stats.responders===0}>{busy?<><span className="spin">⟳</span> Analysing…</>:"Generate Insights"}</button>
        </div>
        {insight?<div style={{fontSize:13.5,color:T.text,lineHeight:1.8,whiteSpace:"pre-wrap",background:T.bg,padding:"16px 18px",borderRadius:8}}>{insight}</div>:<div style={{color:T.textLight,fontSize:13,padding:"10px 0"}}>Click "Generate Insights" to get AI-powered recommendations.</div>}
      </Card>
    </div>
  );
}


export default AnalyticsTab;
