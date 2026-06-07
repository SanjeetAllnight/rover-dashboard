import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  Divider,
  SegmentedButtons,
  Switch,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../../store/settingsStore';
import { AppTheme, Spacing, Radius } from '../../constants/theme';
import { getRoverStatus } from '../../services/roverApi';

const POLL_OPTIONS = [
  { value: '500', label: '0.5 s' },
  { value: '1000', label: '1 s' },
  { value: '2000', label: '2 s' },
  { value: '5000', label: '5 s' },
];

export default function SettingsScreen() {
  const { roverIp, pollIntervalMs, mockMode, setRoverIp, setPollInterval, setMockMode } = useSettingsStore();

  const [ipInput, setIpInput] = useState(
    roverIp.replace(/^https?:\/\//, ''),
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSaveIp = async () => {
    const trimmed = ipInput.trim();
    if (!trimmed) {
      Alert.alert('Invalid IP', 'Please enter a valid IP address or hostname.');
      return;
    }
    await setRoverIp(trimmed);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const { data, error } = await getRoverStatus();
    if (data) {
      setTestResult('✅  Connected! Rover responded successfully.');
    } else {
      setTestResult(`❌  Failed: ${error}`);
    }
    setTesting(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="cog-outline"
          size={28}
          color={AppTheme.colors.primary}
        />
        <View>
          <Text style={styles.headerTitle} variant="titleLarge">
            Settings
          </Text>
          <Text style={styles.headerSub} variant="bodySmall">
            Configure rover connection
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Network section */}
        <Surface style={styles.section} elevation={2}>
          <Text style={styles.sectionLabel} variant="labelSmall">
            NETWORK
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
            <Button
              mode="contained"
              style={styles.saveBtn}
              buttonColor={AppTheme.colors.primary}
              textColor="#000"
              onPress={handleSaveIp}
            >
              Save
            </Button>
            <Button
              mode="outlined"
              style={styles.testBtn}
              textColor={AppTheme.colors.primary}
              loading={testing}
              disabled={testing}
              onPress={handleTestConnection}
            >
              Test Connection
            </Button>
          </View>

          {testResult ? (
            <Text
              style={[
                styles.testResult,
                { color: testResult.startsWith('✅') ? AppTheme.colors.secondary : AppTheme.colors.error },
              ]}
              variant="bodySmall"
            >
              {testResult}
            </Text>
          ) : null}
        </Surface>

        {/* Polling section */}
        <Surface style={styles.section} elevation={2}>
          <Text style={styles.sectionLabel} variant="labelSmall">
            POLLING INTERVAL
          </Text>
          <Divider style={styles.divider} />
          <Text style={styles.fieldHint} variant="bodySmall">
            How often to fetch data from the rover
          </Text>
          <SegmentedButtons
            value={String(pollIntervalMs)}
            onValueChange={(v) => setPollInterval(Number(v))}
            buttons={POLL_OPTIONS}
            style={styles.segmented}
            theme={{
              colors: {
                secondaryContainer: AppTheme.colors.primaryContainer,
                onSecondaryContainer: AppTheme.colors.primary,
              },
            }}
          />
        </Surface>

        {/* Simulation section */}
        <Surface style={styles.section} elevation={2}>
          <Text style={styles.sectionLabel} variant="labelSmall">
            SIMULATION
          </Text>
          <Divider style={styles.divider} />
          
          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.fieldLabel} variant="bodyMedium">
                Enable Mock Rover
              </Text>
              <Text style={styles.fieldHint} variant="bodySmall">
                Simulate telemetry and disable real network requests for demonstration purposes
              </Text>
            </View>
            <Switch
              value={mockMode}
              onValueChange={setMockMode}
              color={AppTheme.colors.primary}
            />
          </View>
        </Surface>

        {/* About section */}
        <Surface style={styles.section} elevation={2}>
          <Text style={styles.sectionLabel} variant="labelSmall">
            ABOUT
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutKey} variant="bodyMedium">App</Text>
            <Text style={styles.aboutVal} variant="bodyMedium">Rover Dashboard</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutKey} variant="bodyMedium">Version</Text>
            <Text style={styles.aboutVal} variant="bodyMedium">1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutKey} variant="bodyMedium">Device</Text>
            <Text style={styles.aboutVal} variant="bodyMedium">M5StickC PLUS2</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutKey} variant="bodyMedium">Protocol</Text>
            <Text style={styles.aboutVal} variant="bodyMedium">HTTP REST (Local WiFi)</Text>
          </View>
        </Surface>
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
  sectionLabel: {
    color: AppTheme.colors.onSurfaceVariant,
    letterSpacing: 1.5,
    fontSize: 10,
    marginBottom: Spacing.xs,
  },
  divider: {
    backgroundColor: AppTheme.colors.outline,
    marginBottom: Spacing.md,
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
  saveBtn: {
    flex: 1,
    borderRadius: Radius.sm,
  },
  testBtn: {
    flex: 1,
    borderRadius: Radius.sm,
    borderColor: AppTheme.colors.primary,
  },
  testResult: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  segmented: {
    marginTop: Spacing.xs,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  aboutKey: {
    color: AppTheme.colors.onSurfaceVariant,
  },
  aboutVal: {
    color: AppTheme.colors.onSurface,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  switchTextCol: {
    flex: 1,
  },
});
