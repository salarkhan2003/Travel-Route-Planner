import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useTripStore } from '../store/tripStore';
import { TRANSPORT_COLORS, TRANSPORT_ICONS } from '../constants/tripData';
import { TransportMode, TransportOption } from '../types/trip';

export function TransportSwapper() {
  const selectedPathId = useTripStore((s) => s.selectedPathId);
  const paths = useTripStore((s) => s.paths);
  const nodes = useTripStore((s) => s.nodes);
  const swapTransport = useTripStore((s) => s.swapTransport);
  const selectPath = useTripStore((s) => s.selectPath);

  const path = paths.find((p) => p.id === selectedPathId);
  const translateY = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: path ? 0 : 200,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
    }).start();
  }, [path]);

  if (!path) return null;

  const fromNode = nodes.find((n) => n.id === path.fromNodeId);
  const toNode = nodes.find((n) => n.id === path.toNodeId);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {fromNode?.city} → {toNode?.city}
        </Text>
        <TouchableOpacity onPress={() => selectPath(null)}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Choose your transport</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {path.options.map((opt) => (
          <TransportCard
            key={opt.mode}
            option={opt}
            isSelected={opt.mode === path.selectedMode}
            onSelect={() => swapTransport(path.id, opt.mode as TransportMode)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

function TransportCard({
  option,
  isSelected,
  onSelect,
}: {
  option: TransportOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const color = TRANSPORT_COLORS[option.mode] ?? '#FFF';
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onSelect();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.card, isSelected && { borderColor: color, shadowColor: color }]}
        activeOpacity={0.8}
      >
        <Text style={styles.modeIcon}>{TRANSPORT_ICONS[option.mode]}</Text>
        <Text style={[styles.modeName, { color }]}>{option.mode.toUpperCase()}</Text>
        <Text style={styles.label}>{option.label}</Text>
        <Text style={styles.cost}>${option.cost}</Text>
        <Text style={styles.duration}>{option.durationHrs}h</Text>
        {isSelected && <View style={[styles.selectedDot, { backgroundColor: color }]} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 180,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(10, 10, 30, 0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  closeBtn: { color: '#888', fontSize: 18, padding: 4 },
  subtitle: { color: '#888', fontSize: 12, marginBottom: 12 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 90,
    elevation: 4,
  },
  modeIcon: { fontSize: 24, marginBottom: 4 },
  modeName: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  label: { color: '#AAA', fontSize: 10, marginTop: 2, textAlign: 'center' },
  cost: { color: '#FFF', fontSize: 16, fontWeight: '800', marginTop: 6 },
  duration: { color: '#888', fontSize: 11, marginTop: 2 },
  selectedDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
});
