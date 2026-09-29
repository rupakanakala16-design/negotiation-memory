import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HumanDecisionAction, NegotiationContext } from '../../types/negotiation';

interface HumanDecisionPanelProps {
  decision: HumanDecisionAction;
  onMakeDecision: (action: HumanDecisionAction, customNotes?: string, modifiedTactics?: string) => void;
  primaryStrategy: string;
  scenario: NegotiationContext;
  isPostingDecision: boolean;
}

export const HumanDecisionPanel: React.FC<HumanDecisionPanelProps> = ({
  decision,
  onMakeDecision,
  primaryStrategy,
  scenario,
  isPostingDecision
}) => {
  const [isModifying, setIsModifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [modifiedTactic, setModifiedTactic] = useState(
    'Competitive mini-RFP + 70/30 split award between Delta and Beta'
  );
  const [rejectReason, setRejectReason] = useState(
    'Maintain single source for proprietary patent warranty continuity'
  );

  const handleAction = async (action: HumanDecisionAction) => {
    if (action === 'ACCEPTED') {
      setIsModifying(false);
      setIsRejecting(false);
      onMakeDecision('ACCEPTED', 'Accepted Hindsight strategy recommendations.');
    }
  };

  const handleSaveModification = () => {
    setIsModifying(false);
    onMakeDecision('MODIFIED', 'Director modified terms for split-source redundancy.', modifiedTactic);
  };

  const handleSaveRejection = () => {
    setIsRejecting(false);
    onMakeDecision('REJECTED', `Strategic override: ${rejectReason}`, 'Direct bilateral negotiation');
  };

  return (
    <div className="space-y-3" aria-labelledby="decision-boundary-title">
      <div className="flex items-baseline justify-between border-b border-[#1E293B]/60 pb-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
            Executive Governance
          </span>
          <h4 id="decision-boundary-title" className="text-base font-semibold text-[#F8FAFC]">
            Human Decision
          </h4>
        </div>

        <div className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-1.5">
          <span>AI RECOMMENDS.</span>
          <span className="text-[#F8FAFC] font-semibold">HUMAN DECIDES.</span>
        </div>
      </div>

      <div className="p-3.5 rounded bg-[#0D1118] border border-[#1E293B]">
        <div className="text-xs text-[#94A3B8] mb-3">
          The intelligence model has evaluated past memories and condition shifts. A human procurement officer must validate, modify, or reject the proposed approach.
        </div>

        {/* Deliberate Action Buttons - Neutral charcoal, no auto-selected preference */}
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Human decision controls">
          {/* Accept */}
          <button
            onClick={() => handleAction('ACCEPTED')}
            disabled={isPostingDecision}
            className={`py-2 px-3 rounded text-xs font-mono font-medium transition-colors cursor-pointer border ${
              decision === 'ACCEPTED'
                ? 'bg-[#121923] text-[#34D399] border-[#34D399]/60'
                : 'bg-[#070A0F] text-[#F8FAFC] border-[#1E293B] hover:border-[#94A3B8]'
            }`}
          >
            ACCEPT
          </button>

          {/* Modify */}
          <button
            onClick={() => {
              setIsModifying(!isModifying);
              setIsRejecting(false);
            }}
            disabled={isPostingDecision}
            className={`py-2 px-3 rounded text-xs font-mono font-medium transition-colors cursor-pointer border ${
              decision === 'MODIFIED' || isModifying
                ? 'bg-[#121923] text-[#FBBF24] border-[#FBBF24]/60'
                : 'bg-[#070A0F] text-[#F8FAFC] border-[#1E293B] hover:border-[#94A3B8]'
            }`}
          >
            MODIFY
          </button>

          {/* Reject */}
          <button
            onClick={() => {
              setIsRejecting(!isRejecting);
              setIsModifying(false);
            }}
            disabled={isPostingDecision}
            className={`py-2 px-3 rounded text-xs font-mono font-medium transition-colors cursor-pointer border ${
              decision === 'REJECTED' || isRejecting
                ? 'bg-[#121923] text-[#F87171] border-[#F87171]/60'
                : 'bg-[#070A0F] text-[#F8FAFC] border-[#1E293B] hover:border-[#94A3B8]'
            }`}
          >
            REJECT
          </button>
        </div>

        {/* Decision status flag */}
        {decision !== 'PENDING' && (
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#34D399] pt-2 border-t border-[#1E293B]/60">
            <span>● DECISION RECORDED ({decision})</span>
            <span className="text-[#94A3B8]">Governance Audit Logged</span>
          </div>
        )}

        {/* Drawer for Modify */}
        <AnimatePresence>
          {isModifying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-[#1E293B] space-y-2 overflow-hidden text-xs"
            >
              <label htmlFor="modify-input" className="text-[10px] font-mono text-[#94A3B8] block uppercase">
                Director Strategy Modification:
              </label>
              <textarea
                id="modify-input"
                value={modifiedTactic}
                onChange={(e) => setModifiedTactic(e.target.value)}
                rows={2}
                className="w-full bg-[#070A0F] border border-[#1E293B] rounded p-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModifying(false)}
                  className="px-2.5 py-1 text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModification}
                  className="px-3 py-1 bg-[#121923] border border-[#FBBF24]/50 text-[#FBBF24] font-mono text-xs rounded hover:bg-[#121923]/80"
                >
                  Save Modification
                </button>
              </div>
            </motion.div>
          )}

          {isRejecting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-[#1E293B] space-y-2 overflow-hidden text-xs"
            >
              <label htmlFor="reject-input" className="text-[10px] font-mono text-[#94A3B8] block uppercase">
                Director Override / Rejection Reason:
              </label>
              <textarea
                id="reject-input"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={2}
                className="w-full bg-[#070A0F] border border-[#1E293B] rounded p-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#F87171]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsRejecting(false)}
                  className="px-2.5 py-1 text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRejection}
                  className="px-3 py-1 bg-[#121923] border border-[#F87171]/50 text-[#F87171] font-mono text-xs rounded hover:bg-[#121923]/80"
                >
                  Save Rejection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
