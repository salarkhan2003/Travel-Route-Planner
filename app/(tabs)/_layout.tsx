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
    left: 16,
    right: 16,
    height: 70,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    // Clay nav shadow matching reference HTML exactly
    shadowColor: 'rgba(42,49,39,0.14)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 18,
    paddingBottom: 0,
    paddingTop: 0,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 1,
    minWidth: 54,
  },
  itemActive: {
    backgroundColor: '#c5f8c7',
    // Inset clay pressed effect
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 0,
  },
  icon: {
    fontSize: 18,
    color: '#575e52',
    lineHeight: 22,
  },
  iconActive: {
    color: '#39653f',
    fontWeight: '900',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#575e52',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: '#39653f',
    fontWeight: '800',
  },
});
