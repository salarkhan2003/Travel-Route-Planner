# 🚀 START HERE - Roamio App

## Quick Start (3 Steps)

### Step 1: Verify Files
```bash
VERIFY-FILES.bat
```
This checks if all required files are present.

### Step 2: Restart with Clean Cache
```bash
RESTART-APP.bat
```
This clears cache and starts the app fresh.

### Step 3: Open in Expo Go
- Open Expo Go app on your phone
- Scan the QR code shown in terminal
- Wait for app to load

---

## What You Should See

### 1. Onboarding Screen (First Time)
- 5 slides with animations (or fallback icons)
- Mint green background
- Clay-styled cards
- "Get Started" button on last slide

### 2. Home Screen
- Logo: Circular badge with "R" (top left)
- Search bar with clay styling
- Hero card (green background)
- Weather cards
- Tool buttons
- Family hub
- All with mint green theme

### 3. Other Tabs
- **Explore**: Map with search and filters
- **Routes**: Your itinerary and popular routes
- **Saved**: Saved destinations
- **Booking**: Tickets and hotels

---

## If Changes Aren't Showing

### Option 1: Quick Reload
In Expo Go app:
1. Shake your device
2. Tap "Reload"

### Option 2: Clear Cache
```bash
RESTART-APP.bat
```

### Option 3: Nuclear Reset
```bash
# Delete and reinstall
rmdir /s /q node_modules
npm install
npx expo start --clear
```

---

## Common Issues

### Issue: Blank/White Screen
**Fix**: 
- Check terminal for error messages
- Try: `npx expo start --clear`
- Reload app in Expo Go

### Issue: Animations Not Showing
**Fix**:
- Animations have fallback icons
- Should see icons even if Lottie fails
- Check `/animations` folder exists

### Issue: Logo Not Showing
**Fix**:
- Logo is now a styled component (no image needed)
- Should see circular "R" badge
- If not, check if home screen loads at all

### Issue: Old Code Still Running
**Fix**:
```bash
RESTART-APP.bat
```

---

## Development Commands

### Start App
```bash
npm start
# or
npx expo start
```

### Start with Clean Cache
```bash
npx expo start --clear
```

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

---

## Metro Bundler Shortcuts

While app is running, press in terminal:
- `r` - Reload
- `shift + r` - Reload with cache clear
- `m` - Toggle menu
- `d` - Developer menu
- `j` - Debugger

---

## Clay Theme Features

### Visual Design
✅ Mint green background (#E8F5E9)
✅ White clay cards (40px radius)
✅ Soft shadows (inflated look)
✅ Deep forest green accents (#1B5E20, #2E7D32)

### Interactions
✅ Squish animation on buttons
✅ Spring physics (damping:15, stiffness:150)
✅ Smooth transitions
✅ Liquid progress bars

### Components
✅ ClayButton - Squishable buttons
✅ ClayCard - Inflated cards
✅ ClayToggle - Smooth toggles

---

## File Structure

```
spatial-travel-planner/
├── app/
│   ├── index.tsx              # Entry point
│   ├── onboarding.tsx         # Welcome screen
│   ├── _layout.tsx            # Root layout
│   └── (tabs)/
│       ├── home.tsx           # Home screen
│       ├── explore.tsx        # Map screen
│       ├── itinerary.tsx      # Routes screen
│       ├── booking.tsx        # Booking screen
│       ├── saved.tsx          # Saved screen
│       ├── profile.tsx        # Profile screen
│       └── _layout.tsx        # Tab layout
├── src/
│   ├── components/
│   │   └── clay/              # Clay components
│   ├── constants/
│   │   └── theme.ts           # Theme config
│   └── store/                 # State management
├── animations/                # Lottie animations
└── package.json
```

---

## Verification Checklist

After starting app, verify:

- [ ] Onboarding screen loads
- [ ] Animations or fallback icons show
- [ ] Can swipe through slides
- [ ] "Get Started" works
- [ ] Home screen shows
- [ ] Logo (circular "R") visible
- [ ] Tabs work
- [ ] Clay theme visible (mint green, rounded)
- [ ] Buttons animate on press

---

## Need Help?

1. **Check TROUBLESHOOTING.md** for detailed solutions
2. **Run VERIFY-FILES.bat** to check file integrity
3. **Check terminal** for error messages
4. **Check Expo Go app** for red error screens

---

## Next Steps

Once app is running:
1. Explore all tabs
2. Test animations and interactions
3. Try adding cities to your trip
4. Test the booking flow
5. Customize your profile

---

*Last Updated: April 16, 2026*
*Version: 1.0*
