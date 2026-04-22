<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=220&section=header&text=Roamio&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=Spatial%20Travel%20Planner%20%E2%80%94%20India%20%E2%86%92%20Singapore&descAlignY=58&descSize=18&animation=fadeIn" width="100%"/>

<p>
  <img src="https://img.shields.io/badge/Expo-54.0.33-000020?style=for-the-badge&logo=expo&logoColor=white"/>
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Android-APK%20Ready-3DDC84?style=for-the-badge&logo=android&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Maps-TomTom%20SDK-FF6B35?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/State-Zustand%20+%20AsyncStorage-FF4154?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/UI-Liquid%20Clay%203D-39653f?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Router-Expo%20Router-000020?style=for-the-badge&logo=expo"/>
</p>

<br/>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Plus+Jakarta+Sans&weight=700&size=20&pause=1200&color=39653F&center=true&vCenter=true&width=650&lines=Plan+multi-city+trips+across+India+%26+Global;Real-time+TomTom+maps+%2B+turn-by-turn+navigation;Manage+your+entire+family+in+one+app;Live+Translator%2C+Weather%2C+14-Day+FX+Sparklines;Book+tickets+%26+hotels+with+beautiful+UI" alt="Typing SVG" />
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

**Roamio solves all of this in one app.**

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

**History** — persistent state powered by **AsyncStorage**, bringing all booked trips with status (Booked / Ongoing / Completed / Cancelled), dates, cities, and total spend efficiently over sessions.

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

---

### 4. Smart Financials & Localization

**Real-time budget tracking:**
- Global budget set in settings (default ₹50,000)
- Every city added auto-calculates: hotel cost/night × nights
- Every transport edge adds its cost
- `spentBudget` recomputes instantly on any change
- Items exceeding 80% of budget threshold are flagged as "over budget" (greyed out)

**Currency Conversation & FX Sparklines:**
- Supported: INR, SGD, USD, EUR, GBP
- Visual 14-day FX sparklines indicating exchange rate trends.
- Changes propagate instantly across every app screen using reactive hooks and Zustand state.

**Real-time SMS Expense Tracking:**
- Automated parsing of bank/transactional SMS messages.
- Real-time wallet updates via background listener logic.
- Robust regex support for INR/₹/Amt currency patterns.

**Real-Time Language Translation:**
- Functional voice translations supporting **real-time Speech-to-Text** & Text-to-Speech (utilizing `expo-speech-recognition` and `expo-speech`). Translate quickly between 20+ global languages while on the road via the unified live translator tool.

**Detailed Booking Search Results:**
- Search results now feature a progressive detail view.
- Real-time availability (seats remaining), fare breakdowns (base vs. taxes), and schedule specifics.
- Deep linking to official booking apps (IRCTC, MakeMyTrip, RedBus, Booking.com).

**Weather Management:**
- User-driven route weather synchronization. Add destinations manually and see real-time forecasts.

---

### 5. Booking Manager (Booking Tab)

Three sections with advanced dummy operations pre-loaded for demonstration:

**Tickets** — 3 pre-loaded tickets:
- Featuring a functional Calendar and fully interactive dropdown-based Search System.
- Tracks Active vs. Historical tickets (Syncs securely onto device storage).
- Tap any ticket → **full-screen detail modal** with perforated tear-line divider (like a real ticket)

**Hotels** — 3 pre-loaded hotels:
- The Ajmer Grand, Marina Bay Suites Singapore, Hotel Janpath Delhi.
- Details modal outlining check-in/out schedules, amenity chips, and explicit addresses.

**Wallet** — budget breakdown featuring liquid percentage bars.

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

## Technical Features: App Boot & Resilience

* **Persistent Onboarding**: Tracks first-launch events using `AsyncStorage`. Users only see the onboarding animated flow once!
* **Robust Lottie Render Engine**: All Lotties automatically resort to fallback native components on error during onboarding to avoid unmounting blocks.

### Latest Updates (April 2026)

* **🎬 Movies & Entertainment**: City-based movie search with real showtimes from International Showtimes API. View ratings, reviews, cast info, and book via BookMyShow/Paytm.
* **🚂 Train Tracking**: Live train running status, PNR status check, and find trains between stations using IRCTC APIs.
* **⚡ EV Charging Stations**: Find nearby EV charging stations on the map using TomTom API.
* **🚦 Traffic Flow**: Real-time traffic information with current speed and congestion data.
* **🔍 Nearby POI Search**: Find restaurants, hospitals, fuel stations, ATMs, malls with quick category buttons.
* **📍 Reachable Range**: Calculate travelable distance in 15/30/60 minutes using TomTom Isochrones API.
* **🗺️ Enhanced Popular Routes**: Hero images for all routes (Taj Mahal, Varanasi Ghats, Goa beaches, etc.).
* **🌙 Dark Mode**: Full dark theme support with forest-green night palette.
* **📄 Legal Pages**: Privacy Policy, Terms & Conditions, and About pages in Settings.
* **🎨 Dynamic Claymorphism**: Tab bar and UI now adapt to dark/light themes.

---

## Tech Stack — Why These Choices

| Technology | Why |
|---|---|
| **Expo SDK 54** | Managed workflow, EAS cloud builds, no Android Studio needed for CI |
| **React Native 0.81.5** | New Architecture enabled (`newArchEnabled: true`) for better performance |
| **Expo Router** | File-based routing, deep linking, typed routes |
| **Expo Speech Recognition** | Native-level real-time voice typing (STT) |
| **Zustand + AsyncStorage**| Minimal boilerplate state management, reactive subscriptions, persisting storage |
| **TomTom Maps JS SDK** | No Google Maps billing, generous free tier, dotLottie-quality vector tiles |
| **TypeScript** | Full type safety across stores, components, and API responses |

---

## Design System — Liquid Clay 3D

Every UI element follows the **Roamio Liquid Clay 3D** design token system:

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
borderRadius: 40
borderColor: rgba(255,255,255,0.95)   ← top-left highlight
shadowColor: rgba(42,49,39,0.10–0.18)
shadowOffset: { width: 0, height: 12–20 }
shadowRadius: 28–40
elevation: 8–12
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

# Use custom helper batch scripts:
RUN-APP.bat
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
| MyMemory API | Translation API endpoint | Free language mapping endpoint |
| ExchangeRate| `src/hooks/useCurrency` or similar | Fetch real-time FX mappings |

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
