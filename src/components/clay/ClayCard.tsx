/**
 * ClayCard — Mint Green Liquid Clay
 * Card bg: #F1F8E9
 * Outer shadow: 12px 12px 24px rgba(165,214,167,0.3)
 * Border radius: min 40px
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
    <View style={[base,
      color ? { backgroundColor: color } : {},
      radius ? { borderRadius: radius } : {},
      padding !== undefined ? { padding } : {},
      flat,
    ]}>
      {children}
    </View>
  );
}

const OUTER_SHADOW = {
  shadowColor: 'rgba(165,214,167,0.35)',
  shadowOffset: { width: 10, height: 10 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 8,
};

const s = StyleSheet.create({
  white: {
    backgroundColor: '#F1F8E9',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    ...OUTER_SHADOW,
    padding: 20,
    marginBottom: 16,
  },
  mint: {
    backgroundColor: '#E8F5E9',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    ...OUTER_SHADOW,
    padding: 20,
    marginBottom: 16,
  },
  green: {
    backgroundColor: '#1B5E20',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(27,94,32,0.5)',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 12,
    padding: 20, marginBottom: 16,
  },
  dark: {
    backgroundColor: '#1B3A1F',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(165,214,167,0.2)',
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 12,
    padding: 20, marginBottom: 16,
  },
});
