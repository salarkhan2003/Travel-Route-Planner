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
import { useTranslation } from '../src/hooks/useTranslation';
import { INDIAN_LANGUAGES, FOREIGN_LANGUAGES, LANGUAGE_LIST } from '../src/constants/languages';
import { Ionicons } from '@expo/vector-icons';
import { Modal, TextInput } from 'react-native';

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

function LanguagePickerModal({ visible, onClose, selected, onSelect }: { visible: boolean; onClose: () => void; selected: string; onSelect: (v: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = LANGUAGE_LIST.filter(l => 
    l.native.toLowerCase().includes(search.toLowerCase()) || 
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={st.modalOverlay}>
        <View style={st.modalSheet}>
          <View style={st.modalHandle} />
          <View style={st.modalHeader}>
            <Text style={st.modalTitle}>Select Language</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={NC.primary} /></TouchableOpacity>
          </View>
          
          <View style={st.modalSearchBox}>
            <Ionicons name="search" size={18} color={NC.primary} style={{marginRight:8}} />
            <TextInput 
              style={st.modalSearchInput} 
              placeholder="Search language..."
              placeholderTextColor="#81C784"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView style={{ marginTop: 12 }}>
            {filtered.map(l => (
              <TouchableOpacity key={l.code} onPress={() => { onSelect(l.code); onClose(); }} 
                style={[st.langRow, selected === l.code && st.langRowActive]}>
                <Text style={st.langFlag}>{l.flag}</Text>
                <View style={{ flex:1 }}>
                  <Text style={[st.langNative, selected === l.code && st.langNativeActive]}>{l.native}</Text>
                  <Text style={st.langName}>{l.name}</Text>
                </View>
                {selected === l.code && <Ionicons name="checkmark-circle" size={22} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const store = useSettingsStore();
  const showToast = useToastStore(s => s.showToast);
  const { t } = useTranslation();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const [draft, setDraft] = useState({
    currency: store.currency,
    language: store.language,
    travelClass: (store as any).travelClass || 'Sleeper',
    distanceUnit: (store as any).distanceUnit || 'km',
    mapStyle: (store as any).mapStyle || 'standard',
    darkMode: (store as any).darkMode || false,
    biometricLock: (store as any).biometricLock || false,
    cloudSync: (store as any).cloudSync || false,
    notifications: (store as any).notifications || true,
  });

  const dirty =
    draft.currency !== store.currency ||
    draft.language !== store.language ||
    draft.travelClass !== (store as any).travelClass ||
    draft.distanceUnit !== (store as any).distanceUnit ||
    draft.mapStyle !== (store as any).mapStyle ||
    draft.darkMode !== (store as any).darkMode ||
    draft.biometricLock !== (store as any).biometricLock ||
    draft.cloudSync !== (store as any).cloudSync ||
    draft.notifications !== (store as any).notifications;

  const save = () => {
    store.setCurrency(draft.currency);
    store.setLanguage(draft.language);
    if ((store as any).setTravelClass) (store as any).setTravelClass(draft.travelClass);
    if ((store as any).setDistanceUnit) (store as any).setDistanceUnit(draft.distanceUnit);
    if ((store as any).setMapStyle) (store as any).setMapStyle(draft.mapStyle);
    
    showToast('Preferences saved successfully!', 'construct');
  };

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <Text style={st.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={st.heading}>{t('settings') || 'Settings'}</Text>
        {dirty
          ? <TouchableOpacity onPress={save} style={st.saveBtn}><Text style={st.saveBtnText}>{t('save') || 'Save'}</Text></TouchableOpacity>
          : <View style={{ width: 64 }} />
        }
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        <Text style={st.section}>{t('display') || 'Display'}</Text>
        <ClayCard style={st.card}>
          <Row label={t('dark_mode') || "Dark Mode"} sub="Switch to dark theme"
            right={<ClayToggle value={draft.darkMode} onToggle={() => setDraft(d => ({ ...d, darkMode: !d.darkMode }))} activeColor={NC.primary} />} />
          <View style={st.div} />
          <Text style={st.rowLabel}>{t('map_style') || "Map Style"}</Text>
          <Chips options={['standard', 'satellite', 'blueprint'] as const} value={draft.mapStyle} onSelect={(v) => setDraft(d => ({ ...d, mapStyle: v }))} />
        </ClayCard>

        <Text style={st.section}>{t('language') || 'Language'}</Text>
        <ClayCard style={st.card}>
          <TouchableOpacity onPress={() => setShowLangPicker(true)} style={st.langPickerTrigger}>
             <View style={{ flex: 1 }}>
               <Text style={st.rowLabel}>{t('language') || 'Language'}</Text>
               <Text style={st.rowSub}>{LANGUAGE_LIST.find(l => l.code === draft.language)?.native} ({LANGUAGE_LIST.find(l => l.code === draft.language)?.name})</Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color={NC.primary} />
          </TouchableOpacity>
        </ClayCard>

        <Text style={st.section}>{t('travel_preferences') || 'Travel Preferences'}</Text>
        <ClayCard style={st.card}>
          <Text style={st.rowLabel}>{t('travel_class') || 'Travel Class'}</Text>
          <Chips options={['Sleeper', '3AC', '2AC', '1AC', 'Economy', 'Business'] as const} value={draft.travelClass} onSelect={(v) => setDraft(d => ({ ...d, travelClass: v }))} />
          <View style={st.div} />
          <Text style={st.rowLabel}>{t('currency') || 'Currency'}</Text>
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
          <Text style={st.rowLabel}>{t('distance') || 'Distance'}</Text>
          <Chips options={['km', 'miles'] as const} value={draft.distanceUnit} onSelect={(v) => setDraft(d => ({ ...d, distanceUnit: v }))} />
        </ClayCard>

        {dirty && (
          <TouchableOpacity onPress={save} style={st.saveLarge} activeOpacity={0.85}>
            <Text style={st.saveLargeText}>Save Preferences</Text>
          </TouchableOpacity>
        )}

        <Text style={st.section}>{t('privacy_security') || 'Privacy & Security'}</Text>
        <ClayCard style={st.card}>
          <Row label={t('biometric_lock') || "Biometric Lock"} sub="FaceID / Fingerprint for Wallet"
            right={<ClayToggle value={draft.biometricLock} onToggle={() => setDraft(d => ({ ...d, biometricLock: !d.biometricLock }))} activeColor={NC.primary} />} />
          <View style={st.div} />
          <Row label={t('cloud_sync') || "Cloud Sync"} sub="Backup trip data"
            right={<ClayToggle value={draft.cloudSync} onToggle={() => setDraft(d => ({ ...d, cloudSync: !d.cloudSync }))} activeColor={NC.primary} />} />
          <View style={st.div} />
          <Row label={t('notifications') || "Notifications"} sub="Trip alerts & reminders"
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

        <Text style={st.section}>{t('about') || 'About'}</Text>
        <ClayCard style={st.card}>
          <Text style={st.aboutTitle}>Spatial Travel Planner v1.0</Text>
          <Text style={st.aboutSub}>Built for Travellers · India to Global</Text>
        </ClayCard>

        <View style={{ height: 110 }} />
      </ScrollView>

      <LanguagePickerModal 
        visible={showLangPicker} 
        onClose={() => setShowLangPicker(false)}
        selected={draft.language}
        onSelect={(v) => setDraft(d => ({ ...d, language: v }))}
      />
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
  
  langPickerTrigger: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    padding: 24, maxHeight: '85%',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 20,
  },
  modalHandle: { width: 40, height: 5, backgroundColor: '#A5D6A7', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.5 },
  modalSearchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F8F2',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 2, borderColor: 'rgba(165,214,167,0.15)',
  },
  modalSearchInput: { flex: 1, color: '#1B5E20', fontSize: 15, fontWeight: '600' },
  
  langRow: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 8,
    backgroundColor: '#F8FFF9', borderWidth: 1.5, borderColor: 'rgba(165,214,167,0.1)',
  },
  langRowActive: { backgroundColor: NC.primary, borderColor: 'rgba(255,255,255,0.3)' },
  langFlag: { fontSize: 24, marginRight: 14 },
  langNative: { fontSize: 16, fontWeight: '800', color: NC.onSurface },
  langNativeActive: { color: '#FFF' },
  langName: { fontSize: 12, color: NC.onSurfaceVariant, marginTop: 2 },
});
