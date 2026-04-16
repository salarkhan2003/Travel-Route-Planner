/**
 * ClayToggle — Liquid clay toggle switch
 * 
 * ✦ Concave track with inner shadow (sunken into clay)
 * ✦ Convex thumb with outer shadow (popping out)
 * ✦ Elastic spring animation
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  value: boolean;
  onToggle: () => void;
  activeColor?: string;
}

export function ClayToggle({ value, onToggle, activeColor = '#2E7D32' }: Props) {
  const translateX = useRef(new Animated.Value(value ? 30 : 3)).current;
  const trackColor = useRef(new Animated.Value(value ? 1 : 0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: value ? 30 : 3, useNativeDriver: true, damping: 14, stiffness: 180 }),
      Animated.timing(trackColor, { toValue: value ? 1 : 0, duration: 250, useNativeDriver: false }),
    ]).start();
  }, [value]);

  const handlePress = () => {
    // Squish the thumb
    Animated.sequence([
      Animated.spring(thumbScale, { toValue: 0.85, useNativeDriver: true, damping: 15, stiffness: 200 }),
      Animated.spring(thumbScale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 120 }),
    ]).start();
    onToggle();
  };

  const bg = trackColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#C8E6C9', activeColor],
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View style={[s.track, { backgroundColor: bg }]}>
        {/* Concave inner shadow for sunken look */}
        <View style={s.trackInner} pointerEvents="none" />
        <Animated.View style={[s.thumb, { transform: [{ translateX }, { scale: thumbScale }] }]}>
          {/* 3D sheen on thumb */}
          <View style={s.thumbSheen} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  track: {
    width: 64, height: 34, borderRadius: 17,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    // Concave (sunken) border — darker on top-left
    borderWidth: 2,
    borderColor: 'rgba(165,214,167,0.5)',
    borderTopColor: 'rgba(27,94,32,0.15)',
    borderLeftColor: 'rgba(27,94,32,0.1)',
    // Subtle outer shadow
    shadowColor: 'rgba(27,94,32,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 4,
  },
  // Inner shadow overlay for sunken/concave effect
  trackInner: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  thumb: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
    // Convex (popping out) shadow
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    borderRightColor: 'rgba(165,214,167,0.2)',
    shadowColor: 'rgba(27,94,32,0.3)',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 6,
  },
  thumbSheen: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
});
