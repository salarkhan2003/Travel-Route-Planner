/**
 * ClayCard — Nomad Canvas Claymorphism
 * Double inner shadow: top-left white highlight + bottom-right dark green depth
 * Ultra-rounded corners (40px default)
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | (ViewStyle | undefined | false)[];
  variant?: 'white' | 'mint' | 'green' | 'dark';
  color?: string;
  radius?: number;
  padding?: number;
}

export function ClayCard({ children, style, variant = 'white', color, radius, padding }: Props) {
  const flat = Array.isArray(style) ? (style.filter(Boolean) as ViewStyle[]) : style;
  const base = variant === 'mint' ? s.mint
    : variant === 'green' ? s.green
    : variant === 'dark' ? s.dark
    : s.white;
  return (
    <View style={[
      base,
      color ? { backgroundColor: color } : {},
      radius ? { borderRadius: radius } : {},
      padding !== undefined ? { padding } : {},
      flat,
    ]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  white: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(27,62,31,0.18)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 10,
    padding: 20,
    marginBottom: 16,
  },
  mint: {
    backgroundColor: '#F1F8F2',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(27,62,31,0.14)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
    padding: 20,
    marginBottom: 16,
  },
  green: {
    backgroundColor: '#2E7D32',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(27,62,31,0.35)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 12,
    padding: 20,
    marginBottom: 16,
  },
  dark: {
    backgroundColor: '#1B3A1F',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(165,214,167,0.2)',
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 12,
    padding: 20,
    marginBottom: 16,
  },
});
