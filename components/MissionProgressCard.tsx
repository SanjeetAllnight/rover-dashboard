import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTheme, Spacing, Radius } from '../constants/theme';
import type { RoverState } from '../types/rover';

interface MissionProgressCardProps {
  state: RoverState;
}

/**
 * Maps each rover state to a 0-100 progress value along the
 * Home → Destination → Return route.
 *
 *  0          = at Home Base (IDLE / STOPPED / ERROR)
 *  1  – 49   = travelling to destination (DELIVERING)
 *  50         = at Destination (UNLOADING)
 *  51 – 99   = returning (RETURNING)
 *  100        = back Home (trip complete)
 */
function stateToProgress(state: RoverState): number {
  switch (state) {
    case 'IDLE':     return 0;
    case 'DELIVERING':
    case 'RUNNING':  return 40;
    case 'UNLOADING':return 50;
    case 'RETURNING':
    case 'PAUSED':   return 80;
    case 'STOPPED':  return 0;
    case 'ERROR':    return 0;
    default:         return 0;
  }
}

interface WaypointProps {
  label: string;
  sublabel: string;
  icon: string;
  active: boolean;
  completed: boolean;
  accentColor: string;
}

function Waypoint({ label, sublabel, icon, active, completed, accentColor }: WaypointProps) {
  const color = completed || active ? accentColor : AppTheme.colors.onSurfaceVariant;
  const bgColor = completed || active ? `${accentColor}22` : AppTheme.colors.surfaceVariant;
  return (
    <View style={styles.waypointCol}>
      <View style={[styles.waypointDot, { borderColor: color, backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={icon as any} size={16} color={color} />
      </View>
      <Text style={[styles.waypointLabel, { color }]} variant="labelSmall">
        {label}
      </Text>
      <Text style={styles.waypointSub} variant="bodySmall">
        {sublabel}
      </Text>
    </View>
  );
}

export function MissionProgressCard({ state }: MissionProgressCardProps) {
  const progress = stateToProgress(state);
  const isActive = state !== 'IDLE' && state !== 'STOPPED' && state !== 'ERROR';

  // Segment fill ratios (0-1):
  // Segment 1: Home → Destination  (0-50% of progress scale)
  // Segment 2: Destination → Return (50-100% of progress scale)
  const seg1 = Math.min(1, Math.max(0, progress / 50));
  const seg2 = Math.min(1, Math.max(0, (progress - 50) / 50));

  const atDestination = progress >= 50;
  const atHome = progress === 0 || progress >= 100;

  return (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle} variant="labelSmall">
          MISSION PROGRESS
        </Text>
        {isActive && (
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText} variant="labelSmall">
              ACTIVE
            </Text>
          </View>
        )}
      </View>

      {/* Track */}
      <View style={styles.track}>
        {/* Waypoint: Home */}
        <Waypoint
          label="HOME"
          sublabel="Base"
          icon="home-outline"
          active={atHome && !isActive}
          completed={isActive}
          accentColor={AppTheme.colors.secondary}
        />

        {/* Segment 1 */}
        <View style={styles.segmentWrap}>
          <View style={styles.segmentBg}>
            <View
              style={[
                styles.segmentFill,
                {
                  width: `${seg1 * 100}%` as any,
                  backgroundColor: AppTheme.colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Waypoint: Destination */}
        <Waypoint
          label="DEST"
          sublabel="Drop-off"
          icon="map-marker-outline"
          active={state === 'UNLOADING'}
          completed={progress > 50}
          accentColor={AppTheme.colors.primary}
        />

        {/* Segment 2 */}
        <View style={styles.segmentWrap}>
          <View style={styles.segmentBg}>
            <View
              style={[
                styles.segmentFill,
                {
                  width: `${seg2 * 100}%` as any,
                  backgroundColor: '#7C83FF',
                },
              ]}
            />
          </View>
        </View>

        {/* Waypoint: Return */}
        <Waypoint
          label="HOME"
          sublabel="Return"
          icon="home-import-outline"
          active={progress >= 100}
          completed={progress >= 100}
          accentColor="#7C83FF"
        />
      </View>

      {/* State label */}
      <Text style={styles.stateLabel} variant="bodySmall">
        {state === 'IDLE'      && 'Awaiting mission start'}
        {state === 'DELIVERING' && 'Travelling to destination…'}
        {state === 'RUNNING'   && 'Travelling to destination…'}
        {state === 'UNLOADING' && 'Offloading cargo at destination'}
        {state === 'RETURNING' && 'Heading back to home base…'}
        {state === 'PAUSED'    && 'Heading back to home base…'}
        {state === 'STOPPED'   && 'Mission suspended — awaiting command'}
        {state === 'ERROR'     && 'Mission halted due to error'}
      </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: AppTheme.colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${AppTheme.colors.secondary}22`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppTheme.colors.secondary,
  },
  activeText: {
    color: AppTheme.colors.secondary,
    fontSize: 9,
    letterSpacing: 1,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  waypointCol: {
    alignItems: 'center',
    gap: 4,
    minWidth: 50,
  },
  waypointDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  waypointSub: {
    color: AppTheme.colors.onSurfaceVariant,
    fontSize: 9,
  },
  segmentWrap: {
    flex: 1,
    paddingBottom: 28, // align with centre of waypoint circle
  },
  segmentBg: {
    height: 4,
    backgroundColor: AppTheme.colors.surfaceVariant,
    borderRadius: 2,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    borderRadius: 2,
  },
  stateLabel: {
    color: AppTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 2,
  },
});
