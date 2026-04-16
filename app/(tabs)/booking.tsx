import React, { useState } from 'react';
import {
  Modal, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NC } from '../../src/constants/theme';

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_TICKETS = [
  {
    id: 't1', type: 'TRAIN', status: 'CONFIRMED',
    from: 'Guntur', fromCode: 'GNT', fromTime: '06:45',
    to: 'Ajmer', toCode: 'AII', toTime: '18:20',
    date: '22 Apr 2026', duration: '11h 35m',
    train: 'Rajdhani Express', number: '12951',
    class: '3AC', coach: 'B4', seat: '32 LB',
    pnr: 'PNR8472910', passengers: 3,
    price: '₹2,670', color: '#39653f',
  },
  {
    id: 't2', type: 'FLIGHT', status: 'CONFIRMED',
    from: 'Delhi', fromCode: 'DEL', fromTime: '14:30',
    to: 'Singapore', toCode: 'SIN', toTime: '23:55',
    date: '28 Apr 2026', duration: '5h 25m',
    train: 'IndiGo 6E-85', number: '6E-85',
    class: 'Economy', coach: '—', seat: '14A, 14B, 14C',
    pnr: 'INDIGO-KX7291', passengers: 3,
    price: '₹55,500', color: '#0d6661',
  },
  {
    id: 't3', type: 'BUS', status: 'PENDING',
    from: 'Ajmer', fromCode: 'AJM', fromTime: '08:00',
    to: 'Delhi', toCode: 'DEL', toTime: '14:30',
    date: '27 Apr 2026', duration: '6h 30m',
    train: 'RSRTC Volvo AC', number: 'RJ-14-PA-0012',
    class: 'AC Sleeper', coach: 'D', seat: '7, 8, 9',
    pnr: 'BUS-RJ-44821', passengers: 3,
    price: '₹1,350', color: '#47624b',
  },
];

const DUMMY_HOTELS = [
  {
    id: 'h1', name: 'The Ajmer Grand', city: 'Ajmer',
    checkIn: '22 Apr 2026', checkOut: '27 Apr 2026', nights: 5,
    roomType: 'Deluxe Double', rooms: 2,
    pricePerNight: '₹2,800', total: '₹28,000',
    status: 'CONFIRMED', rating: '4.2',
    amenities: ['WiFi', 'AC', 'Breakfast', 'Pool'],
    address: 'Near Dargah Sharif, Ajmer, Rajasthan',
    color: '#39653f',
  },
  {
    id: 'h2', name: 'Marina Bay Suites', city: 'Singapore',
    checkIn: '29 Apr 2026', checkOut: '05 May 2026', nights: 6,
    roomType: 'Superior Twin', rooms: 2,
    pricePerNight: 'S$180', total: 'S$2,160',
    status: 'CONFIRMED', rating: '4.6',
    amenities: ['WiFi', 'AC', 'Pool', 'Gym', 'Spa'],
    address: '10 Bayfront Ave, Marina Bay, Singapore',
    color: '#0d6661',
  },
  {
    id: 'h3', name: 'Hotel Janpath', city: 'Delhi',
    checkIn: '27 Apr 2026', checkOut: '28 Apr 2026', nights: 1,
    roomType: 'Standard Room', rooms: 1,
    pricePerNight: '₹3,500', total: '₹3,500',
    status: 'PENDING', rating: '3.8',
    amenities: ['WiFi', 'AC', 'Breakfast'],
    address: 'Janpath Road, Connaught Place, New Delhi',
    color: '#47624b',
  },
];

const TABS = ['Tickets', 'Hotels', 'Wallet'];

// ─── Ticket Detail Modal ──────────────────────────────────────────────────────
function TicketModal({ ticket, onClose }: { ticket: typeof DUMMY_TICKETS[0]; onClose: () => void }) {
  return (
    <Modal visible animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.handle} />

          {/* Header strip */}
          <View style={[m.strip, { backgroundColor: ticket.color }]}>
            <View style={m.stripLeft}>
              <Text style={m.stripType}>{ticket.type}</Text>
              <Text style={m.stripTrain}>{ticket.train}</Text>
              <Text style={m.stripNum}>#{ticket.number}</Text>
            </View>
            <View style={[m.statusBadge, { backgroundColor: ticket.status === 'CONFIRMED' ? 'rgba(255,255,255,0.25)' : 'rgba(255,200,0,0.3)' }]}>
              <Text style={m.statusText}>{ticket.status}</Text>
            </View>
          </View>

          {/* Route */}
          <View style={m.routeRow}>
            <View style={m.routeCity}>
              <Text style={m.routeTime}>{ticket.fromTime}</Text>
              <Text style={m.routeCityName}>{ticket.from}</Text>
              <Text style={m.routeCode}>{ticket.fromCode}</Text>
            </View>
            <View style={m.routeMid}>
              <Text style={m.routeDur}>{ticket.duration}</Text>
              <View style={m.routeLine}>
                <View style={[m.routeDot, { backgroundColor: ticket.color }]} />
                <View style={[m.routeTrack, { backgroundColor: ticket.color + '40' }]} />
                <View style={[m.routeDot, { backgroundColor: ticket.color }]} />
              </View>
              <Text style={m.routeDate}>{ticket.date}</Text>
            </View>
            <View style={[m.routeCity, { alignItems: 'flex-end' }]}>
              <Text style={m.routeTime}>{ticket.toTime}</Text>
              <Text style={m.routeCityName}>{ticket.to}</Text>
              <Text style={m.routeCode}>{ticket.toCode}</Text>
            </View>
          </View>

          {/* Perforated divider */}
          <View style={m.perfRow}>
            <View style={[m.perfCircle, { left: -20 }]} />
            <View style={m.perfDash} />
            <View style={[m.perfCircle, { right: -20 }]} />
          </View>

          {/* Details grid */}
          <View style={m.detailGrid}>
            {[
              { label: 'PNR / Booking ID', value: ticket.pnr },
              { label: 'Class', value: ticket.class },
              { label: 'Coach / Seat', value: `${ticket.coach} · ${ticket.seat}` },
              { label: 'Passengers', value: `${ticket.passengers} travellers` },
              { label: 'Total Fare', value: ticket.price },
            ].map(d => (
              <View key={d.label} style={m.detailItem}>
                <Text style={m.detailLabel}>{d.label}</Text>
                <Text style={m.detailValue}>{d.value}</Text>
              </View>
            ))}
          </View>

          {/* QR placeholder */}
          <View style={[m.qrBox, { borderColor: ticket.color + '40' }]}>
            <View style={[m.qrInner, { backgroundColor: ticket.color + '12' }]}>
              <Text style={[m.qrText, { color: ticket.color }]}>QR</Text>
              <Text style={m.qrSub}>{ticket.pnr}</Text>
            </View>
          </View>

          <TouchableOpacity style={[m.closeBtn, { backgroundColor: ticket.color }]} onPress={onClose}>
            <Text style={m.closeBtnText}>Close Ticket</Text>
          </TouchableOpacity>
          <View style={{ height: 20 }} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Hotel Detail Modal ───────────────────────────────────────────────────────
function HotelModal({ hotel, onClose }: { hotel: typeof DUMMY_HOTELS[0]; onClose: () => void }) {
  return (
    <Modal visible animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.handle} />
          <View style={[m.strip, { backgroundColor: hotel.color }]}>
            <View style={m.stripLeft}>
              <Text style={m.stripType}>HOTEL</Text>
              <Text style={m.stripTrain}>{hotel.name}</Text>
              <Text style={m.stripNum}>{hotel.city}</Text>
            </View>
            <View style={[m.statusBadge, { backgroundColor: hotel.status === 'CONFIRMED' ? 'rgba(255,255,255,0.25)' : 'rgba(255,200,0,0.3)' }]}>
              <Text style={m.statusText}>{hotel.status}</Text>
            </View>
          </View>

          <View style={m.routeRow}>
            <View style={m.routeCity}>
              <Text style={m.routeTime}>Check-in</Text>
              <Text style={m.routeCityName}>{hotel.checkIn}</Text>
              <Text style={m.routeCode}>14:00</Text>
            </View>
            <View style={m.routeMid}>
              <Text style={m.routeDur}>{hotel.nights} nights</Text>
              <View style={m.routeLine}>
                <View style={[m.routeDot, { backgroundColor: hotel.color }]} />
                <View style={[m.routeTrack, { backgroundColor: hotel.color + '40' }]} />
                <View style={[m.routeDot, { backgroundColor: hotel.color }]} />
              </View>
              <Text style={[m.routeDate, { color: hotel.color }]}>{hotel.rating} stars</Text>
            </View>
            <View style={[m.routeCity, { alignItems: 'flex-end' }]}>
              <Text style={m.routeTime}>Check-out</Text>
              <Text style={m.routeCityName}>{hotel.checkOut}</Text>
              <Text style={m.routeCode}>11:00</Text>
            </View>
          </View>

          <View style={m.perfRow}>
            <View style={[m.perfCircle, { left: -20 }]} />
            <View style={m.perfDash} />
            <View style={[m.perfCircle, { right: -20 }]} />
          </View>

          <View style={m.detailGrid}>
            {[
              { label: 'Room Type', value: hotel.roomType },
              { label: 'Rooms', value: `${hotel.rooms} rooms` },
              { label: 'Per Night', value: hotel.pricePerNight },
              { label: 'Total', value: hotel.total },
              { label: 'Address', value: hotel.address },
            ].map(d => (
              <View key={d.label} style={m.detailItem}>
                <Text style={m.detailLabel}>{d.label}</Text>
                <Text style={m.detailValue}>{d.value}</Text>
              </View>
            ))}
          </View>

          <View style={m.amenitiesRow}>
            {hotel.amenities.map(a => (
              <View key={a} style={[m.amenityChip, { borderColor: hotel.color + '50' }]}>
                <Text style={[m.amenityText, { color: hotel.color }]}>{a}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={[m.closeBtn, { backgroundColor: hotel.color }]} onPress={onClose}>
            <Text style={m.closeBtnText}>Close</Text>
          </TouchableOpacity>
          <View style={{ height: 20 }} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BookingScreen() {
  const [tab, setTab] = useState('Tickets');
  const [selectedTicket, setSelectedTicket] = useState<typeof DUMMY_TICKETS[0] | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<typeof DUMMY_HOTELS[0] | null>(null);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.heading}>Booking</Text>
          <Text style={s.sub}>India to Singapore Journey</Text>
        </View>

        {/* Tab bar */}
        <View style={s.tabBar}>
          {TABS.map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[s.tabBtn, tab === t && s.tabBtnActive]}>
              <Text style={[s.tabBtnText, tab === t && s.tabBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── TICKETS ── */}
        {tab === 'Tickets' && (
          <>
            <Text style={s.sectionLabel}>{DUMMY_TICKETS.length} tickets · Tap to view</Text>
            {DUMMY_TICKETS.map((ticket, i) => (
              <TouchableOpacity key={ticket.id} onPress={() => setSelectedTicket(ticket)} activeOpacity={0.85}>
                <View style={[s.ticketCard, { borderLeftColor: ticket.color }]}>
                  {/* Top row */}
                  <View style={s.ticketTop}>
                    <View style={[s.typeBadge, { backgroundColor: ticket.color }]}>
                      <Text style={s.typeBadgeText}>{ticket.type}</Text>
                    </View>
                    <Text style={s.ticketTrain}>{ticket.train}</Text>
                    <View style={[s.statusPill, { backgroundColor: ticket.status === 'CONFIRMED' ? NC.primaryFixed : '#FFF9C4' }]}>
                      <Text style={[s.statusPillText, { color: ticket.status === 'CONFIRMED' ? NC.onPrimaryFixed : '#F9A825' }]}>
                        {ticket.status}
                      </Text>
                    </View>
                  </View>
                  {/* Route */}
                  <View style={s.ticketRoute}>
                    <View style={s.ticketCity}>
                      <Text style={s.ticketTime}>{ticket.fromTime}</Text>
                      <Text style={s.ticketCityName}>{ticket.from}</Text>
                    </View>
                    <View style={s.ticketMid}>
                      <Text style={s.ticketDur}>{ticket.duration}</Text>
                      <View style={s.ticketTrack}>
                        <View style={[s.trackDot, { backgroundColor: ticket.color }]} />
                        <View style={[s.trackLine, { backgroundColor: ticket.color + '30' }]} />
                        <View style={[s.trackDot, { backgroundColor: ticket.color }]} />
                      </View>
                    </View>
                    <View style={[s.ticketCity, { alignItems: 'flex-end' }]}>
                      <Text style={s.ticketTime}>{ticket.toTime}</Text>
                      <Text style={s.ticketCityName}>{ticket.to}</Text>
                    </View>
                  </View>
                  {/* Footer */}
                  <View style={s.ticketFooter}>
                    <Text style={s.ticketDate}>{ticket.date}</Text>
                    <Text style={s.ticketClass}>{ticket.class} · {ticket.passengers} pax</Text>
                    <Text style={[s.ticketPrice, { color: ticket.color }]}>{ticket.price}</Text>
                  </View>
                  {/* Tap hint */}
                  <View style={[s.tapHint, { backgroundColor: ticket.color + '12' }]}>
                    <Text style={[s.tapHintText, { color: ticket.color }]}>Tap to view full ticket</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── HOTELS ── */}
        {tab === 'Hotels' && (
          <>
            <Text style={s.sectionLabel}>{DUMMY_HOTELS.length} hotels · Tap to view</Text>
            {DUMMY_HOTELS.map(hotel => (
              <TouchableOpacity key={hotel.id} onPress={() => setSelectedHotel(hotel)} activeOpacity={0.85}>
                <View style={[s.hotelCard, { borderLeftColor: hotel.color }]}>
                  <View style={s.hotelTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.hotelName}>{hotel.name}</Text>
                      <Text style={s.hotelCity}>{hotel.city}</Text>
                    </View>
                    <View style={[s.statusPill, { backgroundColor: hotel.status === 'CONFIRMED' ? NC.primaryFixed : '#FFF9C4' }]}>
                      <Text style={[s.statusPillText, { color: hotel.status === 'CONFIRMED' ? NC.onPrimaryFixed : '#F9A825' }]}>
                        {hotel.status}
                      </Text>
                    </View>
                  </View>
                  <View style={s.hotelDates}>
                    <View style={s.hotelDateItem}>
                      <Text style={s.hotelDateLabel}>CHECK-IN</Text>
                      <Text style={s.hotelDateVal}>{hotel.checkIn}</Text>
                    </View>
                    <View style={[s.hotelNightsBadge, { backgroundColor: hotel.color }]}>
                      <Text style={s.hotelNightsText}>{hotel.nights}N</Text>
                    </View>
                    <View style={[s.hotelDateItem, { alignItems: 'flex-end' }]}>
                      <Text style={s.hotelDateLabel}>CHECK-OUT</Text>
                      <Text style={s.hotelDateVal}>{hotel.checkOut}</Text>
                    </View>
                  </View>
                  <View style={s.hotelFooter}>
                    <Text style={s.hotelRoom}>{hotel.roomType} · {hotel.rooms} rooms</Text>
                    <Text style={[s.hotelTotal, { color: hotel.color }]}>{hotel.total}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── WALLET ── */}
        {tab === 'Wallet' && (
          <>
            <View style={s.walletHero}>
              <Text style={s.walletLabel}>Total Trip Cost</Text>
              <Text style={s.walletAmount}>₹87,020</Text>
              <Text style={s.walletSub}>3 travellers · 13 days</Text>
              <View style={s.walletBar}>
                <View style={[s.walletFill, { width: '62%' }]} />
              </View>
              <View style={s.walletMeta}>
                <Text style={s.walletMetaText}>62% utilized</Text>
                <Text style={s.walletMetaText}>₹33,000 remaining</Text>
              </View>
            </View>
            {[
              { label: 'Train Tickets', amount: '₹4,020', pct: '5%', color: NC.primary },
              { label: 'Flight Tickets', amount: '₹55,500', pct: '64%', color: NC.tertiary },
              { label: 'Bus Tickets', amount: '₹1,350', pct: '2%', color: NC.secondary },
              { label: 'Hotels', amount: '₹31,500', pct: '36%', color: '#47624b' },
            ].map(item => (
              <View key={item.label} style={s.walletItem}>
                <View style={[s.walletDot, { backgroundColor: item.color }]} />
                <Text style={s.walletItemLabel}>{item.label}</Text>
                <Text style={s.walletItemPct}>{item.pct}</Text>
                <Text style={[s.walletItemAmt, { color: item.color }]}>{item.amount}</Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {selectedTicket && <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
      {selectedHotel && <HotelModal hotel={selectedHotel} onClose={() => setSelectedHotel(null)} />}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  scroll: { paddingHorizontal: 18, paddingBottom: 20 },
  header: { marginTop: 8, marginBottom: 22 },
  heading: { fontSize: 30, fontWeight: '900', color: NC.onSurface, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: NC.onSurfaceVariant, marginTop: 3, fontWeight: '600' },

  // Tab bar — clay pill with inflated look
  tabBar: {
    flexDirection: 'row', backgroundColor: NC.surfaceLow, borderRadius: 999,
    padding: 5, marginBottom: 22,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.35)',
    borderRightColor: 'rgba(165,214,167,0.25)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 18, elevation: 8,
  },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center' },
  tabBtnActive: {
    backgroundColor: NC.surfaceLowest,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.4)', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 6,
  },
  tabBtnText: { fontSize: 14, fontWeight: '700', color: NC.onSurfaceVariant },
  tabBtnTextActive: { color: NC.primary, fontWeight: '900' },

  sectionLabel: { fontSize: 12, fontWeight: '800', color: NC.onSurfaceVariant, marginBottom: 16, letterSpacing: 0.4 },

  // Ticket card — inflated pillow
  ticketCard: {
    backgroundColor: NC.surfaceLowest, borderRadius: 36, marginBottom: 18,
    borderLeftWidth: 6, borderLeftColor: NC.primary,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    borderRightColor: 'rgba(165,214,167,0.2)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 10,
    overflow: 'hidden',
  },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 18, paddingBottom: 14 },
  typeBadge: {
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  typeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  ticketTrain: { flex: 1, color: NC.onSurface, fontSize: 14, fontWeight: '800' },
  statusPill: {
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  statusPillText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  ticketRoute: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 14 },
  ticketCity: { alignItems: 'flex-start', minWidth: 70 },
  ticketTime: { fontSize: 24, fontWeight: '900', color: NC.onSurface },
  ticketCityName: { fontSize: 12, color: NC.onSurfaceVariant, fontWeight: '700', marginTop: 2 },
  ticketMid: { flex: 1, alignItems: 'center', gap: 4 },
  ticketDur: { fontSize: 11, color: NC.onSurfaceVariant, fontWeight: '700' },
  ticketTrack: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  trackDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)' },
  trackLine: { flex: 1, height: 3, borderRadius: 2 },
  ticketFooter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 12, gap: 8 },
  ticketDate: { color: NC.onSurfaceVariant, fontSize: 12, fontWeight: '600', flex: 1 },
  ticketClass: { color: NC.onSurfaceVariant, fontSize: 12 },
  ticketPrice: { fontSize: 17, fontWeight: '900' },
  tapHint: {
    paddingVertical: 10, alignItems: 'center',
    backgroundColor: 'rgba(165,214,167,0.1)',
    borderTopWidth: 1.5, borderTopColor: 'rgba(165,214,167,0.15)',
  },
  tapHintText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },

  // Hotel card — inflated pillow
  hotelCard: {
    backgroundColor: NC.surfaceLowest, borderRadius: 36, marginBottom: 18,
    borderLeftWidth: 6, borderLeftColor: NC.primary,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    borderRightColor: 'rgba(165,214,167,0.2)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 10,
    padding: 18,
  },
  hotelTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  hotelName: { fontSize: 19, fontWeight: '900', color: NC.onSurface },
  hotelCity: { fontSize: 12, color: NC.onSurfaceVariant, marginTop: 3 },
  hotelDates: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  hotelDateItem: { flex: 1 },
  hotelDateLabel: { fontSize: 9, fontWeight: '800', color: NC.onSurfaceVariant, letterSpacing: 1.2, marginBottom: 4 },
  hotelDateVal: { fontSize: 16, fontWeight: '800', color: NC.onSurface },
  hotelNightsBadge: {
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 10,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    borderTopColor: 'rgba(255,255,255,0.7)',
    shadowColor: 'rgba(27,94,32,0.3)', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 5,
  },
  hotelNightsText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  hotelFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hotelRoom: { color: NC.onSurfaceVariant, fontSize: 13, fontWeight: '600' },
  hotelTotal: { fontSize: 20, fontWeight: '900' },

  // Wallet — hero + items with clay
  walletHero: {
    backgroundColor: NC.primary, borderRadius: 40, padding: 26, marginBottom: 18,
    borderWidth: 2.5, borderColor: 'rgba(165,214,167,0.35)',
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderLeftColor: 'rgba(255,255,255,0.2)',
    shadowColor: 'rgba(27,94,32,0.5)', shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1, shadowRadius: 28, elevation: 14,
  },
  walletLabel: { color: 'rgba(197,248,199,0.85)', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  walletAmount: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  walletSub: { color: 'rgba(197,248,199,0.7)', fontSize: 13, marginTop: 4, marginBottom: 18 },
  walletBar: {
    height: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden', marginBottom: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
  },
  walletFill: { height: '100%', backgroundColor: NC.primaryFixed, borderRadius: 999 },
  walletMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  walletMetaText: { color: 'rgba(197,248,199,0.85)', fontSize: 12, fontWeight: '700' },
  walletItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: NC.surfaceLowest, borderRadius: 28, padding: 16, marginBottom: 10,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    borderRightColor: 'rgba(165,214,167,0.2)',
    shadowColor: 'rgba(165,214,167,0.45)', shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 14, elevation: 6,
  },
  walletDot: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)',
  },
  walletItemLabel: { flex: 1, color: NC.onSurface, fontSize: 14, fontWeight: '700' },
  walletItemPct: { color: NC.onSurfaceVariant, fontSize: 13 },
  walletItemAmt: { fontSize: 15, fontWeight: '900' },
});



// ─── Modal Styles — Clay Bottom Sheet ──────────────────────────────────────────
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: NC.surfaceLowest, borderTopLeftRadius: 44, borderTopRightRadius: 44,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1, shadowRadius: 28, elevation: 24,
  },
  handle: { width: 44, height: 6, backgroundColor: NC.surfaceHigh, borderRadius: 3, alignSelf: 'center', marginTop: 14, marginBottom: 2 },

  strip: { padding: 22, paddingTop: 18, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderTopLeftRadius: 44, borderTopRightRadius: 44, overflow: 'hidden' },
  stripLeft: {},
  stripType: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  stripTrain: { color: '#fff', fontSize: 22, fontWeight: '900' },
  stripNum: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 3 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  routeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 26, paddingVertical: 22 },
  routeCity: { alignItems: 'flex-start', minWidth: 80 },
  routeTime: { fontSize: 26, fontWeight: '900', color: NC.onSurface },
  routeCityName: { fontSize: 15, fontWeight: '800', color: NC.onSurface, marginTop: 3 },
  routeCode: { fontSize: 12, color: NC.onSurfaceVariant, marginTop: 2 },
  routeMid: { flex: 1, alignItems: 'center', gap: 6 },
  routeDur: { fontSize: 13, fontWeight: '800', color: NC.onSurfaceVariant },
  routeLine: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  routeDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)' },
  routeTrack: { flex: 1, height: 3, borderRadius: 2 },
  routeDate: { fontSize: 12, color: NC.onSurfaceVariant, fontWeight: '700' },

  perfRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 0, marginBottom: 6, position: 'relative' },
  perfCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: NC.background, position: 'absolute', zIndex: 2 },
  perfDash: { flex: 1, height: 1.5, borderWidth: 1, borderColor: NC.surfaceHigh, borderStyle: 'dashed', marginHorizontal: 18 },

  detailGrid: { paddingHorizontal: 26, paddingTop: 18, gap: 14 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { color: NC.onSurfaceVariant, fontSize: 13, fontWeight: '600' },
  detailValue: { color: NC.onSurface, fontSize: 14, fontWeight: '800', maxWidth: '60%', textAlign: 'right' },

  qrBox: { margin: 26, borderRadius: 28, borderWidth: 2.5, overflow: 'hidden', borderColor: 'rgba(165,214,167,0.3)' },
  qrInner: { padding: 26, alignItems: 'center', backgroundColor: 'rgba(232,245,233,0.5)' },
  qrText: { fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  qrSub: { color: NC.onSurfaceVariant, fontSize: 12, marginTop: 8, fontWeight: '700' },

  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 26, paddingBottom: 10 },
  amenityChip: {
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 2, backgroundColor: NC.surfaceLow,
    borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.2)', shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  amenityText: { fontSize: 12, fontWeight: '800' },

  closeBtn: {
    marginHorizontal: 26, marginTop: 10, borderRadius: 999, paddingVertical: 20, alignItems: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.5)',
    borderTopColor: 'rgba(255,255,255,0.7)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    shadowColor: 'rgba(27,94,32,0.4)', shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 18, elevation: 10,
  },
  closeBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
});
