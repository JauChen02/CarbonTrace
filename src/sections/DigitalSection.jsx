// Digital Footprint section — conference app, cloud storage, email, website.
// Emissions are small (sub-0.1t) but included for completeness and
// to support future virtual event planning.
import T from '../theme';
import { DCard, SectionHeader, MethodologyBox } from '../components/ui/DCard';

function DigitalSection({event,onUpdate}){
  const dg=event.digital||{status:"estimated",items:[]};
  const items=dg.items||[];
  const COLOR="#0284c7";
  const totalKg=items.reduce((a,i)=>a+i.kgCO2,0);
  const totalT=(totalKg/1000).toFixed(3);
  const maxKg=Math.max(...items.map(i=>i.kgCO2),1);

  return(
    <DCard style={{marginBottom:20}}>
      <SectionHeader icon="💻" iconBg="#e0f2fe" title="Digital Footprint"
        subtitle="Digital infrastructure and virtual elements · estimated"
        value={totalT} unit="tonnes CO₂e"
        badge={{label:"Estimated",bg:"#e0f2fe",color:COLOR,border:"#bae6fd"}}/>
      <div style={{padding:"22px 28px"}}>
        <MethodologyBox color={COLOR}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 32px"}}>
            {[
              "Conference app: 0.008 kg CO₂e per user per hour",
              "Cloud storage: 0.0001 kg CO₂e per GB per hour",
              "Email communications: ~0.004 kg CO₂e per email",
              "Website traffic: 0.0002 kg CO₂e per visit",
              "Digital emissions represent a small fraction of total footprint",
              "Included for completeness and future virtual event planning",
            ].map(l=><div key={l}>· {l}</div>)}
          </div>
        </MethodologyBox>

        {/* Item rows */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {items.map(item=>{
            const pct=(item.kgCO2/maxKg*100).toFixed(0);
            return(
              <div key={item.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:36,height:36,borderRadius:9,background:`${item.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{item.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13.5,color:T.text}}>{item.label}</div>
                      <div style={{fontSize:12,color:T.textLight,marginTop:1}}>{item.desc} · {item.unit}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                      <div style={{fontSize:17,fontWeight:800,fontFamily:"'DM Mono',monospace",color:item.color}}>{(item.kgCO2/1000).toFixed(4)}</div>
                      <div style={{fontSize:11,color:T.textLight}}>t CO₂e</div>
                    </div>
                  </div>
                  <div style={{height:5,borderRadius:3,background:T.border,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:item.color,borderRadius:3,transition:"width 0.4s"}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div style={{background:"#e0f2fe",border:"1px solid #bae6fd",borderRadius:8,padding:"12px 16px"}}>
          <div style={{fontSize:12.5,color:"#0c4a6e",lineHeight:1.6}}>
            <strong>Note:</strong> Digital emissions represent a small fraction of total conference emissions but are included for completeness.
            These estimates support potential future optimisation of virtual conference elements.
          </div>
        </div>
      </div>
    </DCard>
  );
}


export default DigitalSection;
