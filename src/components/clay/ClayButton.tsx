import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  emoji?: string;
  small?: boolean;
}

export function ClayButton({
  label, onPress,
  color = '#A5D6A7',
  textColor = '#1B5E20',
  style, emoji, small,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const shadow = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, damping: 15, stiffness: 120 }),
      Animated.timing(shadow, { toValue: 0, useNativeDriver: false, duration: 80 }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 120 }),
      Animated.timing(shadow, { toValue: 1, useNativeDriver: false, duration: 150 }),
    ]).start();
    onPress();
  };

  const elevation = shadow.interpolate({ inputRange: [0, 1], outputRange: [1, 6] });

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.btn, small && styles.small, { backgroundColor: color }]}
      >
        <Text style={[styles.label, small && styles.smallLabel, { color: textColor }]}>
          {emoji ? `${emoji}  ` : ''}{label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: 'rgba(129,199,132,0.4)',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  small: { paddingVertical: 9, paddingHorizontal: 18 },
  label: { fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
  smallLabel: { fontSize: 12 },
});
