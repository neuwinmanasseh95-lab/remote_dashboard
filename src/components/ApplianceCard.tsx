import React from 'react';
import { motion } from 'motion/react';
import { Lightbulb, Wind, Tv, Refrigerator, Power, MoreHorizontal, Fan, WashingMachine } from 'lucide-react';
import { Appliance } from '../types';

interface ApplianceCardProps {
  appliance: Appliance;
  onToggle: (id: string) => void;
}

const iconMap = {
  light: Lightbulb,
  air_conditioner: Wind,
  tv: Tv,
  fridge: Refrigerator,
  washing_machine: WashingMachine,
  fan: Fan,
  other: MoreHorizontal,
};

export const ApplianceCard: React.FC<ApplianceCardProps> = ({ appliance, onToggle }) => {
  const Icon = iconMap[appliance.type] || iconMap.other;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`glass-card p-4 flex items-center gap-4 transition-all duration-300 border-2 ${
        appliance.isOn 
          ? 'bg-bms-emerald/5 border-bms-emerald/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
          : 'bg-white/5 border-white/5 opacity-60'
      }`}
    >
      <div className={`p-3 rounded-xl flex-shrink-0 ${
        appliance.isOn ? 'bg-bms-emerald/20 text-bms-emerald' : 'bg-white/5 text-white/20'
      }`}>
        <Icon size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={`font-bold text-sm truncate uppercase tracking-tight ${
          appliance.isOn ? 'text-bms-emerald' : 'text-white/40'
        }`}>
          {appliance.name}
        </h3>
        <span className="text-[10px] font-mono text-white/30 uppercase">
          {appliance.power}W
        </span>
      </div>

      <button
        onClick={() => onToggle(appliance.id)}
        className={`p-2 rounded-lg transition-all ${
          appliance.isOn 
            ? 'text-bms-emerald bg-bms-emerald/10 hover:bg-bms-emerald/20' 
            : 'text-white/20 hover:bg-white/10'
        }`}
      >
        <Power size={18} />
      </button>
    </motion.div>
  );
};
