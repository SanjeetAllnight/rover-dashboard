import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setBaseUrl, getBaseUrl } from '../services/roverApi';

const STORAGE_KEY = '@rover_settings';

export type ConnectionMethod = 'mock' | 'wifi';

interface SettingsState {
  savedRoverIp: string;
  pollIntervalMs: number;
  selectedMethod: ConnectionMethod;
  setSavedRoverIp: (ip: string) => Promise<void>;
  setPollInterval: (ms: number) => Promise<void>;
  setSelectedMethod: (method: ConnectionMethod) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  savedRoverIp: getBaseUrl(),
  pollIntervalMs: 1000,
  selectedMethod: 'mock',

  setSavedRoverIp: async (ip: string) => {
    const cleaned = ip.startsWith('http') ? ip : `http://${ip}`;
    setBaseUrl(cleaned);
    set({ savedRoverIp: cleaned });
    const current = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...parsed, savedRoverIp: cleaned }),
    );
  },

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
        const { savedRoverIp, pollIntervalMs, selectedMethod, roverIp, mockMode } = JSON.parse(raw);
        
        // Migrate from old schema if needed
        const ipToSet = savedRoverIp || roverIp;
        if (ipToSet) {
          setBaseUrl(ipToSet);
          set({ savedRoverIp: ipToSet });
        }
        if (pollIntervalMs) set({ pollIntervalMs });
        
        const methodToSet = selectedMethod || (mockMode ? 'mock' : 'wifi');
        set({ selectedMethod: methodToSet });
      }
    } catch {
      // ignore — use defaults
    }
  },
}));
