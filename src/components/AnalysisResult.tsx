import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { URLAnalysis, RiskIndicator } from '../types';
import { getRecommendedAction } from '../utils/scoring';

interface AnalysisResultProps {
  analysis: URLAnalysis | null;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="flex flex-col gap-2">
      {analysis.indicators.length === 0 ? (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>No suspicious patterns detected on this address.</span>
        </div>
      ) : (
        analysis.indicators.map((indicator: RiskIndicator, index: number) => (
          <div key={`${indicator.id}-${index}`} className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">{indicator.title}</span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium">
                {indicator.severity}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">{indicator.description}</p>
            <code className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-1 py-0.5 rounded truncate">
              {indicator.evidence}
            </code>
          </div>
        ))
      )}
      <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-white/5 text-[11px] text-zinc-400">
        {getRecommendedAction(analysis.riskLevel)}
      </div>
    </div>
  );
};
