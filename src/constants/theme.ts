// Mint Liquid Claymorphism Theme
export const CLAY = {
  // Surfaces
  bg: '#E8F5E9',
  bgDeep: '#C8E6C9',
  surface: '#F1F8F2',
  surfaceCard: '#DCEDC8',

  // Greens
  mint: '#A5D6A7',
  mintLight: '#E8F5E9',
  mintMid: '#81C784',
  mintDark: '#4CAF50',
  mintDeep: '#1B5E20',

  // Accents
  gold: '#FFD700',
  coral: '#FF7043',
  sky: '#81D4FA',
  lavender: '#CE93D8',
  amber: '#FFB300',

  // Text
  text: '#1B5E20',
  textMid: '#2E7D32',
  textMuted: '#558B2F',
  textLight: '#A5D6A7',

  // Shadows (Liquid Clay recipe)
  shadowOuter: 'rgba(129,199,132,0.45)',   // outer glow
  shadowDark: '#81C784',                    // bottom-right depth
  shadowLight: '#FFFFFF',                   // top-left sheen
  shadowInner: 'rgba(129,199,132,0.3)',

  radius: { sm: 16, md: 24, lg: 32, xl: 44, full: 999 },
};

// Liquid Clay card style (light)
export const LIQUID_CARD: object = {
  backgroundColor: '#E8F5E9',
  borderRadius: 28,
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.9)',
  shadowColor: 'rgba(129,199,132,0.4)',
  shadowOffset: { width: 10, height: 10 },
  shadowOpacity: 1,
  shadowRadius: 20,
  elevation: 8,
  padding: 16,
};

// Dark variant for contrast sections
export const LIQUID_CARD_DARK: object = {
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
};
