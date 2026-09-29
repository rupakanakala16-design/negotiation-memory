import React from 'react';
import { HindsightReflectionData } from '../../types/negotiation';

interface HindsightReflectionPanelProps {
  reflection: HindsightReflectionData;
}

export const HindsightReflectionPanel: React.FC<HindsightReflectionPanelProps> = ({
  reflection
}) => {
  return (
    <div className="space-y-3" aria-labelledby="reflection-heading">
      <div className="flex items-baseline justify-between border-b border-[#1E293B]/60 pb-2">
        <div className="flex items-center gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6366F1]">
              Pattern Synthesis
            </span>
            <h4 id="reflection-heading" className="text-base font-semibold text-[#F8FAFC]">
              Hindsight Reflection
            </h4>
          </div>
        </div>

        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#121923] text-[#6366F1] border border-[#6366F1]/30 font-medium">
          HINDSIGHT EVIDENCE
        </span>
      </div>

      {/* Synthesis Reasoning Quote */}
      <div className="p-3.5 rounded bg-[#0D1118] border border-[#1E293B] space-y-2">
        <div className="text-[10px] font-mono uppercase text-[#94A3B8] flex items-center justify-between">
          <span>Synthesized Institutional Insight</span>
          <span className="text-xs font-mono text-[#F8FAFC]">
            {reflection.memoriesConsideredCount} memories · {reflection.conditionAlignedCount} aligned
          </span>
        </div>

        <blockquote className="text-xs text-[#F8FAFC] leading-relaxed italic border-l-2 border-[#6366F1] pl-3 py-0.5">
          "{reflection.coreReasoning}"
        </blockquote>

        {/* Evidence bullet points */}
        <div className="space-y-1.5 pt-2 border-t border-[#1E293B]/50 text-xs text-[#94A3B8]">
          {reflection.evidenceNotes.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#6366F1] font-mono text-[11px] leading-tight select-none">
                ›
              </span>
              <span className="leading-snug text-[11px]">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
