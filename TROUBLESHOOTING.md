# Troubleshooting Guide - Roamio App

## Issue: Changes Not Showing in Expo

### Quick Fix Steps

1. **Stop the current Expo server**
   - Press `Ctrl + C` in the terminal running Expo
   - Or close the terminal window

2. **Run the restart script**
   ```bash
   # On Windows
   RESTART-APP.bat
   
   # Or manually:
   npx expo start --clear
   ```

3. **In the Expo app on your phone**
   - Shake your device to open the developer menu
   - Tap "Reload"
   - Or tap "Disable Fast Refresh" then "Enable Fast Refresh"

4. **If still not working, try:**
   ```bash
   # Delete node_modules and reinstall
   rmdir /s /q node_modules
   npm install
   
   # Then start again
   npx expo start --clear
   ```

---

## Common Issues and Solutions

### 1. Metro Bundler Cache Issue
**Symptom**: Changes not reflecting, old code still running

**Solution**:
```bash
# Clear Metro cache
npx expo start --clear

# Or manually delete cache
rmdir /s /q node_modules\.cache
rmdir /s /q .expo
```

### 2. Fast Refresh Not Working
**Symptom**: Need to manually reload after every change

**Solution**:
- In Expo app: Shake device → "Enable Fast Refresh"
- In terminal: Press `r` to reload
- In terminal: Press `shift + r` to reload and clear cache

### 3. Lottie Animations Not Showing
**Symptom**: Blank spaces where animations should be

**Solution**:
- Animations have fallback icons, so you should see icons if Lottie fails
- Check console for "Lottie not available" message
- Verify animation files exist in `/animations` folder
- Try: `npm install lottie-react-native@7.3.1`

### 4. Logo Not Showing
**Symptom**: No logo on home screen

**Solution**:
- Logo is now a styled component (circular badge with "R")
- No image file needed
- Check if home screen is loading at all
- Look for any red error screens

### 5. White/Blank Screen
**Symptom**: App shows blank white screen

**Solution**:
```bash
# Check for JavaScript errors in terminal
# Look for red error messages

# Try clearing everything
npx expo start --clear --reset-cache

# If that doesn't work, reinstall
rmdir /s /q node_modules
npm install
npx expo start --clear
```

### 6. TypeScript Errors
**Symptom**: Red squiggly lines in editor, but app runs

**Solution**:
- These are just warnings, app should still work
- Run: `npx tsc --noEmit` to check for real errors
- Most warnings can be ignored during development

---

## Verification Checklist

After restarting, verify these work:

- [ ] App loads to onboarding screen (with animations or fallback icons)
- [ ] Can navigate through onboarding slides
- [ ] "Get Started" button works
- [ ] Home screen shows with logo (circular "R" badge)
- [ ] Can navigate between tabs
- [ ] Clay theme is visible (mint green background, rounded cards)
- [ ] Buttons have squish animation when pressed

---

## Metro Bundler Commands

While Expo is running, press these keys in the terminal:

- `r` - Reload app
- `shift + r` - Reload and clear cache
- `m` - Toggle menu
- `d` - Open developer menu
- `j` - Open debugger
- `i` - Run on iOS simulator
- `a` - Run on Android emulator
- `w` - Run on web

---

## Debug Mode

To see detailed logs:

1. In Expo app: Shake device → "Debug Remote JS"
2. Opens Chrome DevTools
3. Check Console tab for errors
4. Check Network tab for failed requests

---

## Nuclear Option (Complete Reset)

If nothing else works:

```bash
# 1. Stop Expo
Ctrl + C

# 2. Delete everything
rmdir /s /q node_modules
rmdir /s /q .expo
del package-lock.json

# 3. Reinstall
npm install

# 4. Start fresh
npx expo start --clear --reset-cache
```

---

## Expected Behavior

### On First Load:
1. Splash screen (mint green background)
2. Onboarding screen with 5 slides
3. Each slide has animation (or fallback icon)
4. "Get Started" button on last slide
5. Navigates to Home tab

### Home Screen Should Show:
- Circular logo badge with "R" (top left)
- Clay-styled search bar
- Hero card with green background
- Weather cards
- Tool buttons
- All with mint green theme

### All Screens Should Have:
- Mint green background (#E8F5E9)
- White rounded cards (40px radius)
- Clay shadows (soft, inflated look)
- Smooth animations

---

## Still Not Working?

1. **Check your Expo Go app version**
   - Update to latest version from App Store/Play Store

2. **Check your Node version**
   ```bash
   node --version
   # Should be 18.x or higher
   ```

3. **Check network connection**
   - Phone and computer must be on same WiFi
   - Try using tunnel mode: `npx expo start --tunnel`

4. **Check for port conflicts**
   - Default port is 8081
   - Try: `npx expo start --port 8082`

5. **Try on different device**
   - Use Android emulator
   - Use iOS simulator
   - Try on web: `npx expo start --web`

---

## Contact Information

If you're still having issues:
- Check the console output for specific error messages
- Look for red error screens in the app
- Share the error message for specific help

---

*Last Updated: April 16, 2026*
