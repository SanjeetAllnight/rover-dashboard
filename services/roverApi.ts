import type {
  RoverStatus,
  RoverCommand,
  ApiResult,
  CommandResult,
  ApiStatus,
} from '../types/rover';
import { useSettingsStore } from '../store/settingsStore';
import { mockRover } from './mockRover';

// ─── Base URL ─────────────────────────────────────────────────────────────────

let _baseUrl = 'http://192.168.1.100'; // overridden at runtime by settingsStore

export function setBaseUrl(url: string): void {
  _baseUrl = url.replace(/\/$/, ''); // strip trailing slash
}

export function getBaseUrl(): string {
  return _baseUrl;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 5_000;
const MAX_RETRIES = 3;
/**
 * Back-off delays between retry attempts (ms).
 * Attempt 1 → 500 ms, Attempt 2 → 1 000 ms, Attempt 3 → 2 000 ms
 */
const BACKOFF_DELAYS = [500, 1_000, 2_000] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Classify an error to decide whether to retry.
 * We retry on network/timeout errors but NOT on 4xx/5xx HTTP responses
 * (those are deterministic failures from the device).
 *
 * NOTE: React Native (Hermes/JSC) does not expose DOMException.
 * AbortController throws a plain Error with name === 'AbortError'.
 */
function isRetryableError(err: unknown): boolean {
  if (err instanceof Error && err.name === 'AbortError') return true; // timeout
  if (err instanceof TypeError) return true; // network unreachable
  return false;
}

/** Wraps fetch with a per-request AbortController timeout. */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Core retry wrapper. Executes `fn` up to `maxRetries` times, waiting
 * with exponential back-off between attempts.
 *
 * @returns The raw Response on success, or throws the last error.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = MAX_RETRIES,
): Promise<{ response: Response; attempts: number }> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);
      return { response, attempts: attempt };
    } catch (err) {
      lastError = err;

      const isLastAttempt = attempt === maxRetries;
      if (isLastAttempt || !isRetryableError(err)) {
        throw err;
      }

      const delay = BACKOFF_DELAYS[attempt] ?? BACKOFF_DELAYS[BACKOFF_DELAYS.length - 1];
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs a return/throw
  throw lastError;
}

/** Converts a caught error to a human-readable string. */
function toErrorMessage(err: unknown): string {
  // React Native does not have DOMException — AbortController throws a plain
  // Error with name === 'AbortError' on both Hermes and JSC engines.
  if (err instanceof Error && err.name === 'AbortError') {
    return `Request timed out after ${DEFAULT_TIMEOUT_MS / 1000}s`;
  }
  if (err instanceof TypeError) {
    return `Network unreachable — check rover IP and WiFi`;
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

/** Builds a failed ApiResult with contextual metadata. */
function failResult<T>(
  err: unknown,
  attempts: number,
  override?: string,
): ApiResult<T> {
  return {
    data: null,
    error: override ?? toErrorMessage(err),
    status: 'error' as ApiStatus,
    attempts,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * GET /status
 *
 * Fetches the current rover telemetry. Retries up to MAX_RETRIES times on
 * network / timeout failures with exponential back-off.
 */
export async function getRoverStatus(): Promise<ApiResult<RoverStatus>> {
  const isMock = useSettingsStore.getState().mockMode;
  if (isMock) {
    await sleep(200); // simulate network delay
    return { data: mockRover.getStatus(), error: null, status: 'success', attempts: 1 };
  }

  let attempts = 0;

  try {
    const { response, attempts: a } = await fetchWithRetry(`${_baseUrl}/status`);
    attempts = a;

    if (!response.ok) {
      return failResult(null, attempts, `HTTP ${response.status} ${response.statusText}`);
    }

    const data: RoverStatus = await response.json();
    return { data, error: null, status: 'success', attempts };
  } catch (err) {
    return failResult<RoverStatus>(err, attempts);
  }
}

/**
 * POST /{command}
 *
 * Sends a control command to the rover. Commands are fire-and-confirm: we
 * wait for an HTTP 200 before resolving. Retried only on network failures.
 *
 * @param command - 'start' | 'stop' | 'unload'
 */
export async function sendCommand(
  command: RoverCommand,
): Promise<ApiResult<CommandResult>> {
  const isMock = useSettingsStore.getState().mockMode;
  if (isMock) {
    await sleep(200);
    mockRover.handleCommand(command);
    return { data: { ok: true }, error: null, status: 'success', attempts: 1 };
  }

  let attempts = 0;

  try {
    const { response, attempts: a } = await fetchWithRetry(
      `${_baseUrl}/${command}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    attempts = a;

    if (!response.ok) {
      return failResult<CommandResult>(
        null,
        attempts,
        `HTTP ${response.status} — rover rejected "${command}"`,
      );
    }

    return { data: { ok: true }, error: null, status: 'success', attempts };
  } catch (err) {
    return failResult<CommandResult>(err, attempts);
  }
}

/**
 * Convenience re-exports so callers never need to import from two files.
 */
export type { RoverStatus, RoverCommand, ApiResult, CommandResult };
