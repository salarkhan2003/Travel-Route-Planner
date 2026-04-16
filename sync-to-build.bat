@echo off
setlocal
set SRC=D:\PROJECTS\TRIP PLANNER PROJECT]\SOFTWARE\V1-TRIP_PLANNER\spatial-travel-planner
set DST=C:\builds\stp

echo === Roamio Sync to Build ===

robocopy "%SRC%\app"        "%DST%\app"        /E /IS /NFL /NDL /NJH /NJS /NC /NS
robocopy "%SRC%\src"        "%DST%\src"        /E /IS /NFL /NDL /NJH /NJS /NC /NS
robocopy "%SRC%\animations" "%DST%\animations" /E /IS /NFL /NDL /NJH /NJS /NC /NS
robocopy "%SRC%\logo"       "%DST%\logo"       /E /IS /NFL /NDL /NJH /NJS /NC /NS

copy /Y "%SRC%\package.json"       "%DST%\package.json"       >nul
copy /Y "%SRC%\package-lock.json"  "%DST%\package-lock.json"  >nul
copy /Y "%SRC%\app.json"           "%DST%\app.json"           >nul
copy /Y "%SRC%\.npmrc"             "%DST%\.npmrc"             >nul
copy /Y "%SRC%\metro.config.js"    "%DST%\metro.config.js"    >nul
copy /Y "%SRC%\babel.config.js"    "%DST%\babel.config.js"    >nul
copy /Y "%SRC%\tsconfig.json"      "%DST%\tsconfig.json"      >nul

echo === Sync complete! Press r in Expo to reload ===
endlocal
