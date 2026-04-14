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
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {right}
    </View>
  );
}

function OptionPicker<T extends string>({ options, value, onSelect, colors }: {
  options: T[]; value: T; onSelect: (v: T) => void; colors?: Record<string, string>;
}) {
  return (
    <View style={styles.optionRow}>
      {options.map((o) => (
        <TouchableOpacity
          key={o}
          onPress={() => onSelect(o)}
          style={[styles.optionChip, value === o && { backgroundColor: colors?.[o] ?? '#A3C9FF' }]}
        >
          <Text style={[styles.optionText, value === o && { color: '#000' }]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const s = useSettingsStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>⚙️ Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Display */}
        <Text style={styles.section}>🎨 Display</Text>
        <ClayCard dark style={styles.card}>
          <SettingRow
            label="Dark Mode"
            sub="Liquid dark theme"
            right={<ClayToggle value={s.darkMode} onToggle={s.toggleDark} activeColor="#A3C9FF" />}
          />
          <View style={styles.divider} />
          <Text style={styles.rowLabel}>Map Style</Text>
          <OptionPicker
            options={['standard', 'satellite', 'blueprint'] as const}
            value={s.mapStyle}
            onSelect={s.setMapStyle}
            colors={{ standard: '#A3C9FF', satellite: '#A7F3D0', blueprint: '#C4B5FD' }}
          />
        </ClayCard>

        {/* Preferences */}
        <Text style={styles.section}>🎒 Travel Preferences</Text>
        <ClayCard dark style={styles.card}>
          <Text style={styles.rowLabel}>Default Travel Class</Text>
          <OptionPicker
            options={['Sleeper', '3AC', '2AC', '1AC', 'Economy', 'Business'] as const}
            value={s.travelClass}
            onSelect={s.setTravelClass}
          />
          <View style={styles.divider} />
          <Text style={styles.rowLabel}>Currency</Text>
          <OptionPicker
            options={['INR', 'SGD', 'USD'] as const}
            value={s.currency}
            onSelect={s.setCurrency}
            colors={{ INR: '#A7F3D0', SGD: '#FFD700', USD: '#A3C9FF' }}
          />
          <View style={styles.divider} />
          <Text style={styles.rowLabel}>Distance Unit</Text>
          <OptionPicker
            options={['km', 'miles'] as const}
            value={s.distanceUnit}
            onSelect={(v) => useSettingsStore.setState({ distanceUnit: v })}
          />
        </ClayCard>

        {/* Privacy */}
        <Text style={styles.section}>🔒 Privacy & Security</Text>
        <ClayCard dark style={styles.card}>
          <SettingRow
            label="Biometric Lock"
            sub="FaceID / Fingerprint for Wallet"
            right={<ClayToggle value={s.biometricLock} onToggle={s.toggleBiometric} activeColor="#C4B5FD" />}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Cloud Sync"
            sub="Backup to cloud"
            right={<ClayToggle value={s.cloudSync} onToggle={s.toggleCloudSync} activeColor="#A7F3D0" />}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Notifications"
            sub="Trip alerts & reminders"
            right={<ClayToggle value={s.notifications} onToggle={s.toggleNotifications} activeColor="#FFB3A7" />}
          />
        </ClayCard>

        {/* Currency converter */}
        <Text style={styles.section}>💱 Live Converter (INR base)</Text>
        <ClayCard dark style={styles.card}>
          {CURRENCIES.filter((c) => c.code !== 'INR').map((c) => {
            const converted = (1000 * c.rateFromINR);
            return (
              <View key={c.code} style={styles.convertRow}>
                <Text style={styles.convertFrom}>{c.flag} {c.code}</Text>
                <Text style={styles.convertArrow}>₹1,000 =</Text>
                <Text style={[styles.convertTo, { color: '#A3C9FF' }]}>
                  {c.symbol}{converted >= 1 ? converted.toFixed(2) : converted.toFixed(3)}
                </Text>
              </View>
            );
          })}
          <Text style={styles.convertNote}>* Approximate rates · Apr 2026</Text>
        </ClayCard>

        {/* App info */}
        <Text style={styles.section}>ℹ️ About</Text>
        <ClayCard dark style={styles.card}>
          <Text style={styles.aboutText}>Spatial Travel Planner v1.0</Text>
          <Text style={styles.aboutSub}>Built with Love for Travellers</Text>
          <Text style={styles.aboutSub}>India 🇮🇳 → Singapore 🇸🇬</Text>
        </ClayCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 8 },
  backText: { color: '#A3C9FF', fontSize: 14, fontWeight: '600' },
  heading: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16 },
  section: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  rowSub: { color: '#888', fontSize: 11 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 10 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#2A2D3E', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  optionText: { color: '#888', fontSize: 12, fontWeight: '600' },
  convertRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  convertFrom: { color: '#FFF', fontSize: 13, fontWeight: '600', flex: 1 },
  convertArrow: { color: '#555' },
  convertTo: { fontSize: 13, fontWeight: '700', flex: 1, textAlign: 'right' },
  convertNote: { color: '#555', fontSize: 10, marginTop: 6 },
  aboutText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  aboutSub: { color: '#888', fontSize: 12, marginTop: 4 },
});
