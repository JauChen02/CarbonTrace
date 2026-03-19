// Full-page layout frame: injects global CSS, renders Sidebar + Topbar,
// and wraps page content with correct margin and scroll behaviour.
import T from '../../theme';
import G from '../../styles';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Shell({user,active,activeEventId,events,onNav,onOpenEvent,onLogout,title,actions,children,noPad,noBorder}){
  return(
    <div style={{display:"flex",minHeight:"100vh",background:T.bg}}>
      <style>{G}</style>
      <Sidebar user={user} active={active} activeEventId={activeEventId} events={events||[]} onNav={onNav} onOpenEvent={onOpenEvent||function(){}} onLogout={onLogout}/>
      <div style={{marginLeft:220,flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <Topbar title={title} actions={actions} noBorder={noBorder}/>
        <main style={{flex:1,padding:noPad?"0":"28px 30px",overflowY:"auto"}}>{children}</main>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default Shell;
