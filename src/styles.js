// Global CSS string injected by Shell into a <style> tag.
// Defines font imports, CSS resets, and utility classes (.btn-p, .btn-g, .tab, etc.)
import T from './theme';

// ─── Global CSS ───────────────────────────────────────────────────────────────
const G = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:${T.bg};color:${T.text};-webkit-font-smoothing:antialiased;}
  input,select,textarea,button{font-family:'DM Sans',sans-serif;}
  input:focus,select:focus,textarea:focus{outline:none;border-color:${T.accentMid}!important;box-shadow:0 0 0 3px rgba(20,184,166,0.12);}
  ::placeholder{color:${T.textLight};}
  ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:10px;}
  .sb-item{background:transparent;border:none;width:100%;text-align:left;border-radius:7px;padding:8px 12px;font-size:13.5px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:background 0.13s;color:${T.sidebarText};}
  .sb-item:hover{background:#1f2937;color:#e5e7eb;}
  .sb-item.active{background:#1f2937;color:#ffffff;font-weight:600;}
  .card-lift{transition:box-shadow 0.18s,transform 0.18s;cursor:pointer;}
  .card-lift:hover{box-shadow:0 6px 24px rgba(0,0,0,0.09);transform:translateY(-2px);}
  .btn-p{background:${T.accent};color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:13.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:background 0.14s;}
  .btn-p:hover:not(:disabled){background:#0d6461;}
  .btn-p:disabled{opacity:0.45;cursor:not-allowed;}
  .btn-g{background:#fff;color:${T.textMid};border:1px solid ${T.border};border-radius:8px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.13s;}
  .btn-g:hover{background:${T.bg};}
  .tab{background:none;border:none;border-bottom:2px solid transparent;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;padding:10px 18px;color:${T.textMid};transition:all 0.14s;}
  .tab.on{color:${T.accent};border-bottom-color:${T.accent};font-weight:600;}
  .tab:hover:not(.on){color:${T.text};}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  .fu{animation:fadeUp 0.22s ease forwards;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .spin{animation:spin 0.75s linear infinite;display:inline-block;}
`;


export default G;
