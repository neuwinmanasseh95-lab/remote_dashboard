import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Sun, 
  Battery as BatteryIcon, 
  Activity, 
  LayoutDashboard, 
  Settings, 
  Cpu,
  RefreshCcw,
  Clock,
  BatteryMedium
} from 'lucide-react';
import { Telemetry, Appliance, ConnectionConfig } from './types';
import { TelemetryCard, BatteryStatus } from './components/TelemetryCard';
import { PowerSankey } from './components/PowerSankey';
import { ApplianceCard } from './components/ApplianceCard';
import { AIAlert } from './components/AIAlert';
import { ConnectionManager } from './components/ConnectionManager';

const MOCK_TELEMETRY: Telemetry = {
  solarVoltage: 312.4,
  packVoltage: 374.2,
  loadPowerWatts: 2660,
  current: -7.2, // Charging
  soc: 85,
  anomalyDetected: false,
  anomalyDetails: {
    message: "Voltage spike detected in Cell 4",
    location: "Battery Pack A",
    severity: "warning"
  }
};

const MOCK_APPLIANCES: Appliance[] = [
  { id: 'app1', name: 'Living Room Light', type: 'light', power: 40, isOn: true },
  { id: 'app2', name: 'Smart TV', type: 'tv', power: 150, isOn: true },
  { id: 'app3', name: 'Air Conditioner', type: 'air_conditioner', power: 1500, isOn: true },
  { id: 'app4', name: 'Refrigerator', type: 'fridge', power: 200, isOn: true },
  { id: 'app5', name: 'Kitchen Light', type: 'light', power: 40, isOn: true },
  { id: 'app6', name: 'Washing Machine', type: 'washing_machine', power: 500, isOn: true },
  { id: 'app7', name: 'Ceiling Fan', type: 'fan', power: 75, isOn: true },
  { id: 'app8', name: 'Fan 3', type: 'fan', power: 75, isOn: true },
  { id: 'app9', name: 'Light 8', type: 'light', power: 40, isOn: true },
  { id: 'app10', name: 'Light 9', type: 'light', power: 40, isOn: true },
];

export default function App() {
  const [config, setConfig] = useState<ConnectionConfig>(() => {
    const saved = localStorage.getItem('bms_config');
    return saved ? JSON.parse(saved) : { baseUrl: '', isConnected: false };
  });

  const [telemetry, setTelemetry] = useState<Telemetry>(MOCK_TELEMETRY);
  const [appliances, setAppliances] = useState<Appliance[]>(MOCK_APPLIANCES);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const totalPower = useMemo(() => {
    return appliances.reduce((acc, app) => acc + (app.isOn ? app.power : 0), 0);
  }, [appliances]);

  const fetchData = useCallback(async () => {
    if (!config.baseUrl) return;

    setIsSyncing(true);
    try {
      const [telRes, appRes] = await Promise.all([
        fetch(`${config.baseUrl}/telemetry`),
        fetch(`${config.baseUrl}/appliances`)
      ]);

      if (telRes.ok && appRes.ok) {
        const telData = await telRes.json();
        const appData = await appRes.json();
        setTelemetry(telData);
        setAppliances(appData);
        setLastUpdate(new Date());
        if (!config.isConnected) setConfig(prev => ({ ...prev, isConnected: true }));
      } else {
        throw new Error('Server response error');
      }
    } catch (error) {
      console.error('Fetch failed:', error);
      if (config.isConnected) setConfig(prev => ({ ...prev, isConnected: false }));
    } finally {
      setIsSyncing(false);
    }
  }, [config.baseUrl, config.isConnected]);

  // Polling
  useEffect(() => {
    if (config.baseUrl) {
      const interval = setInterval(fetchData, 2000);
      return () => clearInterval(interval);
    }
  }, [config.baseUrl, fetchData]);

  const handleToggleAppliance = async (id: string) => {
    const appliance = appliances.find(a => a.id === id);
    if (!appliance) return;

    // Optimistic update
    const newStatus = !appliance.isOn;
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, isOn: newStatus } : a));

    if (config.baseUrl) {
      try {
        await fetch(`${config.baseUrl}/appliances`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isOn: newStatus })
        });
      } catch (error) {
        console.error('Toggle failed:', error);
        // Revert on failure
        setAppliances(prev => prev.map(a => a.id === id ? { ...a, isOn: !newStatus } : a));
      }
    }
  };

  const handleConnect = (url: string) => {
    const newConfig = { baseUrl: url, isConnected: false };
    setConfig(newConfig);
    localStorage.setItem('bms_config', JSON.stringify(newConfig));
  };

  const solarPower = telemetry.solarVoltage * 2; 
  const batteryPower = telemetry.current * telemetry.packVoltage;

  return (
    <div className="min-h-screen p-6 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-bms-emerald rounded-2xl flex items-center justify-center shadow-lg shadow-bms-emerald/20">
            <Cpu className="text-bms-black" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BMS Remote Command Center</h1>
            <div className="flex items-center gap-2 text-white/40 font-mono text-[10px] uppercase tracking-widest">
              <Activity size={12} className="text-bms-emerald" />
              <span>Real-time Telemetry Active</span>
              <span className="mx-1">•</span>
              <RefreshCcw size={10} className={isSyncing ? 'animate-spin' : ''} />
              <span>Last sync: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <LayoutDashboard size={20} />
          </button>
          <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Summary Header (Matching Image) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10"
      >
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/10">
            <Zap size={32} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono text-white/40 uppercase tracking-[0.2em]">Total Power Consumption</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-mono tracking-tighter">{totalPower}</span>
              <span className="text-2xl font-bold text-orange-500 font-mono">W</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pl-0 md:pl-8 pt-8 md:pt-0">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-white/40 uppercase tracking-[0.2em]">Pack Estimated Time</span>
            <div className="flex items-center gap-4 mt-1">
              <Clock className="text-bms-emerald" size={24} />
              <span className="text-4xl font-bold font-mono text-bms-emerald tracking-tight">0h 51m</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-bms-emerald/10 flex items-center justify-center text-bms-emerald border border-bms-emerald/20">
            <BatteryMedium size={32} />
          </div>
        </div>
      </motion.div>

      {/* AI Alert Section */}
      <AnimatePresence>
        {telemetry.anomalyDetected && (
          <AIAlert
            detected={telemetry.anomalyDetected}
            message={telemetry.anomalyDetails?.message}
            location={telemetry.anomalyDetails?.location}
            severity={telemetry.anomalyDetails?.severity}
            onClose={() => setTelemetry(prev => ({ ...prev, anomalyDetected: false }))}
          />
        )}
      </AnimatePresence>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Telemetry & Flow */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TelemetryCard
              label="Solar Input"
              value={telemetry.solarVoltage.toFixed(1)}
              unit="V"
              icon={Sun}
              color="text-yellow-400"
            />
            <TelemetryCard
              label="Pack Voltage"
              value={telemetry.packVoltage.toFixed(1)}
              unit="V"
              icon={BatteryIcon}
              color="text-bms-emerald"
            />
            <TelemetryCard
              label="Current"
              value={telemetry.current.toFixed(2)}
              unit="A"
              icon={Activity}
              color="text-blue-400"
            />
          </div>

          {/* Energy Flow Visualization */}
          <div className="glass-card p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Energy Distribution Flow</h2>
                <p className="text-xs text-white/40 font-mono uppercase tracking-wider mt-1">
                  Live Power Vector Analysis
                </p>
              </div>
            </div>
            
            <div className="h-[350px] w-full bg-white/[0.02] rounded-3xl border border-white/5 p-4">
              <PowerSankey
                solarPower={solarPower}
                batteryPower={batteryPower}
                loadPower={totalPower}
                height={300}
              />
            </div>
          </div>

          {/* Connection Manager */}
          <ConnectionManager
            onConnect={handleConnect}
            currentUrl={config.baseUrl}
            isConnected={config.isConnected}
          />
        </div>

        {/* Right Column: Battery & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <BatteryStatus soc={telemetry.soc} current={telemetry.current} />

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Smart Home Nodes</h2>
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                {appliances.filter(a => a.isOn).length} Active
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {appliances.map(appliance => (
                <ApplianceCard
                  key={appliance.id}
                  appliance={appliance}
                  onToggle={handleToggleAppliance}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/20 text-[10px] font-mono uppercase tracking-[0.2em]">
        <div className="flex items-center gap-4">
          <span>System Version 2.4.0-Stable</span>
          <span>•</span>
          <span>Encrypted Tunnel Active</span>
        </div>
        <div className="flex items-center gap-4">
          <span>&copy; 2026 BMS Command Center</span>
        </div>
      </footer>
    </div>
  );
}
