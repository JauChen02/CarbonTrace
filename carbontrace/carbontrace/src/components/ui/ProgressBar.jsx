// Thin percentage bar used on event cards to show response rate.
import T from '../../theme';

function ProgressBar({value}){
  const c=value>=60?"#16a34a":value>=30?"#f59e0b":"#ef4444";
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:12,color:T.textMid,fontWeight:500}}>Response rate</span>
        <span style={{fontSize:12.5,fontWeight:700,color:c,fontFamily:"'DM Mono',monospace"}}>{value.toFixed(0)}%</span>
      </div>
      <div style={{height:6,background:"#f3f4f6",borderRadius:10,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${Math.min(value,100)}%`,background:c,borderRadius:10,transition:"width 0.6s ease"}}/>
      </div>
    </div>
  );
}

export default ProgressBar;
