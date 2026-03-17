// Circular avatar showing up to 2 initials, used in the participants table.
import T from '../../theme';

function Avatar({name,size=30}){
  const i=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:700,color:T.accent,flexShrink:0}}>{i}</div>;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default Avatar;
