const palette = {
  // Core brand colors — Glorify-inspired warm tones
  coral: "#FF6B5A",
  coralLight: "#FF8A7D",
  warmBeige: "#FFF8F0",
  warmBeigeDark: "#FAF5EE",
  cardBeige: "#F5EDE4",

  // Dark mode
  navy: "#1A1A2E",
  navyLight: "#243447",
  darkBg: "#0F1923",
  cardDark: "#1B2838",

  // Neutrals
  white: "#FFFFFF",
  offWhite: "#F2F3F5",
  gray100: "#E8EAED",
  gray200: "#D1D5DB",
  gray300: "#9CA3AF",
  gray400: "#6B7280",
  gray500: "#4B5563",
  gray600: "#374151",
  textDark: "#111827",
  textLight: "#F9FAFB",
  black: "#1A1A1A",

  // Semantic
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#EF4444",
};

export default {
  palette,
  light: {
    text: palette.textDark,
    textSecondary: palette.gray400,
    background: palette.warmBeige,
    card: palette.cardBeige,
    tint: palette.coral,
    tintSecondary: palette.coralLight,
    tabIconDefault: palette.gray300,
    tabIconSelected: palette.coral,
    border: palette.gray100,
  },
  dark: {
    text: palette.textLight,
    textSecondary: palette.gray300,
    background: palette.darkBg,
    card: palette.cardDark,
    tint: palette.coral,
    tintSecondary: palette.coralLight,
    tabIconDefault: palette.gray500,
    tabIconSelected: palette.coral,
    border: palette.navyLight,
  },
};
