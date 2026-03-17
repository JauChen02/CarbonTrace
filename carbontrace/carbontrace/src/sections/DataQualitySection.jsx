// Data Quality & Extrapolation section.
// Four sub-blocks:
//   1. Methodology & Assumptions: key numbers and validation criteria.
//   2. Data Validity Overview: progress bar + invalid entry breakdown by reason.
//   3. Extrapolation Methodology: 4-step process, live formula display,
//      Raw vs Extrapolated comparison bars, and caveats.
//   4. Emission Factors Source + Raw Data Access links.
import T from '../theme';
import { DCard } from '../components/ui/DCard';

function DataQualitySection({stats,event}){
  const {total,responders,invalid,invalidReasons,totalActual,extrapolated,extrapolationFactor,validRate}=stats;
  const rawT=(totalActual/1000).toFixed(2);
  const extT=(extrapolated/1000).toFixed(2);
  const factorStr=extrapolationFactor.toFixed(4);
  const validPct=validRate.toFixed(1);
  const invalidPct=(100-validRate).toFixed(1);

  const reasonRows=[
    {label:"Missing Origin",       count:invalidReasons.missingOrigin,   icon:"📍", color:"#ea580c"},
    {label:"Missing Distance",     count:invalidReasons.missingDistance,  icon:"📏", color:"#d97706"},
    {label:"Missing Transport Mode",count:invalidReasons.missingTransport,icon:"🚌", color:"#7c3aed"},
    {label:"Invalid / Suspect Data",count:invalidReasons.invalidData,     icon:"⚠️", color:"#dc2626"},
  ].filter(r=>r.count>0);

  return(
    <DCard style={{marginBottom:20}}>
      {/* Header */}
      <div style={{padding:"22px 28px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:9,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📋</div>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:T.text}}>Data Quality & Extrapolation</div>
            <div style={{fontSize:13,color:T.textMid,marginTop:2}}>Transparency in data collection and emission estimates</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:26,fontWeight:800,fontFamily:"'DM Mono',monospace",color:T.accent}}>{extT}</div>
          <div style={{fontSize:12,color:T.textLight}}>tonnes CO₂e (extrapolated)</div>
        </div>
      </div>

      <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:20}}>

        {/* ── Methodology & Assumptions ── */}
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"18px 22px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{color:T.accent,fontSize:15}}>ⓘ</span>
            <span style={{fontWeight:700,fontSize:14,color:T.accent}}>Methodology & Assumptions</span>
          </div>
          <p style={{fontSize:13,color:T.textMid,lineHeight:1.7,marginBottom:10}}>
            Emissions are calculated from valid participant survey responses and extrapolated to account for incomplete entries.
            The extrapolation assumes entries with missing data follow the same travel distribution as valid entries.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 32px"}}>
            {[
              `Total registrations: ${total}`,
              `Valid entries with complete data: ${responders}`,
              `Invalid / incomplete entries: ${invalid}`,
              `Extrapolation factor: ${factorStr}`,
            ].map(line=>(
              <div key={line} style={{fontSize:12.5,color:T.textMid,lineHeight:1.9}}>
                · <span style={{color:T.text}}>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Data Validity Overview ── */}
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"18px 22px"}}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:14}}>Data Validity Overview</div>

          {/* Visual validity bar */}
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.textLight,marginBottom:6}}>
              <span>Valid entries</span>
              <span>{responders} of {total} participants</span>
            </div>
            <div style={{height:14,borderRadius:7,background:T.border,overflow:"hidden",position:"relative"}}>
              <div style={{height:"100%",width:`${validPct}%`,background:"linear-gradient(90deg,#16a34a,#22c55e)",borderRadius:7,transition:"width 0.5s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5}}>
                <div style={{width:10,height:10,borderRadius:2,background:"#16a34a"}}/>
                <span style={{fontWeight:700,color:"#16a34a"}}>{validPct}% Valid</span>
                <span style={{color:T.textLight}}>({responders} entries)</span>
              </div>
              {invalid>0&&(
                <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5}}>
                  <div style={{width:10,height:10,borderRadius:2,background:"#f87171"}}/>
                  <span style={{fontWeight:700,color:"#dc2626"}}>{invalidPct}% Incomplete</span>
                  <span style={{color:T.textLight}}>({invalid} entries)</span>
                </div>
              )}
            </div>
          </div>

          {/* Invalid entry breakdown */}
          {reasonRows.length>0&&(
            <>
              <div style={{fontWeight:600,fontSize:13,color:T.textMid,marginBottom:10,paddingTop:12,borderTop:`1px solid ${T.border}`}}>Invalid Entry Breakdown</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {reasonRows.map(r=>(
                  <div key={r.label} style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:28,height:28,borderRadius:7,background:`${r.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{r.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,marginBottom:4}}>
                        <span style={{fontWeight:500,color:T.text}}>{r.label}</span>
                        <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,color:r.color}}>{r.count}</span>
                      </div>
                      <div style={{height:5,borderRadius:3,background:T.border,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${invalid>0?(r.count/invalid*100).toFixed(0):0}%`,background:r.color,borderRadius:3}}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Extrapolation Methodology ── */}
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"18px 22px"}}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:14}}>Extrapolation Methodology & Justification</div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
            {[
              {step:"1",title:"Data Validation",desc:"Each entry validated for: origin location, distance > 0, and transport mode present."},
              {step:"2",title:"Raw Calculation",desc:`Emissions calculated from ${responders} valid entries using DEFRA emission factors.`},
              {step:"3",title:"Extrapolation",desc:`Linear scaling factor of ${factorStr} applied to account for ${invalid} participants with incomplete data.`},
              {step:"4",title:"Assumption",desc:"Participants with missing data assumed to have similar travel patterns as those with complete data."},
            ].map(s=>(
              <div key={s.step} style={{display:"flex",gap:10}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:T.accentLight,color:T.accent,fontSize:12,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{s.step}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:2}}>{s.title}</div>
                  <div style={{fontSize:12.5,color:T.textMid,lineHeight:1.6}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Formula display */}
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 20px",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.textLight,textTransform:"uppercase",letterSpacing:0.5,marginBottom:12}}>Extrapolation Formula</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:12.5,color:T.textMid}}>Extrapolation Factor</span>
                <span style={{color:T.textLight}}>=</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:T.text}}>Total Participants / Valid Participants</span>
              </div>
              <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 16px",fontFamily:"'DM Mono',monospace",fontSize:14,color:T.text}}>
                = {total} / {responders} = <strong style={{color:T.accent}}>{factorStr}</strong>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginTop:4}}>
                <span style={{fontSize:12.5,color:T.textMid}}>Extrapolated Emissions</span>
                <span style={{color:T.textLight}}>=</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:T.text}}>Raw Emissions × Extrapolation Factor</span>
              </div>
              <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 16px",fontFamily:"'DM Mono',monospace",fontSize:14,color:T.text}}>
                = {rawT} × {factorStr} = <strong style={{color:T.accent}}>{extT} tonnes CO₂e</strong>
              </div>
            </div>
          </div>

          {/* Raw vs Extrapolated visual comparison */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12.5,fontWeight:600,color:T.textMid,marginBottom:10}}>Raw vs Extrapolated Emissions</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {label:"Raw (Valid Only)",value:parseFloat(rawT),max:parseFloat(extT),color:"#2563eb",sub:`Based on ${responders} complete entries`},
                {label:"Extrapolated (All)",value:parseFloat(extT),max:parseFloat(extT),color:T.accent,sub:`Scaled to all ${total} participants`},
              ].map(b=>(
                <div key={b.label}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,marginBottom:5}}>
                    <span style={{fontWeight:600,color:T.text}}>{b.label}</span>
                    <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,color:b.color}}>{b.value} t CO₂e</span>
                  </div>
                  <div style={{height:10,borderRadius:5,background:T.border,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${b.max>0?(b.value/b.max*100).toFixed(1):100}%`,background:b.color,borderRadius:5,transition:"width 0.5s"}}/>
                  </div>
                  <div style={{fontSize:11.5,color:T.textLight,marginTop:3}}>{b.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Caveats */}
          <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"12px 16px"}}>
            <div style={{fontSize:12.5,fontWeight:700,color:"#92400e",marginBottom:6}}>Caveats & Limitations</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {[
                "This extrapolation assumes missing data follows the same distribution as valid data",
                "Local transport (organizer-arranged legs) is calculated for all participants regardless",
                "Accommodation extrapolation uses average hotel nights per valid participant",
                "Some incomplete entries may be local participants who did not travel internationally",
              ].map(c=>(
                <div key={c} style={{fontSize:12.5,color:"#78350f",display:"flex",gap:6}}>
                  <span style={{flexShrink:0}}>·</span><span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Emission Factors & Raw Data links ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:15}}>⚡</span>
              <span style={{fontWeight:700,fontSize:13.5,color:T.text}}>Emission Factors Source</span>
            </div>
            <p style={{fontSize:12.5,color:T.textMid,lineHeight:1.6,marginBottom:10}}>All emission factors sourced from the official UK Government greenhouse gas conversion factors for company reporting.</p>
            <a href="https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025" target="_blank" rel="noreferrer"
              style={{color:T.accent,fontSize:12.5,fontWeight:600,textDecoration:"none"}}>View DEFRA 2025 Conversion Factors →</a>
          </div>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:15}}>📊</span>
              <span style={{fontWeight:700,fontSize:13.5,color:T.text}}>Raw Data Access</span>
            </div>
            <p style={{fontSize:12.5,color:T.textMid,lineHeight:1.6,marginBottom:10}}>For full transparency and audit purposes, the complete raw participant data is available for download and review, including all valid and invalid entries.</p>
            <span style={{color:T.accent,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>View & Download Raw Data →</span>
          </div>
        </div>

      </div>
    </DCard>
  );
}


export default DataQualitySection;
