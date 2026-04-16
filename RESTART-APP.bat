@echo off
echo ========================================
echo Roamio - Clear Cache and Restart
echo ========================================
echo.

echo [1/4] Stopping any running Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Clearing Metro bundler cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo

echo [3/4] Clearing npm cache...
call npm cache clean --force

echo [4/4] Starting Expo with cleared cache...
echo.
echo ========================================
echo Starting app... Press Ctrl+C to stop
echo ========================================
echo.

call npx expo start --clear

pause
