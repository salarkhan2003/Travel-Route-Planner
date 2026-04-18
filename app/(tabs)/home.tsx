/**
 * HomeScreen — Nomad Canvas Claymorphism
 * 
 * ✦ Bento grid with inflated pillow clay cards
 * ✦ Liquid progress bars with glass sheen
 * ✦ 3D clay icons and avatars
 * ✦ All elements: double shadow, ultra-rounded, inner sheen
 */
import React, { useRef, useState } from 'react';
import {
  Alert, Animated, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore } from '../../src/store/toastStore';
import { ClayCard } from '../../src/components/clay/ClayCard';
import { ClayButton } from '../../src/components/clay/ClayButton';
import { useTripStore } from '../../src/store/tripStore';
import { useFamilyStore } from '../../src/store/familyStore';
import { CURRENCIES } from '../../src/constants/currencies';
import { useCurrency } from '../../src/hooks/useCurrency';
import { NC } from '../../src/constants/theme';

const WEATHER = [
  { city: 'Ajmer', temp: '34C', cond: 'Sunny', icon: '☀️' },
  { city: 'Delhi', temp: '38C', cond: 'Cloudy', icon: '⛅' },
  { city: 'Singapore', temp: '29C', cond: 'Showers', icon: '🌧️' },
  { city: 'Goa', temp: '31C', cond: 'Breezy', icon: '🌤️' },
];
const TOOLS = [
  { key: 'Currency', label: 'FX', icon: 'cash-outline' },
  { key: 'SOS', label: 'SOS', icon: 'warning-outline' },
  { key: 'Vault', label: 'Vault', icon: 'lock-closed-outline' },
  { key: 'Offline', label: 'Maps', icon: 'map-outline' },
  { key: 'Weather', label: 'Weather', icon: 'partly-sunny-outline' },
  { key: 'Translate', label: 'Translate', icon: 'language-outline' },
];
const POLLS = [
  { q: 'Dinner tonight?', opts: ['Taj Cafe', 'Local Dhaba'], votes: [3, 5] },
  { q: 'Next stop?', opts: ['Pushkar', 'Jaipur'], votes: [4, 4] },
];

const getWeatherIcon = (main: string) => {
  if (main.includes('Cloud')) return '⛅';
  if (main.includes('Rain')) return '🌧️';
  if (main.includes('Clear')) return '☀️';
  return '🌤️';
};
const WEEKEND = [
  { from: 'Guntur', to: 'Goa', days: 3, cost: '₹4,200', tag: 'Beach' },
  { from: 'Delhi', to: 'Agra', days: 1, cost: '₹1,800', tag: 'Heritage' },
  { from: 'Ajmer', to: 'Pushkar', days: 1, cost: '₹800', tag: 'Spiritual' },
];

// ── Liquid Progress Bar — Glassmorphic clay gauge ─────────────────────────────
function LiquidBar({ pct, color = NC.primary }: { pct: number; color?: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false, damping: 14, stiffness: 60 }).start();
  }, [pct]);
  const w = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={lb.track}>
      <Animated.View style={[lb.fill, { width: w as any, backgroundColor: color }]}>
        {/* Liquid sheen — glass highlight on fill */}
        <View style={lb.sheen} />
      </Animated.View>
    </View>
  );
}
const lb = StyleSheet.create({
  track: {
    height: 16, borderRadius: 999, backgroundColor: '#DCF0DE',
    overflow: 'hidden',
    // Concave (sunken) border for gauge track
    borderWidth: 1.5, borderColor: 'rgba(165,214,167,0.5)',
    borderTopColor: 'rgba(27,94,32,0.08)',
    borderLeftColor: 'rgba(27,94,32,0.06)',
    shadowColor: 'rgba(165,214,167,0.25)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
  },
  fill: { height: '100%', borderRadius: 999 },
  sheen: {
    position: 'absolute', top: 2, left: 8, right: 8, height: 5,
    backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 999,
  },
});

// ── 3D Clay Icon — inflated sphere ────────────────────────────────────────────
function ClayIcon({ icon, bg, size = 54 }: { icon: string; bg: string; size?: number }) {
  return (
    <View style={[ci.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <View style={[ci.sheen, { borderTopLeftRadius: size / 2, borderTopRightRadius: size / 2 }]} />
      <Text style={[ci.icon, { fontSize: size * 0.42 }]}>{icon}</Text>
    </View>
  );
}
const ci = StyleSheet.create({
  wrap: {
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)',
    borderBottomColor: 'rgba(165,214,167,0.35)',
    borderRightColor: 'rgba(165,214,167,0.25)',
    shadowColor: 'rgba(27,94,32,0.3)', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  sheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  icon: { lineHeight: undefined, zIndex: 1 },
});

export default function HomeScreen() {
  const router = useRouter();
  const showToast = useToastStore(s => s.showToast);
  const nodes = useTripStore(s => s.nodes);
  const spentBudget = useTripStore(s => s.spentBudget);
  const globalBudget = useTripStore(s => s.globalBudget);
  const homeCity = useTripStore(s => s.homeCity);
  const setHomeCity = useTripStore(s => s.setHomeCity);
  const members = useFamilyStore(s => s.members);
  const { fmtFull } = useCurrency();
  const [search, setSearch] = useState('');
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({});
  const [fromCur, setFromCur] = useState('INR');
  const [toCur, setToCur] = useState('SGD');
  const [amount, setAmount] = useState('1000');
  const [showConverter, setShowConverter] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);
  const [transInput, setTransInput] = useState('');
  const [editingCity, setEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState('');

  const [liveWeather, setLiveWeather] = useState({ temp: 0, cond: 'Loading...', icon: '🌤️' });
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [fxLoading, setFxLoading] = useState(false);

  const budgetPct = Math.min((spentBudget / globalBudget) * 100, 100);
  const leader = members.find(m => m.isLeader);

  React.useEffect(() => {
    const fetchWeather = async () => {
      setIsWeatherLoading(true);
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${homeCity}&appid=a3ba69974a7a2b7f8274f24b5c162d6c&units=metric`);
        const data = await res.json();
        if (data && data.main) {
          setLiveWeather({
            temp: Math.round(data.main.temp),
            cond: data.weather[0].main,
            icon: getWeatherIcon(data.weather[0].main)
          });
        }
      } catch (err) {
        showToast('Weather fetch failed', 'warning');
      }
      setIsWeatherLoading(false);
    };
    fetchWeather();
  }, [homeCity]);

  React.useEffect(() => {
    const fetchFX = async () => {
      setFxLoading(true);
      try {
        const res = await fetch(`https://v6.exchangerate-api.com/v6/85baa469c95ec068ea15fc25/latest/${fromCur}`);
        const data = await res.json();
        if (data && data.conversion_rates && data.conversion_rates[toCur]) {
          setExchangeRate(data.conversion_rates[toCur]);
        }
      } catch (err) {
        showToast('Live FX failed', 'warning');
      }
      setFxLoading(false);
    };
    fetchFX();
  }, [fromCur, toCur]);

  const converted = (() => {
    const result = parseFloat(amount || '0') * exchangeRate;
    return result >= 1000 ? `${(result / 1000).toFixed(2)}k` : result.toFixed(2);
  })();

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            {/* Clay logo circle */}
            <View style={s.logoCircle}>
              <View style={s.logoSheen} />
              <Text style={s.logoText}>R</Text>
            </View>
            <View>
              <Text style={s.appName}>Roamio</Text>
              <Text style={s.sub}>Trip CEO · {members.length} members</Text>
            </View>
          </View>
          {/* Clay avatar */}
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={s.avatar}>
            <View style={s.avatarSheen} />
            <Text style={s.avatarText}>{(leader?.name?.[0] ?? 'T').toUpperCase()}</Text>
            <View style={s.avatarOnline} />
          </TouchableOpacity>
        </View>

        {/* ── Clay Search Tube — sunken ditch ── */}
        <View style={s.searchTube}>
          <Ionicons name="search-outline" size={18} color="#7CB87F" />
          <TextInput
            style={s.searchInput}
            placeholder="Where to next, traveller..."
            placeholderTextColor={NC.outlineVariant}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={s.planBtn} onPress={() => router.push('/(tabs)/explore')}>
            <View style={s.planBtnSheen} />
            <Text style={s.planBtnText}>Plan</Text>
          </TouchableOpacity>
        </View>

        {/* ── BENTO GRID ── */}

        {/* Hero card — large trip tile */}
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
              <View style={s.heroIconSheen} />
              <Ionicons name="train" size={42} color="#fff" style={{ zIndex: 1 }} />
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
          <ClayCard variant="mint" style={s.bentoHalf}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.bentoTileLabel}>Weather</Text>
              <TouchableOpacity onPress={() => setIsWeatherLoading(!isWeatherLoading)}>
                <Ionicons name="refresh" size={14} color={NC.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={s.weatherBig}>{liveWeather.icon}</Text>
                <Text style={s.weatherTemp}>{liveWeather.temp}°C</Text>
              </View>
            </View>
            
            {editingCity ? (
              <TextInput autoFocus style={s.weatherCityEdit} value={cityInput} onChangeText={setCityInput}
                onSubmitEditing={() => { setHomeCity(cityInput || 'Ajmer'); setEditingCity(false); }} onBlur={() => setEditingCity(false)} />
            ) : (
              <TouchableOpacity onPress={() => { setCityInput(homeCity); setEditingCity(true); }}>
                <Text style={[s.weatherCity, { textDecorationLine: 'underline' }]}>{homeCity}</Text>
              </TouchableOpacity>
            )}
            
            <Text style={s.weatherCond}>{liveWeather.cond}</Text>
          </ClayCard>
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
          <TouchableOpacity onPress={() => showToast('SOS: Location Broadcasted!', 'warning')} activeOpacity={0.85}>
            <ClayCard variant="white" style={[s.bentoHalf, s.sosCard]}>
              <View style={s.sosCircle}>
                <View style={s.sosSheen} />
                <Ionicons name="warning" size={24} color="#fff" style={{ zIndex: 1 }} />
              </View>
              <Text style={s.sosLabel}>Quick SOS</Text>
              <Text style={s.sosSub}>Tap to alert family</Text>
            </ClayCard>
          </TouchableOpacity>
          <ClayCard variant="mint" style={s.bentoHalf}>
            <Text style={s.bentoTileLabel}>Trip Stats</Text>
            {[
              { label: 'Cities', val: nodes.length || 3 },
              { label: 'Members', val: members.length },
              { label: 'Days', val: 9 },
            ].map(stat => (
              <View key={stat.label} style={s.statRow}>
                <Text style={s.statLabel}>{stat.label}</Text>
                <Text style={s.statVal}>{stat.val}</Text>
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
                else if (t.key === 'Translate') setShowTranslator(true);
                else if (t.key === 'SOS') showToast('Location transmitted', 'radio');
                else if (t.key === 'Vault') router.push('/(tabs)/booking');
                else if (t.key === 'Weather') setEditingCity(true);
                else showToast(`${t.label} Coming Soon`, 'construct');
              }}>
              <View style={s.toolIconBox}>
                <View style={s.toolIconSheen} />
                <Ionicons name={t.icon as any} size={24} color="#1B5E20" style={{ zIndex: 1 }} />
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
                <Text style={s.fxBoxLabel}>FROM ({fromCur})</Text>
                <TextInput style={s.fxInput} value={amount} onChangeText={setAmount}
                  keyboardType="numeric" placeholderTextColor={NC.outlineVariant} />
              </View>
              <TouchableOpacity style={s.fxSwap} onPress={() => { const t = fromCur; setFromCur(toCur); setToCur(t); }}>
                <View style={s.fxSwapSheen} />
                {fxLoading ? <ActivityIndicator color="#fff" /> : <Ionicons name="swap-horizontal" size={24} color="#fff" style={{ zIndex: 1 }} />}
              </TouchableOpacity>
              <View style={[s.fxBox, { backgroundColor: '#DCF0DE' }]}>
                <Text style={s.fxBoxLabel}>TO ({toCur})</Text>
                <Text style={s.fxResult}>{converted}</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
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
                <View style={[
                  s.familyAvatar,
                  m.isLeader ? s.familyAvatarLeader : s.familyAvatarMember,
                ]}>
                  <View style={[s.familyAvatarSheen, { borderTopLeftRadius: m.isLeader ? 30 : 22, borderTopRightRadius: m.isLeader ? 30 : 22 }]} />
                  <Text style={[s.familyAvatarText, m.isLeader && { fontSize: 22 }]}>
                    {m.name[0].toUpperCase()}
                  </Text>
                  {m.isLeader && <View style={s.leaderCrown}><Text style={{ fontSize: 8 }}>★</Text></View>}
                </View>
                <View style={s.familyOnline} />
                <Text style={s.familyName}>{m.name.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
          <ClayButton label="Broadcast Next Step" onPress={() => showToast('Next step sent to family', 'radio')}
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

        {/* ── Translator Modal ── */}
        <Modal visible={showTranslator} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, height: '60%', padding: 26 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: NC.primary }}>ML Translator</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: NC.onSurfaceVariant }}>Powered by On-Device ML Kit</Text>
                </View>
                <TouchableOpacity onPress={() => setShowTranslator(false)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: NC.surfaceLow, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close" size={24} color={NC.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <TextInput 
                style={{ backgroundColor: NC.surfaceLowest, borderWidth: 2, borderColor: 'rgba(165,214,167,0.3)', borderRadius: 20, padding: 16, fontSize: 16, color: NC.onSurface, fontWeight: '700', minHeight: 100, textAlignVertical: 'top' }} 
                placeholder="Tap to speak or type in any language..." 
                multiline value={transInput} onChangeText={setTransInput} 
              />
              
              <ClayButton label="Translate to Local" onPress={() => showToast('ML Translation complete', 'construct')} color={NC.primary} style={{ marginTop: 16 }} />
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  scroll: { paddingHorizontal: 18, paddingTop: 8 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  
  // Clay logo circle — inflated sphere
  logoCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: NC.primary, alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    borderRightColor: 'rgba(27,94,32,0.2)',
    shadowColor: 'rgba(27,94,32,0.4)', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  logoSheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(255,255,255,0.3)', borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  logoText: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5, zIndex: 1 },
  appName: { fontSize: 24, fontWeight: '900', color: '#1B5E20', letterSpacing: -0.5 },
  sub: { fontSize: 12, color: NC.onSurfaceVariant, marginTop: 2, fontWeight: '600' },
  
  // Clay avatar — inflated sphere
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: NC.primary, alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(27,94,32,0.25)',
    borderRightColor: 'rgba(27,94,32,0.2)',
    shadowColor: 'rgba(27,94,32,0.4)', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 14, elevation: 10,
  },
  avatarSheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(255,255,255,0.3)', borderTopLeftRadius: 25, borderTopRightRadius: 25,
  },
  avatarText: { fontSize: 22, fontWeight: '900', color: '#fff', zIndex: 1 },
  avatarOnline: { position: 'absolute', top: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#fff', zIndex: 2 },

  // Search tube — sunken/concave clay ditch
  searchTube: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#DCF0DE', borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 14,
    // Concave border — darker on top/left (sunken into surface)
    borderWidth: 2, borderColor: 'rgba(165,214,167,0.5)',
    borderTopColor: 'rgba(27,94,32,0.08)',
    borderLeftColor: 'rgba(27,94,32,0.06)',
    shadowColor: 'rgba(165,214,167,0.25)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 3,
    marginBottom: 22, gap: 10,
  },
  searchTubeIcon: { fontSize: 18, color: NC.outline },
  searchInput: { flex: 1, color: NC.onSurface, fontSize: 15, fontWeight: '600' },
  planBtn: {
    backgroundColor: NC.primary, borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 10,
    position: 'relative', overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    borderTopColor: 'rgba(255,255,255,0.7)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    shadowColor: 'rgba(27,94,32,0.4)', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 6,
  },
  planBtnSheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
    backgroundColor: 'rgba(255,255,255,0.15)', borderTopLeftRadius: 999, borderTopRightRadius: 999,
  },
  planBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', zIndex: 1 },

  // Hero card
  heroCard: { marginBottom: 16 },
  heroBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  livePill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  livePillText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  dayPill: { color: NC.primaryFixed, fontSize: 12, fontWeight: '700', alignSelf: 'center' },
  heroBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  heroLeft: { flex: 1 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 32, marginBottom: 14, letterSpacing: -0.5 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  heroMetaDivider: { width: 1.5, height: 34, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 18 },
  heroMetaLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(197,248,199,0.75)', letterSpacing: 1.2, marginBottom: 3 },
  heroMetaVal: { fontSize: 22, fontWeight: '900', color: '#fff' },
  
  // 3D hero icon — inflated sphere
  heroIconWrap: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.35)',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderRightColor: 'rgba(0,0,0,0.08)',
    shadowColor: 'rgba(0,0,0,0.25)', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  heroIconSheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(255,255,255,0.2)', borderTopLeftRadius: 42, borderTopRightRadius: 42,
  },
  heroIcon: { fontSize: 42, zIndex: 1 },
  heroBudgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  heroBudgetLabel: { color: 'rgba(197,248,199,0.8)', fontSize: 12, fontWeight: '700' },

  // Bento grid
  bentoRow: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  bentoHalf: { flex: 1, marginBottom: 16 },
  bentoTileLabel: { fontSize: 10, fontWeight: '800', color: NC.onSurfaceVariant, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },

  // Weather tile
  weatherCityEdit: { fontSize: 13, borderBottomWidth: 1, borderBottomColor: '#1B5E20', color: '#1B5E20', fontWeight: '800', paddingVertical: 2, marginTop: 2, minWidth: 60 },
  weatherBig: { fontSize: 34, marginBottom: 4 },
  weatherTemp: { fontSize: 24, fontWeight: '900', color: NC.onSurface },
  weatherCity: { fontSize: 12, fontWeight: '800', color: NC.onSurface, marginTop: 2 },
  weatherCond: { fontSize: 11, color: NC.onSurfaceVariant, marginTop: 1 },

  // Budget tile
  budgetBig: { fontSize: 34, fontWeight: '900', color: NC.primary, marginBottom: 2 },
  budgetSub: { fontSize: 12, color: NC.onSurfaceVariant, marginBottom: 10 },
  budgetRemain: { fontSize: 12, fontWeight: '700', color: NC.primary, marginTop: 6 },

  // SOS tile
  sosCard: { alignItems: 'center', justifyContent: 'center' },
  sosCircle: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#C62828', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(198,40,40,0.5)',
    borderRightColor: 'rgba(198,40,40,0.4)',
    shadowColor: 'rgba(198,40,40,0.5)', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 14, elevation: 10,
    marginBottom: 8,
  },
  sosSheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(255,255,255,0.25)', borderTopLeftRadius: 34, borderTopRightRadius: 34,
  },
  sosText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1, zIndex: 1 },
  sosLabel: { fontSize: 14, fontWeight: '900', color: NC.onSurface },
  sosSub: { fontSize: 10, color: NC.onSurfaceVariant, marginTop: 2 },

  // Stats tile
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(165,214,167,0.2)' },
  statLabel: { fontSize: 12, color: NC.onSurfaceVariant, fontWeight: '600' },
  statVal: { fontSize: 18, fontWeight: '900', color: NC.primary },

  // Weather strip
  sectionHead: { fontSize: 16, fontWeight: '900', color: NC.onSurface, marginBottom: 14, marginTop: 6, letterSpacing: -0.2 },
  hScroll: { marginBottom: 20 },
  weatherCard: { width: 100, marginRight: 12, alignItems: 'center', padding: 16, marginBottom: 0 },
  weatherCardIcon: { fontSize: 30, marginBottom: 4 },
  weatherCardTemp: { fontSize: 20, fontWeight: '900', color: NC.primary },
  weatherCardCity: { fontSize: 11, fontWeight: '800', color: NC.onSurface, marginTop: 3 },
  weatherCardCond: { fontSize: 10, color: NC.onSurfaceVariant, textAlign: 'center', marginTop: 1 },

  // Tools grid — 3D clay icon boxes
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  toolBtn: { alignItems: 'center', width: '14%' },
  toolIconBox: {
    width: 56, height: 56, borderRadius: 22,
    backgroundColor: NC.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.4)',
    borderRightColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 14, elevation: 8,
    marginBottom: 5,
  },
  toolIconSheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(255,255,255,0.25)', borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  toolIconText: { fontSize: 22, color: NC.primary, fontWeight: '900', zIndex: 1 },
  toolLabel: { fontSize: 10, fontWeight: '700', color: NC.onSurfaceVariant, textAlign: 'center' },

  // FX converter
  fxCard: { marginBottom: 20 },
  fxTitle: { fontSize: 22, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.3 },
  fxSub: { fontSize: 12, color: NC.onSurfaceVariant, marginBottom: 16 },
  fxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fxBox: {
    flex: 1, backgroundColor: '#F1F8F2', borderRadius: 28, padding: 16,
    // Concave (sunken) look
    borderWidth: 1.5, borderColor: 'rgba(165,214,167,0.4)',
    borderTopColor: 'rgba(27,94,32,0.06)',
    borderLeftColor: 'rgba(27,94,32,0.04)',
    shadowColor: 'rgba(165,214,167,0.2)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  fxBoxLabel: { fontSize: 9, fontWeight: '800', color: NC.onSurfaceVariant, letterSpacing: 1, marginBottom: 4 },
  fxInput: { fontSize: 24, fontWeight: '900', color: NC.onSurface },
  fxResult: { fontSize: 24, fontWeight: '900', color: NC.primary },
  fxSwap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: NC.primary,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    borderTopColor: 'rgba(255,255,255,0.7)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    shadowColor: 'rgba(27,94,32,0.4)', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 6,
  },
  fxSwapSheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(255,255,255,0.2)', borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  fxSwapText: { color: '#fff', fontSize: 20, fontWeight: '900', zIndex: 1 },
  fxChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginRight: 8,
    backgroundColor: '#F1F8F2',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    borderRightColor: 'rgba(165,214,167,0.2)',
    shadowColor: 'rgba(165,214,167,0.3)', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3,
  },
  fxChipOn: { backgroundColor: NC.primary, borderColor: 'rgba(255,255,255,0.4)' },
  fxChipFlag: { fontSize: 15 },
  fxChipCode: { fontSize: 12, fontWeight: '800', color: NC.onSurfaceVariant },

  // Discover
  discoverCard: { marginBottom: 16 },
  discoverTitle: { fontSize: 14, fontWeight: '900', color: NC.onSurface, marginBottom: 14 },
  discoverRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  discoverDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' },
  discoverName: { fontSize: 14, fontWeight: '700', color: NC.onSurface },
  discoverSub: { fontSize: 11, color: NC.onSurfaceVariant, marginTop: 1 },
  discoverCost: { fontSize: 14, fontWeight: '900', color: NC.primary },

  // Family hub
  familyCard: { marginBottom: 20 },
  familyMembers: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  familyMember: { alignItems: 'center', position: 'relative' },
  familyAvatar: { alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  familyAvatarLeader: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: NC.primary,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    borderRightColor: 'rgba(27,94,32,0.2)',
    shadowColor: 'rgba(27,94,32,0.4)', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 10,
  },
  familyAvatarMember: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: NC.primaryFixed,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)',
    borderBottomColor: 'rgba(165,214,167,0.4)',
    borderRightColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 6,
  },
  familyAvatarSheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  familyAvatarText: { fontSize: 18, fontWeight: '900', color: '#fff', zIndex: 1 },
  leaderCrown: {
    position: 'absolute', top: -8, left: '50%', marginLeft: -9,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#F9A825', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
    shadowColor: 'rgba(249,168,37,0.4)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 3,
  },
  familyOnline: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#fff', zIndex: 2 },
  familyName: { fontSize: 10, fontWeight: '700', color: NC.onSurface, marginTop: 5 },

  // Polls
  pollCard: { marginBottom: 12 },
  pollQ: { fontSize: 16, fontWeight: '900', color: NC.onSurface, marginBottom: 14 },
  pollOpt: {
    borderRadius: 24, overflow: 'hidden', backgroundColor: '#F1F8F2',
    flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    borderRightColor: 'rgba(165,214,167,0.2)',
    shadowColor: 'rgba(165,214,167,0.25)', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3,
  },
  pollOptVoted: { borderColor: NC.primary, borderWidth: 2.5 },
  pollFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(46,125,50,0.1)', borderRadius: 24 },
  pollOptText: { flex: 1, color: NC.onSurface, fontSize: 14, fontWeight: '700' },
  pollPct: { color: NC.primary, fontSize: 14, fontWeight: '900' },
});
