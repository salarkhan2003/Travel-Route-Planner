import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, FlatList, StyleSheet,
  Text, TouchableOpacity, View, ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1', title: 'Plan Your\nDream Trip',
    subtitle: 'Build beautiful itineraries across India & Singapore with smart route planning.',
    bg: '#E8F5E9', accent: '#2E7D32', light: '#C8E6C9', mid: '#A5D6A7',
  },
  {
    id: '2', title: 'Fly & Explore\nThe World',
    subtitle: 'Compare flights, trains and buses. Swap transport modes with a single tap.',
    bg: '#E3F2FD', accent: '#1565C0', light: '#BBDEFB', mid: '#90CAF9',
  },
  {
    id: '3', title: 'Ride the Rails\nAcross India',
    subtitle: 'Plan your rail journey. Track routes, compare 3AC/2AC and book instantly.',
    bg: '#FFF8E1', accent: '#E65100', light: '#FFE0B2', mid: '#FFCC80',
  },
  {
    id: '4', title: 'Control Your\nFamily Trip',
    subtitle: 'Manage 11 members, split expenses, broadcast alerts and track everyone live.',
    bg: '#F3E5F5', accent: '#6A1B9A', light: '#E1BEE7', mid: '#CE93D8',
  },
];

// ─── Slide 1: Map with animated pins ───────────────────────────────────────
function PlanIllustration({ accent, light, mid }: { accent: string; light: string; mid: string }) {
  const pin1 = useRef(new Animated.Value(0)).current;
  const pin2 = useRef(new Animated.Value(0)).current;
  const pin3 = useRef(new Animated.Value(0)).current;
  const routeWidth = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(pin1, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 180 }),
      Animated.spring(pin2, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 180 }),
      Animated.spring(pin3, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 180 }),
    ]).start();
    Animated.timing(routeWidth, { toValue: 1, duration: 1200, delay: 600, useNativeDriver: false }).start();
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, delay: 1400, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, delay: 1400, useNativeDriver: true, damping: 14, stiffness: 100 }),
    ]).start();
    // Float loop
    Animated.loop(Animated.sequence([
      Animated.timing(pin1, { toValue: 1.1, duration: 900, useNativeDriver: true }),
      Animated.timing(pin1, { toValue: 1, duration: 900, useNativeDriver: true }),
    ])).start();
  }, []);

  const pinScale = (anim: Animated.Value) => anim.interpolate({ inputRange: [0, 1, 1.1], outputRange: [0, 1, 1.08] });
  const rw = routeWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.illusContainer}>
      {/* Map card */}
      <View style={[styles.mapCard, { backgroundColor: light, borderColor: 'rgba(255,255,255,0.9)' }]}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((v) => (
          <View key={v} style={[styles.gridLine, { top: `${v * 100}%` as any, backgroundColor: `${accent}18` }]} />
        ))}
        {[0.25, 0.5, 0.75].map((v) => (
          <View key={v} style={[styles.gridLineV, { left: `${v * 100}%` as any, backgroundColor: `${accent}18` }]} />
        ))}
        {/* Route line */}
        <View style={styles.routeLineContainer}>
          <Animated.View style={[styles.routeLine, { width: rw, backgroundColor: accent }]} />
        </View>
        {/* Pins */}
        {[
          { left: '18%', top: '30%', label: 'GNT', anim: pin1 },
          { left: '48%', top: '20%', label: 'AJM', anim: pin2 },
          { left: '72%', top: '35%', label: 'DEL', anim: pin3 },
        ].map((p) => (
          <Animated.View key={p.label} style={[styles.pin, { left: p.left as any, top: p.top as any, transform: [{ scale: pinScale(p.anim) }] }]}>
            <View style={[styles.pinBubble, { backgroundColor: accent }]}>
              <Text style={styles.pinLabel}>{p.label}</Text>
            </View>
            <View style={[styles.pinTail, { borderTopColor: accent }]} />
          </Animated.View>
        ))}
      </View>
      {/* Info card */}
      <Animated.View style={[styles.infoCard, { backgroundColor: mid, opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
        <Text style={[styles.infoCardTitle, { color: accent }]}>Guntur → Ajmer → Delhi</Text>
        <Text style={styles.infoCardSub}>3 cities · 9 nights · ₹12,400 total</Text>
      </Animated.View>
    </View>
  );
}

// ─── Slide 2: Airplane flying ──────────────────────────────────────────────
function FlightIllustration({ accent, light, mid }: { accent: string; light: string; mid: string }) {
  const planeX = useRef(new Animated.Value(-80)).current;
  const planeY = useRef(new Animated.Value(20)).current;
  const cloud1X = useRef(new Animated.Value(0)).current;
  const cloud2X = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(planeX, { toValue: 0, useNativeDriver: true, damping: 14, stiffness: 80 }),
      Animated.spring(planeY, { toValue: 0, useNativeDriver: true, damping: 14, stiffness: 80 }),
    ]).start();
    Animated.timing(cardOpacity, { toValue: 1, duration: 500, delay: 800, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(planeY, { toValue: -10, duration: 1200, useNativeDriver: true }),
      Animated.timing(planeY, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(cloud1X, { toValue: -20, duration: 3000, useNativeDriver: true }),
      Animated.timing(cloud1X, { toValue: 0, duration: 3000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(cloud2X, { toValue: 15, duration: 2500, useNativeDriver: true }),
      Animated.timing(cloud2X, { toValue: 0, duration: 2500, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={styles.illusContainer}>
      <View style={[styles.skyCard, { backgroundColor: light }]}>
        {/* Clouds */}
        <Animated.View style={[styles.cloud, styles.cloud1, { backgroundColor: 'rgba(255,255,255,0.8)', transform: [{ translateX: cloud1X }] }]} />
        <Animated.View style={[styles.cloud, styles.cloud2, { backgroundColor: 'rgba(255,255,255,0.6)', transform: [{ translateX: cloud2X }] }]} />
        <Animated.View style={[styles.cloud, styles.cloud3, { backgroundColor: 'rgba(255,255,255,0.7)', transform: [{ translateX: cloud1X }] }]} />
        {/* Trail */}
        <View style={[styles.trail, { backgroundColor: `${accent}30` }]} />
        {/* Plane */}
        <Animated.View style={[styles.planeCircle, { backgroundColor: accent, transform: [{ translateX: planeX }, { translateY: planeY }] }]}>
          <Text style={styles.planeEmoji}>✈</Text>
        </Animated.View>
      </View>
      <Animated.View style={[styles.infoCard, { backgroundColor: mid, opacity: cardOpacity }]}>
        <Text style={[styles.infoCardTitle, { color: accent }]}>Delhi → Singapore</Text>
        <Text style={styles.infoCardSub}>5h 30m · Economy · ₹18,500</Text>
      </Animated.View>
    </View>
  );
}

// ─── Slide 3: Train on tracks ──────────────────────────────────────────────
function TrainIllustration({ accent, light, mid }: { accent: string; light: string; mid: string }) {
  const trainX = useRef(new Animated.Value(-120)).current;
  const smoke1 = useRef(new Animated.Value(0)).current;
  const smoke2 = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(trainX, { toValue: 0, useNativeDriver: true, damping: 16, stiffness: 70 }).start();
    Animated.timing(cardOpacity, { toValue: 1, duration: 500, delay: 900, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(smoke1, { toValue: -30, duration: 1000, useNativeDriver: true }),
      Animated.timing(smoke1, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(smoke2, { toValue: -24, duration: 800, delay: 300, useNativeDriver: true }),
      Animated.timing(smoke2, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={styles.illusContainer}>
      <View style={[styles.trainScene, { backgroundColor: light }]}>
        {/* Smoke */}
        <Animated.View style={[styles.smoke, { left: '22%', top: '10%', opacity: smoke1.interpolate({ inputRange: [-30, 0], outputRange: [0, 0.6] }), transform: [{ translateY: smoke1 }], backgroundColor: `${accent}60` }]} />
        <Animated.View style={[styles.smoke, styles.smoke2, { left: '28%', top: '8%', opacity: smoke2.interpolate({ inputRange: [-24, 0], outputRange: [0, 0.4] }), transform: [{ translateY: smoke2 }], backgroundColor: `${accent}40` }]} />
        {/* Train */}
        <Animated.View style={[styles.trainBody, { transform: [{ translateX: trainX }] }]}>
          <View style={[styles.trainEngine, { backgroundColor: accent }]}>
            <Text style={styles.trainIcon}>🚆</Text>
          </View>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.trainCoach, { backgroundColor: mid, borderColor: accent }]} />
          ))}
        </Animated.View>
        {/* Tracks */}
        <View style={[styles.track, { backgroundColor: accent }]} />
        <View style={[styles.trackSleeper, { backgroundColor: `${accent}60` }]} />
      </View>
      <Animated.View style={[styles.infoCard, { backgroundColor: mid, opacity: cardOpacity }]}>
        <Text style={[styles.infoCardTitle, { color: accent }]}>Rajdhani Express</Text>
        <Text style={styles.infoCardSub}>3AC · 22 hours · ₹890 per person</Text>
      </Animated.View>
    </View>
  );
}

// ─── Slide 4: Family members ───────────────────────────────────────────────
function FamilyIllustration({ accent, light, mid }: { accent: string; light: string; mid: string }) {
  const members = [
    { initial: 'S', label: 'Leader', delay: 0 },
    { initial: 'D', label: 'Dad', delay: 100 },
    { initial: 'M', label: 'Mom', delay: 200 },
    { initial: 'S1', label: 'Sis 1', delay: 300 },
    { initial: 'S2', label: 'Sis 2', delay: 400 },
  ];
  const anims = members.map(() => useRef(new Animated.Value(0)).current);
  const floatAnims = members.map(() => useRef(new Animated.Value(0)).current);
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    members.forEach((m, i) => {
      Animated.spring(anims[i], { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 150, delay: m.delay }).start();
      Animated.loop(Animated.sequence([
        Animated.timing(floatAnims[i], { toValue: 1, duration: 1400 + i * 200, useNativeDriver: true }),
        Animated.timing(floatAnims[i], { toValue: 0, duration: 1400 + i * 200, useNativeDriver: true }),
      ])).start();
    });
    Animated.timing(cardOpacity, { toValue: 1, duration: 500, delay: 700, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.illusContainer}>
      <View style={[styles.familyScene, { backgroundColor: light }]}>
        {members.map((m, i) => (
          <Animated.View key={m.initial} style={[
            styles.memberBubble,
            {
              backgroundColor: i === 0 ? accent : mid,
              borderColor: 'rgba(255,255,255,0.9)',
              transform: [
                { scale: anims[i] },
                { translateY: floatAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, i % 2 === 0 ? -12 : -7] }) },
              ],
            },
          ]}>
            <Text style={[styles.memberInitial, { color: i === 0 ? '#FFF' : accent }]}>{m.initial}</Text>
            <View style={[styles.onlineDot, { backgroundColor: '#4CAF50' }]} />
          </Animated.View>
        ))}
        {/* Budget bar */}
        <View style={[styles.budgetBar, { backgroundColor: `${accent}20` }]}>
          <View style={[styles.budgetFill, { backgroundColor: accent, width: '43%' }]} />
        </View>
        <Text style={[styles.budgetBarLabel, { color: accent }]}>₹43,500 / ₹1,50,000</Text>
      </View>
      <Animated.View style={[styles.infoCard, { backgroundColor: mid, opacity: cardOpacity }]}>
        <Text style={[styles.infoCardTitle, { color: accent }]}>Family War Room</Text>
        <Text style={styles.infoCardSub}>5 members · All active · Budget tracked</Text>
      </Animated.View>
    </View>
  );
}

const ILLUSTRATIONS = [PlanIllustration, FlightIllustration, TrainIllustration, FamilyIllustration];

export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const animateProgress = (index: number) => {
    Animated.spring(progressAnim, { toValue: index, useNativeDriver: false, damping: 18, stiffness: 120 }).start();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrent(idx);
      animateProgress(idx);
    }
  }).current;

  const goTo = (index: number) => {
    flatRef.current?.scrollToIndex({ index, animated: true });
    setCurrent(index);
    animateProgress(index);
  };

  const goNext = () => current < SLIDES.length - 1 ? goTo(current + 1) : router.replace('/(tabs)/home');
  const goPrev = () => current > 0 && goTo(current - 1);
  const skip = () => router.replace('/(tabs)/home');

  const slide = SLIDES[current];
  const IllusComponent = ILLUSTRATIONS[current];

  const renderItem = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => {
    const Comp = ILLUSTRATIONS[index];
    return (
      <View style={[styles.slide, { backgroundColor: item.bg, width }]}>
        <Comp accent={item.accent} light={item.light} mid={item.mid} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: slide.bg }]}>
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goPrev} style={[styles.navBtn, { opacity: current > 0 ? 1 : 0 }]} disabled={current === 0}>
            <Text style={[styles.navBtnText, { color: slide.accent }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => {
              const w = progressAnim.interpolate({ inputRange: [i - 1, i, i + 1], outputRange: [8, 28, 8], extrapolate: 'clamp' });
              const bg = i === current ? slide.accent : `${slide.accent}44`;
              return (
                <TouchableOpacity key={i} onPress={() => goTo(i)}>
                  <Animated.View style={[styles.dot, { width: w, backgroundColor: bg }]} />
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity onPress={skip} style={[styles.skipBtn, { borderColor: `${slide.accent}55` }]}>
            <Text style={[styles.skipText, { color: slide.accent }]}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={styles.flatList}
        scrollEventThrottle={16}
      />

      <View style={[styles.bottomArea, { backgroundColor: slide.bg }]}>
        <View style={[styles.textCard, { backgroundColor: slide.light, borderColor: 'rgba(255,255,255,0.9)' }]}>
          <Text style={[styles.title, { color: slide.accent }]}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </View>
        <View style={styles.ctaRow}>
          <TouchableOpacity onPress={goPrev}
            style={[styles.prevBtn, { borderColor: `${slide.accent}55`, opacity: current > 0 ? 1 : 0 }]}
            disabled={current === 0}>
            <Text style={[styles.prevBtnText, { color: slide.accent }]}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goNext} style={[styles.nextBtn, { backgroundColor: slide.accent }]} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>{current === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
            <View style={styles.nextArrow}>
              <Text style={[styles.nextArrowText, { color: slide.accent }]}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  navBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 24, fontWeight: '900' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  skipBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  skipText: { fontSize: 13, fontWeight: '700' },
  flatList: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },

  // Shared illustration container
  illusContainer: { width: '100%', alignItems: 'center', gap: 14 },

  // Map illustration
  mapCard: {
    width: width * 0.82, height: width * 0.56, borderRadius: 28,
    borderWidth: 2, overflow: 'hidden', position: 'relative',
    shadowColor: 'rgba(0,0,0,0.12)', shadowOffset: { width: 4, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 8,
  },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1 },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  routeLineContainer: { position: 'absolute', left: '20%', top: '38%', width: '60%', height: 3, overflow: 'hidden' },
  routeLine: { height: 3, borderRadius: 2 },
  pin: { position: 'absolute', alignItems: 'center' },
  pinBubble: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)' },
  pinLabel: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  pinTail: { width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent' },

  // Sky/flight illustration
  skyCard: {
    width: width * 0.82, height: width * 0.52, borderRadius: 28,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 4, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 8,
  },
  cloud: { position: 'absolute', borderRadius: 20 },
  cloud1: { width: 90, height: 36, top: '20%', left: '10%' },
  cloud2: { width: 70, height: 28, top: '55%', right: '8%' },
  cloud3: { width: 55, height: 22, top: '35%', left: '55%' },
  trail: { position: 'absolute', left: '5%', top: '48%', width: '55%', height: 3, borderRadius: 2 },
  planeCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: 'rgba(0,0,0,0.2)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  planeEmoji: { fontSize: 36 },

  // Train illustration
  trainScene: {
    width: width * 0.82, height: width * 0.48, borderRadius: 28,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', overflow: 'hidden',
    justifyContent: 'flex-end', paddingBottom: 16, paddingHorizontal: 12,
    shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 4, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 8,
  },
  smoke: { position: 'absolute', width: 18, height: 18, borderRadius: 9 },
  smoke2: { width: 14, height: 14, borderRadius: 7 },
  trainBody: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trainEngine: { width: 64, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  trainIcon: { fontSize: 22 },
  trainCoach: { width: 44, height: 38, borderRadius: 10, borderWidth: 1.5 },
  track: { height: 4, borderRadius: 2, marginTop: 6 },
  trackSleeper: { height: 8, borderRadius: 2, marginTop: 2 },

  // Family illustration
  familyScene: {
    width: width * 0.82, height: width * 0.52, borderRadius: 28,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 4, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 8,
  },
  memberBubble: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, position: 'relative',
    shadowColor: 'rgba(0,0,0,0.12)', shadowOffset: { width: 2, height: 4 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4,
  },
  memberInitial: { fontSize: 16, fontWeight: '900' },
  onlineDot: { width: 12, height: 12, borderRadius: 6, position: 'absolute', top: 0, right: 0, borderWidth: 2, borderColor: '#FFF' },
  budgetBar: { width: '75%', height: 8, borderRadius: 4, overflow: 'hidden' },
  budgetFill: { height: '100%', borderRadius: 4 },
  budgetBarLabel: { fontSize: 11, fontWeight: '700' },

  // Shared info card
  infoCard: {
    width: width * 0.82, borderRadius: 20, padding: 14,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.08)', shadowOffset: { width: 3, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4,
  },
  infoCardTitle: { fontSize: 15, fontWeight: '900' },
  infoCardSub: { fontSize: 12, color: '#555', marginTop: 3, fontWeight: '500' },

  // Bottom
  bottomArea: { paddingHorizontal: 20, paddingBottom: 36, paddingTop: 8 },
  textCard: {
    borderRadius: 28, padding: 22, marginBottom: 16,
    borderWidth: 2,
    shadowColor: 'rgba(0,0,0,0.08)', shadowOffset: { width: 4, height: 6 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6,
  },
  title: { fontSize: 30, fontWeight: '900', lineHeight: 36, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#555', lineHeight: 20, fontWeight: '500' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prevBtn: { flex: 1, paddingVertical: 16, borderRadius: 50, alignItems: 'center', borderWidth: 2 },
  prevBtnText: { fontSize: 14, fontWeight: '800' },
  nextBtn: {
    flex: 2, borderRadius: 50, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: 'rgba(0,0,0,0.18)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8, gap: 10,
  },
  nextBtnText: { color: '#FFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
  nextArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  nextArrowText: { fontSize: 16, fontWeight: '900' },
});
