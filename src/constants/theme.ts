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

export const NC = {
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
  onSurface:        '#1B5E20',   // forest green — high contrast text
  onSurfaceVariant: '#4A6741',   // muted green text
  outline:          '#7CB87F',   // border / divider
  outlineVariant:   '#B2D9B4',   // light border

  // ── Semantic ───────────────────────────────────────────────────────────────
  error:    '#C62828',
  warning:  '#F57F17',
  info:     '#1565C0',
  tertiary: '#00695C',   // teal accent
  secondary: '#47624b',  // olive green
  secondaryContainer: '#DCEDC8',
  onSecondaryContainer: '#33691E',

  // ── Clay double-shadow recipe ──────────────────────────────────────────────
  // Top-left highlight: white → "sheen" on raised surface
  // Bottom-right depth: soft green → "clay shadow"
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
