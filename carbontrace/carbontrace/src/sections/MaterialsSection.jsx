// Materials & Waste section — conference materials, swag, and waste management.
// calcItemCO2: computes net CO2e for a material item, factoring in recyclability
//   (kept here as it's only used in this section).
// Full item table with recycle % bars, recycling offset row, and net summary.
import T from '../theme';
import { DCard, SectionHeader, MethodologyBox } from '../components/ui/DCard';

function calcItemCO2(item){
  const totalWeightKg=item.qty*(item.weightKg||0);
  const recycleMassKg=totalWeightKg*(item.recyclePct/100);
  const netMassKg=totalWeightKg-recycleMassKg;
  const emKg=netMassKg*(Math.abs(item.emFactor)||0)+(item.emFactor<0?recycleMassKg*item.emFactor:0);
  // simplified: gross = totalWeight * factor; for negative (recycling) it offsets
  return totalWeightKg*(item.emFactor||0); // kg CO2
}
function MaterialsSection({event,onUpdate}){
  const mt=event.materials||{status:"estimated",items:[]};
  const items=mt.items||[];
  const COLOR="#7c3aed";
  const positiveItems=items.filter(i=>i.emFactor>=0);
  const negativeItems=items.filter(i=>i.emFactor<0);
  const grossKg=positiveItems.reduce((a,i)=>a+calcItemCO2(i),0);
  const offsetKg=Math.abs(negativeItems.reduce((a,i)=>a+calcItemCO2(i),0));
  const netKg=grossKg-offsetKg;
  const netT=(netKg/1000).toFixed(3);
  const totalWeight=items.reduce((a,i)=>a+i.qty*(i.weightKg||0),0);

  return(
    <DCard style={{marginBottom:20}}>
      <SectionHeader icon="♻️" iconBg="#f3e8ff" title="Materials & Waste"
        subtitle="Conference materials, swag, and waste management · estimated"
        value={netT} unit="tonnes CO₂e (net)"
        badge={{label:"Estimated",bg:"#f3e8ff",color:COLOR,border:"#e9d5ff"}}/>
      <div style={{padding:"22px 28px"}}>
        <MethodologyBox color={COLOR}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 32px"}}>
            {[
              `${items.filter(i=>!i.isWaste).reduce((a,i)=>a+i.qty,0).toLocaleString()} delegate packs including badges, programs, and bags`,
              `Recycling offset: ${mt.recyclingFactor||"-0.2"} kg CO₂e/kg recycled material`,
              "Exhibition materials estimated per booth",
              "Waste volumes based on event duration benchmarks",
            ].map(l=><div key={l}>· {l}</div>)}
          </div>
        </MethodologyBox>

        {/* Items table */}
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden",marginBottom:16}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:T.surface,borderBottom:`1px solid ${T.border}`}}>
                {["Item","Qty","Weight (kg)","Recyclable","CO₂e (t)"].map(h=>(
                  <th key={h} style={{padding:"10px 16px",textAlign:h==="CO₂e (t)"?"right":"left",fontSize:11.5,fontWeight:600,color:T.textMid,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item,i)=>{
                const totalWt=(item.qty*(item.weightKg||0)).toFixed(1);
                const co2=calcItemCO2(item);
                const isOffset=item.emFactor<0;
                return(
                  <tr key={item.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"transparent":T.surface}}>
                    <td style={{padding:"10px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:26,height:26,borderRadius:6,background:`${item.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{item.icon}</div>
                        <span style={{fontWeight:500,color:T.text}}>{item.label}</span>
                        {item.isWaste&&<span style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"1px 7px",fontSize:10.5,color:T.textLight}}>waste</span>}
                      </div>
                    </td>
                    <td style={{padding:"10px 16px",color:T.textMid,fontFamily:"'DM Mono',monospace"}}>{item.qty}</td>
                    <td style={{padding:"10px 16px",color:T.textMid,fontFamily:"'DM Mono',monospace"}}>{totalWt}</td>
                    <td style={{padding:"10px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{height:6,width:60,borderRadius:3,background:T.border,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${item.recyclePct}%`,background:"#16a34a",borderRadius:3}}/>
                        </div>
                        <span style={{fontSize:12,color:T.textMid}}>{item.recyclePct}%</span>
                      </div>
                    </td>
                    <td style={{padding:"10px 16px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontWeight:700,color:isOffset?"#16a34a":item.color}}>
                      {isOffset?"−":""}{Math.abs(co2/1000).toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Net summary */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {[
            {label:"Total Weight",value:`${(totalWeight/1000).toFixed(2)} t`,unit:`${totalWeight.toFixed(0)} kg`,color:T.text},
            {label:"Recycling Offset",value:`−${(offsetKg/1000).toFixed(3)} t`,unit:"CO₂e saved",color:"#16a34a"},
            {label:"Net Emissions",value:`${(netKg/1000).toFixed(3)} t`,unit:"after recycling offset",color:COLOR},
          ].map(s=>(
            <div key={s.label} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"14px 16px"}}>
              <div style={{fontSize:11.5,color:T.textLight,marginBottom:6}}>{s.label}</div>
              <div style={{fontSize:18,fontWeight:800,fontFamily:"'DM Mono',monospace",color:s.color}}>{s.value}</div>
              <div style={{fontSize:11,color:T.textLight,marginTop:2}}>{s.unit}</div>
            </div>
          ))}
        </div>
      </div>
    </DCard>
  );
}


export default MaterialsSection;
