import React, { useRef, useState } from 'react';
import {
  Animated, Dimensions, FlatList, StyleSheet,
  Text, TouchableOpacity, View, ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { NC } from '../src/constants/theme';

const { width, height } = Dimensions.get('window');

// All 7 animations mapped to 5 slides (slide 5 uses "Hey lets get started")
const SLIDES = [
  {
    id: '1',
    title: 'Plan Your\nDream Trip',
    subtitle: 'Build beautiful itineraries across India & Singapore with smart route planning.',
    source: require('../animations/Man Planning A Sightseeing Route.json'),
    bg: '#f2f9ea', accent: '#39653f', cardBg: '#c5f8c7',
  },
  {
    id: '2',
    title: 'Fly & Explore\nThe World',
    subtitle: 'Compare flights, trains and buses. Swap transport modes with a single tap.',
    source: require('../animations/WORLD EXPLORATION.json'),
    bg: '#f2f9ea', accent: '#0d6661', cardBg: '#a7f3ec',
  },
  {
    id: '3',
    title: 'Ride the Rails\nAcross India',
    subtitle: 'Plan your rail journey, compare classes and book the perfect seat instantly.',
    source: require('../animations/Train Minimalist Animation.json'),
    bg: '#f2f9ea', accent: '#39653f', cardBg: '#c5f8c7',
  },
  {
    id: '4',
    title: 'Travel as\nOne Family',
    subtitle: 'Manage all members, split expenses, broadcast alerts and stay in sync.',
    source: require('../animations/Adding Guests Interaction.json'),
    bg: '#f2f9ea', accent: '#47624b', cardBg: '#cceacd',
  },
  {
    id: '5',
    title: "Let's Get\nStarted",
    subtitle: 'Your journey begins now. Open Nomad Canvas and start planning.',
    source: require('../animations/Hey lets get started.json'),
    bg: '#f2f9ea', accent: '#39653f', cardBg: '#c5f8c7',
  },
];

function SlideCard({ slide, isActive }: { slide: typeof SLIDES[0]; isActive: boolean }) {
  const lottieRef = useRef<LottieView>(null);
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.9)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.5)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: isActive ? 1 : 0.9, useNativeDriver: true, damping: 16, stiffness: 130 }),
      Animated.timing(opacityAnim, { toValue: isActive ? 1 : 0.45, duration: 250, useNativeDriver: true }),
    ]).start();
    if (isActive) lottieRef.current?.play();
    else lottieRef.current?.pause();
  }, [isActive]);

  return (
    <Animated.View style={[s.animCard, { borderColor: slide.cardBg, transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      {/* Colored bg blob */}
      <View style={[s.cardBg, { backgroundColor: slide.cardBg }]} />
      <LottieView
        ref={lottieRef}
        source={slide.source}
        autoPlay={isActive}
        loop
        style={s.lottie}
        resizeMode="contain"
        hardwareAccelerationAndroid
      />
    </Animated.View>
  );
}

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
  const isLast = current === SLIDES.length - 1;

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']}>
        <View style={s.topBar}>
          <View style={s.brandRow}>
            <View style={[s.brandDot, { backgroundColor: slide.accent }]} />
            <Text style={[s.brand, { color: slide.accent }]}>Nomad Canvas</Text>
          </View>
          {!isLast && (
            <TouchableOpacity onPress={skip} style={s.skipBtn} activeOpacity={0.75}>
              <Text style={[s.skipText, { color: slide.accent }]}>Skip</Text>
            </TouchableOpacity>
          )}
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
            <SlideCard slide={item} isActive={index === current} />
          </View>
        )}
      />

      <View style={s.bottom}>
        {/* Progress dots */}
        <View style={s.dotsRow}>
          {SLIDES.map((sl, i) => {
            const w = progressAnim.interpolate({ inputRange: [i - 1, i, i + 1], outputRange: [8, 36, 8], extrapolate: 'clamp' });
            return (
              <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
                <Animated.View style={[s.dot, { width: w, backgroundColor: i === current ? slide.accent : slide.cardBg }]} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clay text card */}
        <View style={[s.textCard, { borderColor: slide.cardBg }]}>
          <Text style={[s.title, { color: slide.accent }]}>{slide.title}</Text>
          <Text style={s.subtitle}>{slide.subtitle}</Text>
        </View>

        {/* CTA buttons */}
        <View style={s.ctaRow}>
          {current > 0 && !isLast && (
            <TouchableOpacity onPress={() => goTo(current - 1)} style={[s.backBtn, { borderColor: slide.accent + '35' }]} activeOpacity={0.8}>
              <Text style={[s.backBtnText, { color: slide.accent }]}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={goNext}
            style={[s.nextBtn, { backgroundColor: slide.accent }, (current === 0 || isLast) && { flex: 1 }]}
            activeOpacity={0.85}
          >
            <View style={s.nextBtnInner}>
              <Text style={s.nextBtnText}>{isLast ? 'Get Started' : 'Next'}</Text>
              <View style={s.nextArrow}>
                <Text style={[s.nextArrowText, { color: slide.accent }]}>{isLast ? '▶' : '›'}</Text>
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
  brandDot: { width: 10, height: 10, borderRadius: 5 },
  brand: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  skipBtn: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999,
    backgroundColor: NC.surfaceLowest, borderWidth: 1.5, borderColor: 'rgba(57,101,63,0.2)',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4,
  },
  skipText: { fontSize: 13, fontWeight: '700' },
  flatList: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },

  // Clay animation card — white surface, colored border, deep shadow
  animCard: {
    width: width * 0.88,
    height: height * 0.37,
    borderRadius: 40,
    backgroundColor: NC.surfaceLowest,
    borderWidth: 2,
    // Clay 3D shadow
    shadowColor: 'rgba(42,49,39,0.16)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.18,
  },
  lottie: { width: '92%', height: '92%' },

  // Bottom panel
  bottom: { paddingHorizontal: 24, paddingBottom: 36, paddingTop: 14 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 },
  dot: { height: 8, borderRadius: 4 },

  // Clay text card
  textCard: {
    backgroundColor: NC.surfaceLowest,
    borderRadius: 32, padding: 24, marginBottom: 18,
    borderWidth: 2,
    shadowColor: 'rgba(42,49,39,0.10)',
    shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 28, elevation: 8,
  },
  title: { fontSize: 28, fontWeight: '900', lineHeight: 34, marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: NC.onSurfaceVariant, lineHeight: 22, fontWeight: '500' },

  // CTA
  ctaRow: { flexDirection: 'row', gap: 12 },
  backBtn: {
    flex: 1, paddingVertical: 18, borderRadius: 999, alignItems: 'center',
    backgroundColor: NC.surfaceLowest, borderWidth: 1.5,
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 4,
  },
  backBtnText: { fontSize: 15, fontWeight: '800' },
  nextBtn: {
    flex: 2, borderRadius: 999, paddingVertical: 18,
    shadowColor: 'rgba(42,49,39,0.28)',
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 24, elevation: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  nextBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  nextArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  nextArrowText: { fontSize: 20, fontWeight: '900', lineHeight: 24 },
});
