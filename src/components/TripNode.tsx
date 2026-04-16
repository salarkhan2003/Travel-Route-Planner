import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { TripNode } from '../types/trip';
import type { TripState } from '../types/trip';
import { useTripStore } from '../store/tripStore';

interface Props {
  node: TripNode;
  index: number;
  onPress: () => void;
}

export function TripNodeMarker({ node, index, onPress }: Props) {
  const selectedNodeId = useTripStore((s: TripState) => s.selectedNodeId);
  const toggleLockNode = useTripStore((s: TripState) => s.toggleLockNode);
  const isSelected = selectedNodeId === node.id;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const borderColor = node.isLocked ? '#FFD700' : isSelected ? '#00BFFF' : '#39FF14';

  return (
    <Marker
      coordinate={{ latitude: node.coordinates[1], longitude: node.coordinates[0] }}
      onPress={handlePress}
      tracksViewChanges={false}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity onLongPress={() => toggleLockNode(node.id)} activeOpacity={0.8}>
          <View style={[styles.costBubble, { borderColor }, node.isGreyedOut && styles.greyed]}>
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <Text style={styles.cityName}>{node.city}</Text>
            <Text style={[styles.costText, { color: borderColor }]}>${node.totalStayCost}</Text>
            <Text style={styles.nightsText}>{node.stayNights}N</Text>
            {node.isLocked && <Text style={styles.lockIcon}>Lk</Text>}
          </View>
          <View style={[styles.pinTail, { borderTopColor: borderColor }]} />
        </TouchableOpacity>
      </Animated.View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  costBubble: {
    backgroundColor: 'rgba(10, 10, 30, 0.92)',
    borderWidth: 1.5, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    alignItems: 'center', minWidth: 72,
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 8, elevation: 8,
  },
  greyed: { opacity: 0.35 },
  indexBadge: {
    position: 'absolute', top: -8, left: -8,
    backgroundColor: '#39FF14', width: 18, height: 18,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  indexText: { color: '#000', fontSize: 10, fontWeight: '800' },
  cityName: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  costText: { fontSize: 14, fontWeight: '800' },
  nightsText: { color: '#888', fontSize: 10 },
  lockIcon: { fontSize: 10, marginTop: 2 },
  pinTail: {
    alignSelf: 'center', width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
});
