// Venue Energy section — estimated electricity consumption at the venue.
// Grid of category cards (Lighting, HVAC, AV, Catering, IT) each showing
// kWh, tCO2e, and a proportional mini-bar.
// UK grid factor applied: 0.177 kg CO2e/kWh (DEFRA 2025).
import T from '../theme';
import { DCard, SectionHeader, MethodologyBox } from '../components/ui/DCard';

function VenueEnergySection({event,onUpdate}){
  const ve=event.venueEnergy||{status:"estimated",gridFactor:0.177,durationDays:1,items:[]};
  const items=ve.items||[];
  const totalKwh=items.reduce((a,i)=>a+i.kWh,0);
  const totalKg=items.reduce((a,i)=>a+i.kWh*(ve.gridFactor||0.177),0);
  const totalT=(totalKg/1000).toFixed(2);
  const COLOR="#d97706";

  return(
    <DCard style={{marginBottom:20}}>
      <SectionHeader icon="⚡" iconBg="#fef9c3" title="Venue Energy"
        subtitle={`Electricity usage · ${ve.durationDays}-day event · estimated`}
        value={totalT} unit="tonnes CO₂e"
        badge={{label:"Estimated",bg:"#fef9c3",color:COLOR,border:"#fde68a"}}/>
      <div style={{padding:"22px 28px"}}>
        <MethodologyBox color={COLOR}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 32px"}}>
            {[
              `UK Grid emission factor: ${ve.gridFactor} kg CO₂e/kWh (DEFRA 2025)`,
              `${ve.durationDays}-day conference duration`,
              "Estimates based on 500-person conference venue benchmarks",
              "Includes conference halls, exhibition areas, and common spaces",
            ].map(l=><div key={l}>· {l}</div>)}
          </div>
        </MethodologyBox>

        {/* Items grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:20}}>
          {items.map(item=>{
            const kg=(item.kWh*(ve.gridFactor||0.177));
            return(
              <div key={item.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:30,height:30,borderRadius:7,background:`${item.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{item.icon}</div>
                  <div style={{fontSize:13,fontWeight:600,color:T.text,flex:1,minWidth:0}}>{item.label}</div>
                </div>
                <div style={{fontSize:11.5,color:T.textLight,marginBottom:8}}>{item.desc}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                  <div>
                    <div style={{fontSize:17,fontWeight:800,fontFamily:"'DM Mono',monospace",color:item.color}}>{(kg/1000).toFixed(3)}</div>
                    <div style={{fontSize:11,color:T.textLight}}>t CO₂e</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:600,fontFamily:"'DM Mono',monospace",color:T.textMid}}>{item.kWh.toLocaleString()}</div>
                    <div style={{fontSize:11,color:T.textLight}}>kWh</div>
                  </div>
                </div>
                {/* Mini bar */}
                <div style={{height:4,borderRadius:2,background:T.border,marginTop:10,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${totalKwh>0?(item.kWh/totalKwh*100).toFixed(0):0}%`,background:item.color,borderRadius:2}}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total footer */}
        <div style={{background:"#fef9c3",border:"1px solid #fde68a",borderRadius:10,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13.5,fontWeight:700,color:COLOR}}>Total Energy Consumption</div>
            <div style={{fontSize:12,color:"#92400e",marginTop:2}}>Factor: {ve.gridFactor} kg CO₂e/kWh · {ve.durationDays} days</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:800,fontFamily:"'DM Mono',monospace",color:COLOR}}>{totalKwh.toLocaleString()}</div>
            <div style={{fontSize:12,color:"#92400e"}}>kWh total</div>
          </div>
        </div>
      </div>
    </DCard>
  );
}


export default VenueEnergySection;
