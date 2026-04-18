import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function LiquidSpinner() {
  const scale = useRef(new Animated.Value(0.95)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.95, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [scale, rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.clayBall,
        {
          transform: [{ scale }, { rotate: spin }]
        }
      ]}>
        <View style={styles.claySheen} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clayBall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderTopLeftRadius: 46,
    borderBottomRightRadius: 42,
    borderTopRightRadius: 36,
    borderBottomLeftRadius: 38,
    backgroundColor: '#2E7D32',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    shadowColor: 'rgba(46, 125, 50, 0.6)',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  claySheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.4)',
  }
});
