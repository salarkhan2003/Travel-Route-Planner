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
    backgroundColor: '#E8F5E9',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.92)',
    shadowColor: 'rgba(129,199,132,0.45)',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    padding: 16,
  },
  dark: {
    backgroundColor: '#1B3A1F',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(165,214,167,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    padding: 16,
  },
});
