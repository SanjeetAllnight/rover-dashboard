// ─── Rover state ────────────────────────────────────────────────────────────

export type RoverState =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'UNLOADING'
  | 'ERROR'
  | 'STOPPED';

// ─── Rover command ───────────────────────────────────────────────────────────

export type RoverCommand = 'start' | 'stop' | 'unload';

// ─── /status response ────────────────────────────────────────────────────────

export interface RoverStatus {
  /** Operational state of the rover */
  state: RoverState;
  /** Battery level 0-100 */
  batteryPercent: number;
  /** Battery voltage in volts */
  batteryVoltage: number;
  /** Whether cargo is currently loaded */
  cargoLoaded: boolean;
  /** Total number of completed trips */
  tripsCompleted: number;
  /** Human-readable status of the active trip */
  currentTripStatus: string;
  /** Duration of the last completed trip in seconds */
  lastTripDuration: number;
  /** Current slope angle in degrees (from IMU) */
  slopeAngle: number;
}

// ─── Generic API result ──────────────────────────────────────────────────────

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status: ApiStatus;
  /** How many retry attempts were made before success/failure */
  attempts: number;
}

// ─── Command result ───────────────────────────────────────────────────────────

export interface CommandResult {
  ok: boolean;
}
