import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Alert, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { downloadTicketPDF } from '../../src/services/ticketPDF';

const { width, height } = Dimensions.get('window');

const MOVIES = [
  { id: '1', title: 'Dune: Part Two', genre: 'Sci-Fi · Adventure', rating: 4.9, dur: '2h 46m', lang: 'EN', ionIcon: 'planet-outline' as const, color: '#B45309', synopsis: 'Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.' },
  { id: '2', title: 'Oppenheimer', genre: 'Drama · History', rating: 4.8, dur: '3h 0m', lang: 'EN', ionIcon: 'nuclear-outline' as const, color: '#7C3AED', synopsis: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during WWII.' },
  { id: '3', title: 'Spider-Man: Across the Spider-Verse', genre: 'Animation · Sci-Fi', rating: 5.0, dur: '2h 20m', lang: 'EN/HI', ionIcon: 'infinite-outline' as const, color: '#DC2626', synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People.' },
  { id: '4', title: 'John Wick: Chapter 4', genre: 'Action · Thriller', rating: 4.8, dur: '2h 51m', lang: 'EN', ionIcon: 'flash-outline' as const, color: '#1F2937', synopsis: 'John Wick uncovers a path to defeating The High Table.' },
  { id: '5', title: 'Guardians of the Galaxy 3', genre: 'Action · Sci-Fi', rating: 4.7, dur: '2h 30m', lang: 'EN/HI', ionIcon: 'rocket-outline' as const, color: '#065F46', synopsis: 'The Guardians embark on a mission to protect Rocket from his past.' },
  { id: '6', title: 'Mission: Impossible 7', genre: 'Action · Spy', rating: 4.8, dur: '2h 43m', lang: 'EN', ionIcon: 'shield-outline' as const, color: '#B91C1C', synopsis: 'Ethan Hunt and his IMF team embark on their most dangerous mission yet.' },
  { id: '7', title: 'Barbie', genre: 'Comedy · Fantasy', rating: 4.6, dur: '1h 54m', lang: 'EN/HI', ionIcon: 'heart-outline' as const, color: '#BE185D', synopsis: 'Barbie and Ken are having the time of their lives in Barbieland.' },
  { id: '8', title: 'Avatar: The Way of Water', genre: 'Sci-Fi · Fantasy', rating: 4.9, dur: '3h 12m', lang: 'EN/HI/TE', ionIcon: 'water-outline' as const, color: '#0369A1', synopsis: 'Jake Sully and his family do what it takes to stay together.' },
  { id: '9', title: 'Pathaan', genre: 'Action · Spy', rating: 4.6, dur: '2h 26m', lang: 'HI', ionIcon: 'flag-outline' as const, color: '#DC2626', synopsis: 'India\'s most dangerous spy Pathaan takes on a private mercenary army.' },
  { id: '10', title: 'Jawan', genre: 'Action · Thriller', rating: 4.7, dur: '2h 49m', lang: 'HI', ionIcon: 'star-outline' as const, color: '#059669', synopsis: 'A man is driven by a personal vendetta to rectify the wrongs in society.' },
];

const THEATERS = [
  { id: 'T1', name: 'PVR Platinum Select', location: 'Phoenix Mall', dist: '2.1 km', screens: 8, features: ['IMAX', '4DX', 'Dolby'] },
  { id: 'T2', name: 'INOX Insignia', location: 'Orion Mall', dist: '3.6 km', screens: 6, features: ['4K', 'Dolby Atmos'] },
  { id: 'T3', name: 'Cinepolis Luxe', location: 'Elements Mall', dist: '4.2 km', screens: 5, features: ['Luxury Recliners'] },
  { id: 'T4', name: 'Carnival QUBE', location: 'Forum Mall', dist: '5.8 km', screens: 4, features: ['QUBE', 'Dolby'] },
  { id: 'T5', name: 'Miraj Cinemas', location: 'Market Road', dist: '7.1 km', screens: 3, features: ['Standard'] },
];

const SHOWTIMES = ['10:30 AM', '01:15 PM', '04:00 PM', '07:30 PM', '10:15 PM'];

export default function RoamioCineScreen() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  const bg      = darkMode ? '#0A0010' : '#FDF2F8';
  const card    = darkMode ? '#120820' : '#FFFFFF';
  const border  = darkMode ? '#2D1A3D' : 'rgba(236,72,153,0.2)';
  const primary = darkMode ? '#F472B6' : '#DB2777';
  const onPri   = '#FFF';
  const txt1    = darkMode ? '#F1F5F9' : '#500724';
  const txt2    = darkMode ? '#6B7280' : '#6B7280';
  const surface = darkMode ? '#0A0010' : '#FDF2F8';

  const [selectedMovie, setSelectedMovie] = useState<typeof MOVIES[0] | null>(null);
  const [selectedTheater, setSelectedTheater] = useState<typeof THEATERS[0] | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [ticket, setTicket] = useState<any>(null);

  const handleBooking = () => {
    if (!selectedMovie || !selectedTheater || !selectedTime) {
      Alert.alert('Incomplete', 'Please select movie, theater, and showtime.');
      return;
    }
    setTicket({
      movie: selectedMovie,
      theater: selectedTheater,
      time: selectedTime,
      passenger: 'Patan Salar Khan',
      seats: Array.from({ length: adults + children }, (_, i) => `H${10 + i}`).join(', '),
      ref: 'RM-C' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      fare: adults * 350 + children * 200,
      date: 'Today, 26 Apr 2026',
    });
    setSelectedMovie(null);
    setSelectedTheater(null);
    setSelectedTime('');
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!ticket || downloading) return;
    setDownloading(true);
    try {
      await downloadTicketPDF({
        type: 'MOVIE',
        ref: ticket.ref,
        passenger: ticket.passenger,
        seat: ticket.seats,
        price: ticket.fare,
        operator: ticket.theater?.name || 'PVR',
        date: ticket.date,
        movie: ticket.movie?.title,
        cinema: ticket.theater?.name,
        showtime: ticket.time,
        screen: `Audi ${ticket.theater?.screens || 4}`,
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: bg }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: card, borderColor: border }]}>
            <Ionicons name="chevron-back" size={20} color={txt1} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.headerSup, { color: txt2 }]}>NOW SHOWING</Text>
            <Text style={[s.headerTitle, { color: txt1 }]}>Roamio Cine</Text>
          </View>
          <View style={[s.headerIconBox, { backgroundColor: primary + '18' }]}>
            <Ionicons name="film" size={24} color={primary} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

        {/* ── Step 1: Movies ─────────────────────── */}
        <View style={[s.stepHeader, { backgroundColor: selectedMovie ? primary : border }]}>
          <View style={[s.stepNum, { backgroundColor: selectedMovie ? card : surface }]}>
            <Text style={[s.stepNumTxt, { color: selectedMovie ? primary : txt2 }]}>{selectedMovie ? '✓' : '1'}</Text>
          </View>
          <Text style={[s.stepTitle, { color: selectedMovie ? onPri : txt1 }]}>
            {selectedMovie ? selectedMovie.title : 'Choose a Movie'}
          </Text>
          {selectedMovie && (
            <TouchableOpacity onPress={() => setSelectedMovie(null)}>
              <Ionicons name="close-circle" size={22} color={onPri} />
            </TouchableOpacity>
          )}
        </View>

        {!selectedMovie && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 22 }} nestedScrollEnabled>
            {MOVIES.map(m => (
              <TouchableOpacity key={m.id} onPress={() => setSelectedMovie(m)} activeOpacity={0.88}
                style={[s.movieCard, { backgroundColor: card, borderColor: border }]}>
                <View style={[s.movieEmojiBox, { backgroundColor: m.color + '22' }]}>
                  <Ionicons name={m.ionIcon} size={28} color={m.color} />
                </View>
                <View style={[s.movieRatingBadge, { backgroundColor: m.color }]}>
                  <Ionicons name="star" size={8} color="#FFF" />
                  <Text style={s.movieRatingTxt}>{m.rating}</Text>
                </View>
                <Text style={[s.movieTitle2, { color: txt1 }]} numberOfLines={2}>{m.title}</Text>
                <Text style={[s.movieGenre2, { color: txt2 }]} numberOfLines={1}>{m.genre}</Text>
                <View style={s.movieMetaRow}>
                  <View style={[s.langTag, { backgroundColor: m.color + '22', borderColor: m.color + '44' }]}>
                    <Text style={[s.langTagTxt, { color: m.color }]}>{m.lang}</Text>
                  </View>
                  <Text style={[s.durTxt, { color: txt2 }]}>{m.dur}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Step 2: Theater ────────────────────── */}
        {selectedMovie && (
          <>
            <View style={[s.stepHeader, { backgroundColor: selectedTheater ? primary : border }]}>
              <View style={[s.stepNum, { backgroundColor: selectedTheater ? card : surface }]}>
                <Text style={[s.stepNumTxt, { color: selectedTheater ? primary : txt2 }]}>{selectedTheater ? '✓' : '2'}</Text>
              </View>
              <Text style={[s.stepTitle, { color: selectedTheater ? onPri : txt1 }]}>
                {selectedTheater ? selectedTheater.name : 'Choose Theater'}
              </Text>
              {selectedTheater && (
                <TouchableOpacity onPress={() => { setSelectedTheater(null); setSelectedTime(''); }}>
                  <Ionicons name="close-circle" size={22} color={onPri} />
                </TouchableOpacity>
              )}
            </View>

            {!selectedTheater && THEATERS.map(t => (
              <TouchableOpacity key={t.id} activeOpacity={0.88} onPress={() => setSelectedTheater(t)}>
                <View style={[s.theaterCard, { backgroundColor: card, borderColor: border }]}>
                  <View style={[s.theaterIcon, { backgroundColor: primary + '18' }]}>
                    <Ionicons name="videocam" size={22} color={primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={[s.theaterName2, { color: txt1 }]}>{t.name}</Text>
                    <Text style={[s.theaterSub, { color: txt2 }]}>{t.location} · {t.dist} · {t.screens} screens</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                      {t.features.map(f => (
                        <View key={f} style={[s.featureTag, { backgroundColor: primary + '18', borderColor: primary + '33' }]}>
                          <Text style={[s.featureTagTxt, { color: primary }]}>{f}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={txt2} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── Step 3: Showtime ───────────────────── */}
        {selectedMovie && selectedTheater && (
          <>
            <View style={[s.stepHeader, { backgroundColor: selectedTime ? primary : border }]}>
              <View style={[s.stepNum, { backgroundColor: selectedTime ? card : surface }]}>
                <Text style={[s.stepNumTxt, { color: selectedTime ? primary : txt2 }]}>{selectedTime ? '✓' : '3'}</Text>
              </View>
              <Text style={[s.stepTitle, { color: selectedTime ? onPri : txt1 }]}>
                {selectedTime ? `✓  ${selectedTime}` : 'Select Showtime'}
              </Text>
            </View>

            <View style={s.showtimeRow}>
              {SHOWTIMES.map(t => (
                <TouchableOpacity key={t} onPress={() => setSelectedTime(t)}
                  style={[s.showtime, { backgroundColor: selectedTime === t ? primary : card, borderColor: selectedTime === t ? primary : border }]}>
                  <Text style={[s.showtimeTxt, { color: selectedTime === t ? onPri : txt2 }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Passengers */}
            <View style={[s.card, { backgroundColor: card, borderColor: border }]}>
              <Text style={[s.cardLabel, { color: txt2 }]}>TICKETS</Text>
              <View style={s.passengerRow}>
                <View style={s.counterGroup}>
                  <Text style={[s.counterLabel, { color: txt1 }]}>Adults (₹350)</Text>
                  <View style={s.counterRow}>
                    <TouchableOpacity onPress={() => setAdults(Math.max(1, adults - 1))} style={[s.counterBtn, { borderColor: border, backgroundColor: surface }]}>
                      <Ionicons name="remove" size={16} color={primary} />
                    </TouchableOpacity>
                    <Text style={[s.counterVal, { color: txt1 }]}>{adults}</Text>
                    <TouchableOpacity onPress={() => setAdults(Math.min(8, adults + 1))} style={[s.counterBtn, { borderColor: border, backgroundColor: surface }]}>
                      <Ionicons name="add" size={16} color={primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[s.passengerDivider, { backgroundColor: border }]} />
                <View style={s.counterGroup}>
                  <Text style={[s.counterLabel, { color: txt1 }]}>Children (₹200)</Text>
                  <View style={s.counterRow}>
                    <TouchableOpacity onPress={() => setChildren(Math.max(0, children - 1))} style={[s.counterBtn, { borderColor: border, backgroundColor: surface }]}>
                      <Ionicons name="remove" size={16} color={primary} />
                    </TouchableOpacity>
                    <Text style={[s.counterVal, { color: txt1 }]}>{children}</Text>
                    <TouchableOpacity onPress={() => setChildren(Math.min(6, children + 1))} style={[s.counterBtn, { borderColor: border, backgroundColor: surface }]}>
                      <Ionicons name="add" size={16} color={primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={[s.fareSummary, { backgroundColor: primary + '15', borderColor: primary + '33' }]}>
                <Text style={[s.fareSummaryTxt, { color: txt1 }]}>Total Fare</Text>
                <Text style={[s.fareSummaryAmt, { color: primary }]}>₹{adults * 350 + children * 200}</Text>
              </View>
            </View>

            <TouchableOpacity style={[s.bookNowBtn, { backgroundColor: primary }]} onPress={handleBooking} activeOpacity={0.85}>
              <Ionicons name="ticket" size={20} color={onPri} />
              <Text style={[s.bookNowBtnTxt, { color: onPri }]}>Reserve {adults + children} Seat{adults + children > 1 ? 's' : ''}  ·  ₹{adults * 350 + children * 200}</Text>
            </TouchableOpacity>
          </>
        )}

        {!selectedMovie && (
          <>
            <Text style={[s.sectionLabel, { color: txt1 }]}>Theaters Near You</Text>
            {THEATERS.map(t => (
              <View key={t.id} style={[s.theaterCard, { backgroundColor: card, borderColor: border }]}>
                <View style={[s.theaterIcon, { backgroundColor: primary + '18' }]}>
                  <Text style={{ fontSize: 22 }}>🎦</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[s.theaterName2, { color: txt1 }]}>{t.name}</Text>
                  <Text style={[s.theaterSub, { color: txt2 }]}>{t.location} · {t.dist}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                    {t.features.map(f => (
                      <View key={f} style={[s.featureTag, { backgroundColor: primary + '18', borderColor: primary + '33' }]}>
                        <Text style={[s.featureTagTxt, { color: primary }]}>{f}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* ── M-Ticket Modal ──────────────────────── */}
      <Modal visible={!!ticket} transparent animationType="slide" onRequestClose={() => setTicket(null)}>
        <View style={s.modalBg}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setTicket(null)} />
          <View style={[s.ticketSheet, { backgroundColor: card }]}>
            <View style={[s.ticketStrip, { backgroundColor: ticket?.movie?.color || primary }]}>
              <Ionicons name="film" size={24} color="#FFF" />
              <Text style={s.ticketStripTitle}>M — TICKET</Text>
              <Ionicons name="checkmark-circle" size={26} color="#FFF" />
            </View>
            <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
              <View style={[s.pnrBox, { backgroundColor: (ticket?.movie?.color || primary) + '15', borderColor: (ticket?.movie?.color || primary) + '40' }]}>
                <Text style={[s.pnrLabel, { color: txt2 }]}>BOOKING REFERENCE</Text>
                <Text style={[s.pnrVal, { color: ticket?.movie?.color || primary }]}>{ticket?.ref}</Text>
              </View>
              <View style={[s.ticketInfoRow, { borderColor: border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.tickLabel, { color: txt2 }]}>MOVIE</Text>
                  <Text style={[s.tickVal, { color: txt1 }]} numberOfLines={1}>{ticket?.movie?.title}</Text>
                  <Text style={[s.tickSub, { color: ticket?.movie?.color || primary }]}>{ticket?.movie?.genre} · {ticket?.movie?.dur}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.tickLabel, { color: txt2 }]}>CERT.</Text>
                  <Text style={[s.tickVal, { color: txt1 }]}>{ticket?.movie?.lang || 'UA'}</Text>
                </View>
              </View>
              <View style={[s.ticketInfoRow, { borderColor: border }]}>
                <View>
                  <Text style={[s.tickLabel, { color: txt2 }]}>CINEMA</Text>
                  <Text style={[s.tickVal, { color: txt1 }]}>{ticket?.theater?.name}</Text>
                  <Text style={[s.tickSub, { color: txt2 }]}>{ticket?.theater?.location}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.tickLabel, { color: txt2 }]}>SHOWTIME</Text>
                  <Text style={[s.tickVal, { color: txt1 }]}>{ticket?.time}</Text>
                  <Text style={[s.tickSub, { color: txt2 }]}>{ticket?.date}</Text>
                </View>
              </View>
              <View style={[s.ticketInfoRow, { borderColor: border }]}>
                <View>
                  <Text style={[s.tickLabel, { color: txt2 }]}>AUDIENCE</Text>
                  <Text style={[s.tickVal, { color: txt1 }]}>{ticket?.passenger}</Text>
                  <Text style={[s.tickSub, { color: txt2 }]}>Seats: {ticket?.seats}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.tickLabel, { color: txt2 }]}>TOTAL PAID</Text>
                  <Text style={[s.priceMain, { color: txt1 }]}>₹{ticket?.fare}</Text>
                </View>
              </View>
              <View style={[s.qrBox, { backgroundColor: surface, borderColor: border }]}>
                <Ionicons name="qr-code" size={90} color={ticket?.movie?.color || primary} />
                <Text style={[s.qrLabel, { color: txt2 }]}>Show at cinema entry · Audi {ticket?.theater?.screens || 4}</Text>
              </View>
              <TouchableOpacity
                style={[s.downloadBtn, { backgroundColor: ticket?.movie?.color || primary, opacity: downloading ? 0.65 : 1 }]}
                onPress={handleDownload}
                disabled={downloading}
                activeOpacity={0.85}
              >
                <Ionicons name={downloading ? 'hourglass-outline' : 'download-outline'} size={20} color="#FFF" />
                <Text style={s.downloadBtnTxt}>
                  {downloading ? 'Generating PDF...' : 'Download M-Ticket (PDF)'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.closeBtn2, { borderColor: border, backgroundColor: surface }]} onPress={() => setTicket(null)}>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  headerSup: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  backBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16, marginBottom: 14, gap: 12 },
  stepNum: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepNumTxt: { fontSize: 13, fontWeight: '900' },
  stepTitle: { flex: 1, fontSize: 15, fontWeight: '900' },
  // Movie card
  movieCard: { width: 160, marginRight: 14, borderRadius: 20, borderWidth: 1.5, padding: 14, marginBottom: 4 },
  movieEmojiBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  movieEmoji: { fontSize: 30 },
  movieRatingBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  movieRatingTxt: { fontSize: 10, fontWeight: '900', color: '#FFF' },
  movieTitle2: { fontSize: 13, fontWeight: '900', lineHeight: 18, marginBottom: 4 },
  movieGenre2: { fontSize: 10, marginBottom: 8 },
  movieMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  langTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, borderWidth: 1 },
  langTagTxt: { fontSize: 9, fontWeight: '900' },
  durTxt: { fontSize: 10, fontWeight: '700' },
  // Theater card
  theaterCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1.5, padding: 16, marginBottom: 12 },
  theaterIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  theaterName2: { fontSize: 14, fontWeight: '900' },
  theaterSub: { fontSize: 11, marginTop: 3, lineHeight: 16 },
  featureTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, marginRight: 8 },
  featureTagTxt: { fontSize: 10, fontWeight: '800' },
  // Showtime
  showtimeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  showtime: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5 },
  showtimeTxt: { fontSize: 13, fontWeight: '800' },
  // Passengers
  card: { borderRadius: 22, padding: 20, marginBottom: 16, borderWidth: 1.5 },
  cardLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  passengerRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  counterGroup: { flex: 1, alignItems: 'center' },
  counterLabel: { fontSize: 12, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  counterVal: { fontSize: 22, fontWeight: '900', minWidth: 30, textAlign: 'center' },
  passengerDivider: { width: 1, height: 50 },
  fareSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 16, marginTop: 16 },
  fareSummaryTxt: { fontSize: 14, fontWeight: '800' },
  fareSummaryAmt: { fontSize: 22, fontWeight: '900' },
  bookNowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 20, gap: 10, marginBottom: 24, elevation: 6, shadowColor: '#DB2777', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  bookNowBtnTxt: { fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  sectionLabel: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3, marginBottom: 14 },
  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  ticketSheet: { borderTopLeftRadius: 36, borderTopRightRadius: 36, maxHeight: height * 0.9, overflow: 'hidden' },
  ticketStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
  ticketStripTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 1.5, color: '#FFF' },
  pnrBox: { borderRadius: 18, borderWidth: 1.5, padding: 18, alignItems: 'center', marginBottom: 20 },
  pnrLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  pnrVal: { fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  ticketInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  tickLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 },
  tickVal: { fontSize: 17, fontWeight: '900' },
  tickSub: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  priceMain: { fontSize: 20, fontWeight: '900' },
  qrBox: { borderRadius: 20, borderWidth: 1.5, padding: 28, alignItems: 'center', marginTop: 20, marginBottom: 24 },
  qrLabel: { fontSize: 12, fontWeight: '700', marginTop: 10 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 58, borderRadius: 20, gap: 10, marginBottom: 14 },
  downloadBtnTxt: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  closeBtn2: { height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  closeBtnTxt: { fontSize: 14, fontWeight: '800' },
  headerIconBox: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
