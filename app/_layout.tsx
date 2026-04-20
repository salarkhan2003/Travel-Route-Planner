import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';

import CustomToast from '../src/components/CustomToast';
import { useTripStore } from '../src/store/tripStore';
import { useToastStore } from '../src/store/toastStore';

export default function RootLayout() {
  const addExtraExpense = useTripStore(s => s.addExtraExpense);
  const showToast = useToastStore(s => s.showToast);

  useEffect(() => {
    let subscription: any = null;
    async function requestSmsPermission() {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
            {
              title: 'SMS Permission',
              message: 'Roamio needs SMS access to automatically track your expenses.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            subscription = SmsListener.addListener((message: any) => {
              const text = message.body.toLowerCase();
              if (text.includes('debited') || text.includes('spent') || text.includes('paid')) {
                 const match = text.match(/(?:inr|rs\.?)\s*(\d+(?:\.\d+)?)/i) || text.match(/(?:debited|spent|paid).*?(?:rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i);
                 if (match && match[1]) {
                   const amount = parseFloat(match[1]);
                   if (!isNaN(amount) && amount > 0) {
                     addExtraExpense({
                       amount,
                       text: `Auto-tracked from SMS: ${message.originatingAddress}`
                     });
                     showToast(`Auto-added ₹${amount} from SMS`, 'cash-outline');
                   }
                 }
              }
            });
          }
        } catch (err) {
          console.warn(err);
        }
      }
    }
    requestSmsPermission();
    return () => {
      if (subscription) subscription.remove();
    };
  }, [addExtraExpense, showToast]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      </Stack>
      <CustomToast />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8F5E9' },
});
