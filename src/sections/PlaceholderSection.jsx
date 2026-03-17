// Fallback section card shown when a new event doesn't yet have
// data for a particular emission category.
import T from '../theme';
import { DCard } from '../components/ui/DCard';
import { hexToRgb } from '../utils/helpers';

function PlaceholderSection({title,icon,color,desc}){
  return(
    <DCard style={{marginBottom:20}}>
      <div style={{padding:"22px 28px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:9,background:`rgba(${hexToRgb(color)},0.1)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
          <div style={{fontSize:17,fontWeight:700,color:T.text}}>{title}</div>
        </div>
        <span style={{background:`rgba(${hexToRgb(color)},0.08)`,color,border:`1px solid rgba(${hexToRgb(color)},0.2)`,padding:"3px 12px",borderRadius:20,fontSize:11.5,fontWeight:600}}>Not yet collected</span>
      </div>
      <div style={{padding:"40px 28px",textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:`rgba(${hexToRgb(color)},0.08)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 16px"}}>{icon}</div>
        <p style={{color:T.textMid,fontSize:14,lineHeight:1.7,maxWidth:420,margin:"0 auto"}}>{desc}</p>
      </div>
    </DCard>
  );
}


export default PlaceholderSection;
