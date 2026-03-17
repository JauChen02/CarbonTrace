// Parses a CSV string into { headers: string[], rows: object[] }.
// Handles quoted fields with embedded commas and escaped double-quotes (RFC 4180).
// Used by RawDataPage when a CSV file is uploaded as an import layer.

function parseCSV(text){
  const lines=text.trim().split(/\r?\n/);
  if(lines.length<2) return {headers:[],rows:[]};
  function splitLine(line){
    const cols=[];let cur="",inQ=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'){if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ;}
      else if(ch===","&&!inQ){cols.push(cur.trim());cur="";}
      else cur+=ch;
    }
    cols.push(cur.trim());
    return cols;
  }
  const headers=splitLine(lines[0]);
  const rows=lines.slice(1).filter(l=>l.trim()).map(l=>{
    const vals=splitLine(l);
    const obj={};
    headers.forEach((h,i)=>obj[h]=vals[i]??"");
    return obj;
  });
  return {headers,rows};
}

// ── Source badge ─────────────────────────────────────────────────────────────

export { parseCSV };
