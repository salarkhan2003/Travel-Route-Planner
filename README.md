<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=220&section=header&text=Nomad%20Canvas&fontSize=64&fontColor=ffffff&fontAlignY=38&desc=Spatial%20Travel%20Planner%20%E2%80%94%20India%20%E2%86%92%20Singapore&descAlignY=58&descSize=18&animation=fadeIn" width="100%"/>

<p>
  <img src="https://img.shields.io/badge/Expo-54.0.33-000020?style=for-the-badge&logo=expo&logoColor=white"/>
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Android-APK%20Ready-3DDC84?style=for-the-badge&logo=android&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Maps-TomTom%20SDK-FF6B35?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/State-Zustand-FF4154?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/UI-Liquid%20Clay%203D-39653f?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Router-Expo%20Router-000020?style=for-the-badge&logo=expo"/>
</p>

<br/>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Plus+Jakarta+Sans&weight=700&size=20&pause=1200&color=39653F&center=true&vCenter=true&width=650&lines=Plan+multi-city+trips+across+India+%26+Singapore;Real-time+TomTom+maps+%2B+turn-by-turn+navigation;Manage+your+entire+family+in+one+app;Track+budgets%2C+split+expenses%2C+convert+currency;Book+tickets+%26+hotels+with+beautiful+UI" alt="Typing SVG" />
</a>

<br/><br/>

</div>

---

## What Problem Does This Solve?

Planning a multi-city family trip across India and Singapore is genuinely hard:

- **Fragmented tools** — you use Google Maps for navigation, MakeMyTrip for tickets, Excel for budgets, WhatsApp for family coordination. Nothing talks to each other.
- **No spatial awareness** — you can't see your entire route as a connected graph. You don't know if the order of cities makes geographic sense.
- **Family chaos** — managing 5–11 people with different ages, dietary needs, and document requirements across multiple cities is a logistical nightmare.
- **Budget blindness** — you don't know how much you've spent vs. how much is left until it's too late.

**Nomad Canvas solves all of this in one app.**

---

## How It Works — Core Architecture

The app is built on a **Node-Edge Graph model**:

```
City A (Node) ──[Train Edge]──► City B (Node) ──[Flight Edge]──► City C (Node)
   │                                  │                                │
 Stay cost                         Stay cost                       Stay cost
 Hotel nights                      Hotel nights                    Hotel nights
```

Every **city** you add becomes a **node** with:
- Hotel cost per night × number of nights
- Highlights, description, tags
- Coordinates for map rendering

Every **connection** between cities is an **edge (path)** with:
- Multiple transport options (train, flight, bus, road)
- Cost and duration for each option
- One selected mode at a time — swappable with a single tap

The **total trip cost** = sum of all node stay costs + sum of all selected edge transport costs. This updates in real-time as you add cities or swap transport.

---

## Core Features — In Depth

### 1. Interactive TomTom Map (Explore Tab)

The map is powered by **TomTom Maps JS SDK v6** rendered inside a React Native WebView. This means:

- **Real map tiles** — not a placeholder, actual TomTom vector maps
- **No Google Maps API key needed** — fully TomTom-powered
- **Instant location** — requests GPS permission on app open, shows your current position with a unique pulsing green dot marker
- **City markers** — all 20+ India + Singapore cities shown as color-coded pins (green = general, teal = Singapore, purple = spiritual, orange = heritage, cyan = beach)
- **Route polylines** — your planned trip route drawn on the map with transport-color-coded lines
- **Search** — TomTom Fuzzy Search API finds any place, city, or landmark worldwide
- **Navigation** — tap Navigate on any city to get real turn-by-turn directions via TomTom Routing API (driving, walking, transit modes)
- **Travel Guide** — tap Guide on any city for best season, getting there options, must-see highlights

**How the WebView bridge works:**
```
React Native ──postMessage──► WebView (TomTom JS SDK)
WebView ──onMessage──► React Native (marker press, map ready)
```
Commands like `flyTo`, `setMarker`, `setPolyline`, `fitBounds` are sent as JSON messages and executed inside the WebView's JavaScript context.

---

### 2. Route Planner (Itinerary Tab)

Three sub-sections:

**My Routes** — your personal trip timeline:
- Visual stop-by-stop timeline with numbered nodes
- Each stop shows city, country, nights, stay cost, description, highlights
- Between stops: transport card showing mode, service name, cost, duration — tap to swap
- Budget card at top: total budget vs. spent, progress bar, remaining amount
- Trip summary: accommodation total, transport total, grand total

**Popular Routes** — 6 curated itineraries:
- Golden Triangle (Delhi → Agra → Jaipur, 7 days, Heritage)
- Spiritual North India (Ajmer → Pushkar → Varanasi, 6 days)
- Rajasthan Royal Circuit (Jaipur → Jodhpur → Udaipur, 8 days)
- South India Temples (Chennai → Madurai → Kochi, 7 days)
- Singapore Explorer (3 days, all major districts)
- India to Singapore (full 14-day cross-border journey)

Each popular route has a full **day-by-day itinerary** with activities, stays, and transport. Tap "Book This Trip" to add it to your history.

**History** — all booked trips with status (Booked / Ongoing / Completed / Cancelled), dates, cities, and total spend.

---

### 3. Family Hub (Profile Tab)

Built for **group travel with up to 11 members**:

- **Member profiles** — name, relation, age, role (Leader / Member)
- **Trip Leader** — one designated leader (you) who manages the trip
- **Add/Remove members** — dynamically manage your group
- **Trip Promises (Vows)** — spiritual/personal goals for the trip (e.g. "Visit Ajmer Dargah", "See Marina Bay Sands"). Long-press to mark fulfilled.
- **Spend Overview** — per-city bar chart showing how much of the budget each city consumed
- **Badges** — achievement system (Trip Planner, Sky Traveller, Family CEO, International, Pilgrim, Budget Master)
- **Broadcast** — send live location to all family members
- **Share Itinerary** — share trip link

**Default family pre-loaded:**
```
Salar Khan (Leader, 22) · Dad (52) · Mom (48) · Sister 1 (25) · Sister 2 (20)
```

---

### 4. Budget & Currency System

**Real-time budget tracking:**
- Global budget set in settings (default ₹50,000)
- Every city added auto-calculates: hotel cost/night × nights
- Every transport edge adds its cost
- `spentBudget` recomputes instantly on any change
- Items exceeding 80% of budget threshold are flagged as "over budget" (greyed out)

**Currency conversion:**
- Supported: INR, SGD, USD, EUR, GBP
- All prices displayed in your selected currency
- Change currency in Settings → Save → all price displays update instantly across every screen
- Live FX rates table in Settings

**How currency flows through the app:**
```
settingsStore.currency
      ↓
useCurrency() hook (subscribes to store)
      ↓
fmtFull(amountINR) → converts + formats
      ↓
Every screen that shows prices re-renders automatically
```

---

### 5. Booking Manager (Booking Tab)

Three sections with dummy data pre-loaded for demonstration:

**Tickets** — 3 pre-loaded tickets:
- Rajdhani Express: Guntur → Ajmer (Train, 3AC, 11h 35m, ₹2,670)
- IndiGo 6E-85: Delhi → Singapore (Flight, Economy, 5h 25m, ₹55,500)
- RSRTC Volvo: Ajmer → Delhi (Bus, AC Sleeper, 6h 30m, ₹1,350)

Tap any ticket → **full-screen detail modal** with:
- Colored header strip (transport-type color)
- Departure/arrival times with city codes
- Perforated tear-line divider (like a real ticket)
- PNR, class, coach, seat, passenger count, total fare
- QR code placeholder

**Hotels** — 3 pre-loaded hotels:
- The Ajmer Grand (5 nights, ₹28,000)
- Marina Bay Suites Singapore (6 nights, S$2,160)
- Hotel Janpath Delhi (1 night, ₹3,500)

Tap any hotel → detail modal with check-in/out, room type, amenities chips, address.

**Wallet** — budget breakdown:
- Total trip cost hero card (dark green)
- Per-category spend: Train, Flight, Bus, Hotels with percentage bars

---

### 6. Saved Places (Saved Tab)

- Heart any city on the Explore map to save it
- Filter saved places by: All, India, Singapore, Spiritual, Beach, Heritage, Food
- Each card shows: city name, region, description, highlights tags, hotel cost/night
- Heart button toggles save/unsave with visual feedback
- Accent bar on each card color-coded by country (green = India, teal = Singapore)

---

### 7. Settings — How Preferences Work

Settings uses a **draft state pattern** — changes are local until you tap Save:

```
User changes currency → draft.currency updates (UI shows preview)
User taps Save → store.setCurrency() called → useCurrency() re-renders all screens
```

This prevents accidental changes from immediately affecting the whole app. The Save button only appears when there are unsaved changes.

---

## City Database

The app includes **20+ pre-loaded cities** across India and Singapore:

| Region | Cities |
|---|---|
| North India | Delhi, Agra, Ajmer, Jaipur, Varanasi, Pushkar |
| West India | Mumbai, Goa |
| South India | Hyderabad, Guntur, Chennai, Kochi, Madurai |
| East India | Kolkata |
| Rajasthan | Jodhpur, Udaipur, Bikaner |
| Singapore | Marina Bay, Sentosa, Orchard, Chinatown, Little India |

Each city has: coordinates, description, tags, average hotel cost (USD), highlights array.

---

## Transport Options

Every route between two cities offers multiple transport modes:

| Mode | Color | Use case |
|---|---|---|
| Train | Green `#4CAF50` | Long-distance India travel, 3AC/2AC/Sleeper |
| Flight | Blue `#1565C0` | International + domestic air travel |
| Bus | Orange `#FF7043` | Budget travel, short distances |
| Road | Amber `#FFB300` | Self-drive, cab, road trips |

Swapping transport on any leg instantly recalculates the total trip cost.

---

## Tech Stack — Why These Choices

| Technology | Why |
|---|---|
| **Expo SDK 54** | Managed workflow, EAS cloud builds, no Android Studio needed for CI |
| **React Native 0.81.5** | New Architecture enabled (`newArchEnabled: true`) for better performance |
| **Expo Router** | File-based routing, deep linking, typed routes |
| **Zustand** | Minimal boilerplate state management, reactive subscriptions |
| **TomTom Maps JS SDK** | No Google Maps billing, generous free tier, dotLottie-quality vector tiles |
| **WebView bridge** | Lets us use the full TomTom JS SDK without a native React Native wrapper |
| **TypeScript** | Full type safety across stores, components, and API responses |

---

## Design System — Liquid Clay

Every UI element follows the **Nomad Canvas Liquid Clay** design token system:

```typescript
// From src/constants/theme.ts
export const NC = {
  background:    '#f2f9ea',  // soft mint page surface
  surfaceLowest: '#ffffff',  // white card surface
  primary:       '#39653f',  // deep forest green
  primaryFixed:  '#c5f8c7',  // light mint (active states, badges)
  onSurface:     '#2a3127',  // main text
  onSurfaceVariant: '#575e52', // muted text
}
```

**Clay card recipe** (approximated in React Native):
```
backgroundColor: #ffffff
borderRadius: 28
borderColor: rgba(255,255,255,0.95)   ← top-left highlight
shadowColor: rgba(42,49,39,0.10–0.18)
shadowOffset: { width: 0, height: 12–20 }
shadowRadius: 28–40
elevation: 8–12
```

**Navigation bar** — floating white pill with:
- `rgba(42,49,39,0.14)` outer drop shadow at y:16, blur:32
- Active tab: `#c5f8c7` pill background (inset clay pressed effect)
- Rendered via `tabBarBackground` for full visual control

---

## Project Structure

```
spatial-travel-planner/
├── app/
│   ├── (tabs)/
│   │   ├── home.tsx        # Dashboard: live trip card, weather, polls, family hub
│   │   ├── explore.tsx     # TomTom map, search, navigation, travel guides
│   │   ├── itinerary.tsx   # Route timeline, popular routes, trip history
│   │   ├── booking.tsx     # Tickets + hotels with full detail modals
│   │   ├── saved.tsx       # Saved places with category filters
│   │   ├── profile.tsx     # Profile, family, vows, badges, spend overview
│   │   └── _layout.tsx     # Floating clay navigation bar
│   ├── onboarding.tsx      # 4-slide animated welcome (pure RN animations)
│   ├── settings.tsx        # Draft-based preferences with Save button
│   └── _layout.tsx         # Root layout with gesture handler
├── src/
│   ├── components/
│   │   ├── clay/
│   │   │   ├── ClayCard.tsx    # White surface + green shadow card
│   │   │   ├── ClayButton.tsx  # Animated press clay button
│   │   │   └── ClayToggle.tsx  # Spring-animated toggle switch
│   │   └── TomTomMap.tsx       # WebView + TomTom JS SDK bridge
│   ├── constants/
│   │   ├── theme.ts            # NC design tokens
│   │   ├── locations.ts        # 20+ city database
│   │   ├── popularRoutes.ts    # 6 curated itineraries with day plans
│   │   ├── currencies.ts       # INR/SGD/USD/EUR/GBP rates
│   │   └── tripData.ts         # Transport colors, icons
│   ├── hooks/
│   │   ├── useGoogleMaps.ts    # TomTom Search + Routing API
│   │   └── useCurrency.ts      # Reactive currency conversion
│   └── store/
│       ├── tripStore.ts        # Nodes, paths, budget, transport swap
│       ├── familyStore.ts      # Members, vows, total budget
│       ├── savedStore.ts       # Saved city IDs
│       ├── historyStore.ts     # Booked trip history
│       └── settingsStore.ts    # Currency, class, map style, toggles
└── animations/                 # Lottie files (airport, train, planning, bus)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Android device or emulator (for map features)

### Run locally

```bash
git clone https://github.com/salarkhan2003/Travel-Route-Planner.git
cd spatial-travel-planner

npm install --legacy-peer-deps

npx expo start --clear
```

> Scan the QR with **Expo Go** on Android.
> The Map tab (TomTom WebView) requires a dev build or APK.

### Build APK

```bash
# Must run from a path with no special characters
cd C:\builds\stp

npm install --legacy-peer-deps
git add .
git commit -m "build"

eas login
eas build --platform android --profile apk
```

---

## API Keys

| Service | Location | Purpose |
|---|---|---|
| TomTom Maps | `src/hooks/useGoogleMaps.ts` → `TOMTOM_API_KEY` | Map tiles, place search, routing |

No Google Maps, no Firebase, no Supabase required. The app works fully offline except for map tiles and search.

---

## Roadmap

- [ ] Supabase real-time sync — share itinerary with family members live
- [ ] Push notifications — departure reminders, budget alerts
- [ ] Offline map tiles — download city maps for no-internet travel
- [ ] AI itinerary builder — describe your trip, get a full plan
- [ ] IRCTC / MakeMyTrip deep links — one-tap booking
- [ ] Expense photo scan — snap a bill, auto-split among members
- [ ] iOS build support
- [ ] Multi-language support (Hindi, Tamil, Telugu)

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=130&section=footer&animation=fadeIn" width="100%"/>

<p>
  <img src="https://img.shields.io/badge/Built%20with-React%20Native-61DAFB?style=flat-square&logo=react"/>
  <img src="https://img.shields.io/badge/Maps-TomTom-FF6B35?style=flat-square"/>
  <img src="https://img.shields.io/badge/UI-Liquid%20Clay%203D-39653f?style=flat-square"/>
  <img src="https://img.shields.io/badge/For-Family%20Travellers-c5f8c7?style=flat-square&labelColor=39653f"/>
</p>

**India 🇮🇳 → Singapore 🇸🇬 and every city in between**

*Built by [Salar Khan](https://github.com/salarkhan2003)*

</div>
