/**
 * Nomad Canvas — Claymorphism + Liquid Motion Design System
 * "Soft inflated plastic / digital clay" aesthetic
 * Primary: Mint Green #E8F5E9 | Accent: Deep Forest #1B5E20
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
  primaryFixed:  '#A5D6A7',   // soft mint (active states)
  primaryPale:   '#E8F5E9',   // palest mint
  onPrimary:     '#FFFFFF',   // white on green
  onPrimaryFixed:'#1B5E20',   // dark on pale mint

  // ── Text ───────────────────────────────────────────────────────────────────
  onSurface:        '#1B3A1F',   // darkest text
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

  // ── Clay shadow recipe ─────────────────────────────────────────────────────
  // Outer drop: rgba(27,62,31,0.18) y:16 blur:32
  // Inner highlight (top-left): rgba(255,255,255,0.85)
  // Inner depth (bottom-right): rgba(27,94,32,0.20)
  shadowOuter:  'rgba(27,62,31,0.18)',
  shadowButton: 'rgba(27,62,31,0.25)',
  shadowDeep:   'rgba(27,62,31,0.35)',

  // ── Radius — ultra-rounded clay ────────────────────────────────────────────
  r8: 8, r12: 12, r16: 16, r20: 20, r24: 24,
  r32: 32, r40: 40, r48: 48, rFull: 999,
} as const;

// ── Reusable clay card style ──────────────────────────────────────────────────
export const CLAY_CARD = {
  backgroundColor: '#FFFFFF',
  borderRadius: 40,
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.95)',
  shadowColor: 'rgba(27,62,31,0.18)',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 1,
  shadowRadius: 32,
  elevation: 10,
  padding: 20,
  marginBottom: 16,
} as const;

// ── Clay button ───────────────────────────────────────────────────────────────
export const CLAY_BTN = {
  borderRadius: 999,
  paddingVertical: 16,
  paddingHorizontal: 32,
  alignItems: 'center' as const,
  backgroundColor: '#2E7D32',
  shadowColor: 'rgba(27,62,31,0.30)',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 1,
  shadowRadius: 20,
  elevation: 8,
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.45)',
} as const;

// ── Liquid progress bar track ─────────────────────────────────────────────────
export const LIQUID_TRACK = {
  height: 14,
  borderRadius: 999,
  backgroundColor: '#C8E6C9',
  overflow: 'hidden' as const,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.8)',
  shadowColor: 'rgba(27,62,31,0.12)',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 6,
  elevation: 2,
} as const;
