import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LiquidSpinner from '../src/components/LiquidSpinner';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('ROAMIO_FIRST_LAUNCH');
        if (value === 'true') {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/onboarding');
        }
      } catch (e) {
        // Fallback in case of error
        router.replace('/onboarding');
      } finally {
        setIsChecking(false);
      }
    };
    
    // Add a slight delay to ensure smooth transition and allow the splash to dismiss
    const t = setTimeout(() => {
      checkFirstLaunch();
    }, 50);
    
    return () => clearTimeout(t);
  }, []);

  // Show LiquidSpinner while checking
  return <LiquidSpinner />;
}
