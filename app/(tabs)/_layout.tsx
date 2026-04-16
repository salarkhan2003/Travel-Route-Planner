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
      {focused && <View style={st.glow} />}
      <Text style={[st.icon, focused && st.iconActive]}>
        {focused ? tab.iconActive : tab.icon}
      </Text>
      <Text style={[st.label, focused && st.labelActive]} numberOfLines={1}>
        {tab.label}
      </Text>
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

const BAR_H = Platform.OS === 'ios' ? 82 : 76;
const BOTTOM = Platform.OS === 'ios' ? 28 : 16;

const st = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: BOTTOM,
    left: 14,
    right: 14,
    height: BAR_H,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },

  // 3D liquid clay bar background
  barBg: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.96)',
    // Top-left white highlight border
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.98)',
    borderBottomColor: 'rgba(165,214,167,0.4)',
    borderRightColor: 'rgba(165,214,167,0.25)',
    // Deep clay outer shadow
    shadowColor: 'rgba(27,62,31,0.22)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 36,
    elevation: 22,
  },

  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 3,
    minWidth: 58,
    height: BAR_H - 12,
    position: 'relative',
  },

  // Active: pops up, green pill, inner glow
  itemActive: {
    backgroundColor: NC.primaryFixed,
    transform: [{ translateY: -3 }],
    shadowColor: NC.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },

  // Soft green inner glow layer
  glow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(165,214,167,0.30)',
  },

  icon: {
    fontSize: 22,
    color: '#7CB87F',
    lineHeight: 26,
    zIndex: 1,
  },
  iconActive: {
    color: NC.primary,
    fontWeight: '900',
  },

  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7CB87F',
    letterSpacing: 0.1,
    zIndex: 1,
    lineHeight: 13,
  },
  labelActive: {
    color: NC.primary,
    fontWeight: '900',
  },
});
