import React from 'react';
import { RecommendedStrategyData } from '../../types/negotiation';

interface RecommendedStrategyPanelProps {
  strategy: RecommendedStrategyData;
}

export const RecommendedStrategyPanel: React.FC<RecommendedStrategyPanelProps> = ({
  strategy
}) => {
  return (
    <div className="space-y-3" aria-labelledby="strategy-heading">
      <div className="flex items-baseline justify-between border-b border-[#1E293B]/60 pb-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8]">
            Intelligence Guidance
          </span>
          <h4 id="strategy-heading" className="text-base font-semibold text-[#F8FAFC]">
            Recommended Strategy
          </h4>
        </div>

        <span className="text-[10px] font-mono uppercase text-[#34D399] tracking-wider font-semibold">
          High Confidence
        </span>
      </div>

      {/* Primary strategy headline & explanation */}
      <div className="p-3.5 rounded bg-[#0D1118] border border-[#1E293B]">
        <div className="text-lg font-bold text-[#F8FAFC] tracking-tight leading-snug">
          {strategy.primaryStrategy}
        </div>
        <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
          <strong className="text-[#F8FAFC] font-medium">Why: </strong>
          {strategy.rationale}
        </p>
      </div>

      {/* Tactical Levers List */}
      <div>
        <span className="text-[10px] font-mono uppercase text-[#94A3B8] tracking-wider block mb-1.5">
          Tactical Levers
        </span>
        <div className="space-y-1 text-xs">
          {strategy.supportingTactics.slice(0, 4).map((tactic, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2 rounded bg-[#070A0F] border border-[#1E293B]/60 text-[#F8FAFC]"
            >
              <span className="font-mono text-[10px] text-[#38BDF8] font-bold">
                0{idx + 1}
              </span>
              <span className="text-xs">{tactic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
