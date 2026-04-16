@echo off
echo ========================================
echo Roamio - Status Check
echo ========================================
echo.

echo Checking environment...
echo.

echo Node.js version:
node --version 2>nul || echo [ERROR] Node.js not installed

echo.
echo npm version:
npm --version 2>nul || echo [ERROR] npm not installed

echo.
echo Expo CLI:
npx expo --version 2>nul || echo [WARNING] Expo not found (will install on first run)

echo.
echo ========================================
echo Checking project files...
echo ========================================
echo.

if exist "package.json" (echo [OK] package.json) else (echo [ERROR] package.json missing)
if exist "app.json" (echo [OK] app.json) else (echo [ERROR] app.json missing)
if exist "tsconfig.json" (echo [OK] tsconfig.json) else (echo [ERROR] tsconfig.json missing)
if exist "app\index.tsx" (echo [OK] app\index.tsx) else (echo [ERROR] app\index.tsx missing)
if exist "app\onboarding.tsx" (echo [OK] app\onboarding.tsx) else (echo [ERROR] app\onboarding.tsx missing)
if exist "app\_layout.tsx" (echo [OK] app\_layout.tsx) else (echo [ERROR] app\_layout.tsx missing)

echo.
if exist "app\(tabs)\home.tsx" (echo [OK] app\(tabs)\home.tsx) else (echo [ERROR] home.tsx missing)
if exist "app\(tabs)\explore.tsx" (echo [OK] app\(tabs)\explore.tsx) else (echo [ERROR] explore.tsx missing)
if exist "app\(tabs)\itinerary.tsx" (echo [OK] app\(tabs)\itinerary.tsx) else (echo [ERROR] itinerary.tsx missing)
if exist "app\(tabs)\booking.tsx" (echo [OK] app\(tabs)\booking.tsx) else (echo [ERROR] booking.tsx missing)
if exist "app\(tabs)\saved.tsx" (echo [OK] app\(tabs)\saved.tsx) else (echo [ERROR] saved.tsx missing)
if exist "app\(tabs)\profile.tsx" (echo [OK] app\(tabs)\profile.tsx) else (echo [ERROR] profile.tsx missing)

echo.
if exist "src\constants\theme.ts" (echo [OK] src\constants\theme.ts) else (echo [ERROR] theme.ts missing)
if exist "src\components\clay\ClayButton.tsx" (echo [OK] ClayButton.tsx) else (echo [ERROR] ClayButton.tsx missing)
if exist "src\components\clay\ClayCard.tsx" (echo [OK] ClayCard.tsx) else (echo [ERROR] ClayCard.tsx missing)

echo.
echo ========================================
echo Checking dependencies...
echo ========================================
echo.

if exist "node_modules" (
    echo [OK] node_modules folder exists
    if exist "node_modules\expo" (echo [OK] expo installed) else (echo [WARNING] expo not in node_modules)
    if exist "node_modules\react" (echo [OK] react installed) else (echo [WARNING] react not in node_modules)
    if exist "node_modules\react-native" (echo [OK] react-native installed) else (echo [WARNING] react-native not in node_modules)
) else (
    echo [WARNING] node_modules not found
    echo Run: npm install
)

echo.
echo ========================================
echo Summary
echo ========================================
echo.
echo If all checks passed, run: BUILD-APP.bat
echo If errors found, check the messages above
echo.

pause
