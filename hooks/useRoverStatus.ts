import { useState, useEffect, useRef, useCallback } from 'react';
import { getRoverStatus } from '../services/roverApi';
import { useSettingsStore } from '../store/settingsStore';
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
  const pollIntervalMs = useSettingsStore((s) => s.pollIntervalMs);

  const [status, setStatus] = useState<RoverStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastAttempts, setLastAttempts] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Prevents state updates if the component unmounts mid-request */
  const mountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    if (!mountedRef.current) return;
    setApiStatus('loading');

    const result = await getRoverStatus();

    if (!mountedRef.current) return;

    setLastAttempts(result.attempts);

    if (result.data) {
      setStatus(result.data);
      setIsConnected(true);
      setError(null);
      setApiStatus('success');
      setLastUpdated(new Date());
    } else {
      setIsConnected(false);
      setError(result.error);
      setApiStatus('error');
    }
  }, []);

  // Start / restart polling whenever the interval setting changes
  useEffect(() => {
    mountedRef.current = true;

    fetchStatus(); // immediate first fetch

    intervalRef.current = setInterval(fetchStatus, pollIntervalMs);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStatus, pollIntervalMs]);

  return {
    status,
    isConnected,
    apiStatus,
    error,
    lastAttempts,
    lastUpdated,
    refetch: fetchStatus,
  };
}
