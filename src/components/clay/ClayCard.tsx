/**
 * ClayCard — Inflated Pillow / Squishy Surface
 * 
 * ✦ Tactile Depth: double-shadow (white highlight top-left, green shadow bottom-right)
 * ✦ Ultra-Rounded: minimum 44px border-radius
 * ✦ 3D Sheen: white border on top/left, subtle green on bottom/right
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { getTheme } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | (ViewStyle | undefined | false)[];
  variant?: 'white' | 'mint' | 'green' | 'dark';
  color?: string;
  radius?: number;
  padding?: number;
}

const s = StyleSheet.create({
  sheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    borderTopLeftRadius: 44, borderTopRightRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});

export function ClayCard({ children, style, variant = 'white', color, radius, padding }: Props) {
  const darkMode = useSettingsStore(s => s.darkMode);
  const theme = getTheme(darkMode);
  const flat = Array.isArray(style) ? (style.filter(Boolean) as ViewStyle[]) : style;
  
  const CLAY_BASE = {
    borderRadius: 44,
    borderWidth: 2.5,
    padding: 22,
    marginBottom: 16,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  // Generate dynamic styles based on theme
  const getDynamicStyle = () => {
    if (variant === 'mint') {
      return {
        ...CLAY_BASE,
        backgroundColor: darkMode ? '#0A120B' : '#E8F5E9',
        borderColor: darkMode ? 'rgba(0, 245, 155, 0.2)' : 'rgba(255,255,255,0.95)',
        borderBottomColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(165,214,167,0.45)',
        borderRightColor: darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(165,214,167,0.35)',
        shadowColor: darkMode ? 'rgba(0, 245, 155, 0.15)' : 'rgba(165,214,167,0.5)',
        shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 24, elevation: 10,
      };
    }
    if (variant === 'green') {
      return {
        ...CLAY_BASE,
        backgroundColor: darkMode ? '#00331F' : '#1B5E20',
        borderColor: darkMode ? '#00F59B' : 'rgba(165,214,167,0.35)',
        borderTopColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)',
        borderLeftColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.15)',
        shadowColor: darkMode ? 'rgba(0, 245, 155, 0.3)' : 'rgba(27,94,32,0.55)',
        shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 24, elevation: 14,
      };
    }
    if (variant === 'dark') {
      return {
        ...CLAY_BASE,
        backgroundColor: darkMode ? '#000000' : '#1B3A1F',
        borderColor: darkMode ? '#27272A' : 'rgba(165,214,167,0.2)',
        borderTopColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
        borderLeftColor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
        shadowColor: darkMode ? 'rgba(0, 245, 155, 0.12)' : 'rgba(0,0,0,0.45)',
        shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 24, elevation: 14,
      };
    }
    // Default 'white'
    return {
      ...CLAY_BASE,
      backgroundColor: darkMode ? '#080808' : '#FFFFFF',
      borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.98)',
      borderBottomColor: darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(165,214,167,0.4)',
      borderRightColor: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(165,214,167,0.3)',
      shadowColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(165,214,167,0.5)',
      shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 24, elevation: 10,
    };
  };

  const dynamicBase = getDynamicStyle();

  return (
    <View style={[dynamicBase,
      color ? { backgroundColor: color } : {},
      radius ? { borderRadius: radius } : {},
      padding !== undefined ? { padding } : {},
      flat,
    ]}>
      <View style={[s.sheen, darkMode && { backgroundColor: 'rgba(255,255,255,0.02)', height: '35%' }]} pointerEvents="none" />
      {children}
    </View>
  );
}

