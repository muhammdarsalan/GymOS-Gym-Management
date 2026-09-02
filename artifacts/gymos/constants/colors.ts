/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#17201B',
    tint: '#C7F36B',

    // Core surfaces
    background: '#F6F8F3',
    foreground: '#17201B',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#17201B',

    // Primary action color (buttons, links, active states)
    primary: '#17201B',
    primaryForeground: '#F6F8F3',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E9F1D9',
    secondaryForeground: '#42602A',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EEF2EC',
    mutedForeground: '#718078',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#C7F36B',
    accentForeground: '#17201B',

    // Destructive actions (delete, error states)
    destructive: '#D85C4A',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#DDE5DC',
    input: '#D5DED3',
  },

  dark: {
    text: '#F3F7F0',
    tint: '#C7F36B',
    background: '#111714',
    foreground: '#F3F7F0',
    card: '#1B2420',
    cardForeground: '#F3F7F0',
    primary: '#C7F36B',
    primaryForeground: '#17201B',
    secondary: '#263629',
    secondaryForeground: '#DDF6B5',
    muted: '#202A24',
    mutedForeground: '#9DAAA0',
    accent: '#C7F36B',
    accentForeground: '#17201B',
    destructive: '#F07A65',
    destructiveForeground: '#FFFFFF',
    border: '#304136',
    input: '#3A4D3F',
  },

  radius: 18,
};

export default colors;
