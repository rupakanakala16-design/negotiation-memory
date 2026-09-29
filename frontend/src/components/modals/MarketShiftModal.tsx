import React, { useState } from 'react';

interface MarketShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyShift: (settings: { spotIndexDrop: number; fabUtilization: number; qualifiedFabs: number }) => void;
}

export const MarketShiftModal: React.FC<MarketShiftModalProps> = ({
  isOpen,
  onClose,
  onApplyShift,
}) => {
  const [spotIndexDrop, setSpotIndexDrop] = useState(-18.4);
  const [fabUtilization, setFabUtilization] = useState(71.2);
  const [qualifiedFabs, setQualifiedFabs] = useState(6);

  if (!isOpen) return null;

  // Dynamic simulation calculations
  const leverageScore = Math.min(95, Math.max(20, Math.round(100 - fabUtilization * 0.8 + qualifiedFabs * 3.5)));
  const calculatedSavingsMin = (3.4 * (Math.abs(spotIndexDrop) / 100) * 0.65).toFixed(2);
  const calculatedSavingsMax = (3.4 * (Math.abs(spotIndexDrop) / 100) * 1.15).toFixed(2);
  const acceptanceProb = Math.min(96, Math.max(60, Math.round(75 + (100 - fabUtilization) * 0.4))).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-space-lg py-space-md border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Counterfactual Market Shift Simulator
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Stress-test negotiation posture under shifting macro parameters
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

        {/* Content Body */}
        <div className="p-space-lg space-y-space-md">
          {/* Slider 1: Polycrystalline Spot Silicon Drift */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-headline-sm text-body-md font-semibold text-on-surface flex items-center gap-1.5">
                <span>Spot Market Price Delta</span>
                <span className="text-outline text-xs">(YoY Index)</span>
              </label>
              <span
                className={`font-code-id text-code-id font-bold px-2 py-0.5 rounded ${
                  spotIndexDrop < 0 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'
                }`}
              >
                {spotIndexDrop > 0 ? `+${spotIndexDrop}%` : `${spotIndexDrop}%`}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="20"
              step="0.5"
              value={spotIndexDrop}
              onChange={(e) => setSpotIndexDrop(parseFloat(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-outline font-code-id">
              <span>-40% (Surplus Collapse)</span>
              <span>0% (Benchmark Baseline)</span>
              <span>+20% (Shortage Surge)</span>
            </div>
          </div>

          {/* Slider 2: Supplier Capacity Utilization */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-headline-sm text-body-md font-semibold text-on-surface flex items-center gap-1.5">
                <span>Supplier Fab Capacity Utilization</span>
                <span className="text-outline text-xs">(Industry Load)</span>
              </label>
              <span
                className={`font-code-id text-code-id font-bold px-2 py-0.5 rounded ${
                  fabUtilization < 75 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'
                }`}
              >
                {fabUtilization}% Load
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={fabUtilization}
              onChange={(e) => setFabUtilization(parseFloat(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-outline font-code-id">
              <span>50% (High Idling Risk)</span>
              <span>75% (Surplus Threshold)</span>
              <span>100% (Full Allocation Lock)</span>
            </div>
          </div>

          {/* Slider 3: Certified Secondary Fabs (BATNA) */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-headline-sm text-body-md font-semibold text-on-surface flex items-center gap-1.5">
                <span>Certified Qualified Vendors (BATNA)</span>
                <span className="text-outline text-xs">(Ready to quote)</span>
              </label>
              <span className="font-code-id text-code-id font-bold px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">
                {qualifiedFabs} Available
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={qualifiedFabs}
              onChange={(e) => setQualifiedFabs(parseInt(e.target.value, 10))}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-outline font-code-id">
              <span>0 (Sole-source risk)</span>
              <span>4 (Multi-sourced)</span>
              <span>12 (Liquid Commodity)</span>
            </div>
          </div>

          {/* Computed Dynamic Projections */}
          <div className="grid grid-cols-3 gap-space-sm p-space-md rounded-xl bg-surface-container-high/50 border border-surface-container">
            <div>
              <span className="font-label-caps text-label-caps text-outline uppercase block">
                Buyer Power Index
              </span>
              <span className="font-metric-num text-headline-md text-primary font-bold">
                {leverageScore} / 100
              </span>
            </div>
            <div>
              <span className="font-label-caps text-label-caps text-outline uppercase block">
                Est. Cost Avoidance
              </span>
              <span className="font-metric-num text-headline-md text-tertiary font-bold">
                ${calculatedSavingsMin}M - ${calculatedSavingsMax}M
              </span>
            </div>
            <div>
              <span className="font-label-caps text-label-caps text-outline uppercase block">
                Acceptance Probability
              </span>
              <span className="font-metric-num text-headline-md text-on-surface font-bold">
                {acceptanceProb}%
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-space-lg py-space-md border-t border-surface-container flex items-center justify-between bg-surface-container-low">
          <button
            type="button"
            onClick={() => {
              setSpotIndexDrop(-18.4);
              setFabUtilization(71.2);
              setQualifiedFabs(6);
            }}
            className="text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm font-semibold cursor-pointer"
          >
            Reset Defaults
          </button>
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-2 rounded-lg text-on-surface hover:bg-surface-container font-headline-sm text-headline-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyShift({ spotIndexDrop, fabUtilization, qualifiedFabs });
                onClose();
              }}
              className="px-space-lg py-2 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm font-semibold shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
            >
              Apply Market Shift
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
