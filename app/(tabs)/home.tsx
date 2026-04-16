import React, { useRef, useState } from 'react';
import {
  Alert, Animated, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
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
const TOOLS = [
  { key: 'Currency', label: 'FX', icon: '₹' },
  { key: 'SOS', label: 'SOS', icon: '!' },
  { key: 'Vault', label: 'Vault', icon: '🔒' },
  { key: 'Offline', label: 'Maps', icon: '◎' },
  { key: 'Weather', label: 'Weather', icon: '☁' },
  { key: 'Translate', label: 'Translate', icon: 'T' },
];
const POLLS = [
  { q: 'Dinner tonight?', opts: ['Taj Cafe', 'Local Dhaba'], votes: [3, 5] },
  { q: 'Next stop?', opts: ['Pushkar', 'Jaipur'], votes: [4, 4] },
];
const WEEKEND = [
  { from: 'Guntur', to: 'Goa', days: 3, cost: '₹4,200', tag: 'Beach' },
  { from: 'Delhi', to: 'Agra', days: 1, cost: '₹1,800', tag: 'Heritage' },
  { from: 'Ajmer', to: 'Pushkar', days: 1, cost: '₹800', tag: 'Spiritual' },
];

// ── Liquid Progress Bar ───────────────────────────────────────────────────────
function LiquidBar({ pct, color = NC.primary }: { pct: number; color?: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false, damping: 14, stiffness: 60 }).start();
  }, [pct]);
  const w = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={lb.track}>
      <Animated.View style={[lb.fill, { width: w as any, backgroundColor: color }]}>
        <View style={lb.sheen} />
      </Animated.View>
    </View>
  );
}
const lb = StyleSheet.create({
  track: {
    height: 14, borderRadius: 999, backgroundColor: NC.surfaceHigh,
    overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
  },
  fill: { height: '100%', borderRadius: 999 },
  sheen: {
    position: 'absolute', top: 2, left: 6, right: 6, height: 4,
    backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 999,
  },
});

// ── 3D Clay Icon ──────────────────────────────────────────────────────────────
function ClayIcon({ icon, bg, size = 52 }: { icon: string; bg: string; size?: number }) {
  return (
    <View style={[ci.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[ci.icon, { fontSize: size * 0.42 }]}>{icon}</Text>
    </View>
  );
}
const ci = StyleSheet.create({
  wrap: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(27,62,31,0.25)', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 16, elevation: 8,
  },
  icon: { lineHeight: undefined },
});

export default function HomeScreen() {
  const router = useRouter();
  const nodes = useTripStore(s => s.nodes);
  const spentBudget = useTripStore(s => s.spentBudget);
  const globalBudget = useTripStore(s => s.globalBudget);
  const members = useFamilyStore(s => s.members);
  const { fmtFull } = useCurrency();
  const [search, setSearch] = useState('');
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({});
  const [fromCur, setFromCur] = useState('INR');
  const [toCur, setToCur] = useState('SGD');
  const [amount, setAmount] = useState('1000');
  const [showConverter, setShowConverter] = useState(false);
  const budgetPct = Math.min((spentBudget / globalBudget) * 100, 100);
  const leader = members.find(m => m.isLeader);

  const converted = (() => {
    const from = CURRENCIES.find(c => c.code === fromCur);
    const to = CURRENCIES.find(c => c.code === toCur);
    if (!from || !to) return '0';
    const result = (parseFloat(amount || '0') / from.rateFromINR) * to.rateFromINR;
    return result >= 1000 ? `${(result / 1000).toFixed(2)}k` : result.toFixed(2);
  })();

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.appName}>Nomad Canvas</Text>
            <Text style={s.sub}>Trip CEO · {members.length} members</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={s.avatar}>
            <Text style={s.avatarText}>{(leader?.name?.[0] ?? 'T').toUpperCase()}</Text>
            <View style={s.avatarOnline} />
          </TouchableOpacity>
        </View>

        {/* ── Clay Search Tube ── */}
        <View style={s.searchTube}>
          <Text style={s.searchTubeIcon}>◎</Text>
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

        {/* ── BENTO GRID ── */}

        {/* Hero card — large train tile */}
        <ClayCard variant="green" style={s.heroCard}>
          <View style={s.heroBadgeRow}>
            <View style={s.livePill}><Text style={s.livePillText}>LIVE TRIP</Text></View>
            <Text style={s.dayPill}>Day 1 of 9</Text>
          </View>
          <View style={s.heroBody}>
            <View style={s.heroLeft}>
              <Text style={s.heroTitle}>Next: Train to{'\n'}Goa</Text>
              <View style={s.heroMetaRow}>
                <View>
                  <Text style={s.heroMetaLabel}>DEPARTS IN</Text>
                  <Text style={s.heroMetaVal}>02h 45m</Text>
                </View>
                <View style={s.heroMetaDivider} />
                <View>
                  <Text style={s.heroMetaLabel}>PLATFORM</Text>
                  <Text style={s.heroMetaVal}>4B</Text>
                </View>
              </View>
            </View>
            {/* 3D Train icon */}
            <View style={s.heroIconWrap}>
              <Text style={s.heroIcon}>🚆</Text>
            </View>
          </View>
          <View style={s.heroBudgetRow}>
            <Text style={s.heroBudgetLabel}>{fmtFull(spentBudget)} spent</Text>
            <Text style={s.heroBudgetLabel}>{fmtFull(globalBudget - spentBudget)} left</Text>
          </View>
          <LiquidBar pct={budgetPct} color={budgetPct > 80 ? NC.warning : NC.primaryFixed} />
        </ClayCard>

        {/* Bento row 1: Weather + Budget */}
        <View style={s.bentoRow}>
          {/* Weather mini tile */}
          <ClayCard variant="mint" style={s.bentoHalf}>
            <Text style={s.bentoTileLabel}>Weather</Text>
            <Text style={s.weatherBig}>{WEATHER[0].icon}</Text>
            <Text style={s.weatherTemp}>{WEATHER[0].temp}</Text>
            <Text style={s.weatherCity}>{WEATHER[0].city}</Text>
            <Text style={s.weatherCond}>{WEATHER[0].cond}</Text>
          </ClayCard>
          {/* Budget tile */}
          <ClayCard variant="white" style={s.bentoHalf}>
            <Text style={s.bentoTileLabel}>Budget</Text>
            <Text style={s.budgetBig}>{budgetPct.toFixed(0)}%</Text>
            <Text style={s.budgetSub}>utilized</Text>
            <LiquidBar pct={budgetPct} color={budgetPct > 80 ? NC.warning : NC.primary} />
            <Text style={s.budgetRemain}>{fmtFull(globalBudget - spentBudget)} left</Text>
          </ClayCard>
        </View>

        {/* Bento row 2: SOS + Quick tools */}
        <View style={s.bentoRow}>
          {/* Quick SOS */}
          <TouchableOpacity onPress={() => Alert.alert('SOS', 'Sending live location to all family members!')} activeOpacity={0.85}>
            <ClayCard variant="white" style={[s.bentoHalf, s.sosCard]}>
              <View style={s.sosCircle}>
                <Text style={s.sosText}>SOS</Text>
              </View>
              <Text style={s.sosLabel}>Quick SOS</Text>
              <Text style={s.sosSub}>Tap to alert family</Text>
            </ClayCard>
          </TouchableOpacity>
          {/* Trip stats */}
          <ClayCard variant="mint" style={s.bentoHalf}>
            <Text style={s.bentoTileLabel}>Trip Stats</Text>
            {[
              { label: 'Cities', val: nodes.length || 3 },
              { label: 'Members', val: members.length },
              { label: 'Days', val: 9 },
            ].map(st => (
              <View key={st.label} style={s.statRow}>
                <Text style={s.statLabel}>{st.label}</Text>
                <Text style={s.statVal}>{st.val}</Text>
              </View>
            ))}
          </ClayCard>
        </View>

        {/* ── Weather Strip ── */}
        <Text style={s.sectionHead}>Route Weather</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
          {WEATHER.map(w => (
            <ClayCard key={w.city} variant="white" style={s.weatherCard}>
              <Text style={s.weatherCardIcon}>{w.icon}</Text>
              <Text style={s.weatherCardTemp}>{w.temp}</Text>
              <Text style={s.weatherCardCity}>{w.city}</Text>
              <Text style={s.weatherCardCond}>{w.cond}</Text>
            </ClayCard>
          ))}
        </ScrollView>

        {/* ── Traveller Tools ── */}
        <Text style={s.sectionHead}>Traveller Tools</Text>
        <View style={s.toolsGrid}>
          {TOOLS.map(t => (
            <TouchableOpacity key={t.key} style={s.toolBtn} activeOpacity={0.8}
              onPress={() => {
                if (t.key === 'Currency') setShowConverter(!showConverter);
                else if (t.key === 'SOS') Alert.alert('SOS', 'Sending location...');
                else if (t.key === 'Vault') router.push('/(tabs)/booking');
                else Alert.alert(t.label, 'Coming soon');
              }}>
              <View style={s.toolIconBox}>
                <Text style={s.toolIconText}>{t.icon}</Text>
              </View>
              <Text style={s.toolLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Currency Converter ── */}
        {showConverter && (
          <ClayCard variant="white" style={s.fxCard}>
            <Text style={s.fxTitle}>Live FX</Text>
            <Text style={s.fxSub}>INR to {toCur} real-time</Text>
            <View style={s.fxRow}>
              <View style={s.fxBox}>
                <Text style={s.fxBoxLabel}>FROM (INR)</Text>
                <TextInput style={s.fxInput} value={amount} onChangeText={setAmount}
                  keyboardType="numeric" placeholderTextColor={NC.outlineVariant} />
              </View>
              <TouchableOpacity style={s.fxSwap} onPress={() => { const t = fromCur; setFromCur(toCur); setToCur(t); }}>
                <Text style={s.fxSwapText}>⇄</Text>
              </TouchableOpacity>
              <View style={[s.fxBox, { backgroundColor: NC.surfaceHigh }]}>
                <Text style={s.fxBoxLabel}>TO ({toCur})</Text>
                <Text style={s.fxResult}>{converted}</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {CURRENCIES.slice(0, 8).map(c => (
                <TouchableOpacity key={c.code} onPress={() => setToCur(c.code)}
                  style={[s.fxChip, toCur === c.code && s.fxChipOn]}>
                  <Text style={s.fxChipFlag}>{c.flag}</Text>
                  <Text style={[s.fxChipCode, toCur === c.code && { color: '#fff' }]}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ClayCard>
        )}

        {/* ── Discover ── */}
        <Text style={s.sectionHead}>Discover</Text>
        <ClayCard variant="white" style={s.discoverCard}>
          <Text style={s.discoverTitle}>Weekend Getaways</Text>
          {WEEKEND.map(t => (
            <TouchableOpacity key={t.to} style={s.discoverRow} onPress={() => router.push('/(tabs)/saved')}>
              <View style={[s.discoverDot, { backgroundColor: NC.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.discoverName}>{t.from} → {t.to}</Text>
                <Text style={s.discoverSub}>{t.days}D · {t.tag}</Text>
              </View>
              <Text style={s.discoverCost}>{t.cost}</Text>
            </TouchableOpacity>
          ))}
        </ClayCard>

        {/* ── Family Hub ── */}
        <Text style={s.sectionHead}>Family Hub</Text>
        <ClayCard variant="mint" style={s.familyCard}>
          <View style={s.familyMembers}>
            {members.map((m, i) => (
              <View key={m.id} style={s.familyMember}>
                {/* Leader is bigger */}
                <View style={[
                  s.familyAvatar,
                  m.isLeader ? s.familyAvatarLeader : s.familyAvatarMember,
                ]}>
                  <Text style={[s.familyAvatarText, m.isLeader && { fontSize: 20 }]}>
                    {m.name[0].toUpperCase()}
                  </Text>
                  {m.isLeader && <View style={s.leaderCrown}><Text style={{ fontSize: 8 }}>★</Text></View>}
                </View>
                <View style={s.familyOnline} />
                <Text style={s.familyName}>{m.name.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
          <ClayButton label="Broadcast Next Step" onPress={() => Alert.alert('Sent!', 'Sent to all members')}
            color={NC.primary} small style={{ marginTop: 16 }} />
        </ClayCard>

        {/* ── Group Polls ── */}
        <Text style={s.sectionHead}>Group Polls</Text>
        {POLLS.map((poll, pi) => (
          <ClayCard key={pi} variant="white" style={s.pollCard}>
            <Text style={s.pollQ}>{poll.q}</Text>
            {poll.opts.map((opt, oi) => {
              const key = `${pi}-${oi}`;
              const voted = !!pollVotes[key];
              const total = poll.votes.reduce((a, b) => a + b, 0) + Object.keys(pollVotes).filter(k => k.startsWith(`${pi}-`)).length;
              const pct = total > 0 ? Math.round(((poll.votes[oi] + (voted ? 1 : 0)) / total) * 100) : 0;
              return (
                <TouchableOpacity key={opt} style={[s.pollOpt, voted && s.pollOptVoted]}
                  onPress={() => { if (!pollVotes[key]) setPollVotes(v => ({ ...v, [key]: 1 })); }}>
                  <View style={[s.pollFill, { width: `${pct}%` as any }]} />
                  <Text style={s.pollOptText}>{opt}</Text>
                  <Text style={s.pollPct}>{pct}%</Text>
                </TouchableOpacity>
              );
            })}
          </ClayCard>
        ))}

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  scroll: { paddingHorizontal: 18, paddingTop: 8 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  appName: { fontSize: 26, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: NC.onSurfaceVariant, marginTop: 2, fontWeight: '600' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: NC.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: NC.primaryFixed,
    shadowColor: NC.shadowButton, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8,
  },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#fff' },
  avatarOnline: { position: 'absolute', top: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#fff' },

  // Search tube — hollowed clay tube
  searchTube: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: NC.surfaceLowest, borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 13,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 24, elevation: 8,
    marginBottom: 20, gap: 10,
  },
  searchTubeIcon: { fontSize: 18, color: NC.outline },
  searchInput: { flex: 1, color: NC.onSurface, fontSize: 14, fontWeight: '500' },
  planBtn: {
    backgroundColor: NC.primary, borderRadius: 999,
    paddingHorizontal: 18, paddingVertical: 9,
    shadowColor: NC.shadowButton, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 12, elevation: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  planBtnText: { color: '#fff', fontSize: 13, fontWeight: '900' },

  // Hero card
  heroCard: { marginBottom: 16 },
  heroBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  livePill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  livePillText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  dayPill: { color: NC.primaryFixed, fontSize: 11, fontWeight: '700', alignSelf: 'center' },
  heroBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  heroLeft: { flex: 1 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#fff', lineHeight: 30, marginBottom: 14, letterSpacing: -0.5 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  heroMetaDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
  heroMetaLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(197,248,199,0.75)', letterSpacing: 1.2, marginBottom: 3 },
  heroMetaVal: { fontSize: 20, fontWeight: '900', color: '#fff' },
  heroIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: 'rgba(0,0,0,0.2)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6,
  },
  heroIcon: { fontSize: 40 },
  heroBudgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  heroBudgetLabel: { color: 'rgba(197,248,199,0.8)', fontSize: 11, fontWeight: '700' },

  // Bento grid
  bentoRow: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  bentoHalf: { flex: 1, marginBottom: 16 },
  bentoTileLabel: { fontSize: 10, fontWeight: '800', color: NC.onSurfaceVariant, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },

  // Weather tile
  weatherBig: { fontSize: 32, marginBottom: 4 },
  weatherTemp: { fontSize: 22, fontWeight: '900', color: NC.onSurface },
  weatherCity: { fontSize: 11, fontWeight: '800', color: NC.onSurface, marginTop: 2 },
  weatherCond: { fontSize: 10, color: NC.onSurfaceVariant, marginTop: 1 },

  // Budget tile
  budgetBig: { fontSize: 32, fontWeight: '900', color: NC.primary, marginBottom: 2 },
  budgetSub: { fontSize: 11, color: NC.onSurfaceVariant, marginBottom: 10 },
  budgetRemain: { fontSize: 11, fontWeight: '700', color: NC.primary, marginTop: 6 },

  // SOS tile
  sosCard: { alignItems: 'center', justifyContent: 'center' },
  sosCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#C62828', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: 'rgba(198,40,40,0.5)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8,
    marginBottom: 8,
  },
  sosText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  sosLabel: { fontSize: 13, fontWeight: '900', color: NC.onSurface },
  sosSub: { fontSize: 10, color: NC.onSurfaceVariant, marginTop: 2 },

  // Stats tile
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: NC.surfaceHigh },
  statLabel: { fontSize: 11, color: NC.onSurfaceVariant, fontWeight: '600' },
  statVal: { fontSize: 16, fontWeight: '900', color: NC.primary },

  // Weather strip
  sectionHead: { fontSize: 15, fontWeight: '900', color: NC.onSurface, marginBottom: 12, marginTop: 4, letterSpacing: -0.2 },
  hScroll: { marginBottom: 20 },
  weatherCard: { width: 96, marginRight: 12, alignItems: 'center', padding: 14, marginBottom: 0 },
  weatherCardIcon: { fontSize: 28, marginBottom: 4 },
  weatherCardTemp: { fontSize: 18, fontWeight: '900', color: NC.primary },
  weatherCardCity: { fontSize: 10, fontWeight: '800', color: NC.onSurface, marginTop: 3 },
  weatherCardCond: { fontSize: 9, color: NC.onSurfaceVariant, textAlign: 'center', marginTop: 1 },

  // Tools grid
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  toolBtn: { alignItems: 'center', width: '14%' },
  toolIconBox: {
    width: 52, height: 52, borderRadius: 20,
    backgroundColor: NC.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 6,
    marginBottom: 5,
  },
  toolIconText: { fontSize: 20, color: NC.primary, fontWeight: '900' },
  toolLabel: { fontSize: 9, fontWeight: '700', color: NC.onSurfaceVariant, textAlign: 'center' },

  // FX converter
  fxCard: { marginBottom: 20 },
  fxTitle: { fontSize: 20, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.3 },
  fxSub: { fontSize: 12, color: NC.onSurfaceVariant, marginBottom: 16 },
  fxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fxBox: {
    flex: 1, backgroundColor: NC.surfaceLow, borderRadius: 24, padding: 14,
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  fxBoxLabel: { fontSize: 9, fontWeight: '800', color: NC.onSurfaceVariant, letterSpacing: 1, marginBottom: 4 },
  fxInput: { fontSize: 22, fontWeight: '900', color: NC.onSurface },
  fxResult: { fontSize: 22, fontWeight: '900', color: NC.primary },
  fxSwap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: NC.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: NC.shadowButton, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 5,
  },
  fxSwapText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  fxChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, marginRight: 8,
    backgroundColor: NC.surfaceLow, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
  },
  fxChipOn: { backgroundColor: NC.primary, borderColor: 'rgba(255,255,255,0.4)' },
  fxChipFlag: { fontSize: 14 },
  fxChipCode: { fontSize: 11, fontWeight: '800', color: NC.onSurfaceVariant },

  // Discover
  discoverCard: { marginBottom: 16 },
  discoverTitle: { fontSize: 13, fontWeight: '900', color: NC.onSurface, marginBottom: 12 },
  discoverRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  discoverDot: { width: 8, height: 8, borderRadius: 4 },
  discoverName: { fontSize: 13, fontWeight: '700', color: NC.onSurface },
  discoverSub: { fontSize: 10, color: NC.onSurfaceVariant, marginTop: 1 },
  discoverCost: { fontSize: 13, fontWeight: '900', color: NC.primary },

  // Family hub
  familyCard: { marginBottom: 20 },
  familyMembers: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  familyMember: { alignItems: 'center', position: 'relative' },
  familyAvatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  familyAvatarLeader: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: NC.primary,
    shadowColor: NC.shadowButton, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8,
  },
  familyAvatarMember: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: NC.primaryFixed,
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4,
  },
  familyAvatarText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  leaderCrown: {
    position: 'absolute', top: -8, left: '50%', marginLeft: -8,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#F9A825', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  familyOnline: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#fff' },
  familyName: { fontSize: 9, fontWeight: '700', color: NC.onSurface, marginTop: 4 },

  // Polls
  pollCard: { marginBottom: 12 },
  pollQ: { fontSize: 15, fontWeight: '900', color: NC.onSurface, marginBottom: 12 },
  pollOpt: {
    borderRadius: 20, overflow: 'hidden', backgroundColor: NC.surfaceLow,
    flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
  },
  pollOptVoted: { borderColor: NC.primary, borderWidth: 2 },
  pollFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(46,125,50,0.12)', borderRadius: 20 },
  pollOptText: { flex: 1, color: NC.onSurface, fontSize: 13, fontWeight: '700' },
  pollPct: { color: NC.primary, fontSize: 13, fontWeight: '900' },
});
