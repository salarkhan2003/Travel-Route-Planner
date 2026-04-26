/**
 * Roamio AI — Mint Liquid Clay Command Center
 * Pixel-perfect match to design spec screenshots
 * Theme: Mint (#E8F5E9 · #A7F3D0 · #6EE7B7 · #10B981) · 50px radius · Clay inflate
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Animated,
  Dimensions, StatusBar, KeyboardAvoidingView, Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '../src/store/settingsStore';
import { useTripStore } from '../src/store/tripStore';
import { usePremiumStore } from '../src/store/premiumStore';

let LottieView: any = null;
try { LottieView = require('lottie-react-native').default; } catch (_) {}

const { width } = Dimensions.get('window');
const WELCOME_KEY = 'ROAMIO_AGENT_WELCOME_V4';

// ── Groq ──────────────────────────────────────────────────────────────────────
const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || ''; // Add KEY in .env
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.3-70b-versatile';

interface Msg { id: string; role: 'user'|'assistant'; text: string; ts: Date; loading?: boolean; hasBooking?: boolean; }

const BOOKING_KW = ['train','flight','bus','book','ticket','rajdhani','shatabdi','vande bharat','irctc','airline','indigo','air india','spicejet'];
const detectBooking = (t: string) => BOOKING_KW.some(k => t.toLowerCase().includes(k));

// ── Quick prompts ─────────────────────────────────────────────────────────────
const QUICK = [
  { icon: 'bag-handle-outline' as const,  color: '#10B981', bg: '#D1FAE5', label: 'Train Routes',      prompt: 'Best train routes from Delhi to Mumbai with class and timing options?' },
  { icon: 'airplane-outline'   as const,  color: '#6366F1', bg: '#EDE9FE', label: 'Budget Flights',    prompt: 'How to find cheapest flights within India? Best booking windows?' },
  { icon: 'send-outline'       as const,  color: '#8B5CF6', bg: '#EDE9FE', label: '7-Day Rajasthan',   prompt: 'Give me a complete 7-day Rajasthan itinerary with day-by-day plan and INR budget.' },
  { icon: 'card-outline'       as const,  color: '#EC4899', bg: '#FCE7F3', label: '₹15k Budget Trip',  prompt: 'Plan a 5-day trip from Hyderabad within 15000 INR total: train, stay and food.' },
  { icon: 'globe-outline'      as const,  color: '#0EA5E9', bg: '#E0F2FE', label: 'India → Singapore', prompt: 'Plan Delhi to Singapore trip. Visa, flights, hotel, activities. Budget 70000 INR.' },
  { icon: 'people-outline'     as const,  color: '#F59E0B', bg: '#FEF3C7', label: '11-Member Family',  prompt: 'Best trip for 11 family members from Ajmer. Budget 3 lakh INR total.' },
];

// ── Capability rows ────────────────────────────────────────────────────────────
const CAPS = [
  { icon: 'bag-handle-outline' as const, color: '#10B981', bg: '#D1FAE5', text: 'Train, flight & bus comparison with real INR costs' },
  { icon: 'people-outline'     as const, color: '#F59E0B', bg: '#FEF3C7', text: 'Group trips for 11+ members with accessibility planning' },
  { icon: 'card-outline'       as const, color: '#8B5CF6', bg: '#EDE9FE', text: 'Budget guardian — ₹{REM}k remaining on your trip' },
  { icon: 'globe-outline'      as const, color: '#0EA5E9', bg: '#E0F2FE', text: 'Visa, forex & international documentation guide' },
];

// ── Typing animation ──────────────────────────────────────────────────────────
function TypingDots({ color }: { color: string }) {
  const dots = [useRef(new Animated.Value(0.25)).current, useRef(new Animated.Value(0.25)).current, useRef(new Animated.Value(0.25)).current];
  useEffect(() => {
    Animated.loop(Animated.stagger(200, dots.map(d =>
      Animated.sequence([
        Animated.timing(d, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0.25, duration: 380, useNativeDriver: true }),
      ])
    ))).start();
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 8 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, opacity: d }} />
      ))}
    </View>
  );
}

// ── Rich response text ────────────────────────────────────────────────────────
function RichText({ text, color, onText }: { text: string; color: string; onText: string }) {
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <View style={{ gap: 6 }}>
      {lines.map((line, i) => {
        const t = line.trim();
        if (/^[A-Z][A-Z\s]{2,}:$/.test(t)) {
          return (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4, marginBottom: 2 }}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />
              <Text style={{ fontSize: 10, fontWeight: '900', color, letterSpacing: 1.5 }}>{t}</Text>
            </View>
          );
        }
        if (/^\d+\.\s/.test(t)) {
          const match = t.match(/^(\d+)\.\s(.*)$/);
          if (match) return (
            <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View style={{ width: 22, height: 22, borderRadius: 8, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color }}>{match[1]}</Text>
              </View>
              <Text style={{ fontSize: 14, lineHeight: 22, color: onText, flex: 1, fontWeight: '500' }}>{match[2]}</Text>
            </View>
          );
        }
        return <Text key={i} style={{ fontSize: 14, lineHeight: 22, color: onText, fontWeight: '500' }}>{t}</Text>;
      })}
    </View>
  );
}

// ── Message bubble — Clay pill style ──────────────────────────────────────────
function Bubble({ msg, primary, onBook }: { msg: Msg; primary: string; onBook: () => void }) {
  const isUser = msg.role === 'user';
  return (
    <View style={[bbl.row, isUser && bbl.rowR]}>
      {!isUser && (
        <View style={[bbl.ava, { backgroundColor: primary, shadowColor: primary }]}>
          <Ionicons name="sparkles" size={13} color="#FFF" />
        </View>
      )}
      <View style={{ maxWidth: width * 0.78 }}>
        <View style={[
          bbl.bubble,
          isUser
            ? [bbl.userBubble, { backgroundColor: primary, shadowColor: primary }]
            : bbl.aiBubble,
        ]}>
          {msg.loading
            ? <TypingDots color={primary} />
            : isUser
              ? <Text style={[bbl.txt, { color: '#FFF' }]}>{msg.text}</Text>
              : <RichText text={msg.text} color={primary} onText="#0F172A" />
          }
        </View>
        {/* Book Now */}
        {!isUser && !msg.loading && msg.hasBooking && (
          <TouchableOpacity style={[bbl.bookBtn, { borderColor: primary + '40', backgroundColor: primary + '10' }]} onPress={onBook} activeOpacity={0.8}>
            <Ionicons name="ticket-outline" size={14} color={primary} />
            <Text style={[bbl.bookTxt, { color: primary }]}>Book Now in Roamio</Text>
            <Ionicons name="arrow-forward" size={13} color={primary} />
          </TouchableOpacity>
        )}
        <Text style={bbl.time}>
          {msg.ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}
const bbl = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 16 },
  rowR:     { flexDirection: 'row-reverse' },
  ava:      { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 28, flexShrink: 0, elevation: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
  bubble:   { borderRadius: 24, paddingHorizontal: 16, paddingVertical: 13 },
  userBubble: { borderBottomRightRadius: 6, elevation: 4, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8 },
  aiBubble:   { backgroundColor: '#FFF', borderBottomLeftRadius: 6, elevation: 2, shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 1, borderColor: 'rgba(167,243,208,0.5)' },
  txt:      { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  bookBtn:  { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9, alignSelf: 'flex-start' },
  bookTxt:  { fontSize: 13, fontWeight: '800' },
  time:     { fontSize: 10, marginTop: 4, color: '#94A3B8', fontWeight: '600', paddingHorizontal: 3 },
});

// ══════════════════════════════════════════════════════════════════════════════
// WELCOME MODAL — exact match to Screenshot 1
// ══════════════════════════════════════════════════════════════════════════════
function WelcomeSheet({ visible, primary, onStart }: { visible: boolean; primary: string; onStart: () => void }) {
  const slideY = useRef(new Animated.Value(400)).current;
  useEffect(() => {
    if (visible) Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 160 }).start();
  }, [visible]);

  const CHIPS = [
    { label: 'Train Planning', icon: 'bag-handle-outline' as const,  bg: '#D1FAE5', color: '#10B981' },
    { label: 'Budget Guard',   icon: 'card-outline'       as const,  bg: '#EDE9FE', color: '#8B5CF6' },
    { label: 'Family Trips',   icon: 'people-outline'     as const,  bg: '#FEF3C7', color: '#F59E0B' },
    { label: 'Budget Flights', icon: 'airplane-outline'   as const,  bg: '#EDE9FE', color: '#6366F1' },
    { label: 'Visa & Intl',    icon: 'globe-outline'      as const,  bg: '#E0F2FE', color: '#0EA5E9' },
    { label: '500+ tok/s',     icon: 'flash-outline'      as const,  bg: '#FEF3C7', color: '#F59E0B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      {/* Backdrop */}
      <View style={ws.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onStart} />

        <Animated.View style={[ws.sheet, { transform: [{ translateY: slideY }] }]}>
          {/* Handle */}
          <View style={ws.handle} />

          {/* Orb */}
          <View style={ws.orbWrap}>
            <View style={[ws.orbGlow, { backgroundColor: primary + '20' }]} />
            <View style={[ws.orb, { backgroundColor: primary, shadowColor: primary }]}>
              {LottieView ? (
                <LottieView
                  source={require('../animations/Robot Futuristic Ai animated.json')}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
              ) : (
                <Ionicons name="star-outline" size={32} color="#FFF" />
              )}
            </View>
          </View>

          {/* Title */}
          <Text style={ws.title}>Your Travel Pilot{'\n'}Has Landed</Text>
          <Text style={ws.titleStar}> ✦</Text>

          {/* Subtitle */}
          <Text style={ws.sub}>Groq LPU-powered. 10x faster than ChatGPT.{'\n'}Plans trips, guards budgets, books for 11+.</Text>

          {/* Capability chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ws.chipScroll} contentContainerStyle={ws.chipRow}>
            {CHIPS.map(c => (
              <View key={c.label} style={[ws.chip, { backgroundColor: c.bg }]}>
                <Ionicons name={c.icon} size={13} color={c.color} />
                <Text style={[ws.chipTxt, { color: c.color }]}>{c.label}</Text>
              </View>
            ))}
          </ScrollView>

          {/* CTA */}
          <TouchableOpacity style={[ws.cta, { backgroundColor: primary, shadowColor: primary }]} onPress={onStart} activeOpacity={0.85}>
            <Ionicons name="star-outline" size={18} color="#FFF" />
            <Text style={ws.ctaTxt}>Start Chatting</Text>
            <Ionicons name="arrow-forward" size={17} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          <Text style={ws.hint}>Tap anywhere outside to dismiss</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const ws = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5,50,20,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#E8F5E9', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    alignItems: 'center', elevation: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.15, shadowRadius: 24,
  },
  handle: { width: 40, height: 4, backgroundColor: 'rgba(16,185,129,0.35)', borderRadius: 2, marginBottom: 28 },
  orbWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 24, width: 96, height: 96 },
  orbGlow: { position: 'absolute', width: 96, height: 96, borderRadius: 48 },
  orb:    { width: 76, height: 76, borderRadius: 26, alignItems: 'center', justifyContent: 'center', elevation: 12, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16 },
  title:  { fontSize: 30, fontWeight: '900', color: '#064E3B', textAlign: 'center', letterSpacing: -0.8, lineHeight: 36 },
  titleStar: { fontSize: 24, color: '#10B981', position: 'absolute', opacity: 0 }, // inline via text concat
  sub:    { fontSize: 14, color: '#065F46', textAlign: 'center', lineHeight: 22, fontWeight: '500', marginBottom: 20, marginTop: 8 },
  chipScroll: { width: '100%', marginBottom: 26 },
  chipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  chip:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  chipTxt:{ fontSize: 13, fontWeight: '800' },
  cta:    {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 22, paddingVertical: 18, marginBottom: 14,
    elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 14,
  },
  ctaTxt: { fontSize: 17, fontWeight: '900', color: '#FFF', letterSpacing: 0.2 },
  hint:   { fontSize: 12, color: '#6EE7B7', fontWeight: '600' },
});

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN — exact match to Screenshots 2 & 3
// ══════════════════════════════════════════════════════════════════════════════
export default function AgentScreen() {
  const darkMode  = useSettingsStore(s => s.darkMode);
  const isPremium = usePremiumStore(s => s.isPremium);
  const nodes     = useTripStore(s => s.nodes);
  const paths     = useTripStore(s => s.paths);
  const budget    = useTripStore(s => s.globalBudget);
  const spent     = useTripStore(s => s.spentBudget);
  const persona   = useTripStore(s => s.persona);
  const homeCity  = useTripStore(s => s.homeCity);
  const insets    = useSafeAreaInsets();

  // ── Theme tokens ─────────────────────────────────────────────────────────
  const mint1 = '#10B981'; // vibrant
  const mint2 = '#6EE7B7'; // mid
  const mint3 = '#A7F3D0'; // soft
  const mint4 = '#E8F5E9'; // page bg
  const darkBg    = darkMode ? '#020F08' : mint4;
  const cardBg    = darkMode ? '#0F1F14' : '#FFFFFF';
  const cardBdr   = darkMode ? '#163322' : 'rgba(167,243,208,0.45)';
  const primary   = darkMode ? '#00F59B' : mint1;
  const txt1      = darkMode ? '#F0FDF4' : '#064E3B';
  const txt2      = darkMode ? '#4ADE80' : '#065F46';
  const txt3      = darkMode ? '#6B7280' : '#6B7280';
  const hdrBg     = darkMode ? 'rgba(2,15,8,0.96)' : 'rgba(255,255,255,0.97)';
  const chipBg    = darkMode ? '#163322' : '#F0FDF4';
  const chipBdr   = darkMode ? '#1A4A2A' : 'rgba(167,243,208,0.5)';
  const inputBg   = darkMode ? '#0F1F14' : '#FFFFFF';
  const inputBdr  = darkMode ? '#163322' : 'rgba(167,243,208,0.6)';
  const rem       = ((budget - spent) / 1000).toFixed(0);

  const [showWelcome, setShowWelcome] = useState(false);
  const [msgs, setMsgs]   = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy,  setBusy]  = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const orbPulse  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_KEY).then(v => { if (v !== 'true') setShowWelcome(true); }).catch(() => {});
    // Slow pulse for orb — lightweight
    Animated.loop(Animated.sequence([
      Animated.timing(orbPulse, { toValue: 1.08, duration: 2200, useNativeDriver: true }),
      Animated.timing(orbPulse, { toValue: 1.00, duration: 2200, useNativeDriver: true }),
    ])).start();
  }, []);

  const dismissWelcome = async () => {
    await AsyncStorage.setItem(WELCOME_KEY, 'true').catch(() => {});
    setShowWelcome(false);
  };

  const systemPrompt = useMemo(() => {
    const tripCtx = nodes.length > 0 ? `Active trip: ${nodes.map(n => n.city).join(' → ')}` : 'No active trip';
    return `You are Roamio — elite AI travel pilot. Groq LPU. 10x faster.
USER: Home ${homeCity} | ${tripCtx} | Budget ₹${(budget/1000).toFixed(0)}k total, ₹${rem}k left | ${isPremium ? 'PREMIUM' : 'FREE'}
RULES: Plain text only. No emojis. No markdown. Section labels in ALLCAPS followed by colon. Numbered lists (1. 2.). Specific train names, costs in INR. Under 230 words. End with one actionable tip.
Capabilities: Complete India trip planning, train/flight/bus, multi-city, hotel, budget INR, family 11+ members, visa, international.`;
  }, [nodes, budget, spent, persona, homeCity, isPremium, rem]);

  const scrollBottom = useCallback(() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80), []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput('');
    setBusy(true);
    const uid = `u${Date.now()}`;
    const lid = `a${Date.now() + 1}`;
    setMsgs(prev => [
      ...prev,
      { id: uid, role: 'user',      text: trimmed, ts: new Date() },
      { id: lid, role: 'assistant', text: '',       ts: new Date(), loading: true },
    ]);
    scrollBottom();
    try {
      const history = msgs.slice(-10).map(m => ({ role: m.role as 'user'|'assistant', content: m.text }));
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: trimmed }], temperature: 0.72, max_tokens: 820 }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message ?? `HTTP ${res.status}`); }
      const data  = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim() ?? 'No response.';
      setMsgs(prev => prev.map(m => m.id === lid ? { ...m, text: reply, loading: false, ts: new Date(), hasBooking: detectBooking(reply) } : m));
    } catch (e: any) {
      setMsgs(prev => prev.map(m => m.id === lid ? { ...m, text: `Could not connect: ${e.message}`, loading: false, ts: new Date() } : m));
    } finally { setBusy(false); scrollBottom(); }
  }, [busy, msgs, systemPrompt, scrollBottom]);

  const sendQuick = (p: string) => { setMsgs([]); send(p); };
  const newChat   = () => setMsgs([]);

  return (
    <View style={{ flex: 1, backgroundColor: darkBg }}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={hdrBg} />

      {/* Welcome bottom sheet */}
      <WelcomeSheet visible={showWelcome} primary={primary} onStart={dismissWelcome} />

      {/* ── HEADER ── */}
      <View style={[hd.wrap, { backgroundColor: hdrBg, paddingTop: insets.top }]}>
        <View style={hd.row}>
          {/* Back */}
          <TouchableOpacity style={[hd.pill, { backgroundColor: chipBg, borderColor: chipBdr }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color={txt1} />
          </TouchableOpacity>

          {/* Orb + Title */}
          <View style={hd.center}>
            <Animated.View style={[hd.orb, { backgroundColor: primary, shadowColor: primary, transform: [{ scale: orbPulse }] }]}>
              <Ionicons name="sparkles" size={17} color="#FFF" />
            </Animated.View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <Text style={[hd.title, { color: txt1 }]}>Roamio AI</Text>
                {isPremium && <View style={hd.proBadge}><Text style={hd.proTxt}>PRO</Text></View>}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <View style={[hd.onlineDot, { backgroundColor: primary }]} />
                <Text style={[hd.sub, { color: txt2 }]}>Groq LPU · llama-3.3-70B</Text>
              </View>
            </View>
          </View>

          {/* Right actions */}
          <View style={{ flexDirection: 'row', gap: 7 }}>
            <TouchableOpacity style={[hd.pill, { backgroundColor: chipBg, borderColor: chipBdr }]} onPress={newChat}>
              <Ionicons name="chatbubble-outline" size={17} color={txt1} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[hd.pill, { backgroundColor: '#FEF3C7', borderColor: '#D4AF37' + '50' }]}
              onPress={() => router.push('/subscription' as any)}
            >
              <Ionicons name="diamond-outline" size={16} color="#D97706" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stat chips */}
        <View style={hd.chips}>
          {[
            { icon: 'flash-outline'         as const, label: '10× Speed',          bg: '#FEF3C7', color: '#D97706' },
            { icon: 'hardware-chip-outline' as const, label: 'LPU',                bg: '#EDE9FE', color: '#7C3AED' },
            { icon: 'card-outline'          as const, label: `₹${rem}k left`,      bg: '#D1FAE5', color: '#059669' },
          ].map(c => (
            <View key={c.label} style={[hd.chip, { backgroundColor: c.bg, borderColor: c.color + '30' }]}>
              <Ionicons name={c.icon} size={11} color={c.color} />
              <Text style={[hd.chipTxt, { color: c.color }]}>{c.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[ch.content, { paddingBottom: 14 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollBottom}
        >
          {msgs.length === 0 && (
            <>
              {/* Hero card — mint gradient stadium */}
              <View style={[ch.hero, { backgroundColor: darkMode ? '#0A2E1A' : '#FFFFFF', borderColor: cardBdr }]}>
                {/* Mint gradient overlay */}
                <View style={[ch.heroGrad, { backgroundColor: darkMode ? '#052012' : mint3 + '60' }]} />
                <View style={ch.heroBadge}>
                  <View style={[ch.heroBadgeDot, { backgroundColor: primary }]} />
                  <Text style={[ch.heroBadgeTxt, { color: primary }]}>TRAVEL AI PILOT</Text>
                </View>
                <Text style={[ch.heroTitle, { color: txt1 }]}>Ask me anything{'\n'}about your journey.</Text>
                <Text style={[ch.heroTags, { color: txt2 }]}>Routes · Budgets · Visas · Group trips · Itineraries</Text>
              </View>

              {/* Trip context */}
              {nodes.length > 0 && (
                <View style={[ch.tripChip, { backgroundColor: primary + '15', borderColor: primary + '35' }]}>
                  <Ionicons name="git-network-outline" size={13} color={primary} />
                  <Text style={[ch.tripChipTxt, { color: primary }]} numberOfLines={1}>
                    {nodes.map(n => n.city).join(' → ')}
                  </Text>
                </View>
              )}

              {/* Quick Start grid */}
              <Text style={[ch.label, { color: txt2 }]}>QUICK START</Text>
              <View style={ch.quickGrid}>
                {QUICK.map(q => (
                  <TouchableOpacity
                    key={q.label}
                    style={[ch.quickCard, { backgroundColor: cardBg, borderColor: cardBdr, shadowColor: primary }]}
                    onPress={() => sendQuick(q.prompt)}
                    activeOpacity={0.78}
                  >
                    <View style={[ch.quickIcon, { backgroundColor: q.bg }]}>
                      <Ionicons name={q.icon} size={20} color={q.color} />
                    </View>
                    <Text style={[ch.quickLbl, { color: txt1 }]}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Capabilities */}
              <Text style={[ch.label, { color: txt2 }]}>CAPABILITIES</Text>
              {CAPS.map((c, i) => (
                <View key={i} style={[ch.capRow, { backgroundColor: cardBg, borderColor: cardBdr, shadowColor: primary }]}>
                  <View style={[ch.capIcon, { backgroundColor: c.bg }]}>
                    <Ionicons name={c.icon} size={16} color={c.color} />
                  </View>
                  <Text style={[ch.capTxt, { color: txt1 }]}>
                    {c.text.replace('{REM}', rem)}
                  </Text>
                </View>
              ))}

              {/* Upgrade banner */}
              {!isPremium && (
                <TouchableOpacity
                  style={[ch.upgCard, { backgroundColor: darkMode ? '#1F1200' : '#FFFBEB', borderColor: '#D97706' + '45' }]}
                  onPress={() => router.push('/subscription' as any)}
                  activeOpacity={0.84}
                >
                  <View style={[ch.upgIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="diamond" size={18} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[ch.upgTitle, { color: '#92600A' }]}>Unlock Pro Mode</Text>
                    <Text style={[ch.upgSub, { color: '#B45309' }]}>24/7 watchdog · live tracking · unlimited family</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#D97706" />
                </TouchableOpacity>
              )}
            </>
          )}

          {msgs.map(m => (
            <Bubble key={m.id} msg={m} primary={primary} onBook={() => router.push('/(tabs)/booking' as any)} />
          ))}
        </ScrollView>

        {/* ── INPUT BAR ── */}
        <View style={[inp.wrap, { backgroundColor: darkBg, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={[inp.pill, { backgroundColor: inputBg, borderColor: inputBdr, shadowColor: primary }]}>
            <TextInput
              style={[inp.txt, { color: txt1 }]}
              placeholder="Ask about routes, budget, trains..."
              placeholderTextColor={txt3}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={600}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[inp.sendBtn, {
                backgroundColor: input.trim() && !busy ? primary : 'transparent',
              }]}
              onPress={() => send(input)}
              disabled={!input.trim() || busy}
              activeOpacity={0.8}
            >
              {busy
                ? <ActivityIndicator size="small" color={primary} />
                : <Ionicons name="send" size={16} color={input.trim() ? '#FFF' : primary + '60'} style={{ marginLeft: 2 }} />
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Header styles ─────────────────────────────────────────────────────────────
const hd = StyleSheet.create({
  wrap:  { elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, zIndex: 10 },
  row:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 10, gap: 9 },
  pill:  { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  orb:   { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8 },
  center:{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  title: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  proBadge: { backgroundColor: '#D4AF37', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  proTxt:   { fontSize: 9, fontWeight: '900', color: '#1B4A0D', letterSpacing: 0.8 },
  onlineDot:{ width: 6, height: 6, borderRadius: 3 },
  sub:   { fontSize: 10, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 7, paddingHorizontal: 14, paddingBottom: 12 },
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  chipTxt: { fontSize: 11, fontWeight: '800' },
});

// ── Chat styles ───────────────────────────────────────────────────────────────
const ch = StyleSheet.create({
  content: { paddingHorizontal: 14, paddingTop: 14 },

  // Hero card
  hero: {
    borderRadius: 32, borderWidth: 1.5, marginBottom: 14, overflow: 'hidden',
    paddingHorizontal: 22, paddingVertical: 22,
    elevation: 3, shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10,
  },
  heroGrad: { ...StyleSheet.absoluteFillObject as any, opacity: 0.55 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  heroBadgeDot: { width: 7, height: 7, borderRadius: 4 },
  heroBadgeTxt: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  heroTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.7, lineHeight: 36, marginBottom: 10 },
  heroTags:  { fontSize: 13, fontWeight: '500', lineHeight: 19 },

  tripChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9, marginBottom: 16 },
  tripChipTxt: { fontSize: 12, fontWeight: '700', flex: 1 },

  label: { fontSize: 11, fontWeight: '900', letterSpacing: 1.8, marginBottom: 12 },

  // Quick grid — 2 column
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  quickCard: {
    width: (width - 38) / 2, borderRadius: 26, borderWidth: 1.5, padding: 17, gap: 12,
    elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  quickIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLbl:  { fontSize: 14, fontWeight: '800', lineHeight: 20 },

  // Capabilities list
  capRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 22, borderWidth: 1.5,
    padding: 14, marginBottom: 8,
    elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  capIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  capTxt:  { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 21 },

  // Upgrade
  upgCard:  { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 22, borderWidth: 1.5, padding: 16, marginTop: 6 },
  upgIcon:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  upgTitle: { fontSize: 15, fontWeight: '900' },
  upgSub:   { fontSize: 12, fontWeight: '600', marginTop: 3, opacity: 0.85 },
});

// ── Input styles ──────────────────────────────────────────────────────────────
const inp = StyleSheet.create({
  wrap: { paddingHorizontal: 14, paddingTop: 10 },
  pill: {
    flexDirection: 'row', alignItems: 'flex-end',
    borderRadius: 26, borderWidth: 1.5,
    paddingHorizontal: 18, paddingVertical: 12,
    minHeight: 56, maxHeight: 120,
    elevation: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10,
  },
  txt:    { flex: 1, fontSize: 15, fontWeight: '500', lineHeight: 22, maxHeight: 100 },
  sendBtn:{ width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginLeft: 6, flexShrink: 0 },
});
