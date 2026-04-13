import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link2, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

interface ConnectionManagerProps {
  onConnect: (url: string) => void;
  currentUrl: string;
  isConnected: boolean;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  onConnect,
  currentUrl,
  isConnected,
}) => {
  const [url, setUrl] = useState(currentUrl);

  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isConnected ? 'bg-bms-emerald/20 text-bms-emerald' : 'bg-white/5 text-white/40'}`}>
            <Globe size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Connection Manager</h3>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
              BMS Server Sync Status
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
          isConnected ? 'bg-bms-emerald/10 text-bms-emerald' : 'bg-bms-red/10 text-bms-red'
        }`}>
          {isConnected ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://bms-server.local/api"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-mono focus:outline-none focus:border-bms-emerald/50 transition-colors"
          />
        </div>
        <button
          onClick={() => onConnect(url)}
          className="bg-bms-emerald hover:bg-bms-emerald/80 text-bms-black font-bold px-6 rounded-2xl transition-all active:scale-95"
        >
          Sync
        </button>
      </div>
    </div>
  );
};
