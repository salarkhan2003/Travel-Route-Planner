<div align="center">

<!-- Animated header banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=Nomad%20Canvas&fontSize=60&fontColor=ffffff&fontAlignY=38&desc=Spatial%20Travel%20Planner&descAlignY=58&descSize=20&animation=fadeIn" width="100%"/>

<!-- Badges row -->
<p>
  <img src="https://img.shields.io/badge/Expo-54.0.33-000020?style=for-the-badge&logo=expo&logoColor=white"/>
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Design-Liquid%20Clay%20UI-39653f?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Maps-TomTom%20SDK-FF6B35?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/State-Zustand-FF4154?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Router-Expo%20Router-000020?style=for-the-badge&logo=expo"/>
</p>

<br/>

<!-- Animated typing -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Plus+Jakarta+Sans&weight=700&size=22&pause=1000&color=39653F&center=true&vCenter=true&width=600&lines=Plan+beautiful+travel+itineraries;India+%E2%86%92+Singapore+%26+beyond;Liquid+Clay+3D+UI+%2F+UX;Real-time+TomTom+Maps+%26+Navigation;Family+trip+management+built-in" alt="Typing SVG" />
</a>

<br/><br/>

</div>

---

## What is Nomad Canvas?

**Nomad Canvas** is a high-fidelity travel planning app built with React Native & Expo. It combines a **Node-Edge graph architecture** (cities as nodes, transport as edges) with a stunning **Liquid Claymorphism UI** — soft 3D cards, pastel mint accents, and deep green shadows — inspired by the Nomad Canvas design system.

Plan multi-city trips across India and Singapore, manage your family group, track budgets in real-time, and navigate with live TomTom maps — all from one beautiful app.

---

## Design System — Liquid Clay

The entire UI is built on a custom **Liquid Clay** design token system:

```
Background:    #f2f9ea  — soft mint page surface
Cards:         #ffffff  — white clay cards with green shadow lift
Primary:       #39653f  — deep forest green
Primary Fixed: #c5f8c7  — light mint (badges, active states)
Shadow recipe: rgba(42,49,39,0.10–0.18) at y:12–20, blur:28–40
Border:        rgba(255,255,255,0.95) — top-left highlight
Nav bar:       White pill, floating, clay outer shadow
```

Cards use the **double-inner-shadow clay recipe**:
```
box-shadow:
  20px 40px 40px rgba(42,49,39,0.06),      ← outer drop
  inset 4px 4px 8px rgba(255,255,255,0.8), ← top-left sheen
  inset -6px -6px 12px rgba(52,96,59,0.15) ← bottom-right depth
```

---

## Features

| Feature | Description |
|---|---|
| **Interactive Map** | TomTom Maps SDK via WebView — real tiles, markers, polylines |
| **Live Navigation** | Turn-by-turn directions using TomTom Routing API |
| **Route Planner** | Node-edge graph — cities as nodes, transport as edges |
| **Popular Routes** | Curated India & Singapore itineraries with day-by-day plans |
| **Family Hub** | Manage up to 11 members, roles, live broadcast |
| **Budget Tracker** | Real-time spend tracking with per-city breakdown |
| **Currency Converter** | Live FX — INR, SGD, USD, EUR, GBP |
| **Booking Manager** | Dummy tickets (train/flight/bus) + hotels with detail modals |
| **Saved Places** | Heart any city, filter by category |
| **Onboarding** | 4-slide animated welcome with clay card illustrations |
| **Settings** | Draft-based preferences with Save button |

---

## Tech Stack

```
Framework      Expo SDK 54 + React Native 0.81.5
Navigation     Expo Router (file-based)
State          Zustand
Maps           TomTom Maps JS SDK 6.x (WebView)
Location       expo-location
UI             Custom Liquid Clay design system
Language       TypeScript 5.9
Build          EAS Build (APK)
```

---

## Project Structure

```
spatial-travel-planner/
├── app/
│   ├── (tabs)/
│   │   ├── home.tsx          # Dashboard, weather, polls, family hub
│   │   ├── explore.tsx       # TomTom map, search, navigation
│   │   ├── itinerary.tsx     # Routes, popular trips, history
│   │   ├── booking.tsx       # Tickets, hotels, wallet
│   │   ├── saved.tsx         # Saved places
│   │   ├── profile.tsx       # Profile, badges, vows
│   │   └── _layout.tsx       # Floating clay nav bar
│   ├── onboarding.tsx        # Animated welcome screens
│   └── settings.tsx          # Preferences with Save button
├── src/
│   ├── components/
│   │   ├── clay/             # ClayCard, ClayButton, ClayToggle
│   │   └── TomTomMap.tsx     # WebView map component
│   ├── constants/
│   │   ├── theme.ts          # NC design tokens
│   │   ├── locations.ts      # India + Singapore cities
│   │   └── popularRoutes.ts  # Curated itineraries
│   ├── hooks/
│   │   ├── useGoogleMaps.ts  # TomTom API (search + routing)
│   │   └── useCurrency.ts    # Live currency conversion
│   └── store/                # Zustand stores
│       ├── tripStore.ts
│       ├── familyStore.ts
│       ├── savedStore.ts
│       └── settingsStore.ts
└── animations/               # Lottie animation files
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Android device or emulator

### Run locally

```bash
# Clone the repo
git clone <your-repo-url>
cd spatial-travel-planner

# Install dependencies
npm install --legacy-peer-deps

# Start Expo
npx expo start --clear
```

> Scan the QR code with **Expo Go** on Android.  
> The Map tab requires a dev build (native WebView).

### Build APK via EAS

```bash
# Login to Expo
eas login

# Build APK
eas build --platform android --profile apk
```

> **Note:** Run from a path with no special characters (e.g. `C:\builds\stp`).

---

## API Keys

| Service | Key location | Notes |
|---|---|---|
| TomTom Maps | `src/hooks/useGoogleMaps.ts` | `TOMTOM_API_KEY` constant |

The app uses **TomTom** for all map tiles, place search, and routing. No Google Maps API key required.

---

## Screens

<table>
<tr>
<td align="center"><b>Onboarding</b><br/>Animated clay illustrations</td>
<td align="center"><b>Home</b><br/>Dashboard + live trip card</td>
<td align="center"><b>Explore</b><br/>TomTom map + navigation</td>
</tr>
<tr>
<td align="center"><b>Itinerary</b><br/>Route timeline + popular trips</td>
<td align="center"><b>Booking</b><br/>Tickets + hotels with modals</td>
<td align="center"><b>Profile</b><br/>Family hub + badges</td>
</tr>
</table>

---

## Roadmap

- [ ] Supabase real-time sync for family members
- [ ] Push notifications for trip alerts
- [ ] Offline map tiles download
- [ ] AI-powered itinerary suggestions
- [ ] Payment gateway integration
- [ ] iOS build support

---

<div align="center">

<!-- Animated footer -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=fadeIn" width="100%"/>

<p>
  <img src="https://img.shields.io/badge/Made%20with-React%20Native-61DAFB?style=flat-square&logo=react"/>
  <img src="https://img.shields.io/badge/UI-Liquid%20Clay-39653f?style=flat-square"/>
  <img src="https://img.shields.io/badge/Built%20for-Travellers-FF6B35?style=flat-square"/>
</p>

**India 🇮🇳 → Singapore 🇸🇬 and beyond**

</div>
