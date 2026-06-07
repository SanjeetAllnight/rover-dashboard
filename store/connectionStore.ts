import { create } from 'zustand';
import { getRoverStatus } from '../services/roverApi';
import { useSettingsStore } from './settingsStore';
import type { RoverStatus } from '../types/rover';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ConnectionState {
  status: ConnectionStatus;
  error: string | null;
  telemetry: RoverStatus | null;
  lastUpdated: Date | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  _tick: () => Promise<void>;
}

// Store the interval ID locally so it's not in the reactive state
let pollIntervalId: ReturnType<typeof setInterval> | null = null;

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  status: 'disconnected',
  error: null,
  telemetry: null,
  lastUpdated: null,

  connect: async () => {
    // If already connected/connecting, do nothing
    if (get().status === 'connected' || get().status === 'connecting') return;

    set({ status: 'connecting', error: null });

    // Initial ping
    await get()._tick();

    if (get().status === 'connected') {
      // Start polling
      if (pollIntervalId) clearInterval(pollIntervalId);
      const ms = useSettingsStore.getState().pollIntervalMs;
      pollIntervalId = setInterval(() => get()._tick(), ms);
    }
  },

  disconnect: () => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
    set({ status: 'disconnected', telemetry: null, error: null, lastUpdated: null });
  },

  _tick: async () => {
    const { status } = get();
    // Don't fetch if we explicitly disconnected
    if (status === 'disconnected') return;

    const result = await getRoverStatus();
    
    if (get().status === 'disconnected') return; // if user disconnected during fetch

    if (result.data) {
      set({
        status: 'connected',
        telemetry: result.data,
        error: null,
        lastUpdated: new Date(),
      });
    } else {
      set({
        status: 'error',
        error: result.error,
      });
      // Optionally stop polling on error, but for WiFi it's common to keep trying
      // If we want to drop connection on error:
      // get().disconnect();
      // set({ status: 'error', error: result.error }); 
      // But keeping it 'error' allows the UI to show an error state while still trying.
    }
  },
}));

// Subscribe to settings changes to auto-connect if Mock Rover is selected
useSettingsStore.subscribe((state, prevState) => {
  if (state.selectedMethod === 'mock' && prevState.selectedMethod !== 'mock') {
    useConnectionStore.getState().connect();
  }
});
