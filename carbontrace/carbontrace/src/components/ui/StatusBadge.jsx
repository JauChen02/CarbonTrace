// Coloured pill badge showing event status: upcoming / active / concluded.

function StatusBadge({status}){
  const s={concluded:["#dcfce7","#15803d"],active:["#dbeafe","#1d4ed8"],upcoming:["#fef9c3","#854d0e"]}[status]||["#f3f4f6",T.textMid];
  return <span style={{background:s[0],color:s[1],padding:"3px 10px",borderRadius:20,fontSize:11.5,fontWeight:600,textTransform:"capitalize"}}>{status}</span>;
}

export default StatusBadge;
