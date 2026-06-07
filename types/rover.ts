// ─── Rover state ────────────────────────────────────────────────────────────

export type RoverState =
  | 'IDLE'
  | 'DELIVERING'
  | 'UNLOADING'
  | 'RETURNING'
  | 'STOPPED'
  | 'ERROR'
  // legacy states kept for backwards compat with older firmware
  | 'RUNNING'
  | 'PAUSED';

// ─── Rover command ───────────────────────────────────────────────────────────

export type RoverCommand = 
  | 'FORWARD' 
  | 'BACKWARD' 
  | 'LEFT' 
  | 'RIGHT' 
  | 'STOP' 
  | 'START_MISSION' 
  | 'STOP_MISSION' 
  | 'OPEN_TRAP' 
  | 'CLOSE_TRAP';

// ─── Event log entry ─────────────────────────────────────────────────────────

export type RoverEventType =
  | 'MISSION_STARTED'
  | 'DESTINATION_REACHED'
  | 'CARGO_UNLOADED'
  | 'RETURNED_HOME'
  | 'MISSION_ABORTED'
  | 'ERROR_DETECTED';

export interface RoverEvent {
  type: RoverEventType;
  /** Unix timestamp in seconds */
  timestamp: number;
  /** Optional human-readable message */
  message?: string;
}

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
  /** Current trip number (trip in progress, 0 if idle) */
  currentTripNumber: number;
  /** Total number of completed trips */
  tripsCompleted: number;
  /** Progress of current mission 0-100 */
  missionProgress: number;
  /** Human-readable status of the active trip (legacy field from ESP32) */
  currentTripStatus: string;
  /** Duration of the last completed trip in seconds */
  lastTripDuration: number;
  /** Current slope angle in degrees (from IMU) */
  slopeAngle: number;
  /**
   * Recent event log entries (newest first).
   * Optional — older firmware may not send this field.
   */
  eventLog?: RoverEvent[];
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
