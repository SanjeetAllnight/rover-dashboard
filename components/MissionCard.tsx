import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTheme, Spacing, Radius } from '../constants/theme';

interface MissionCardProps {
  currentTripNumber: number;
  tripsCompleted: number;
  lastTripDuration: number;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function MissionCard({
  currentTripNumber,
  tripsCompleted,
  lastTripDuration,
}: MissionCardProps) {
  return (
    <Surface style={styles.card} elevation={2}>
      <Text style={styles.sectionTitle} variant="labelSmall">
        MISSION
      </Text>

      <View style={styles.row}>
        {/* Current trip */}
        <View style={styles.cell}>
          <View style={[styles.iconWrap, { backgroundColor: '#003D47' }]}>
            <MaterialCommunityIcons
              name="map-marker-path"
              size={18}
              color={AppTheme.colors.primary}
            />
          </View>
          <Text
            style={[styles.cellValue, { color: AppTheme.colors.primary }]}
            variant="headlineMedium"
          >
            {currentTripNumber > 0 ? `#${currentTripNumber}` : '—'}
          </Text>
          <Text style={styles.cellLabel} variant="bodySmall">
            Current Trip
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Trips completed */}
        <View style={styles.cell}>
          <View style={[styles.iconWrap, { backgroundColor: AppTheme.colors.secondaryContainer }]}>
            <MaterialCommunityIcons
              name="flag-checkered"
              size={18}
              color={AppTheme.colors.secondary}
            />
          </View>
          <Text
            style={[styles.cellValue, { color: AppTheme.colors.secondary }]}
            variant="headlineMedium"
          >
            {tripsCompleted}
          </Text>
          <Text style={styles.cellLabel} variant="bodySmall">
            Completed
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Last duration */}
        <View style={styles.cell}>
          <View style={[styles.iconWrap, { backgroundColor: AppTheme.colors.tertiaryContainer }]}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={18}
              color={AppTheme.colors.tertiary}
            />
          </View>
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
    gap: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  cellValue: {
    fontWeight: '700',
    color: AppTheme.colors.onSurface,
    textAlign: 'center',
  },
  cellLabel: {
    color: AppTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: AppTheme.colors.outline,
    marginHorizontal: Spacing.sm,
  },
});
