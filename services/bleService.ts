import { BleManager, Device, Characteristic, BleError } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';
import type { RoverStatus, RoverCommand } from '../types/rover';

// ESP32 BLE Custom UUIDs (Placeholders — ensure ESP32 matches these)
export const ROVER_SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
export const ROVER_RX_CHARACTERISTIC_UUID = '12345678-1234-5678-1234-56789abcdef1'; // write commands to rover
export const ROVER_TX_CHARACTERISTIC_UUID = '12345678-1234-5678-1234-56789abcdef2'; // read telemetry from rover (notify)

export const DEVICE_NAME = 'RoverCargo';

class BleService {
  manager: BleManager;
  connectedDevice: Device | null = null;
  onTelemetryReceived: ((telemetry: RoverStatus) => void) | null = null;
  onDeviceDisconnected: (() => void) | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      if (apiLevel >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true; // iOS handled via Info.plist config plugin
  }

  scanForDevices(onDiscovered: (device: Device) => void) {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('BLE Scan Error:', error);
        return;
      }
      if (device && device.name === DEVICE_NAME) {
        onDiscovered(device);
      }
    });
  }

  stopScan() {
    this.manager.stopDeviceScan();
  }

  async connectToDevice(deviceId: string) {
    this.stopScan();
    try {
      const device = await this.manager.connectToDevice(deviceId);
      this.connectedDevice = device;

      device.onDisconnected((error, disconnectedDevice) => {
        this.connectedDevice = null;
        if (this.onDeviceDisconnected) this.onDeviceDisconnected();
      });

      // Request a higher MTU size because JSON payloads exceed the default 20-byte limit
      if (Platform.OS === 'android') {
        try {
          await device.requestMTU(512);
        } catch (e) {
          console.warn('Failed to negotiate MTU size', e);
        }
      }

      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();

      // Subscribe to telemetry notifications
      device.monitorCharacteristicForService(
        ROVER_SERVICE_UUID,
        ROVER_TX_CHARACTERISTIC_UUID,
        (error: BleError | null, characteristic: Characteristic | null) => {
          if (error) {
            console.error('BLE Telemetry Error:', error);
            return;
          }
          if (characteristic?.value) {
            try {
              const decoded = Buffer.from(characteristic.value, 'base64').toString('utf8');
              const telemetry = JSON.parse(decoded) as RoverStatus;
              if (this.onTelemetryReceived) {
                this.onTelemetryReceived(telemetry);
              }
            } catch (e) {
              console.error('Failed to parse BLE telemetry payload', e);
            }
          }
        }
      );

      return true;
    } catch (error) {
      console.error('BLE Connection Failed', error);
      throw error;
    }
  }

  async sendCommand(command: RoverCommand) {
    if (!this.connectedDevice) throw new Error('Not connected to BLE device');
    const payload = JSON.stringify({ cmd: command });
    const encoded = Buffer.from(payload).toString('base64');

    await this.manager.writeCharacteristicWithResponseForDevice(
      this.connectedDevice.id,
      ROVER_SERVICE_UUID,
      ROVER_RX_CHARACTERISTIC_UUID,
      encoded
    );
  }

  async disconnect() {
    if (this.connectedDevice) {
      await this.manager.cancelDeviceConnection(this.connectedDevice.id);
      this.connectedDevice = null;
    }
  }
}

export const bleService = new BleService();
