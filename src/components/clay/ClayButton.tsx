/**
 * ClayButton — Mint Green Liquid Clay
 * Squish physics: spring damping:15 stiffness:150, scale 0.96 on press
 * Outer shadow: 12px 12px 24px rgba(165,214,167,0.3)
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

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, damping: 15, stiffness: 150 }).start();

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 150 }).start();
    onPress();
  };

  const bg = color ?? (ghost ? '#F1F8E9' : '#2E7D32');
  const fg = textColor ?? (ghost ? '#1B5E20' : '#FFFFFF');

  return (
    <Animated.View style={[s.wrap, { transform: [{ scale }] }, style]}>
      <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}
        style={[s.btn, small && s.small, ghost && s.ghost, { backgroundColor: bg }]}>
        {icon ? <Text style={[s.icon, { color: fg }]}>{icon}  </Text> : null}
        <Text style={[s.label, small && s.smallLabel, { color: fg }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {},
  btn: {
    borderRadius: 999,
    paddingVertical: 16, paddingHorizontal: 32,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    // Outer clay shadow
    shadowColor: 'rgba(165,214,167,0.45)',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1, shadowRadius: 20, elevation: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)',
  },
  small: { paddingVertical: 10, paddingHorizontal: 20 },
  ghost: {
    borderWidth: 2, borderColor: 'rgba(46,125,50,0.3)',
    shadowColor: 'rgba(165,214,167,0.2)', shadowRadius: 10, elevation: 3,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  smallLabel: { fontSize: 13 },
});
