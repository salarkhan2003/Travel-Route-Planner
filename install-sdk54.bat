@echo off
cd /d "D:\PROJECTS\TRIP PLANNER PROJECT]\SOFTWARE\V1-TRIP_PLANNER\spatial-travel-planner"
echo Cleaning old modules...
rmdir /s /q node_modules
del package-lock.json

echo Installing SDK 54 exact versions...
npm install --legacy-peer-deps ^
  expo@54.0.0 ^
  expo-router@4.0.17 ^
  expo-status-bar@2.2.3 ^
  expo-linking@7.1.4 ^
  expo-constants@17.1.5 ^
  expo-font@13.3.1 ^
  expo-asset@11.1.4 ^
  expo-modules-core@2.2.2 ^
  react@19.0.0 ^
  react-native@0.79.2 ^
  react-native-reanimated@3.17.4 ^
  react-native-gesture-handler@2.24.0 ^
  react-native-safe-area-context@5.4.0 ^
  react-native-screens@4.10.0 ^
  react-native-maps@1.20.1 ^
  @expo/vector-icons@14.1.0 ^
  @react-native-community/slider@4.5.5 ^
  zustand@4.5.7

echo Done! Starting Expo Go...
node_modules\.bin\expo.cmd start --lan --clear
pause
