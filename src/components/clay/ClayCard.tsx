import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | (ViewStyle | undefined | false)[];
  dark?: boolean;   // kept for compat — now renders tinted green instead of dark
  color?: string;
}

export function ClayCard({ children, style, dark = false, color }: Props) {
  const flat = Array.isArray(style) ? (style.filter(Boolean) as ViewStyle[]) : style;
  return (
    <View style={[dark ? s.tint : s.white, color ? { backgroundColor: color } : {}, flat]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  // White surface — main card style matching reference images
  white: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(200,230,201,0.55)',
    shadowColor: 'rgba(76,175,80,0.18)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
    padding: 16,
    marginBottom: 12,
  },
  // Tinted mint surface — for hero/accent cards
  tint: {
    backgroundColor: '#F0FAF1',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.22)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
    padding: 16,
    marginBottom: 12,
  },
});
