@echo off
echo ========================================
echo Roamio - Build and Start App
echo ========================================
echo.

echo [Step 1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo [OK] Node.js found

echo.
echo [Step 2/5] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)
echo [OK] npm found

echo.
echo [Step 3/5] Checking node_modules...
if not exist "node_modules" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [OK] node_modules exists
)

echo.
echo [Step 4/5] Clearing cache...
if exist "node_modules\.cache" (
    echo Removing Metro cache...
    rmdir /s /q "node_modules\.cache" 2>nul
)
if exist ".expo" (
    echo Removing Expo cache...
    rmdir /s /q ".expo" 2>nul
)
echo [OK] Cache cleared

echo.
echo [Step 5/5] Starting Expo...
echo.
echo ========================================
echo App is starting...
echo.
echo Scan the QR code with Expo Go app
echo Or press 'w' to open in web browser
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

call npx expo start --clear

pause
