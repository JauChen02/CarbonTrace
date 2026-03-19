// Sticky top navigation bar: renders the page title (can be a JSX breadcrumb)
// and a row of action buttons on the right.
import T from '../../theme';

function Topbar({title,actions,noBorder}){
  return(
    <div style={{height:57,background:T.surface,borderBottom:noBorder?"none":`1px solid ${T.border}`,display:"flex",alignItems:"center",padding:"0 30px",gap:14,position:"sticky",top:0,zIndex:40}}>
      <div style={{flex:1,fontSize:16.5,fontWeight:700,color:T.text}}>{title}</div>
      <div style={{display:"flex",gap:10}}>{actions}</div>
    </div>
  );
}

export default Topbar;
