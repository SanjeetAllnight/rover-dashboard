import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTheme, Spacing, Radius } from '../constants/theme';

interface TripCardProps {
  tripsCompleted: number;
  /** Human-readable string from ESP32, e.g. "Returning", "Loading", "Waiting" */
  currentTripStatus: string;
  /** Duration of the last trip in seconds */
  lastTripDuration: number;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function TripCard({
  tripsCompleted,
  currentTripStatus,
  lastTripDuration,
}: TripCardProps) {
  return (
    <Surface style={styles.card} elevation={2}>
      <Text style={styles.sectionTitle} variant="labelSmall">
        TRIP INFORMATION
      </Text>

      <View style={styles.row}>
        {/* Trips completed */}
        <View style={styles.cell}>
          <MaterialCommunityIcons
            name="flag-checkered"
            size={20}
            color={AppTheme.colors.primary}
          />
          <Text style={styles.cellValue} variant="headlineMedium">
            {tripsCompleted}
          </Text>
          <Text style={styles.cellLabel} variant="bodySmall">
            Completed
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Current trip */}
        <View style={styles.cell}>
          <MaterialCommunityIcons
            name="swap-horizontal-circle-outline"
            size={20}
            color={AppTheme.colors.primary}
          />
          <Text
            style={[styles.cellValue, { color: AppTheme.colors.primary }]}
            variant="titleLarge"
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {currentTripStatus}
          </Text>
          <Text style={styles.cellLabel} variant="bodySmall">
            Current
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Last duration */}
        <View style={styles.cell}>
          <MaterialCommunityIcons
            name="timer-outline"
            size={20}
            color={AppTheme.colors.tertiary}
          />
          <Text
            style={[styles.cellValue, { color: AppTheme.colors.tertiary }]}
            variant="headlineMedium"
          >
            {formatDuration(lastTripDuration)}
          </Text>
          <Text style={styles.cellLabel} variant="bodySmall">
            Last Duration
          </Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.colors.primary,
  },
  sectionTitle: {
    color: AppTheme.colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  cellValue: {
    fontWeight: '700',
    color: AppTheme.colors.onSurface,
    textAlign: 'center',
  },
  cellLabel: {
    color: AppTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: AppTheme.colors.outline,
    marginHorizontal: Spacing.sm,
  },
});
