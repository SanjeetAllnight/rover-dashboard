import React from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRoverStatus } from '../../hooks/useRoverStatus';
import { ConnectionBadge } from '../../components/ConnectionBadge';
import { BatteryGauge } from '../../components/BatteryGauge';
import { CargoCard } from '../../components/CargoCard';
import { StatusCard } from '../../components/StatusCard';
import { RoverStatusCard } from '../../components/RoverStatusCard';
import { MissionCard } from '../../components/MissionCard';
import { MissionProgressCard } from '../../components/MissionProgressCard';
import { EventLogCard } from '../../components/EventLogCard';
import { ControlPanel } from '../../components/ControlPanel';
import { AppTheme, Spacing } from '../../constants/theme';

function roverStateColor(state: string): string {
  switch (state) {
    case 'RUNNING':   return AppTheme.colors.secondary;
    case 'IDLE':      return AppTheme.colors.primary;
    case 'PAUSED':    return '#FFD600';
    case 'UNLOADING': return AppTheme.colors.tertiary;
    case 'ERROR':
    case 'STOPPED':   return AppTheme.colors.error;
    default:          return AppTheme.colors.onSurfaceVariant;
  }
}

function slopeAngleColor(deg: number): string {
  const abs = Math.abs(deg);
  if (abs < 10) return AppTheme.colors.secondary;  // safe — green
  if (abs < 20) return '#FFD600';                   // caution — yellow
  return AppTheme.colors.error;                     // steep — red
}

export default function DashboardScreen() {
  const { status, isConnected, apiStatus, error, lastAttempts, lastUpdated, refetch } =
    useRoverStatus();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const isLoading = apiStatus === 'loading' && !status;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="robot-industrial"
            size={28}
            color={AppTheme.colors.primary}
          />
          <View>
            <Text style={styles.headerTitle} variant="titleLarge">
              Rover Dashboard
            </Text>
            <Text style={styles.headerSub} variant="bodySmall">
              M5StickC PLUS2 • ESP32
            </Text>
          </View>
        </View>
        {apiStatus === 'loading' && (
          <ActivityIndicator size="small" color={AppTheme.colors.primary} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppTheme.colors.primary}
            colors={[AppTheme.colors.primary]}
          />
        }
      >
        {/* Connection badge */}
        <ConnectionBadge
          isConnected={isConnected}
          lastUpdated={lastUpdated}
          error={error}
        />

        {/* Retry notice */}
        {lastAttempts > 1 && isConnected && (
          <Text style={styles.retryNotice} variant="bodySmall">
            ⚠ Connected after {lastAttempts} attempt{lastAttempts !== 1 ? 's' : ''}
          </Text>
        )}

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
            <Text style={styles.loadingText} variant="bodyMedium">
              Connecting to rover…
            </Text>
          </View>
        ) : status ? (
          <>
            {/* State + Battery */}
            <View style={styles.row}>
              <RoverStatusCard state={status.state} />
              <BatteryGauge
                percentage={status.batteryPercent}
                voltage={status.batteryVoltage}
              />
            </View>

            {/* Cargo + Slope */}
            <View style={styles.row}>
              <CargoCard cargoLoaded={status.cargoLoaded} />
              <StatusCard
                title="Slope Angle"
                value={`${status.slopeAngle}°`}
                subtitle={
                  Math.abs(status.slopeAngle) < 10
                    ? 'Level — safe'
                    : Math.abs(status.slopeAngle) < 20
                    ? 'Inclined — caution'
                    : 'Steep — be careful'
                }
                accentColor={slopeAngleColor(status.slopeAngle)}
                icon={
                  <MaterialCommunityIcons
                    name="slope-uphill"
                    size={18}
                    color={slopeAngleColor(status.slopeAngle)}
                  />
                }
              />
            </View>

            {/* Mission info */}
            <MissionCard
              currentTripNumber={status.currentTripNumber || 0}
              tripsCompleted={status.tripsCompleted}
              lastTripDuration={status.lastTripDuration}
            />

            {/* Mission Progress */}
            <MissionProgressCard state={status.state} progress={status.missionProgress || 0} />

            {/* Event Log */}
            <EventLogCard events={status.eventLog || []} />

            {/* Controls */}
            <ControlPanel />
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="wifi-off"
              size={64}
              color={AppTheme.colors.onSurfaceVariant}
            />
            <Text style={styles.emptyTitle} variant="titleMedium">
              Rover not connected
            </Text>
            <Text style={styles.emptySub} variant="bodySmall">
              {error ? `Connection failed: ${error}` : 'Please connect to a rover to view telemetry.'}
            </Text>
            
            <Button
              mode="contained"
              onPress={() => router.push('/settings')}
              style={styles.setupBtn}
              buttonColor={AppTheme.colors.primary}
              textColor="#000"
            >
              Open Connection Setup
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.outline,
    backgroundColor: AppTheme.colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    color: AppTheme.colors.onSurface,
    fontWeight: '700',
  },
  headerSub: {
    color: AppTheme.colors.onSurfaceVariant,
  },
  scroll: {
    padding: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
  },
  retryNotice: {
    color: '#FFD600',
    textAlign: 'center',
    marginVertical: Spacing.xs,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  loadingText: {
    color: AppTheme.colors.onSurfaceVariant,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: AppTheme.colors.onSurface,
    marginTop: Spacing.md,
  },
  emptySub: {
    color: AppTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  setupBtn: {
    marginTop: Spacing.md,
    borderRadius: 8,
  },
});
