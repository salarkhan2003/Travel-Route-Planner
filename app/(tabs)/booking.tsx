/**
 * Roamio Hub — Central Booking Portal (Mint Liquid Clay v2)
 * Features: Squishy 50px Bento cards, Mint gradient BG, Frosted Glass,
 * Instant Mode Switching, Real Full Calendar
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Dimensions, Modal, FlatList,
  Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { searchTrains, searchFlights, searchBuses } from '../../src/services/transportAPI';
import { downloadTicketPDF } from '../../src/services/ticketPDF';
import { CalendarPicker } from '../../src/components/FullCalendar';
import { MINT, CLAY_CARD_V2, CLAY_BTN_V2, ACCENTS, FONTS } from '../../src/constants/theme';

const { width, height } = Dimensions.get('window');

// ── Transport modes ───────────────────────────────────────────────────────────
const MODES = [
  { id: 'train',  label: 'Trains',  icon: 'train'    as const },
  { id: 'flight', label: 'Flights', icon: 'airplane' as const },
  { id: 'bus',    label: 'Buses',   icon: 'bus'      as const },
  { id: 'movies', label: 'Cinema',  icon: 'film'     as const },
] as const;

const TRIP_TYPES = ['One Way', 'Round Trip'] as const;
const CLASSES = ['Economy', 'Business', 'First'] as const;
const POPULAR_CITIES = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Goa','Kochi','Surat'];

// ── Mock Offers ───────────────────────────────────────────────────────────────
const OFFERS = [
  { id: 'o1', icon: 'pricetag' as const, title: 'FLAT 18% OFF', sub: 'Use ROAMIO18 on flights', validTill: 'Apr 30', color: ACCENTS.flight.fg, bg: ACCENTS.flight.bg },
  { id: 'o2', icon: 'train' as const, title: '3AC Upgrade Free', sub: 'Book 4+ train seats today', validTill: 'May 5', color: ACCENTS.train.fg, bg: ACCENTS.train.bg },
  { id: 'o3', icon: 'bed' as const, title: 'Stay + Fly Bundle', sub: 'Save ₹8,000 on hotel+flight', validTill: 'May 10', color: ACCENTS.budget.fg, bg: ACCENTS.budget.bg },
  { id: 'o4', icon: 'flash' as const, title: 'Flash Sale 24h', sub: 'Buses from just ₹299', validTill: 'Today', color: ACCENTS.bus.fg, bg: ACCENTS.bus.bg },
];

const CREDIT_CARDS = [
  { id: 'c1', bank: 'HDFC Bank', name: 'Roamio Platinum', cashback: '5% on flights', limit: '₹5L', bg: ['#1D4ED8', '#1E3A8A'], chip: '#F59E0B' },
  { id: 'c2', bank: 'SBI Card', name: 'Travel Elite', cashback: '3% on trains', limit: '₹3L', bg: ['#059669', '#064E3B'], chip: '#FFF' },
];

const NOTIFS = [
  { id: '1', icon: 'checkmark-circle' as const, title: 'Booking Confirmed', desc: 'Train 12952 · Delhi to Mumbai', time: '2m ago', color: MINT[500] },
  { id: '2', icon: 'trending-down'    as const, title: 'Price Alert', desc: 'DEL → SIN dropped 18%. Now ₹45,200', time: '1h ago', color: '#60A5FA' },
  { id: '3', icon: 'notifications'    as const, title: 'PNR Status', desc: 'WL 4 → CONFIRMED. Coach B6 Seat 34', time: '3h ago', color: '#F59E0B' },
];

function genAvail(pattern: number): Record<string, 'available' | 'limited' | 'unavailable'> {
  const avail: Record<string, 'available' | 'limited' | 'unavailable'> = {};
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const r = i % (pattern + 3);
    avail[key] = r === 0 ? 'unavailable' : r <= 1 ? 'limited' : 'available';
  }
  return avail;
}
const AVAIL_TRAIN = genAvail(4);
const AVAIL_FLIGHT = genAvail(5);
const AVAIL_BUS = genAvail(3);

type ModeId = typeof MODES[number]['id'];

export default function BookingHubScreen() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  // Mint Liquid Clay colors
  const bg      = darkMode ? '#020F08' : MINT[50];
  const card    = darkMode ? '#0A1A12' : '#FFFFFF';
  const border  = darkMode ? '#163322' : 'rgba(167,243,208,0.4)';
  const primary = darkMode ? '#00F59B' : MINT[500];
  const onPri   = darkMode ? '#000000' : '#FFFFFF';
  const txt1    = darkMode ? '#F0FDF4' : MINT[900];
  const txt2    = darkMode ? '#6EE7B7' : MINT[700];
  const surf    = darkMode ? '#0E291B' : MINT[100];

  const [mode, setMode]               = useState<ModeId>('train');
  const [tripType, setTripType]       = useState<'One Way' | 'Round Trip'>('One Way');
  const [classType, setClassType]     = useState('Economy');
  const [from, setFrom]               = useState('');
  const [to, setTo]                   = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [adults, setAdults]           = useState(1);
  const [children, setChildren]       = useState(0);
  const [loading, setLoading]         = useState(false);
  const [results, setResults]         = useState<any[]>([]);
  const [showNotifs, setShowNotifs]   = useState(false);
  const [suggestField, setSuggestField] = useState<'from' | 'to' | null>(null);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const switchMode = (m: ModeId) => {
    setMode(m);
    setResults([]);
    if (m === 'movies') router.push('/booking/movies' as any);
  };

  const swapCities = () => { const t = from; setFrom(to); setTo(t); };

  const handleSearch = async () => {
    if (!from.trim() || !to.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      let res: any[] = [];
      const dateStr = new Date().toISOString().split('T')[0];
      if (mode === 'train')  res = await searchTrains(from, to, dateStr, adults + children);
      if (mode === 'flight') res = await searchFlights(from, to, dateStr, adults + children);
      if (mode === 'bus')    res = await searchBuses(from, to, dateStr, adults + children);
      setResults(res);
    } finally { setLoading(false); }
  };

  const openTicket = (item: any) => {
    const ref = 'RM-' + mode[0].toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase();
    const dateStr = selectedDate
      ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    setActiveTicket({
      ...item, ref, from, to, date: dateStr, passenger: 'Patan Salar Khan',
      seat: mode === 'train' ? `B2 / ${Math.floor(Math.random() * 60 + 1)}` : `12A`,
      pnr: mode === 'train' ? String(Math.floor(Math.random() * 9000000000 + 1000000000)) : undefined,
      gate: mode === 'flight' ? `T2` : undefined,
      type: mode.toUpperCase(), operator: item.name, price: item.price * (adults + children), class: classType,
    });
  };

  const handleDownload = async () => {
    if (!activeTicket || downloading) return;
    setDownloading(true);
    try {
      await downloadTicketPDF({ ...activeTicket });
    } finally { setDownloading(false); }
  };

  const modeColor: Record<ModeId, string> = {
    train: ACCENTS.train.fg, flight: ACCENTS.flight.fg,
    bus: ACCENTS.bus.fg, movies: ACCENTS.budget.fg,
  };
  const modeBg: Record<ModeId, string> = {
    train: ACCENTS.train.bg, flight: ACCENTS.flight.bg,
    bus: ACCENTS.bus.bg, movies: ACCENTS.budget.bg,
  };
  const mc = modeColor[mode];
  const mbg = modeBg[mode];

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: bg }}>
        {/* App bar */}
        <View style={s.appBar}>
          <View>
            <Text style={[s.appBarSup, { color: primary }]}>GLOBAL BOOKING PORTAL</Text>
            <Text style={[s.appBarTitle, { color: txt1 }]}>Roamio.</Text>
          </View>
          <TouchableOpacity
            style={[s.bellBtn, { backgroundColor: card, borderColor: border }]}
            onPress={() => setShowNotifs(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={txt1} />
            <View style={[s.bellDot, { borderColor: card }]} />
          </TouchableOpacity>
        </View>

        {/* Squishy Tabs */}
        <View style={[s.modeTabBar, { backgroundColor: card, borderColor: border }]}>
          {MODES.map((m2) => {
            const active = mode === m2.id;
            const clr = modeColor[m2.id];
            const tbg = modeBg[m2.id];
            return (
              <TouchableOpacity
                key={m2.id}
                style={[s.modeTab, active && { backgroundColor: darkMode ? clr + '20' : tbg }]}
                onPress={() => switchMode(m2.id)}
                activeOpacity={0.7}
              >
                <Ionicons name={m2.icon} size={18} color={active ? clr : txt2} />
                <Text style={[s.modeTabLabel, { color: active ? clr : txt2, fontWeight: active ? '800' : '600' }]}>
                  {m2.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          
          {/* SEARCH CARD (Mint Liquid Clay styling) */}
          <View style={[s.searchCard, { backgroundColor: card, borderColor: border }]}>
            {(mode === 'train' || mode === 'flight') && (
              <View style={s.tripTypeRow}>
                {TRIP_TYPES.map(t => (
                  <TouchableOpacity key={t} onPress={() => setTripType(t)}
                    style={[s.tripTypePill, tripType === t && { backgroundColor: mbg }]}>
                    <Text style={[s.tripTypeTxt, { color: tripType === t ? mc : txt2, fontWeight: tripType === t ? '800' : '600' }]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={{ flex: 1 }} />
                {mode === 'flight' && (
                  <View style={[s.classPill, { borderColor: border }]}>
                    <Text style={[s.classTxt, { color: txt2 }]}>{classType}</Text>
                    <Ionicons name="chevron-down" size={12} color={txt2} />
                  </View>
                )}
              </View>
            )}

            {/* From/To */}
            <View style={[s.routeBox, { backgroundColor: surf, borderColor: border }]}>
              <View style={s.routeRow}>
                <View style={[s.routeDot, { backgroundColor: mc }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.routeFieldLabel, { color: primary }]}>From</Text>
                  <TextInput value={from} onChangeText={setFrom} onFocus={() => setSuggestField('from')} onBlur={() => setTimeout(() => setSuggestField(null), 200)}
                    placeholder="Origin city" placeholderTextColor={txt2} style={[s.routeInput, { color: txt1 }]} />
                </View>
              </View>
              <TouchableOpacity onPress={swapCities} style={[s.swapBtn, { backgroundColor: mbg, borderColor: border }]} activeOpacity={0.8}>
                <Ionicons name="swap-vertical" size={16} color={mc} />
              </TouchableOpacity>
              <View style={[s.routeDivider, { backgroundColor: border }]} />
              <View style={s.routeRow}>
                <View style={[s.routeDot, { backgroundColor: txt2 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.routeFieldLabel, { color: txt2 }]}>To</Text>
                  <TextInput value={to} onChangeText={setTo} onFocus={() => setSuggestField('to')} onBlur={() => setTimeout(() => setSuggestField(null), 200)}
                    placeholder="Destination city" placeholderTextColor={txt2} style={[s.routeInput, { color: txt1 }]} />
                </View>
              </View>
            </View>

            {suggestField && (
              <View style={[s.suggestBox, { backgroundColor: card, borderColor: border }]}>
                {POPULAR_CITIES.filter(c => c.toLowerCase().startsWith((suggestField === 'from' ? from : to).toLowerCase())).slice(0, 5).map(c => (
                  <TouchableOpacity key={c} style={[s.suggestRow, { borderBottomColor: border }]} onPress={() => { suggestField === 'from' ? setFrom(c) : setTo(c); setSuggestField(null); }}>
                    <Ionicons name="location-outline" size={14} color={mc} />
                    <Text style={[s.suggestTxt, { color: txt1 }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ marginTop: 14 }}>
              <Text style={[s.fieldLabel, { color: txt1, marginBottom: 8 }]}>Travel Date</Text>
              <CalendarPicker
                label="Select Travel Date" selectedDate={selectedDate} onDateSelect={setSelectedDate}
                primaryColor={mc} textColor={txt1} subTextColor={txt2} cardColor={card} borderColor={border} surfaceColor={surf}
                minDate={new Date()} availability={mode === 'train' ? AVAIL_TRAIN : mode === 'flight' ? AVAIL_FLIGHT : AVAIL_BUS}
              />
            </View>

            <View style={s.passengerSection}>
              <View style={s.counterWrap}>
                <Text style={[s.fieldLabel, { color: txt1 }]}>Adults</Text>
                <View style={s.counterRow}>
                  <TouchableOpacity onPress={() => setAdults(Math.max(1, adults - 1))} style={[s.cBtn, { backgroundColor: surf }]}>
                    <Ionicons name="remove" size={14} color={txt1} />
                  </TouchableOpacity>
                  <Text style={[s.cVal, { color: txt1 }]}>{adults}</Text>
                  <TouchableOpacity onPress={() => setAdults(Math.min(6, adults + 1))} style={[s.cBtn, { backgroundColor: surf }]}>
                    <Ionicons name="add" size={14} color={txt1} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[s.cDivider, { backgroundColor: border }]} />
              <View style={s.counterWrap}>
                <Text style={[s.fieldLabel, { color: txt1 }]}>Children</Text>
                <View style={s.counterRow}>
                  <TouchableOpacity onPress={() => setChildren(Math.max(0, children - 1))} style={[s.cBtn, { backgroundColor: surf }]}>
                    <Ionicons name="remove" size={14} color={txt1} />
                  </TouchableOpacity>
                  <Text style={[s.cVal, { color: txt1 }]}>{children}</Text>
                  <TouchableOpacity onPress={() => setChildren(Math.min(6, children + 1))} style={[s.cBtn, { backgroundColor: surf }]}>
                    <Ionicons name="add" size={14} color={txt1} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={[s.searchBtn, { backgroundColor: mc, shadowColor: mc }]} onPress={handleSearch} disabled={loading} activeOpacity={0.88}>
              <Ionicons name={loading ? 'hourglass-outline' : 'search'} size={18} color="#FFF" />
              <Text style={s.searchBtnTxt}>{loading ? 'Scanning Universe...' : `Search ${MODES.find(m => m.id === mode)?.label}`}</Text>
            </TouchableOpacity>
          </View>

          {/* RESULTS */}
          {results.length > 0 && (
            <View style={s.resultsSection}>
              <View style={s.resultsHeader}>
                <Text style={[s.resultsSummary, { color: txt1 }]}>{results.length} found · {from} to {to}</Text>
              </View>
              {results.map((item, idx) => (
                <TouchableOpacity key={item.id || idx} activeOpacity={0.86} onPress={() => openTicket(item)}
                  style={[s.resultCard, { backgroundColor: card, borderColor: border, shadowColor: item.color || mc }]}
                >
                  <View style={s.resultTop}>
                    <View style={[s.resultIconBox, { backgroundColor: (item.color || mc) + '18' }]}>
                      <Ionicons name={MODES.find(m => m.id === mode)!.icon} size={20} color={item.color || mc} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[s.resultName, { color: txt1 }]}>{item.name}</Text>
                      <Text style={[s.resultSub, { color: txt2 }]}>{item.number ? `${item.number} · ` : ''}{item.type || item.stops || ''}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[s.resultPrice, { color: txt1 }]}>₹{(item.price * (adults + children)).toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                  <View style={s.resultTimeRow}>
                    <View><Text style={[s.resultTime, { color: txt1 }]}>{item.dep}</Text></View>
                    <View style={s.resultMiddle}>
                      <Text style={[s.resultDur, { color: txt2 }]}>{item.dur}</Text>
                      <View style={[s.resultLine, { backgroundColor: border }]} />
                    </View>
                    <View style={{ alignItems: 'flex-end' }}><Text style={[s.resultTime, { color: txt1 }]}>{item.arr}</Text></View>
                  </View>
                  <View style={[s.resultFooter, { borderTopColor: border }]}>
                    <Text style={[s.statusTxt, { color: item.status?.startsWith('AVL') ? primary : txt2 }]}>{item.status || 'Available'}</Text>
                    <View style={[s.bookChip, { backgroundColor: item.color || mc }]}><Text style={s.bookChipTxt}>BOOK</Text></View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* GROQ AGENT */}
          {results.length === 0 && (
            <TouchableOpacity style={s.agentCTA} onPress={() => router.push('/agent' as any)} activeOpacity={0.88}>
              <View style={s.agentTop}>
                <View style={[s.orb, { backgroundColor: primary }]}><Ionicons name="sparkles" size={20} color="#FFF" /></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.agentTitle}>Roamio AI Pilot</Text>
                  <Text style={s.agentSub}>Groq LPU · Plans your trip instantly</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>
          )}

          {/* OFFERS (Mint Liquid Clay styling) */}
          {results.length === 0 && (
            <>
              <Text style={[s.sectionLabel, { color: txt1, marginTop: 12 }]}>Special Offers</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24, marginHorizontal: -16, paddingHorizontal: 16 }}>
                {OFFERS.map(o => (
                  <TouchableOpacity key={o.id} style={[s.offerCard, { backgroundColor: card, borderColor: border, shadowColor: o.color }]} activeOpacity={0.88}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <View style={[s.offerIconBox, { backgroundColor: darkMode ? o.color + '20' : o.bg }]}>
                        <Ionicons name={o.icon} size={16} color={o.color} />
                      </View>
                      <Text style={[s.offerTitle, { color: o.color }]}>{o.title}</Text>
                    </View>
                    <Text style={[s.offerSub, { color: txt2 }]}>{o.sub}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[s.sectionLabel, { color: txt1 }]}>Travel Cards</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24, marginHorizontal: -16, paddingHorizontal: 16 }}>
                {CREDIT_CARDS.map(cc => (
                  <TouchableOpacity key={cc.id} style={s.creditCard} activeOpacity={0.88}>
                    <View style={[s.creditCardInner, { backgroundColor: cc.bg[0] }]}>
                      <View style={s.cardTop}>
                        <Text style={s.cardBank}>{cc.bank}</Text>
                        <View style={[s.cardChip, { backgroundColor: cc.chip }]} />
                      </View>
                      <Text style={s.cardNum}>••••  ••••  ••••  4729</Text>
                      <View style={s.cardBottom}>
                        <Text style={s.cardName}>{cc.name}</Text>
                        <Text style={s.cardBadgeTxt}>VISA</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[s.sectionLabel, { color: txt1 }]}>Quick Access</Text>
              <View style={s.quickGrid}>
                {[
                  { label: 'Train Status', icon: 'search-outline' as const, c: ACCENTS.train, r: '/booking/train' },
                  { label: 'My Flights', icon: 'ticket-outline' as const, c: ACCENTS.flight, r: '/booking/flight' },
                  { label: 'Bus Seats', icon: 'bus-outline' as const, c: ACCENTS.bus, r: '/booking/bus' },
                ].map(q => (
                  <TouchableOpacity key={q.label} style={[s.quickCard, { backgroundColor: card, borderColor: border }]} onPress={() => router.push(q.r as any)}>
                    <View style={[s.quickIconBox, { backgroundColor: darkMode ? q.c.fg + '20' : q.c.bg }]}>
                      <Ionicons name={q.icon} size={22} color={q.c.fg} />
                    </View>
                    <Text style={[s.quickLabel, { color: txt1 }]}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Ticket Modal */}
      <Modal visible={!!activeTicket} transparent animationType="slide">
        <View style={s.modalBg}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setActiveTicket(null)} />
          <View style={[s.ticketSheet, { backgroundColor: card }]}>
            <View style={[s.ticketStrip, { backgroundColor: activeTicket?.color || mc }]}>
              <Ionicons name={MODES.find(m2 => m2.id === mode)?.icon || 'ticket'} size={24} color="#FFF" />
              <Text style={s.ticketStripTitle}>E-TICKET CONFIRMED</Text>
            </View>
            <ScrollView style={{ padding: 24 }}>
              <View style={[s.refBox, { backgroundColor: (activeTicket?.color || mc) + '15', borderColor: (activeTicket?.color || mc) + '35' }]}>
                <Text style={[s.refLabel, { color: txt2 }]}>BOOKING REFERNCE</Text>
                <Text style={[s.refVal, { color: activeTicket?.color || mc }]}>{activeTicket?.ref}</Text>
              </View>
              <TouchableOpacity style={[s.downloadBtn, { backgroundColor: activeTicket?.color || mc }]} onPress={handleDownload} disabled={downloading}>
                <Text style={s.downloadBtnTxt}>{downloading ? 'Downloading...' : 'Download PDF'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.closeBtn, { borderColor: border }]} onPress={() => setActiveTicket(null)}>
                <Text style={[s.closeBtnTxt, { color: txt1 }]}>Close</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  // App Bar
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  appBarSup: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  appBarTitle: { fontSize: 28, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: -0.5 },
  bellBtn: { ...CLAY_CARD_V2, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  bellDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 2 },
  
  // Tabs (Squishy pill container)
  modeTabBar: { flexDirection: 'row', padding: 6, marginHorizontal: 16, borderRadius: 32, borderWidth: 1.5 },
  modeTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 26, gap: 4 },
  modeTabLabel: { fontSize: 11, fontFamily: FONTS.body, letterSpacing: 0.2 },

  scroll: { padding: 16, paddingBottom: 120 },

  // Search Card (Bento 50px-style radius)
  searchCard: { ...CLAY_CARD_V2, padding: 20, marginBottom: 24, paddingBottom: 24 },
  tripTypeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 8 },
  tripTypePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  tripTypeTxt: { fontSize: 13, fontFamily: FONTS.body },
  classPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  classTxt: { fontSize: 12 },

  // Route Input (Squishy interior block)
  routeBox: { borderRadius: 24, borderWidth: 1.5, overflow: 'hidden', marginBottom: 16 },
  routeRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeFieldLabel: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 },
  routeInput: { fontSize: 20, fontFamily: FONTS.display, fontWeight: '800' },
  routeDivider: { height: 1.5 },
  swapBtn: { position: 'absolute', right: 16, top: '40%', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 2, zIndex: 2 },
  suggestBox: { borderRadius: 20, borderWidth: 1.5, marginBottom: 16, overflow: 'hidden' },
  suggestRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1 },
  suggestTxt: { fontSize: 15, fontFamily: FONTS.display, fontWeight: '700' },

  // Passengers
  fieldLabel: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '800', letterSpacing: 1 },
  passengerSection: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 4 },
  counterWrap: { flex: 1, alignItems: 'flex-start' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  cBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cVal: { fontSize: 20, fontFamily: FONTS.display, fontWeight: '900', minWidth: 20, textAlign: 'center' },
  cDivider: { width: 1.5, height: 50, marginHorizontal: 16 },

  searchBtn: { ...CLAY_BTN_V2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, gap: 10, marginTop: 24 },
  searchBtnTxt: { fontSize: 16, fontFamily: FONTS.display, fontWeight: '900', color: '#FFF' },

  // Results
  resultsSection: { marginBottom: 16 },
  resultsHeader: { marginBottom: 16 },
  resultsSummary: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '800' },
  resultCard: { ...CLAY_CARD_V2, padding: 18, marginBottom: 16 },
  resultTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  resultIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resultName: { fontSize: 16, fontFamily: FONTS.display, fontWeight: '900' },
  resultSub: { fontSize: 12, marginTop: 2, fontFamily: FONTS.body },
  resultPrice: { fontSize: 20, fontFamily: FONTS.display, fontWeight: '900' },
  resultTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  resultTime: { fontSize: 20, fontFamily: FONTS.display, fontWeight: '900' },
  resultMiddle: { flex: 1, alignItems: 'center', paddingHorizontal: 12, gap: 6 },
  resultDur: { fontSize: 11, fontFamily: FONTS.body, fontWeight: '700' },
  resultLine: { height: 2, width: '100%', borderRadius: 1 },
  resultFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTopWidth: 1.5 },
  statusTxt: { fontSize: 12, fontFamily: FONTS.display, fontWeight: '800' },
  bookChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16 },
  bookChipTxt: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '900', color: '#FFF' },

  // Agent CTA
  agentCTA: { backgroundColor: '#0A2640', borderRadius: 32, padding: 20, marginBottom: 24, elevation: 8, shadowColor: '#0A2640', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  agentTop: { flexDirection: 'row', alignItems: 'center' },
  orb: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  agentTitle: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900', color: '#FFF' },
  agentSub: { fontSize: 13, fontFamily: FONTS.body, color: '#94A3B8', marginTop: 2 },

  // Horizontal Scrollers
  sectionLabel: { fontSize: 17, fontFamily: FONTS.display, fontWeight: '900', marginBottom: 14 },
  offerCard: { ...CLAY_CARD_V2, width: 240, padding: 18, marginRight: 14 },
  offerIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  offerTitle: { fontSize: 15, fontFamily: FONTS.display, fontWeight: '900' },
  offerSub: { fontSize: 12, fontFamily: FONTS.body },
  
  creditCard: { width: 260, height: 160, borderRadius: 28, marginRight: 14, overflow: 'hidden', elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
  creditCardInner: { flex: 1, padding: 20, justifyContent: 'space-between' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBank: { color: '#FFF', fontSize: 14, fontFamily: FONTS.display, fontWeight: '800' },
  cardChip: { width: 32, height: 22, borderRadius: 6 },
  cardNum: { color: '#FFF', fontSize: 18, fontFamily: FONTS.display, letterSpacing: 2, marginTop: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardName: { color: '#FFF', fontSize: 13, fontFamily: FONTS.body },
  cardBadgeTxt: { color: '#FFF', fontSize: 15, fontFamily: FONTS.display, fontWeight: '900', fontStyle: 'italic' },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: { ...CLAY_CARD_V2, width: (width - 44) / 2, padding: 16, alignItems: 'center', gap: 12 },
  quickIconBox: { width: 50, height: 50, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '800' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  ticketSheet: { borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  ticketStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 12 },
  ticketStripTitle: { fontSize: 16, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1.5, color: '#FFF' },
  refBox: { borderRadius: 24, borderWidth: 1.5, padding: 20, alignItems: 'center', marginBottom: 24 },
  refLabel: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6 },
  refVal: { fontSize: 28, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 3 },
  downloadBtn: { ...CLAY_BTN_V2, alignItems: 'center', marginBottom: 16 },
  downloadBtnTxt: { fontSize: 16, fontFamily: FONTS.display, fontWeight: '900', color: '#FFF' },
  closeBtn: { height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  closeBtnTxt: { fontSize: 15, fontFamily: FONTS.display, fontWeight: '800' },
});