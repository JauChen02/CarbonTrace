# CarbonTrace

Event carbon emissions tracker. Built with React + Vite.

## Getting started

```bash
npm install
npm run dev
```

Login: `test@carbongpt.ai` / `888888`

## Project structure

```
src/
├── App.jsx                      Root — routing + top-level state
├── theme.js                     Design tokens (colours, typography)
├── constants.js                 Emission factors (DEFRA 2025) + section metadata
├── styles.js                    Global CSS string injected by Shell
├── main.jsx                     React DOM entry point
│
├── data/
│   └── seed.js                  Demo participants, events, credentials
│
├── utils/
│   ├── calcEm.js                Per-participant CO₂ calculation
│   ├── computeStats.js          Event-level KPIs + extrapolation engine
│   ├── parseCSV.js              CSV text → { headers, rows }
│   └── helpers.js               hexToRgb and other pure utilities
│
├── components/
│   ├── ui/
│   │   ├── Card.jsx             Base card container
│   │   ├── KpiCard.jsx          Labelled metric card
│   │   ├── StatusBadge.jsx      Event status pill
│   │   ├── Avatar.jsx           Initials avatar
│   │   ├── ProgressBar.jsx      Percentage bar
│   │   ├── Badges.jsx           SourceBadge, ValidityBadge, isRowValid
│   │   ├── DCard.jsx            DCard, SectionHeader, MethodologyBox
│   │   └── index.js             Barrel export for all UI components
│   └── layout/
│       ├── Sidebar.jsx          Sidebar with collapsible event list
│       ├── Topbar.jsx           Sticky top bar with title + actions
│       └── Shell.jsx            Full-page frame (Sidebar + Topbar + content)
│
├── pages/
│   ├── LoginPage.jsx            Login form
│   ├── DashboardPage.jsx        Events overview + NewEventModal
│   ├── EventPage.jsx            Event detail with tab navigation
│   ├── RawDataPage.jsx          Raw data + emission factors reference
│   └── SurveyPage.jsx           Public participant survey (no login)
│
├── tabs/                        Tabs rendered inside EventPage
│   ├── CarbonReportTab.jsx      Main report: exec summary + all sections
│   ├── OverviewTab.jsx          Charts overview
│   ├── ParticipantsTab.jsx      Inline-editable participant table
│   ├── InviteTab.jsx            Survey link generator
│   └── AnalyticsTab.jsx         Analytics charts + AI insights (Claude API)
│
└── sections/                    Carbon Report section components
    ├── OffsettingCard.jsx        Offsetting status KPI card (editable)
    ├── TravelSection.jsx         Delegate travel + regions + local transport
    ├── AccomSection.jsx          Hotel accommodation
    ├── VenueEnergySection.jsx    Venue electricity
    ├── FoodBevSection.jsx        Catering emissions
    ├── MaterialsSection.jsx      Materials + waste
    ├── DigitalSection.jsx        Digital footprint
    ├── PlaceholderSection.jsx    Empty section for new events
    └── DataQualitySection.jsx    Extrapolation methodology + validity
```
