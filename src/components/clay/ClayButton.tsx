/**
 * ClayButton — Nomad Canvas clay-button recipe
 * box-shadow: 10px 20px 30px rgba(42,49,39,0.08),
 *             inset 2px 2px 4px rgba(255,255,255,0.8),
 *             inset -4px -4px 8px rgba(52,96,59,0.2)
 * :active → inset shadow inverts (pressed clay)
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
}

export function ClayButton({ label, onPress, color, textColor, style, small, ghost }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, damping: 20, stiffness: 300 }).start();

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 300 }).start();
    onPress();
  };

  const bg = color ?? (ghost ? '#f2f9ea' : '#39653f');
  const fg = textColor ?? (ghost ? '#39653f' : '#cfffcf');

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
        <Text style={[s.label, small && s.smallLabel, { color: fg }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  btn: {
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    // Clay button outer shadow
    shadowColor: 'rgba(42,49,39,0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  small: { paddingVertical: 10, paddingHorizontal: 20 },
  ghost: {
    borderWidth: 1.5,
    borderColor: 'rgba(57,101,63,0.3)',
    shadowColor: 'rgba(42,49,39,0.06)',
    shadowRadius: 10,
    elevation: 2,
  },
  label: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  smallLabel: { fontSize: 13 },
});
