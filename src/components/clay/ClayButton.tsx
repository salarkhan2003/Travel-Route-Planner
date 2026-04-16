/**
 * ClayButton — Soft inflated plastic button
 * Press: squishes down (scale 0.96) + shadow collapses = tactile clay feel
 */
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  small?: boolean;
  ghost?: boolean;
  icon?: string;
}

export function ClayButton({ label, onPress, color, textColor, style, small, ghost, icon }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const shadowY = useRef(new Animated.Value(10)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, damping: 20, stiffness: 400 }),
      Animated.timing(shadowY, { toValue: 3, duration: 80, useNativeDriver: false }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 300 }),
      Animated.timing(shadowY, { toValue: 10, duration: 150, useNativeDriver: false }),
    ]).start();
    onPress();
  };

  const bg = color ?? (ghost ? '#F1F8F2' : '#2E7D32');
  const fg = textColor ?? (ghost ? '#2E7D32' : '#FFFFFF');

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[
          s.btn,
          small && s.small,
          ghost && s.ghost,
          { backgroundColor: bg },
        ]}
      >
        {icon ? <Text style={[s.icon, { color: fg }]}>{icon}  </Text> : null}
        <Text style={[s.label, small && s.smallLabel, { color: fg }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  btn: {
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(27,62,31,0.30)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  small: { paddingVertical: 10, paddingHorizontal: 20 },
  ghost: {
    borderWidth: 2,
    borderColor: 'rgba(46,125,50,0.3)',
    shadowColor: 'rgba(27,62,31,0.10)',
    shadowRadius: 10,
    elevation: 3,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  smallLabel: { fontSize: 13 },
});
