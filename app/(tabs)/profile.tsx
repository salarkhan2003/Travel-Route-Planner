import React, { useState } from 'react';
import {
  Alert, Modal, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ClayCard } from '../../src/components/clay/ClayCard';
import { ClayButton } from '../../src/components/clay/ClayButton';
import { useFamilyStore } from '../../src/store/familyStore';
import { useTripStore } from '../../src/store/tripStore';
import { NC } from '../../src/constants/theme';

const BADGES = [
  { id: 'b1', title: 'Trip Planner', desc: 'Created first itinerary' },
  { id: 'b2', title: 'Sky Traveller', desc: 'Booked first flight' },
  { id: 'b3', title: 'Family CEO', desc: 'Managing 5+ members' },
  { id: 'b4', title: 'International', desc: 'Added Singapore route' },
  { id: 'b5', title: 'Pilgrim', desc: 'Visited spiritual site' },
  { id: 'b6', title: 'Budget Master', desc: 'Stayed under budget' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const members = useFamilyStore((s) => s.members);
  const vows = useFamilyStore((s) => s.vows);
  const fulfillVow = useFamilyStore((s) => s.fulfillVow);
  const addMember = useFamilyStore((s) => s.addMember);
  const removeMember = useFamilyStore((s) => s.removeMember);
  const nodes = useTripStore((s) => s.nodes);
  const spentBudget = useTripStore((s) => s.spentBudget);

  const [showMembers, setShowMembers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newAge, setNewAge] = useState('');

  const leader = members.find((m) => m.isLeader);
  const totalNights = nodes.reduce((s, n) => s + n.stayNights, 0);
  const fulfilledVows = vows.filter((v) => v.fulfilled).length;

  const handleAddMember = () => {
    if (!newName.trim()) return;
    addMember({
      name: newName.trim(),
      relation: newRelation.trim() || 'Member',
      age: parseInt(newAge) || 0,
      emoji: 'T',
      isLeader: false,
    });
    setNewName(''); setNewRelation(''); setNewAge('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={ps.container} edges={['top']}>
      <ScrollView contentContainerStyle={ps.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={ps.header}>
          <Text style={ps.heading}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/settings')} style={ps.settingsBtn}>
            <Text style={ps.settingsBtnText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <ClayCard variant="green" style={ps.heroCard}>
          <View style={ps.heroRow}>
            <View style={ps.avatar}>
              <Text style={ps.avatarText}>{(leader?.name?.[0] ?? 'T').toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ps.heroName}>{leader?.name ?? 'Traveller'}</Text>
              <Text style={ps.heroRole}>Trip CEO · {members.length} members</Text>
              <Text style={ps.heroSub}>India to Singapore Journey</Text>
            </View>
          </View>
          <View style={ps.statsRow}>
            {[
              { label: 'Cities', value: nodes.length },
              { label: 'Nights', value: totalNights },
              { label: 'Members', value: members.length },
              { label: 'Vows', value: `${fulfilledVows}/${vows.length}` },
            ].map((st) => (
              <View key={st.label} style={ps.statItem}>
                <Text style={ps.statValue}>{st.value}</Text>
                <Text style={ps.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </ClayCard>

        {/* Family group */}
        <TouchableOpacity onPress={() => setShowMembers(!showMembers)}>
          <ClayCard style={ps.sectionCard}>
            <View style={ps.sectionHeader}>
              <Text style={ps.sectionTitle}>Family Group</Text>
              <Text style={ps.sectionArrow}>{showMembers ? '▲' : '▼'}</Text>
            </View>
            <Text style={ps.sectionSub}>{members.length} members · Tap to manage</Text>
          </ClayCard>
        </TouchableOpacity>

        {showMembers && (
          <ClayCard style={ps.membersCard}>
            {members.map((m) => (
              <View key={m.id} style={ps.memberRow}>
                <View style={ps.memberAvatar}>
                  <Text style={ps.memberAvatarText}>{m.name[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={ps.memberName}>{m.name}</Text>
                  <Text style={ps.memberRelation}>{m.relation} · Age {m.age}</Text>
                </View>
                {m.isLeader
                  ? <View style={ps.leaderBadge}><Text style={ps.leaderText}>LEADER</Text></View>
                  : <TouchableOpacity onPress={() => Alert.alert('Remove', `Remove ${m.name}?`, [
                      { text: 'Cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => removeMember(m.id) },
                    ])}>
                      <Text style={{ color: NC.error, fontSize: 16, fontWeight: '700' }}>Remove</Text>
                    </TouchableOpacity>
                }
              </View>
            ))}
            <ClayButton label="Add Member" onPress={() => setShowAddModal(true)}
              color={NC.primaryFixed} textColor={NC.onPrimaryFixed} small style={{ marginTop: 12 }} />
          </ClayCard>
        )}

        {/* Trip Vows */}
        <Text style={ps.heading}>Trip Promises</Text>
        <Text style={ps.headingSub}>Long press to mark fulfilled</Text>
        {vows.map((vow) => (
          <TouchableOpacity key={vow.id} onLongPress={() => !vow.fulfilled && fulfillVow(vow.id)} activeOpacity={0.85}>
            <ClayCard style={[ps.vowCard, vow.fulfilled && ps.vowFulfilled]}>
              <View style={ps.vowRow}>
                <View style={[ps.vowDot, { backgroundColor: vow.fulfilled ? '#F9A825' : NC.primary }]} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[ps.vowTitle, vow.fulfilled && { color: '#F9A825' }]}>{vow.title}</Text>
                  <Text style={ps.vowLocation}>{vow.location}</Text>
                </View>
                <View style={[ps.vowStatus, { backgroundColor: vow.fulfilled ? '#FFF9C4' : NC.surfaceLow }]}>
                  <Text style={[ps.vowStatusText, { color: vow.fulfilled ? '#F9A825' : NC.onSurfaceVariant }]}>
                    {vow.fulfilled ? 'Done' : 'Pending'}
                  </Text>
                </View>
              </View>
            </ClayCard>
          </TouchableOpacity>
        ))}

        {/* Spend overview */}
        <Text style={ps.heading}>Spend Overview</Text>
        <ClayCard style={ps.spendCard}>
          {nodes.length === 0 && <Text style={ps.emptyText}>No cities added yet</Text>}
          {nodes.map((n) => {
            const pct = spentBudget > 0 ? (n.totalStayCost / spentBudget) * 100 : 0;
            return (
              <View key={n.id} style={ps.spendRow}>
                <Text style={ps.spendCity}>{n.city}</Text>
                <View style={ps.spendBarBg}>
                  <View style={[ps.spendBarFill, { width: `${pct}%` as any }]} />
                </View>
                <Text style={ps.spendAmt}>₹{n.totalStayCost}</Text>
              </View>
            );
          })}
        </ClayCard>

        {/* Badges */}
        <Text style={ps.heading}>Achievements</Text>
        <View style={ps.badgesGrid}>
          {BADGES.map((b) => (
            <ClayCard key={b.id} style={ps.badgeCard}>
              <View style={ps.badgeIcon}>
                <Text style={ps.badgeIconText}>{b.title[0]}</Text>
              </View>
              <Text style={ps.badgeTitle}>{b.title}</Text>
              <Text style={ps.badgeDesc}>{b.desc}</Text>
            </ClayCard>
          ))}
        </View>

        <ClayButton label="Broadcast to Family"
          onPress={() => Alert.alert('Broadcast', 'Live location sent to all members!')}
          color={NC.primary} style={{ marginTop: 8 }} />
        <ClayButton label="Share Itinerary"
          onPress={() => Alert.alert('Share', 'Itinerary link copied!')}
          color={NC.primaryFixed} textColor={NC.onPrimaryFixed} style={{ marginTop: 10 }} />

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Add Member Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={ps.modalOverlay}>
          <ClayCard style={ps.modalCard}>
            <Text style={ps.modalTitle}>Add Family Member</Text>
            <Text style={ps.inputLabel}>Name *</Text>
            <TextInput style={ps.input} value={newName} onChangeText={setNewName}
              placeholder="e.g. Mom" placeholderTextColor={NC.outlineVariant} />
            <Text style={ps.inputLabel}>Relation</Text>
            <TextInput style={ps.input} value={newRelation} onChangeText={setNewRelation}
              placeholder="e.g. Mother" placeholderTextColor={NC.outlineVariant} />
            <Text style={ps.inputLabel}>Age</Text>
            <TextInput style={ps.input} value={newAge} onChangeText={setNewAge}
              placeholder="e.g. 48" placeholderTextColor={NC.outlineVariant} keyboardType="numeric" />
            <View style={ps.modalBtns}>
              <ClayButton label="Cancel" onPress={() => setShowAddModal(false)}
                color={NC.surfaceLow} textColor={NC.onSurface} small />
              <ClayButton label="Add Member" onPress={handleAddMember} color={NC.primary} small />
            </View>
          </ClayCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const ps = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heading: { fontSize: 26, fontWeight: '900', color: NC.primary, letterSpacing: -0.5 },
  settingsBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50,
    backgroundColor: NC.surfaceLowest, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4,
  },
  settingsBtnText: { color: NC.primary, fontSize: 13, fontWeight: '700' },
  heroCard: { marginBottom: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: NC.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: NC.shadowButton, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8,
  },
  avatarText: { fontSize: 26, fontWeight: '900', color: NC.onPrimary },
  heroName: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  heroRole: { color: 'rgba(197,248,199,0.85)', fontSize: 12, marginTop: 3, fontWeight: '600' },
  heroSub: { color: 'rgba(197,248,199,0.7)', fontSize: 11, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  statItem: { alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  statLabel: { color: 'rgba(197,248,199,0.8)', fontSize: 10, fontWeight: '600', marginTop: 2 },
  sectionCard: { marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: NC.onSurface, fontSize: 15, fontWeight: '800' },
  sectionArrow: { color: NC.onSurfaceVariant, fontSize: 12 },
  sectionSub: { color: NC.onSurfaceVariant, fontSize: 11, marginTop: 4 },
  membersCard: { marginBottom: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: NC.surfaceLow },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: NC.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontSize: 16, fontWeight: '900', color: NC.onPrimaryFixed },
  memberName: { color: NC.onSurface, fontSize: 14, fontWeight: '700' },
  memberRelation: { color: NC.onSurfaceVariant, fontSize: 11, marginTop: 1 },
  leaderBadge: { backgroundColor: '#FFF9C4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, borderWidth: 1, borderColor: '#F9A825' },
  leaderText: { color: '#F9A825', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  heading: { color: NC.onSurface, fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 4 },
  headingSub: { color: NC.onSurfaceVariant, fontSize: 11, marginBottom: 12 },
  vowCard: { marginBottom: 8 },
  vowFulfilled: { borderColor: '#F9A825', borderWidth: 1.5 },
  vowRow: { flexDirection: 'row', alignItems: 'center' },
  vowDot: { width: 12, height: 12, borderRadius: 6 },
  vowTitle: { color: NC.onSurface, fontSize: 14, fontWeight: '700' },
  vowLocation: { color: NC.onSurfaceVariant, fontSize: 11, marginTop: 2 },
  vowStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  vowStatusText: { fontSize: 10, fontWeight: '700' },
  spendCard: { marginBottom: 8 },
  emptyText: { color: NC.onSurfaceVariant, fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  spendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  spendCity: { color: NC.onSurface, fontSize: 12, fontWeight: '600', width: 72 },
  spendBarBg: { flex: 1, height: 8, backgroundColor: NC.surfaceLow, borderRadius: 4, overflow: 'hidden' },
  spendBarFill: { height: '100%', backgroundColor: NC.primary, borderRadius: 4 },
  spendAmt: { color: NC.primary, fontSize: 11, fontWeight: '800', width: 52, textAlign: 'right' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  badgeCard: { width: '47%', alignItems: 'center', padding: 16, marginBottom: 0 },
  badgeIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: NC.primaryFixed, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  badgeIconText: { fontSize: 20, fontWeight: '900', color: NC.onPrimaryFixed },
  badgeTitle: { color: NC.onSurface, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  badgeDesc: { color: NC.onSurfaceVariant, fontSize: 10, textAlign: 'center', marginTop: 3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', padding: 16 },
  modalCard: { paddingBottom: 24 },
  modalTitle: { color: NC.onSurface, fontSize: 20, fontWeight: '900', marginBottom: 20 },
  inputLabel: { color: NC.onSurfaceVariant, fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: NC.surfaceLow, borderRadius: 16, padding: 14,
    color: NC.onSurface, fontSize: 15, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
});
