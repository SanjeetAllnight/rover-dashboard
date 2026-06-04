import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Surface, Text, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoverControls } from '../hooks/useRoverControls';
import { AppTheme, Spacing, Radius } from '../constants/theme';

export function ControlPanel() {
  const {
    commandState,
    isSending,
    startRover,
    stopRover,
    unloadCargo,
    clearCommandState,
  } = useRoverControls();

  const hasError = commandState.status === 'error';

  return (
    <>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.header}>
          <Text style={styles.title} variant="labelSmall">
            CONTROLS
          </Text>
          {commandState.status === 'success' && (
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={16}
              color={AppTheme.colors.secondary}
            />
          )}
          {hasError && (
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={16}
              color={AppTheme.colors.error}
            />
          )}
        </View>

        <View style={styles.row}>
          {/* Start */}
          <Button
            mode="contained"
            style={[styles.btn, { backgroundColor: AppTheme.colors.secondary }]}
            labelStyle={styles.btnLabelDark}
            contentStyle={styles.btnContent}
            icon={() => (
              <MaterialCommunityIcons
                name="play-circle-outline"
                size={20}
                color="#000"
              />
            )}
            loading={isSending}
            disabled={isSending}
            onPress={startRover}
          >
            Start
          </Button>

          {/* Stop */}
          <Button
            mode="contained"
            style={[styles.btn, { backgroundColor: AppTheme.colors.error }]}
            labelStyle={styles.btnLabelLight}
            contentStyle={styles.btnContent}
            icon={() => (
              <MaterialCommunityIcons
                name="stop-circle-outline"
                size={20}
                color="#fff"
              />
            )}
            loading={isSending}
            disabled={isSending}
            onPress={stopRover}
          >
            Stop
          </Button>

          {/* Unload */}
          <Button
            mode="outlined"
            style={[styles.btn, styles.unloadBtn]}
            labelStyle={[styles.btnLabelLight, { color: AppTheme.colors.tertiary }]}
            contentStyle={styles.btnContent}
            icon={() => (
              <MaterialCommunityIcons
                name="package-down"
                size={20}
                color={AppTheme.colors.tertiary}
              />
            )}
            loading={isSending}
            disabled={isSending}
            onPress={unloadCargo}
          >
            Unload
          </Button>
        </View>

        {/* Retry hint */}
        {hasError && commandState.attempts > 1 && (
          <Text style={styles.retryHint} variant="bodySmall">
            Failed after {commandState.attempts} attempt{commandState.attempts !== 1 ? 's' : ''}
          </Text>
        )}
      </Surface>

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
    </>
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
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  title: {
    color: AppTheme.colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  btn: {
    flex: 1,
    borderRadius: Radius.sm,
  },
  unloadBtn: {
    borderColor: AppTheme.colors.tertiary,
  },
  btnLabelDark: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  btnLabelLight: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  btnContent: {
    paddingVertical: Spacing.xs,
  },
  retryHint: {
    color: AppTheme.colors.error,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  snackbar: {
    backgroundColor: AppTheme.colors.errorContainer,
  },
});
