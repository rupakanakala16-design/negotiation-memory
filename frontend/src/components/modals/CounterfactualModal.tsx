import React, { useState } from 'react';

interface CounterfactualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CounterfactualModal: React.FC<CounterfactualModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [collarCeiling, setCollarCeiling] = useState(3.0);
  const [collarFloor, setCollarFloor] = useState(-8.0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-space-lg py-space-md border-b border-surface-container flex items-center justify-between bg-surface-container-low shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">model_training</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Counterfactual Strategy Branch Simulator
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Monte Carlo projection comparing Fixed Take-or-Pay vs. Index-Linked Agile Strategy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-space-lg overflow-y-auto space-y-space-md">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Branch 1 */}
            <div className="p-space-md rounded-xl bg-error-container/20 border border-error-container/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-error">Branch A · Repeat 2021 Playbook</span>
                <span className="bg-error text-on-error text-[10px] px-2 py-0.5 rounded font-bold">HIGH RISK</span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Fixed Take-or-Pay 3-Year Lock
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Requires guaranteed minimum draw commitment. Assumes price protection against hypothetical shortages.
              </p>
              <div className="pt-2 border-t border-error-container/30 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-outline">Committed Exposure:</span>
                  <span className="font-bold text-error">$38.4M Locked</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Spot Index Upside Capture:</span>
                  <span className="font-bold text-outline">0% (Inflexible)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Surplus Penalty Hazard:</span>
                  <span className="font-bold text-error">High ($4.8M - $8.4M)</span>
                </div>
              </div>
            </div>

            {/* Branch 2 */}
            <div className="p-space-md rounded-xl bg-tertiary-fixed/30 border border-tertiary-fixed space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-tertiary">Branch B · Recommended Agile Index</span>
                <span className="bg-tertiary text-on-tertiary text-[10px] px-2 py-0.5 rounded font-bold">RECOMMENDED</span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Spot Index Floating Collar (+3% / -8%)
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Quarterly pricing resets pegged to spot market with unilateral cancellation right on 60-day notice.
              </p>
              <div className="pt-2 border-t border-tertiary-fixed/60 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-outline">Committed Exposure:</span>
                  <span className="font-bold text-tertiary">Flexible (Quarterly)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Spot Index Deflation Capture:</span>
                  <span className="font-bold text-tertiary">Up to 8% per cycle</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Projected Fiduciary Savings:</span>
                  <span className="font-bold text-tertiary">$4.8M - $8.4M Avoidance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sensitivity Sliders */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-3">
            <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-semibold block">
              Collar Boundary Calibration
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-on-surface">
                  <span>Upward Escalation Cap</span>
                  <span className="text-primary font-bold">+{collarCeiling.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={collarCeiling}
                  onChange={(e) => setCollarCeiling(parseFloat(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-on-surface">
                  <span>Downward Deflation Floor</span>
                  <span className="text-tertiary font-bold">{collarFloor.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="0"
                  step="0.5"
                  value={collarFloor}
                  onChange={(e) => setCollarFloor(parseFloat(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-space-lg py-space-md border-t border-surface-container flex items-center justify-between bg-surface-container-low">
          <span className="font-code-id text-code-id text-on-surface-variant">
            Monte Carlo Confidence: 94.6%
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-headline-sm text-headline-sm font-semibold transition-colors cursor-pointer"
          >
            Accept Counterfactual Model
          </button>
        </div>
      </div>
    </div>
  );
};
