/**
 * Nomad Canvas — Liquid Clay Design System
 * "Soft inflated plastic / digital clay" aesthetic
 * Ultra-rounded (40–50px), double inner shadows, mint green palette
 */

export const NC = {
  // ── Page surfaces ──────────────────────────────────────────────────────────
  background:    '#E8F5E9',   // main mint green bg
  surfaceLowest: '#FFFFFF',   // pure white card
  surfaceLow:    '#F1F8F2',   // very light mint
  surface:       '#E2EBD8',   // mid mint
  surfaceHigh:   '#D4E6D6',   // deeper mint

  // ── Primary forest green ───────────────────────────────────────────────────
  primary:              '#1B5E20',   // deep forest green
  primaryMid:           '#2E7D32',   // mid green
  primaryLight:         '#4CAF50',   // bright green
  primaryFixed:         '#C8E6C9',   // light mint (badges, active)
  primaryFixedBright:   '#A5D6A7',   // brighter mint
  onPrimary:            '#FFFFFF',
  onPrimaryFixed:       '#1B5E20',

  // ── Secondary ─────────────────────────────────────────────────────────────
  secondary:            '#388E3C',
  secondaryContainer:   '#DCEDC8',
  onSecondaryContainer: '#1B5E20',

  // ── Tertiary teal ─────────────────────────────────────────────────────────
  tertiary:             '#00695C',
  tertiaryContainer:    '#B2DFDB',

  // ── Text ──────────────────────────────────────────────────────────────────
  onSurface:            '#1B3A1F',   // darkest text
  onSurfaceVariant:     '#4A6741',   // muted green text
  outline:              '#6A8F6D',
  outlineVariant:       '#A5C8A8',

  // ── Status ────────────────────────────────────────────────────────────────
  error:    '#C62828',
  warning:  '#F57F17',
  success:  '#2E7D32',

  // ── Clay shadow recipe ─────────────────────────────────────────────────────
  // Outer drop: rgba(27,94,32,0.18) at y:16 blur:32
  // Inner highlight: top-left white rgba(255,255,255,0.9)
  // Inner depth: bottom-right green rgba(27,94,32,0.15)
  shadowOuter:   'rgba(27,94,32,0.18)',
  shadowButton:  'rgba(27,94,32,0.22)',
  shadowDeep:    'rgba(27,94,32,0.30)',

  // ── Radius — ultra-rounded clay ───────────────────────────────────────────
  r12: 12, r16: 16, r20: 20, r24: 24,
  r32: 32, r40: 40, r48: 48, rFull: 999,
} as const;

// ── Reusable clay style fragments ─────────────────────────────────────────────

/** Main clay card — white, ultra-rounded, deep green shadow */
export const CLAY_CARD = {
  backgroundColor: '#FFFFFF',
  borderRadius: 40,
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.95)',
  shadowColor: 'rgba(27,94,32,0.18)',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 1,
  shadowRadius: 32,
  elevation: 10,
  padding: 20,
  marginBottom: 16,
} as const;

/** Mint tinted clay card */
export const CLAY_CARD_MINT = {
  backgroundColor: '#F1F8F2',
  borderRadius: 40,
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.95)',
  shadowColor: 'rgba(27,94,32,0.14)',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 7,
  padding: 20,
  marginBottom: 16,
} as const;

/** Primary clay button */
export const CLAY_BTN = {
  borderRadius: 999,
  paddingVertical: 16,
  paddingHorizontal: 32,
  alignItems: 'center' as const,
  backgroundColor: '#1B5E20',
  shadowColor: 'rgba(27,94,32,0.30)',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 1,
  shadowRadius: 22,
  elevation: 8,
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.45)',
} as const;

/** Inset / recessed clay (progress bars, inputs) */
export const CLAY_INSET = {
  backgroundColor: '#E2EBD8',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.5)',
  shadowColor: 'rgba(0,0,0,0.04)',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 4,
  elevation: 0,
} as const;
