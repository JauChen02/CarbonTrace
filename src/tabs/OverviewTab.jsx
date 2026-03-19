// Overview tab — visual summary of event emissions.
// Extrapolation warning banner (when not all participants have submitted).
// Charts: emissions by transport mode (pie), confirmed vs extrapolated (bar),
// and top emitters (horizontal bar sorted by total CO2).
import T from '../theme';
import { calcEm } from '../utils/calcEm';
import { HOTEL_KG, EF } from '../constants';
import { Avatar } from '../components/ui';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({event,stats,dataSource,setDataSource}){
  const CLR=["#0d9488","#2563eb","#f59e0b","#ef4444","#8b5cf6","#10b981"];
  const pieData=Object.entries(stats.tMap).map(([name,v],i)=>({name,value:+v.emissions.toFixed(1),count:v.count,color:CLR[i%CLR.length]}));
  const confirmed=+stats.totalActual.toFixed(1);
  const extrapolatedOnly=+Math.max(0,stats.extrapolated-stats.totalActual).toFixed(1);
  
  const hasCSV = stats.csvStats?.hasData;
  const hasSurvey = stats.surveyStats?.count > 0 || stats.surveyStats?.total > 0;
  const DATA_SOURCES = [
    {key:"all", label:"All Data"},
    {key:"survey", label:"Survey Only"},
    {key:"csv", label:"CSV Import"},
  ];
  
  return(
    <div>
      {/* Data Source Filter */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
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
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.5 : 1,
                }}
              >
                {src.label}
              </button>
            );
          })}
        </div>
        {dataSource !== "all" && (
          <span style={{fontSize:11,color:"#92400e",background:"#fef3c7",padding:"3px 8px",borderRadius:4}}>Filtered</span>
        )}
      </div>
      {stats.total>stats.responders&&(
        <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"13px 18px",marginBottom:20,display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:17}}>⚡</span>
          <div>
            <div style={{fontWeight:600,color:"#92400e",fontSize:13.5,marginBottom:2}}>Extrapolation Active</div>
            <div style={{color:"#78350f",fontSize:13,lineHeight:1.6}}>
              {stats.total-stats.responders} participant{stats.total-stats.responders>1?"s":""} haven't submitted. Using <strong>{stats.avg.toFixed(1)} kg CO₂</strong> average — extrapolated total: <strong>{(stats.extrapolated/1000).toFixed(3)} t CO₂</strong>.
            </div>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div>
          <div style={{fontSize:13.5,fontWeight:600,marginBottom:14}}>Emissions by Transport Mode</div>
          {pieData.length>0?(
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={82} dataKey="value" label={({name,percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} kg CO₂`,"Emissions"]} contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12}}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
              </PieChart>
            </ResponsiveContainer>
          ):<div style={{color:T.textLight,textAlign:"center",padding:60,fontSize:13}}>No data yet</div>}
        </div>
        <div>
          <div style={{fontSize:13.5,fontWeight:600,marginBottom:14}}>Confirmed vs Extrapolated</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{name:"Event CO₂",confirmed,extrapolated:extrapolatedOnly}]} margin={{top:10,right:20,left:0,bottom:0}}>
              <XAxis dataKey="name" tick={{fontSize:12,fill:T.textMid}}/>
              <YAxis tick={{fontSize:11,fill:T.textMid}} unit=" kg"/>
              <Tooltip contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12}} formatter={(v,n)=>[`${v.toFixed(1)} kg`,n==="confirmed"?"Confirmed":"Extrapolated"]}/>
              <Legend wrapperStyle={{fontSize:12}} formatter={v=>v==="confirmed"?"Confirmed":"Extrapolated"}/>
              <Bar dataKey="confirmed" stackId="a" fill="#0d9488"/>
              <Bar dataKey="extrapolated" stackId="a" fill="#f59e0b" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <div style={{fontSize:13.5,fontWeight:600,marginBottom:14}}>Top Emitters</div>
          {stats.submitted.length===0?<div style={{color:T.textLight,textAlign:"center",padding:32,fontSize:13}}>No submissions yet</div>:(
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {[...stats.submitted].sort((a,b)=>calcEm(b)-calcEm(a)).slice(0,8).map(p=>{
                const em=calcEm(p);
                const max=calcEm([...stats.submitted].sort((a,b)=>calcEm(b)-calcEm(a))[0]);
                return(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:12}}>
                    <Avatar name={p.name} size={26}/>
                    <div style={{width:120,fontSize:13,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                    <div style={{width:76,fontSize:11.5,color:T.textMid}}>{p.transport||"—"}</div>
                    <div style={{flex:1,height:6,background:"#f3f4f6",borderRadius:10,overflow:"hidden"}}>
                      <div style={{width:`${(em/max)*100}%`,height:"100%",background:em>2000?"#ef4444":em>500?"#f59e0b":"#0d9488",borderRadius:10,transition:"width 0.6s"}}/>
                    </div>
                    <div style={{width:66,textAlign:"right",fontSize:12.5,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{em.toFixed(0)} kg</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default OverviewTab;
