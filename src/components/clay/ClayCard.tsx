import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | (ViewStyle | undefined | false)[];
  dark?: boolean;
  color?: string;
}

export function ClayCard({ children, style, dark = false, color }: Props) {
  const flatStyle = Array.isArray(style)
    ? (style.filter(Boolean) as ViewStyle[])
    : style;
  return (
    <View style={[dark ? styles.dark : styles.light, color ? { backgroundColor: color } : {}, flatStyle]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  light: {
    backgroundColor: '#F0FAF1',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(76,175,80,0.22)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 6,
    padding: 16,
    marginBottom: 12,
  },
  dark: {
    backgroundColor: '#2E7D32',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: 'rgba(27,94,32,0.35)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    padding: 16,
    marginBottom: 12,
  },
});
