// Badges and the validity classifier used in the Raw Data page.
//
// isRowValid(row): returns true (complete survey entry) / false (incomplete) / null (CSV rows).
// SourceBadge: teal pill = Survey Response, blue pill = CSV Import.
// ValidityBadge: green = Valid, red = Invalid. Hidden for CSV rows.
import T from '../../theme';

function SourceBadge({source}){
  const isSurvey=source==="Survey";
  return(
    <span style={{
      display:"inline-flex",alignItems:"center",gap:5,
      background:isSurvey?T.accentLight:"#eff6ff",
      color:isSurvey?T.accent:"#2563eb",
      border:`1px solid ${isSurvey?"rgba(15,118,110,0.2)":"rgba(37,99,235,0.2)"}`,
      padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap"
    }}>
      <span style={{width:5,height:5,borderRadius:"50%",background:isSurvey?T.accent:"#2563eb",display:"inline-block"}}/>
      {isSurvey?"Survey Response":"CSV Import"}
    </span>
  );
}


function isRowValid(r){
  // A survey row is "valid" if submitted with origin, transport, and distance
  if(r._source!=="Survey") return null; // CSV rows have no validity concept
  return r._submitted &&
    r["Origin"] && String(r["Origin"]).trim()!=="" &&
    r["Transport"] && String(r["Transport"]).trim()!=="" &&
    (parseFloat(r["Distance (km)"])>0 || r["Transport"]==="Other");
}


function ValidityBadge({valid}){
  if(valid===null) return null;
  return(
    <span style={{
      background:valid?"#dcfce7":"#fee2e2",
      color:valid?"#15803d":"#dc2626",
      border:`1px solid ${valid?"#bbf7d0":"#fecaca"}`,
      padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap"
    }}>{valid?"✓ Valid":"✕ Invalid"}</span>
  );
}


export { SourceBadge, ValidityBadge, isRowValid };
