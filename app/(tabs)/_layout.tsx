/**
 * TabLayout — Mint Liquid Clay Navigation
 * Fixes: nav bar overlap (useSafeAreaInsets) · instant FAB · frosted glass bar
 */
import React from 'react';
import { Tabs, usePathname } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../../src/store/settingsStore';
import { router } from 'expo-router';

const TABS = [
  { name: 'home',      label: 'Home',    icon: 'home-outline'        as const, iconActive: 'home'         as const },
  { name: 'explore',   label: 'Map',     icon: 'map-outline'         as const, iconActive: 'map'          as const },
  { name: 'itinerary', label: 'Routes',  icon: 'git-network-outline' as const, iconActive: 'git-network'  as const },
  { name: 'expenses',  label: 'Wallet',  icon: 'wallet-outline'      as const, iconActive: 'wallet'       as const },
  { name: 'saved',     label: 'Saved',   icon: 'heart-outline'       as const, iconActive: 'heart'        as const },
  { name: 'booking',   label: 'Book',    icon: 'ticket-outline'      as const, iconActive: 'ticket'       as const },
] as const;

type TabName = typeof TABS[number]['name'];

// ── Tab icon ──────────────────────────────────────────────────────────────────
function TabIcon({ name, focused, dark }: { name: TabName; focused: boolean; dark: boolean }) {
  const tab = TABS.find(t => t.name === name);
  if (!tab) return null;
  const mint   = dark ? '#00F59B' : '#10B981';
  const fg     = focused ? (dark ? '#000' : '#FFF') : (dark ? 'rgba(255,255,255,0.35)' : 'rgba(16,185,129,0.45)');
  return (
    <View style={[
      st.tabItem,
      focused && { backgroundColor: mint, shadowColor: mint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
    ]}>
      <Ionicons name={focused ? tab.iconActive : tab.icon} size={20} color={fg} />
      <Text style={[st.tabLabel, { color: fg, fontWeight: focused ? '800' : '500' }]}>{tab.label}</Text>
    </View>
  );
}

// ── Floating AI Button ─────────────────────────────────────────────────────────
function FloatingAIButton({ dark }: { dark: boolean }) {
  const insets  = useSafeAreaInsets();
  const pathname = usePathname();
  if (pathname.includes('agent')) return null;

  const mint = dark ? '#00F59B' : '#10B981';
  // Position above tab bar + Android nav bar inset
  const bottom = 56 + insets.bottom + 12;

  return (
    <View style={[st.fabWrap, { bottom }]} pointerEvents="box-none">
      {/* Glow ring — static, no animation = no lag */}
      <View style={[st.fabRing, { borderColor: mint + '50' }]} />
      <TouchableOpacity
        style={[st.fab, { backgroundColor: mint }]}
        onPress={() => router.push('/agent' as any)}
        activeOpacity={0.82}
      >
        <Ionicons name="sparkles" size={22} color={dark ? '#000' : '#FFF'} />
      </TouchableOpacity>
      <View style={[st.fabLabel, { backgroundColor: dark ? '#0C1A12' : '#FFF', borderColor: mint + '45' }]}>
        <Text style={[st.fabLabelTxt, { color: mint }]}>AI</Text>
      </View>
    </View>
  );
}

// ── Root layout ────────────────────────────────────────────────────────────────
export default function TabLayout() {
  const darkMode = useSettingsStore(s => s.darkMode);
  const insets   = useSafeAreaInsets();

  const barBg  = darkMode ? 'rgba(6,14,9,0.94)'  : 'rgba(255,255,255,0.94)';
  const border = darkMode ? 'rgba(0,245,155,0.10)' : 'rgba(16,185,129,0.12)';

  // Total tab bar height = icon area + system bottom inset
  const tabBarH = 56 + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            ...st.bar,
            backgroundColor: barBg,
            borderTopColor: border,
            height: tabBarH,
            paddingBottom: insets.bottom,  // ← KEY: prevents Android nav bar overlap
          },
        }}
      >
        {TABS.map(({ name }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon name={name} focused={focused} dark={darkMode} />
              ),
            }}
          />
        ))}
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>

      <FloatingAIButton dark={darkMode} />
    </View>
  );
}

const st = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    elevation: 24,
    // Frosted glass effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    paddingTop: 6,
  },
  tabItem: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 16, gap: 2, minWidth: 50,
  },
  tabLabel: { fontSize: 9, letterSpacing: 0.1, lineHeight: 11 },

  // FAB — static, no heavy animation loops
  fabWrap:  { position: 'absolute', right: 16, alignItems: 'center', zIndex: 9999 },
  fabRing:  { position: 'absolute', width: 62, height: 62, borderRadius: 31, borderWidth: 2, top: -5, left: -5 },
  fab:      {
    width: 52, height: 52, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    elevation: 10, shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45, shadowRadius: 14,
  },
  fabLabel: {
    marginTop: 6, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  fabLabelTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
});
