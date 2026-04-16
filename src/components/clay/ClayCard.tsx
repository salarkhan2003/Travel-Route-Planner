/**
 * ClayCard — Inflated Pillow / Squishy Surface
 * 
 * ✦ Tactile Depth: double-shadow (white highlight top-left, green shadow bottom-right)
 * ✦ Ultra-Rounded: minimum 44px border-radius
 * ✦ 3D Sheen: white border on top/left, subtle green on bottom/right
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
      {/* 3D Inner Sheen overlay — gives the "inflated" look */}
      <View style={s.sheen} pointerEvents="none" />
      {children}
    </View>
  );
}

const CLAY_BASE = {
  borderRadius: 44,
  borderWidth: 2.5,
  padding: 22,
  marginBottom: 16,
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

const s = StyleSheet.create({
  // Inner sheen — white gradient highlight on top for 3D effect
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  white: {
    ...CLAY_BASE,
    backgroundColor: '#FFFFFF',
    // Double border: bright top-left, soft bottom-right
    borderColor: 'rgba(255,255,255,0.98)',
    borderBottomColor: 'rgba(165,214,167,0.4)',
    borderRightColor: 'rgba(165,214,167,0.3)',
    // Clay outer shadow (bottom-right = depth)
    shadowColor: 'rgba(165,214,167,0.5)',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
  },

  mint: {
    ...CLAY_BASE,
    backgroundColor: '#E8F5E9',
    borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.45)',
    borderRightColor: 'rgba(165,214,167,0.35)',
    shadowColor: 'rgba(165,214,167,0.5)',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
  },

  green: {
    ...CLAY_BASE,
    backgroundColor: '#1B5E20',
    borderColor: 'rgba(165,214,167,0.35)',
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderLeftColor: 'rgba(255,255,255,0.15)',
    shadowColor: 'rgba(27,94,32,0.55)',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 14,
  },

  dark: {
    ...CLAY_BASE,
    backgroundColor: '#1B3A1F',
    borderColor: 'rgba(165,214,167,0.2)',
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderLeftColor: 'rgba(255,255,255,0.08)',
    shadowColor: 'rgba(0,0,0,0.45)',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 14,
  },
});
