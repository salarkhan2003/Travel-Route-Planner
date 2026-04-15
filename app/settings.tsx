import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ClayCard } from '../src/components/clay/ClayCard';
import { ClayToggle } from '../src/components/clay/ClayToggle';
import { useSettingsStore } from '../src/store/settingsStore';
import { CURRENCIES } from '../src/constants/currencies';
import { NC } from '../src/constants/theme';

function Row({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) {
  return (
    <View style={st.row}>
      <View style={{ flex: 1 }}>
        <Text style={st.rowLabel}>{label}</Text>
        {sub ? <Text style={st.rowSub}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}

function Chips<T extends string>({ options, value, onSelect }: { options: readonly T[]; value: T; onSelect: (v: T) => void }) {
  return (
    <View style={st.chips}>
      {options.map((o) => (
        <TouchableOpacity key={o} onPress={() => onSelect(o)}
          style={[st.chip, value === o && st.chipOn]}>
          <Text style={[st.chipText, value === o && st.chipTextOn]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const store = useSettingsStore();

  const [draft, setDraft] = useState({
    currency: store.currency,
    travelClass: store.travelClass,
    distanceUnit: store.distanceUnit,
    mapStyle: store.mapStyle,
    darkMode: store.darkMode,
    biometricLock: store.biometricLock,
    cloudSync: store.cloudSync,
    notifications: store.notifications,
  });

  const dirty =
    draft.currency !== store.currency ||
    draft.travelClass !== store.travelClass ||
    draft.distanceUnit !== store.distanceUnit ||
    draft.mapStyle !== store.mapStyle ||
    draft.darkMode !== store.darkMode ||
    draft.biometricLock !== store.biometricLock ||
    draft.cloudSync !== store.cloudSync ||
    draft.notifications !== store.notifications;

  const save = () => {
    store.setCurrency(draft.currency);
    store.setTravelClass(draft.travelClass as any);
    store.setDistanceUnit(draft.distanceUnit as any);
    store.setMapStyle(draft.mapStyle as any);
    if (draft.darkMode !== store.darkMode) store.toggleDark();
    if (draft.biometricLock !== store.biometricLock) store.toggleBiometric();
    if (draft.cloudSync !== store.cloudSync) store.toggleCloudSync();
    if (draft.notifications !== store.notifications) store.toggleNotifications();
    Alert.alert('Saved', 'Preferences applied across the app.');
  };

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <Text style={st.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={st.heading}>Settings</Text>
        {dirty
          ? <TouchableOpacity onPress={save} style={st.saveBtn}><Text style={st.saveBtnText}>Save</Text></TouchableOpacity>
          : <View style={{ width: 64 }} />
        }
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        <Text style={st.section}>Display</Text>
        <ClayCard style={st.card}>
          <Row label="Dark Mode" sub="Switch to dark theme"
            right={<ClayToggle value={draft.darkMode} onToggle={() => setDraft(d => ({ ...d, darkMode: !d.darkMode }))} activeColor={NC.primary} />} />
          <View style={st.div} />
          <Text style={st.rowLabel}>Map Style</Text>
          <Chips options={['standard', 'satellite', 'blueprint'] as const} value={draft.mapStyle} onSelect={(v) => setDraft(d => ({ ...d, mapStyle: v }))} />
        </ClayCard>

        <Text style={st.section}>Travel Preferences</Text>
        <ClayCard style={st.card}>
          <Text style={st.rowLabel}>Travel Class</Text>
          <Chips options={['Sleeper', '3AC', '2AC', '1AC', 'Economy', 'Business'] as const} value={draft.travelClass} onSelect={(v) => setDraft(d => ({ ...d, travelClass: v }))} />
          <View style={st.div} />
          <Text style={st.rowLabel}>Currency</Text>
          <Text style={st.rowSub}>Applies to all price displays across the app</Text>
          <Chips options={['INR', 'SGD', 'USD', 'EUR', 'GBP'] as const} value={draft.currency} onSelect={(v) => setDraft(d => ({ ...d, currency: v }))} />
          <View style={st.div} />
          <Text style={st.rowLabel}>Distance</Text>
          <Chips options={['km', 'miles'] as const} value={draft.distanceUnit} onSelect={(v) => setDraft(d => ({ ...d, distanceUnit: v }))} />
        </ClayCard>

        {dirty && (
          <TouchableOpacity onPress={save} style={st.saveLarge} activeOpacity={0.85}>
            <Text style={st.saveLargeText}>Save Preferences</Text>
          </TouchableOpacity>
        )}

        <Text style={st.section}>Privacy & Security</Text>
        <ClayCard style={st.card}>
          <Row label="Biometric Lock" sub="FaceID / Fingerprint for Wallet"
            right={<ClayToggle value={draft.biometricLock} onToggle={() => setDraft(d => ({ ...d, biometricLock: !d.biometricLock }))} activeColor={NC.primary} />} />
          <View style={st.div} />
          <Row label="Cloud Sync" sub="Backup trip data"
            right={<ClayToggle value={draft.cloudSync} onToggle={() => setDraft(d => ({ ...d, cloudSync: !d.cloudSync }))} activeColor={NC.primary} />} />
          <View style={st.div} />
          <Row label="Notifications" sub="Trip alerts & reminders"
            right={<ClayToggle value={draft.notifications} onToggle={() => setDraft(d => ({ ...d, notifications: !d.notifications }))} activeColor={NC.primary} />} />
        </ClayCard>

        <Text style={st.section}>Live Rates (INR base)</Text>
        <ClayCard style={st.card}>
          {CURRENCIES.filter(c => c.code !== 'INR').map(c => (
            <View key={c.code} style={st.rateRow}>
              <Text style={st.rateFrom}>{c.flag} {c.code}</Text>
              <Text style={st.rateEq}>₹1,000 =</Text>
              <Text style={st.rateTo}>{c.symbol}{(1000 * c.rateFromINR).toFixed(2)}</Text>
            </View>
          ))}
          <Text style={st.rateNote}>Approximate rates · Apr 2026</Text>
        </ClayCard>

        <Text style={st.section}>About</Text>
        <ClayCard style={st.card}>
          <Text style={st.aboutTitle}>Spatial Travel Planner v1.0</Text>
          <Text style={st.aboutSub}>Built for Travellers · India to Singapore</Text>
        </ClayCard>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: NC.surfaceLowest, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4 },
  backText: { color: NC.primary, fontSize: 13, fontWeight: '700' },
  heading: { color: NC.onSurface, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: NC.primary, shadowColor: NC.shadowButton, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  saveLarge: { backgroundColor: NC.primary, borderRadius: 999, paddingVertical: 18, alignItems: 'center', marginBottom: 8, shadowColor: NC.shadowButton, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 20, elevation: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  saveLargeText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  section: { color: NC.onSurfaceVariant, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 20 },
  card: { marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { color: NC.onSurface, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  rowSub: { color: NC.onSurfaceVariant, fontSize: 11, marginBottom: 4 },
  div: { height: 1, backgroundColor: NC.surfaceLow, marginVertical: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: NC.surfaceLow, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  chipOn: { backgroundColor: NC.primary, borderColor: 'rgba(255,255,255,0.4)', shadowColor: NC.shadowButton, shadowRadius: 10, elevation: 5 },
  chipText: { color: NC.onSurfaceVariant, fontSize: 12, fontWeight: '600' },
  chipTextOn: { color: '#fff', fontWeight: '800' },
  rateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  rateFrom: { color: NC.onSurface, fontSize: 13, fontWeight: '600', flex: 1 },
  rateEq: { color: NC.outlineVariant, fontSize: 12 },
  rateTo: { fontSize: 13, fontWeight: '800', color: NC.primary, flex: 1, textAlign: 'right' },
  rateNote: { color: NC.outlineVariant, fontSize: 10, marginTop: 8 },
  aboutTitle: { color: NC.onSurface, fontSize: 15, fontWeight: '800' },
  aboutSub: { color: NC.onSurfaceVariant, fontSize: 12, marginTop: 4 },
});
