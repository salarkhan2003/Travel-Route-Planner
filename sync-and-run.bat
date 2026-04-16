@echo off
echo ============================================
echo  Nomad Canvas - Sync to build folder + Run
echo ============================================

robocopy "%~dp0app" "C:\builds\stp\app" /E /IS /NFL /NDL /NJH /NJS
robocopy "%~dp0src" "C:\builds\stp\src" /E /IS /NFL /NDL /NJH /NJS
robocopy "%~dp0animations" "C:\builds\stp\animations" /E /IS /NFL /NDL /NJH /NJS
copy /Y "%~dp0package.json" "C:\builds\stp\package.json" >nul
copy /Y "%~dp0package-lock.json" "C:\builds\stp\package-lock.json" >nul
copy /Y "%~dp0metro.config.js" "C:\builds\stp\metro.config.js" >nul
copy /Y "%~dp0babel.config.js" "C:\builds\stp\babel.config.js" >nul
copy /Y "%~dp0tsconfig.json" "C:\builds\stp\tsconfig.json" >nul
copy /Y "%~dp0app.json" "C:\builds\stp\app.json" >nul
copy /Y "%~dp0.npmrc" "C:\builds\stp\.npmrc" >nul

echo Synced! Starting Expo from C:\builds\stp...
cd /d C:\builds\stp
npx expo start --clear
