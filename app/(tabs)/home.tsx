import React, { useRef, useState } from 'react';
import {
  Alert, Animated, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ClayCard } from '../../src/components/clay/ClayCard';
import { ClayButton } from '../../src/components/clay/ClayButton';
import { useTripStore } from '../../src/store/tripStore';
import { useFamilyStore } from '../../src/store/familyStore';
import { CURRENCIES } from '../../src/constants/currencies';
import { useCurrency } from '../../src/hooks/useCurrency';
import { NC } from '../../src/constants/theme';

const WEATHER = [
  { city: 'Ajmer', temp: '34°C', cond: 'Sunny', icon: '☀' },
  { city: 'Delhi', temp: '38°C', cond: 'Cloudy', icon: '⛅' },
  { city: 'Singapore', temp: '29°C', cond: 'Showers', icon: '🌧' },
  { city: 'Goa', temp: '31°C', cond: 'Breezy', icon: '🌊' },
];
const WEEKEND = [
  { from: 'Guntur', to: 'Vizag', days: 2, cost: '₹3,200', tag: 'Beach' },
  { from: 'Delhi', to: 'Agra', days: 1, cost: '₹1,800', tag: 'Heritage' },
  { from: 'Ajmer', to: 'Pushkar', days: 1, cost: '₹800', tag: 'Spiritual' },
];
const DEALS = [
  { route: 'Guntur → Delhi', price: '₹890', drop: '23%' },
  { route: 'Delhi → Singapore', price: '₹18,500', drop: '15%' },
];
const TOOLS = [
  { key: 'Currency', label: 'FX', icon: '₹' },
  { key: 'SOS', label: 'SOS', icon: '!' },
  { key: 'Vault', label: 'Vault', icon: '⊞' },
  { key: 'Weather', label: 'Weather', icon: '☁' },
  { key: 'Offline', label: 'Offline', icon: '◎' },
  { key: 'Translate', label: 'Translate', icon: 'T' },
];
const POLLS = [
  { q: 'Dinner tonight?', opts: ['Taj Cafe', 'Local Dhaba'], votes: [3, 5] },
  { q: 'Next stop?', opts: ['Pushkar', 'Jaipur'], votes: [4, 4] },
];

// ── Liquid progress bar ───────────────────────────────────────────────────────
function LiquidBar({ pct, color = NC.primaryLight }: { pct: number; color?: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false, damping: 14, stiffness: 60 }).start();
  }, [pct]);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={lb.track}>
      <Animated.View style={[lb.fill, { width, backgroundColor: color }]}>
        <View style={lb.sheen} />
      </Animated.View>
    </View>
  );
}
const lb = StyleSheet.create({
  track: { height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  sheen: { position: 'absolute', top: 2, left: 8, right: 8, height: 3, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2 },
});

// ── 3D Clay Tool Button ───────────────────────────────────────────────────────
function ToolBtn({ tool, onPress }: { tool: typeof TOOLS[0]; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      onPressIn={() => Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, damping: 12, stiffness: 400 }).start()}
      onPressOut={() => { Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 300 }).start(); onPress(); }}
      activeOpacity={1}
      style={tb.wrap}
    >
      <Animated.View style={[tb.box, { transform: [{ scale }] }]}>
        <Text style={tb.icon}>{tool.icon}</Text>
      </Animated.View>
      <Text style={tb.label}>{tool.label}</Text>
    </TouchableOpacity>
  );
}
const tb = StyleSheet.create({
  wrap: { alignItems: 'center', marginRight: 16 },
  box: {
    width: 60, height: 60, borderRadius: 22,
    backgroundColor: NC.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 18, elevation: 8, marginBottom: 6,
  },
  icon: { fontSize: 22, fontWeight: '900', color: NC.primary },
  label: { color: NC.onSurfaceVariant, fontSize: 10, fontWeight: '700' },
});
