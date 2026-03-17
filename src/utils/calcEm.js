// Calculates total kg CO2e for one participant.
// Formula: (emission_factor × distance × 2) + (hotel_nights × HOTEL_KG)
// The ×2 accounts for the return journey assumption.
import { EF, HOTEL_KG } from '../constants';

function calcEm(p) {
  return +(((EF[p.transport]||EF["Other"])*(p.distance||0)*2)+((p.hotelNights||0)*HOTEL_KG)).toFixed(2);
}


export { calcEm };
