import React, { useRef, useState } from 'react';
import {
  Animated, Dimensions, FlatList, StyleSheet,
  Text, TouchableOpacity, View, ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NC } from '../src/constants/theme';

// Safe lottie — works if installed, falls back to animated illustration
let LottieView: any = null;
try { LottieView = require('lottie-react-native'); LottieView = LottieView.default ?? LottieView; } catch (_) {}

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1', title: 'Plan Your\nDream Trip',
    subtitle: 'Build beautiful itineraries across India & Singapore with smart route planning.',
    source: require('../animations/Man Planning A Sightseeing Route.json'),
    accent: '#2E7D32', cardBg: '#C8E6C9', icon: '◎',
  },
  {
    id: '2', title: 'Fly & Explore\nThe World',
    subtitle: 'Compare flights, trains and buses. Swap transport modes with a single tap.',
    source: require('../animations/WORLD EXPLORATION.json'),
    accent: '#00695C', cardBg: '#B2DFDB', icon: '✈',
  },
  {
    id: '3', title: 'Ride the Rails\nAcross India',
    subtitle: 'Plan your rail journey, compare classes and book the perfect seat instantly.',
    source: require('../animations/Train Minimalist Animation.json'),
    accent: '#2E7D32', cardBg: '#C8E6C9', icon: '≡',
  },
  {
    id: '4', title: 'Travel as\nOne Family',
    subtitle: 'Manage all members, split expenses, broadcast alerts and stay in sync.',
    source: require('../animations/Adding Guests Interaction.json'),
    accent: '#388E3C', cardBg: '#DCEDC8', icon: '◈',
  },
  {
    id: '5', title: "Let's Get\nStarted",
    subtitle: 'Your journey begins now. Open Nomad Canvas and start planning.',
    source: require('../animations/Hey lets get started.json'),
    accent: '#1B5E20', cardBg: '#A5D6A7', icon: '▶',
  },
];

// ── Clay squish button ────────────────────────────────────────────────────────
function ClayBtn({ label, onPress, bg, fg, flex, icon }: {
  label: string; onPress: () => void; bg: string; fg: string; flex?: number; icon?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, damping: 15, stiffness: 150 }).start();
  const onOut = () => { Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 150 }).start(); onPress(); };
  return (
    <Animated.View style={[ob.clayBtn, { flex, backgroundColor: bg, transform: [{ scale }] }]}>
      <TouchableOpacity onPressIn={onIn} onPressOut={onOut} activeOpacity={1} style={ob.clayBtnInner}>
        <Text style={[ob.clayBtnText, { color: fg }]}>{label}</Text>
        {icon && (
          <View style={[ob.clayBtnArrow, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
            <Text style={[ob.clayBtnArrowText, { color: bg }]}>{icon}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Slide card ────────────────────────────────────────────────────────────────
function SlideCard({ slide, isActive }: { slide: typeof SLIDES[0]; isActive: boolean }) {
  const lottieRef = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.88)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.4)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: isActive ? 1 : 0.88, useNativeDriver: true, damping: 15, stiffness: 150 }),
      Animated.timing(opacityAnim, { toValue: isActive ? 1 : 0.4, duration: 250, useNativeDriver: true }),
    ]).start();
    if (isActive) lottieRef.current?.play?.();
    else lottieRef.current?.pause?.();
  }, [isActive]);

  return (
    <Animated.View style={[ob.animCard, { borderColor: slide.cardBg, transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      <View style={[ob.cardBgBlob, { backgroundColor: slide.cardBg }]} />
      {LottieView ? (
        <LottieView
          ref={lottieRef}
          source={slide.source}
          autoPlay={isActive}
          loop
          style={ob.lottie}
          resizeMode="contain"
          hardwareAccelerationAndroid
        />
      ) : (
        // Fallback animated illustration
        <View style={ob.fallback}>
          <View style={[ob.fallbackCircle, { backgroundColor: slide.cardBg }]}>
            <Text style={[ob.fallbackIcon, { color: slide.accent }]}>{slide.icon}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const goTo = (i: number) => {
    flatRef.current?.scrollToIndex({ index: i, animated: true });
    setCurrent(i);
    Animated.spring(progressAnim, { toValue: i, useNativeDriver: false, damping: 18, stiffness: 120 }).start();
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
    <View style={ob.container}>
      <SafeAreaView edges={['top']}>
        <View style={ob.topBar}>
          <View style={ob.brandRow}>
            <View style={[ob.brandDot, { backgroundColor: slide.accent }]} />
            <Text style={[ob.brand, { color: slide.accent }]}>Nomad Canvas</Text>
          </View>
          {!isLast && (
            <TouchableOpacity onPress={skip} style={[ob.skipBtn, { borderColor: slide.accent + '40' }]} activeOpacity={0.8}>
              <Text style={[ob.skipText, { color: slide.accent }]}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={ob.flatList}
        renderItem={({ item, index }) => (
          <View style={[ob.slide, { width }]}>
            <SlideCard slide={item} isActive={index === current} />
          </View>
        )}
      />

      <View style={ob.bottom}>
        {/* Dots */}
        <View style={ob.dotsRow}>
          {SLIDES.map((_, i) => {
            const w = progressAnim.interpolate({ inputRange: [i - 1, i, i + 1], outputRange: [8, 36, 8], extrapolate: 'clamp' });
            return (
              <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
                <Animated.View style={[ob.dot, { width: w, backgroundColor: i === current ? slide.accent : slide.cardBg }]} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clay text card */}
        <View style={[ob.textCard, { borderColor: slide.cardBg }]}>
          <Text style={[ob.title, { color: slide.accent }]}>{slide.title}</Text>
          <Text style={ob.subtitle}>{slide.subtitle}</Text>
        </View>

        {/* Clay CTA buttons */}
        <View style={ob.ctaRow}>
          {current > 0 && !isLast && (
            <ClayBtn label="Back" onPress={() => goTo(current - 1)}
              bg={NC.surfaceLowest} fg={slide.accent} flex={1} />
          )}
          <ClayBtn
            label={isLast ? 'Get Started' : 'Next'}
            onPress={goNext}
            bg={slide.accent} fg="#fff"
            flex={current === 0 || isLast ? 1 : 2}
            icon={isLast ? '▶' : '›'}
          />
        </View>
      </View>
    </View>
  );
}

const ob = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: { width: 10, height: 10, borderRadius: 5 },
  brand: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  skipBtn: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999,
    backgroundColor: NC.surfaceLowest, borderWidth: 1.5,
    shadowColor: NC.shadowOuter, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 5,
  },
  skipText: { fontSize: 13, fontWeight: '700' },
  flatList: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },

  // Clay animation card — inflated plastic look
  animCard: {
    width: width * 0.88, height: height * 0.37,
    borderRadius: 48,
    backgroundColor: NC.surfaceLowest,
    borderWidth: 2,
    // Outer clay shadow
    shadowColor: 'rgba(165,214,167,0.45)',
    shadowOffset: { width: 12, height: 12 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 14,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  cardBgBlob: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.22 },
  lottie: { width: '92%', height: '92%' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallbackCircle: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: 'rgba(165,214,167,0.4)', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8,
  },
  fallbackIcon: { fontSize: 52, fontWeight: '900' },

  // Bottom
  bottom: { paddingHorizontal: 24, paddingBottom: 36, paddingTop: 14 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 },
  dot: { height: 8, borderRadius: 4 },

  // Clay text card — inflated white card
  textCard: {
    backgroundColor: NC.surfaceLowest, borderRadius: 40, padding: 24, marginBottom: 18,
    borderWidth: 2,
    shadowColor: 'rgba(165,214,167,0.35)',
    shadowOffset: { width: 10, height: 10 }, shadowOpacity: 1, shadowRadius: 24, elevation: 8,
  },
  title: { fontSize: 28, fontWeight: '900', lineHeight: 34, marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: NC.onSurfaceVariant, lineHeight: 22, fontWeight: '500' },

  // Clay squish button
  clayBtn: {
    borderRadius: 999, marginBottom: 0,
    // Outer clay shadow
    shadowColor: 'rgba(165,214,167,0.45)',
    shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 20, elevation: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  clayBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 28, gap: 10 },
  clayBtnText: { fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  clayBtnArrow: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  clayBtnArrowText: { fontSize: 20, fontWeight: '900', lineHeight: 24 },
  ctaRow: { flexDirection: 'row', gap: 12 },
});
