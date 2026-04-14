import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace('/onboarding'), 50);
    return () => clearTimeout(t);
  }, []);
  return <View style={styles.bg} />;
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#E8F5E9' },
});
