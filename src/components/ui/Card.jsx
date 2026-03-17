// Base card container. Wraps content in a white rounded box with a subtle border.
// Accepts an optional onClick for interactive (lift-on-hover) cards.
import T from '../../theme';

function Card({children,style={},className="",onClick}){
  return <div className={className} onClick={onClick} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,...style}}>{children}</div>;
}

export default Card;
