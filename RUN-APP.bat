@echo off
title Roamio - Travel Planner App
color 0A

:MENU
cls
echo.
echo  ========================================
echo   ROAMIO - TRAVEL PLANNER APP
echo  ========================================
echo.
echo   1. Quick Start (Recommended)
echo   2. Check Status
echo   3. Clean Build (Clear Cache)
echo   4. Install Dependencies
echo   5. Verify Files
echo   6. Exit
echo.
echo  ========================================
echo.
set /p choice="  Select option (1-6): "

if "%choice%"=="1" goto QUICKSTART
if "%choice%"=="2" goto CHECKSTATUS
if "%choice%"=="3" goto CLEANBUILD
if "%choice%"=="4" goto INSTALL
if "%choice%"=="5" goto VERIFY
if "%choice%"=="6" goto EXIT
goto MENU

:QUICKSTART
cls
echo.
echo  ========================================
echo   QUICK START
echo  ========================================
echo.
echo  Starting app with cache clear...
echo.
call npx expo start --clear
pause
goto MENU

:CHECKSTATUS
cls
echo.
echo  ========================================
echo   STATUS CHECK
echo  ========================================
echo.
call CHECK-STATUS.bat
goto MENU

:CLEANBUILD
cls
echo.
echo  ========================================
echo   CLEAN BUILD
echo  ========================================
echo.
echo  [1/3] Stopping existing processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo  [2/3] Clearing cache...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
if exist ".expo" rmdir /s /q ".expo"

echo  [3/3] Starting app...
echo.
call npx expo start --clear
pause
goto MENU

:INSTALL
cls
echo.
echo  ========================================
echo   INSTALL DEPENDENCIES
echo  ========================================
echo.
echo  This will install all required packages...
echo  This may take 2-5 minutes.
echo.
pause
call npm install
echo.
echo  Installation complete!
echo.
pause
goto MENU

:VERIFY
cls
echo.
echo  ========================================
echo   VERIFY FILES
echo  ========================================
echo.
call VERIFY-FILES.bat
goto MENU

:EXIT
cls
echo.
echo  Thank you for using Roamio!
echo.
timeout /t 2 /nobreak >nul
exit

