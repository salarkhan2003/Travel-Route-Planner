import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { NC } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  small?: boolean;
  ghost?: boolean;
  emoji?: string;
}

export function ClayButton({ label, onPress, color, textColor, style, small, ghost, emoji }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, damping: 20, stiffness: 300 }).start();

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 300 }).start();
    onPress();
  };

  const bg = color ?? (ghost ? NC.surfaceLow : NC.primary);
  const fg = textColor ?? (ghost ? NC.primary : NC.onPrimary);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[s.btn, small && s.small, ghost && s.ghost, { backgroundColor: bg }]}
      >
        <Text style={[s.label, small && s.smallLabel, { color: fg }]}>
          {emoji ? `${emoji}  ` : ''}{label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  btn: {
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: 'rgba(27,94,32,0.30)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 22,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  small: { paddingVertical: 10, paddingHorizontal: 20 },
  ghost: {
    borderWidth: 1.5,
    borderColor: 'rgba(27,94,32,0.25)',
    shadowColor: 'rgba(27,94,32,0.10)',
    shadowRadius: 10,
    elevation: 3,
  },
  label: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  smallLabel: { fontSize: 13 },
});
