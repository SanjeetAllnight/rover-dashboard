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
      <Text style={styles.sectionTitle} variant="labelSmall">
        BATTERY
      </Text>

      <View style={styles.headerRow}>
        <View style={styles.iconRow}>
          <MaterialCommunityIcons name={icon as any} size={24} color={color} />
          <Text style={[styles.pct, { color }]} variant="headlineMedium">
            {percentage}%
          </Text>
        </View>
        <Text style={styles.voltage} variant="bodyMedium">
          {voltage.toFixed(2)}V
        </Text>
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
  sectionTitle: {
    color: AppTheme.colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pct: {
    fontWeight: '800',
    fontSize: 24,
  },
  voltage: {
    color: AppTheme.colors.onSurfaceVariant,
  },
  barBg: {
    height: 8,
    backgroundColor: AppTheme.colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
