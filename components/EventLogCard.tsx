import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTheme, Spacing, Radius } from '../constants/theme';
import type { RoverEvent, RoverEventType } from '../types/rover';

interface EventLogCardProps {
  /** Event log entries, newest first. Max 6 shown. */
  events: RoverEvent[];
}

interface EventMeta {
  icon: string;
  color: string;
  label: string;
}

function getEventMeta(type: RoverEventType): EventMeta {
  switch (type) {
    case 'MISSION_STARTED':
      return {
        icon: 'play-circle-outline',
        color: AppTheme.colors.secondary,
        label: 'Mission Started',
      };
    case 'DESTINATION_REACHED':
      return {
        icon: 'map-marker-check-outline',
        color: AppTheme.colors.primary,
        label: 'Destination Reached',
      };
    case 'CARGO_UNLOADED':
      return {
        icon: 'package-down',
        color: AppTheme.colors.tertiary,
        label: 'Cargo Unloaded',
      };
    case 'RETURNED_HOME':
      return {
        icon: 'home-import-outline',
        color: '#7C83FF',
        label: 'Returned Home',
      };
    case 'MISSION_ABORTED':
      return {
        icon: 'stop-circle-outline',
        color: '#FFD600',
        label: 'Mission Aborted',
      };
    case 'ERROR_DETECTED':
      return {
        icon: 'alert-circle-outline',
        color: AppTheme.colors.error,
        label: 'Error Detected',
      };
    default:
      return {
        icon: 'information-outline',
        color: AppTheme.colors.onSurfaceVariant,
        label: String(type),
      };
  }
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/** Placeholder events shown when the rover hasn't sent any logs yet. */
const PLACEHOLDER_EVENTS: RoverEvent[] = [
  { type: 'MISSION_STARTED',     timestamp: 0 },
  { type: 'DESTINATION_REACHED', timestamp: 0 },
  { type: 'CARGO_UNLOADED',      timestamp: 0 },
  { type: 'RETURNED_HOME',       timestamp: 0 },
];

export function EventLogCard({ events }: EventLogCardProps) {
  const displayEvents = events.length > 0
    ? events.slice(0, 6)
    : PLACEHOLDER_EVENTS;

  const isEmpty = events.length === 0;

  return (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle} variant="labelSmall">
          EVENT LOG
        </Text>
        {!isEmpty && (
          <Text style={styles.countBadge} variant="labelSmall">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {displayEvents.map((ev, idx) => {
        const meta = getEventMeta(ev.type);
        const isLast = idx === displayEvents.length - 1;
        return (
          <View key={`${ev.type}-${idx}`} style={styles.entry}>
            {/* Timeline line + dot */}
            <View style={styles.timeline}>
              <View style={[styles.dot, { backgroundColor: meta.color }]} />
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Content */}
            <View style={[styles.content, !isLast && styles.contentBorder]}>
              <View style={styles.entryRow}>
                <MaterialCommunityIcons
                  name={meta.icon as any}
                  size={15}
                  color={meta.color}
                />
                <Text style={[styles.entryLabel, { color: meta.color }]} variant="bodySmall">
                  {meta.label}
                </Text>
                {!isEmpty && ev.timestamp > 0 && (
                  <Text style={styles.entryTime} variant="labelSmall">
                    {formatTime(ev.timestamp)}
                  </Text>
                )}
                {isEmpty && (
                  <Text style={styles.entryTimePlaceholder} variant="labelSmall">
                    —
                  </Text>
                )}
              </View>
              {ev.message && (
                <Text style={styles.entryMessage} variant="bodySmall">
                  {ev.message}
                </Text>
              )}
            </View>
          </View>
        );
      })}

      {isEmpty && (
        <Text style={styles.emptyHint} variant="bodySmall">
          Events will appear here once a mission starts
        </Text>
      )}
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
    borderLeftColor: AppTheme.colors.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: AppTheme.colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
  },
  countBadge: {
    color: AppTheme.colors.tertiary,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  entry: {
    flexDirection: 'row',
  },
  timeline: {
    width: 16,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    zIndex: 1,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: AppTheme.colors.outline,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.sm,
  },
  contentBorder: {
    borderBottomWidth: 0, // rely on spacing instead
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  entryLabel: {
    fontWeight: '600',
    flex: 1,
  },
  entryTime: {
    color: AppTheme.colors.onSurfaceVariant,
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  entryTimePlaceholder: {
    color: AppTheme.colors.outline,
    fontSize: 10,
  },
  entryMessage: {
    color: AppTheme.colors.onSurfaceVariant,
    marginTop: 2,
    marginLeft: 19,
  },
  emptyHint: {
    color: AppTheme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
