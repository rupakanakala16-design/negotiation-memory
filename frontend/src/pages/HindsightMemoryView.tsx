import React, { useState } from 'react';
import { PastExperience, NegotiationContext } from '../types/negotiation';
import { NavItemKey } from '../components/layout/Sidebar';

interface HindsightMemoryViewProps {
  memories: PastExperience[];
  currentScenario: NegotiationContext;
  onNavigate?: (tab: NavItemKey) => void;
  onShowToast?: (title: string, desc?: string, hash?: string) => void;
}

export const HindsightMemoryView: React.FC<HindsightMemoryViewProps> = ({
  memories,
  currentScenario,
  onNavigate,
  onShowToast,
}) => {
  const [triageMode, setTriageMode] = useState<'accept' | 'modify' | 'reject'>('modify');
  const [tolerance, setTolerance] = useState<number>(2.5);
  const [rationale, setRationale] = useState(
    'Collared floating baseline verified with Treasury macroeconomic forecast. Setting tolerance at ±2.5% provides necessary supplier operational leeway while guarding against Q4 speculative spikes. Precedent learnings directly applied.'
  );

  const handleSelectTriage = (mode: 'accept' | 'modify' | 'reject') => {
    setTriageMode(mode);
    if (mode === 'accept') {
      setRationale(
        'Accepted algorithmic recommendation without parameter variance. Spot index collar (+3% / -8%) adopted in full based on precedent preservation rules.'
      );
    } else if (mode === 'modify') {
      setRationale(
        `Collared floating baseline verified with Treasury macroeconomic forecast. Setting tolerance at ±${tolerance.toFixed(1)}% provides supplier leeway while guarding against speculative spikes.`
      );
    } else if (mode === 'reject') {
      setRationale(
        'OVERRULED: Current spot index mechanism does not reflect anticipated export quotas. Direct single-year override authorized under fiduciary exemption.'
      );
    }
  };

  const handleCommit = () => {
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const hash = `0x${randomHex}...${Math.random().toString(16).substring(2, 6).toUpperCase()}`;
    onShowToast?.(
      'Decision Committed to Institutional Memory',
      'Transaction vector appended to semantic corpus with cryptographic signature under EV-88902-EXEC.',
      `VECTOR HASH: ${hash} · SYNCHRONIZED`
    );
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Context & Fiduciary Banner */}
      <section className="mb-space-md pt-space-sm">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col xl:flex-row xl:items-center justify-between gap-space-md border border-surface-container">
          <div className="flex flex-col gap-space-xs max-w-3xl">
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="font-label-caps text-label-caps tracking-widest text-primary uppercase bg-primary-fixed px-space-xs py-0.5 rounded font-bold">
                Gate 04 · Vector Retention &amp; Governance
              </span>
              <span className="text-outline text-body-sm">•</span>
              <span className="font-code-id text-code-id text-on-surface-variant font-medium">
                REV-NODE: 994.21.B
              </span>
              <span className="text-outline text-body-sm">•</span>
              <span className="font-code-id text-code-id text-tertiary flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary inline-block animate-pulse"></span>
                MILVUS / HINDSIGHT SYNCHRONIZED
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
              Human Decision &amp; Retain Outcome Gateway
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Every strategic deviation, tolerance shift, or unilateral acceptance commits an indelible transaction vector to organizational memory.
            </p>
          </div>

          {/* Executive Authority Badge */}
          <div className="bg-surface-container-low rounded-lg p-space-md flex items-center gap-space-md self-start xl:self-center shrink-0 border border-surface-container">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-headline-sm font-bold shadow-xs">
              EV
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Elena Vance
                </span>
                <span className="bg-surface-container-high text-on-surface font-label-caps text-label-caps px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                  Level 4
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Chief Procurement Officer
              </span>
              <span className="font-code-id text-code-id text-outline">
                Auth ID: EV-88902-EXEC
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md">
        {/* Left: Tactical Governance & Calibration (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-space-md">
          {/* Active Proposal Summary Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-surface-container">
            <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Active Proposal: {currentScenario.supplier}
                </span>
                <span className="font-code-id text-code-id text-on-surface-variant bg-surface-container-high px-space-xs py-0.5 rounded">
                  {currentScenario.code || 'MSA-SIL-2024'}
                </span>
              </div>
              <span className="text-xs font-semibold text-primary uppercase font-code-id">
                {currentScenario.supplyBalance}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col border border-surface-container/60">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">
                  Contract Value
                </span>
                <span className="font-display-xl text-display-xl text-primary font-bold tracking-tight">
                  {currentScenario.contractValue}
                </span>
              </div>
              <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col border border-surface-container/60">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">
                  Buyer Leverage
                </span>
                <span className="font-display-xl text-display-xl text-tertiary font-bold tracking-tight">
                  {currentScenario.buyerLeverage}
                </span>
              </div>
              <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col border border-surface-container/60">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">
                  BATNA Alternatives
                </span>
                <span className="font-display-xl text-display-xl text-secondary font-bold tracking-tight">
                  {currentScenario.alternativeSuppliers} Sources
                </span>
              </div>
            </div>

            {/* Triage Mode Selector */}
            <div className="space-y-2">
              <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-semibold block">
                Fiduciary Triage Decision
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                <button
                  type="button"
                  onClick={() => handleSelectTriage('accept')}
                  className={`p-space-md rounded-xl text-left border transition-all cursor-pointer ${
                    triageMode === 'accept'
                      ? 'bg-tertiary-fixed/30 border-tertiary text-on-surface shadow-xs'
                      : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-sm text-tertiary mb-1">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Adopt Algorithmic</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Full acceptance of recommended counter-strategy.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTriage('modify')}
                  className={`p-space-md rounded-xl text-left border transition-all cursor-pointer ${
                    triageMode === 'modify'
                      ? 'bg-primary-fixed/40 border-primary text-on-surface shadow-xs'
                      : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-sm text-primary mb-1">
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    <span>Calibrate Parameters</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Adjust collar tolerance and delivery terms.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTriage('reject')}
                  className={`p-space-md rounded-xl text-left border transition-all cursor-pointer ${
                    triageMode === 'reject'
                      ? 'bg-error-container/40 border-error text-on-surface shadow-xs'
                      : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-sm text-error mb-1">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    <span>Fiduciary Override</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Reject recommendation with logged exemption.</p>
                </button>
              </div>
            </div>

            {/* Tolerance Calibration Slider */}
            <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 border border-surface-container">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-on-surface">
                  Collar Spread Tolerance Margin
                </span>
                <span className="font-code-id text-code-id font-bold text-primary">
                  ±{tolerance.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value))}
                className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-outline font-code-id">
                <span>Tight (±0.5%)</span>
                <span>Balanced (±2.5%)</span>
                <span>Flexible (±5.0%)</span>
              </div>
            </div>

            {/* Executive Rationale */}
            <div className="space-y-1">
              <label htmlFor="rationaleInput" className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-semibold block">
                Executive Rationale &amp; Audit Notes
              </label>
              <textarea
                id="rationaleInput"
                rows={3}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                className="w-full bg-surface-container-low p-space-md rounded-xl border border-surface-container text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleCommit}
                className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-headline-sm text-headline-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Commit Vector to Institutional Memory
              </button>
            </div>
          </div>
        </div>

        {/* Right: Memory Embeddings Distance Matrix & Clusters (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          {/* Dimensional Clusters Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container space-y-3">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">hub</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Dimensional Memory Clusters
              </h3>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
                <span className="font-label-caps text-tertiary font-bold uppercase text-[10px] block">Cluster 01</span>
                <span className="font-bold text-xs text-on-surface">Surplus &amp; Alternative Dominant</span>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                  Buyer BATNA exceeds 3 alternatives with soft spot pricing.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
                <span className="font-label-caps text-secondary font-bold uppercase text-[10px] block">Cluster 02</span>
                <span className="font-bold text-xs text-on-surface">Balanced Index-Linked Parity</span>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                  Neither party commands monopoly. Quarterly collar adjustments applied.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
                <span className="font-label-caps text-error font-bold uppercase text-[10px] block">Cluster 03</span>
                <span className="font-bold text-xs text-on-surface">Shortage Crisis &amp; Allocation Lock</span>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                  Supply bottleneck where vendor holds capacity pricing monopoly.
                </p>
              </div>
            </div>
          </div>

          {/* Real Cosine Vector Proximity List */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Vector Proximity vs Active Case
              </span>
              <span className="text-[10px] font-code-id text-outline font-semibold">
                Cosine Similarity
              </span>
            </div>

            <div className="space-y-2.5">
              {memories.map((mem) => (
                <div key={mem.id} className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-on-surface truncate">{mem.supplier}</span>
                    <span className="font-code-id text-primary font-bold">{mem.relevanceScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${mem.relevanceScore}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-outline font-code-id pt-0.5">
                    <span>{mem.dealDate}</span>
                    <span className="uppercase font-semibold text-on-surface">{mem.supplyBalance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
