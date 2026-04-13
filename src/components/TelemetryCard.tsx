import React from 'react';
import { motion } from 'motion/react';
import { Zap, Battery, Activity, Sun } from 'lucide-react';

interface TelemetryCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  color = 'text-bms-emerald',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-xs font-mono uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-xl bg-white/5 ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold font-mono tracking-tighter">{value}</span>
        <span className="text-white/30 text-sm font-mono">{unit}</span>
      </div>
    </motion.div>
  );
};

export const BatteryStatus: React.FC<{ soc: number; current: number }> = ({ soc, current }) => {
  const isCharging = current < 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden"
    >
      {/* Background Pulse */}
      <div className={`absolute inset-0 opacity-5 transition-colors duration-500 ${isCharging ? 'bg-bms-emerald' : 'bg-bms-amber'}`} />
      
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/5"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={364.4}
            initial={{ strokeDashoffset: 364.4 }}
            animate={{ strokeDashoffset: 364.4 - (364.4 * soc) / 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={soc > 20 ? 'text-bms-emerald' : 'text-bms-red'}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold font-mono">{soc}%</span>
          <span className="text-[10px] text-white/40 uppercase font-mono">Capacity</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Battery className={isCharging ? 'text-bms-emerald animate-pulse' : 'text-white/60'} size={16} />
          <span className="text-sm font-medium uppercase tracking-widest">
            {isCharging ? 'Charging' : 'Discharging'}
          </span>
        </div>
        <span className="text-xs text-white/40 font-mono">
          {Math.abs(current).toFixed(2)} Amps
        </span>
      </div>
    </motion.div>
  );
};
