import { Tabs } from 'expo-router';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRef } from 'react';

const TABS = [
  { name: 'home',      label: 'Home',    icon: '⌂',  iconActive: '⌂'  },
  { name: 'explore',   label: 'Map',     icon: '◎',  iconActive: '◉'  },
  { name: 'itinerary', label: 'Routes',  icon: '≡',  iconActive: '≡'  },
  { name: 'saved',     label: 'Saved',   icon: '♡',  iconActive: '♥'  },
  { name: 'booking',   label: 'Booking', icon: '▢',  iconActive: '▣'  },
] as const;

// Clay tab icon — inflates on active with squish spring
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const tab = TABS.find(t => t.name === name)!;
  const scale = useRef(new Animated.Value(focused ? 1.08 : 1)).current;

  // Inflate when focused
  if (focused) {
    Animated.spring(scale, { toValue: 1.08, useNativeDriver: true, damping: 15, stiffness: 150 }).start();
  } else {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 150 }).start();
  }

  return (
    <Animated.View style={[st.item, focused && st.itemActive, { transform: [{ scale }] }]}>
      {focused && <View style={st.glow} />}
      <Text style={[st.icon, focused && st.iconActive]}>
        {focused ? tab.iconActive : tab.icon}
      </Text>
      <Text style={[st.label, focused && st.labelActive]} numberOfLines={1}>
        {tab.label}
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: st.bar,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => <View style={st.barBg} />,
      }}
    >
      {TABS.map(({ name }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ tabBarIcon: ({ focused }) => <TabIcon name={name} focused={focused} /> }}
        />
      ))}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const BAR_H = Platform.OS === 'ios' ? 84 : 78;
const BOTTOM = Platform.OS === 'ios' ? 28 : 16;

const st = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: BOTTOM, left: 14, right: 14,
    height: BAR_H,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0, shadowOpacity: 0,
  },

  // Glassmorphic + clay bar background
  barBg: {
    flex: 1, borderRadius: 999,
    // Frosted glass base
    backgroundColor: 'rgba(241,248,233,0.94)',
    // Clay inflation border
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.98)',
    borderBottomColor: 'rgba(165,214,167,0.5)',
    borderRightColor: 'rgba(165,214,167,0.3)',
    // Outer clay shadow: 12px 12px 24px rgba(165,214,167,0.3)
    shadowColor: 'rgba(165,214,167,0.45)',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 20,
  },

  item: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 8, paddingVertical: 6,
    borderRadius: 999, gap: 3,
    minWidth: 58, height: BAR_H - 12,
    position: 'relative',
  },

  // Active: inflated clay pill with inner glow
  itemActive: {
    backgroundColor: '#A5D6A7',
    // Clay outer shadow on active icon
    shadowColor: 'rgba(165,214,167,0.6)',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },

  // Soft inner glow layer
  glow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  icon: { fontSize: 22, color: '#7CB87F', lineHeight: 26, zIndex: 1 },
  iconActive: { color: '#1B5E20', fontWeight: '900' },
  label: { fontSize: 10, fontWeight: '700', color: '#7CB87F', letterSpacing: 0.1, zIndex: 1, lineHeight: 13 },
  labelActive: { color: '#1B5E20', fontWeight: '900' },
});
