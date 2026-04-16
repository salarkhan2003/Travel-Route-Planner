import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | (ViewStyle | undefined | false)[];
  dark?: boolean;
  color?: string;
  inset?: boolean;
}

export function ClayCard({ children, style, dark = false, color, inset = false }: Props) {
  const flat = Array.isArray(style) ? (style.filter(Boolean) as ViewStyle[]) : style;
  const base = inset ? s.inset : dark ? s.dark : s.white;
  return (
    <View style={[base, color ? { backgroundColor: color } : {}, flat]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  white: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(27,94,32,0.18)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 10,
    padding: 20,
    marginBottom: 16,
  },
  dark: {
    backgroundColor: '#1B5E20',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: 'rgba(27,94,32,0.35)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 10,
    padding: 20,
    marginBottom: 16,
  },
  inset: {
    backgroundColor: '#E2EBD8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 0,
    padding: 14,
    marginBottom: 10,
  },
});
