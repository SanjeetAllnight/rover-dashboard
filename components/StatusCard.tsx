import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { AppTheme, Spacing, Radius } from '../constants/theme';

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  fullWidth?: boolean;
}

export function StatusCard({
  title,
  value,
  subtitle,
  icon,
  accentColor = AppTheme.colors.primary,
  fullWidth = false,
}: StatusCardProps) {
  return (
    <Surface
      style={[
        styles.card,
        fullWidth && styles.fullWidth,
        { borderLeftColor: accentColor },
      ]}
      elevation={2}
    >
      <View style={styles.header}>
        <Text style={styles.title} variant="labelSmall">
          {title.toUpperCase()}
        </Text>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
      </View>
      <Text style={[styles.value, { color: accentColor }]} variant="headlineMedium">
        {value}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} variant="bodySmall">
          {subtitle}
        </Text>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    margin: Spacing.xs,
    borderLeftWidth: 3,
  },
  fullWidth: {
    flex: 0,
    minWidth: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    color: AppTheme.colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
  },
  value: {
    fontWeight: '700',
    marginVertical: Spacing.xs / 2,
  },
  subtitle: {
    color: AppTheme.colors.onSurfaceVariant,
    marginTop: Spacing.xs / 2,
  },
  iconWrapper: {
    opacity: 0.7,
  },
});
