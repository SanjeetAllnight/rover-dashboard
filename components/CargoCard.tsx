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
  const icon = cargoLoaded
    ? 'package-variant-closed'
    : 'package-variant';

  return (
    <Surface style={[styles.card, { borderLeftColor: color }]} elevation={2}>
      <View style={styles.header}>
        <Text style={styles.title} variant="labelSmall">
          CARGO
        </Text>
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.value, { color }]} variant="headlineMedium">
        {cargoLoaded ? 'LOADED' : 'EMPTY'}
      </Text>
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
  sub: {
    color: AppTheme.colors.onSurfaceVariant,
    marginTop: Spacing.xs / 2,
  },
});
