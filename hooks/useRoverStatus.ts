import { useConnectionStore } from '../store/connectionStore';
import type { RoverStatus, ApiStatus } from '../types/rover';

export interface UseRoverStatusReturn {
  status: RoverStatus | null;
  /** True once the first successful response has been received */
  isConnected: boolean;
  /** Mirrors ApiResult.status — 'idle' | 'loading' | 'success' | 'error' */
  apiStatus: ApiStatus;
  error: string | null;
  /** How many retry attempts the last fetch needed */
  lastAttempts: number;
  lastUpdated: Date | null;
  /** Manually trigger an immediate fetch (also used by pull-to-refresh) */
  refetch: () => Promise<void>;
}

export function useRoverStatus(): UseRoverStatusReturn {
  const { status: connStatus, telemetry, error, lastUpdated } = useConnectionStore();

  let apiStatus: ApiStatus = 'idle';
  if (connStatus === 'error') apiStatus = 'error';
  else if (connStatus === 'connecting') apiStatus = 'loading';
  else if (connStatus === 'connected') apiStatus = 'success';

  return {
    status: telemetry,
    isConnected: connStatus === 'connected',
    apiStatus,
    error,
    lastAttempts: 1, // Simplified since retry logic is handled internally
    lastUpdated,
    refetch: async () => {}, // No-op in BLE mode
  };
}
