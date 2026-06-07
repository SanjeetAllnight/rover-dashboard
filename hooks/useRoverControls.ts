import { useState, useCallback } from 'react';
import { sendCommand } from '../services/roverApi';
import type { RoverCommand, ApiStatus } from '../types/rover';

export interface CommandState {
  status: ApiStatus;
  error: string | null;
  /** Attempts used for the last command (useful for debugging) */
  attempts: number;
}

const INITIAL_STATE: CommandState = {
  status: 'idle',
  error: null,
  attempts: 0,
};

export interface UseRoverControlsReturn {
  commandState: CommandState;
  /** True while any command is in-flight */
  isSending: boolean;
  executeCommand: (action: RoverCommand) => Promise<void>;
  startRover: () => Promise<void>;
  stopRover: () => Promise<void>;
  unloadCargo: () => Promise<void>;
  /** Reset error / status back to idle (e.g. after dismissing an error snackbar) */
  clearCommandState: () => void;
}

export function useRoverControls(): UseRoverControlsReturn {
  const [commandState, setCommandState] = useState<CommandState>(INITIAL_STATE);

  const execute = useCallback(async (action: RoverCommand) => {
    setCommandState({ status: 'loading', error: null, attempts: 0 });

    const result = await sendCommand(action);

    if (result.data?.ok) {
      setCommandState({
        status: 'success',
        error: null,
        attempts: result.attempts,
      });
    } else {
      setCommandState({
        status: 'error',
        error: result.error ?? 'Command failed',
        attempts: result.attempts,
      });
    }
  }, []);

  const clearCommandState = useCallback(() => {
    setCommandState(INITIAL_STATE);
  }, []);

  return {
    commandState,
    isSending: commandState.status === 'loading',
    executeCommand: execute,
    startRover: () => execute('start'),
    stopRover: () => execute('stop'),
    unloadCargo: () => execute('unload'),
    clearCommandState,
  };
}
