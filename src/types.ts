export interface Telemetry {
  solarVoltage: number;
  packVoltage: number;
  loadPowerWatts: number;
  current: number;
  soc: number;
  anomalyDetected: boolean;
  anomalyDetails?: {
    message: string;
    location: string;
    severity?: 'warning' | 'critical';
  };
}

export interface Appliance {
  id: string;
  name: string;
  type: 'light' | 'air_conditioner' | 'tv' | 'fridge' | 'washing_machine' | 'fan' | 'other';
  power: number;
  isOn: boolean;
}

export interface ConnectionConfig {
  baseUrl: string;
  isConnected: boolean;
}
