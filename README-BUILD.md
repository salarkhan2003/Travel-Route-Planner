# 🚀 Build & Run Instructions - Roamio App

## Quick Start (Choose One Method)

### Method 1: Automated Build (Recommended)
```bash
# Double-click this file:
BUILD-APP.bat
```
This will:
- Check Node.js and npm
- Install dependencies if needed
- Clear cache
- Start the app

### Method 2: Manual Build
```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start the app
npm start
```

### Method 3: Clean Build (If having issues)
```bash
# 1. Check status first
CHECK-STATUS.bat

# 2. Clean restart
RESTART-APP.bat
```

---

## Step-by-Step Instructions

### 1️⃣ Prerequisites

**Required:**
- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

**Check if installed:**
```bash
node --version
npm --version
```

### 2️⃣ First Time Setup

```bash
# Navigate to project folder
cd spatial-travel-planner

# Install dependencies
npm install

# This will take 2-5 minutes
```

### 3️⃣ Start the App

```bash
# Option A: Use build script
BUILD-APP.bat

# Option B: Use npm
npm start

# Option C: Use npx directly
npx expo start --clear
```

### 4️⃣ Open on Your Phone

1. **Open Expo Go app** on your phone
2. **Scan the QR code** shown in terminal
3. **Wait for app to load** (first time takes longer)

---

## Troubleshooting

### ❌ "npm not found"
**Solution:** Install Node.js from https://nodejs.org/

### ❌ "Cannot find module"
**Solution:**
```bash
# Delete and reinstall
rmdir /s /q node_modules
npm install
```

### ❌ "Port 8081 already in use"
**Solution:**
```bash
# Kill existing process
taskkill /F /IM node.exe

# Or use different port
npx expo start --port 8082
```

### ❌ "Changes not showing"
**Solution:**
```bash
# Clear cache and restart
RESTART-APP.bat

# Or manually
npx expo start --clear
```

### ❌ "White/Blank screen"
**Solution:**
1. Check terminal for error messages
2. Shake phone → Reload
3. Try: `npx expo start --clear --reset-cache`

### ❌ "Cannot connect to Metro"
**Solution:**
- Ensure phone and computer on same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Check firewall settings

---

## Build Scripts Reference

| Script | Purpose |
|--------|---------|
| `BUILD-APP.bat` | Complete build and start |
| `CHECK-STATUS.bat` | Verify files and dependencies |
| `RESTART-APP.bat` | Clear cache and restart |
| `VERIFY-FILES.bat` | Check if all files present |

---

## Development Workflow

### Daily Development
```bash
# Start app
npm start

# In terminal, press:
# r - Reload
# shift+r - Reload with cache clear
# m - Toggle menu
```

### After Making Changes
- App auto-reloads (Fast Refresh)
- If not working: Press `r` in terminal
- Or shake phone → Reload

### After Pulling Updates
```bash
# Reinstall dependencies
npm install

# Clear cache and start
npx expo start --clear
```

---

## What You Should See

### ✅ Successful Start
```
Starting Metro Bundler
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

### ✅ In Expo Go App
1. Onboarding screen with 5 slides
2. Animations (or fallback icons)
3. "Get Started" button
4. Home screen with logo
5. Bottom tab navigation

### ✅ Visual Appearance
- Mint green background (#E8F5E9)
- White rounded cards (clay style)
- Soft shadows
- Smooth animations

---

## Build for Production

### Android APK
```bash
# Install EAS CLI (first time)
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
npm run build:apk

# Or full build
npm run build:android
```

### iOS Build
```bash
# Build for iOS
npm run ios

# Or with EAS
eas build --platform ios
```

---

## Project Structure

```
spatial-travel-planner/
├── app/                    # App screens
│   ├── index.tsx          # Entry point
│   ├── onboarding.tsx     # Welcome screen
│   └── (tabs)/            # Tab screens
├── src/
│   ├── components/        # Reusable components
│   ├── constants/         # Theme, colors, data
│   ├── hooks/             # Custom hooks
│   ├── store/             # State management
│   └── types/             # TypeScript types
├── animations/            # Lottie animations
├── BUILD-APP.bat          # Build script
├── CHECK-STATUS.bat       # Status check
└── package.json           # Dependencies
```

---

## Common Commands

```bash
# Start development server
npm start

# Start with clean cache
npm start -- --clear

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios

# Install dependencies
npm install

# Update dependencies
npm update

# Check for issues
npm run lint
```

---

## Performance Tips

1. **Use --clear flag** when starting after changes
2. **Enable Fast Refresh** in Expo Go
3. **Close other Metro bundlers** before starting
4. **Use same WiFi** for phone and computer
5. **Update Expo Go** to latest version

---

## Getting Help

### Check These First:
1. Terminal output for errors
2. Expo Go app for red error screens
3. `CHECK-STATUS.bat` for missing files
4. `TROUBLESHOOTING.md` for detailed solutions

### Still Stuck?
- Check console logs in terminal
- Try nuclear option: Delete node_modules and reinstall
- Verify Node.js version (18+)
- Check network connection

---

## Success Checklist

After running BUILD-APP.bat, verify:

- [ ] Terminal shows "Metro waiting on..."
- [ ] QR code is displayed
- [ ] No red error messages
- [ ] Expo Go can scan QR code
- [ ] App loads on phone
- [ ] Onboarding screen shows
- [ ] Can navigate through slides
- [ ] Home screen loads
- [ ] Tabs work
- [ ] Clay theme visible

---

## Next Steps

Once app is running:
1. ✅ Explore all 5 tabs
2. ✅ Test animations and interactions
3. ✅ Try adding cities to trip
4. ✅ Test booking flow
5. ✅ Customize profile

---

*Last Updated: April 16, 2026*
*Version: 1.0*

**Need immediate help?** Run `CHECK-STATUS.bat` to diagnose issues.
