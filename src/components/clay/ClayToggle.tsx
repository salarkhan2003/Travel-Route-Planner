import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  value: boolean;
  onToggle: () => void;
  activeColor?: string;
}

export function ClayToggle({ value, onToggle, activeColor = '#81C784' }: Props) {
  const translateX = useRef(new Animated.Value(value ? 26 : 2)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 26 : 2,
      useNativeDriver: true,
      damping: 15,
      stiffness: 120,
    }).start();
  }, [value]);

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.9}>
      <View style={[styles.track, { backgroundColor: value ? activeColor : '#C8E6C9' }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 56, height: 30, borderRadius: 15,
    justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: 'rgba(129,199,132,0.4)',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 3,
  },
  thumb: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#81C784',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4, elevation: 4,
  },
});
