import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ClayCard } from '../src/components/clay/ClayCard';
import { ClayToggle } from '../src/components/clay/ClayToggle';
import { useSettingsStore } from '../src/store/settingsStore';
import { CURRENCIES } from '../src/constants/currencies';

function SettingRow({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) {
  return (
    <View style={st.row}>
      <View style={{ flex: 1 }}>
        <Text style={st.rowLabel}>{label}</Text>
        {sub && <Text style={st.rowSub}>{sub}</Text>}
      </View>
      {right}
    </View>
  );
}

function OptionPicker<T extends string>({ options, value, onSelect, colors }: {
  options: T[]; value: T; onSelect: (v: T) => void; colors?: Record<string, string>;
}) {
  return (
    <View style={st.optionRow}>
      {options.map((o) => (
        <TouchableOpacity
          key={o}
          onPress={() => onSelect(o)}
          style={[st.optionChip, value === o && { backgroundColor: colors?.[o] ?? '#4CAF50', borderColor: 'rgba(255,255,255,0.6)' }]}
        >
          <Text style={[st.optionText, value === o && { color: '#FFF', fontWeight: '800' }]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const s = useSettingsStore();

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.heading}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        <Text style={st.section}>Display</Text>
        <ClayCard style={st.card}>
          <SettingRow
            label="Dark Mode"
            sub="Switch to dark theme"
            right={<ClayToggle value={s.darkMode} onToggle={s.toggleDark} activeColor="#4CAF50" />}
          />
          <View style={st.divider} />
          <Text style={st.rowLabel}>Map Style</Text>
          <OptionPicker
            options={['standard', 'satellite', 'blueprint'] as const}
            value={s.mapStyle}
            onSelect={s.setMapStyle}
            colors={{ standard: '#4CAF50', satellite: '#1565C0', blueprint: '#6A1B9A' }}
          />
        </ClayCard>

        <Text style={st.section}>Travel Preferences</Text>
        <ClayCard style={st.card}>
          <Text style={st.rowLabel}>Default Travel Class</Text>
          <OptionPicker
            options={['Sleeper', '3AC', '2AC', '1AC', 'Economy', 'Business'] as const}
            value={s.travelClass}
            onSelect={s.setTravelClass}
            colors={{ Sleeper: '#4CAF50', '3AC': '#4CAF50', '2AC': '#4CAF50', '1AC': '#4CAF50', Economy: '#4CAF50', Business: '#4CAF50' }}
          />
          <View style={st.divider} />
          <Text style={st.rowLabel}>Currency</Text>
          <OptionPicker
            options={['INR', 'SGD', 'USD'] as const}
            value={s.currency}
            onSelect={s.setCurrency}
            colors={{ INR: '#4CAF50', SGD: '#F9A825', USD: '#1565C0' }}
          />
          <View style={st.divider} />
          <Text style={st.rowLabel}>Distance Unit</Text>
          <OptionPicker
            options={['km', 'miles'] as const}
            value={s.distanceUnit}
            onSelect={(v) => useSettingsStore.setState({ distanceUnit: v })}
            colors={{ km: '#4CAF50', miles: '#4CAF50' }}
          />
        </ClayCard>

        <Text style={st.section}>Privacy & Security</Text>
        <ClayCard style={st.card}>
          <SettingRow
            label="Biometric Lock"
            sub="FaceID / Fingerprint for Wallet"
            right={<ClayToggle value={s.biometricLock} onToggle={s.toggleBiometric} activeColor="#4CAF50" />}
          />
          <View style={st.divider} />
          <SettingRow
            label="Cloud Sync"
            sub="Backup trip data to cloud"
            right={<ClayToggle value={s.cloudSync} onToggle={s.toggleCloudSync} activeColor="#4CAF50" />}
          />
          <View style={st.divider} />
          <SettingRow
            label="Notifications"
            sub="Trip alerts & reminders"
            right={<ClayToggle value={s.notifications} onToggle={s.toggleNotifications} activeColor="#4CAF50" />}
          />
        </ClayCard>

        <Text style={st.section}>Live Converter (INR base)</Text>
        <ClayCard style={st.card}>
          {CURRENCIES.filter((c) => c.code !== 'INR').map((c) => {
            const converted = (1000 * c.rateFromINR);
            return (
              <View key={c.code} style={st.convertRow}>
                <Text style={st.convertFrom}>{c.flag} {c.code}</Text>
                <Text style={st.convertArrow}>₹1,000 =</Text>
                <Text style={st.convertTo}>
                  {c.symbol}{converted >= 1 ? converted.toFixed(2) : converted.toFixed(3)}
                </Text>
              </View>
            );
          })}
          <Text style={st.convertNote}>* Approximate rates · Apr 2026</Text>
        </ClayCard>

        <Text style={st.section}>About</Text>
        <ClayCard style={st.card}>
          <Text style={st.aboutText}>Spatial Travel Planner v1.0</Text>
          <Text style={st.aboutSub}>Built with Love for Travellers</Text>
          <Text style={st.aboutSub}>India 🇮🇳 → Singapore 🇸🇬</Text>
        </ClayCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn: { padding: 8, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(200,230,201,0.6)' },
  backText: { color: '#2E7D32', fontSize: 13, fontWeight: '700' },
  heading: { color: '#1B5E20', fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  section: {
    color: '#558B2F', fontSize: 11, fontWeight: '800', letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 8, marginTop: 16,
  },
  card: { marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { color: '#1B5E20', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  rowSub: { color: '#558B2F', fontSize: 11 },
  divider: { height: 1, backgroundColor: 'rgba(200,230,201,0.5)', marginVertical: 10 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  optionChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50,
    backgroundColor: '#F0FAF1', borderWidth: 1.5, borderColor: 'rgba(200,230,201,0.7)',
  },
  optionText: { color: '#558B2F', fontSize: 12, fontWeight: '600' },
  convertRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, gap: 8 },
  convertFrom: { color: '#1B5E20', fontSize: 13, fontWeight: '600', flex: 1 },
  convertArrow: { color: '#81C784', fontSize: 12 },
  convertTo: { fontSize: 13, fontWeight: '800', color: '#2E7D32', flex: 1, textAlign: 'right' },
  convertNote: { color: '#81C784', fontSize: 10, marginTop: 8 },
  aboutText: { color: '#1B5E20', fontSize: 15, fontWeight: '800' },
  aboutSub: { color: '#558B2F', fontSize: 12, marginTop: 4 },
});
