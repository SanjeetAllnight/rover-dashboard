import type { RoverStatus, RoverCommand, RoverEvent, RoverEventType, RoverState } from '../types/rover';

class MockRover {
  private status: RoverStatus = {
    state: 'IDLE',
    batteryPercent: 100,
    batteryVoltage: 12.6,
    cargoLoaded: false,
    currentTripNumber: 0,
    tripsCompleted: 0,
    missionProgress: 0,
    currentTripStatus: 'Waiting',
    lastTripDuration: 0,
    slopeAngle: 0,
    eventLog: [],
  };

  private tripStartTime: number = 0;
  private interval: ReturnType<typeof setInterval> | null = null;
  private tickCount: number = 0;

  constructor() {
    this.startCycle();
  }

  private addEvent(type: RoverEventType, message?: string) {
    this.status.eventLog = [
      { type, timestamp: Math.floor(Date.now() / 1000), message },
      ...(this.status.eventLog || [])
    ].slice(0, 10); // Keep last 10
  }

  private setState(newState: RoverState) {
    if (this.status.state === newState) return;
    this.status.state = newState;

    switch (newState) {
      case 'DELIVERING':
        if (this.status.state !== 'DELIVERING') {
          // Starting a new trip
          this.tripStartTime = Date.now();
          this.status.currentTripNumber = this.status.tripsCompleted + 1;
        }
        this.status.currentTripStatus = 'Travelling to destination';
        this.addEvent('MISSION_STARTED', `Trip #${this.status.currentTripNumber} started`);
        break;
      case 'UNLOADING':
        this.status.currentTripStatus = 'Arrived at destination';
        this.addEvent('DESTINATION_REACHED');
        // Automatically unload cargo after a bit in mock
        setTimeout(() => {
          this.status.cargoLoaded = false;
          this.addEvent('CARGO_UNLOADED');
        }, 1500);
        break;
      case 'RETURNING':
        this.status.currentTripStatus = 'Returning to base';
        break;
      case 'IDLE':
        if (this.status.currentTripNumber > 0) {
          // Finished trip
          this.status.tripsCompleted++;
          this.status.lastTripDuration = Math.floor((Date.now() - this.tripStartTime) / 1000);
          this.status.currentTripNumber = 0;
          this.addEvent('RETURNED_HOME');
        }
        this.status.currentTripStatus = 'Waiting';
        break;
      case 'STOPPED':
        this.status.currentTripStatus = 'Manual override engaged';
        this.addEvent('MISSION_ABORTED', 'Stopped manually');
        break;
      case 'ERROR':
        this.status.currentTripStatus = 'Error encountered';
        this.addEvent('ERROR_DETECTED', 'Simulated error');
        break;
    }
  }

  private startCycle() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.tick(), 1000);
  }

  private stopCycle() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  private tick() {
    this.tickCount++;

    // Slowly drain battery
    if (this.tickCount % 5 === 0) {
      this.status.batteryPercent = Math.max(0, this.status.batteryPercent - 0.5);
      this.status.batteryVoltage = 10.0 + (this.status.batteryPercent / 100) * 2.6;
    }

    // Auto-cycle logic
    if (this.interval) {
      switch (this.status.state) {
        case 'IDLE':
          if (this.tickCount % 4 === 0) {
            this.status.cargoLoaded = true;
            this.status.missionProgress = 0;
            this.setState('DELIVERING');
          }
          break;
        case 'DELIVERING':
          this.status.missionProgress = Math.min(100, this.status.missionProgress + 20);
          if (this.status.missionProgress >= 100) {
            this.setState('UNLOADING');
          }
          break;
        case 'UNLOADING':
          if (this.tickCount % 3 === 0) {
            this.status.missionProgress = 0;
            this.setState('RETURNING');
          }
          break;
        case 'RETURNING':
          this.status.missionProgress = Math.min(100, this.status.missionProgress + 25);
          if (this.status.missionProgress >= 100) {
            this.setState('IDLE');
          }
          break;
      }
    }
  }

  public getStatus(): RoverStatus {
    return { ...this.status, eventLog: [...(this.status.eventLog || [])] };
  }

  public handleCommand(cmd: RoverCommand) {
    switch (cmd) {
      case 'START_MISSION':
      case 'FORWARD':
      case 'BACKWARD':
      case 'LEFT':
      case 'RIGHT':
        this.status.cargoLoaded = true;
        this.setState('DELIVERING');
        this.startCycle(); // ensure cycle is running
        break;
      case 'STOP':
      case 'STOP_MISSION':
        this.stopCycle();
        this.setState('STOPPED');
        break;
      case 'OPEN_TRAP':
        this.status.cargoLoaded = false;
        this.addEvent('CARGO_UNLOADED', 'Manual unload');
        break;
      case 'CLOSE_TRAP':
        this.status.cargoLoaded = true;
        break;
    }
  }
}

export const mockRover = new MockRover();
