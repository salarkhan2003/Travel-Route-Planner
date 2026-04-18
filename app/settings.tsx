import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ClayCard } from '../src/components/clay/ClayCard';
import { ClayToggle } from '../src/components/clay/ClayToggle';
import { useSettingsStore } from '../src/store/settingsStore';
import { CURRENCIES } from '../src/constants/currencies';
import { NC } from '../src/constants/theme';
import { useToastStore } from '../src/store/toastStore';

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
  const showToast = useToastStore(s => s.showToast);

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
    showToast('Preferences saved successfully!', 'construct');
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
          <Text style={st.rowSub}>Select your preferred currency — applies to all price displays</Text>
          <View style={st.currencyGrid}>
            {CURRENCIES.map(c => (
              <TouchableOpacity key={c.code} onPress={() => setDraft(d => ({ ...d, currency: c.code }))}
                style={[st.currencyChip, draft.currency === c.code && st.currencyChipOn]}>
                <Text style={st.currencyFlag}>{c.flag}</Text>
                <Text style={[st.currencyCode, draft.currency === c.code && st.currencyCodeOn]}>{c.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
          <Text style={st.aboutSub}>Built for Travellers · India to Global</Text>
        </ClayCard>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: NC.surfaceLowest,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.35)',
    borderRightColor: 'rgba(165,214,167,0.25)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 6,
  },
  backText: { color: NC.primary, fontSize: 13, fontWeight: '800' },
  heading: { color: NC.onSurface, fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  saveBtn: {
    paddingHorizontal: 22, paddingVertical: 10, borderRadius: 999, backgroundColor: NC.primary,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.5)',
    borderTopColor: 'rgba(255,255,255,0.7)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    shadowColor: 'rgba(27,94,32,0.4)', shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  saveLarge: {
    backgroundColor: NC.primary, borderRadius: 999, paddingVertical: 20, alignItems: 'center', marginBottom: 10,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.5)',
    borderTopColor: 'rgba(255,255,255,0.7)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    shadowColor: 'rgba(27,94,32,0.4)', shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 18, elevation: 10,
  },
  saveLargeText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  scroll: { paddingHorizontal: 18, paddingBottom: 20 },
  section: { color: NC.onSurfaceVariant, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 22 },
  card: { marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowLabel: { color: NC.onSurface, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  rowSub: { color: NC.onSurfaceVariant, fontSize: 12, marginBottom: 4 },
  div: { height: 1.5, backgroundColor: 'rgba(165,214,167,0.15)', marginVertical: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: NC.surfaceLow,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    borderRightColor: 'rgba(165,214,167,0.2)',
    shadowColor: 'rgba(165,214,167,0.3)', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 4,
  },
  chipOn: {
    backgroundColor: NC.primary, borderColor: 'rgba(255,255,255,0.4)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    shadowColor: 'rgba(27,94,32,0.4)', shadowRadius: 10, elevation: 7,
  },
  chipText: { color: NC.onSurfaceVariant, fontSize: 13, fontWeight: '700' },
  chipTextOn: { color: '#fff', fontWeight: '900' },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  currencyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
    backgroundColor: NC.surfaceLow,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.3)', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 3,
  },
  currencyChipOn: {
    backgroundColor: NC.primary, borderColor: 'rgba(255,255,255,0.4)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    shadowColor: 'rgba(27,94,32,0.4)', elevation: 6,
  },
  currencyFlag: { fontSize: 15 },
  currencyCode: { fontSize: 12, fontWeight: '700', color: NC.onSurfaceVariant },
  currencyCodeOn: { color: '#fff', fontWeight: '900' },
  rateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  rateFrom: { color: NC.onSurface, fontSize: 14, fontWeight: '700', flex: 1 },
  rateEq: { color: NC.outlineVariant, fontSize: 13 },
  rateTo: { fontSize: 14, fontWeight: '900', color: NC.primary, flex: 1, textAlign: 'right' },
  rateNote: { color: NC.outlineVariant, fontSize: 11, marginTop: 10, fontWeight: '600' },
  aboutTitle: { color: NC.onSurface, fontSize: 16, fontWeight: '900' },
  aboutSub: { color: NC.onSurfaceVariant, fontSize: 13, marginTop: 5 },
});
