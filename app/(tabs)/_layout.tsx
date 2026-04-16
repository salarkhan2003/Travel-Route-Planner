import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NC } from '../../src/constants/theme';

const TABS = [
  { name: 'home',      label: 'Home',    icon: '⌂',  iconActive: '⌂'  },
  { name: 'explore',   label: 'Map',     icon: '◎',  iconActive: '◉'  },
  { name: 'itinerary', label: 'Routes',  icon: '≡',  iconActive: '≡'  },
  { name: 'saved',     label: 'Saved',   icon: '♡',  iconActive: '♥'  },
  { name: 'booking',   label: 'Booking', icon: '▢',  iconActive: '▣'  },
] as const;

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const tab = TABS.find(t => t.name === name)!;
  return (
    <View style={[st.item, focused && st.itemActive]}>
      {/* Glowing green inner light for active */}
      {focused && <View style={st.glow} />}
      <Text style={[st.icon, focused && st.iconActive]}>
        {focused ? tab.iconActive : tab.icon}
      </Text>
      <Text style={[st.label, focused && st.labelActive]}>{tab.label}</Text>
    </View>
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

const st = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 16, right: 16,
    height: 72,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0, shadowOpacity: 0,
  },
  // Frosted glass + clay background
  barBg: {
    flex: 1, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    // Clay outer shadow
    shadowColor: 'rgba(27,62,31,0.20)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 20,
  },
  item: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 999, gap: 1, minWidth: 54,
    position: 'relative',
  },
  // Active item pops out with clay pill
  itemActive: {
    backgroundColor: NC.primaryFixed,
    // Soft green inner glow
    shadowColor: NC.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    // Slight upward pop
    transform: [{ translateY: -2 }],
  },
  // Glowing green inner light
  glow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(165,214,167,0.35)',
  },
  icon: { fontSize: 20, color: NC.outline, lineHeight: 24, zIndex: 1 },
  iconActive: { color: NC.primary, fontWeight: '900' },
  label: { fontSize: 9, fontWeight: '700', color: NC.outline, letterSpacing: 0.2, zIndex: 1 },
  labelActive: { color: NC.primary, fontWeight: '900' },
});
