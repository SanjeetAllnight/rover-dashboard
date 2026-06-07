import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@rover_settings';

export type ConnectionMethod = 'mock' | 'ble';

interface SettingsState {
  pollIntervalMs: number;
  selectedMethod: ConnectionMethod;
  setPollInterval: (ms: number) => Promise<void>;
  setSelectedMethod: (method: ConnectionMethod) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  pollIntervalMs: 1000,
  selectedMethod: 'mock',

  setPollInterval: async (ms: number) => {
    set({ pollIntervalMs: ms });
    const current = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...parsed, pollIntervalMs: ms }),
    );
  },

  setSelectedMethod: async (method: ConnectionMethod) => {
    set({ selectedMethod: method });
    const current = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...parsed, selectedMethod: method }),
    );
  },

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { pollIntervalMs, selectedMethod, mockMode } = JSON.parse(raw);
        
        if (pollIntervalMs) set({ pollIntervalMs });
        
        // Migrate from old schemas
        let methodToSet = selectedMethod;
        if (methodToSet === 'wifi') methodToSet = 'ble';
        if (!methodToSet) methodToSet = mockMode ? 'mock' : 'ble';
        
        set({ selectedMethod: methodToSet as ConnectionMethod });
      }
    } catch {
      // ignore — use defaults
    }
  },
}));
