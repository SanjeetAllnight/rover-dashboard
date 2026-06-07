import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTheme, Spacing, Radius } from '../constants/theme';

interface CargoCardProps {
  /** true = cargo is loaded */
  cargoLoaded: boolean;
}

export function CargoCard({ cargoLoaded }: CargoCardProps) {
  const color = cargoLoaded
    ? AppTheme.colors.tertiary
    : AppTheme.colors.onSurfaceVariant;
  const bgColor = cargoLoaded
    ? AppTheme.colors.tertiaryContainer
    : AppTheme.colors.surfaceVariant;
  const icon = cargoLoaded
    ? 'package-variant-closed'
    : 'package-variant';

  return (
    <Surface style={[styles.card, { borderLeftColor: color }]} elevation={2}>
      <Text style={styles.sectionTitle} variant="labelSmall">
        CARGO
      </Text>

      {/* Status badge */}
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
        <Text style={[styles.badgeLabel, { color }]}>
          {cargoLoaded ? 'LOADED' : 'EMPTY'}
        </Text>
      </View>

      <Text style={styles.sub} variant="bodySmall">
        {cargoLoaded ? 'Payload on board' : 'Bay is clear'}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    margin: Spacing.xs,
    borderLeftWidth: 3,
  },
  sectionTitle: {
    color: AppTheme.colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xs,
  },
  badgeLabel: {
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  sub: {
    color: AppTheme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});
