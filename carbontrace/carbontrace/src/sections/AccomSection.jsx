// Accommodation Emissions section.
// Shows total hotel emissions, average nights per delegate, and a
// nights-distribution bar chart built from submitted participant data.
import T from '../theme';
import { HOTEL_KG } from '../constants';
import { DCard } from '../components/ui/DCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function AccomSection({stats}){
  const hotelTotal_t=(stats.hotelTotal/1000).toFixed(3);
  const withHotel=(stats.valid||stats.submitted).filter(p=>p.hotelNights>0);
  const avgNights=withHotel.length>0?(withHotel.reduce((a,p)=>a+(p.hotelNights||0),0)/withHotel.length).toFixed(1):0;
  const nightsDist={};
  (stats.valid||stats.submitted).forEach(p=>{
    const n=p.hotelNights||0;
    if(!nightsDist[n]) nightsDist[n]=0;
    nightsDist[n]++;
  });
  const barData=Object.entries(nightsDist).sort((a,b)=>+a[0]-+b[0]).map(([nights,count])=>({nights:`${nights}n`,count}));

  return(
    <DCard style={{marginBottom:20}}>
      <div style={{padding:"22px 28px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:9,background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏨</div>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:T.text}}>Accommodation Emissions</div>
            <div style={{fontSize:13,color:T.textMid,marginTop:2}}>Hotel stays associated with the event</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:26,fontWeight:800,fontFamily:"'DM Mono',monospace",color:"#2563eb"}}>{hotelTotal_t}</div>
          <div style={{fontSize:12,color:T.textLight}}>tonnes CO₂e</div>
        </div>
      </div>
      <div style={{padding:"22px 28px"}}>
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"18px 22px",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{color:T.accent,fontSize:15}}>ⓘ</span>
            <span style={{fontWeight:700,fontSize:14,color:T.accent}}>Methodology & Assumptions</span>
          </div>
          <p style={{fontSize:13,color:T.textMid,lineHeight:1.7}}>
            Accommodation emissions are calculated using a per-room-night emission factor of <span style={{color:T.text,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{HOTEL_KG} kg CO₂e/night</span>, sourced from DEFRA 2025 guidelines. One room per participant is assumed.
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
          {[
            {label:"Guests with Hotel",value:withHotel.length,unit:`of ${stats.responders} respondents`},
            {label:"Avg Nights Stayed",value:avgNights,unit:"nights per guest"},
            {label:"Emission Factor",value:`${HOTEL_KG}`,unit:"kg CO₂e / room night"},
          ].map(item=>(
            <div key={item.label} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 18px"}}>
              <div style={{fontSize:12,color:T.textLight,marginBottom:8}}>{item.label}</div>
              <div style={{fontSize:24,fontWeight:800,fontFamily:"'DM Mono',monospace",color:"#2563eb"}}>{item.value}</div>
              <div style={{fontSize:12,color:T.textLight,marginTop:4}}>{item.unit}</div>
            </div>
          ))}
        </div>

        {barData.length>0&&(
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"18px 22px"}}>
            <div style={{fontWeight:600,fontSize:14,color:T.text,marginBottom:14}}>Nights stayed distribution</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} margin={{top:0,right:20,left:0,bottom:0}}>
                <XAxis dataKey="nights" tick={{fill:T.textMid,fontSize:12}}/>
                <YAxis tick={{fill:T.textMid,fontSize:11}} allowDecimals={false}/>
                <Tooltip contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.text}} formatter={v=>[`${v} participants`,"Count"]}/>
                <Bar dataKey="count" fill="#2563eb" radius={[4,4,0,0]} maxBarSize={40}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DCard>
  );
}

// ─── Placeholder Section ──────────────────────────────────────────────────────


export default AccomSection;
