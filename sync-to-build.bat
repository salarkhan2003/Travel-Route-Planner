@echo off
echo Syncing to C:\builds\stp...
robocopy "D:\PROJECTS\TRIP PLANNER PROJECT]\SOFTWARE\V1-TRIP_PLANNER\spatial-travel-planner\app" "C:\builds\stp\app" /E /IS /NFL /NDL /NJH /NJS
robocopy "D:\PROJECTS\TRIP PLANNER PROJECT]\SOFTWARE\V1-TRIP_PLANNER\spatial-travel-planner\src" "C:\builds\stp\src" /E /IS /NFL /NDL /NJH /NJS
robocopy "D:\PROJECTS\TRIP PLANNER PROJECT]\SOFTWARE\V1-TRIP_PLANNER\spatial-travel-planner\animations" "C:\builds\stp\animations" /E /IS /NFL /NDL /NJH /NJS
copy /Y "D:\PROJECTS\TRIP PLANNER PROJECT]\SOFTWARE\V1-TRIP_PLANNER\spatial-travel-planner\package.json" "C:\builds\stp\package.json" >nul
copy /Y "D:\PROJECTS\TRIP PLANNER PROJECT]\SOFTWARE\V1-TRIP_PLANNER\spatial-travel-planner\package-lock.json" "C:\builds\stp\package-lock.json" >nul
copy /Y "D:\PROJECTS\TRIP PLANNER PROJECT]\SOFTWARE\V1-TRIP_PLANNER\spatial-travel-planner\.npmrc" "C:\builds\stp\.npmrc" >nul
echo Done! All files synced.
echo.
echo To start Expo, open a new terminal and run:
echo   C:
echo   cd C:\builds\stp
echo   npx expo start --clear
