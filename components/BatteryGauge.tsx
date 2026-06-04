import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTheme, Spacing, Radius } from '../constants/theme';

interface BatteryGaugeProps {
  percentage: number;
  voltage: number;
}

function getBatteryColor(pct: number): string {
  if (pct > 60) return AppTheme.colors.secondary; // green
  if (pct > 25) return '#FFD600';                  // yellow
  return AppTheme.colors.error;                    // red
}

function getBatteryIconName(pct: number): string {
  if (pct > 90) return 'battery';
  if (pct > 75) return 'battery-90';
  if (pct > 60) return 'battery-70';
  if (pct > 45) return 'battery-50';
  if (pct > 25) return 'battery-30';
  if (pct > 10) return 'battery-10';
  return 'battery-alert';
}

export function BatteryGauge({ percentage, voltage }: BatteryGaugeProps) {
  const color = getBatteryColor(percentage);
  const icon = getBatteryIconName(percentage);

  return (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.header}>
        <Text style={styles.title} variant="labelSmall">
          BATTERY
        </Text>
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
      </View>

      {/* Fill bar */}
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(100, Math.max(0, percentage))}%` as any,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.pct, { color }]} variant="headlineMedium">
          {percentage}%
        </Text>
        <Text style={styles.voltage} variant="bodyMedium">
          {voltage.toFixed(2)} V
        </Text>
      </View>
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
    borderLeftColor: AppTheme.colors.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    color: AppTheme.colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
  },
  barBg: {
    height: 6,
    backgroundColor: AppTheme.colors.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  pct: {
    fontWeight: '700',
  },
  voltage: {
    color: AppTheme.colors.onSurfaceVariant,
  },
});
