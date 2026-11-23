/** Pure state model for a browser-only, illustrative dam gate. No hardware is connected. */
export const GATE_TRAVEL_DURATION_MS = 10_000;

export type GateDirection = 'opening' | 'closing' | null;
export type GateStopReason = 'ready' | 'none' | 'operator' | 'upper-limit' | 'lower-limit' | 'emergency' | 'reset' | 'tab-hidden';
export interface GateState {
  readonly position: number;
  readonly direction: GateDirection;
  readonly emergencyStopped: boolean;
  readonly stopReason: GateStopReason;
}
export type GateCommand =
  | { type: 'open' | 'close' | 'stop' | 'emergency-stop' | 'reset' | 'suspend' }
  | { type: 'advance'; elapsedMs: number };

export function createGateState(position = 0): GateState {
  return { position: Number.isFinite(position) ? Math.max(0, Math.min(100, position)) : 0, direction: null, emergencyStopped: false, stopReason: 'ready' };
}

/** Commands and elapsed time are the only inputs; every visual derives from this state. */
export function gateReducer(state: GateState, command: GateCommand): GateState {
  switch (command.type) {
    case 'emergency-stop':
      return state.emergencyStopped ? state : { ...state, direction: null, emergencyStopped: true, stopReason: 'emergency' };
    case 'reset':
      // Reset acknowledges the latch. It never moves the gate or resumes an old command.
      return { ...state, direction: null, emergencyStopped: false, stopReason: 'reset' };
    case 'stop':
      return state.emergencyStopped ? state : { ...state, direction: null, stopReason: 'operator' };
    case 'suspend':
      return state.direction ? { ...state, direction: null, stopReason: 'tab-hidden' } : state;
    case 'open':
      if (state.emergencyStopped) return state;
      if (state.position >= 100) return { ...state, direction: null, stopReason: 'upper-limit' };
      return state.direction === 'opening' ? state : { ...state, direction: 'opening', stopReason: 'none' };
    case 'close':
      if (state.emergencyStopped) return state;
      if (state.position <= 0) return { ...state, direction: null, stopReason: 'lower-limit' };
      return state.direction === 'closing' ? state : { ...state, direction: 'closing', stopReason: 'none' };
    case 'advance': {
      if (!state.direction || state.emergencyStopped || !Number.isFinite(command.elapsedMs) || command.elapsedMs <= 0) return state;
      const delta = command.elapsedMs * 100 / GATE_TRAVEL_DURATION_MS;
      const position = Math.max(0, Math.min(100, state.position + (state.direction === 'opening' ? delta : -delta)));
      if (position === 100) return { ...state, position, direction: null, stopReason: 'upper-limit' };
      if (position === 0) return { ...state, position, direction: null, stopReason: 'lower-limit' };
      return { ...state, position };
    }
  }
}

export function gateIndicators(state: GateState) {
  const opening = state.direction === 'opening' && !state.emergencyStopped;
  const closing = state.direction === 'closing' && !state.emergencyStopped;
  const fullyOpen = state.position === 100;
  const fullyClosed = state.position === 0;
  return {
    powerOn: true,
    opening,
    closing,
    motorRunning: opening || closing,
    fullyOpen,
    fullyClosed,
    emergencyStopped: state.emergencyStopped,
    gateStatus: opening ? 'Opening' : closing ? 'Closing' : fullyOpen ? 'Open' : fullyClosed ? 'Closed' : 'Stopped',
  } as const;
}

export function gateAnnouncement(state: GateState): string {
  if (state.emergencyStopped) return 'Emergency Stop is latched. All simulated motion is stopped. Select Reset before issuing a new movement command.';
  if (state.direction === 'opening') return 'Opening the gate. The motor will stop automatically at the fully open limit.';
  if (state.direction === 'closing') return 'Closing the gate. The motor will stop automatically at the fully closed limit.';
  if (state.stopReason === 'tab-hidden') return 'Movement paused because this tab was hidden. Select Open or Close to continue.';
  if (state.stopReason === 'reset') return `Reset complete. The gate remains at ${Math.round(state.position)}%. Select Open or Close to move it.`;
  if (state.stopReason === 'operator') return `Gate stopped at ${Math.round(state.position)}%. Select Open or Close to continue.`;
  if (state.position === 100) return 'Fully open limit reached. The motor has stopped automatically.';
  if (state.position === 0) return 'Gate fully closed. The closed limit is active. Select Open to begin.';
  return 'Gate ready. Select Open or Close to begin.';
}
