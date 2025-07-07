# Terra Design System - Theme Implementation

This directory contains the implementation of the "Terra" design system theme for the Plant Tracker app.

## Overview

The theme system implements the design philosophy of **bold simplicity** and **functional clarity** as defined in the style guide. All design tokens are centralized here to ensure consistency across the entire application.

## Files

- `theme.ts` - Main theme file containing all design tokens
- `index.ts` - Export file for easy importing
- `README.md` - This documentation file

## Usage

### Basic Import

```typescript
import { theme, colors, spacing, typography } from '../styles';
```

### Using Colors

```typescript
import { colors } from '../styles';

// Primary colors
const primaryColor = colors.primary.darkGreen;
const surfaceColor = colors.primary.white;

// Functional colors
const errorColor = colors.functional.error;
const successColor = colors.functional.success;
```

### Using Typography

```typescript
import { typography } from '../styles';

// Apply heading styles
const headingStyle = typography.textStyles.h1;

// Apply body text styles
const bodyStyle = typography.textStyles.body;
```

### Using Component Styles

```typescript
import { components } from '../styles';

// Button styles
const primaryButtonStyle = components.button.primary;
const secondaryButtonStyle = components.button.secondary;

// Card styles
const cardStyle = components.card;

// Input styles
const inputStyle = components.input;
```

### Using Spacing

```typescript
import { spacing } from '../styles';

// Consistent spacing throughout the app
const margin = spacing.md; // 16px
const padding = spacing.lg; // 24px
```

### Using Icons

```typescript
import { icons } from '../styles';

// Icon sizes
const iconSize = icons.sizes.primary; // 24px
const navIconSize = icons.sizes.navigation; // 28px

// Icon colors
const primaryIconColor = icons.colors.primary;
const secondaryIconColor = icons.colors.secondary;
```

### Using Motion

```typescript
import { motion } from '../styles';

// Animation configurations
const standardTransition = motion.transitions.standard;
const emphasisTransition = motion.transitions.emphasis;
```

## Dark Mode Support

The theme includes dark mode variants that can be used with React Native's appearance API:

```typescript
import { darkTheme } from '../styles';
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

const currentColors = isDark ? darkTheme.colors : colors;
```

## Design Tokens

### Color Palette
- **Primary Colors**: Core brand colors (#0A5F55, #F8F9FA)
- **Secondary Colors**: Supporting greens (#4CAF94, #E6F4F1)
- **Accent Colors**: Highlight colors (#00BFA5, #FFC107)
- **Functional Colors**: Status and feedback colors
- **Background Colors**: Surface and background colors

### Typography
- **Font Families**: SF Pro Text (iOS) / Roboto (Android)
- **Font Weights**: 400, 500, 600, 700
- **Text Styles**: H1, H2, H3, Body Large, Body, Body Small, Caption, Button, Link

### Spacing System
- **8dp Grid**: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)

### Component Styles
- **Buttons**: Primary, Secondary, FAB
- **Cards**: Standard card styling with shadows
- **Inputs**: Form field styling

### Icons
- **Sizes**: Primary(24), Small(20), Navigation(28)
- **Colors**: Primary and secondary icon colors

### Motion
- **Transitions**: Standard, Emphasis, Micro, Page
- **Easing**: Physics-based animations for natural feel

## Best Practices

1. **Always use theme tokens** instead of hardcoded values
2. **Import specific sections** rather than the entire theme when possible
3. **Use TypeScript** for type safety with theme values
4. **Test in both light and dark modes** using the dark theme variants
5. **Follow the spacing system** for consistent layouts
6. **Use the component styles** as base styles that can be extended

## Extending the Theme

To add new design tokens:

1. Add them to the appropriate section in `theme.ts`
2. Export the new types in the type exports section
3. Update this README if necessary
4. Ensure the new tokens follow the existing naming conventions

## Dependencies

This theme system is designed to work with:
- React Native
- Expo
- TypeScript
- Phosphor Icons (for icon implementation) 