// Food & Beverage section — estimated catering emissions.
// calcMealCO2: computes total CO2e for a meal based on serving count
//   and meat/veg/vegan dietary split (kept here as it's only used in this section).
// Per-meal cards show a colour-coded dietary split bar and CO2e total.
import T from '../theme';
import { DCard, SectionHeader, MethodologyBox } from '../components/ui/DCard';

function calcMealCO2(m){
  const totalServings=m.servings;
  const meatS=totalServings*(m.meatPct/100);
  const vegS=totalServings*(m.vegPct/100);
  const veganS=totalServings*(m.veganPct/100);
  return meatS*m.meatKg + vegS*m.vegKg + veganS*m.veganKg;
}
function FoodBevSection({event,onUpdate}){
  const fb=event.foodBev||{status:"estimated",wastePct:15,localSourcingPct:50,meals:[]};
  const meals=fb.meals||[];
  const COLOR="#ea580c";
  const rawCO2=meals.reduce((a,m)=>a+calcMealCO2(m),0);
  const wasteCO2=rawCO2*(fb.wastePct/100);
  const totalCO2=rawCO2+wasteCO2;
  const totalT=(totalCO2/1000).toFixed(2);
  const totalServings=meals.reduce((a,m)=>a+m.servings,0);

  const dietColors={meat:"#ea580c",veg:"#16a34a",vegan:"#2563eb"};

  return(
    <DCard style={{marginBottom:20}}>
      <SectionHeader icon="🍽️" iconBg="#ffedd5" title="Food & Beverage"
        subtitle="Catering services for event attendees · estimated"
        value={totalT} unit="tonnes CO₂e"
        badge={{label:"Estimated",bg:"#ffedd5",color:COLOR,border:"#fed7aa"}}/>
      <div style={{padding:"22px 28px"}}>
        <MethodologyBox color={COLOR}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 32px"}}>
            {[
              "Meat-based meals: 2.5–8.0 kg CO₂e per serving (varies by meal)",
              "Vegetarian meals: 1.2–3.5 kg CO₂e per serving",
              "Vegan meals: 0.8–2.0 kg CO₂e per serving",
              `Food waste: ${fb.wastePct}% of total food emissions`,
              `Local sourcing reduces emissions by 10–20%`,
              "Factors derived from DEFRA food & drink lifecycle data",
            ].map(l=><div key={l}>· {l}</div>)}
          </div>
        </MethodologyBox>

        {/* Meal cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12,marginBottom:20}}>
          {meals.map(m=>{
            const co2=calcMealCO2(m);
            return(
              <div key={m.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:20}}>{m.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.text}}>{m.label}</div>
                    <div style={{fontSize:11.5,color:T.textLight}}>{m.servings.toLocaleString()} servings</div>
                  </div>
                </div>
                {/* Dietary split bar */}
                <div style={{height:8,borderRadius:4,overflow:"hidden",display:"flex",marginBottom:8}}>
                  {m.meatPct>0&&<div style={{width:`${m.meatPct}%`,background:dietColors.meat}} title={`Meat ${m.meatPct}%`}/>}
                  {m.vegPct>0&&<div style={{width:`${m.vegPct}%`,background:dietColors.veg}} title={`Veg ${m.vegPct}%`}/>}
                  {m.veganPct>0&&<div style={{width:`${m.veganPct}%`,background:dietColors.vegan}} title={`Vegan ${m.veganPct}%`}/>}
                </div>
                <div style={{display:"flex",gap:10,marginBottom:10}}>
                  {[["Meat",m.meatPct,dietColors.meat],["Veg",m.vegPct,dietColors.veg],["Vegan",m.veganPct,dietColors.vegan]].map(([l,p,c])=>p>0&&(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:3,fontSize:11}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:c}}/>
                      <span style={{color:T.textLight}}>{l}: {p}%</span>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderTop:`1px solid ${T.border}`,paddingTop:8}}>
                  <div style={{fontSize:11.5,color:T.textLight}}>CO₂e</div>
                  <div style={{fontSize:17,fontWeight:800,fontFamily:"'DM Mono',monospace",color:COLOR}}>{(co2/1000).toFixed(3)} t</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
          {[
            {label:"Total Servings",value:totalServings.toLocaleString(),unit:"meals",color:T.text},
            {label:"Food Waste Emissions",value:`${(wasteCO2/1000).toFixed(3)} t`,unit:`at ${fb.wastePct}% waste rate`,color:"#d97706"},
            {label:"Avg Local Sourcing",value:`${fb.localSourcingPct}%`,unit:"of ingredients",color:"#16a34a"},
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


export default FoodBevSection;
