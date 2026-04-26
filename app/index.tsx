import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Two separate keys:
//   ROAMIO_FIRST_LAUNCH  → set after onboarding completes → routes to home
//   ROAMIO_LOTTIE_SEEN   → set after welcome lottie plays once → skip on repeat opens
const LOTTIE_SEEN_KEY   = 'ROAMIO_LOTTIE_SEEN';
const FIRST_LAUNCH_KEY  = 'ROAMIO_FIRST_LAUNCH';

export default function Index() {
  const router = useRouter();
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [lottieSeen, firstLaunchDone] = await Promise.all([
          AsyncStorage.getItem(LOTTIE_SEEN_KEY),
          AsyncStorage.getItem(FIRST_LAUNCH_KEY),
        ]);

        if (lottieSeen === 'true') {
          // Skip lottie — go straight to onboarding or home
          if (firstLaunchDone === 'true') {
            router.replace('/(tabs)/home');
          } else {
            router.replace('/onboarding');
          }
          return;
        }

        // First time: play 2.5s lottie, then mark seen
        await AsyncStorage.setItem(LOTTIE_SEEN_KEY, 'true');

        const t = setTimeout(() => {
          if (firstLaunchDone === 'true') {
            router.replace('/(tabs)/home');
          } else {
            router.replace('/onboarding');
          }
        }, 2600);

        return () => clearTimeout(t);
      } catch {
        router.replace('/onboarding');
      }
    };

    bootstrap();
  }, []);

  return (
    <View style={st.container}>
      <LottieView
        ref={lottieRef}
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
    height: Math.min(SCREEN_WIDTH * 0.85, 380),
  },
});
