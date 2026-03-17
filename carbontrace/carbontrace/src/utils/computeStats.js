// Core event analytics engine.
//
// classifyInvalidReasons(participants)
//   Categorises non-valid participants by the most specific missing field:
//   missing origin → missing transport → missing distance → invalid data.
//
// computeStats(event)
//   Returns all KPIs derived from valid survey responses:
//   submitted, valid, total, responders, totalActual, avg, extrapolated,
//   extrapolationFactor, responseRate, validRate, invalid, invalidReasons,
//   tMap, hotelTotal, transportTotal.
import { EF, HOTEL_KG } from '../constants';
import { calcEm } from './calcEm';

function classifyInvalidReasons(participants){
  // Classify each non-submitted or data-invalid participant by failure reason
  const reasons={missingOrigin:0,missingDistance:0,missingTransport:0,invalidData:0};
  participants.forEach(p=>{
    if(!p.submitted){
      // Count the most specific missing field per participant
      if(!p.origin||p.origin.trim()==="") reasons.missingOrigin++;
      else if(!p.transport||p.transport.trim()==="") reasons.missingTransport++;
      else if(!p.distance||p.distance<=0) reasons.missingDistance++;
      else reasons.invalidData++;
    } else {
      // Submitted but with suspect data
      if(p.distance<=0&&p.transport!=="Other") reasons.missingDistance++;
    }
  });
  return reasons;
}

function computeStats(event) {
  const allParticipants = event.participants;
  // Valid = submitted AND has origin AND has transport AND has distance > 0
  const valid = allParticipants.filter(p=>
    p.submitted && p.origin && p.origin.trim()!=="" &&
    p.transport && p.transport.trim()!=="" &&
    (p.distance>0 || p.transport==="Other")
  );
  const submitted = allParticipants.filter(p=>p.submitted);
  const total = event.totalInvited||allParticipants.length;
  const responders = valid.length; // use valid entries for calculations
  const totalActual = valid.reduce((a,p)=>a+calcEm(p),0);
  const avg = responders>0 ? totalActual/responders : 0;
  const extrapolated = avg*total;
  const extrapolationFactor = responders>0 ? total/responders : 1;
  const responseRate = total>0 ? (submitted.length/total)*100 : 0;
  const validRate = total>0 ? (responders/total)*100 : 0;
  const invalid = allParticipants.length - responders;
  const invalidReasons = classifyInvalidReasons(allParticipants);
  const tMap = {};
  valid.forEach(p=>{
    const t=p.transport||"Unknown";
    if(!tMap[t]) tMap[t]={count:0,emissions:0,totalDist:0};
    tMap[t].count++;
    tMap[t].emissions+=calcEm(p);
    tMap[t].totalDist+=(p.distance||0);
  });
  const hotelTotal = valid.reduce((a,p)=>a+(p.hotelNights||0)*HOTEL_KG,0);
  const transportTotal = valid.reduce((a,p)=>a+((EF[p.transport]||EF["Other"])*(p.distance||0)*2),0);
  return {
    submitted,valid,total,responders,totalActual,avg,extrapolated,
    extrapolationFactor,responseRate,validRate,invalid,invalidReasons,
    tMap,hotelTotal,transportTotal
  };
}


export { classifyInvalidReasons, computeStats };
