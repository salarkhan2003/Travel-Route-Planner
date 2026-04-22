import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, PermissionsAndroid, Platform } from 'react-native';


import CustomToast from '../src/components/CustomToast';
import { useTripStore } from '../src/store/tripStore';
import { useToastStore } from '../src/store/toastStore';
import { parseTransactionalSMS } from '../src/utils/smsParser';

export default function RootLayout() {
  const addExtraExpense = useTripStore(s => s.addExtraExpense);
  const showToast = useToastStore(s => s.showToast);

  useEffect(() => {
    let subscription: any = null;
    let SmsListener: any = null;
    
    // Dynamically load SMS listener only on Android
    if (Platform.OS === 'android') {
      try {
        SmsListener = require('react-native-android-sms-listener').default || require('react-native-android-sms-listener');
      } catch (e) {
        console.warn('SmsListener not found', e);
      }
    }

    async function requestSmsPermission() {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
            PermissionsAndroid.PERMISSIONS.READ_SMS,
          ]);

          const allGranted = 
            granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED;

          if (allGranted && SmsListener) {
            subscription = SmsListener.addListener((message: any) => {
              try {
                // Ensure message body exists before parsing
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
    }

    requestSmsPermission();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [addExtraExpense, showToast]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="persona" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="settings" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      </Stack>
      <CustomToast />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8F5E9' },
});
