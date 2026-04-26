<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=220&section=header&text=Roamio&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=Spatial%20Travel%20Planner%20%E2%80%94%20India%20%E2%86%92%20Singapore&descAlignY=58&descSize=18&animation=fadeIn" width="100%"/>

<p>
  <img src="https://img.shields.io/badge/Expo-54.0.33-000020?style=for-the-badge&logo=expo&logoColor=white"/>
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Groq%20AI-Llama--3.3--70b-FF4154?style=for-the-badge&logo=meta&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Android-APK%20Ready-3DDC84?style=for-the-badge&logo=android&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/UI-Mint%20Liquid%20Clay%203D-10B981?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Maps-TomTom%20SDK-FF6B35?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/State-Zustand%20+%20AsyncStorage-FF4154?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Router-Expo%20Router-000020?style=for-the-badge&logo=expo"/>
</p>

<br/>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Plus+Jakarta+Sans&weight=700&size=20&pause=1200&color=10B981&center=true&vCenter=true&width=650&lines=Roamio+AI+Powered+by+Groq+LPU;Plan+multi-city+trips+across+India+%26+Global;Real-time+TomTom+maps+%2B+turn-by-turn+navigation;Manage+your+entire+family+in+one+app;Live+Translator%2C+Weather%2C+SMS+Tracker;Book+tickets+%26+hotels+with+Mint+Clay+UI" alt="Typing SVG" />
</a>

<br/><br/>

</div>

---

## What Problem Does This Solve?

Planning a multi-city family trip across India and Singapore is genuinely hard:

- **Fragmented tools** — Google Maps for navigation, MakeMyTrip for tickets, Excel for budgets, WhatsApp for family coordination. Nothing talks to each other.
- **No spatial awareness** — You can't see your entire route as a connected graph. You don't know if the order of cities makes geographic sense.
- **Family chaos** — Managing 5–11 people with different ages, dietary needs, and document requirements across multiple borders is a logistical nightmare.
- **Budget blindness** — You don't know how much you've spent vs. how much is left until it's too late.

**Roamio solves all of this in one app, supercharged by an elite Groq AI pilot.**

---

## What's New? (April 2026 Rollouts)

* ✨ **Roamio AI Command Center (Groq LPU):** We integrated the `llama-3.3-70b-versatile` model over Groq's high-speed API. Get full trip itineraries, real-time budget guarding, train routes, and visa requirements in sub-seconds. Accessed via a **Floating AI Action Button**.
* 🎨 **Mint Liquid Clay 3D UI:** A complete overhaul to a premium aesthetic (`Mint Liquid Clay`). Enjoy inflated borders, squish-physics buttons, smooth gradients, lottie animations, frosted glass, and responsive dark modes.
* 💳 **Real-Time SMS Expense Tracking:** Fully automated background SMS parsing of bank transactions correctly updates your Trip Wallet.
* 🎙 **Live Voice Integrations:** Real-time speech-to-text (STT) and voice translations via `expo-speech` and `expo-speech-recognition` for 20+ languages.
* 🚄 **Booking Upgrades & Stability:** Eliminated runtime crashes, standardized PDF generation (ticket downloads), and ensured a crash-free experience on Expo SDK 54. 

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

### 1. 🤖 Roamio AI Command Center (Groq LPU)
- Powered by `llama-3.3-70b-versatile`.
- 10x faster trip planning with context-aware responses (it knows your current budget and route).
- Specific capabilities: **Train routes**, **Budget Guard**, **Visa Tracking**, and **11+ family scaling**.
- Interactive rich UI text formatting with inline "Book Now" deep links based on conversation scope.

### 2. 🗺 Interactive TomTom Map (Explore Tab)
- Real map tiles natively rendered via WebView + **TomTom Maps JS SDK v6**.
- **No Google Maps API Key Needed** — fully TomTom-powered.
- Shows your exact trip lines (polylines) natively. Tap to navigate or read city-specific travel guides.
- Search API powered by TomTom's fuzzy search.

### 3. 🛤 Route Planner (Itinerary Tab)
- Create your own paths or try curated options such as *Golden Triangle*, *Spiritual North India*, or *India to Singapore*.
- Visual timeline format managing days, costs, and transitions sequentially.
- Local historical states persisted across device reloads via AsyncStorage.

### 4. 👨‍👩‍👧‍👦 Family Hub & Smart Financials (Profile & Wallet)
- Built for group travel of up to 11 members: Track leader roles and member vows (promises).
- **Wallet & Real-Time Expense SMS Tracking**: Detects transactional SMS and updates remaining buffers instantly.
- **FX & Rates**: 14-day FX sparklines indicating exchange rate trends.
- **Live Translator**: Live multi-lingual TTS/STT using built-in Expo native solutions. 

### 5. 🎟 Booking Manager
- Dummy ticket/hotel reservations demonstrating full layout fidelity: Calendar dropdowns, active lists, beautiful perforated full-screen ticket modals, and functioning PDF generation options.

### 6. ⚙️ Settings (Draft State Pattern)
Settings changes (like currencies) utilize a draft state hook, ensuring user preferences are confirmed via a "Save" action before propagating reactively across the whole app.

---

## Tech Stack — Why These Choices

| Technology | Why |
|---|---|
| **Expo SDK 54** | Managed workflow, EAS cloud builds, ready for New Architecture (`newArchEnabled`) |
| **React Native 0.81.5** | Top-tier performance under the modern RN framework |
| **Expo Router** | File-based routing, tab-layout architecture with deep-linking |
| **Groq API / LLaMA-3.3-70b**| Fast LPU processing allows conversational trip adjustments in ~500ms |
| **Zustand + AsyncStorage**| Zero-boiler state management with offline persistence |
| **TomTom Maps JS SDK** | Cost-effective vector tiles and complete routing engines |
| **TypeScript** | Strict typing across components for zero undefined runtime crashes |

---

## Design System — Mint Liquid Clay 3D

Every UI element follows the **Roamio Mint Liquid Clay 3D** design token system:

```typescript
// Example from src/constants/theme.ts
export const NC = {
  background:    '#E8F5E9',  // Mint Page Bg
  surfaceLowest: '#ffffff',  // White Card Surface
  primary:       '#10B981',  // Mint Green Primary
  primaryFixed:  '#c5f8c7',  // Light Mint
}
```

- **Clay Physics:** Squish animation mapping (`ClayButton.tsx`).
- **UI Soft-shadows:** Top highlights matched with multiple heavy bottom shadows simulating elevated clay (`ClayCard.tsx`).
- **Frosted Glass:** Navigation and tab bar adaptive transparency.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Android device or emulator (for map and background tasks)

### Run locally

```bash
git clone https://github.com/salarkhan2003/Travel-Route-Planner.git
cd spatial-travel-planner

npm install --legacy-peer-deps

# Use custom helper batch scripts available:
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

Or just use `BUILD-APP.bat` / `npm run build:apk`.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=130&section=footer&animation=fadeIn" width="100%"/>

<p>
  <img src="https://img.shields.io/badge/Built%20with-React%20Native-61DAFB?style=flat-square&logo=react"/>
  <img src="https://img.shields.io/badge/Maps-TomTom-FF6B35?style=flat-square"/>
  <img src="https://img.shields.io/badge/UI-Mint%20Liquid%20Clay%203D-10B981?style=flat-square"/>
  <img src="https://img.shields.io/badge/AI-Groq%20LPU-0C1A12?style=flat-square"/>
</p>

**India 🇮🇳 → Singapore 🇸🇬 and every city in between**

*Built by [Salar Khan](https://github.com/salarkhan2003)*

</div>
