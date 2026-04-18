import React, { useState } from 'react';
import {
  Alert, Modal, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ClayCard } from '../../src/components/clay/ClayCard';
import { ClayButton } from '../../src/components/clay/ClayButton';
import { useFamilyStore } from '../../src/store/familyStore';
import { useTripStore } from '../../src/store/tripStore';
import { useToastStore } from '../../src/store/toastStore';
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
  const addVow = useFamilyStore((s) => s.addVow);
  const removeVow = useFamilyStore((s) => s.removeVow);
  const nodes = useTripStore((s) => s.nodes);
  const spentBudget = useTripStore((s) => s.spentBudget);
  const showToast = useToastStore((s) => s.showToast);

  const [showMembers, setShowMembers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newAge, setNewAge] = useState('');

  const [showAddVow, setShowAddVow] = useState(false);
  const [vowTitle, setVowTitle] = useState('');
  const [vowLoc, setVowLoc] = useState('');

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
                <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => removeVow(vow.id)}>
                  <Ionicons name="trash-outline" size={18} color={NC.error} />
                </TouchableOpacity>
              </View>
            </ClayCard>
          </TouchableOpacity>
        ))}
        {vows.length === 0 && <Text style={ps.emptyText}>No promises added yet</Text>}
        <ClayButton label="Add Promise" onPress={() => setShowAddVow(true)} color={NC.surfaceLow} textColor={NC.primary} small style={{ marginBottom: 12 }} />

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
          onPress={() => showToast('Live location securely broadcasted!', 'radio')}
          color={NC.primary} style={{ marginTop: 8 }} />
        <ClayButton label="Share Itinerary"
          onPress={() => showToast('Itinerary securely copied to clipboard', 'copy')}
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

      {/* Add Promise Modal */}
      <Modal visible={showAddVow} transparent animationType="slide">
        <View style={ps.modalOverlay}>
          <ClayCard style={ps.modalCard}>
            <Text style={ps.modalTitle}>Trip Promise</Text>
            <Text style={ps.inputLabel}>Promise (e.g. Try Local Food)</Text>
            <TextInput style={ps.input} value={vowTitle} onChangeText={setVowTitle}
              placeholder="Promise title" placeholderTextColor={NC.outlineVariant} />
            <Text style={ps.inputLabel}>Location</Text>
            <TextInput style={ps.input} value={vowLoc} onChangeText={setVowLoc}
              placeholder="e.g. Singapore" placeholderTextColor={NC.outlineVariant} />
            <View style={ps.modalBtns}>
              <ClayButton label="Cancel" onPress={() => setShowAddVow(false)}
                color={NC.surfaceLow} textColor={NC.onSurface} small />
              <ClayButton label="Save Promise" onPress={() => {
                if (vowTitle) { addVow({ title: vowTitle, location: vowLoc || 'Unknown', emoji: 'T' }); setVowTitle(''); setVowLoc(''); setShowAddVow(false); }
              }} color={NC.primary} small />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  heading: { fontSize: 28, fontWeight: '900', color: NC.primary, letterSpacing: -0.5 },
  settingsBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
    backgroundColor: NC.surfaceLowest,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.35)',
    borderRightColor: 'rgba(165,214,167,0.25)',
    shadowColor: 'rgba(165,214,167,0.5)', shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 6,
  },
  settingsBtnText: { color: NC.primary, fontSize: 13, fontWeight: '800' },
  heroCard: { marginBottom: 18 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 22 },
  avatar: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: NC.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(27,94,32,0.25)',
    borderRightColor: 'rgba(27,94,32,0.2)',
    shadowColor: 'rgba(27,94,32,0.4)', shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 14, elevation: 10,
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: NC.onPrimary },
  heroName: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  heroRole: { color: 'rgba(197,248,199,0.85)', fontSize: 13, marginTop: 3, fontWeight: '700' },
  heroSub: { color: 'rgba(197,248,199,0.7)', fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 18, borderTopWidth: 1.5, borderTopColor: 'rgba(255,255,255,0.15)' },
  statItem: { alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  statLabel: { color: 'rgba(197,248,199,0.8)', fontSize: 11, fontWeight: '700', marginTop: 3 },
  sectionCard: { marginBottom: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: NC.onSurface, fontSize: 16, fontWeight: '900' },
  sectionArrow: { color: NC.onSurfaceVariant, fontSize: 14 },
  sectionSub: { color: NC.onSurfaceVariant, fontSize: 12, marginTop: 4 },
  membersCard: { marginBottom: 14 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1.5, borderBottomColor: 'rgba(165,214,167,0.15)' },
  memberAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: NC.primaryFixed,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.3)', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 4,
  },
  memberAvatarText: { fontSize: 17, fontWeight: '900', color: NC.onPrimaryFixed },
  memberName: { color: NC.onSurface, fontSize: 15, fontWeight: '800' },
  memberRelation: { color: NC.onSurfaceVariant, fontSize: 12, marginTop: 2 },
  leaderBadge: {
    backgroundColor: '#FFF9C4', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
    borderWidth: 1.5, borderColor: '#F9A825',
    shadowColor: 'rgba(249,168,37,0.3)', shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  leaderText: { color: '#F9A825', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  vowCard: { marginBottom: 10 },
  headingSub: { color: NC.onSurfaceVariant, fontSize: 12, marginBottom: 14, fontWeight: '600' },
  vowFulfilled: { borderColor: '#F9A825', borderWidth: 2 },
  vowRow: { flexDirection: 'row', alignItems: 'center' },
  vowDot: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)',
  },
  vowTitle: { color: NC.onSurface, fontSize: 15, fontWeight: '800' },
  vowLocation: { color: NC.onSurfaceVariant, fontSize: 12, marginTop: 2 },
  vowStatus: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  vowStatusText: { fontSize: 10, fontWeight: '800' },
  spendCard: { marginBottom: 10 },
  emptyText: { color: NC.onSurfaceVariant, fontSize: 13, textAlign: 'center', paddingVertical: 10 },
  spendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  spendCity: { color: NC.onSurface, fontSize: 13, fontWeight: '700', width: 75 },
  spendBarBg: {
    flex: 1, height: 14, backgroundColor: '#DCF0DE', borderRadius: 999, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(165,214,167,0.4)',
    borderTopColor: 'rgba(27,94,32,0.06)',
  },
  spendBarFill: { height: '100%', backgroundColor: NC.primary, borderRadius: 999 },
  spendAmt: { color: NC.primary, fontSize: 12, fontWeight: '900', width: 55, textAlign: 'right' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  badgeCard: { width: '47%', alignItems: 'center', padding: 18, marginBottom: 0 },
  badgeIcon: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: NC.primaryFixed,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.85)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.4)', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 5,
  },
  badgeIconText: { fontSize: 22, fontWeight: '900', color: NC.onPrimaryFixed },
  badgeTitle: { color: NC.onSurface, fontSize: 13, fontWeight: '900', textAlign: 'center' },
  badgeDesc: { color: NC.onSurfaceVariant, fontSize: 11, textAlign: 'center', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', padding: 16 },
  modalCard: { paddingBottom: 26 },
  modalTitle: { color: NC.onSurface, fontSize: 22, fontWeight: '900', marginBottom: 22 },
  inputLabel: { color: NC.onSurfaceVariant, fontSize: 12, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#DCF0DE', borderRadius: 22, padding: 16,
    color: NC.onSurface, fontSize: 16, marginBottom: 16,
    // Concave sunken input
    borderWidth: 2, borderColor: 'rgba(165,214,167,0.5)',
    borderTopColor: 'rgba(27,94,32,0.08)',
    borderLeftColor: 'rgba(27,94,32,0.06)',
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 6 },
});

