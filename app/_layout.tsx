import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, PermissionsAndroid, Platform, AppState } from 'react-native';


import CustomToast from '../src/components/CustomToast';
import { useTripStore } from '../src/store/tripStore';
import { useToastStore } from '../src/store/toastStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { getTheme } from '../src/constants/theme';
import { parseTransactionalSMS } from '../src/utils/smsParser';

export default function RootLayout() {
  const addExtraExpense = useTripStore(s => s.addExtraExpense);
  const showToast = useToastStore(s => s.showToast);
  const darkMode = useSettingsStore(s => s.darkMode);
  const theme = getTheme(darkMode);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    let SmsListener: any = null;
    
    // Dynamically load SMS listener only on Android
    if (Platform.OS === 'android') {
      try {
        SmsListener = require('react-native-android-sms-listener').default || require('react-native-android-sms-listener');
      } catch (e) {
        console.warn('SmsListener not found', e);
      }
    }

    async function setupSmsListener() {
      if (Platform.OS !== 'android' || !SmsListener) return;

      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          PermissionsAndroid.PERMISSIONS.READ_SMS,
        ]);

        const allGranted = 
          granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED;

        if (allGranted) {
          if (subscriptionRef.current) subscriptionRef.current.remove();
          
          subscriptionRef.current = SmsListener.addListener((message: any) => {
            try {
              const body = message.body || message.messageBody;
              if (!body) return;

              const parsed = parseTransactionalSMS(body);
              if (parsed) {
                addExtraExpense({
                  ...parsed,
                  text: parsed.merchant || 'Unknown Transaction'
                });
                const icon = parsed.type === 'credit' ? 'arrow-down-circle' : 'cash-outline';
                const verb = parsed.type === 'credit' ? 'Received' : 'Spent';
                showToast(`${verb} ₹${parsed.amount} - ${parsed.merchant}`, icon);
              }
            } catch (e) {
              console.error('Roamio SMS track error', e);
            }
          });
        }
      } catch (err) {
        console.warn('Permission error:', err);
      }
    }

    setupSmsListener();

    const appStateSub = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        setupSmsListener();
      }
    });

    return () => {
      if (subscriptionRef.current) subscriptionRef.current.remove();
      appStateSub.remove();
    };
  }, [addExtraExpense, showToast]);

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: theme.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="agent"        options={{ presentation: 'card',   animation: 'slide_from_right'  }} />
        <Stack.Screen name="persona"       options={{ presentation: 'modal',   animation: 'slide_from_bottom' }} />
        <Stack.Screen name="settings"      options={{ presentation: 'card',   animation: 'slide_from_right'  }} />
        <Stack.Screen name="subscription"  options={{ presentation: 'card',   animation: 'slide_from_right'  }} />
      </Stack>
      <CustomToast />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
