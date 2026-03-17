// Global constants used across the app.
// EF / LOCAL_EF / HOTEL_KG: DEFRA 2025 emission factors.
// SECTIONS / SECTION_ICONS / SC: Carbon Report section metadata.
// OFFSET_STATUSES: options for the Offsetting Status card.
import T from './theme';

// ─── Emission factors ─────────────────────────────────────────────────────────
// DEFRA 2025 greenhouse gas conversion factors
// Air travel: average economy international (with RFI uplift)
// Train: National Rail average
// Car: average petrol/diesel car
// Coach/Bus: average coach
// Carpool: average car / 2 occupants (assumed)
// Ferry: foot passenger (cross-channel average)
// Other/fallback: local bus average
const EF = {
  "Air travel": 0.19536,
  "Train":      0.03546,
  "Car":        0.17304,
  "Coach/Bus":  0.02776,
  "Carpool":    0.08652,
  "Ferry":      0.01871,
  "Other":      0.10385,
};
const LOCAL_EF = {"Ferry":0.01871,"Coach":0.02776,"Bus":0.10385,"Car":0.17304,"Train":0.03546,"Other":0.12};
const HOTEL_KG = 10.4; // kg CO₂e/room/night — DEFRA 2025 UK hotel average


// ─── Carbon Report section metadata ──────────────────────────────────────────
const SECTIONS=["All Sections","Travel","Accommodation","Venue Energy","Food & Beverage","Materials & Waste","Digital","Data Quality"];
const SECTION_ICONS={"All Sections":"⊹","Travel":"✈️","Accommodation":"🏨","Venue Energy":"⚡","Food & Beverage":"🍽️","Materials & Waste":"♻️","Digital":"💻","Data Quality":"📋"};
const SC={"Travel":T.accent,"Accommodation":"#2563eb","Venue Energy":"#d97706","Food & Beverage":"#ea580c","Materials & Waste":"#7c3aed","Digital":"#0284c7","Data Quality":T.accent};


// ─── Offsetting status options ────────────────────────────────────────────────
// ─── Offsetting Status Card ───────────────────────────────────────────────────
const OFFSET_STATUSES=[
  {key:"pending",    label:"Pending",     sub:"Strategy in development", color:"#d97706", bg:"#fef9c3", icon:"⏳"},
  {key:"in_progress",label:"In Progress", sub:"Offsetting underway",     color:"#2563eb", bg:"#eff6ff", icon:"🔄"},
  {key:"completed",  label:"Completed",   sub:"Fully offset",            color:"#16a34a", bg:"#dcfce7", icon:"✅"},
  {key:"not_planned",label:"Not Planned", sub:"No strategy planned",     color:"#6b7280", bg:"#f3f4f6", icon:"—"},
];


export { EF, LOCAL_EF, HOTEL_KG, SECTIONS, SECTION_ICONS, SC, OFFSET_STATUSES };
