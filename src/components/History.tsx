import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ScanHistory } from '../types';

interface HistoryProps {
  onClearHistory: () => void;
}

export const History: React.FC<HistoryProps> = ({ onClearHistory }) => {
  const [history, setHistory] = useState<ScanHistory[]>([]);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
    chrome.storage.local.get(['scanHistory'], (result: { scanHistory?: ScanHistory[] }) =>
      setHistory(result.scanHistory || [])
    );
  }, []);

  const formatDate = (timestamp: number) => {
    const elapsedMinutes = Math.floor((Date.now() - timestamp) / 60000);
    if (elapsedMinutes < 1) return 'Just now';
    if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `${elapsedHours}h ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleClear = () => {
    setHistory([]);
    onClearHistory();
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-[#8b949e] gap-1">
        <span className="text-xs font-semibold text-[#f0f6fc]">No scan records</span>
        <span className="text-[10px]">Visited domains analyzed by the engine will appear here</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between pb-1">
        <span className="text-[10px] font-semibold text-[#8b949e]">
          Total entries ({history.length})
        </span>
        <button
          onClick={handleClear}
          className="text-[10px] text-[#8b949e] hover:text-[#f85149] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Purge</span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-0.5">
        {history.slice(0, 10).map((item: ScanHistory, index: number) => {
          const isSafe = item.riskLevel === 'safe';
          const isHigh = item.riskLevel === 'high' || item.riskLevel === 'critical';

          return (
            <div
              key={`${item.timestamp}-${index}`}
              className="p-2 rounded bg-[#161b22] border border-[#30363d] flex items-center justify-between gap-2 hover:border-[#8b949e] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isSafe ? 'bg-[#3fb950]' : isHigh ? 'bg-[#f85149]' : 'bg-[#d29922]'
                  }`}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#f0f6fc] truncate max-w-[190px]" title={item.url}>
                    {item.url.replace(/^https?:\/\//i, '').replace(/\/$/, '')}
                  </span>
                  <span className="text-[10px] text-[#8b949e]">
                    {item.indicators} flag(s) · {formatDate(item.timestamp)}
                  </span>
                </div>
              </div>

              <span
                className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded border ${
                  isSafe
                    ? 'bg-[#238636]/10 text-[#3fb950] border-[#238636]/30'
                    : isHigh
                    ? 'bg-[#da3633]/10 text-[#f85149] border-[#da3633]/30'
                    : 'bg-[#9e6a03]/10 text-[#d29922] border-[#9e6a03]/30'
                }`}
              >
                {item.riskLevel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
