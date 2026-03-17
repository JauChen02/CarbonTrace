// Pure utility functions used in multiple components.
// hexToRgb: converts a 6-digit hex colour to "r, g, b" string for use in rgba().

function hexToRgb(hex){
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}


export { hexToRgb };
