import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HumanDecisionAction, NegotiationContext } from '../../types/negotiation';

interface RetainOutcomePanelProps {
  decision: HumanDecisionAction;
  finalTactic: string;
  notes: string;
  scenario: NegotiationContext;
  isRetained: boolean;
  onRetainToHindsight: (notes: string) => void;
  onResetCase: () => void;
}

export const RetainOutcomePanel: React.FC<RetainOutcomePanelProps> = ({
  decision,
  finalTactic,
  notes,
  scenario,
  isRetained,
  onRetainToHindsight,
  onResetCase
}) => {
  const [directorNotes, setDirectorNotes] = useState(notes || '');

  useEffect(() => {
    if (notes) setDirectorNotes(notes);
  }, [notes]);

  const hasDecided = decision !== 'PENDING';

  return (
    <div className="space-y-3" aria-labelledby="retain-outcome-title">
      <div className="flex items-baseline justify-between border-b border-[#1E293B]/60 pb-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
            Feedback Loop
          </span>
          <h4 id="retain-outcome-title" className="text-base font-semibold text-[#F8FAFC]">
            Retain Outcome
          </h4>
        </div>

        <span className="text-[10px] font-mono text-[#94A3B8]">
          {hasDecided ? 'Ready to Retain' : 'Decision Required'}
        </span>
      </div>

      <div className={`p-3.5 rounded bg-[#0D1118] border transition-colors ${
        hasDecided ? 'border-[#1E293B]' : 'border-[#1E293B]/40 opacity-70'
      }`}>
        {/* Pre-filled strategy summary */}
        <div className="space-y-2 mb-3 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
              Negotiation Strategy to Index:
            </span>
            <p className="text-[#F8FAFC] font-medium mt-0.5">
              {finalTactic}
            </p>
          </div>

          <div>
            <label htmlFor="retain-notes" className="text-[10px] font-mono uppercase text-[#94A3B8] block">
              Director Notes & Market Learnings:
            </label>
            <input
              id="retain-notes"
              type="text"
              value={directorNotes}
              disabled={!hasDecided}
              onChange={(e) => setDirectorNotes(e.target.value)}
              placeholder={hasDecided ? "Enter final negotiation context..." : "Make a decision above to enable retention"}
              className="w-full bg-[#070A0F] border border-[#1E293B] rounded px-2.5 py-1.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#38BDF8] disabled:cursor-not-allowed mt-0.5"
            />
          </div>
        </div>

        {/* Retain Action Button */}
        <div>
          <button
            onClick={() => onRetainToHindsight(directorNotes)}
            disabled={!hasDecided || isRetained}
            className={`w-full py-2.5 px-4 rounded text-xs font-mono font-medium transition-all ${
              !hasDecided
                ? 'bg-[#121923] text-[#94A3B8]/40 border border-[#1E293B] cursor-not-allowed'
                : isRetained
                ? 'bg-[#121923] text-[#34D399] border border-[#34D399]/40'
                : 'bg-[#F8FAFC] text-[#070A0F] hover:bg-[#F8FAFC]/90 cursor-pointer font-bold'
            }`}
          >
            {isRetained ? '✓ RETAINED TO HINDSIGHT MEMORY' : 'RETAIN TO HINDSIGHT'}
          </button>

          {isRetained && (
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#38BDF8]">
              <span>Memory indexed as MEM-{scenario.code}-2026</span>
              <button
                onClick={onResetCase}
                className="text-[#94A3B8] hover:text-[#F8FAFC] underline"
              >
                Reset Case
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
