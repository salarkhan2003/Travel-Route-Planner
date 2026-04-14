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

const BADGES = [
  { id: 'b1', emoji: '🧭', title: 'Trip Planner', desc: 'Created first itinerary' },
  { id: 'b2', emoji: '✈️', title: 'Sky Traveller', desc: 'Booked first flight' },
  { id: 'b3', emoji: '👨‍👩‍👧‍👦', title: 'Family CEO', desc: 'Managing 5+ members' },
  { id: 'b4', emoji: '🌏', title: 'International', desc: 'Added Singapore route' },
  { id: 'b5', emoji: '🕌', title: 'Pilgrim', desc: 'Visited spiritual site' },
  { id: 'b6', emoji: '💰', title: 'Budget Master', desc: 'Stayed under budget' },
];

const MEMBER_EMOJIS = ['👨', '👩', '👧', '👦', '👴', '👵', '🧑', '👶'];

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
  const [newEmoji, setNewEmoji] = useState('👤');

  const leader = members.find((m) => m.isLeader);
  const totalNights = nodes.reduce((s, n) => s + n.stayNights, 0);
  const fulfilledVows = vows.filter((v) => v.fulfilled).length;

  const handleAddMember = () => {
    if (!newName.trim()) return;
    addMember({
      name: newName.trim(),
      relation: newRelation.trim() || 'Member',
      age: parseInt(newAge) || 0,
      emoji: newEmoji,
      isLeader: false,
    });
    setNewName(''); setNewRelation(''); setNewAge(''); setNewEmoji('👤');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <ClayCard dark style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 36 }}>{leader?.emoji ?? '👤'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{leader?.name ?? 'Traveller'}</Text>
              <Text style={styles.heroRole}>🎯 Trip CEO · {members.length} members</Text>
              <Text style={styles.heroSub}>India → Singapore Journey</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            {[
              { label: 'Cities', value: nodes.length },
              { label: 'Nights', value: totalNights },
              { label: 'Members', value: members.length },
              { label: 'Vows', value: `${fulfilledVows}/${vows.length}` },
            ].map((st) => (
              <View key={st.label} style={styles.statItem}>
                <Text style={styles.statValue}>{st.value}</Text>
                <Text style={styles.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </ClayCard>

        {/* Family group */}
        <TouchableOpacity onPress={() => setShowMembers(!showMembers)}>
          <ClayCard dark style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Family Group</Text>
              <Text style={styles.sectionArrow}>{showMembers ? '▲' : '▼'}</Text>
            </View>
            <Text style={styles.sectionSub}>{members.length} members · Tap to manage</Text>
          </ClayCard>
        </TouchableOpacity>

        {showMembers && (
          <ClayCard dark style={styles.membersCard}>
            {members.map((m) => (
              <View key={m.id} style={styles.memberRow}>
                <Text style={{ fontSize: 26 }}>{m.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberRelation}>{m.relation} · Age {m.age}</Text>
                </View>
                {m.isLeader
                  ? <View style={styles.leaderBadge}><Text style={styles.leaderText}>LEADER</Text></View>
                  : <TouchableOpacity onPress={() => Alert.alert('Remove', `Remove ${m.name}?`, [
                      { text: 'Cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => removeMember(m.id) },
                    ])}>
                      <Text style={{ color: '#FF6B6B', fontSize: 18 }}>✕</Text>
                    </TouchableOpacity>
                }
              </View>
            ))}
            <ClayButton
              label="Add Member"
              emoji="➕"
              onPress={() => setShowAddModal(true)}
              color="#A7F3D0"
              style={{ marginTop: 12 }}
              small
            />
          </ClayCard>
        )}

        {/* Trip Vows */}
        <Text style={styles.heading}>🤲 Trip Promises</Text>
        <Text style={styles.headingSub}>Long press to mark fulfilled</Text>
        {vows.map((vow) => (
          <TouchableOpacity
            key={vow.id}
            onLongPress={() => !vow.fulfilled && fulfillVow(vow.id)}
            activeOpacity={0.85}
          >
            <ClayCard dark style={[styles.vowCard, vow.fulfilled ? styles.vowFulfilled : undefined]}>
              <View style={styles.vowRow}>
                <Text style={{ fontSize: 24 }}>{vow.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.vowTitle, vow.fulfilled && { color: '#FFD700' }]}>
                    {vow.title}
                  </Text>
                  <Text style={styles.vowLocation}>📍 {vow.location}</Text>
                </View>
                <Text style={{ fontSize: 22 }}>{vow.fulfilled ? '✅' : '⭕'}</Text>
              </View>
              {vow.fulfilled && (
                <Text style={styles.vowDone}>✨ Promise Fulfilled!</Text>
              )}
            </ClayCard>
          </TouchableOpacity>
        ))}

        {/* Spend overview */}
        <Text style={styles.heading}>💸 Spend Overview</Text>
        <ClayCard dark style={styles.spendCard}>
          {nodes.map((n) => {
            const pct = spentBudget > 0 ? (n.totalStayCost / spentBudget) * 100 : 0;
            return (
              <View key={n.id} style={styles.spendRow}>
                <Text style={styles.spendCity}>{n.city}</Text>
                <View style={styles.spendBarBg}>
                  <View style={[styles.spendBarFill, { width: `${pct}%` as any }]} />
                </View>
                <Text style={styles.spendAmt}>₹{n.totalStayCost}</Text>
              </View>
            );
          })}
        </ClayCard>

        {/* Badges */}
        <Text style={styles.heading}>🏆 Badges</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map((b) => (
            <ClayCard key={b.id} dark style={styles.badgeCard}>
              <Text style={{ fontSize: 32, textAlign: 'center' }}>{b.emoji}</Text>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </ClayCard>
          ))}
        </View>

        {/* Broadcast */}
        <ClayButton
          label="Broadcast to Family"
          emoji="📢"
          onPress={() => Alert.alert('Broadcast', 'Live location sent to all members!')}
          color="#C4B5FD"
          style={{ marginTop: 8 }}
        />
        <ClayButton
          label="Share Itinerary"
          emoji="📤"
          onPress={() => Alert.alert('Share', 'Itinerary link copied!')}
          color="#A3C9FF"
          style={{ marginTop: 10 }}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Member Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ClayCard dark style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Family Member</Text>

            <Text style={styles.inputLabel}>Choose Emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {MEMBER_EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setNewEmoji(e)}
                  style={[styles.emojiChip, newEmoji === e && styles.emojiChipActive]}
                >
                  <Text style={{ fontSize: 24 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Mom"
              placeholderTextColor="#555"
            />
            <Text style={styles.inputLabel}>Relation</Text>
            <TextInput
              style={styles.input}
              value={newRelation}
              onChangeText={setNewRelation}
              placeholder="e.g. Mother"
              placeholderTextColor="#555"
            />
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.input}
              value={newAge}
              onChangeText={setNewAge}
              placeholder="e.g. 48"
              placeholderTextColor="#555"
              keyboardType="numeric"
            />

            <View style={styles.modalBtns}>
              <ClayButton label="Cancel" onPress={() => setShowAddModal(false)} color="#2A2D3E" textColor="#FFF" small />
              <ClayButton label="Add" emoji="✅" onPress={handleAddMember} color="#A7F3D0" small />
            </View>
          </ClayCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  scroll: { padding: 16 },
  heroCard: { marginBottom: 12 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#2A2D3E', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#A3C9FF',
  },
  heroName: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  heroRole: { color: '#A3C9FF', fontSize: 12, marginTop: 2 },
  heroSub: { color: '#888', fontSize: 11, marginTop: 2 },
  settingsBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#888', fontSize: 10 },
  sectionCard: { marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  sectionArrow: { color: '#888' },
  sectionSub: { color: '#888', fontSize: 11, marginTop: 4 },
  membersCard: { marginBottom: 12 },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  memberName: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  memberRelation: { color: '#888', fontSize: 11 },
  leaderBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#FFD700',
  },
  leaderText: { color: '#FFD700', fontSize: 9, fontWeight: '800' },
  heading: { color: '#FFF', fontSize: 16, fontWeight: '800', marginTop: 16, marginBottom: 4 },
  headingSub: { color: '#888', fontSize: 11, marginBottom: 10 },
  vowCard: { marginBottom: 8 },
  vowFulfilled: { borderColor: '#FFD700', borderWidth: 1.5 },
  vowRow: { flexDirection: 'row', alignItems: 'center' },
  vowTitle: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  vowLocation: { color: '#888', fontSize: 11, marginTop: 2 },
  vowDone: { color: '#FFD700', fontSize: 11, marginTop: 6, fontWeight: '600' },
  spendCard: { marginBottom: 8 },
  spendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  spendCity: { color: '#FFF', fontSize: 12, width: 70 },
  spendBarBg: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  spendBarFill: { height: '100%', backgroundColor: '#A3C9FF', borderRadius: 4 },
  spendAmt: { color: '#A7F3D0', fontSize: 11, fontWeight: '700', width: 50, textAlign: 'right' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  badgeCard: { width: '47%', alignItems: 'center', padding: 14 },
  badgeTitle: { color: '#FFF', fontSize: 12, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  badgeDesc: { color: '#888', fontSize: 10, textAlign: 'center', marginTop: 2 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end', padding: 16,
  },
  modalCard: { paddingBottom: 24 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  inputLabel: { color: '#888', fontSize: 11, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#2A2D3E', borderRadius: 14, padding: 12,
    color: '#FFF', fontSize: 14, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  emojiChip: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#2A2D3E',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  emojiChipActive: { backgroundColor: '#A3C9FF' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
