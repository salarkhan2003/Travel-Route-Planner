/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  NOMAD CANVAS — Claymorphism + Liquid Motion Design System     ║
 * ║  "Soft inflated plastic / digital clay" aesthetic               ║
 * ║                                                                  ║
 * ║  Primary Bg:  #E8F5E9 (Light Mint)                              ║
 * ║  Action:      #A5D6A7 (Soft Sage)                               ║
 * ║  Typography:  #1B5E20 (Forest Green)                            ║
 * ║  Highlight:   #FFFFFF (Pure White — 3D sheen)                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ── Light Theme Colors ──────────────────────────────────────────────────────
export const NC_LIGHT = {
  // ── Page surfaces ──────────────────────────────────────────────────────────
  background:    '#E8F5E9',   // mint green page bg
  surfaceLowest: '#FFFFFF',   // pure white card
  surfaceLow:    '#F1F8F2',   // very light mint
  surface:       '#DCF0DE',   // mid mint
  surfaceHigh:   '#C8E6C9',   // deeper mint

  // ── Green palette ──────────────────────────────────────────────────────────
  primary:       '#2E7D32',   // deep forest green (buttons, accents)
  primaryLight:  '#4CAF50',   // medium green
  primaryFixed:  '#A5D6A7',   // soft sage (active states, route strings)
  primaryPale:   '#E8F5E9',   // palest mint
  onPrimary:     '#FFFFFF',   // white on green
  onPrimaryFixed:'#1B5E20',   // dark on pale mint

  // ── Text ───────────────────────────────────────────────────────────────────
  onSurface:           '#1B5E20',   // forest green — high contrast text
  onSurfaceSecondary:  '#4A6741',   // muted green — secondary text
  onSurfaceVariant:    '#4A6741',   // muted green text
  outline:             '#7CB87F',   // border / divider
  outlineVariant:      '#B2D9B4',   // light border

  // ── Semantic ───────────────────────────────────────────────────────────────
  error:    '#C62828',
  warning:  '#F57F17',
  info:     '#1565C0',
  tertiary: '#00695C',   // teal accent
  secondary: '#47624b',  // olive green
  secondaryContainer: '#DCEDC8',
  onSecondaryContainer: '#33691E',

  // ── Accents ────────────────────────────────────────────────────────────────
  colors: {
    accentPink:   '#E91E63',
    accentBlue:   '#2196F3',
    accentYellow: '#FFC107',
    accentOrange: '#FF9800',
  },

  // ── Clay double-shadow recipe ──────────────────────────────────────────────
  shadowHighlight: 'rgba(255,255,255,0.85)',   // top-left inner glow
  shadowOuter:     'rgba(165,214,167,0.45)',    // bottom-right clay drop
  shadowButton:    'rgba(27,94,32,0.30)',       // button press shadow
  shadowDeep:      'rgba(27,62,31,0.35)',       // deep pressed state

  // ── Radius — ultra-rounded clay (min 40px) ─────────────────────────────────
  r8: 8, r12: 12, r16: 16, r20: 20, r24: 24,
  r32: 32, r40: 40, r48: 48, rFull: 999,

  // ── Clay spring physics ────────────────────────────────────────────────────
  springDamping: 15,
  springStiffness: 150,
  pressScale: 0.95,
} as const;

// ── Dark Theme Colors ─────────────────────────────────────────────────────────
export const NC_DARK = {
  // ── Page surfaces — OLED Deep Black ──────────────────────────────────────
  background:    '#000000',   // Pure Black for OLED depth
  surfaceLowest: '#050505',   // Extremely deep slate
  surfaceLow:    '#0F1117',   // Slate deep blue/black
  surface:       '#1C1C1E',   // Modern card gray
  surfaceHigh:   '#2C2C2E',   // Elevated elements
  surfaceHighest:'#3A3A3C',

  // ── Vibrant Liquid palette (Electric Emerald & Neon accents) ────────────────
  primary:       '#00F59B',   // Electric Neon Green (FitPro style)
  primaryLight:  '#64FFDA',   // Bright Mint
  primaryFixed:  '#004D40',   // Deep Emerald
  primaryPale:   '#001A1A',   // Ambient Glow color
  onPrimary:     '#000000',   // Black text on neon
  onPrimaryFixed:'#E0F2F1',

  // ── Text — High Fidelity contrast ──────────────────────────────────────────
  onSurface:        '#FAFAFA',   // Pure crystal white
  onSurfaceSecondary:'#A1A1AA',   // Muted gray
  onSurfaceVariant: '#71717A',   // Zinc secondary
  outline:          '#00F59B',   // Glowing outline
  outlineVariant:   '#27272A',   // Subtle border

  // ── Semantic ───────────────────────────────────────────────────────────────
  error:    '#FF3B30',   // iOS Red
  warning:  '#FFD60A',   // iOS Yellow (Amber)
  info:     '#0A84FF',   // iOS Blue
  tertiary: '#BF5AF2',   // iOS Purple
  secondary: '#FF9F0A',  // iOS Orange
  secondaryContainer: '#4B2A00',
  onSecondaryContainer: '#FFD60A',

  // ── Accents ────────────────────────────────────────────────────────────────
  colors: {
    accentPink:   '#F06292',
    accentBlue:   '#64B5F6',
    accentYellow: '#FFC107',
    accentOrange: '#FFB74D',
  },

  // ── Clay double-shadow recipe — Ultra-Neon Glow ────────────────────────────
  shadowHighlight: 'rgba(0,245,155,0.06)',     // Neon rim light
  shadowOuter:     'rgba(0,245,155,0.08)',     // Ambient neon cast
  shadowButton:    'rgba(0, 245, 155, 0.45)',  // Intense primary glow
  shadowDeep:      'rgba(0,0,0,0.95)',         // Total occlusion

  // ── Radius ───────────────────────────────────────────────
  r8: 8, r12: 12, r16: 16, r20: 20, r24: 24,
  r32: 32, r40: 40, r48: 48, rFull: 999,

  // ── Clay spring physics ────────────────────────────────────────────────────
  springDamping: 15,
  springStiffness: 150,
  pressScale: 0.95,
} as const;

// ── Shared Export ─────────────────────────────────
export const NC = NC_LIGHT;

// ── Dynamic theme hook helper ─────────────────────────────────────────────
export function getTheme(darkMode: boolean) {
  return darkMode ? NC_DARK : NC_LIGHT;
}

// ── Reusable clay card style — "Inflated Pillow" ──────────────────────────────
export const CLAY_CARD = {
  backgroundColor: '#FFFFFF',
  borderRadius: 44,
  // Double border for 3D sheen effect
  borderWidth: 2,
  borderColor: 'rgba(255,255,255,0.95)',
  borderBottomColor: 'rgba(165,214,167,0.35)',
  borderRightColor: 'rgba(165,214,167,0.25)',
  // Clay outer shadow (bottom-right)
  shadowColor: 'rgba(165,214,167,0.5)',
  shadowOffset: { width: 8, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 10,
  padding: 22,
  marginBottom: 16,
} as const;

// ── Clay button — "Press into clay" ───────────────────────────────────────────
export const CLAY_BTN = {
  borderRadius: 999,
  paddingVertical: 18,
  paddingHorizontal: 36,
  alignItems: 'center' as const,
  backgroundColor: '#2E7D32',
  // Double shadow
  shadowColor: 'rgba(27,94,32,0.35)',
  shadowOffset: { width: 6, height: 6 },
  shadowOpacity: 1,
  shadowRadius: 18,
  elevation: 8,
  borderWidth: 2,
  borderColor: 'rgba(255,255,255,0.5)',
  borderTopColor: 'rgba(255,255,255,0.7)',
  borderLeftColor: 'rgba(255,255,255,0.6)',
} as const;

// ── Liquid progress bar track ─────────────────────────────────────────────────
export const LIQUID_TRACK = {
  height: 16,
  borderRadius: 999,
  backgroundColor: '#C8E6C9',
  overflow: 'hidden' as const,
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.85)',
  shadowColor: 'rgba(165,214,167,0.3)',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 6,
  elevation: 2,
} as const;

// ════════════════════════════════════════════════════════════════════════════
// MINT LIQUID CLAY v2 — Global Design System
// ════════════════════════════════════════════════════════════════════════════
export const MINT = {
  50:  '#E8F5E9', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7',
  400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857',
  800: '#065F46', 900: '#064E3B', gold: '#D4AF37', goldLight: '#FEF3C7',
} as const;

export const ACCENTS = {
  train:  { bg: '#D1FAE5', fg: '#10B981' },
  flight: { bg: '#EDE9FE', fg: '#7C3AED' },
  bus:    { bg: '#FEF3C7', fg: '#D97706' },
  budget: { bg: '#FCE7F3', fg: '#DB2777' },
  globe:  { bg: '#E0F2FE', fg: '#0EA5E9' },
  family: { bg: '#FEF3C7', fg: '#F59E0B' },
} as const;

export const FONTS = {
  display: 'Plus Jakarta Sans',
  body:    'Nunito',
  fallback:'System',
} as const;

export const CLAY_CARD_V2 = {
  backgroundColor: '#FFFFFF', borderRadius: 28, borderWidth: 1.5,
  borderColor: 'rgba(167,243,208,0.5)', elevation: 4, shadowColor: '#10B981',
  shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10,
} as const;

export const CLAY_BTN_V2 = {
  borderRadius: 22, paddingVertical: 17, paddingHorizontal: 28,
  backgroundColor: '#10B981', elevation: 8, shadowColor: '#10B981',
  shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.42, shadowRadius: 14,
} as const;

export const CLAY_CHIP = {
  flexDirection: 'row' as const, alignItems: 'center' as const,
  borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, gap: 6,
} as const;

export const FROSTED_NAV = {
  light: { backgroundColor: 'rgba(255,255,255,0.94)', borderTopColor: 'rgba(167,243,208,0.35)' },
  dark:  { backgroundColor: 'rgba(2,15,8,0.94)',      borderTopColor: 'rgba(0,245,155,0.10)'  },
} as const;

export const BLOB_COLORS = ['rgba(167,243,208,0.4)', 'rgba(110,231,183,0.25)', 'rgba(16,185,129,0.12)'] as const;
export const CLAY_PRESS  = { scale: 0.94, damping: 14, stiffness: 200 } as const;
