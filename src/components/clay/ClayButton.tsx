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
  color = '#4CAF50',
  textColor = '#FFF',
  style, emoji, small,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, damping: 15, stiffness: 200 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 200 }).start();
    onPress();
  };

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
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: 'rgba(76,175,80,0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  small: { paddingVertical: 10, paddingHorizontal: 20 },
  label: { fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  smallLabel: { fontSize: 13 },
});
