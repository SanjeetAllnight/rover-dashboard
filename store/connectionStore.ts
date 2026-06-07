import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';
import { bleService } from '../services/bleService';
import { mockRover } from '../services/mockRover';
import type { RoverStatus, RoverCommand } from '../types/rover';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ConnectionState {
  status: ConnectionStatus;
  error: string | null;
  telemetry: RoverStatus | null;
  lastUpdated: Date | null;
  connectMock: () => void;
  connectBle: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (cmd: RoverCommand) => Promise<void>;
  _setTelemetry: (telemetry: RoverStatus) => void;
  _setError: (error: string) => void;
}

let mockPollIntervalId: ReturnType<typeof setInterval> | null = null;

export const useConnectionStore = create<ConnectionState>((set, get) => {
  // Bind BLE service events to our store
  bleService.onTelemetryReceived = (telemetry) => {
    get()._setTelemetry(telemetry);
  };
  
  bleService.onDeviceDisconnected = () => {
    set({ status: 'disconnected', telemetry: null, error: 'Device disconnected unexpectedly' });
  };

  return {
    status: 'disconnected',
    error: null,
    telemetry: null,
    lastUpdated: null,

    connectMock: () => {
      if (get().status === 'connected' || get().status === 'connecting') return;
      set({ status: 'connecting', error: null });
      
      // Simulate connection delay
      setTimeout(() => {
        if (mockPollIntervalId) clearInterval(mockPollIntervalId);
        
        // Initial tick
        get()._setTelemetry(mockRover.getStatus());
        set({ status: 'connected' });

        // Start polling mock rover
        const ms = useSettingsStore.getState().pollIntervalMs || 1000;
        mockPollIntervalId = setInterval(() => {
          if (get().status === 'connected') {
            get()._setTelemetry(mockRover.getStatus());
          }
        }, ms);
      }, 500);
    },

    connectBle: async (deviceId: string) => {
      if (get().status === 'connected' || get().status === 'connecting') return;
      set({ status: 'connecting', error: null });

      try {
        await bleService.connectToDevice(deviceId);
        set({ status: 'connected', error: null });
      } catch (e: any) {
        get()._setError(e.message || 'Failed to connect to BLE device');
      }
    },

    disconnect: async () => {
      // Clear mock interval
      if (mockPollIntervalId) {
        clearInterval(mockPollIntervalId);
        mockPollIntervalId = null;
      }
      
      // Disconnect BLE
      try {
        await bleService.disconnect();
      } catch (e) {
        console.error('Disconnect error', e);
      }

      set({ status: 'disconnected', telemetry: null, error: null, lastUpdated: null });
    },

    sendCommand: async (cmd: RoverCommand) => {
      const { status } = get();
      if (status !== 'connected') return;

      const method = useSettingsStore.getState().selectedMethod;
      
      if (method === 'mock') {
        mockRover.handleCommand(cmd);
        // Instant update for mock
        get()._setTelemetry(mockRover.getStatus());
      } else {
        try {
          await bleService.sendCommand(cmd);
        } catch (e: any) {
          console.error('Failed to send command', e);
          // Optional: handle error state
        }
      }
    },

    _setTelemetry: (telemetry: RoverStatus) => {
      set({ telemetry, lastUpdated: new Date() });
    },

    _setError: (error: string) => {
      set({ status: 'error', error });
    }
  };
});

// Auto-connect Mock Rover if selected
useSettingsStore.subscribe((state, prevState) => {
  if (state.selectedMethod === 'mock' && prevState.selectedMethod !== 'mock') {
    useConnectionStore.getState().connectMock();
  }
});
