/**
 * Terra Design System Theme
 * 
 * This theme implements the "Terra" design philosophy with bold simplicity
 * and functional clarity. All values are based on the style guide specifications.
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Colors
  primary: {
    darkGreen: '#0A5F55', // Core brand color for primary CTAs and focused states
    white: '#F8F9FA',     // Primary surface color for backgrounds
  },

  // Secondary Colors
  secondary: {
    greenLight: '#4CAF94', // Lighter green for hover states and secondary highlights
    greenPale: '#E6F4F1',  // Subtle green for selected items and highlight fills
  },

  // Accent Colors
  accent: {
    teal: '#00BFA5',    // Primary accent for FAB and critical positive actions
    amber: '#FFC107',   // Warm yellow for warnings and informational tags
    blue: '#2196F3',    // Blue for informational elements and links
    blueLight: '#E3F2FD', // Light blue for backgrounds and highlights
    orange: '#FF9800',  // Orange for preview indicators and warnings
  },

  // Functional Colors
  functional: {
    success: '#43A047', // Success feedback and validation
    error: '#E53935',   // Error messages and destructive actions
    neutral: '#9E9E9E', // Secondary text and disabled states
    darkGray: '#424242', // Primary text color for high legibility
  },

  // Background Colors
  background: {
    white: '#FFFFFF',   // Pure white for elevated surfaces
    light: '#F5F7F9',   // Default app background
    dark: '#263238',    // Primary dark mode background
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    primary: 'SF Pro Text, Roboto, system-ui, sans-serif',
    alternative: 'Inter, system-ui, sans-serif',
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Text Styles
  textStyles: {
    // Headings
    h1: {
      fontSize: 28,
      lineHeight: 32,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    h2: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '600',
      letterSpacing: -0.1,
    },

    // Body Text
    bodyLarge: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '400',
      letterSpacing: 0,
    },
    body: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
      letterSpacing: 0.1,
    },

    // Special Text
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    link: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '500',
      letterSpacing: 0,
      color: colors.primary.darkGreen,
    },
  },
} as const;

// ============================================================================
// COMPONENT STYLING
// ============================================================================

export const components = {
  // Buttons
  button: {
    primary: {
      backgroundColor: colors.primary.darkGreen,
      color: colors.background.white,
      height: 48,
      borderRadius: 8,
      paddingHorizontal: 16,
      ...typography.textStyles.button,
    },
    secondary: {
      borderWidth: 1.5,
      borderColor: colors.primary.darkGreen,
      color: colors.primary.darkGreen,
      backgroundColor: 'transparent',
      height: 48,
      borderRadius: 8,
      paddingHorizontal: 16,
      ...typography.textStyles.button,
    },
    fab: {
      backgroundColor: colors.accent.teal,
      color: colors.background.white,
      width: 56,
      height: 56,
      borderRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      shadowOpacity: 0.25,
      shadowColor: '#000000',
      elevation: 8, // Android shadow
    },
  },

  // Cards
  card: {
    backgroundColor: colors.background.white,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.08,
    shadowColor: '#000000',
    elevation: 2, // Android shadow
  },

  // Input Fields
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.functional.neutral,
    backgroundColor: colors.background.light,
    color: colors.functional.darkGray,
    placeholderTextColor: colors.functional.neutral,
    paddingHorizontal: 16,
    ...typography.textStyles.body,
  },
} as const;

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const spacing = {
  xs: 4,    // Micro spacing (icon to text)
  sm: 8,    // Small spacing (internal padding)
  md: 16,   // Default spacing (card padding, list margins)
  lg: 24,   // Medium spacing (screen margins, major sections)
  xl: 32,   // Large spacing (major sections)
  xxl: 48,  // Extra-large spacing (screen padding)
} as const;

// ============================================================================
// ICONS
// ============================================================================

export const icons = {
  sizes: {
    primary: 24,    // Interactive elements
    small: 20,      // Inline with text
    navigation: 28, // Bottom tab bar
  },
  colors: {
    primary: colors.primary.darkGreen,   // Interactive icons
    secondary: colors.functional.neutral, // Inactive/decorative icons
  },
} as const;

// ============================================================================
// MOTION & ANIMATION
// ============================================================================

export const motion = {
  transitions: {
    standard: {
      duration: 200,
      easing: 'ease-out',
    },
    emphasis: {
      duration: 300,
      easing: 'spring',
      springConfig: {
        tension: 300,
        friction: 35,
      },
    },
    micro: {
      duration: 150,
      easing: 'ease-in-out',
    },
    page: {
      duration: 350,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    },
  },
} as const;

// ============================================================================
// DARK MODE VARIANTS
// ============================================================================

export const darkTheme = {
  colors: {
    ...colors,
    background: {
      ...colors.background,
      primary: '#121212',    // Primary dark background
      surface: '#1E1E1E',    // Card and modal backgrounds
    },
    primary: {
      ...colors.primary,
      darkGreen: '#26A69A',  // Adjusted for dark contrast
    },
    accent: {
      ...colors.accent,
      teal: '#1DE9B6',       // Adjusted for dark contrast
    },
    functional: {
      ...colors.functional,
      darkGray: '#EEEEEE',   // Primary text in dark mode
      neutral: '#B0BEC5',    // Secondary text in dark mode
    },
  },
} as const;

// ============================================================================
// MAIN THEME EXPORT
// ============================================================================

export const theme = {
  colors,
  typography,
  components,
  spacing,
  icons,
  motion,
  darkTheme,
} as const;

// Type exports for TypeScript
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Components = typeof components;
export type Spacing = typeof spacing;
export type Icons = typeof icons;
export type Motion = typeof motion;
export type DarkTheme = typeof darkTheme;

export default theme; 