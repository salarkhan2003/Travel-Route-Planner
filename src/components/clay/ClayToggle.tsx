import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  value: boolean;
  onToggle: () => void;
  activeColor?: string;
}

export function ClayToggle({ value, onToggle, activeColor = '#1B5E20' }: Props) {
  const translateX = useRef(new Animated.Value(value ? 28 : 3)).current;
  const trackColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: value ? 28 : 3, useNativeDriver: true, damping: 14, stiffness: 180 }),
      Animated.timing(trackColor, { toValue: value ? 1 : 0, duration: 200, useNativeDriver: false }),
    ]).start();
  }, [value]);

  const bg = trackColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D4E6D6', activeColor],
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.9}>
      <Animated.View style={[s.track, { backgroundColor: bg }]}>
        <Animated.View style={[s.thumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  track: {
    width: 60, height: 32, borderRadius: 16,
    justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: 'rgba(27,94,32,0.20)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 4,
  },
  thumb: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(27,94,32,0.25)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 5,
  },
});
