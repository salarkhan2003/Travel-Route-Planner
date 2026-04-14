@echo off
cd /d "D:\PROJECTS\TRIP PLANNER PROJECT]\SOFTWARE\V1-TRIP_PLANNER\spatial-travel-planner"
echo Upgrading to SDK 54...
npm install --legacy-peer-deps expo@54.0.0 expo-router@4.0.0 expo-status-bar@2.0.0 react@18.3.1 react-native@0.76.9 react-native-reanimated@3.16.7 react-native-gesture-handler@2.20.2 react-native-safe-area-context@4.12.0 react-native-screens@4.4.0
echo Done!
pause
