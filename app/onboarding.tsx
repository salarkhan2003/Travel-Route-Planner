import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, FlatList, StyleSheet,
  Text, TouchableOpacity, View, ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NC } from '../src/constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Plan Your\nDream Trip',
    subtitle: 'Build beautiful itineraries across India & Singapore with smart route planning.',
    bg1: '#c5f8c7', bg2: '#b7e9b9', accent: NC.primary,
    label: 'Route Planner',
  },
  {
    id: '2',
    title: 'Fly & Explore\nThe World',
    subtitle: 'Compare flights, trains and buses. Swap transport modes with a single tap.',
    bg1: '#a7f3ec', bg2: '#cceacd', accent: NC.tertiary,
    label: 'Air Travel',
  },
  {
    id: '3',
    title: 'Ride the Rails\nAcross India',
    subtitle: 'Plan your rail journey, compare classes and book the perfect seat instantly.',
    bg1: '#c5f8c7', bg2: '#ebf3e3', accent: NC.primary,
    label: 'Train Journey',
  },
  {
    id: '4',
    title: 'Travel as\nOne Family',
    subtitle: 'Manage all members, split expenses, broadcast alerts and stay in sync.',
    bg1: '#cceacd', bg2: '#b7e9b9', accent: NC.secondary,
    label: 'Family Hub',
  },
];

// ─── Animated illustration for each slide ────────────────────────────────────
function Illustration({ slide, index, isActive }: { slide: typeof SLIDES[0]; index: number; isActive: boolean }) {
  const float = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 0.85, useNativeDriver: true, damping: 18, stiffness: 140 }),
        Animated.timing(opacity, { toValue: 0.4, duration: 200, useNativeDriver: true }),
      ]).start();
      return;
    }
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 100 }),
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
    // Float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -14, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    // Slow rotate for decorative elements
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [isActive]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const icons = ['◎', '✈', '🚆', '◈'];
  const icon = icons[index];

  return (
    <Animated.View style={[s.illusWrap, { opacity, transform: [{ scale }] }]}>
      {/* Background blobs */}
      <View style={[s.blob1, { backgroundColor: slide.bg1 }]} />
      <View style={[s.blob2, { backgroundColor: slide.bg2 }]} />
      {/* Rotating ring */}
      <Animated.View style={[s.ring, { borderColor: slide.accent + '30', transform: [{ rotate: spin }] }]} />
      <Animated.View style={[s.ring2, { borderColor: slide.bg1, transform: [{ rotate: spin }] }]} />
      {/* Floating main icon */}
      <Animated.View style={[s.iconCircle, { backgroundColor: slide.accent, transform: [{ translateY: float }] }]}>
        <Text style={s.iconText}>{icon}</Text>
      </Animated.View>
      {/* Floating mini cards */}
      <Animated.View style={[s.miniCard, s.miniCard1, { backgroundColor: slide.bg1, transform: [{ translateY: float }] }]}>
        <View style={[s.miniDot, { backgroundColor: slide.accent }]} />
        <View style={s.miniLine} />
        <View style={[s.miniLine, { width: '60%' }]} />
      </Animated.View>
      <Animated.View style={[s.miniCard, s.miniCard2, { backgroundColor: NC.surfaceLowest, transform: [{ translateY: Animated.multiply(float, new Animated.Value(-0.6)) }] }]}>
        <Text style={[s.miniLabel, { color: slide.accent }]}>{slide.label}</Text>
      </Animated.View>
      {/* Dots */}
      {[0, 1, 2].map(i => (
        <Animated.View key={i} style={[s.floatDot, {
          backgroundColor: i === 0 ? slide.accent : slide.bg1,
          left: `${20 + i * 28}%` as any,
          bottom: '14%',
          transform: [{ translateY: Animated.multiply(float, new Animated.Value(0.4 + i * 0.2)) }],
        }]} />
      ))}
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const goTo = (index: number) => {
    flatRef.current?.scrollToIndex({ index, animated: true });
    setCurrent(index);
    Animated.spring(progressAnim, { toValue: index, useNativeDriver: false, damping: 18, stiffness: 120 }).start();
  };

  const goNext = () => current < SLIDES.length - 1 ? goTo(current + 1) : router.replace('/(tabs)/home');
  const skip = () => router.replace('/(tabs)/home');

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrent(idx);
      Animated.spring(progressAnim, { toValue: idx, useNativeDriver: false, damping: 18, stiffness: 120 }).start();
    }
  }).current;

  const slide = SLIDES[current];

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']}>
        <View style={s.topBar}>
          <View style={s.brandRow}>
            <View style={s.brandDot} />
            <Text style={s.brand}>Nomad Canvas</Text>
          </View>
          <TouchableOpacity onPress={skip} style={s.skipBtn} activeOpacity={0.75}>
            <Text style={s.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={s.flatList}
        renderItem={({ item, index }) => (
          <View style={[s.slide, { width }]}>
            <View style={s.animCard}>
              <Illustration slide={item} index={index} isActive={index === current} />
            </View>
          </View>
        )}
      />

      <View style={s.bottom}>
        {/* Progress dots */}
        <View style={s.dotsRow}>
          {SLIDES.map((_, i) => {
            const w = progressAnim.interpolate({ inputRange: [i - 1, i, i + 1], outputRange: [8, 36, 8], extrapolate: 'clamp' });
            return (
              <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
                <Animated.View style={[s.dot, { width: w, backgroundColor: i === current ? NC.primary : NC.primaryFixed }]} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Text card */}
        <View style={s.textCard}>
          <Text style={s.title}>{slide.title}</Text>
          <Text style={s.subtitle}>{slide.subtitle}</Text>
        </View>

        {/* CTA */}
        <View style={s.ctaRow}>
          {current > 0 ? (
            <TouchableOpacity onPress={() => goTo(current - 1)} style={s.backBtn} activeOpacity={0.8}>
              <Text style={s.backBtnText}>Back</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={goNext} style={[s.nextBtn, current === 0 && { flex: 1 }]} activeOpacity={0.85}>
            <View style={s.nextBtnInner}>
              <Text style={s.nextBtnText}>{current === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
              <View style={s.nextArrow}>
                <Text style={[s.nextArrowText, { color: NC.primary }]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: NC.primary },
  brand: { fontSize: 20, fontWeight: '900', color: NC.primary, letterSpacing: -0.3 },
  skipBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: NC.surfaceLowest, borderWidth: 1.5, borderColor: 'rgba(57,101,63,0.2)', shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4 },
  skipText: { fontSize: 13, fontWeight: '700', color: NC.primary },
  flatList: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },

  // Clay animation card
  animCard: {
    width: width * 0.88, height: height * 0.36, borderRadius: 40,
    backgroundColor: NC.surfaceLowest, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(42,49,39,0.14)', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1, shadowRadius: 40, elevation: 12,
    overflow: 'hidden',
  },

  // Illustration internals
  illusWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  blob1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, top: -50, right: -50, opacity: 0.55 },
  blob2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, bottom: -40, left: -40, opacity: 0.45 },
  ring: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderStyle: 'dashed' },
  ring2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1.5 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: 'rgba(42,49,39,0.2)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8,
  },
  iconText: { fontSize: 36, color: '#fff' },
  miniCard: {
    position: 'absolute', borderRadius: 16, padding: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(42,49,39,0.10)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 12, elevation: 5,
  },
  miniCard1: { left: '6%', top: '12%', width: 80, gap: 5 },
  miniCard2: { right: '6%', bottom: '16%', paddingHorizontal: 14 },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  miniLine: { height: 4, backgroundColor: 'rgba(42,49,39,0.08)', borderRadius: 2, width: '100%' },
  miniLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  floatDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },

  // Bottom
  bottom: { paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 },
  dot: { height: 8, borderRadius: 4 },
  textCard: { backgroundColor: NC.surfaceLowest, borderRadius: 32, padding: 24, marginBottom: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.95)', shadowColor: 'rgba(42,49,39,0.10)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 28, elevation: 8 },
  title: { fontSize: 28, fontWeight: '900', color: NC.primary, lineHeight: 34, marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: NC.onSurfaceVariant, lineHeight: 22, fontWeight: '500' },
  ctaRow: { flexDirection: 'row', gap: 12 },
  backBtn: { flex: 1, paddingVertical: 18, borderRadius: 999, alignItems: 'center', backgroundColor: NC.surfaceLowest, borderWidth: 1.5, borderColor: 'rgba(57,101,63,0.25)', shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 4 },
  backBtnText: { fontSize: 15, fontWeight: '800', color: NC.primary },
  nextBtn: { flex: 2, backgroundColor: NC.primary, borderRadius: 999, paddingVertical: 18, shadowColor: 'rgba(42,49,39,0.25)', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 24, elevation: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  nextBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  nextArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  nextArrowText: { fontSize: 20, fontWeight: '900', lineHeight: 24 },
});
