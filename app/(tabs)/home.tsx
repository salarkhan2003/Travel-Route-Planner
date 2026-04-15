import React, { useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text,
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
  { city: 'Ajmer', temp: '34°C', condition: 'Sunny' },
  { city: 'Delhi', temp: '38°C', condition: 'Partly Cloudy' },
  { city: 'Singapore', temp: '29°C', condition: 'Showers' },
  { city: 'Guntur', temp: '36°C', condition: 'Hot & Dry' },
];
const WEEKEND = [
  { from: 'Guntur', to: 'Vizag', days: 2, cost: '₹3,200', tag: 'Beach' },
  { from: 'Delhi', to: 'Agra', days: 1, cost: '₹1,800', tag: 'Heritage' },
  { from: 'Ajmer', to: 'Pushkar', days: 1, cost: '₹800', tag: 'Spiritual' },
];
const GEMS = [
  { name: 'Hampi', state: 'Karnataka', crowd: 'Low' },
  { name: 'Ziro Valley', state: 'Arunachal', crowd: 'Very Low' },
];
const DEALS = [
  { route: 'Guntur → Delhi', type: 'Train 3AC', price: '₹890', drop: '23%' },
  { route: 'Delhi → Singapore', type: 'Flight Economy', price: '₹18,500', drop: '15%' },
];
const TOOLS = [
  { key: 'Currency', label: 'Currency' },
  { key: 'Vault', label: 'Vault' },
  { key: 'SOS', label: 'SOS' },
  { key: 'Translate', label: 'Translate' },
  { key: 'Offline', label: 'Offline' },
  { key: 'Weather', label: 'Weather' },
];
const POLLS = [
  { q: 'Dinner tonight?', opts: ['Taj Cafe', 'Local Dhaba'], votes: [3, 5] },
  { q: 'Next stop?', opts: ['Pushkar', 'Jaipur'], votes: [4, 4] },
];

export default function HomeScreen() {
  const router = useRouter();
  const nodes = useTripStore((s) => s.nodes);
  const spentBudget = useTripStore((s) => s.spentBudget);
  const globalBudget = useTripStore((s) => s.globalBudget);
  const members = useFamilyStore((s) => s.members);
  const { fmtFull } = useCurrency();
  const [search, setSearch] = useState('');
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({});
  const [fromCur, setFromCur] = useState('INR');
  const [toCur, setToCur] = useState('SGD');
  const [amount, setAmount] = useState('1000');
  const [showConverter, setShowConverter] = useState(false);
  const nextCity = nodes[0]?.city ?? 'New Delhi';
  const budgetPct = Math.min((spentBudget / globalBudget) * 100, 100);

  const converted = (() => {
    const from = CURRENCIES.find((c) => c.code === fromCur);
    const to = CURRENCIES.find((c) => c.code === toCur);
    if (!from || !to) return '0';
    const inr = parseFloat(amount || '0') / from.rateFromINR;
    const result = inr * to.rateFromINR;
    return result >= 1000 ? `${(result / 1000).toFixed(2)}k` : result.toFixed(2);
  })();

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.appName}>Nomad Canvas</Text>
            <Text style={s.sub}>Trip CEO · {members.length} members</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={s.avatar}>
            <Text style={s.avatarText}>{members[0]?.name?.[0] ?? 'T'}</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchPill}>
          <Text style={s.searchIcon}>Search</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Where to next, traveller..."
            placeholderTextColor={NC.outlineVariant}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={s.planBtn} onPress={() => router.push('/(tabs)/explore')}>
            <Text style={s.planBtnText}>Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Trip Card */}
        <View style={s.heroCard}>
          <View style={s.heroBadgeRow}>
            <View style={s.liveBadge}><Text style={s.liveBadgeText}>LIVE TRIP</Text></View>
            <Text style={s.dayBadge}>Day 1 of 9</Text>
          </View>
          <Text style={s.heroTitle}>Next: Train to{'\n'}Goa</Text>
          <View style={s.heroMeta}>
            <View>
              <Text style={s.heroMetaLabel}>DEPARTURE IN</Text>
              <Text style={s.heroMetaVal}>02h 45m</Text>
            </View>
            <View style={s.heroMetaDivider} />
            <View>
              <Text style={s.heroMetaLabel}>PLATFORM</Text>
              <Text style={s.heroMetaVal}>4B</Text>
            </View>
          </View>
          <View style={s.budgetBarBg}>
            <View style={[s.budgetBarFill, { width: `${budgetPct}%` as any }]} />
          </View>
          <View style={s.budgetRow}>
            <Text style={s.budgetText}>{fmtFull(spentBudget)} spent</Text>
            <Text style={s.budgetText}>{fmtFull(globalBudget - spentBudget)} left</Text>
          </View>
        </View>

        {/* Weather Strip */}
        <Text style={s.sectionHead}>Route Weather</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hRow}>
          {WEATHER.map((w) => (
            <ClayCard key={w.city} style={s.weatherCard}>
              <Text style={s.weatherTemp}>{w.temp}</Text>
              <Text style={s.weatherCity}>{w.city}</Text>
              <Text style={s.weatherCond}>{w.condition}</Text>
            </ClayCard>
          ))}
        </ScrollView>

        {/* Tools */}
        <Text style={s.sectionHead}>Traveller Tools</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hRow}>
          {TOOLS.map((t) => (
            <TouchableOpacity key={t.key} style={s.toolBtn}
              onPress={() => {
                if (t.key === 'Currency') setShowConverter(!showConverter);
                else if (t.key === 'SOS') Alert.alert('SOS', 'Sending location to family...');
                else if (t.key === 'Vault') router.push('/(tabs)/booking');
                else Alert.alert(t.label, 'Coming soon');
              }}>
              <View style={s.toolIconBox}>
                <Text style={s.toolIconText}>{t.label[0]}</Text>
              </View>
              <Text style={s.toolLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Currency Converter */}
        {showConverter && (
          <ClayCard style={s.converterCard}>
            <Text style={s.converterTitle}>Live FX</Text>
            <Text style={s.converterSub}>INR to {toCur} real-time</Text>
            <View style={s.converterRow}>
              <View style={s.converterBox}>
                <Text style={s.converterBoxLabel}>From (INR)</Text>
                <TextInput style={s.converterInput} value={amount}
                  onChangeText={setAmount} keyboardType="numeric"
                  placeholderTextColor={NC.outlineVariant} />
              </View>
              <TouchableOpacity style={s.swapBtn} onPress={() => { const t = fromCur; setFromCur(toCur); setToCur(t); }}>
                <Text style={s.swapBtnText}>swap</Text>
              </TouchableOpacity>
              <View style={[s.converterBox, s.converterBoxResult]}>
                <Text style={s.converterBoxLabel}>To ({toCur})</Text>
                <Text style={s.converterResult}>{converted}</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {CURRENCIES.slice(0, 5).map((c) => (
                <TouchableOpacity key={c.code} onPress={() => setToCur(c.code)}
                  style={[s.curChip, toCur === c.code && s.curChipOn]}>
                  <Text style={[s.curChipText, toCur === c.code && { color: NC.onPrimary }]}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ClayCard>
        )}

        {/* Discover */}
        <Text style={s.sectionHead}>Discover</Text>
        <ClayCard style={s.bentoCard}>
          <Text style={s.bentoTitle}>Weekend Getaways</Text>
          {WEEKEND.map((t) => (
            <TouchableOpacity key={t.to} style={s.bentoRow} onPress={() => router.push('/(tabs)/saved')}>
              <View style={s.bentoDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.bentoName}>{t.from} → {t.to}</Text>
                <Text style={s.bentoSub}>{t.days}D · {t.tag}</Text>
              </View>
              <Text style={s.bentoCost}>{t.cost}</Text>
            </TouchableOpacity>
          ))}
        </ClayCard>

        <View style={s.halfRow}>
          <ClayCard style={s.halfCard}>
            <Text style={s.bentoTitle}>Hidden Gems</Text>
            {GEMS.map((g) => (
              <View key={g.name} style={s.gemRow}>
                <View style={s.bentoDot} />
                <View>
                  <Text style={s.gemName}>{g.name}</Text>
                  <Text style={s.gemSub}>{g.crowd} crowd</Text>
                </View>
              </View>
            ))}
          </ClayCard>
          <ClayCard style={s.halfCard}>
            <Text style={s.bentoTitle}>Hot Deals</Text>
            {DEALS.map((d) => (
              <View key={d.route} style={s.dealRow}>
                <Text style={s.dealRoute}>{d.route}</Text>
                <View style={s.dealBadge}><Text style={s.dealDrop}>-{d.drop}</Text></View>
                <Text style={s.dealPrice}>{d.price}</Text>
              </View>
            ))}
          </ClayCard>
        </View>

        {/* Family */}
        <Text style={s.sectionHead}>Family Hub</Text>
        <ClayCard style={s.warCard}>
          <View style={s.warMembers}>
            {members.map((m) => (
              <View key={m.id} style={s.warMember}>
                <View style={[s.warAvatar, { backgroundColor: m.isLeader ? NC.primary : NC.secondaryContainer }]}>
                  <Text style={[s.warAvatarText, { color: m.isLeader ? NC.onPrimary : NC.onSecondaryContainer }]}>{m.name[0]}</Text>
                </View>
                <View style={s.onlineDot} />
                <Text style={s.warName}>{m.name.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
          <ClayButton label="Broadcast Next Step" onPress={() => Alert.alert('Sent!', 'Sent to all members')}
            color={NC.primaryFixed} textColor={NC.onPrimaryFixed} small style={{ marginTop: 14 }} />
        </ClayCard>

        {/* Polls */}
        <Text style={s.sectionHead}>Group Polls</Text>
        {POLLS.map((poll, pi) => (
          <ClayCard key={pi} style={s.pollCard}>
            <Text style={s.pollQ}>{poll.q}</Text>
            {poll.opts.map((opt, oi) => {
              const key = `${pi}-${oi}`;
              const voted = !!pollVotes[key];
              const total = poll.votes.reduce((a, b) => a + b, 0) + Object.keys(pollVotes).filter(k => k.startsWith(`${pi}-`)).length;
              const pct = total > 0 ? Math.round(((poll.votes[oi] + (voted ? 1 : 0)) / total) * 100) : 0;
              return (
                <TouchableOpacity key={opt}
                  style={[s.pollOpt, voted && s.pollOptVoted]}
                  onPress={() => { if (!pollVotes[key]) setPollVotes(v => ({ ...v, [key]: 1 })); }}>
                  <View style={[s.pollFill, { width: `${pct}%` as any }]} />
                  <Text style={s.pollOptText}>{opt}</Text>
                  <Text style={s.pollPct}>{pct}%</Text>
                </TouchableOpacity>
              );
            })}
          </ClayCard>
        ))}

        {/* Expense Snap */}
        <ClayCard style={s.snapCard}>
          <View style={s.snapRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.snapTitle}>Expense Snap</Text>
              <Text style={s.snapSub}>Snap a bill, split among {members.length} members</Text>
            </View>
            <TouchableOpacity style={s.snapBtn} onPress={() => Alert.alert('Camera', 'Opening camera...')}>
              <Text style={s.snapBtnText}>Snap</Text>
            </TouchableOpacity>
          </View>
        </ClayCard>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  appName: { fontSize: 26, fontWeight: '900', color: NC.primary, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: NC.onSurfaceVariant, marginTop: 2, fontWeight: '600' },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: NC.primaryFixed, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1, shadowRadius: 14, elevation: 6,
  },
  avatarText: { fontSize: 18, fontWeight: '900', color: NC.onPrimaryFixed },

  searchPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: NC.surfaceLowest, borderRadius: 50,
    paddingHorizontal: 20, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 20, elevation: 6,
    marginBottom: 20, gap: 10,
  },
  searchIcon: { fontSize: 11, fontWeight: '800', color: NC.outlineVariant, letterSpacing: 0.5 },
  searchInput: { flex: 1, color: NC.onSurface, fontSize: 14, fontWeight: '500' },
  planBtn: {
    backgroundColor: NC.primary, borderRadius: 50,
    paddingHorizontal: 16, paddingVertical: 8,
    shadowColor: NC.shadowButton, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 4,
  },
  planBtnText: { color: NC.onPrimary, fontSize: 13, fontWeight: '800' },

  heroCard: {
    marginBottom: 20,
    backgroundColor: NC.primary,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(197,248,199,0.25)',
    shadowColor: 'rgba(42,49,39,0.25)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 10,
  },
  heroBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  liveBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  liveBadgeText: { color: '#ffffff', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  dayBadge: { color: NC.primaryFixed, fontSize: 11, fontWeight: '700', alignSelf: 'center' },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#ffffff', lineHeight: 32, marginBottom: 18, letterSpacing: -0.5 },
  heroMeta: { flexDirection: 'row', gap: 0, marginBottom: 18, alignItems: 'center' },
  heroMetaDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 20 },
  heroMetaLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(197,248,199,0.8)', letterSpacing: 1.2, marginBottom: 4 },
  heroMetaVal: { fontSize: 22, fontWeight: '900', color: '#ffffff' },
  budgetBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  budgetBarFill: { height: '100%', backgroundColor: NC.primaryFixed, borderRadius: 3 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetText: { color: 'rgba(197,248,199,0.9)', fontSize: 11, fontWeight: '700' },

  sectionHead: { fontSize: 15, fontWeight: '900', color: NC.onSurface, marginBottom: 12, marginTop: 4, letterSpacing: -0.2 },
  hRow: { marginBottom: 20 },

  weatherCard: { width: 100, marginRight: 12, alignItems: 'center', padding: 14, marginBottom: 0 },
  weatherTemp: { fontSize: 20, fontWeight: '900', color: NC.primary },
  weatherCity: { color: NC.onSurface, fontSize: 11, fontWeight: '800', marginTop: 4 },
  weatherCond: { color: NC.onSurfaceVariant, fontSize: 9, fontWeight: '600', textAlign: 'center', marginTop: 2 },

  toolBtn: { alignItems: 'center', marginRight: 16 },
  toolIconBox: {
    width: 56, height: 56, borderRadius: 20,
    backgroundColor: NC.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1, shadowRadius: 14, elevation: 5, marginBottom: 6,
  },
  toolIconText: { fontSize: 18, fontWeight: '900', color: NC.primary },
  toolLabel: { color: NC.onSurfaceVariant, fontSize: 10, fontWeight: '700' },

  converterCard: { marginBottom: 20 },
  converterTitle: { fontSize: 22, fontWeight: '900', color: NC.primary, letterSpacing: -0.3 },
  converterSub: { color: NC.onSurfaceVariant, fontSize: 12, marginBottom: 16 },
  converterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  converterBox: {
    flex: 1, backgroundColor: NC.surfaceLowest, borderRadius: 20, padding: 16,
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1, shadowRadius: 14, elevation: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  converterBoxResult: { backgroundColor: NC.primaryContainer },
  converterBoxLabel: { fontSize: 9, fontWeight: '800', color: NC.onSurfaceVariant, letterSpacing: 1, marginBottom: 4 },
  converterInput: { fontSize: 24, fontWeight: '900', color: NC.onSurface },
  converterResult: { fontSize: 24, fontWeight: '900', color: NC.primary },
  swapBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: NC.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: NC.shadowButton, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 4,
  },
  swapBtnText: { color: NC.onPrimary, fontSize: 9, fontWeight: '900' },
  curChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, marginRight: 8,
    backgroundColor: NC.surfaceLow, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },
  curChipOn: { backgroundColor: NC.primary },
  curChipText: { color: NC.onSurfaceVariant, fontSize: 11, fontWeight: '800' },

  bentoCard: { marginBottom: 12 },
  bentoTitle: { color: NC.onSurface, fontSize: 13, fontWeight: '900', marginBottom: 12, letterSpacing: -0.2 },
  bentoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  bentoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: NC.primary },
  bentoName: { color: NC.onSurface, fontSize: 13, fontWeight: '700' },
  bentoSub: { color: NC.onSurfaceVariant, fontSize: 10, marginTop: 1 },
  bentoCost: { color: NC.primary, fontSize: 13, fontWeight: '900' },
  halfRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  halfCard: { flex: 1, padding: 14, marginBottom: 0 },
  gemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  gemName: { color: NC.onSurface, fontSize: 12, fontWeight: '700' },
  gemSub: { color: NC.onSurfaceVariant, fontSize: 9 },
  dealRow: { marginBottom: 8 },
  dealRoute: { color: NC.onSurfaceVariant, fontSize: 10, fontWeight: '600' },
  dealBadge: { backgroundColor: NC.surfaceLow, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginVertical: 2 },
  dealDrop: { color: NC.primary, fontSize: 10, fontWeight: '900' },
  dealPrice: { color: NC.onSurface, fontSize: 13, fontWeight: '900' },

  warCard: { marginBottom: 20 },
  warMembers: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  warMember: { alignItems: 'center', position: 'relative' },
  warAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  warAvatarText: { fontSize: 16, fontWeight: '900' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', position: 'absolute', top: 0, right: 0, borderWidth: 2, borderColor: '#fff' },
  warName: { color: NC.onSurface, fontSize: 9, fontWeight: '700', marginTop: 4 },

  pollCard: { marginBottom: 12 },
  pollQ: { color: NC.onSurface, fontSize: 15, fontWeight: '900', marginBottom: 12 },
  pollOpt: {
    borderRadius: 16, overflow: 'hidden', backgroundColor: NC.surfaceLow,
    flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },
  pollOptVoted: { borderColor: NC.primary, borderWidth: 1.5 },
  pollFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(57,101,63,0.12)', borderRadius: 16 },
  pollOptText: { flex: 1, color: NC.onSurface, fontSize: 13, fontWeight: '700' },
  pollPct: { color: NC.primary, fontSize: 13, fontWeight: '900' },

  snapCard: { marginBottom: 12 },
  snapRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  snapTitle: { color: NC.onSurface, fontSize: 16, fontWeight: '900' },
  snapSub: { color: NC.onSurfaceVariant, fontSize: 11, marginTop: 4, fontWeight: '600' },
  snapBtn: {
    backgroundColor: NC.primary, borderRadius: 50,
    paddingHorizontal: 20, paddingVertical: 12,
    shadowColor: NC.shadowButton, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 4,
  },
  snapBtnText: { color: NC.onPrimary, fontSize: 13, fontWeight: '800' },
});
