// Metric display card used in the event header bar.
// Shows a label, large value, optional sub-label, optional icon, and accent colour.
import T from '../../theme';
import Card from './Card';

function KpiCard({label,value,sub,icon,accent}){
  return(
    <Card style={{padding:"20px 22px",flex:1,minWidth:130}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:12,color:T.textMid,fontWeight:500,letterSpacing:0.2,marginBottom:8}}>{label}</div>
          <div style={{fontSize:25,fontWeight:700,fontFamily:"'DM Mono',monospace",lineHeight:1,color:accent||T.text}}>{value}</div>
          {sub&&<div style={{fontSize:11.5,color:T.textLight,marginTop:5}}>{sub}</div>}
        </div>
        {icon&&<div style={{width:34,height:34,borderRadius:8,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{icon}</div>}
      </div>
    </Card>
  );
}

export default KpiCard;
