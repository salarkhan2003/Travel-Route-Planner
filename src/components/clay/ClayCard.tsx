/**
 * ClayCard — Nomad Canvas Claymorphism
 * Recipe from reference HTML:
 *   box-shadow: 20px 40px 40px rgba(42,49,39,0.06),
 *               inset 4px 4px 8px rgba(255,255,255,0.8),
 *               inset -6px -6px 12px rgba(52,96,59,0.15)
 *
 * React Native only supports one shadowColor so we approximate with
 * elevation + border trick. The "inset" feel comes from the white top-left
 * border and the green-tinted bottom-right border.
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | (ViewStyle | undefined | false)[];
  dark?: boolean;
  color?: string;
  inset?: boolean; // clay-inset variant (recessed look)
}

export function ClayCard({ children, style, dark = false, color, inset = false }: Props) {
  const flat = Array.isArray(style) ? (style.filter(Boolean) as ViewStyle[]) : style;
  const base = inset ? s.inset : dark ? s.tint : s.white;
  return (
    <View style={[base, color ? { backgroundColor: color } : {}, flat]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  // Main clay card — white surface, outer green glow
  white: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    // Top-left highlight border (simulates inset white shadow)
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    // Outer drop shadow
    shadowColor: 'rgba(42,49,39,0.10)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
    padding: 20,
    marginBottom: 16,
  },
  // Tinted mint card — for hero/accent sections
  tint: {
    backgroundColor: '#f2f9ea',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(42,49,39,0.08)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
    padding: 20,
    marginBottom: 16,
  },
  // Inset / recessed — for progress bars, input backgrounds
  inset: {
    backgroundColor: '#e2ebda',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 0,
    padding: 16,
    marginBottom: 12,
  },
});
