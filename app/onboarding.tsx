import React, { useRef, useState } from 'react';
import {
  Animated, Dimensions, FlatList, StyleSheet,
  Text, TouchableOpacity, View, ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NC } from '../src/constants/theme';

// Safe lottie import — falls back to null if not installed in build folder
let LottieView: any = null;
try { LottieView = require('lottie-react-native').default; } catch (_) {}

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Plan Your\nDream Trip',
    subtitle: 'Build beautiful itineraries across India & Singapore with smart route planning.',
    anim: '../animations/Man Planning A Sightseeing Route.lottie',
    animReq: () => { try { return require('../animations/Man Planning A Sightseeing Route.lottie'); } catch { return null; } },
    accent: '#39653f', bg1: '#c5f8c7', bg2: '#b7e9b9',
  },
  {
    id: '2',
    title: 'Fly & Explore\nThe World',
    subtitle: 'Compare flights, trains and buses. Swap transport modes with a single tap.',
    animReq: () => { try { return require('../animations/airport.lottie'); } catch { return null; } },
    accent: '#0d6661', bg1: '#a7f3ec', bg2: '#cceacd',
  },
  {
    id: '3',
    title: 'Ride the Rails\nAcross India',
    subtitle: 'Plan your rail journey, compare classes and book the perfect seat instantly.',
    animReq: () => { try { return require('../animations/Train.lottie'); } catch { return null; } },
    accent: '#39653f', bg1: '#c5f8c7', bg2: '#ebf3e3',
  },
  {
    id: '4',
    title: 'Travel as\nOne Family',
    subtitle: 'Manage all members, split expenses, broadcast alerts and stay in sync.',
    animReq: () => { try { return require('../animations/planning.lottie'); } catch { return null; } },
    accent: '#47624b', bg1: '#cceacd', bg2: '#b7e9b9',
  },
];

function SlideCard({ slide, isActive }: { slide: typeof SLIDES[0]; isActive: boolean }) {
  const lottieRef = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.9)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.5)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: isActive ? 1 : 0.9, useNativeDriver: true, damping: 18, stiffness: 140 }),
      Animated.timing(opacityAnim, { toValue: isActive ? 1 : 0.5, duration: 250, useNativeDriver: true }),
    ]).start();
    if (isActive) lottieRef.current?.play?.();
    else lottieRef.current?.pause?.();
  }, [isActive]);

  const src = slide.animReq();

  return (
    <Animated.View style={[s.animCard, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      {/* Decorative bg blobs */}
      <View style={[s.blob1, { backgroundColor: slide.bg1 }]} />
      <View style={[s.blob2, { backgroundColor: slide.bg2 }]} />
      {/* Lottie or fallback */}
      {LottieView && src ? (
        <LottieView
          ref={lottieRef}
          source={src}
          autoPlay={isActive}
          loop
          style={s.lottie}
          resizeMode="contain"
          renderMode="HARDWARE"
          cacheComposition
        />
      ) : (
        <View style={s.fallback}>
          <View style={[s.fallbackCircle, { backgroundColor: slide.bg1 }]}>
            <Text style={[s.fallbackNum, { color: slide.accent }]}>{SLIDES.indexOf(slide) + 1}</Text>
          </View>
        </View>
      )}
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

      {/* Slides */}
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

      {/* Bottom panel */}
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

        {/* Text card — full clay */}
        <View style={s.textCard}>
          <Text style={s.title}>{slide.title}</Text>
          <Text style={s.subtitle}>{slide.subtitle}</Text>
        </View>

        {/* CTA row */}
        <View style={s.ctaRow}>
          {current > 0 ? (
            <TouchableOpacity onPress={() => goTo(current - 1)} style={s.backBtn} activeOpacity={0.8}>
              <Text style={s.backBtnText}>Back</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={goNext}
            style={[s.nextBtn, current === 0 && { flex: 1 }]}
            activeOpacity={0.85}
          >
            <View style={s.nextBtnInner}>
              <Text style={s.nextBtnText}>
                {current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
              </Text>
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

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 14,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: NC.primary },
  brand: { fontSize: 20, fontWeight: '900', color: NC.primary, letterSpacing: -0.3 },
  skipBtn: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999,
    backgroundColor: NC.surfaceLowest,
    borderWidth: 1.5, borderColor: 'rgba(57,101,63,0.2)',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 4,
  },
  skipText: { fontSize: 13, fontWeight: '700', color: NC.primary },

  flatList: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },

  // Clay animation card
  animCard: {
    width: width * 0.88,
    height: height * 0.34,
    borderRadius: 40,
    backgroundColor: NC.surfaceLowest,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(42,49,39,0.14)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    top: -40, right: -40, opacity: 0.6,
  },
  blob2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    bottom: -30, left: -30, opacity: 0.5,
  },
  lottie: { width: '90%', height: '90%' },
  fallback: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  fallbackCircle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
  },
  fallbackNum: { fontSize: 40, fontWeight: '900' },

  // Bottom
  bottom: { paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 },
  dot: { height: 8, borderRadius: 4 },

  // Clay text card
  textCard: {
    backgroundColor: NC.surfaceLowest,
    borderRadius: 32,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(42,49,39,0.10)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
  },
  title: { fontSize: 28, fontWeight: '900', color: NC.primary, lineHeight: 34, marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: NC.onSurfaceVariant, lineHeight: 22, fontWeight: '500' },

  // CTA
  ctaRow: { flexDirection: 'row', gap: 12 },
  backBtn: {
    flex: 1, paddingVertical: 18, borderRadius: 999, alignItems: 'center',
    backgroundColor: NC.surfaceLowest,
    borderWidth: 1.5, borderColor: 'rgba(57,101,63,0.25)',
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1, shadowRadius: 14, elevation: 4,
  },
  backBtnText: { fontSize: 15, fontWeight: '800', color: NC.primary },
  nextBtn: {
    flex: 2, backgroundColor: NC.primary, borderRadius: 999,
    paddingVertical: 18,
    shadowColor: 'rgba(42,49,39,0.25)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  nextBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  nextArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  nextArrowText: { fontSize: 20, fontWeight: '900', lineHeight: 24 },
});
