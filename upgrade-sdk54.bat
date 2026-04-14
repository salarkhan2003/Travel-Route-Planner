@echo off
cd /d "D:\PROJECTS\TRIP PLANNER PROJECT]\SOFTWARE\V1-TRIP_PLANNER\spatial-travel-planner"
echo [1/2] Installing SDK 54 packages...
npm install --legacy-peer-deps ^
  expo@54.0.0 ^
  expo-router@4.0.0 ^
  expo-status-bar@2.0.0 ^
  react@18.3.1 ^
  react-native@0.76.9 ^
  react-native-reanimated@3.16.7 ^
  react-native-gesture-handler@2.20.2 ^
  react-native-safe-area-context@4.12.0 ^
  react-native-screens@4.4.0 ^
  @expo/vector-icons@14.0.0 ^
  zustand@4.5.7 ^
  react-native-maps@1.20.1 ^
  @react-native-community/slider@4.5.5
echo [2/2] Done! Starting Expo...
node_modules\.bin\expo.cmd start --lan
pause
