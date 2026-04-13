import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface AIAlertProps {
  detected: boolean;
  message?: string;
  location?: string;
  severity?: 'warning' | 'critical';
  onClose?: () => void;
}

export const AIAlert: React.FC<AIAlertProps> = ({
  detected,
  message,
  location,
  severity = 'warning',
  onClose,
}) => {
  if (!detected) return null;

  const isCritical = severity === 'critical';
  const Icon = isCritical ? AlertCircle : AlertTriangle;
  const colorClass = isCritical ? 'text-bms-red border-bms-red/30 bg-bms-red/10' : 'text-bms-amber border-bms-amber/30 bg-bms-amber/10';
  const glowClass = isCritical ? 'glow-red' : 'glow-amber';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative overflow-hidden rounded-[24px] border p-6 backdrop-blur-2xl ${colorClass} ${glowClass}`}
      >
        {/* Animated background pulse */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-current"
        />

        <div className="relative flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white/10">
            <Icon size={24} />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-[0.2em] font-bold">
                AI System Anomaly Detected
              </span>
              {onClose && (
                <button onClick={onClose} className="text-current/50 hover:text-current">
                  <X size={16} />
                </button>
              )}
            </div>
            <h4 className="text-xl font-bold leading-tight">{message}</h4>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-mono opacity-70">
                <Info size={12} />
                <span>Location: {location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono opacity-70">
                <div className={`w-2 h-2 rounded-full bg-current animate-pulse`} />
                <span>Severity: {severity.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
