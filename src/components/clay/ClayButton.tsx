/**
 * ClayButton — "Press Effect" Squish Button
 * 
 * ✦ Press: physically indents into screen (scale 0.93 + shadow shrinks)
 * ✦ Release: bounces back with elastic spring
 * ✦ Double shadow: white sheen top-left, green depth bottom-right
 * ✦ Ultra-rounded: pill shape (999 radius)
 */
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

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
  const shadowSize = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, damping: 15, stiffness: 150 }),
      Animated.spring(shadowSize, { toValue: 0.5, useNativeDriver: true, damping: 15, stiffness: 150 }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 120 }),
      Animated.spring(shadowSize, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 120 }),
    ]).start();
    onPress();
  };

  const bg = color ?? (ghost ? '#E8F5E9' : '#2E7D32');
  const fg = textColor ?? (ghost ? '#1B5E20' : '#FFFFFF');

  return (
    <Animated.View style={[s.wrap, { transform: [{ scale }] }, style]}>
      <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}
        style={[s.btn, small && s.small, ghost && s.ghost, { backgroundColor: bg }]}>
        {/* Inner sheen for 3D inflated look */}
        <View style={s.sheen} pointerEvents="none" />
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
    paddingVertical: 18, paddingHorizontal: 36,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    // Double border for 3D clay
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.6)',
    borderTopColor: 'rgba(255,255,255,0.8)',
    borderLeftColor: 'rgba(255,255,255,0.7)',
    borderBottomColor: 'rgba(165,214,167,0.4)',
    borderRightColor: 'rgba(165,214,167,0.3)',
    // Clay outer shadow (bottom-right)
    shadowColor: 'rgba(27,94,32,0.4)',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 18, elevation: 10,
  },
  // Inner sheen — makes button look inflated
  sheen: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  small: { paddingVertical: 12, paddingHorizontal: 24 },
  ghost: {
    borderWidth: 2.5, borderColor: 'rgba(46,125,50,0.25)',
    borderTopColor: 'rgba(255,255,255,0.6)',
    borderLeftColor: 'rgba(255,255,255,0.5)',
    shadowColor: 'rgba(165,214,167,0.25)', shadowRadius: 10, elevation: 4,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  smallLabel: { fontSize: 13 },
});
