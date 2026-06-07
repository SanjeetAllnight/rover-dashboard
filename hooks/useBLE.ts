import { useState, useCallback } from 'react';
import { Device } from 'react-native-ble-plx';
import { bleService } from '../services/bleService';
import { useConnectionStore } from '../store/connectionStore';

export function useBLE() {
  const { status, error, connectBle, disconnect } = useConnectionStore();
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);

  const startScan = useCallback(async () => {
    setScanError(null);
    setDiscoveredDevices([]);
    
    const hasPermission = await bleService.requestPermissions();
    if (!hasPermission) {
      setScanError('Bluetooth permissions denied.');
      return;
    }

    setIsScanning(true);
    bleService.scanForDevices((device) => {
      setDiscoveredDevices((prev) => {
        if (prev.find((d) => d.id === device.id)) return prev;
        return [...prev, device];
      });
    });

    setTimeout(() => {
      bleService.stopScan();
      setIsScanning(false);
    }, 10000);
  }, []);

  const stopScan = useCallback(() => {
    bleService.stopScan();
    setIsScanning(false);
  }, []);

  const connectToDevice = useCallback(async (deviceId: string) => {
    stopScan();
    await connectBle(deviceId);
  }, [connectBle, stopScan]);

  return {
    isScanning,
    discoveredDevices,
    scanError,
    connectionStatus: status,
    connectionError: error,
    startScan,
    stopScan,
    connectToDevice,
    disconnect
  };
}
