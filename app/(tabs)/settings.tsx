import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Surface,
  Divider,
  SegmentedButtons,
  ActivityIndicator,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore, ConnectionMethod } from '../../store/settingsStore';
import { useConnectionStore } from '../../store/connectionStore';
import { useBLE } from '../../hooks/useBLE';
import { AppTheme, Spacing, Radius } from '../../constants/theme';
import type { Device } from 'react-native-ble-plx';

const METHOD_OPTIONS = [
  { value: 'mock', label: 'Mock Rover' },
  { value: 'ble', label: 'BLE Rover' },
];

export default function SettingsScreen() {
  const { selectedMethod, setSelectedMethod } = useSettingsStore();
  const { status: mockStatus, connectMock, disconnect: disconnectMock } = useConnectionStore();
  const {
    isScanning,
    discoveredDevices,
    scanError,
    connectionStatus,
    connectionError,
    startScan,
    stopScan,
    connectToDevice,
    disconnect: disconnectBle
  } = useBLE();

  // Unified status for UI
  const status = selectedMethod === 'mock' ? mockStatus : connectionStatus;
  const error = selectedMethod === 'mock' ? null : connectionError;

  const handleMethodChange = async (val: string) => {
    const method = val as ConnectionMethod;
    if (selectedMethod === 'mock') await disconnectMock();
    else await disconnectBle();
    
    if (isScanning) stopScan();
    
    await setSelectedMethod(method);
    if (method === 'mock') {
      connectMock();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="bluetooth"
          size={28}
          color={AppTheme.colors.primary}
        />
        <View>
          <Text style={styles.headerTitle} variant="titleLarge">
            Connection Setup
          </Text>
          <Text style={styles.headerSub} variant="bodySmall">
            Configure BLE communication
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

        {/* BLE Config (Only show if BLE selected) */}
        {selectedMethod === 'ble' && (
          <Surface style={styles.section} elevation={2}>
            <Text style={styles.sectionLabel} variant="labelSmall">
              BLUETOOTH ROVER SETTINGS
            </Text>
            <Divider style={styles.divider} />

            {status === 'connected' || status === 'connecting' ? (
              <Button
                mode="outlined"
                style={styles.disconnectBtn}
                textColor={AppTheme.colors.error}
                onPress={disconnectBle}
              >
                Disconnect
              </Button>
            ) : (
              <>
                <Button
                  mode="contained"
                  style={styles.connectBtn}
                  buttonColor={AppTheme.colors.primary}
                  textColor="#000"
                  icon={isScanning ? 'bluetooth-transfer' : 'bluetooth-connect'}
                  loading={isScanning}
                  onPress={startScan}
                >
                  {isScanning ? 'Scanning...' : 'Scan for Rover'}
                </Button>

                {scanError && (
                  <Text style={styles.errorText} variant="bodySmall">
                    {scanError}
                  </Text>
                )}

                {discoveredDevices.length > 0 && (
                  <View style={styles.deviceList}>
                    <Text style={styles.fieldLabel} variant="labelLarge">Discovered Devices</Text>
                    {discoveredDevices.map((dev) => (
                      <List.Item
                        key={dev.id}
                        title={dev.name || 'Unknown Device'}
                        description={`ID: ${dev.id}`}
                        titleStyle={{ color: AppTheme.colors.onSurface }}
                        descriptionStyle={{ color: AppTheme.colors.onSurfaceVariant }}
                        left={props => <List.Icon {...props} icon="bluetooth" color={AppTheme.colors.primary} />}
                        right={() => (
                          <Button mode="text" onPress={() => connectToDevice(dev.id)}>
                            Connect
                          </Button>
                        )}
                        style={styles.deviceItem}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
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
                onPress={disconnectMock}
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
                onPress={connectMock}
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
    marginTop: Spacing.md,
    marginBottom: Spacing.xs / 2,
  },
  connectBtn: {
    borderRadius: Radius.sm,
  },
  disconnectBtn: {
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
  deviceList: {
    marginTop: Spacing.md,
  },
  deviceItem: {
    backgroundColor: AppTheme.colors.surfaceVariant,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  }
});
