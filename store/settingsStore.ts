import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setBaseUrl, getBaseUrl } from '../services/roverApi';

const STORAGE_KEY = '@rover_settings';

interface SettingsState {
  roverIp: string;
  pollIntervalMs: number;
  setRoverIp: (ip: string) => Promise<void>;
  setPollInterval: (ms: number) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  roverIp: getBaseUrl(),
  pollIntervalMs: 1000,

  setRoverIp: async (ip: string) => {
    const cleaned = ip.startsWith('http') ? ip : `http://${ip}`;
    setBaseUrl(cleaned);
    set({ roverIp: cleaned });
    const current = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...parsed, roverIp: cleaned }),
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

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { roverIp, pollIntervalMs } = JSON.parse(raw);
        if (roverIp) {
          setBaseUrl(roverIp);
          set({ roverIp });
        }
        if (pollIntervalMs) set({ pollIntervalMs });
      }
    } catch {
      // ignore — use defaults
    }
  },
}));
