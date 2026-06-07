import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTheme, Spacing, Radius } from '../constants/theme';
import type { RoverState } from '../types/rover';

interface RoverStatusCardProps {
  state: RoverState;
}

interface StateConfig {
  color: string;
  bgColor: string;
  icon: string;
  label: string;
  description: string;
}

function getStateConfig(state: RoverState): StateConfig {
  switch (state) {
    case 'IDLE':
      return {
        color: AppTheme.colors.primary,
        bgColor: AppTheme.colors.primaryContainer,
        icon: 'pause-circle-outline',
        label: 'IDLE',
        description: 'Waiting for mission',
      };
    case 'DELIVERING':
    case 'RUNNING': // legacy alias
      return {
        color: AppTheme.colors.secondary,
        bgColor: AppTheme.colors.secondaryContainer,
        icon: 'truck-delivery-outline',
        label: 'DELIVERING',
        description: 'En route to destination',
      };
    case 'UNLOADING':
      return {
        color: AppTheme.colors.tertiary,
        bgColor: AppTheme.colors.tertiaryContainer,
        icon: 'package-down',
        label: 'UNLOADING',
        description: 'Offloading cargo',
      };
    case 'RETURNING':
    case 'PAUSED': // legacy alias (PAUSED was used for returning in old fw)
      return {
        color: '#7C83FF',
        bgColor: '#1A1C4A',
        icon: 'home-import-outline',
        label: 'RETURNING',
        description: 'Returning to home base',
      };
    case 'STOPPED':
      return {
        color: '#FFD600',
        bgColor: '#3A2E00',
        icon: 'hand-back-right-outline',
        label: 'STOPPED',
        description: 'Mission suspended',
      };
    case 'ERROR':
      return {
        color: AppTheme.colors.error,
        bgColor: AppTheme.colors.errorContainer,
        icon: 'alert-circle-outline',
        label: 'ERROR',
        description: 'Attention required',
      };
    default:
      return {
        color: AppTheme.colors.onSurfaceVariant,
        bgColor: AppTheme.colors.surfaceVariant,
        icon: 'help-circle-outline',
        label: String(state),
        description: 'Unknown state',
      };
  }
}

export function RoverStatusCard({ state }: RoverStatusCardProps) {
  const cfg = getStateConfig(state);

  return (
    <Surface style={[styles.card, { borderLeftColor: cfg.color }]} elevation={2}>
      <Text style={styles.sectionTitle} variant="labelSmall">
        ROVER STATUS
      </Text>

      {/* Badge */}
      <View style={[styles.badge, { backgroundColor: cfg.bgColor }]}>
        <MaterialCommunityIcons
          name={cfg.icon as any}
          size={20}
          color={cfg.color}
        />
        <Text style={[styles.badgeLabel, { color: cfg.color }]}>
          {cfg.label}
        </Text>
      </View>

      <Text style={styles.description} variant="bodySmall">
        {cfg.description}
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
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
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
    fontSize: 15,
    letterSpacing: 1.5,
  },
  description: {
    color: AppTheme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});
