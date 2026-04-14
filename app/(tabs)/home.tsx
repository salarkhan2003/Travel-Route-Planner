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

const WEATHER = [
  { city: 'Ajmer', temp: '34°C', icon: '☀', condition: 'Sunny' },
  { city: 'Delhi', temp: '38°C', icon: '◑', condition: 'Partly Cloudy' },
  { city: 'Singapore', temp: '29°C', icon: '☂', condition: 'Showers' },
  { city: 'Guntur', temp: '36°C', icon: '☀', condition: 'Hot & Dry' },
];
const WEEKEND = [
  { from: 'Guntur', to: 'Vizag', days: 2, cost: '₹3,200', tag: 'Beach' },
  { from: 'Delhi', to: 'Agra', days: 1, cost: '₹1,800', tag: 'Heritage' },
  { from: 'Ajmer', to: 'Pushkar', days: 1, cost: '₹800', tag: 'Spiritual' },
];
const GEMS = [
  { name: 'Hampi', state: 'Karnataka', crowd: 'Low', rating: '4.8' },
  { name: 'Ziro Valley', state: 'Arunachal', crowd: 'Very Low', rating: '4.9' },
  { name: 'Mawlynnong', state: 'Meghalaya', crowd: 'Low', rating: '4.7' },
];
const DEALS = [
  { route: 'Guntur → Delhi', type: 'Train 3AC', price: '₹890', drop: '23%' },
  { route: 'Delhi → Singapore', type: 'Flight Economy', price: '₹18,500', drop: '15%' },
  { route: 'Ajmer Hotel', type: 'Budget Hotel', price: '₹1,200/night', drop: '30%' },
];
const TOOLS = [
  { icon: '₹', label: 'Currency' },
  { icon: '⊞', label: 'Vault' },
  { icon: '⚠', label: 'SOS' },
  { icon: '◈', label: 'Translate' },
  { icon: '◎', label: 'Offline' },
  { icon: '☁', label: 'Weather' },
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
  const nextCity = nodes[0]?.city ?? 'Ajmer';
  const budgetPct = Math.min((spentBudget / globalBudget) * 100, 100);

  const converted = (() => {
    const from = CURRENCIES.find((c) => c.code === fromCur);
    const to = CURRENCIES.find((c) => c.code === toCur);
    if (!from || !to) return '0';
    const inr = parseFloat(amount || '0') / from.rateFromINR;
    const result = inr * to.rateFromINR;
    return result >= 1000 ? `${(result / 1000).toFixed(2)}k` : result.toFixed(2);
  })();

  const handleVote = (pi: number, oi: number) => {
    const key = `${pi}-${oi}`;
    if (!pollVotes[key]) setPollVotes((v) => ({ ...v, [key]: 1 }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.greetingSub}>Trip CEO · {members.length} members</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatarBtn}>
            <Text style={styles.avatarIcon}>◉</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchPill}>
          <Text style={styles.searchIconText}>◎</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search cities, routes, hotels..."
            placeholderTextColor="#81C784"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.micBtn} onPress={() => Alert.alert('Voice', 'Listening...')}>
            <Text style={styles.micIcon}>◈</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Trip Card */}
        <ClayCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNum}>3</Text>
              <Text style={styles.countdownLabel}>days to</Text>
              <Text style={styles.countdownCity}>{nextCity}</Text>
            </View>
            <View style={styles.weatherBox}>
              <Text style={styles.weatherIcon}>{WEATHER[0].icon}</Text>
              <Text style={styles.weatherTemp}>{WEATHER[0].temp}</Text>
              <Text style={styles.weatherCond}>{WEATHER[0].condition}</Text>
            </View>
          </View>
          <View style={styles.heroButtons}>
            <TouchableOpacity style={[styles.heroBtn, { backgroundColor: '#A5D6A7' }]}
              onPress={() => router.push('/(tabs)/booking')}>
              <Text style={styles.heroBtnText}>View Train QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.heroBtn, { backgroundColor: '#C8E6C9' }]}
              onPress={() => Alert.alert('Hotel', 'Opening check-in...')}>
              <Text style={styles.heroBtnText}>Hotel Check-in</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetText}>{fmtFull(spentBudget)} of {fmtFull(globalBudget)}</Text>
            <Text style={styles.budgetPct}>{budgetPct.toFixed(0)}%</Text>
          </View>
          <View style={styles.budgetTrack}>
            <View style={[styles.budgetFill, {
              width: `${budgetPct}%` as any,
              backgroundColor: budgetPct > 80 ? '#FF7043' : '#4CAF50',
            }]} />
          </View>
        </ClayCard>

        {/* Weather Strip */}
        <Text style={styles.sectionHead}>Route Weather</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hRow}>
          {WEATHER.map((w) => (
            <ClayCard key={w.city} style={styles.weatherCard}>
              <Text style={styles.weatherCardIcon}>{w.icon}</Text>
              <Text style={styles.weatherCardCity}>{w.city}</Text>
              <Text style={styles.weatherCardTemp}>{w.temp}</Text>
              <Text style={styles.weatherCardCond}>{w.condition}</Text>
            </ClayCard>
          ))}
        </ScrollView>

        {/* Tools */}
        <Text style={styles.sectionHead}>Traveller Tools</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hRow}>
          {TOOLS.map((t) => (
            <TouchableOpacity key={t.label} style={styles.toolBtn}
              onPress={() => {
                if (t.label === 'Currency') setShowConverter(!showConverter);
                else if (t.label === 'SOS') Alert.alert('SOS', 'Sending location to family...');
                else if (t.label === 'Vault') router.push('/(tabs)/booking');
                else Alert.alert(t.label, 'Coming soon');
              }}>
              <View style={styles.toolIconBox}>
                <Text style={styles.toolIconText}>{t.icon}</Text>
              </View>
              <Text style={styles.toolLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Currency Converter */}
        {showConverter && (
          <ClayCard style={styles.converterCard}>
            <Text style={styles.converterTitle}>Currency Converter</Text>
            <View style={styles.converterRow}>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.converterInput} value={amount}
                  onChangeText={setAmount} keyboardType="numeric" placeholderTextColor="#81C784" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CURRENCIES.slice(0, 5).map((c) => (
                    <TouchableOpacity key={c.code} onPress={() => setFromCur(c.code)}
                      style={[styles.curChip, fromCur === c.code && styles.curChipOn]}>
                      <Text style={[styles.curChipText, fromCur === c.code && { color: '#FFF' }]}>{c.code}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <Text style={styles.converterArrow}>→</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.converterResult}>{converted}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CURRENCIES.slice(0, 5).map((c) => (
                    <TouchableOpacity key={c.code} onPress={() => setToCur(c.code)}
                      style={[styles.curChip, toCur === c.code && styles.curChipOn]}>
                      <Text style={[styles.curChipText, toCur === c.code && { color: '#FFF' }]}>{c.code}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </ClayCard>
        )}

        {/* Bento Grid */}
        <Text style={styles.sectionHead}>Discover</Text>
        <ClayCard style={styles.bentoCard}>
          <Text style={styles.bentoTitle}>Weekend Getaways</Text>
          {WEEKEND.map((t) => (
            <TouchableOpacity key={t.to} style={styles.bentoRow} onPress={() => router.push('/(tabs)/saved')}>
              <View style={styles.bentoDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bentoName}>{t.from} → {t.to}</Text>
                <Text style={styles.bentoSub}>{t.days}D · {t.tag}</Text>
              </View>
              <Text style={styles.bentoCost}>{t.cost}</Text>
            </TouchableOpacity>
          ))}
        </ClayCard>

        <View style={styles.halfRow}>
          <ClayCard style={styles.halfCard}>
            <Text style={styles.bentoTitle}>Hidden Gems</Text>
            {GEMS.slice(0, 2).map((g) => (
              <View key={g.name} style={styles.gemRow}>
                <View style={[styles.bentoDot, { backgroundColor: '#9C27B0' }]} />
                <View>
                  <Text style={styles.gemName}>{g.name}</Text>
                  <Text style={styles.gemSub}>{g.crowd} crowd</Text>
                </View>
              </View>
            ))}
          </ClayCard>
          <ClayCard style={styles.halfCard}>
            <Text style={styles.bentoTitle}>Hot Deals</Text>
            {DEALS.slice(0, 2).map((d) => (
              <View key={d.route} style={styles.dealRow}>
                <Text style={styles.dealRoute}>{d.route}</Text>
                <View style={styles.dealBadge}>
                  <Text style={styles.dealDrop}>↓{d.drop}</Text>
                </View>
                <Text style={styles.dealPrice}>{d.price}</Text>
              </View>
            ))}
          </ClayCard>
        </View>

        {/* Family War Room */}
        <Text style={styles.sectionHead}>Family War Room</Text>
        <ClayCard style={styles.warCard}>
          <View style={styles.warMembers}>
            {members.map((m) => (
              <View key={m.id} style={styles.warMember}>
                <View style={[styles.warAvatar, { backgroundColor: m.isLeader ? '#4CAF50' : '#A5D6A7' }]}>
                  <Text style={styles.warAvatarText}>{m.name[0]}</Text>
                </View>
                <View style={[styles.warOnline, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.warName}>{m.name.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
          <ClayButton label="Broadcast Next Step" onPress={() => Alert.alert('Sent!', 'Train in 10 mins — sent to all')}
            color="#C8E6C9" small style={{ marginTop: 12 }} />
        </ClayCard>

        {/* Polls */}
        <Text style={styles.sectionHead}>Group Polls</Text>
        {POLLS.map((poll, pi) => (
          <ClayCard key={pi} style={styles.pollCard}>
            <Text style={styles.pollQ}>{poll.q}</Text>
            {poll.opts.map((opt, oi) => {
              const key = `${pi}-${oi}`;
              const voted = !!pollVotes[key];
              const total = poll.votes.reduce((a, b) => a + b, 0) + Object.keys(pollVotes).filter(k => k.startsWith(`${pi}-`)).length;
              const pct = total > 0 ? Math.round(((poll.votes[oi] + (voted ? 1 : 0)) / total) * 100) : 0;
              return (
                <TouchableOpacity key={opt} style={[styles.pollOpt, voted && styles.pollOptVoted]}
                  onPress={() => handleVote(pi, oi)}>
                  <View style={[styles.pollFill, { width: `${pct}%` as any }]} />
                  <Text style={styles.pollOptText}>{opt}</Text>
                  <Text style={styles.pollPct}>{pct}%</Text>
                </TouchableOpacity>
              );
            })}
          </ClayCard>
        ))}

        {/* Expense Snap */}
        <ClayCard style={styles.snapCard}>
          <View style={styles.snapRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.snapTitle}>Expense Snap</Text>
              <Text style={styles.snapSub}>Snap a bill → split among {members.length} members</Text>
            </View>
            <TouchableOpacity style={styles.snapBtn}
              onPress={() => Alert.alert('Camera', 'Opening camera...')}>
              <Text style={styles.snapBtnIcon}>◈</Text>
            </TouchableOpacity>
          </View>
        </ClayCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  scroll: { padding: 20, paddingTop: 8 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  greeting: { fontSize: 26, fontWeight: '900', color: '#1B5E20', letterSpacing: -0.5 },
  greetingSub: { fontSize: 12, color: '#558B2F', marginTop: 2, fontWeight: '600' },
  avatarBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#C8E6C9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: '#FFF',
    shadowColor: 'rgba(76,175,80,0.35)', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 6,
  },
  avatarIcon: { fontSize: 22, color: '#2E7D32', fontWeight: '900' },

  searchPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F8F2', borderRadius: 50,
    paddingHorizontal: 20, paddingVertical: 14,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.3)', shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 14, elevation: 6,
    marginBottom: 18, gap: 12,
  },
  searchIconText: { fontSize: 18, color: '#81C784' },
  searchInput: { flex: 1, color: '#1B5E20', fontSize: 14, fontWeight: '500' },
  micBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#A5D6A7', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
  },
  micIcon: { fontSize: 16, color: '#1B5E20' },

  heroCard: { marginBottom: 20 },
  heroTop: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  countdownBox: {
    flex: 1, backgroundColor: '#C8E6C9', borderRadius: 22,
    padding: 18, alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.25)', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 4,
  },
  countdownNum: { fontSize: 48, fontWeight: '900', color: '#1B5E20', lineHeight: 52 },
  countdownLabel: { fontSize: 11, color: '#558B2F', fontWeight: '600' },
  countdownCity: { fontSize: 16, fontWeight: '800', color: '#2E7D32', marginTop: 2 },
  weatherBox: {
    width: 110, backgroundColor: '#DCEDC8', borderRadius: 22,
    padding: 14, alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.25)', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 4,
  },
  weatherIcon: { fontSize: 32, color: '#F57F17' },
  weatherTemp: { fontSize: 20, fontWeight: '900', color: '#1B5E20', marginTop: 4 },
  weatherCond: { fontSize: 10, color: '#558B2F', fontWeight: '600', textAlign: 'center' },
  heroButtons: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  heroBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 20, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(76,175,80,0.2)', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 3,
  },
  heroBtnText: { color: '#1B5E20', fontSize: 13, fontWeight: '800' },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  budgetText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },
  budgetPct: { color: '#558B2F', fontSize: 12, fontWeight: '700' },
  budgetTrack: { height: 8, backgroundColor: '#C8E6C9', borderRadius: 4, overflow: 'hidden' },
  budgetFill: { height: '100%', borderRadius: 4 },

  sectionHead: { fontSize: 16, fontWeight: '900', color: '#1B5E20', marginBottom: 12, marginTop: 4, letterSpacing: -0.3 },
  hRow: { marginBottom: 20 },

  weatherCard: { width: 96, marginRight: 10, alignItems: 'center', padding: 14 },
  weatherCardIcon: { fontSize: 28, color: '#F57F17' },
  weatherCardCity: { color: '#1B5E20', fontSize: 11, fontWeight: '800', marginTop: 6 },
  weatherCardTemp: { color: '#2E7D32', fontSize: 18, fontWeight: '900' },
  weatherCardCond: { color: '#558B2F', fontSize: 9, fontWeight: '600', textAlign: 'center' },

  toolBtn: { alignItems: 'center', marginRight: 14 },
  toolIconBox: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: '#F1F8F2', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.3)', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 5,
    marginBottom: 6,
  },
  toolIconText: { fontSize: 22, color: '#2E7D32', fontWeight: '900' },
  toolLabel: { color: '#2E7D32', fontSize: 10, fontWeight: '700' },

  converterCard: { marginBottom: 20 },
  converterTitle: { color: '#1B5E20', fontSize: 15, fontWeight: '900', marginBottom: 14 },
  converterRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  converterInput: {
    backgroundColor: '#C8E6C9', borderRadius: 16, padding: 12,
    color: '#1B5E20', fontSize: 22, fontWeight: '900', marginBottom: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
  },
  converterResult: { color: '#1B5E20', fontSize: 24, fontWeight: '900', padding: 12, marginBottom: 8 },
  converterArrow: { color: '#4CAF50', fontSize: 22, fontWeight: '900' },
  curChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
    backgroundColor: '#C8E6C9', marginRight: 6,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
  },
  curChipOn: { backgroundColor: '#4CAF50' },
  curChipText: { color: '#1B5E20', fontSize: 11, fontWeight: '800' },

  bentoCard: { marginBottom: 12 },
  bentoTitle: { color: '#1B5E20', fontSize: 13, fontWeight: '900', marginBottom: 12, letterSpacing: -0.2 },
  bentoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  bentoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50' },
  bentoName: { color: '#1B5E20', fontSize: 13, fontWeight: '700' },
  bentoSub: { color: '#558B2F', fontSize: 10, marginTop: 1 },
  bentoCost: { color: '#2E7D32', fontSize: 13, fontWeight: '900' },
  halfRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  halfCard: { flex: 1, padding: 14 },
  gemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  gemName: { color: '#1B5E20', fontSize: 12, fontWeight: '700' },
  gemSub: { color: '#558B2F', fontSize: 9 },
  dealRow: { marginBottom: 8 },
  dealRoute: { color: '#558B2F', fontSize: 10, fontWeight: '600' },
  dealBadge: { backgroundColor: '#C8E6C9', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginVertical: 2 },
  dealDrop: { color: '#2E7D32', fontSize: 10, fontWeight: '900' },
  dealPrice: { color: '#1B5E20', fontSize: 13, fontWeight: '900' },

  warCard: { marginBottom: 20 },
  warMembers: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  warMember: { alignItems: 'center', position: 'relative' },
  warAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  warAvatarText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  warOnline: { width: 12, height: 12, borderRadius: 6, position: 'absolute', top: 0, right: 0, borderWidth: 2, borderColor: '#FFF' },
  warName: { color: '#1B5E20', fontSize: 9, fontWeight: '700', marginTop: 4 },

  pollCard: { marginBottom: 12 },
  pollQ: { color: '#1B5E20', fontSize: 15, fontWeight: '900', marginBottom: 12 },
  pollOpt: {
    borderRadius: 16, overflow: 'hidden', backgroundColor: '#C8E6C9',
    flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
  },
  pollOptVoted: { borderColor: '#4CAF50', borderWidth: 2 },
  pollFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(76,175,80,0.25)', borderRadius: 16 },
  pollOptText: { flex: 1, color: '#1B5E20', fontSize: 13, fontWeight: '700' },
  pollPct: { color: '#2E7D32', fontSize: 13, fontWeight: '900' },

  snapCard: { marginBottom: 12 },
  snapRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  snapTitle: { color: '#1B5E20', fontSize: 16, fontWeight: '900' },
  snapSub: { color: '#558B2F', fontSize: 11, marginTop: 4, fontWeight: '600' },
  snapBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#A5D6A7', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.35)', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 6,
  },
  snapBtnIcon: { fontSize: 28, color: '#1B5E20' },
});
