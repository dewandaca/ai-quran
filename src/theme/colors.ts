// Warm Cream Aesthetic Color Palette
// Matching the Expo Android app theme

export const colors = {
  // Surfaces & Backgrounds
  bgPrimary: '#FAF6EE',       // Warm parchment cream (Main screen background)
  bgCard: '#F3EBDD',          // Soft desert sand (Verse card & bottom sheet)
  bgElevated: '#FFFFFF',      // Floating containers and modals
  
  // Accents & Islamic Identity
  accentEmerald: '#1B4931',   // Deep Islamic Forest Green (Primary buttons & tab icons)
  accentOlive: '#3D6B52',     // Muted olive green for secondary badges
  accentGold: '#C5A059',      // Subtle gold for Ayah numbering icons & borders
  accentActiveAyah: '#F5E6CC',// Warm gold tint for the currently playing verse
  
  // Typography
  textPrimary: '#2C2621',     // Soft charcoal brown for UI Latin text
  textSecondary: '#6B6258',   // Muted clay gray for transliterations and meta
  textTertiary: '#9C9286',    // Subtle muted text for captions
  textArabic: '#181411',      // Pure dark for crisp Arabic calligraphy rendering
  
  // Borders & Lines
  borderSubtle: '#E8DECD',    // Soft border divider
  
  // Status Colors
  success: '#2D8B4E',
  error: '#C0392B',
  warning: '#D4A017',
};

export type ColorKey = keyof typeof colors;
