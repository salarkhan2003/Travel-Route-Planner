/**
 * Roamio Rail (IRCTC) — Mint Liquid Clay v2
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Dimensions, Alert, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { downloadTicketPDF } from '../../src/services/ticketPDF';
import { CalendarPicker } from '../../src/components/FullCalendar';
import { MINT, CLAY_CARD_V2, CLAY_BTN_V2, ACCENTS, FONTS } from '../../src/constants/theme';

const { width, height } = Dimensions.get('window');
const CLASSES = ['SL', '3A', '2A', '1A', 'CC', 'EC'] as const;

const MOCK_TRAINS = [
  { id: '12952', name: 'Mumbai Rajdhani', dep: '16:30', arr: '08:15+1', dur: '15h 45m', price: 4250, status: 'AVAILABLE', seats: 48, operator: 'Indian Railways' },
  { id: '12954', name: 'August Kranti Raj', dep: '17:15', arr: '09:40+1', dur: '16h 25m', price: 3800, status: 'AVAILABLE', seats: 32, operator: 'Indian Railways' },
  { id: '22210', name: 'Duronto Super', dep: '22:15', arr: '13:00+1', dur: '14h 45m', price: 3500, status: 'WL 12', seats: 0, operator: 'Indian Railways' },
];

function getMockTrainAvailability(): Record<string, 'available' | 'limited' | 'unavailable'> {
  const avail: Record<string, 'available' | 'limited' | 'unavailable'> = {};
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const r = i % 7;
    avail[key] = r === 0 || r === 1 ? 'unavailable' : r === 2 ? 'limited' : 'available';
  }
  return avail;
}
const TRAIN_AVAILABILITY = getMockTrainAvailability();

export default function RoamioRailScreen() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  const bg      = darkMode ? '#020F08' : MINT[50];
  const card    = darkMode ? '#0A1A12' : '#FFFFFF';
  const border  = darkMode ? '#163322' : 'rgba(167,243,208,0.4)';
  const txt1    = darkMode ? '#F0FDF4' : MINT[900];
  const txt2    = darkMode ? '#6EE7B7' : MINT[700];
  const surf    = darkMode ? '#0E291B' : MINT[100];
  
  const accent  = ACCENTS.train;
  const err     = darkMode ? '#FF453A' : '#DC2626';
  const warn    = '#F59E0B';

  const [tab, setTab] = useState<'search' | 'pnr'>('search');
  const [from, setFrom] = useState('NDLS');
  const [to, setTo] = useState('BCT');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [cls, setCls] = useState<typeof CLASSES[number]>('3A');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<typeof MOCK_TRAINS>([]);
  const [pnrInput, setPnrInput] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const search = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setResults(MOCK_TRAINS);
    setLoading(false);
  };

  const openTicket = (t: typeof MOCK_TRAINS[0]) => {
    setTicket({
      ...t, passenger: 'Patan Salar Khan', from, to,
      date: selectedDate ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not selected',
      seat: 'Coach B4 / Berth 32', pnr: String(Math.floor(1000000000 + Math.random() * 9000000000)), cls, adults, children,
    });
  };

  const handleDownload = async () => {
    if (!ticket || downloading) return;
    setDownloading(true);
    try {
      await downloadTicketPDF({
        type: 'TRAIN', ref: ticket.pnr || 'RM-T0001', from: ticket.from, to: ticket.to, dep: ticket.dep, arr: ticket.arr,
        date: ticket.date, passenger: ticket.passenger, seat: ticket.seat, price: ticket.price, operator: ticket.name,
        pnr: ticket.pnr, class: ticket.cls || cls, trainNo: ticket.id,
      });
    } finally { setDownloading(false); }
  };

  const isAvail = (s: string) => s === 'AVAILABLE';

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: bg }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: card, borderColor: border }]}>
            <Ionicons name="chevron-back" size={24} color={txt1} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[s.headerSup, { color: accent.fg }]}>IRCTC CONNECT</Text>
            <Text style={[s.headerTitle, { color: txt1 }]}>Roamio Rail</Text>
          </View>
          <View style={[s.headerIconBox, { backgroundColor: darkMode ? accent.fg + '20' : accent.bg }]}>
            <Ionicons name="train" size={26} color={accent.fg} />
          </View>
        </View>

        <View style={[s.tabBar, { backgroundColor: card, borderColor: border }]}>
          {(['search', 'pnr'] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}
              style={[s.tabItem, tab === t && { backgroundColor: darkMode ? accent.fg + '20' : accent.bg }]} activeOpacity={0.8}>
              <Text style={[s.tabText, { color: tab === t ? accent.fg : txt2 }]}>
                {t === 'search' ? 'Search Trains' : 'Check PNR'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {tab === 'search' ? (
          <>
            {/* Route Box */}
            <View style={[s.card, { backgroundColor: card, borderColor: border }]}>
              <Text style={[s.cardLabel, { color: txt2 }]}>ROUTE (STATION CODES)</Text>
              <View style={[s.routeBox, { backgroundColor: surf, borderColor: border }]}>
                <View style={{ flex: 1, padding: 16 }}>
                  <Text style={[s.routeTag, { color: accent.fg }]}>FROM</Text>
                  <TextInput value={from} onChangeText={setFrom} style={[s.routeInput, { color: txt1 }]} autoCapitalize="characters" maxLength={5} />
                </View>
                <TouchableOpacity onPress={() => { const tmp = from; setFrom(to); setTo(tmp); }}
                  style={[s.swapBtn, { backgroundColor: darkMode ? accent.fg + '20' : accent.bg, borderColor: border }]}>
                  <Ionicons name="swap-horizontal" size={20} color={accent.fg} />
                </TouchableOpacity>
                <View style={{ flex: 1, padding: 16, alignItems: 'flex-end' }}>
                  <Text style={[s.routeTag, { color: txt2 }]}>TO</Text>
                  <TextInput value={to} onChangeText={setTo} style={[s.routeInput, { color: txt1, textAlign: 'right' }]} autoCapitalize="characters" maxLength={5} />
                </View>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={[s.groupLabel, { color: txt1 }]}>Travel Date</Text>
              <CalendarPicker label="Departure Date" selectedDate={selectedDate} onDateSelect={setSelectedDate} 
                primaryColor={accent.fg} textColor={txt1} subTextColor={txt2} cardColor={card} borderColor={border} surfaceColor={surf}
                minDate={new Date()} availability={TRAIN_AVAILABILITY} />
            </View>

            <Text style={[s.groupLabel, { color: txt1 }]}>Travel Class</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {CLASSES.map(c => (
                <TouchableOpacity key={c} onPress={() => setCls(c)}
                  style={[s.classPill, { backgroundColor: cls === c ? accent.fg : card, borderColor: cls === c ? accent.fg : border }]}>
                  <Text style={[s.classPillTxt, { color: cls === c ? '#FFF' : txt2 }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[s.card, { backgroundColor: card, borderColor: border }]}>
              <Text style={[s.cardLabel, { color: txt2 }]}>PASSENGERS</Text>
              <View style={s.passengerRow}>
                <View style={s.counterGroup}>
                  <Text style={[s.counterLabel, { color: txt1 }]}>Adults</Text>
                  <View style={s.counterRow}>
                    <TouchableOpacity onPress={() => setAdults(Math.max(1, adults - 1))} style={[s.counterBtn, { backgroundColor: surf }]}>
                      <Ionicons name="remove" size={16} color={txt1} />
                    </TouchableOpacity>
                    <Text style={[s.counterVal, { color: txt1 }]}>{adults}</Text>
                    <TouchableOpacity onPress={() => setAdults(Math.min(6, adults + 1))} style={[s.counterBtn, { backgroundColor: surf }]}>
                      <Ionicons name="add" size={16} color={txt1} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[s.passengerDivider, { backgroundColor: border }]} />
                <View style={s.counterGroup}>
                  <Text style={[s.counterLabel, { color: txt1 }]}>Children</Text>
                  <View style={s.counterRow}>
                    <TouchableOpacity onPress={() => setChildren(Math.max(0, children - 1))} style={[s.counterBtn, { backgroundColor: surf }]}>
                      <Ionicons name="remove" size={16} color={txt1} />
                    </TouchableOpacity>
                    <Text style={[s.counterVal, { color: txt1 }]}>{children}</Text>
                    <TouchableOpacity onPress={() => setChildren(Math.min(6, children + 1))} style={[s.counterBtn, { backgroundColor: surf }]}>
                      <Ionicons name="add" size={16} color={txt1} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity style={[s.searchBtn, { backgroundColor: accent.fg, shadowColor: accent.fg }]} onPress={search} activeOpacity={0.88} disabled={loading}>
              <Ionicons name="search" size={20} color="#FFF" />
              <Text style={[s.searchBtnTxt, { color: '#FFF' }]}>{loading ? 'Searching Railways...' : `Find Trains  ·  ${adults + children} pax`}</Text>
            </TouchableOpacity>

            {/* Results */}
            {results.length > 0 && (
              <View style={{ marginBottom: 12, marginTop: 12 }}><Text style={[s.resultsTitle, { color: txt1 }]}>🚂  {results.length} trains · {from} → {to}</Text></View>
            )}
            {results.map((t) => (
              <View key={t.id} style={[s.resultCard, { backgroundColor: card, borderColor: isAvail(t.status) ? border : (t.status.startsWith('WL') ? err + '60' : warn + '60') }]}>
                <View style={s.resultTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.trainName, { color: txt1 }]}>{t.name}</Text>
                    <Text style={[s.trainId, { color: txt2 }]}>#{t.id} · {cls} Class</Text>
                  </View>
                  <View style={[s.statusPill, { backgroundColor: isAvail(t.status) ? (darkMode ? accent.fg + '25' : accent.bg) : (t.status.startsWith('WL') ? err + '22' : warn + '22') }]}>
                    <Text style={[s.statusTxt, { color: isAvail(t.status) ? accent.fg : (t.status.startsWith('WL') ? err : warn) }]}>{t.status}</Text>
                  </View>
                </View>
                <View style={s.timeRow}>
                  <View style={s.timeBlock}>
                    <Text style={[s.timeMain, { color: txt1 }]}>{t.dep}</Text>
                    <Text style={[s.timeStn, { color: txt2 }]}>{from}</Text>
                  </View>
                  <View style={s.timeMid}>
                    <Text style={[s.timeDur, { color: txt2 }]}>{t.dur}</Text>
                    <View style={[s.timeLine, { backgroundColor: border }]}><View style={[s.timeDot, { backgroundColor: accent.fg }]} /><View style={[s.timeDot, { backgroundColor: accent.fg, marginLeft: 'auto' }]} /></View>
                    <Ionicons name="train" size={14} color={accent.fg} style={{ position: 'absolute', top: 12 }} />
                  </View>
                  <View style={[s.timeBlock, { alignItems: 'flex-end' }]}>
                    <Text style={[s.timeMain, { color: txt1 }]}>{t.arr}</Text>
                    <Text style={[s.timeStn, { color: txt2 }]}>{to}</Text>
                  </View>
                </View>
                <View style={[s.resultFooter, { borderTopColor: border }]}>
                  <View>
                    <Text style={[s.priceMain, { color: txt1 }]}>₹{t.price.toLocaleString('en-IN')}</Text>
                    <Text style={[s.priceSub, { color: txt2 }]}>{t.seats > 0 ? `${t.seats} seats left` : 'Waitlisted'}</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.82}
                    style={[s.bookBtn, { backgroundColor: isAvail(t.status) ? accent.fg : (t.status.startsWith('WL') ? err : warn) }]}
                    onPress={() => isAvail(t.status) ? openTicket(t) : Alert.alert('Waitlisted', 'This train is on waitlist.')}>
                    <Text style={[s.bookBtnTxt, { color: '#FFF' }]}>{isAvail(t.status) ? 'SELECT' : t.status}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={[s.card, { backgroundColor: card, borderColor: border }]}>
            <Text style={[s.cardLabel, { color: txt2 }]}>ENTER 10-DIGIT PNR NUMBER</Text>
            <TextInput value={pnrInput} onChangeText={setPnrInput} style={[s.pnrInput, { color: txt1, borderColor: border, backgroundColor: surf }]}
              placeholder="1234567890" placeholderTextColor={txt2} keyboardType="numeric" maxLength={10} />
            <TouchableOpacity style={[s.searchBtn, { backgroundColor: accent.fg, marginTop: 10 }]} onPress={() => Alert.alert('PNR Status', `PNR ${pnrInput || '----'}:\nTrain: 12952 Rajdhani\nStatus: CONFIRMED`)}>
              <Ionicons name="search" size={18} color="#FFF" />
              <Text style={[s.searchBtnTxt, { color: '#FFF' }]}>Check Status</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Ticket Modal */}
      <Modal visible={!!ticket} transparent animationType="slide">
        <View style={s.modalBg}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setTicket(null)} />
          <View style={[s.ticketSheet, { backgroundColor: card }]}>
            <View style={[s.ticketStrip, { backgroundColor: accent.fg }]}>
              <Text style={{ fontSize: 24 }}>🚂</Text>
              <Text style={[s.ticketStripTitle, { color: '#FFF' }]}>E-TICKET CONFIRMED</Text>
              <Ionicons name="checkmark-circle" size={26} color="#FFF" />
            </View>
            <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
              <View style={[s.pnrBox, { backgroundColor: darkMode ? accent.fg + '1A' : accent.bg, borderColor: border }]}>
                <Text style={[s.pnrLabel, { color: txt2 }]}>PNR NUMBER</Text>
                <Text style={[s.pnrVal, { color: accent.fg }]}>{ticket?.pnr}</Text>
              </View>

              {/* ... Detailed ticket rows ... */}
              <View style={[s.ticketInfoRow, { borderColor: border }]}>
                <View style={{ flex: 1 }}><Text style={[s.tickLabel, { color: txt2 }]}>TRAIN</Text><Text style={[s.tickVal, { color: txt1 }]}>{ticket?.name}</Text><Text style={[s.tickSub, { color: accent.fg }]}>#{ticket?.id} · {ticket?.cls}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={[s.tickLabel, { color: txt2 }]}>DATE</Text><Text style={[s.tickVal, { color: txt1 }]}>{ticket?.date}</Text></View>
              </View>
              
              <View style={[s.ticketJourneyRow, { borderColor: border }]}>
                <View style={s.journeyBlock}><Text style={[s.tickLabel, { color: txt2 }]}>DEPARTURE</Text><Text style={[s.journeyTime, { color: txt1 }]}>{ticket?.dep}</Text><Text style={[s.journeyStn, { color: txt2 }]}>{ticket?.from}</Text></View>
                <View style={s.journeyMidBlock}><View style={[s.journeyLine, { backgroundColor: accent.fg }]} /><Ionicons name="train" size={22} color={accent.fg} /><View style={[s.journeyLine, { backgroundColor: accent.fg }]} /></View>
                <View style={[s.journeyBlock, { alignItems: 'flex-end' }]}><Text style={[s.tickLabel, { color: txt2 }]}>ARRIVAL</Text><Text style={[s.journeyTime, { color: txt1 }]}>{ticket?.arr}</Text><Text style={[s.journeyStn, { color: txt2 }]}>{ticket?.to}</Text></View>
              </View>

              <View style={[s.ticketInfoRow, { borderColor: border }]}>
                <View><Text style={[s.tickLabel, { color: txt2 }]}>PASSENGER</Text><Text style={[s.tickVal, { color: txt1 }]}>{ticket?.passenger}</Text><Text style={[s.tickSub, { color: txt2 }]}>{ticket?.seat}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={[s.tickLabel, { color: txt2 }]}>FARE</Text><Text style={[s.priceMain, { color: txt1, fontSize: 24 }]}>₹{ticket?.price?.toLocaleString('en-IN')}</Text><Text style={[s.tickSub, { color: txt2 }]}>{ticket?.adults}A {ticket?.children}C</Text></View>
              </View>

              <View style={[s.qrBox, { backgroundColor: surf, borderColor: border }]}>
                <Ionicons name="qr-code" size={90} color={accent.fg} />
                <Text style={[s.qrLabel, { color: txt2 }]}>Show QR to TTE</Text>
              </View>

              <TouchableOpacity style={[s.downloadBtn, { backgroundColor: accent.fg }]} onPress={handleDownload} disabled={downloading}>
                <Ionicons name={downloading ? 'hourglass' : 'download-outline'} size={20} color={'#FFF'} />
                <Text style={[s.downloadBtnTxt, { color: '#FFF' }]}>{downloading ? 'Generating...' : 'Download E-Ticket'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.closeBtn, { borderColor: border, backgroundColor: surf }]} onPress={() => setTicket(null)}>
                <Text style={[s.closeBtnTxt, { color: txt1 }]}>Close</Text>
              </TouchableOpacity>
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerSup: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  headerTitle: { fontSize: 26, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: -0.5 },
  backBtn: { ...CLAY_CARD_V2, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  headerIconBox: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', borderRadius: 30, borderWidth: 1.5, padding: 6, marginHorizontal: 16, marginBottom: 10 },
  tabItem: { flex: 1, paddingVertical: 12, borderRadius: 24, alignItems: 'center' },
  tabText: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '800' },
  
  card: { ...CLAY_CARD_V2, padding: 22, marginBottom: 20 },
  cardLabel: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  
  routeBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, borderWidth: 1.5 },
  routeTag: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  routeInput: { fontSize: 24, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1 },
  swapBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, zIndex: 2 },
  
  groupLabel: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '900', marginBottom: 12 },
  classPill: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 20, marginRight: 12, borderWidth: 1.5 },
  classPillTxt: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '900' },
  
  passengerRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  counterGroup: { flex: 1, alignItems: 'center' },
  counterLabel: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '800', marginBottom: 10 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  counterVal: { fontSize: 24, fontFamily: FONTS.display, fontWeight: '900', minWidth: 30, textAlign: 'center' },
  passengerDivider: { width: 1.5, height: 50 },
  
  searchBtn: { ...CLAY_BTN_V2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, gap: 10, marginBottom: 24 },
  searchBtnTxt: { fontSize: 16, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 0.3 },
  
  resultsTitle: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '900' },
  resultCard: { ...CLAY_CARD_V2, padding: 20, marginBottom: 16 },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  trainName: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900' },
  trainId: { fontSize: 13, fontFamily: FONTS.body, marginTop: 4 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusTxt: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '900' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  timeBlock: { width: 70 },
  timeMain: { fontSize: 24, fontFamily: FONTS.display, fontWeight: '900' },
  timeStn: { fontSize: 12, fontFamily: FONTS.display, marginTop: 4, fontWeight: '800' },
  timeMid: { flex: 1, alignItems: 'center', paddingHorizontal: 10, gap: 6 },
  timeDur: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '800' },
  timeLine: { height: 2, width: '90%', flexDirection: 'row', alignItems: 'center' },
  timeDot: { width: 6, height: 6, borderRadius: 3 },
  resultFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1.5 },
  priceMain: { fontSize: 24, fontFamily: FONTS.display, fontWeight: '900' },
  priceSub: { fontSize: 12, fontFamily: FONTS.body, marginTop: 4 },
  bookBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  bookBtnTxt: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 0.5 },
  
  pnrInput: { borderRadius: 24, borderWidth: 1.5, padding: 20, fontSize: 26, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 4, textAlign: 'center', marginBottom: 20 },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  ticketSheet: { borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: height * 0.9, overflow: 'hidden' },
  ticketStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 12 },
  ticketStripTitle: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1.5 },
  pnrBox: { borderRadius: 24, borderWidth: 1.5, padding: 20, alignItems: 'center', marginBottom: 24 },
  pnrLabel: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6 },
  pnrVal: { fontSize: 32, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 4 },
  ticketInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1.5 },
  ticketJourneyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1.5 },
  journeyBlock: { flex: 1 },
  journeyMidBlock: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  journeyLine: { flex: 1, height: 2.5, borderRadius: 2 },
  journeyTime: { fontSize: 28, fontFamily: FONTS.display, fontWeight: '900' },
  journeyStn: { fontSize: 14, fontFamily: FONTS.display, marginTop: 4, fontWeight: '800' },
  tickLabel: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6 },
  tickVal: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900' },
  tickSub: { fontSize: 13, fontFamily: FONTS.body, fontWeight: '700', marginTop: 4 },
  qrBox: { borderRadius: 28, borderWidth: 1.5, padding: 32, alignItems: 'center', marginTop: 24, marginBottom: 28 },
  qrLabel: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '800', marginTop: 12 },
  downloadBtn: { ...CLAY_BTN_V2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, gap: 12, marginBottom: 16 },
  downloadBtnTxt: { fontSize: 16, fontFamily: FONTS.display, fontWeight: '900' },
  closeBtn: { height: 56, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  closeBtnTxt: { fontSize: 15, fontFamily: FONTS.display, fontWeight: '900' },
});
