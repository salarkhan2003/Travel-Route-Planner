import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';

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
      {focused && <View style={st.activePill} />}
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

const BAR_H = 72;

const st = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 20,
    right: 20,
    height: BAR_H,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },

  // The actual visible bar — rendered via tabBarBackground
  barBg: {
    flex: 1,
    borderRadius: 999,
    // Base white surface
    backgroundColor: '#ffffff',
    // 3D clay outer shadow — large soft drop
    shadowColor: 'rgba(42,49,39,0.18)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 36,
    elevation: 22,
    // Top-left white highlight border (simulates inset light)
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    // Bottom-right green depth border
    borderBottomColor: 'rgba(57,101,63,0.12)',
    borderRightColor: 'rgba(57,101,63,0.08)',
  },

  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 2,
    minWidth: 52,
    position: 'relative',
  },

  itemActive: {},

  // The green pill behind the active icon
  activePill: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    bottom: 4,
    borderRadius: 999,
    backgroundColor: '#c5f8c7',
    // Inset clay pressed effect
    shadowColor: 'rgba(57,101,63,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },

  icon: {
    fontSize: 20,
    color: '#a8afa2',
    lineHeight: 24,
    zIndex: 1,
  },
  iconActive: {
    color: '#39653f',
    fontWeight: '900',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#a8afa2',
    letterSpacing: 0.2,
    zIndex: 1,
  },
  labelActive: {
    color: '#39653f',
    fontWeight: '800',
  },
});
