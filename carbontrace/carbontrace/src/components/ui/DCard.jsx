// Shared card primitives for the Carbon Report sections.
//
// DCard: elevated report card (white surface, tinted border).
// SectionHeader: standardised header row with icon, title, value, and an optional badge.
// MethodologyBox: tinted info panel for methodology & assumptions notes.
import T from '../../theme';
import { hexToRgb } from '../../utils/helpers';

function DCard({children,style={}}){
  return <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,...style}}>{children}</div>;
}


function SectionHeader({icon,iconBg,title,subtitle,value,unit,badge}){
  return(
    <div style={{padding:"22px 28px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:9,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:T.text}}>{title}</div>
          {subtitle&&<div style={{fontSize:13,color:T.textMid,marginTop:2}}>{subtitle}</div>}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {badge&&<span style={{background:badge.bg,color:badge.color,border:`1px solid ${badge.border}`,padding:"3px 12px",borderRadius:20,fontSize:11.5,fontWeight:600}}>{badge.label}</span>}
        {value!==undefined&&(
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:26,fontWeight:800,fontFamily:"'DM Mono',monospace",color:T.accent}}>{value}</div>
            <div style={{fontSize:12,color:T.textLight}}>{unit}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MethodologyBox({color,children}){
  return(
    <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 20px",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
        <span style={{color,fontSize:14}}>ⓘ</span>
        <span style={{fontWeight:700,fontSize:13.5,color}}>Methodology & Assumptions</span>
      </div>
      <div style={{fontSize:12.5,color:T.textMid,lineHeight:1.8}}>{children}</div>
    </div>
  );
}


export { DCard, SectionHeader, MethodologyBox };
