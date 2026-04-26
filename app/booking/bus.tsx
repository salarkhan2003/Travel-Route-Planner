/**
 * Roamio Bus — Mint Liquid Clay v2
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

const BUSES = [
  { id: 'B01', name: 'ZingBus Premium', type: 'AC Sleeper 2+1', dep: '21:00', arr: '04:30', dur: '7h 30m', price: 1450, rating: 4.8, ionIcon: 'bus' as const, color: '#F59E0B', amenities: ['WiFi', 'Charging', 'Blanket', 'Water'] },
  { id: 'B02', name: 'VRL Travels', type: 'Multi-Axle Scania', dep: '22:30', arr: '05:45', dur: '7h 15m', price: 1200, rating: 4.5, ionIcon: 'bus' as const, color: '#10B981', amenities: ['AC', 'Water', 'Snacks'] },
  { id: 'B03', name: 'SRS Travels', type: 'Volvo Semi-Sleeper', dep: '23:00', arr: '06:15', dur: '7h 15m', price: 950, rating: 4.3, ionIcon: 'bus-outline' as const, color: '#3B82F6', amenities: ['AC', 'Entertainment'] },
  { id: 'B04', name: 'Orange Tours', type: 'Capella Sleeper', dep: '21:15', arr: '05:00', dur: '7h 45m', price: 1850, rating: 4.9, ionIcon: 'bus' as const, color: '#EF4444', amenities: ['WiFi', 'Charging', 'Meals', 'Blanket'] },
];

function getMockBusAvailability(): Record<string, 'available' | 'limited' | 'unavailable'> {
  const avail: Record<string, 'available' | 'limited' | 'unavailable'> = {};
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const r = i % 6;
    avail[key] = r === 0 ? 'unavailable' : r <= 2 ? 'limited' : 'available';
  }
  return avail;
}
const BUS_AVAILABILITY = getMockBusAvailability();

export default function RoamioBusScreen() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  const bg      = darkMode ? '#020F08' : MINT[50];
  const card    = darkMode ? '#0A1A12' : '#FFFFFF';
  const border  = darkMode ? '#163322' : 'rgba(167,243,208,0.4)';
  const txt1    = darkMode ? '#F0FDF4' : MINT[900];
  const txt2    = darkMode ? '#6EE7B7' : MINT[700];
  const surf    = darkMode ? '#0E291B' : MINT[100];
  const accent  = ACCENTS.bus;

  const [from, setFrom] = useState('Bangalore');
  const [to, setTo] = useState('Chennai');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<typeof BUSES>([]);
  const [ticket, setTicket] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const search = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setResults(BUSES);
    setLoading(false);
  };

  const openTicket = (b: typeof BUSES[0]) => {
    setTicket({
      ...b, from, to,
      date: selectedDate ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not selected',
      passenger: 'Patan Salar Khan',
      seat: adults > 1 ? `Upper ${10 + adults - 1}, ${10 + adults}` : 'Upper 12',
      ref: 'RM-B' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    });
  };

  const handleDownload = async () => {
    if (!ticket || downloading) return;
    setDownloading(true);
    try {
      await downloadTicketPDF({
        type: 'BUS', ref: ticket.ref, from: ticket.from, to: ticket.to, dep: ticket.dep, arr: ticket.arr,
        date: ticket.date, passenger: ticket.passenger, seat: ticket.seat, price: ticket.price,
        operator: ticket.name, subInfo: ticket.type,
      });
    } finally { setDownloading(false); }
  };

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: bg }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: card, borderColor: border }]}>
            <Ionicons name="chevron-back" size={24} color={txt1} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[s.headerSup, { color: accent.fg }]}>INTERCITY TRAVEL</Text>
            <Text style={[s.headerTitle, { color: txt1 }]}>Roamio Bus</Text>
          </View>
          <View style={[s.headerIconBox, { backgroundColor: darkMode ? accent.fg + '20' : accent.bg }]}>
            <Ionicons name="bus" size={26} color={accent.fg} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={[s.card, { backgroundColor: card, borderColor: border }]}>
          <Text style={[s.cardLabel, { color: txt2 }]}>ROUTE</Text>
          
          <View style={[s.routeInputBox, { backgroundColor: surf, borderColor: border }]}>
            <Ionicons name="location" size={22} color={accent.fg} />
            <TextInput value={from} onChangeText={setFrom} style={[s.routeTxt, { color: txt1 }]} placeholder="From city" placeholderTextColor={txt2} />
          </View>
          
          <TouchableOpacity onPress={() => { const t = from; setFrom(to); setTo(t); }} style={s.swapRowBtn} activeOpacity={0.8}>
            <View style={[s.swapLine, { backgroundColor: border }]} />
            <View style={[s.swapCircle, { backgroundColor: darkMode ? accent.fg + '20' : accent.bg, borderColor: border }]}>
              <Ionicons name="swap-vertical" size={18} color={accent.fg} />
            </View>
            <View style={[s.swapLine, { backgroundColor: border }]} />
          </TouchableOpacity>
          
          <View style={[s.routeInputBox, { backgroundColor: surf, borderColor: border }]}>
            <Ionicons name="navigate" size={22} color={accent.fg} />
            <TextInput value={to} onChangeText={setTo} style={[s.routeTxt, { color: txt1 }]} placeholder="To city" placeholderTextColor={txt2} />
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={[s.groupLabel, { color: txt1 }]}>Travel Date</Text>
          <CalendarPicker label="Select Travel Date" selectedDate={selectedDate} onDateSelect={setSelectedDate}
            primaryColor={accent.fg} textColor={txt1} subTextColor={txt2} cardColor={card} borderColor={border} surfaceColor={surf}
            minDate={new Date()} availability={BUS_AVAILABILITY} />
        </View>

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
          <Ionicons name="bus" size={20} color="#FFF" />
          <Text style={[s.searchBtnTxt, { color: '#FFF' }]}>{loading ? 'Scanning Highways...' : `Find Buses  ·  ${adults + children} seats`}</Text>
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={{ marginBottom: 12, marginTop: 12 }}><Text style={[s.resultsTitle, { color: txt1 }]}>🚌  {results.length} buses · {from} → {to}</Text></View>
        )}

        {results.map(b => (
          <TouchableOpacity key={b.id} activeOpacity={0.88} onPress={() => openTicket(b)}
             style={[s.busCard, { backgroundColor: card, borderColor: border }]}>
            <View style={s.busTop}>
              <View style={[s.busIcon, { backgroundColor: darkMode ? b.color + '25' : b.color + '15' }]}>
                <Ionicons name={b.ionIcon} size={24} color={b.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[s.busName, { color: txt1 }]}>{b.name}</Text>
                <Text style={[s.busType2, { color: txt2 }]}>{b.type}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.busPrice, { color: txt1 }]}>₹{b.price}</Text>
                <View style={s.ratingRow2}><Ionicons name="star" size={12} color="#F59E0B" /><Text style={[s.ratingTxt2, { color: txt2 }]}>{b.rating}</Text></View>
              </View>
            </View>
            <View style={s.timeRow}>
              <View style={s.timeBlock}><Text style={[s.timeMain, { color: txt1 }]}>{b.dep}</Text><Text style={[s.timeStn, { color: txt2 }]}>{from.substring(0,3).toUpperCase()}</Text></View>
              <View style={s.timeMid}>
                <Text style={[s.timeDur, { color: txt2 }]}>{b.dur}</Text>
                <View style={[s.timeLine, { backgroundColor: border }]} />
                <View style={ss2.sleepRow}>
                  <Ionicons name={b.type.includes('Sleeper') ? 'moon' : 'person'} size={12} color={b.color} />
                  <Text style={[ss2.sleepTag, { color: b.color }]}>{b.type.includes('Sleeper') ? 'Sleeper' : 'Seater'}</Text>
                </View>
              </View>
              <View style={[s.timeBlock, { alignItems: 'flex-end' }]}><Text style={[s.timeMain, { color: txt1 }]}>{b.arr}</Text><Text style={[s.timeStn, { color: txt2 }]}>{to.substring(0,3).toUpperCase()}</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {b.amenities.map(a => (
                <View key={a} style={[s.amenityTag, { backgroundColor: card, borderColor: border }]}>
                  <Text style={[s.amenityTxt, { color: txt1 }]}>{a}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={[s.busFooter, { borderTopColor: border }]}>
              <Text style={[s.seatsLeft, { color: txt2 }]}>{adults + children > 1 ? `${adults + children} seats` : '1 seat'}</Text>
              <View style={[s.bookBtn, { backgroundColor: accent.fg }]}><Text style={s.bookBtnTxt}>SELECT</Text></View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ticket Modal */}
      <Modal visible={!!ticket} transparent animationType="slide">
        <View style={s.modalBg}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setTicket(null)} />
          <View style={[s.ticketSheet, { backgroundColor: card }]}>
            <View style={[s.ticketStrip, { backgroundColor: accent.fg }]}>
              <Ionicons name="bus" size={26} color="#FFF" />
              <Text style={[s.ticketStripTitle, { color: '#FFF' }]}>BUS E-TICKET</Text>
            </View>
            <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
              <View style={[s.pnrBox, { backgroundColor: darkMode ? accent.fg + '1A' : accent.bg, borderColor: border }]}>
                <Text style={[s.pnrLabel, { color: txt2 }]}>BOOKING REFERNCE</Text>
                <Text style={[s.pnrVal, { color: accent.fg }]}>{ticket?.ref}</Text>
              </View>

              <View style={[s.ticketInfoRow, { borderColor: border }]}>
                <View style={{ flex: 1 }}><Text style={[s.tickLabel, { color: txt2 }]}>OPERATOR</Text><Text style={[s.tickVal, { color: txt1 }]}>{ticket?.name}</Text><Text style={[s.tickSub, { color: accent.fg }]}>{ticket?.type}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={[s.tickLabel, { color: txt2 }]}>DATE</Text><Text style={[s.tickVal, { color: txt1 }]}>{ticket?.date}</Text></View>
              </View>
              
              <View style={[s.ticketJourneyRow, { borderColor: border }]}>
                <View style={s.journeyBlock}><Text style={[s.tickLabel, { color: txt2 }]}>DEPARTURE</Text><Text style={[s.journeyTime, { color: txt1 }]}>{ticket?.dep}</Text><Text style={[s.journeyStn, { color: txt2 }]}>{ticket?.from}</Text></View>
                <View style={s.journeyMidBlock}><View style={[s.journeyLine, { backgroundColor: accent.fg }]} /><Ionicons name="bus" size={24} color={accent.fg} /><View style={[s.journeyLine, { backgroundColor: accent.fg }]} /></View>
                <View style={[s.journeyBlock, { alignItems: 'flex-end' }]}><Text style={[s.tickLabel, { color: txt2 }]}>ARRIVAL</Text><Text style={[s.journeyTime, { color: txt1 }]}>{ticket?.arr}</Text><Text style={[s.journeyStn, { color: txt2 }]}>{ticket?.to}</Text></View>
              </View>

              <View style={[s.ticketInfoRow, { borderColor: border }]}>
                <View><Text style={[s.tickLabel, { color: txt2 }]}>PASSENGER</Text><Text style={[s.tickVal, { color: txt1 }]}>{ticket?.passenger}</Text><Text style={[s.tickSub, { color: txt2 }]}>Seat: {ticket?.seat}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={[s.tickLabel, { color: txt2 }]}>TOTAL FARE</Text><Text style={[ss2.priceMain, { color: txt1, fontSize: 24 }]}>₹{ticket?.price}</Text><Text style={[s.tickSub, { color: txt2 }]}>{adults}A {children}C</Text></View>
              </View>

              <View style={[s.qrBox, { backgroundColor: surf, borderColor: border }]}>
                <Ionicons name="qr-code" size={90} color={accent.fg} />
                <Text style={[s.qrLabel, { color: txt2 }]}>Show to driver at boarding</Text>
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
  
  card: { ...CLAY_CARD_V2, padding: 22, marginBottom: 20 },
  cardLabel: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  
  routeInputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, borderWidth: 1.5, padding: 18, gap: 12 },
  routeTxt: { flex: 1, fontSize: 20, fontFamily: FONTS.display, fontWeight: '900' },
  swapRowBtn: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  swapLine: { flex: 1, height: 2, borderRadius: 1 },
  swapCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginHorizontal: 12 },
  
  groupLabel: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '900', marginBottom: 12 },
  
  passengerRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  counterGroup: { flex: 1, alignItems: 'center' },
  counterLabel: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '800', marginBottom: 10 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  counterVal: { fontSize: 24, fontFamily: FONTS.display, fontWeight: '900', minWidth: 30, textAlign: 'center' },
  passengerDivider: { width: 1.5, height: 50 },
  
  searchBtn: { ...CLAY_BTN_V2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, gap: 10, marginBottom: 24 },
  searchBtnTxt: { fontSize: 16, fontFamily: FONTS.display, fontWeight: '900' },
  
  resultsTitle: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '900' },
  busCard: { ...CLAY_CARD_V2, padding: 20, marginBottom: 16 },
  busTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  busIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  busName: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900' },
  busType2: { fontSize: 13, fontFamily: FONTS.body, marginTop: 4 },
  busPrice: { fontSize: 22, fontFamily: FONTS.display, fontWeight: '900' },
  ratingRow2: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, justifyContent: 'flex-end' },
  ratingTxt2: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '800' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timeBlock: { width: 70 },
  timeMain: { fontSize: 24, fontFamily: FONTS.display, fontWeight: '900' },
  timeStn: { fontSize: 12, fontFamily: FONTS.display, marginTop: 4, fontWeight: '800' },
  timeMid: { flex: 1, alignItems: 'center', paddingHorizontal: 10, gap: 8 },
  timeDur: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '800' },
  timeLine: { height: 2, width: '100%', borderRadius: 1 },
  amenityTag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, marginRight: 10, borderWidth: 1.5 },
  amenityTxt: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '800' },
  busFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1.5 },
  seatsLeft: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '800' },
  bookBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  bookBtnTxt: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 0.5, color: '#FFF' },
  
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

const ss2 = StyleSheet.create({
  sleepTag: { fontSize: 10, fontWeight: '800' },
  priceMain: { fontSize: 24, fontWeight: '900' },
  sleepRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
});
