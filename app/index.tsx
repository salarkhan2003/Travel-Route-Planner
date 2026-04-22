import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LiquidSpinner from '../src/components/LiquidSpinner';
import LottieView from 'lottie-react-native';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    
    // Add delay for animation to play
    const t = setTimeout(() => {
      checkFirstLaunch();
    }, 2500); // 2.5s for welcome animation
    
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={st.container}>
      <LottieView 
        source={require('../animations/Welcome.json')} 
        autoPlay 
        loop={false}
        style={st.lottie}
      />
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  lottie: { 
    width: Math.min(SCREEN_WIDTH * 0.85, 380), 
    height: Math.min(SCREEN_WIDTH * 0.85, 380) 
  }
});
