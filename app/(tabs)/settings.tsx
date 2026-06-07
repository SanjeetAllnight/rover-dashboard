import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  Divider,
  SegmentedButtons,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore, ConnectionMethod } from '../../store/settingsStore';
import { useConnectionStore } from '../../store/connectionStore';
import { AppTheme, Spacing, Radius } from '../../constants/theme';

const METHOD_OPTIONS = [
  { value: 'mock', label: 'Mock Rover' },
  { value: 'wifi', label: 'WiFi Rover' },
];

export default function SettingsScreen() {
  const { savedRoverIp, selectedMethod, setSelectedMethod, setSavedRoverIp } = useSettingsStore();
  const { status, error, connect, disconnect } = useConnectionStore();

  const [ipInput, setIpInput] = useState(
    savedRoverIp.replace(/^https?:\/\//, ''),
  );

  const handleMethodChange = async (val: string) => {
    const method = val as ConnectionMethod;
    disconnect(); // Always disconnect when switching methods
    await setSelectedMethod(method);
    if (method === 'mock') {
      connect(); // Auto-connect mock
    }
  };

  const handleConnectWifi = async () => {
    const trimmed = ipInput.trim();
    if (trimmed) {
      await setSavedRoverIp(trimmed);
      connect();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="network-outline"
          size={28}
          color={AppTheme.colors.primary}
        />
        <View>
          <Text style={styles.headerTitle} variant="titleLarge">
            Connection Setup
          </Text>
          <Text style={styles.headerSub} variant="bodySmall">
            Configure rover communication
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Surface style={[styles.section, styles.statusSection]} elevation={2}>
          <Text style={styles.sectionLabel} variant="labelSmall">
            CURRENT STATUS
          </Text>
          <View style={styles.statusRow}>
            {status === 'connected' && (
              <MaterialCommunityIcons name="check-circle" size={24} color={AppTheme.colors.secondary} />
            )}
            {status === 'disconnected' && (
              <MaterialCommunityIcons name="close-circle-outline" size={24} color={AppTheme.colors.onSurfaceVariant} />
            )}
            {status === 'error' && (
              <MaterialCommunityIcons name="alert-circle" size={24} color={AppTheme.colors.error} />
            )}
            {status === 'connecting' && (
              <ActivityIndicator size="small" color={AppTheme.colors.primary} />
            )}
            <Text style={[styles.statusText, { color: status === 'connected' ? AppTheme.colors.secondary : status === 'error' ? AppTheme.colors.error : AppTheme.colors.onSurface }]} variant="titleMedium">
              {status.toUpperCase()}
            </Text>
          </View>
          {status === 'error' && error && (
            <Text style={styles.errorText} variant="bodySmall">
              {error}
            </Text>
          )}
        </Surface>

        {/* Method Selection */}
        <Surface style={styles.section} elevation={2}>
          <Text style={styles.sectionLabel} variant="labelSmall">
            CONNECTION METHOD
          </Text>
          <Divider style={styles.divider} />
          <SegmentedButtons
            value={selectedMethod}
            onValueChange={handleMethodChange}
            buttons={METHOD_OPTIONS}
            style={styles.segmented}
            theme={{
              colors: {
                secondaryContainer: AppTheme.colors.primaryContainer,
                onSecondaryContainer: AppTheme.colors.primary,
              },
            }}
          />
        </Surface>

        {/* WiFi Config (Only show if WiFi selected) */}
        {selectedMethod === 'wifi' && (
          <Surface style={styles.section} elevation={2}>
            <Text style={styles.sectionLabel} variant="labelSmall">
              WIFI ROVER SETTINGS
            </Text>
            <Divider style={styles.divider} />

            <Text style={styles.fieldLabel} variant="bodyMedium">
              Rover IP Address
            </Text>
            <Text style={styles.fieldHint} variant="bodySmall">
              Enter the local IP or hostname of your ESP32 rover
            </Text>
            <TextInput
              style={styles.input}
              value={ipInput}
              onChangeText={setIpInput}
              placeholder="192.168.1.100"
              placeholderTextColor={AppTheme.colors.onSurfaceVariant}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              outlineColor={AppTheme.colors.outline}
              activeOutlineColor={AppTheme.colors.primary}
              textColor={AppTheme.colors.onSurface}
              left={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="ip-network-outline"
                      size={20}
                      color={AppTheme.colors.onSurfaceVariant}
                    />
                  )}
                />
              }
            />

            <View style={styles.btnRow}>
              {status !== 'connected' && status !== 'connecting' ? (
                <Button
                  mode="contained"
                  style={styles.connectBtn}
                  buttonColor={AppTheme.colors.primary}
                  textColor="#000"
                  onPress={handleConnectWifi}
                >
                  Connect
                </Button>
              ) : (
                <Button
                  mode="outlined"
                  style={styles.disconnectBtn}
                  textColor={AppTheme.colors.error}
                  onPress={disconnect}
                >
                  Disconnect
                </Button>
              )}
            </View>
          </Surface>
        )}

        {/* Mock Info (Only show if Mock selected) */}
        {selectedMethod === 'mock' && (
          <Surface style={styles.section} elevation={2}>
            <Text style={styles.sectionLabel} variant="labelSmall">
              MOCK ROVER SETTINGS
            </Text>
            <Divider style={styles.divider} />
            <Text style={styles.mockInfo} variant="bodyMedium">
              Simulation mode enabled. The app is simulating telemetry and disabling real network requests.
            </Text>
            <Text style={styles.mockSub} variant="bodySmall">
              It connects automatically and loops through an entire mission lifecycle.
            </Text>
            {status === 'connected' && (
              <Button
                mode="outlined"
                style={[styles.disconnectBtn, { marginTop: Spacing.md }]}
                textColor={AppTheme.colors.error}
                onPress={disconnect}
              >
                Disconnect Simulation
              </Button>
            )}
            {status !== 'connected' && (
              <Button
                mode="contained"
                style={[styles.connectBtn, { marginTop: Spacing.md }]}
                buttonColor={AppTheme.colors.primary}
                textColor="#000"
                onPress={connect}
              >
                Start Simulation
              </Button>
            )}
          </Surface>
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.outline,
    backgroundColor: AppTheme.colors.background,
  },
  headerTitle: {
    color: AppTheme.colors.onSurface,
    fontWeight: '700',
  },
  headerSub: {
    color: AppTheme.colors.onSurfaceVariant,
  },
  scroll: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  section: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  statusSection: {
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.colors.primary,
  },
  sectionLabel: {
    color: AppTheme.colors.onSurfaceVariant,
    letterSpacing: 1.5,
    fontSize: 10,
    marginBottom: Spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statusText: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorText: {
    color: AppTheme.colors.error,
    marginTop: Spacing.sm,
  },
  divider: {
    backgroundColor: AppTheme.colors.outline,
    marginBottom: Spacing.md,
  },
  segmented: {
    marginTop: Spacing.xs,
  },
  fieldLabel: {
    color: AppTheme.colors.onSurface,
    marginBottom: Spacing.xs / 2,
  },
  fieldHint: {
    color: AppTheme.colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: AppTheme.colors.surfaceVariant,
    marginBottom: Spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  connectBtn: {
    flex: 1,
    borderRadius: Radius.sm,
  },
  disconnectBtn: {
    flex: 1,
    borderRadius: Radius.sm,
    borderColor: AppTheme.colors.error,
  },
  mockInfo: {
    color: AppTheme.colors.onSurface,
    marginBottom: Spacing.xs,
  },
  mockSub: {
    color: AppTheme.colors.onSurfaceVariant,
  },
});
