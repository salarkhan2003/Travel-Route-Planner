import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Dimensions, Alert, Modal, Animated,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { getTheme, MINT, FONTS, CLAY_CARD_V2, CLAY_BTN_V2 } from '../../src/constants/theme';
import { useFamilyStore } from '../../src/store/familyStore';
import { useTripStore } from '../../src/store/tripStore';
import { useToastStore } from '../../src/store/toastStore';
import { usePremiumStore } from '../../src/store/premiumStore';


const { width } = Dimensions.get('window');

const BADGES = [
  { id: '1', icon: '🌍', title: 'Explorer', desc: 'Visited 5+ cities', earned: true },
  { id: '2', icon: '🤝', title: 'Vow Keeper', desc: 'Fulfilled 3+ promises', earned: true },
  { id: '3', icon: '💰', title: 'Budget King', desc: 'Stayed under limit', earned: false },
  { id: '4', icon: '👨‍👩‍👧', title: 'Family CEO', desc: 'Managed 4+ members', earned: false },
];

export default function ProfileScreen() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const theme = getTheme(darkMode);
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
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newAge, setNewAge] = useState('');
  const [showAddVow, setShowAddVow] = useState(false);
  const [vowTitle, setVowTitle] = useState('');
  const [vowLoc, setVowLoc] = useState('');

  // Theme-derived color tokens
  const bg = darkMode ? '#000' : '#E8F5E9';
  const card = darkMode ? '#0F1117' : '#FFFFFF';
  const cardBorder = darkMode ? '#27272A' : 'rgba(165,214,167,0.4)';
  const primary = darkMode ? '#00F59B' : '#2E7D32';
  const warning = '#FFD60A';
  const errorColor = darkMode ? '#FF453A' : '#C62828';
  const textPrimary = darkMode ? '#FAFAFA' : '#1B5E20';
  const textSecondary = darkMode ? '#A1A1AA' : '#4A6741';
  const surface = darkMode ? '#1C1C1E' : '#F1F8F2';
  const heroBg = darkMode ? '#001A0D' : '#1B5E20';

  const isPremium = usePremiumStore(s => s.isPremium);
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;

  const leader = members.find((m) => m.isLeader);
  const totalNights = nodes.reduce((acc, n) => acc + (n.stayNights || 0), 0);
  const fulfilledVows = vows.filter((v) => v.fulfilled).length;

  const handlePremiumPress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(rippleAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(rippleAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.96, duration: 110, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 110, useNativeDriver: true }),
      ]),
    ]).start(() => router.push('/subscription' as any));
  };

  const handleAddMember = () => {
    if (!newName.trim()) return;
    addMember({
      name: newName.trim(),
      relation: newRelation.trim() || 'Member',
      age: parseInt(newAge) || 0,
      emoji: newName[0].toUpperCase(),
      isLeader: false,
    });
    setNewName(''); setNewRelation(''); setNewAge('');
    setShowAddMember(false);
    showToast('Member added to family group!', 'construct');
  };

  const handleAddVow = () => {
    if (!vowTitle.trim()) return;
    addVow({ title: vowTitle.trim(), location: vowLoc.trim() || 'Unknown', emoji: '🤝' });
    setVowTitle(''); setVowLoc('');
    setShowAddVow(false);
    showToast('Promise saved!', 'construct');
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={[s.heading, { color: textPrimary }]}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/settings' as any)}
            style={[s.settingsBtn, { backgroundColor: card, borderColor: cardBorder }]}>
            <Ionicons name="settings-outline" size={18} color={primary} />
            <Text style={[s.settingsBtnText, { color: primary }]}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={[s.heroCard, { backgroundColor: heroBg, borderColor: darkMode ? '#00F59B22' : 'rgba(255,255,255,0.1)' }]}>
          {/* Neon glow accent */}
          {darkMode && <View style={s.heroGlow} />}
          <View style={s.heroRow}>
            <View style={[s.avatar, { backgroundColor: darkMode ? '#00F59B' : '#A5D6A7' }]}>
              <Text style={s.avatarText}>{(leader?.name?.[0] ?? 'T').toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.heroName}>{leader?.name ?? 'Traveller'}</Text>
              <Text style={s.heroRole}>Trip CEO · {members.length} members</Text>
              <Text style={s.heroSub}>India → Singapore Journey</Text>
            </View>
          </View>
          <View style={s.statsDivider} />
          <View style={s.statsRow}>
            {[
              { label: 'Cities', value: nodes.length },
              { label: 'Nights', value: totalNights },
              { label: 'Members', value: members.length },
              { label: 'Vows', value: `${fulfilledVows}/${vows.length}` },
            ].map((st) => (
              <View key={st.label} style={s.statItem}>
                <Text style={s.statValue}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Go Premium — Frosted Glass Gold-Mint Card */}
        <TouchableOpacity activeOpacity={1} onPress={handlePremiumPress}>
          <Animated.View style={[{
            transform: [{ scale: scaleAnim }],
            borderRadius: 36, marginBottom: 18, overflow: 'hidden',
            borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.4)',
            elevation: 12, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 16,
          }]}>
            {/* Layers */}
            <View style={{ ...StyleSheet.absoluteFillObject as any, backgroundColor: '#E8F5E9', borderRadius: 36 }} />
            <View style={{ ...StyleSheet.absoluteFillObject as any, backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: 36 }} />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '52%', backgroundColor: 'rgba(255,255,255,0.36)', borderTopLeftRadius: 28, borderTopRightRadius: 28 }} />
            {/* Ripple */}
            <Animated.View style={[{
              position: 'absolute', width: width - 40, height: width - 40,
              borderRadius: (width - 40) / 2, backgroundColor: '#D4AF37',
              top: -((width - 40) / 3), left: -((width - 40) / 4),
              opacity: rippleAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.15, 0] }),
              transform: [{ scale: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.9] }) }],
            }]} />
            <View style={{ padding: 20, position: 'relative', zIndex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(212,175,55,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.45)' }}>
                  <Ionicons name="diamond" size={19} color="#D4AF37" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontFamily: FONTS.display, fontWeight: '900', color: '#1B4A0D', letterSpacing: -0.3 }}>
                    {isPremium ? 'Architect Plan Active' : 'The Architect Plan'}
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: FONTS.body, fontWeight: '700', color: '#4A7B3A', marginTop: 2 }}>
                    {isPremium ? 'Full Premium Access' : 'Beta Access — Free Until Launch'}
                  </Text>
                </View>
                {isPremium
                  ? <View style={{ backgroundColor: '#D4AF37', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ fontSize: 9, fontFamily: FONTS.display, fontWeight: '900', color: '#1B4A0D', letterSpacing: 1 }}>ACTIVE</Text></View>
                  : <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
                }
              </View>
              <View style={{ height: 1, backgroundColor: 'rgba(212,175,55,0.28)', marginBottom: 12 }} />
              <View style={{ flexDirection: 'row', gap: 18 }}>
                {['Unlimited Family', '24/7 AI Watch', 'Live Flights'].map(p => (
                  <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="checkmark-circle" size={13} color="#D4AF37" />
                    <Text style={{ fontSize: 11, fontFamily: FONTS.body, fontWeight: '700', color: '#1B4A0D' }}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={s.quickRow}>
          <TouchableOpacity style={[s.quickBtn, { backgroundColor: card, borderColor: cardBorder }]}
            onPress={() => showToast('Live location broadcasted!', 'radio')}>
            <Ionicons name="radio-outline" size={20} color={primary} />
            <Text style={[s.quickLabel, { color: textPrimary }]}>Broadcast</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.quickBtn, { backgroundColor: card, borderColor: cardBorder }]}
            onPress={() => showToast('Itinerary copied to clipboard!', 'copy')}>
            <Ionicons name="share-outline" size={20} color={primary} />
            <Text style={[s.quickLabel, { color: textPrimary }]}>Share Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.quickBtn, { backgroundColor: card, borderColor: cardBorder }]}
            onPress={() => router.push('/settings' as any)}>
            <Ionicons name="moon-outline" size={20} color={primary} />
            <Text style={[s.quickLabel, { color: textPrimary }]}>Dark Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Family Group */}
        <TouchableOpacity onPress={() => setShowMembers(!showMembers)}
          style={[s.sectionCard, { backgroundColor: card, borderColor: cardBorder }]}>
          <View style={s.sectionHeaderRow}>
            <View style={[s.sectionIconWrap, { backgroundColor: primary + '18' }]}>
              <Ionicons name="people" size={20} color={primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.sectionTitle, { color: textPrimary }]}>Family Group</Text>
              <Text style={[s.sectionSub, { color: textSecondary }]}>{members.length} members · Tap to manage</Text>
            </View>
            <Ionicons name={showMembers ? 'chevron-up' : 'chevron-down'} size={20} color={textSecondary} />
          </View>
        </TouchableOpacity>

        {showMembers && (
          <View style={[s.card, { backgroundColor: card, borderColor: cardBorder }]}>
            {members.length === 0 && (
              <Text style={[s.emptyText, { color: textSecondary }]}>No members yet. Add your first member below.</Text>
            )}
            {members.map((m) => (
              <View key={m.id} style={[s.memberRow, { borderBottomColor: cardBorder }]}>
                <View style={[s.memberAvatar, { backgroundColor: primary + '22', borderColor: primary + '33' }]}>
                  <Text style={[s.memberAvatarText, { color: primary }]}>{m.name[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[s.memberName, { color: textPrimary }]}>{m.name}</Text>
                  <Text style={[s.memberRelation, { color: textSecondary }]}>{m.relation} · Age {m.age}</Text>
                </View>
                {m.isLeader
                  ? <View style={[s.leaderBadge, { backgroundColor: warning + '18', borderColor: warning }]}>
                      <Text style={[s.leaderText, { color: warning }]}>LEADER</Text>
                    </View>
                  : <TouchableOpacity onPress={() => Alert.alert('Remove Member', `Remove ${m.name}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => removeMember(m.id) },
                    ])}>
                      <Ionicons name="trash-outline" size={18} color={errorColor} />
                    </TouchableOpacity>
                }
              </View>
            ))}
            <TouchableOpacity style={[s.outlineBtn, { borderColor: primary }]} onPress={() => setShowAddMember(true)}>
              <Ionicons name="person-add-outline" size={16} color={primary} style={{ marginRight: 8 }} />
              <Text style={[s.outlineBtnText, { color: primary }]}>Add Member</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Trip Promises */}
        <View style={s.sectionLabelRow}>
          <View>
            <Text style={[s.heading, { color: textPrimary, fontSize: 18 }]}>Trip Promises</Text>
            <Text style={[s.sectionSub, { color: textSecondary }]}>Long press to mark fulfilled</Text>
          </View>
          <TouchableOpacity style={[s.addBadge, { backgroundColor: primary }]} onPress={() => setShowAddVow(true)}>
            <Ionicons name="add" size={18} color={darkMode ? '#000' : '#FFF'} />
          </TouchableOpacity>
        </View>

        {vows.length === 0 && (
          <View style={[s.emptyCard, { backgroundColor: card, borderColor: cardBorder }]}>
            <Text style={{ fontSize: 32 }}>🤝</Text>
            <Text style={[s.emptyText, { color: textSecondary, marginTop: 8 }]}>No promises yet. Tap + to add one.</Text>
          </View>
        )}
        {vows.map((vow) => (
          <TouchableOpacity key={vow.id} onLongPress={() => !vow.fulfilled && fulfillVow(vow.id)} activeOpacity={0.85}>
            <View style={[s.vowCard, { backgroundColor: card, borderColor: vow.fulfilled ? warning : cardBorder, borderWidth: vow.fulfilled ? 2 : 1.5 }]}>
              <View style={[s.vowDot, { backgroundColor: vow.fulfilled ? warning : primary }]} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.vowTitle, { color: vow.fulfilled ? warning : textPrimary }]}>{vow.title}</Text>
                <Text style={[s.vowLoc, { color: textSecondary }]}>{vow.location}</Text>
              </View>
              <View style={[s.vowStatusPill, { backgroundColor: vow.fulfilled ? warning + '22' : surface }]}>
                <Text style={[s.vowStatusText, { color: vow.fulfilled ? warning : textSecondary }]}>
                  {vow.fulfilled ? '✓ Done' : 'Pending'}
                </Text>
              </View>
              <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => removeVow(vow.id)}>
                <Ionicons name="trash-outline" size={16} color={errorColor} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Spend Overview */}
        <View style={s.sectionLabelRow}>
          <Text style={[s.heading, { color: textPrimary, fontSize: 18 }]}>Spend Overview</Text>
        </View>
        <View style={[s.card, { backgroundColor: card, borderColor: cardBorder }]}>
          {nodes.length === 0 && (
            <Text style={[s.emptyText, { color: textSecondary }]}>Add cities to your trip to see spending breakdown.</Text>
          )}
          {nodes.map((n) => {
            const pct = spentBudget > 0 ? Math.min(100, (n.totalStayCost / spentBudget) * 100) : 0;
            return (
              <View key={n.id} style={s.spendRow}>
                <Text style={[s.spendCity, { color: textPrimary }]} numberOfLines={1}>{n.city}</Text>
                <View style={[s.spendBarBg, { backgroundColor: surface }]}>
                  <View style={[s.spendBarFill, { width: `${pct}%` as any, backgroundColor: primary }]} />
                </View>
                <Text style={[s.spendAmt, { color: primary }]}>₹{n.totalStayCost}</Text>
              </View>
            );
          })}
        </View>

        {/* Achievements */}
        <Text style={[s.heading, { color: textPrimary, fontSize: 18, marginBottom: 14 }]}>Achievements</Text>
        <View style={s.badgesGrid}>
          {BADGES.map((b) => (
            <View key={b.id} style={[s.badgeCard, {
              backgroundColor: card, borderColor: b.earned ? primary : cardBorder,
              borderWidth: b.earned ? 2 : 1.5,
              opacity: b.earned ? 1 : 0.6,
            }]}>
              <Text style={s.badgeEmoji}>{b.icon}</Text>
              <Text style={[s.badgeTitle, { color: textPrimary }]}>{b.title}</Text>
              <Text style={[s.badgeDesc, { color: textSecondary }]}>{b.desc}</Text>
              {b.earned && (
                <View style={[s.earnedChip, { backgroundColor: primary + '22' }]}>
                  <Text style={[s.earnedText, { color: primary }]}>EARNED</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Add Member Modal */}
      <Modal visible={showAddMember} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalOverlay}>
            <View style={[s.modalSheet, { backgroundColor: card }]}>
              <View style={[s.modalHandle, { backgroundColor: cardBorder }]} />
              <Text style={[s.modalTitle, { color: textPrimary }]}>Add Family Member</Text>

              <Text style={[s.inputLabel, { color: textSecondary }]}>Name *</Text>
              <TextInput style={[s.input, { backgroundColor: surface, color: textPrimary, borderColor: cardBorder }]}
                value={newName} onChangeText={setNewName} placeholder="e.g. Mom" placeholderTextColor={textSecondary} />

              <Text style={[s.inputLabel, { color: textSecondary }]}>Relation</Text>
              <TextInput style={[s.input, { backgroundColor: surface, color: textPrimary, borderColor: cardBorder }]}
                value={newRelation} onChangeText={setNewRelation} placeholder="e.g. Mother" placeholderTextColor={textSecondary} />

              <Text style={[s.inputLabel, { color: textSecondary }]}>Age</Text>
              <TextInput style={[s.input, { backgroundColor: surface, color: textPrimary, borderColor: cardBorder }]}
                value={newAge} onChangeText={setNewAge} placeholder="e.g. 48" placeholderTextColor={textSecondary} keyboardType="numeric" />

              <View style={s.modalBtns}>
                <TouchableOpacity style={[s.modalCancelBtn, { backgroundColor: surface, borderColor: cardBorder }]}
                  onPress={() => setShowAddMember(false)}>
                  <Text style={[s.modalCancelText, { color: textPrimary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.modalConfirmBtn, { backgroundColor: primary }]} onPress={handleAddMember}>
                  <Text style={[s.modalConfirmText, { color: darkMode ? '#000' : '#FFF' }]}>Add Member</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Promise Modal */}
      <Modal visible={showAddVow} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalOverlay}>
            <View style={[s.modalSheet, { backgroundColor: card }]}>
              <View style={[s.modalHandle, { backgroundColor: cardBorder }]} />
              <Text style={[s.modalTitle, { color: textPrimary }]}>Add Trip Promise</Text>

              <Text style={[s.inputLabel, { color: textSecondary }]}>Promise *</Text>
              <TextInput style={[s.input, { backgroundColor: surface, color: textPrimary, borderColor: cardBorder }]}
                value={vowTitle} onChangeText={setVowTitle} placeholder="e.g. Try local street food" placeholderTextColor={textSecondary} />

              <Text style={[s.inputLabel, { color: textSecondary }]}>Location</Text>
              <TextInput style={[s.input, { backgroundColor: surface, color: textPrimary, borderColor: cardBorder }]}
                value={vowLoc} onChangeText={setVowLoc} placeholder="e.g. Singapore" placeholderTextColor={textSecondary} />

              <View style={s.modalBtns}>
                <TouchableOpacity style={[s.modalCancelBtn, { backgroundColor: surface, borderColor: cardBorder }]}
                  onPress={() => setShowAddVow(false)}>
                  <Text style={[s.modalCancelText, { color: textPrimary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.modalConfirmBtn, { backgroundColor: primary }]} onPress={handleAddVow}>
                  <Text style={[s.modalConfirmText, { color: darkMode ? '#000' : '#FFF' }]}>Save Promise</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  heading: { fontSize: 26, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: -0.5 },
  settingsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1.5 },
  settingsBtnText: { fontSize: 13, fontFamily: FONTS.display, fontWeight: '800' },

  // Hero Card
  heroCard: { borderRadius: 36, padding: 24, marginBottom: 20, borderWidth: 1.5, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(0,245,155,0.08)' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { fontSize: 28, fontFamily: FONTS.display, fontWeight: '900', color: '#000' },
  heroName: { color: '#FFF', fontSize: 22, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: -0.3 },
  heroRole: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 3, fontFamily: FONTS.body, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  statsDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { color: '#FFF', fontSize: 24, fontFamily: FONTS.display, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: FONTS.body, fontWeight: '700', marginTop: 2 },

  // Quick Actions
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  quickBtn: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 28, borderWidth: 1.5, gap: 6 },
  quickLabel: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '800', textAlign: 'center' },

  // Section cards
  sectionCard: { borderRadius: 22, padding: 18, marginBottom: 10, borderWidth: 1.5 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionIconWrap: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontFamily: FONTS.display, fontWeight: '900' },
  sectionSub: { fontSize: 12, marginTop: 2 },
  sectionLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 6 },
  addBadge: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Generic card
  card: { borderRadius: 32, padding: 20, marginBottom: 18, borderWidth: 1.5 },

  // Members
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  memberAvatarText: { fontSize: 18, fontFamily: FONTS.display, fontWeight: '900' },
  memberName: { fontSize: 15, fontFamily: FONTS.display, fontWeight: '800' },
  memberRelation: { fontSize: 12, marginTop: 2 },
  leaderBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1.5 },
  leaderText: { fontSize: 10, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 0.5 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: 16, borderWidth: 1.5, marginTop: 12 },
  outlineBtnText: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '800' },

  // Vows
  vowCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 28, padding: 16, marginBottom: 10 },
  vowDot: { width: 14, height: 14, borderRadius: 7 },
  vowTitle: { fontSize: 15, fontFamily: FONTS.display, fontWeight: '800' },
  vowLoc: { fontSize: 12, marginTop: 2 },
  vowStatusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  vowStatusText: { fontSize: 10, fontFamily: FONTS.body, fontWeight: '700' },

  // Spend
  spendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  spendCity: { fontSize: 12, fontFamily: FONTS.body, fontWeight: '700', width: 70 },
  spendBarBg: { flex: 1, height: 12, borderRadius: 999, overflow: 'hidden' },
  spendBarFill: { height: '100%', borderRadius: 999 },
  spendAmt: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '900', width: 50, textAlign: 'right' },

  // Badges
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
  badgeCard: { width: (width - 52) / 2, alignItems: 'center', padding: 20, borderRadius: 32 },
  badgeEmoji: { fontSize: 32, marginBottom: 10 },
  badgeTitle: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '900', textAlign: 'center' },
  badgeDesc: { fontSize: 11, textAlign: 'center', marginTop: 4, lineHeight: 16 },
  earnedChip: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  earnedText: { fontSize: 9, fontFamily: FONTS.display, fontWeight: '900', letterSpacing: 0.5 },

  // Empty
  emptyCard: { borderRadius: 28, borderWidth: 1.5, padding: 28, alignItems: 'center', marginBottom: 16 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 28, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontFamily: FONTS.display, fontWeight: '900', marginBottom: 22 },
  inputLabel: { fontSize: 11, fontFamily: FONTS.display, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  input: { borderRadius: 16, borderWidth: 1.5, padding: 16, fontSize: 16, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  modalCancelText: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '800' },
  modalConfirmBtn: { flex: 2, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalConfirmText: { fontSize: 14, fontFamily: FONTS.display, fontWeight: '900' },
});
