// Nomad Canvas — Liquid Clay Design Tokens
// All colors inline — no external dependencies

export const NC = {
  // Surfaces
  background:           '#f2f9ea',
  surfaceLowest:        '#ffffff',
  surfaceLow:           '#ebf3e3',
  surface:              '#e2ebda',
  surfaceHigh:          '#dce6d4',
  // Primary green
  primary:              '#39653f',
  primaryFixed:         '#c5f8c7',
  onPrimary:            '#ffffff',
  onPrimaryFixed:       '#224d2a',
  primaryContainer:     '#c5f8c7',
  onPrimaryContainer:   '#34603b',
  // Secondary
  secondary:            '#47624b',
  secondaryContainer:   '#cceacd',
  onSecondaryContainer: '#3e5842',
  // Tertiary teal
  tertiary:             '#0d6661',
  tertiaryContainer:    '#a7f3ec',
  // Text
  onSurface:            '#2a3127',
  onSurfaceVariant:     '#575e52',
  outline:              '#72796d',
  outlineVariant:       '#a8afa2',
  // Error
  error:                '#b31b25',
  // Shadows
  shadowOuter:          'rgba(42,49,39,0.10)',
  shadowButton:         'rgba(42,49,39,0.14)',
  // Radius shortcuts
  r8: 8, r12: 12, r16: 16, r20: 20, r24: 24, r28: 28, r32: 32, r48: 48, rFull: 999,
} as const;
