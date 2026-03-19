// Core event analytics engine.
//
// classifyInvalidReasons(participants)
//   Categorises non-valid participants by the most specific missing field:
//   missing origin → missing transport → missing distance → invalid data.
//
// computeStats(event, dataSource)
//   Returns all KPIs derived from valid responses based on dataSource filter:
//   - "all": combines survey participants + CSV import data
//   - "survey": only survey participant data
//   - "csv": only CSV import data
//   Returns: submitted, valid, total, responders, totalActual, avg, extrapolated,
//   extrapolationFactor, responseRate, validRate, invalid, invalidReasons,
//   tMap, hotelTotal, transportTotal, csvStats.
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

// Parse CSV data into participant-like objects for calculations
function parseCsvToParticipants(csvData) {
  if (!csvData || !csvData.rows) return [];
  
  // Map CSV columns to participant fields (flexible column matching)
  const rows = csvData.rows;
  const headers = csvData.headers || [];
  
  // Find column indices (case-insensitive)
  const findCol = (names) => headers.findIndex(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));
  const transportCol = findCol(['transport', 'mode', 'travel']);
  const distanceCol = findCol(['distance', 'km', 'miles']);
  const hotelCol = findCol(['hotel', 'nights', 'accommodation']);
  const originCol = findCol(['origin', 'city', 'from', 'location']);
  const nameCol = findCol(['name', 'participant', 'attendee']);
  const emissionsCol = findCol(['emission', 'co2', 'carbon', 'kg']);
  
  return rows.map((row, idx) => {
    // If CSV has pre-calculated emissions, use those
    const preCalcEmissions = emissionsCol >= 0 ? parseFloat(row[headers[emissionsCol]]) || 0 : null;
    
    return {
      id: `csv-${idx}`,
      name: nameCol >= 0 ? row[headers[nameCol]] || `CSV Entry ${idx + 1}` : `CSV Entry ${idx + 1}`,
      origin: originCol >= 0 ? row[headers[originCol]] || 'CSV Import' : 'CSV Import',
      transport: transportCol >= 0 ? row[headers[transportCol]] || 'Other' : 'Other',
      distance: distanceCol >= 0 ? parseFloat(row[headers[distanceCol]]) || 0 : 0,
      hotelNights: hotelCol >= 0 ? parseFloat(row[headers[hotelCol]]) || 0 : 0,
      submitted: true,
      isCSV: true,
      preCalcEmissions
    };
  });
}

function computeStats(event, dataSource = "all") {
  const surveyParticipants = event.participants || [];
  const csvParticipants = parseCsvToParticipants(event.csvData);
  
  // Select participants based on data source filter
  let allParticipants;
  if (dataSource === "survey") {
    allParticipants = surveyParticipants;
  } else if (dataSource === "csv") {
    allParticipants = csvParticipants;
  } else {
    // "all" - combine both sources
    allParticipants = [...surveyParticipants, ...csvParticipants];
  }
  
  // Valid = submitted AND has origin AND has transport AND has distance > 0
  const valid = allParticipants.filter(p=>
    p.submitted && p.origin && p.origin.trim()!=="" &&
    p.transport && p.transport.trim()!=="" &&
    (p.distance>0 || p.transport==="Other" || p.preCalcEmissions > 0)
  );
  const submitted = allParticipants.filter(p=>p.submitted);
  
  // For total count, use survey totalInvited + CSV count based on filter
  let total;
  if (dataSource === "survey") {
    total = event.totalInvited || surveyParticipants.length;
  } else if (dataSource === "csv") {
    total = csvParticipants.length;
  } else {
    total = (event.totalInvited || surveyParticipants.length) + csvParticipants.length;
  }
  
  const responders = valid.length;
  
  // Calculate emissions - use preCalcEmissions if available for CSV entries
  const totalActual = valid.reduce((a, p) => {
    if (p.preCalcEmissions && p.preCalcEmissions > 0) {
      return a + p.preCalcEmissions;
    }
    return a + calcEm(p);
  }, 0);
  
  const avg = responders>0 ? totalActual/responders : 0;
  const extrapolated = avg*total;
  const extrapolationFactor = responders>0 ? total/responders : 1;
  const responseRate = total>0 ? (submitted.length/total)*100 : 0;
  const validRate = total>0 ? (responders/total)*100 : 0;
  const invalid = allParticipants.length - responders;
  const invalidReasons = classifyInvalidReasons(allParticipants.filter(p => !p.isCSV));
  
  const tMap = {};
  valid.forEach(p=>{
    const t=p.transport||"Unknown";
    if(!tMap[t]) tMap[t]={count:0,emissions:0,totalDist:0};
    tMap[t].count++;
    tMap[t].emissions += p.preCalcEmissions > 0 ? p.preCalcEmissions : calcEm(p);
    tMap[t].totalDist+=(p.distance||0);
  });
  
  const hotelTotal = valid.reduce((a,p)=>a+(p.hotelNights||0)*HOTEL_KG,0);
  const transportTotal = valid.reduce((a,p)=> {
    if (p.preCalcEmissions > 0) {
      // Estimate transport portion (assume 80% of pre-calc is transport)
      return a + (p.preCalcEmissions * 0.8);
    }
    return a+((EF[p.transport]||EF["Other"])*(p.distance||0)*2);
  }, 0);
  
  // CSV-specific stats
  const csvStats = {
    count: csvParticipants.length,
    hasData: csvParticipants.length > 0,
    fileName: event.csvData?.fileName || null
  };
  
  // Survey-specific stats
  const surveyStats = {
    count: surveyParticipants.filter(p => p.submitted).length,
    total: event.totalInvited || surveyParticipants.length
  };
  
  return {
    submitted,valid,total,responders,totalActual,avg,extrapolated,
    extrapolationFactor,responseRate,validRate,invalid,invalidReasons,
    tMap,hotelTotal,transportTotal,csvStats,surveyStats,dataSource
  };
}


export { classifyInvalidReasons, computeStats };
