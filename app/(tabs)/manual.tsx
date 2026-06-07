import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Surface, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRoverStatus } from '../../hooks/useRoverStatus';
import { useRoverControls } from '../../hooks/useRoverControls';
import { RoverStatusCard } from '../../components/RoverStatusCard';
import { BatteryGauge } from '../../components/BatteryGauge';
import { AppTheme, Spacing, Radius } from '../../constants/theme';
import type { RoverCommand } from '../../types/rover';

interface DPadButtonProps {
  icon: string;
  onPress: () => void;
  disabled: boolean;
  color?: string;
  iconColor?: string;
}

function DPadButton({ icon, onPress, disabled, color, iconColor }: DPadButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.dpadBtn,
        { backgroundColor: color || AppTheme.colors.surfaceVariant },
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.4 },
      ]}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={48}
        color={iconColor || AppTheme.colors.onSurface}
      />
    </Pressable>
  );
}

export default function ManualControlScreen() {
  const { status, isConnected, apiStatus, error } = useRoverStatus();
  const { commandState, isSending, executeCommand, clearCommandState } = useRoverControls();

  const handleCommand = (cmd: RoverCommand) => {
    executeCommand(cmd);
  };

  const hasError = commandState.status === 'error';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="gamepad-variant-outline"
            size={28}
            color={AppTheme.colors.primary}
          />
          <View>
            <Text style={styles.headerTitle} variant="titleLarge">
              Manual Control
            </Text>
            <Text style={styles.headerSub} variant="bodySmall">
              Direct override interface
            </Text>
          </View>
        </View>
        {(apiStatus === 'loading' || isSending) && (
          <ActivityIndicator size="small" color={AppTheme.colors.primary} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!isConnected && (
          <Surface style={styles.warningCard} elevation={2}>
            <MaterialCommunityIcons name="alert-circle-outline" size={24} color={AppTheme.colors.error} />
            <View style={styles.warningTextCol}>
              <Text style={styles.warningTitle} variant="labelLarge">Not Connected</Text>
              <Text style={styles.warningSub} variant="bodySmall">Connect to rover before sending commands.</Text>
            </View>
            <Button mode="text" textColor={AppTheme.colors.primary} onPress={() => router.push('/settings')}>
              Setup
            </Button>
          </Surface>
        )}

        {/* Status & Battery */}
        {status && isConnected && (
          <View style={styles.row}>
            <RoverStatusCard state={status.state} />
            <BatteryGauge
              percentage={status.batteryPercent}
              voltage={status.batteryVoltage}
            />
          </View>
        )}

        {/* D-PAD */}
        <Surface style={styles.card} elevation={2}>
          <Text style={styles.sectionTitle} variant="labelSmall">
            DIRECTIONAL CONTROL
          </Text>
          
          <View style={styles.dpadContainer}>
            <View style={styles.dpadRow}>
              <DPadButton
                icon="chevron-up"
                onPress={() => handleCommand('FORWARD')}
                disabled={isSending || !isConnected}
              />
            </View>
            <View style={styles.dpadRow}>
              <DPadButton
                icon="chevron-left"
                onPress={() => handleCommand('LEFT')}
                disabled={isSending || !isConnected}
              />
              <DPadButton
                icon="stop"
                color={AppTheme.colors.error}
                iconColor="#fff"
                onPress={() => handleCommand('STOP')}
                disabled={isSending || !isConnected}
              />
              <DPadButton
                icon="chevron-right"
                onPress={() => handleCommand('RIGHT')}
                disabled={isSending || !isConnected}
              />
            </View>
            <View style={styles.dpadRow}>
              <DPadButton
                icon="chevron-down"
                onPress={() => handleCommand('BACKWARD')}
                disabled={isSending || !isConnected}
              />
            </View>
          </View>
        </Surface>

        {/* ACTION BUTTONS */}
        <Surface style={styles.card} elevation={2}>
          <Text style={styles.sectionTitle} variant="labelSmall">
            ACTIONS
          </Text>

          <View style={styles.actionGrid}>
            <View style={styles.row}>
              <Button
                mode="contained"
                style={[styles.actionBtn, { flex: 1, marginRight: Spacing.xs, backgroundColor: AppTheme.colors.secondary }]}
                labelStyle={[styles.actionBtnLabel, { color: '#000' }]}
                icon="play-circle"
                disabled={isSending || !isConnected}
                onPress={() => handleCommand('START_MISSION')}
              >
                Start Mission
              </Button>
              <Button
                mode="contained"
                style={[styles.actionBtn, { flex: 1, marginLeft: Spacing.xs, backgroundColor: AppTheme.colors.surfaceVariant }]}
                labelStyle={[styles.actionBtnLabel, { color: AppTheme.colors.onSurface }]}
                icon="stop-circle"
                disabled={isSending || !isConnected}
                onPress={() => handleCommand('STOP_MISSION')}
              >
                Abort Mission
              </Button>
            </View>

            <Button
              mode="contained"
              style={[styles.actionBtn, { backgroundColor: AppTheme.colors.tertiary, marginTop: Spacing.md }]}
              labelStyle={styles.actionBtnLabel}
              icon="package-up"
              disabled={isSending || !isConnected}
              onPress={() => handleCommand('OPEN_TRAP')}
            >
              Open Trap Door
            </Button>

            <Button
              mode="contained"
              style={[styles.actionBtn, { backgroundColor: AppTheme.colors.surfaceVariant }]}
              labelStyle={[styles.actionBtnLabel, { color: AppTheme.colors.onSurface }]}
              icon="package-down"
              disabled={isSending || !isConnected}
              onPress={() => handleCommand('CLOSE_TRAP')}
            >
              Close Trap Door
            </Button>

            <Button
              mode="contained"
              style={[styles.actionBtn, { backgroundColor: AppTheme.colors.errorContainer, marginTop: Spacing.md }]}
              labelStyle={[styles.actionBtnLabel, { color: AppTheme.colors.error }]}
              icon="alert-octagon"
              disabled={isSending || !isConnected}
              onPress={() => handleCommand('STOP')}
            >
              Emergency Stop
            </Button>
          </View>
        </Surface>
      </ScrollView>

      {/* Error snackbar */}
      <Snackbar
        visible={hasError}
        onDismiss={clearCommandState}
        duration={4000}
        style={styles.snackbar}
        action={{ label: 'Dismiss', onPress: clearCommandState }}
      >
        {commandState.error}
      </Snackbar>
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
  dpadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  dpadRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dpadBtn: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrid: {
    gap: Spacing.sm,
  },
  actionBtn: {
    borderRadius: Radius.sm,
    paddingVertical: 4,
  },
  actionBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  warningCard: {
    backgroundColor: AppTheme.colors.errorContainer,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.colors.error,
  },
  warningTextCol: {
    flex: 1,
  },
  warningTitle: {
    color: AppTheme.colors.error,
    fontWeight: '700',
  },
  warningSub: {
    color: AppTheme.colors.onSurface,
  },
  snackbar: {
    backgroundColor: AppTheme.colors.errorContainer,
  },
});
