/**
 * TabLayout — Clay Bottom Navigation Bar
 * 
 * ✦ Frosted glass + inflated clay pill bar
 * ✦ Active tab: inflated clay bubble with elastic spring
 * ✦ Inner glow on active items
 */
import { Tabs } from 'expo-router';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useRef } from 'react';

const TABS = [
  { name: 'home',      label: 'Home',    icon: 'H',   iconActive: 'H'  },
  { name: 'explore',   label: 'Map',     icon: 'M',   iconActive: 'M'  },
  { name: 'itinerary', label: 'Routes',  icon: 'R',   iconActive: 'R'  },
  { name: 'saved',     label: 'Saved',   icon: 'S',   iconActive: 'S'  },
  { name: 'booking',   label: 'Booking', icon: 'B',   iconActive: 'B'  },
] as const;

// Clay tab icon — inflates on active with squish spring
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const tab = TABS.find(t => t.name === name)!;
  const scale = useRef(new Animated.Value(focused ? 1.12 : 1)).current;

  // Inflate when focused with elastic bounce
  if (focused) {
    Animated.spring(scale, { toValue: 1.12, useNativeDriver: true, damping: 12, stiffness: 120 }).start();
  } else {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 150 }).start();
  }

  return (
    <Animated.View style={[st.item, focused && st.itemActive, { transform: [{ scale }] }]}>
      {/* Inner sheen glow on active */}
      {focused && <View style={st.glow} />}
      {focused && <View style={st.sheenTop} />}
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
        tabBarBackground: () => <View style={st.barBg}>
          {/* Top sheen on bar for 3D clay look */}
          <View style={st.barSheen} />
        </View>,
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

const BAR_H = Platform.OS === 'ios' ? 88 : 80;
const BOTTOM = Platform.OS === 'ios' ? 28 : 16;

const st = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: BOTTOM, left: 16, right: 16,
    height: BAR_H,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0, shadowOpacity: 0,
  },

  // Inflated clay pill bar — frosted glass + double shadow
  barBg: {
    flex: 1, borderRadius: 999,
    backgroundColor: 'rgba(241,248,233,0.96)',
    position: 'relative',
    overflow: 'hidden',
    // Double border: bright top-left, soft bottom-right
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.98)',
    borderBottomColor: 'rgba(165,214,167,0.45)',
    borderRightColor: 'rgba(165,214,167,0.3)',
    // Clay outer shadow
    shadowColor: 'rgba(165,214,167,0.5)',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 20,
  },

  // Top sheen for 3D inflated bar
  barSheen: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },

  item: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, gap: 3,
    minWidth: 60, height: BAR_H - 14,
    position: 'relative',
    overflow: 'hidden',
  },

  // Active: inflated clay pill with inner glow
  itemActive: {
    backgroundColor: '#A5D6A7',
    // Double border on active
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderBottomColor: 'rgba(46,125,50,0.2)',
    borderRightColor: 'rgba(46,125,50,0.15)',
    // Clay shadow on active icon
    shadowColor: 'rgba(46,125,50,0.4)',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 8,
  },

  // Soft inner glow layer
  glow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Top sheen on active tab
  sheenTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '45%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  icon: { fontSize: 24, color: '#7CB87F', lineHeight: 28, zIndex: 1 },
  iconActive: { color: '#1B5E20', fontWeight: '900' },
  label: { fontSize: 10, fontWeight: '700', color: '#7CB87F', letterSpacing: 0.2, zIndex: 1, lineHeight: 13 },
  labelActive: { color: '#1B5E20', fontWeight: '900' },
});
