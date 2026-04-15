// ─── Liquid Clay Light Green — Design Tokens ─────────────────────────────────
// Matches the "Nomad Canvas" reference UI exactly.

export const C = {
  // Page backgrounds
  bg:          '#E8F5E9',   // main screen bg — soft mint
  bgCard:      '#FFFFFF',   // card surface — pure white
  bgChip:      '#F0FAF1',   // chip / pill bg
  bgInput:     '#F4FBF4',   // input field bg
  bgSection:   '#EBF5EC',   // section divider bg

  // Green palette
  g50:  '#E8F5E9',
  g100: '#C8E6C9',
  g200: '#A5D6A7',
  g300: '#81C784',
  g400: '#66BB6A',
  g500: '#4CAF50',   // primary action
  g600: '#43A047',
  g700: '#388E3C',
  g800: '#2E7D32',
  g900: '#1B5E20',   // darkest text

  // Text
  textH:    '#1B5E20',   // headings
  textB:    '#2E7D32',   // body
  textM:    '#558B2F',   // muted
  textL:    '#81C784',   // light / placeholder

  // Accents (from reference images)
  red:    '#E53935',
  amber:  '#F57F17',
  blue:   '#1565C0',
  purple: '#6A1B9A',
  gold:   '#F9A825',

  // Clay shadow recipe — the 3D lift effect
  // Apply as: shadowColor, shadowOffset {w:0,h:8}, shadowOpacity:1, shadowRadius:20, elevation:8
  shadow:      'rgba(76,175,80,0.18)',   // card outer glow
  shadowDeep:  'rgba(46,125,50,0.28)',   // deeper cards

  // Border
  border:      'rgba(255,255,255,0.95)',
  borderCard:  'rgba(200,230,201,0.6)',

  // Radius
  r12: 12, r16: 16, r20: 20, r24: 24, r28: 28, r32: 32, r50: 50,
};

// ─── Reusable style objects ───────────────────────────────────────────────────

/** Standard liquid-clay card — white surface, green shadow lift */
export const CARD = {
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(200,230,201,0.5)',
  shadowColor: 'rgba(76,175,80,0.18)',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 20,
  elevation: 6,
  padding: 16,
  marginBottom: 12,
};

/** Tinted card — mint green surface */
export const CARD_TINT = {
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
};

/** Primary button */
export const BTN_PRIMARY = {
  backgroundColor: '#4CAF50',
  borderRadius: 50,
  paddingVertical: 14,
  paddingHorizontal: 28,
  alignItems: 'center' as const,
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.6)',
  shadowColor: 'rgba(76,175,80,0.4)',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 10,
  elevation: 5,
};

/** Secondary / ghost button */
export const BTN_GHOST = {
  backgroundColor: '#F0FAF1',
  borderRadius: 50,
  paddingVertical: 14,
  paddingHorizontal: 28,
  alignItems: 'center' as const,
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.95)',
  shadowColor: 'rgba(76,175,80,0.15)',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 3,
};

/** Pill / chip */
export const CHIP = {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 50,
  backgroundColor: '#FFFFFF',
  borderWidth: 1.5,
  borderColor: 'rgba(200,230,201,0.7)',
  shadowColor: 'rgba(76,175,80,0.12)',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 6,
  elevation: 3,
};

export const CHIP_ACTIVE = {
  ...CHIP,
  backgroundColor: '#4CAF50',
  borderColor: 'rgba(255,255,255,0.5)',
  shadowColor: 'rgba(76,175,80,0.4)',
  shadowRadius: 10,
  elevation: 6,
};
