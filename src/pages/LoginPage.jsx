// Login screen. Validates credentials against the USERS list.
// Pre-filled with the demo account for convenience.
import { useState } from 'react';
import T from '../theme';
import G from '../styles';
import { USERS } from '../data/seed';

function LoginPage({onLogin}){
  const [email,setEmail]=useState("test@carbongpt.ai");
  const [pw,setPw]=useState("888888");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const iS={width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 13px",fontSize:14,color:T.text};
  function go(){setBusy(true);setTimeout(()=>{if(!onLogin(email,pw))setErr("Invalid credentials. Try: test@carbongpt.ai / 888888");setBusy(false);},500);}
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{G}</style>
      <div style={{display:"flex",width:860,boxShadow:"0 20px 60px rgba(0,0,0,0.13)",borderRadius:16,overflow:"hidden"}} className="fu">
        <div style={{flex:1,background:T.sidebar,padding:"52px 44px",display:"flex",flexDirection:"column",gap:40}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:44}}>
              <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#14b8a6,#0f766e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🌍</div>
              <span style={{color:"white",fontWeight:700,fontSize:15.5}}>CarbonTrace</span>
            </div>
            <h2 style={{color:"white",fontSize:28,fontWeight:700,lineHeight:1.25,marginBottom:12}}>Track your event's carbon footprint</h2>
            <p style={{color:T.sidebarText,fontSize:14,lineHeight:1.7}}>Measure, analyse, and report emissions across all events — with smart extrapolation for incomplete data.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {[["✈️","Transport tracking across all modes"],["🏨","Hotel accommodation emissions"],["📊","Smart extrapolation for missing data"]].map(([icon,lbl])=>(
              <div key={lbl} style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{icon}</div>
                <span style={{color:T.sidebarText,fontSize:13.5}}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{width:380,background:T.surface,padding:"52px 40px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <h3 style={{fontSize:22,fontWeight:700,marginBottom:6}}>Welcome back</h3>
          <p style={{color:T.textMid,fontSize:13.5,marginBottom:28}}>Sign in to your manager account</p>
          {err&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:16}}>{err}</div>}
          <div style={{marginBottom:14}}><label style={{fontSize:12.5,fontWeight:600,color:T.textMid,display:"block",marginBottom:5}}>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} style={iS}/></div>
          <div style={{marginBottom:24}}><label style={{fontSize:12.5,fontWeight:600,color:T.textMid,display:"block",marginBottom:5}}>Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={iS}/></div>
          <button className="btn-p" onClick={go} disabled={busy} style={{width:"100%",justifyContent:"center",padding:"11px",fontSize:14}}>{busy?"Signing in…":"Sign in →"}</button>
          <p style={{color:T.textLight,fontSize:11.5,marginTop:20,textAlign:"center"}}>Demo: test@carbongpt.ai / 888888</p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default LoginPage;
