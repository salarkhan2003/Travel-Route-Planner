import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';

const ICONS: Record<string, { active: string; inactive: string }> = {
  home:      { active: '⌂',  inactive: '⌂' },
  explore:   { active: '◉',  inactive: '◎' },
  itinerary: { active: '⊞',  inactive: '⊟' },
  saved:     { active: '♥',  inactive: '♡' },
  booking:   { active: '▣',  inactive: '▢' },
};

const LABELS: Record<string, string> = {
  home: 'Home', explore: 'Map', itinerary: 'Routes',
  saved: 'Saved', booking: 'Booking',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icon = ICONS[name];
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={[styles.icon, focused && styles.iconActive]}>
        {focused ? icon.active : icon.inactive}
      </Text>
      <Text style={[styles.label, focused && styles.labelActive]}>
        {LABELS[name]}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {(['home', 'explore', 'itinerary', 'saved', 'booking'] as const).map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name={name} focused={focused} />,
          }}
        />
      ))}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F8F2',
    borderTopWidth: 0,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.4)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 18,
    paddingBottom: 0,
    paddingTop: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 52,
    borderRadius: 26,
    gap: 2,
  },
  tabItemActive: {
    backgroundColor: '#C8E6C9',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.3)',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  icon: { fontSize: 20, color: '#81C784', lineHeight: 24 },
  iconActive: { color: '#2E7D32' },
  label: { fontSize: 9, color: '#81C784', fontWeight: '700', lineHeight: 11 },
  labelActive: { color: '#1B5E20' },
});
