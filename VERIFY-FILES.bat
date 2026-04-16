@echo off
echo ========================================
echo Roamio - File Verification
echo ========================================
echo.

set ERRORS=0

echo Checking core app files...
if not exist "app\index.tsx" (echo [ERROR] app\index.tsx missing & set /a ERRORS+=1) else (echo [OK] app\index.tsx)
if not exist "app\onboarding.tsx" (echo [ERROR] app\onboarding.tsx missing & set /a ERRORS+=1) else (echo [OK] app\onboarding.tsx)
if not exist "app\_layout.tsx" (echo [ERROR] app\_layout.tsx missing & set /a ERRORS+=1) else (echo [OK] app\_layout.tsx)

echo.
echo Checking tab screens...
if not exist "app\(tabs)\home.tsx" (echo [ERROR] home.tsx missing & set /a ERRORS+=1) else (echo [OK] home.tsx)
if not exist "app\(tabs)\explore.tsx" (echo [ERROR] explore.tsx missing & set /a ERRORS+=1) else (echo [OK] explore.tsx)
if not exist "app\(tabs)\itinerary.tsx" (echo [ERROR] itinerary.tsx missing & set /a ERRORS+=1) else (echo [OK] itinerary.tsx)
if not exist "app\(tabs)\booking.tsx" (echo [ERROR] booking.tsx missing & set /a ERRORS+=1) else (echo [OK] booking.tsx)
if not exist "app\(tabs)\saved.tsx" (echo [ERROR] saved.tsx missing & set /a ERRORS+=1) else (echo [OK] saved.tsx)
if not exist "app\(tabs)\profile.tsx" (echo [ERROR] profile.tsx missing & set /a ERRORS+=1) else (echo [OK] profile.tsx)
if not exist "app\(tabs)\_layout.tsx" (echo [ERROR] tab _layout.tsx missing & set /a ERRORS+=1) else (echo [OK] tab _layout.tsx)

echo.
echo Checking clay components...
if not exist "src\components\clay\ClayButton.tsx" (echo [ERROR] ClayButton.tsx missing & set /a ERRORS+=1) else (echo [OK] ClayButton.tsx)
if not exist "src\components\clay\ClayCard.tsx" (echo [ERROR] ClayCard.tsx missing & set /a ERRORS+=1) else (echo [OK] ClayCard.tsx)
if not exist "src\components\clay\ClayToggle.tsx" (echo [ERROR] ClayToggle.tsx missing & set /a ERRORS+=1) else (echo [OK] ClayToggle.tsx)

echo.
echo Checking theme...
if not exist "src\constants\theme.ts" (echo [ERROR] theme.ts missing & set /a ERRORS+=1) else (echo [OK] theme.ts)

echo.
echo Checking animations...
if not exist "animations\Man Planning A Sightseeing Route.json" (echo [WARNING] Animation 1 missing) else (echo [OK] Animation 1)
if not exist "animations\WORLD EXPLORATION.json" (echo [WARNING] Animation 2 missing) else (echo [OK] Animation 2)
if not exist "animations\Train Minimalist Animation.json" (echo [WARNING] Animation 3 missing) else (echo [OK] Animation 3)
if not exist "animations\Adding Guests Interaction.json" (echo [WARNING] Animation 4 missing) else (echo [OK] Animation 4)
if not exist "animations\Hey lets get started.json" (echo [WARNING] Animation 5 missing) else (echo [OK] Animation 5)

echo.
echo Checking package files...
if not exist "package.json" (echo [ERROR] package.json missing & set /a ERRORS+=1) else (echo [OK] package.json)
if not exist "app.json" (echo [ERROR] app.json missing & set /a ERRORS+=1) else (echo [OK] app.json)
if not exist "tsconfig.json" (echo [ERROR] tsconfig.json missing & set /a ERRORS+=1) else (echo [OK] tsconfig.json)

echo.
echo ========================================
if %ERRORS%==0 (
    echo [SUCCESS] All core files present!
    echo.
    echo You can now run: RESTART-APP.bat
) else (
    echo [FAILED] %ERRORS% critical files missing!
    echo Please check the errors above.
)
echo ========================================
echo.

pause
