/**
 * Roamio Air (Flights) — Mint Liquid Clay v2
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

const AIRLINES = [
  { id: 'SQ401', name: 'Singapore Airlines', code: 'SQ', dep: '09:00', arr: '17:40', dur: '6h 10m', stops: 'Non-stop', price: 45200, rating: 4.9, color: '#1D4ED8', icon: '🦁' },
  { id: 'AI382', name: 'Air India', code: 'AI', dep: '11:30', arr: '19:10', dur: '6h 10m', stops: 'Non-stop', price: 32800, rating: 4.4, color: '#DC2626', icon: '🇮🇳' },
  { id: '6E051', name: 'IndiGo', code: '6E', dep: '15:20', arr: '23:30', dur: '6h 40m', stops: 'Non-stop', price: 18500, rating: 4.2, color: '#4F46E5', icon: '💙' },
  { id: 'UK115', name: 'Vistara', code: 'UK', dep: '21:00', arr: '05:40+1', dur: '6h 10m', stops: 'Non-stop', price: 38900, rating: 4.7, color: '#7C3AED', icon: '⭐' },
];

const CABINS = ['Economy', 'Premium Eco', 'Business', 'First'] as const;

function getMockFlightAvailability(): Record<string, 'available' | 'limited' | 'unavailable'> {
  const avail: Record<string, 'available' | 'limited' | 'unavailable'> = {};
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const r = i % 5;
    avail[key] = r === 4 ? 'unavailable' : r === 3 ? 'limited' : 'available';
  }
  return avail;
}
const FLIGHT_AVAILABILITY = getMockFlightAvailability();

export default function RoamioAirScreen() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  const bg      = darkMode ? '#020F08' : MINT[50];
  const card    = darkMode ? '#0A1A12' : '#FFFFFF';
  const border  = darkMode ? '#163322' : 'rgba(167,243,208,0.4)';
  const txt1    = darkMode ? '#F0FDF4' : MINT[900];
  const txt2    = darkMode ? '#6EE7B7' : MINT[700];
  const surf    = darkMode ? '#0E291B' : MINT[100];
  const accent  = ACCENTS.flight;

  const [from, setFrom] = useState('DEL');
  const [to, setTo] = useState('SIN');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [cabin, setCabin] = useState<typeof CABINS[number]>('Economy');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<typeof AIRLINES>([]);
  const [tripType, setTripType] = useState<'one-way' | 'round'>('one-way');
  const [ticket, setTicket] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const search = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setResults(AIRLINES);
    setLoading(false);
  };

  const openTicket = (f: typeof AIRLINES[0]) => {
    setTicket({
      ...f, from, to,
      date: selectedDate ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not selected',
      passenger: 'Patan Salar Khan',
      seat: cabin === 'Economy' ? '24F (Window)' : '3A (Business)',
      ref: 'RM-F' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      price: cabin === 'Business' ? f.price * 2.8 : cabin === 'First' ? f.price * 4.2 : f.price,
    });
  };

  const handleDownload = async () => {
    if (!ticket || downloading) return;
    setDownloading(true);
    try {
      await downloadTicketPDF({
        type: 'FLIGHT', ref: ticket.ref, from: ticket.from, to: ticket.to, dep: ticket.dep, arr: ticket.arr,
        date: ticket.date, passenger: ticket.passenger, seat: ticket.seat, price: ticket.price,
        operator: ticket.name, class: cabin, flightNo: ticket.id,
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
            <Text style={[s.headerSup, { color: accent.fg }]}>GLOBAL FLIGHTS</Text>
            <Text style={[s.headerTitle, { color: txt1 }]}>Roamio Air</Text>
          </View>
          <View style={[s.headerIconBox, { backgroundColor: darkMode ? accent.fg + '20' : accent.bg }]}>
            <Ionicons name="airplane" size={26} color={accent.fg} />
          </View>
        </View>

        <View style={[s.tabBar, { backgroundColor: card, borderColor: border }]}>
          {(['one-way', 'round'] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTripType(t)}
              style={[s.tabItem, tripType === t && { backgroundColor: darkMode ? accent.fg + '20' : accent.bg }]} activeOpacity={0.8}>
              <Text style={[s.tabText, { color: tripType === t ? accent.fg : txt2 }]}>
                {t === 'one-way' ? 'One Way' : 'Round Trip'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={[s.card, { backgroundColor: card, borderColor: border }]}>
          <Text style={[s.cardLabel, { color: txt2 }]}>AIRPORTS (IATA)</Text>
          <View style={[s.routeBox, { backgroundColor: surf, borderColor: border }]}>
            <View style={{ flex: 1, padding: 16 }}>
              <Text style={[s.routeTag, { color: accent.fg }]}>FROM</Text>
              <TextInput value={from} onChangeText={t => setFrom(t.toUpperCase())} style={[s.routeInput, { color: txt1 }]} autoCapitalize="characters" maxLength={3} />
            </View>
            <TouchableOpacity onPress={() => { const tmp = from; setFrom(to); setTo(tmp); }}
              style={[s.swapBtn, { backgroundColor: darkMode ? accent.fg + '20' : accent.bg, borderColor: border }]}>
              <Ionicons name="swap-horizontal" size={20} color={accent.fg} />
            </TouchableOpacity>
            <View style={{ flex: 1, padding: 16, alignItems: 'flex-end' }}>
              <Text style={[s.routeTag, { color: txt2 }]}>TO</Text>
              <TextInput value={to} onChangeText={t => setTo(t.toUpperCase())} style={[s.routeInput, { color: txt1, textAlign: 'right' }]} autoCapitalize="characters" maxLength={3} />
            </View>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={[s.groupLabel, { color: txt1 }]}>Departure Date</Text>
          <CalendarPicker label="Select Date" selectedDate={selectedDate} onDateSelect={setSelectedDate} 
            primaryColor={accent.fg} textColor={txt1} subTextColor={txt2} cardColor={card} borderColor={border} surfaceColor={surf}
            minDate={new Date()} availability={FLIGHT_AVAILABILITY} />
        </View>

        <Text style={[s.groupLabel, { color: txt1 }]}>Cabin Class</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {CABINS.map(c => (
            <TouchableOpacity key={c} onPress={() => setCabin(c)}
              style={[s.classPill, { backgroundColor: cabin === c ? accent.fg : card, borderColor: cabin === c ? accent.fg : border }]}>
              <Text style={[s.classPillTxt, { color: cabin === c ? '#FFF' : txt2 }]}>{c}</Text>
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
                <TouchableOpacity onPress={() => setAdults(Math.min(9, adults + 1))} style={[s.counterBtn, { backgroundColor: surf }]}>
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
          <Ionicons name="airplane" size={20} color="#FFF" />
          <Text style={[s.searchBtnTxt, { color: '#FFF' }]}>{loading ? 'Scanning Universe...' : `Search Flights  ·  ${adults + children} pax`}</Text>
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={{ marginBottom: 12, marginTop: 12 }}><Text style={[s.resultsTitle, { color: txt1 }]}>✈️  {results.length} flights · {from} → {to}</Text></View>
        )}
        {results.map(f => (
          <TouchableOpacity key={f.id} activeOpacity={0.88} onPress={() => openTicket(f)}
               style={[s.resultCard, { backgroundColor: card, borderColor: border }]}>
            <View style={s.resultTop}>
              <View style={[s.airlineIconBox, { backgroundColor: darkMode ? f.color + '25' : f.color + '15' }]}>
                <Ionicons name="airplane" size={24} color={f.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[s.trainName, { color: txt1 }]}>{f.name}</Text>
                <Text style={[s.trainId, { color: txt2 }]}>{f.id} · {f.stops}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.priceMain, { color: txt1 }]}>₹{(cabin === 'Business' ? f.price * 2.8 : cabin === 'First' ? f.price * 4.2 : f.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                <Text style={[s.priceSub, { color: txt2 }]}>per person</Text>
              </View>
            </View>
            <View style={s.timeRow}>
              <View style={s.timeBlock}><Text style={[s.timeMain, { color: txt1 }]}>{f.dep}</Text><Text style={[s.timeStn, { color: txt2 }]}>{from}</Text></View>
              <View style={s.timeMid}>
                <Text style={[s.timeDur, { color: txt2 }]}>{f.dur}</Text>
                <View style={[s.timeLine, { backgroundColor: border }]} />
                <Text style={[s.timeStops, { color: f.stops.includes('Stop') ? '#F59E0B' : accent.fg }]}>{f.stops.includes('Stop') ? '⚑ ' + f.stops : '⚡ DIRECT'}</Text>
              </View>
              <View style={[s.timeBlock, { alignItems: 'flex-end' }]}><Text style={[s.timeMain, { color: txt1 }]}>{f.arr}</Text><Text style={[s.timeStn, { color: txt2 }]}>{to}</Text></View>
            </View>
            <View style={[s.resultFooter, { borderTopColor: border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={[s.ratingTxt, { color: txt2 }]}>{f.rating} · {cabin}</Text>
              </View>
              <View style={[s.bookBtn, { backgroundColor: accent.fg }]}><Text style={[s.bookBtnTxt, { color: '#FFF' }]}>SELECT</Text></View>
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
              <Ionicons name="airplane" size={26} color="#FFF" />
              <Text style={[s.ticketStripTitle, { color: '#FFF' }]}>BOARDING PASS</Text>
            </View>
            <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
              <View style={[s.pnrBox, { backgroundColor: darkMode ? accent.fg + '1A' : accent.bg, borderColor: border }]}>
                <Text style={[s.pnrLabel, { color: txt2 }]}>BOOKING REFERNCE</Text>
                <Text style={[s.pnrVal, { color: accent.fg }]}>{ticket?.ref}</Text>
              </View>

              <View style={[s.ticketInfoRow, { borderColor: border }]}>
                <View style={{ flex: 1 }}><Text style={[s.tickLabel, { color: txt2 }]}>AIRLINE</Text><Text style={[s.tickVal, { color: txt1 }]}>{ticket?.name}</Text><Text style={[s.tickSub, { color: accent.fg }]}>{ticket?.id} · {cabin}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={[s.tickLabel, { color: txt2 }]}>DATE</Text><Text style={[s.tickVal, { color: txt1 }]}>{ticket?.date}</Text><Text style={[s.tickSub, { color: txt2 }]}>{ticket?.stops}</Text></View>
              </View>
              
              <View style={[s.ticketJourneyRow, { borderColor: border }]}>
                <View style={s.journeyBlock}><Text style={[s.tickLabel, { color: txt2 }]}>DEPARTURE</Text><Text style={[s.journeyTime, { color: txt1 }]}>{ticket?.dep}</Text><Text style={[s.journeyStn, { color: txt2 }]}>{ticket?.from}</Text></View>
                <View style={s.journeyMidBlock}><View style={[s.journeyLine, { backgroundColor: accent.fg }]} /><Ionicons name="airplane" size={24} color={accent.fg} /><View style={[s.journeyLine, { backgroundColor: accent.fg }]} /></View>
                <View style={[s.journeyBlock, { alignItems: 'flex-end' }]}><Text style={[s.tickLabel, { color: txt2 }]}>ARRIVAL</Text><Text style={[s.journeyTime, { color: txt1 }]}>{ticket?.arr}</Text><Text style={[s.journeyStn, { color: txt2 }]}>{ticket?.to}</Text></View>
              </View>

              <View style={[s.ticketInfoRow, { borderColor: border }]}>
                <View><Text style={[s.tickLabel, { color: txt2 }]}>PASSENGER</Text><Text style={[s.tickVal, { color: txt1 }]}>{ticket?.passenger}</Text><Text style={[s.tickSub, { color: txt2 }]}>Seat: {ticket?.seat}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={[s.tickLabel, { color: txt2 }]}>TOTAL FARE</Text><Text style={[s.priceMain, { color: txt1, fontSize: 24 }]}>₹{ticket?.price?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text><Text style={[s.tickSub, { color: txt2 }]}>{adults}A {children}C</Text></View>
              </View>

              <View style={[s.qrBox, { backgroundColor: surf, borderColor: border }]}>
                <Ionicons name="qr-code" size={90} color={accent.fg} />
                <Text style={[s.qrLabel, { color: txt2 }]}>Show at Boarding Gate</Text>
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
  routeInput: { fontSize: 32, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 2 },
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
  airlineIconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  trainName: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900' },
  trainId: { fontSize: 13, fontFamily: FONTS.body, marginTop: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  timeBlock: { width: 70 },
  timeMain: { fontSize: 24, fontFamily: FONTS.display, fontWeight: '900' },
  timeStn: { fontSize: 12, fontFamily: FONTS.display, marginTop: 4, fontWeight: '800' },
  timeMid: { flex: 1, alignItems: 'center', paddingHorizontal: 10, gap: 8 },
  timeDur: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '800' },
  timeStops: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 0.5 },
  timeLine: { height: 2, width: '100%', borderRadius: 1 },
  resultFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1.5 },
  ratingTxt: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '800' },
  priceMain: { fontSize: 22, fontFamily: FONTS.display, fontWeight: '900' },
  priceSub: { fontSize: 12, fontFamily: FONTS.body, marginTop: 4, textAlign: 'right' },
  bookBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  bookBtnTxt: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 0.5 },
  
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
