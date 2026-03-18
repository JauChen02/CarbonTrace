// Demo seed data used on first load.
// SP: 18 sample participants for MNE 2025 (mix of submitted + pending).
// SEED_EVENTS: two pre-built events with full static section data.
// USERS: single demo account for the login screen.

const SP = [
  { id: 1, name: "Alice B.", email: "alice@uni.fr", origin: "Grenoble, France", transport: "Train", distance: 600, hotelNights: 3, submitted: true },
  { id: 2, name: "Björn H.", email: "bjorn@tu.de", origin: "Freiburg, Germany", transport: "Air travel", distance: 900, hotelNights: 5, submitted: true },
  { id: 3, name: "Chen W.", email: "chen@ntu.jp", origin: "Japan", transport: "Air travel", distance: 9600, hotelNights: 5, submitted: true },
  { id: 4, name: "Daan V.", email: "daan@tu.nl", origin: "Netherlands", transport: "Train", distance: 450, hotelNights: 4, submitted: true },
  { id: 5, name: "Eva M.", email: "eva@ens.fr", origin: "Paris, France", transport: "Train", distance: 350, hotelNights: 4, submitted: true },
  { id: 6, name: "Felix K.", email: "felix@eth.ch", origin: "Zürich, Switzerland", transport: "Air travel", distance: 800, hotelNights: 5, submitted: true },
  { id: 7, name: "Giulia R.", email: "giulia@unibo.it", origin: "Rotterdam, Netherlands", transport: "Train", distance: 450, hotelNights: 4, submitted: true },
  { id: 8, name: "Hannah C.", email: "hannah@ku.dk", origin: "Copenhagen, Denmark", transport: "Air travel", distance: 1060, hotelNights: 5, submitted: true },
  { id: 9, name: "Ivan P.", email: "ivan@nthu.tw", origin: "Taiwan", transport: "Air travel", distance: 9900, hotelNights: 5, submitted: true },
  { id: 10, name: "Julia S.", email: "julia@bochum.de", origin: "Bochum, Germany", transport: "Air travel", distance: 900, hotelNights: 5, submitted: true },
  { id: 11, name: "Karl L.", email: "karl@kth.se", origin: "Sweden", transport: "Air travel", distance: 1550, hotelNights: 4, submitted: true },
  { id: 12, name: "Lena T.", email: "lena@tu.de", origin: "Ilmenau, Germany", transport: "Air travel", distance: 900, hotelNights: 0, submitted: true },
  { id: 13, name: "Marco F.", email: "marco@unipd.it", origin: "", transport: "", distance: 0, hotelNights: 0, submitted: false },
  { id: 14, name: "Nadia O.", email: "nadia@ulb.be", origin: "", transport: "", distance: 0, hotelNights: 0, submitted: false },
  { id: 15, name: "Omar S.", email: "omar@ku.ae", origin: "", transport: "", distance: 0, hotelNights: 0, submitted: false },
  { id: 16, name: "Petra V.", email: "petra@vu.nl", origin: "", transport: "", distance: 0, hotelNights: 0, submitted: false },
  { id: 17, name: "Quentin D.", email: "quentin@epfl.ch", origin: "", transport: "", distance: 0, hotelNights: 0, submitted: false },
  { id: 18, name: "Rosa B.", email: "rosa@upm.es", origin: "", transport: "", distance: 0, hotelNights: 0, submitted: false },
];

const SEED_EVENTS = [
  {
    id: "evt-001", name: "MNE 2025 Conference", location: "Lausanne, Switzerland", date: "2025-09-15", endDate: "2025-09-19", status: "concluded", participants: SP, totalInvited: 18, description: "Annual Materials & Nanoscience in Europe symposium", offsettingStatus: "pending", offsettingNote: "Strategy in development", localTransport: [
      { id: "lt-1", mode: "Ferry", icon: "⛴️", description: "Southampton → Isle of Wight", oneWayKm: 19.2, factor: 0.01871, participantCount: 18, notes: "Return trip for all attendees" },
      { id: "lt-2", mode: "Coach", icon: "🚌", description: "IoW Port → Gala Dinner", oneWayKm: 14.4, factor: 0.02776, participantCount: 18, notes: "Return trip for all attendees" },
    ],
    venueEnergy: {
      status: "estimated",
      gridFactor: 0.17700,
      durationDays: 4,
      note: "Estimates based on 500-person conference venue benchmarks",
      items: [
        { id: "ve-1", label: "Lighting", icon: "💡", desc: "Conference halls and common areas", kWh: 1200, color: "#d97706" },
        { id: "ve-2", label: "HVAC", icon: "🌡️", desc: "Heating, ventilation, air conditioning", kWh: 3500, color: "#ea580c" },
        { id: "ve-3", label: "AV Equipment", icon: "📽️", desc: "Projectors, screens, sound systems", kWh: 800, color: "#7c3aed" },
        { id: "ve-4", label: "Catering Equipment", icon: "🍳", desc: "Kitchen and food service equipment", kWh: 600, color: "#16a34a" },
        { id: "ve-5", label: "IT Infrastructure", icon: "🖥️", desc: "WiFi, servers, charging stations", kWh: 400, color: "#2563eb" },
      ],
    },
    foodBev: {
      status: "estimated",
      wastePct: 15,
      localSourcingPct: 53,
      meals: [
        { id: "fb-1", label: "Breakfast", icon: "☕", servings: 2000, meatPct: 30, vegPct: 50, veganPct: 20, meatKg: 2.5, vegKg: 1.2, veganKg: 0.8 },
        { id: "fb-2", label: "Lunch", icon: "🥗", servings: 2000, meatPct: 40, vegPct: 40, veganPct: 20, meatKg: 5.0, vegKg: 2.0, veganKg: 1.2 },
        { id: "fb-3", label: "Coffee Breaks", icon: "☕", servings: 4000, meatPct: 0, vegPct: 100, veganPct: 0, meatKg: 0, vegKg: 0.5, veganKg: 0.3 },
        { id: "fb-4", label: "Gala Dinner", icon: "🍽️", servings: 541, meatPct: 60, vegPct: 30, veganPct: 10, meatKg: 8.0, vegKg: 3.5, veganKg: 2.0 },
      ],
    },
    materials: {
      status: "estimated",
      recyclingFactor: -0.2,
      items: [
        { id: "mt-1", label: "Conference Badge", icon: "🏷️", qty: 541, weightKg: 0.05, recyclePct: 80, emFactor: 3.5, color: "#7c3aed" },
        { id: "mt-2", label: "Name Lanyard", icon: "🔖", qty: 541, weightKg: 0.02, recyclePct: 0, emFactor: 5.8, color: "#ea580c" },
        { id: "mt-3", label: "Conference Bag", icon: "👜", qty: 541, weightKg: 0.30, recyclePct: 60, emFactor: 2.5, color: "#d97706" },
        { id: "mt-4", label: "Promotional Flyers", icon: "📄", qty: 2000, weightKg: 0.01, recyclePct: 95, emFactor: 1.2, color: "#16a34a" },
        { id: "mt-5", label: "Signage", icon: "🪧", qty: 50, weightKg: 2.0, recyclePct: 70, emFactor: 3.0, color: "#2563eb" },
        { id: "mt-6", label: "Exhibition Materials", icon: "🖼️", qty: 30, weightKg: 15.0, recyclePct: 50, emFactor: 2.8, color: "#0284c7" },
        { id: "mt-7", label: "General Waste", icon: "🗑️", qty: 4, weightKg: 150, recyclePct: 0, emFactor: 0.5, isWaste: true, color: "#6b7280" },
        { id: "mt-8", label: "Recycling", icon: "♻️", qty: 4, weightKg: 200, recyclePct: 100, emFactor: -0.2, isWaste: true, color: "#16a34a" },
        { id: "mt-9", label: "Food Waste", icon: "🍂", qty: 4, weightKg: 100, recyclePct: 0, emFactor: 0.8, isWaste: true, color: "#d97706" },
      ],
    },
    digital: {
      status: "estimated",
      items: [
        { id: "dg-1", label: "Conference App", icon: "📱", desc: "Mobile app usage by attendees", unit: "541 users", kgCO2: 34.6, color: "#0284c7" },
        { id: "dg-2", label: "Cloud Storage", icon: "☁️", desc: "Conference materials and recordings", unit: "30 GB", kgCO2: 2.2, color: "#7c3aed" },
        { id: "dg-3", label: "Email Communications", icon: "📧", desc: "Pre and post conference emails", unit: "5,000 emails", kgCO2: 20.0, color: "#2563eb" },
        { id: "dg-4", label: "Website Traffic", icon: "🌐", desc: "Conference website hosting", unit: "10,000 visits", kgCO2: 2.0, color: "#16a34a" },
      ],
    },
  },
  {
    id: "evt-002", name: "Green Tech Summit", location: "Amsterdam, Netherlands", date: "2026-04-10", endDate: "2026-04-12", status: "upcoming", participants: [
      { id: 1, name: "Sara L.", email: "sara@tu.nl", origin: "", transport: "", distance: 0, hotelNights: 0, submitted: false },
      { id: 2, name: "Tom R.", email: "tom@vu.nl", origin: "", transport: "", distance: 0, hotelNights: 0, submitted: false },
      { id: 3, name: "Uma P.", email: "uma@uva.nl", origin: "", transport: "", distance: 0, hotelNights: 0, submitted: false },
    ], totalInvited: 3, description: "Sustainability & green technology innovation summit"
  },
];

const USERS = [{ id: "u1", name: "Dr.  Jhuokie Chen", email: "test@carbongpt.ai", password: "888888" }];

export { SP, SEED_EVENTS, USERS };
