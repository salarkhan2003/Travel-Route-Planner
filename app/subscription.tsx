/**
 * Subscription Screen — "The Architect Plan"
 * Frosted Liquid Glass · Golden-Mint Gradient · Coming Soon Gate
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Modal, Dimensions, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePremiumStore } from '../src/store/premiumStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useToastStore } from '../src/store/toastStore';
import { useFamilyStore } from '../src/store/familyStore';

const { width } = Dimensions.get('window');

// ── Feature comparison table ───────────────────────────────────────────────────
const FEATURES = [
  { label: 'Routing',     free: 'Road / Rail',       pro: 'Multi-Modal End-to-End',      icon: 'git-network' as const },
  { label: 'AI Agent',    free: 'Basic Chatbot',      pro: 'Autonomous Watchdog 24/7',    icon: 'sparkles'    as const },
  { label: 'Group Size',  free: 'Up to 4 people',     pro: 'Unlimited (11+ family)',      icon: 'people'      as const },
  { label: 'Flight Data', free: 'Standard traffic',   pro: 'Live Aviationstack tracking', icon: 'airplane'    as const },
  { label: 'Vault',       free: '5 Documents only',   pro: 'Unlimited Biometric Vault',   icon: 'shield'      as const },
  { label: 'Financials',  free: 'Manual logging',     pro: 'Auto-Sync + AI Bodyguard',    icon: 'card'        as const },
];

// ── Premium teasers ────────────────────────────────────────────────────────────
const TEASERS = [
  { icon: 'flash' as const,     color: '#D4AF37', title: 'Priority Groq Processing',   body: 'Premium members get dedicated LPU queues — fastest AI responses on the planet.' },
  { icon: 'airplane' as const,  color: '#059669', title: 'Concierge Flight Tracking',  body: 'We watch your Aviationstack flight so you don\'t have to. Get notified the moment gates change.' },
  { icon: 'people' as const,    color: '#7C3AED', title: 'Family Seat Finder',         body: 'AI stays up all night to find 11 seats together on IRCTC. Notifies you at 2AM if needed.' },
  { icon: 'wifi' as const,      color: '#0891B2', title: '24/7 Ghost Monitoring',      body: 'Background watchdog checks for 3AC availability, price drops, and missed connections.' },
];

// ── "Ripple" animated card ─────────────────────────────────────────────────────
function GlassPremiumCard({ onPress, isPremium }: { onPress: () => void; isPremium: boolean }) {
  const ripple = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(ripple, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ripple, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.96, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,    duration: 120, useNativeDriver: true }),
      ]),
    ]).start();
    onPress();
  };

  const rippleOpacity = ripple.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.18, 0] });
  const rippleScale   = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] });

  return (
    <TouchableOpacity activeOpacity={1} onPress={handlePress}>
      <Animated.View style={[gc.card, { transform: [{ scale }] }]}>
        {/* Golden-Mint gradient layers */}
        <View style={gc.layer1} />
        <View style={gc.layer2} />
        <View style={gc.sheen} />

        {/* Ripple */}
        <Animated.View style={[gc.ripple, { opacity: rippleOpacity, transform: [{ scale: rippleScale }] }]} />

        {/* Content */}
        <View style={gc.topRow}>
          <View style={gc.crownBadge}>
            <Ionicons name="diamond" size={18} color="#D4AF37" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={gc.planName}>The Architect</Text>
            <Text style={gc.planSub}>Premium  ·  Limited Beta Access</Text>
          </View>
          {isPremium
            ? <View style={gc.activeBadge}><Text style={gc.activeTxt}>ACTIVE</Text></View>
            : <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
          }
        </View>

        <View style={gc.divider} />

        <View style={gc.perks}>
          {['Unlimited Family', '24/7 AI Watchdog', 'Live Flight Tracking'].map(p => (
            <View key={p} style={gc.perkRow}>
              <Ionicons name="checkmark-circle" size={14} color="#D4AF37" />
              <Text style={gc.perkTxt}>{p}</Text>
            </View>
          ))}
        </View>

        {!isPremium && (
          <View style={gc.cta}>
            <Text style={gc.ctaTxt}>Try for FREE  —  Beta Access</Text>
            <Ionicons name="arrow-forward" size={15} color="#1B5E20" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const gc = StyleSheet.create({
  card: {
    borderRadius: 28, padding: 22, marginHorizontal: 20, marginBottom: 24, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.35)',
    elevation: 14, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 18,
  },
  layer1: { ...StyleSheet.absoluteFillObject, backgroundColor: '#E8F5E9', borderRadius: 28 },
  layer2: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(212,175,55,0.12)', borderRadius: 28 },
  sheen:  { position: 'absolute', top: 0, left: 0, right: 0, height: '55%', backgroundColor: 'rgba(255,255,255,0.38)', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  ripple: { position: 'absolute', width: width - 40, height: width - 40, borderRadius: (width - 40) / 2, backgroundColor: '#D4AF37', top: -(width - 40) / 2.8, left: -(width - 40) / 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 1 },
  crownBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(212,175,55,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.5)' },
  planName: { fontSize: 19, fontWeight: '900', color: '#1B4A0D', letterSpacing: -0.3 },
  planSub:  { fontSize: 11, fontWeight: '700', color: '#4A7B3A', marginTop: 3 },
  activeBadge: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#D4AF37', borderRadius: 10 },
  activeTxt:   { fontSize: 10, fontWeight: '900', color: '#1B4A0D', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: 'rgba(212,175,55,0.3)', marginVertical: 14 },
  perks: { gap: 8, position: 'relative', zIndex: 1 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  perkTxt: { fontSize: 13, fontWeight: '700', color: '#1B4A0D' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 14, paddingVertical: 13, borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)', position: 'relative', zIndex: 1 },
  ctaTxt: { fontSize: 14, fontWeight: '900', color: '#1B5E20' },
});

// ── Coming Soon Gate Modal ─────────────────────────────────────────────────────
function ComingSoonModal({ visible, onClose, onActivate }: { visible: boolean; onClose: () => void; onActivate: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={csm.overlay}>
        <View style={csm.sheet}>
          <View style={csm.handle} />

          {/* Icon */}
          <View style={csm.iconWrap}>
            <View style={[csm.iconCircle, { backgroundColor: '#D4AF37' + '20', borderColor: '#D4AF37' + '40' }]}>
              <Ionicons name="construct" size={40} color="#D4AF37" />
            </View>
            <View style={csm.iconGlow} />
          </View>

          <Text style={csm.title}>The Architect Plan{'\n'}is Almost Ready</Text>
          <Text style={csm.body}>Our engineers are polishing the 24/7 Automation Engine, Live Flight Tracker, and AI Watchdog. Everything is nearly complete.</Text>

          <Text style={csm.body}>Try it for FREE until we officially launch — you will keep all Premium features forever as a founding member.</Text>

          {/* What you get */}
          <View style={csm.listCard}>
            {[
              'Unlimited family members (11+)',
              '24/7 Ghost Monitoring AI',
              'Live Aviationstack flight tracking',
              'AI Budget Bodyguard',
              'Priority Groq LPU processing',
            ].map(item => (
              <View key={item} style={csm.listRow}>
                <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
                <Text style={csm.listTxt}>{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={csm.unlockBtn} onPress={onActivate} activeOpacity={0.85}>
            <Ionicons name="diamond" size={18} color="#1B4A0D" />
            <Text style={csm.unlockTxt}>Unlock Beta Access</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={csm.cancelBtn}>
            <Text style={csm.cancelTxt}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const csm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 28, paddingBottom: Platform.OS === 'ios' ? 48 : 32 },
  handle:  { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 28 },
  iconWrap:   { alignItems: 'center', marginBottom: 22, position: 'relative' },
  iconCircle: { width: 84, height: 84, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  iconGlow:   { position: 'absolute', width: 84, height: 84, borderRadius: 42, backgroundColor: '#D4AF37', opacity: 0.08 },
  title:  { fontSize: 26, fontWeight: '900', color: '#0F172A', textAlign: 'center', letterSpacing: -0.5, lineHeight: 34, marginBottom: 16 },
  body:   { fontSize: 14, color: '#475569', lineHeight: 22, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  listCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 18, marginBottom: 24, gap: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  listRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listTxt:  { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  unlockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#D4AF37', borderRadius: 20, paddingVertical: 18, marginBottom: 12, elevation: 6, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  unlockTxt: { fontSize: 16, fontWeight: '900', color: '#1B4A0D' },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelTxt: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
});

// ── Main Subscription Screen ───────────────────────────────────────────────────
export default function SubscriptionScreen() {
  const darkMode   = useSettingsStore(s => s.darkMode);
  const isPremium  = usePremiumStore(s => s.isPremium);
  const setPremium = usePremiumStore(s => s.setPremium);
  const members    = useFamilyStore(s => s.members);
  const showToast  = useToastStore(s => s.showToast);
  const leader     = members.find(m => m.isLeader);

  const [showModal, setShowModal] = useState(false);

  const bg   = darkMode ? '#030712'  : '#F0FDF4';
  const card = darkMode ? '#111827'  : '#FFFFFF';
  const txt1 = darkMode ? '#F9FAFB'  : '#0F172A';
  const txt2 = darkMode ? '#6B7280'  : '#64748B';
  const bdr  = darkMode ? '#1F2937'  : '#E2E8F0';

  const handleActivate = () => {
    const name = leader?.name ?? 'Traveller';
    setPremium(true, name);
    setShowModal(false);
    setTimeout(() => {
      showToast(`Welcome to the inner circle, ${name}. You now have full access to Roamio Premium.`, 'sparkles');
    }, 400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: bg }}>
        <View style={ss.header}>
          <TouchableOpacity style={ss.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={txt1} />
          </TouchableOpacity>
          <Text style={[ss.headerTitle, { color: txt1 }]}>Roamio Premium</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* Hero */}
        <View style={ss.hero}>
          <Text style={ss.heroEyebrow}>UPGRADE YOUR JOURNEY</Text>
          <Text style={ss.heroTitle}>Travel First{'\n'}Class.</Text>
          <Text style={[ss.heroSub, { color: txt2 }]}>Not a paywall. An upgrade to a smarter, more capable version of Roamio — designed for serious travellers.</Text>
        </View>

        {/* Frosted Glass Premium Card */}
        <GlassPremiumCard onPress={() => setShowModal(true)} isPremium={isPremium} />

        {/* Feature Comparison */}
        <View style={[ss.section, { backgroundColor: card, borderColor: bdr, marginHorizontal: 20, marginBottom: 24 }]}>
          <Text style={[ss.sectionTitle, { color: txt1 }]}>What You Get</Text>
          {/* Column headers */}
          <View style={ss.tableHeader}>
            <View style={{ flex: 2 }} />
            <Text style={ss.tableHdrTxt}>Free</Text>
            <Text style={[ss.tableHdrTxt, { color: '#D4AF37', fontWeight: '900' }]}>Architect</Text>
          </View>
          {FEATURES.map((f, i) => (
            <View key={f.label} style={[ss.tableRow, i < FEATURES.length - 1 && { borderBottomColor: bdr, borderBottomWidth: 1 }]}>
              <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[ss.featureIcon, { backgroundColor: '#059669' + '15' }]}>
                  <Ionicons name={f.icon} size={14} color="#059669" />
                </View>
                <Text style={[ss.featureLabel, { color: txt1 }]}>{f.label}</Text>
              </View>
              <Text style={[ss.featureFree, { color: txt2 }]} numberOfLines={2}>{f.free}</Text>
              <Text style={[ss.featurePro, { color: '#1B5E20' }]} numberOfLines={2}>{f.pro}</Text>
            </View>
          ))}
        </View>

        {/* Premium Teasers */}
        <Text style={[ss.listTitle, { color: txt1, marginHorizontal: 20 }]}>Exclusive Features</Text>
        {TEASERS.map(t => (
          <View key={t.title} style={[ss.teaserCard, { backgroundColor: card, borderColor: bdr, marginHorizontal: 20 }]}>
            <View style={[ss.teaserIcon, { backgroundColor: t.color + '18' }]}>
              <Ionicons name={t.icon} size={20} color={t.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[ss.teaserTitle, { color: txt1 }]}>{t.title}</Text>
              <Text style={[ss.teaserBody, { color: txt2 }]}>{t.body}</Text>
            </View>
          </View>
        ))}

        {/* Bottom CTA */}
        <View style={{ marginHorizontal: 20, marginTop: 28 }}>
          {isPremium ? (
            <View style={[ss.activeCard, { borderColor: '#D4AF37' + '40' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#D4AF37" />
              <View>
                <Text style={ss.activeTxt}>Beta Access Active</Text>
                <Text style={[ss.activeSub, { color: txt2 }]}>You have full Roamio Premium features</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={ss.ctaBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
              <Ionicons name="diamond" size={20} color="#1B4A0D" />
              <Text style={ss.ctaTxt}>Upgrade to Architect — Free Beta</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <ComingSoonModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onActivate={handleActivate}
      />
    </View>
  );
}

const ss = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },

  hero: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  heroEyebrow: { fontSize: 10, fontWeight: '900', color: '#D4AF37', letterSpacing: 3, marginBottom: 10 },
  heroTitle: { fontSize: 44, fontWeight: '900', color: '#0F172A', letterSpacing: -1.5, lineHeight: 50, marginBottom: 14 },
  heroSub: { fontSize: 15, lineHeight: 24, fontWeight: '500' },

  section: { borderRadius: 24, padding: 20, borderWidth: 1.5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '900', marginBottom: 16, letterSpacing: -0.3 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tableHdrTxt: { flex: 1.2, fontSize: 11, fontWeight: '800', color: '#94A3B8', textAlign: 'center', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 6 },
  featureIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontSize: 13, fontWeight: '800' },
  featureFree:  { flex: 1.2, fontSize: 11, fontWeight: '500', textAlign: 'center', lineHeight: 15 },
  featurePro:   { flex: 1.2, fontSize: 11, fontWeight: '800', textAlign: 'center', lineHeight: 15 },

  listTitle: { fontSize: 19, fontWeight: '900', marginBottom: 14, letterSpacing: -0.3 },
  teaserCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, borderRadius: 20, padding: 16, marginBottom: 10, borderWidth: 1.5, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  teaserIcon:  { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  teaserTitle: { fontSize: 14, fontWeight: '900', marginBottom: 4 },
  teaserBody:  { fontSize: 12, lineHeight: 18, fontWeight: '500' },

  activeCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#D4AF37' + '12', borderRadius: 20, borderWidth: 1.5, padding: 18 },
  activeTxt:  { fontSize: 15, fontWeight: '900', color: '#D4AF37' },
  activeSub:  { fontSize: 12, fontWeight: '600', marginTop: 3 },

  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#D4AF37', borderRadius: 22, paddingVertical: 20, elevation: 8, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 16 },
  ctaTxt: { fontSize: 16, fontWeight: '900', color: '#1B4A0D' },
});
