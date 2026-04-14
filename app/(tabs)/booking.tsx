import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClayCard } from '../../src/components/clay/ClayCard';
import { useTripStore } from '../../src/store/tripStore';
import { useFamilyStore } from '../../src/store/familyStore';
import { TRANSPORT_ICONS } from '../../src/constants/tripData';
import { useCurrency } from '../../src/hooks/useCurrency';

const TABS = ['Tickets', 'Hotels', 'Wallet', 'Documents'];

export default function BookingScreen() {
  const [tab, setTab] = useState('Tickets');
  const paths = useTripStore((s) => s.paths);
  const nodes = useTripStore((s) => s.nodes);
  const members = useFamilyStore((s) => s.members);
  const totalBudget = useFamilyStore((s) => s.totalBudget);
  const spentBudget = useTripStore((s) => s.spentBudget);
  const { fmtFull } = useCurrency();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>🎫 Booking</Text>

        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabChip, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'Tickets' && paths.map((path, i) => {
          const from = nodes.find((n) => n.id === path.fromNodeId);
          const to = nodes.find((n) => n.id === path.toNodeId);
          const opt = path.options.find((o) => o.mode === path.selectedMode);
          return (
            <ClayCard key={path.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketNum}>#{i + 1}</Text>
                <Text style={styles.ticketMode}>{TRANSPORT_ICONS[path.selectedMode]} {path.selectedMode.toUpperCase()}</Text>
                <View style={[styles.ticketStatus, { backgroundColor: path.isGreyedOut ? '#FFCCBC' : '#C8E6C9' }]}>
                  <Text style={{ color: path.isGreyedOut ? '#BF360C' : '#1B5E20', fontSize: 10, fontWeight: '700' }}>
                    {path.isGreyedOut ? 'OVER BUDGET' : 'CONFIRMED'}
                  </Text>
                </View>
              </View>
              <View style={styles.ticketRoute}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.ticketCity}>{from?.city}</Text>
                  <Text style={styles.ticketCountry}>{from?.country}</Text>
                </View>
                <View style={styles.ticketArrow}>
                  <View style={styles.ticketLine} />
                  <Text style={{ fontSize: 18 }}>{TRANSPORT_ICONS[path.selectedMode]}</Text>
                  <View style={styles.ticketLine} />
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.ticketCity}>{to?.city}</Text>
                  <Text style={styles.ticketCountry}>{to?.country}</Text>
                </View>
              </View>
              <View style={styles.ticketFooter}>
                <Text style={styles.ticketLabel}>{opt?.label ?? '-'}</Text>
                <Text style={styles.ticketCost}>{fmtFull(opt?.cost ?? 0)} · {opt?.durationHrs}h</Text>
              </View>
              <View style={styles.dottedLine} />
              <Text style={styles.qrPlaceholder}>▦ QR Code · {members.length} passengers</Text>
            </ClayCard>
          );
        })}

        {tab === 'Hotels' && nodes.map((node) => (
          <ClayCard key={node.id} style={styles.hotelCard}>
            <View style={styles.hotelRow}>
              <Text style={styles.hotelCity}>🏨 {node.city}</Text>
              <Text style={styles.hotelCost}>{fmtFull(node.totalStayCost)}</Text>
            </View>
            <Text style={styles.hotelSub}>{node.stayNights} nights · {fmtFull(node.hotelCostPerNight)}/night</Text>
            <View style={[styles.hotelStatus, { backgroundColor: node.isLocked ? '#FFF9C4' : '#C8E6C9' }]}>
              <Text style={{ color: node.isLocked ? '#F57F17' : '#1B5E20', fontSize: 11, fontWeight: '700' }}>
                {node.isLocked ? '🔒 LOCKED IN' : '⏳ PENDING'}
              </Text>
            </View>
          </ClayCard>
        ))}

        {tab === 'Wallet' && (
          <>
            <ClayCard style={styles.walletCard}>
              <Text style={styles.walletTitle}>💰 Family Wallet</Text>
              <View style={styles.walletRow}>
                <View>
                  <Text style={styles.walletLabel}>Total Budget</Text>
                  <Text style={styles.walletValue}>{fmtFull(totalBudget)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.walletLabel}>Trip Cost</Text>
                  <Text style={[styles.walletValue, { color: '#FF7043' }]}>{fmtFull(spentBudget)}</Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min((spentBudget / totalBudget) * 100, 100)}%` as any }]} />
              </View>
              <Text style={styles.walletSub}>Remaining: {fmtFull(totalBudget - spentBudget)}</Text>
            </ClayCard>
            <Text style={styles.sectionTitle}>Per Person Split</Text>
            {members.map((m) => (
              <ClayCard key={m.id} style={styles.memberCard}>
                <View style={styles.memberRow}>
                  <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <Text style={styles.memberRelation}>{m.relation}</Text>
                  </View>
                  <Text style={styles.memberShare}>{fmtFull(spentBudget / members.length)}</Text>
                </View>
              </ClayCard>
            ))}
          </>
        )}

        {tab === 'Documents' && (
          <>
            <Text style={styles.sectionTitle}>Travel Documents</Text>
            {members.map((m) => (
              <ClayCard key={m.id} style={styles.docCard}>
                <View style={styles.memberRow}>
                  <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <Text style={styles.memberRelation}>{m.relation} · Age {m.age}</Text>
                  </View>
                  {m.isLeader && (
                    <View style={styles.leaderBadge}>
                      <Text style={styles.leaderText}>LEADER</Text>
                    </View>
                  )}
                </View>
                <View style={styles.docRow}>
                  <View style={styles.docItem}>
                    <Text style={styles.docLabel}>Passport</Text>
                    <Text style={styles.docValue}>{m.passportNo ?? '— Not added'}</Text>
                  </View>
                  <View style={styles.docItem}>
                    <Text style={styles.docLabel}>Aadhar</Text>
                    <Text style={styles.docValue}>{m.aadharNo ?? '— Not added'}</Text>
                  </View>
                </View>
              </ClayCard>
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  scroll: { padding: 16 },
  heading: { color: '#1B5E20', fontSize: 24, fontWeight: '800', marginBottom: 16 },
  tabRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  tabChip: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#C8E6C9', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)' },
  tabActive: { backgroundColor: '#4CAF50' },
  tabText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },
  tabTextActive: { color: '#FFF' },
  ticketCard: { marginBottom: 12 },
  ticketHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  ticketNum: { color: '#558B2F', fontSize: 11 },
  ticketMode: { color: '#1B5E20', fontSize: 13, fontWeight: '700', flex: 1 },
  ticketStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ticketRoute: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  ticketCity: { color: '#1B5E20', fontSize: 16, fontWeight: '800' },
  ticketCountry: { color: '#558B2F', fontSize: 10 },
  ticketArrow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  ticketLine: { flex: 1, height: 1, backgroundColor: '#A5D6A7' },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  ticketLabel: { color: '#2E7D32', fontSize: 12 },
  ticketCost: { color: '#1B5E20', fontSize: 13, fontWeight: '700' },
  dottedLine: { borderTopWidth: 1, borderTopColor: '#A5D6A7', borderStyle: 'dashed', marginVertical: 10 },
  qrPlaceholder: { color: '#81C784', fontSize: 12, textAlign: 'center' },
  hotelCard: { marginBottom: 10 },
  hotelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  hotelCity: { color: '#1B5E20', fontSize: 16, fontWeight: '700' },
  hotelCost: { color: '#2E7D32', fontSize: 16, fontWeight: '800' },
  hotelSub: { color: '#558B2F', fontSize: 11, marginBottom: 8 },
  hotelStatus: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  walletCard: { marginBottom: 16 },
  walletTitle: { color: '#1B5E20', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  walletLabel: { color: '#558B2F', fontSize: 11 },
  walletValue: { color: '#1B5E20', fontSize: 22, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: '#C8E6C9', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#4CAF50' },
  walletSub: { color: '#2E7D32', fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: '#558B2F', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  memberCard: { marginBottom: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
  memberName: { color: '#1B5E20', fontSize: 14, fontWeight: '700' },
  memberRelation: { color: '#558B2F', fontSize: 11 },
  memberShare: { color: '#2E7D32', fontSize: 16, fontWeight: '800' },
  docCard: { marginBottom: 10 },
  docRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  docItem: { flex: 1, backgroundColor: '#C8E6C9', borderRadius: 12, padding: 10 },
  docLabel: { color: '#558B2F', fontSize: 10, marginBottom: 4 },
  docValue: { color: '#1B5E20', fontSize: 12, fontWeight: '600' },
  leaderBadge: { backgroundColor: '#FFF9C4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#FFD700' },
  leaderText: { color: '#F57F17', fontSize: 9, fontWeight: '800' },
});
