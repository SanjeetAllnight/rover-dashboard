import { MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

export const AppTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: MD3DarkTheme.fonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#00E5FF',           // Cyan accent
    primaryContainer: '#003D47',
    secondary: '#69F0AE',         // Green accent
    secondaryContainer: '#1B4A30',
    tertiary: '#FF6B35',          // Orange accent
    tertiaryContainer: '#4A1F00',
    background: '#050A0F',        // Near-black bg
    surface: '#0D1821',           // Card bg
    surfaceVariant: '#162330',
    onSurface: '#E2EDF5',
    onSurfaceVariant: '#8BA3B5',
    outline: '#1E3348',
    error: '#FF4C6C',
    errorContainer: '#3A0017',
  },
};

// Shared spacing / radius tokens
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
};
