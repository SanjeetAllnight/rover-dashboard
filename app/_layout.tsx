import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AppTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export default function RootLayout() {
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <PaperProvider theme={AppTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
