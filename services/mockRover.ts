import type { RoverStatus, RoverCommand, RoverEvent, RoverEventType, RoverState } from '../types/rover';

class MockRover {
  private status: RoverStatus = {
    state: 'IDLE',
    batteryPercent: 100,
    batteryVoltage: 12.6,
    cargoLoaded: false,
    currentTripNumber: 0,
    tripsCompleted: 0,
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
          // Wait a few seconds then start delivery if we have cargo
          if (this.tickCount % 4 === 0) {
            this.status.cargoLoaded = true;
            this.setState('DELIVERING');
          }
          break;
        case 'DELIVERING':
          if (this.tickCount % 5 === 0) this.setState('UNLOADING');
          break;
        case 'UNLOADING':
          if (this.tickCount % 3 === 0) this.setState('RETURNING');
          break;
        case 'RETURNING':
          if (this.tickCount % 5 === 0) this.setState('IDLE');
          break;
      }
    }
  }

  public getStatus(): RoverStatus {
    return { ...this.status, eventLog: [...(this.status.eventLog || [])] };
  }

  public handleCommand(cmd: RoverCommand) {
    switch (cmd) {
      case 'start':
      case 'forward':
      case 'reverse':
      case 'left':
      case 'right':
        this.status.cargoLoaded = true;
        this.setState('DELIVERING');
        this.startCycle(); // ensure cycle is running
        break;
      case 'stop':
      case 'emergencyStop':
        this.stopCycle();
        this.setState('STOPPED');
        break;
      case 'unload':
        this.status.cargoLoaded = false;
        this.addEvent('CARGO_UNLOADED', 'Manual unload');
        break;
      case 'closeTrap':
        this.status.cargoLoaded = true;
        break;
    }
  }
}

export const mockRover = new MockRover();
