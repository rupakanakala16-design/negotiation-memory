import React, { useState } from 'react';
import { RetainedOutcomeRecord } from '../types/negotiation';
import { NavItemKey } from '../components/layout/Sidebar';
import { TIMELINE_EVENTS } from '../data/mockData';

interface IntelligenceTimelineViewProps {
  retainedRecords: RetainedOutcomeRecord[];
  onNavigate?: (tab: NavItemKey) => void;
  onShowToast?: (title: string, desc?: string, hash?: string) => void;
}

export const IntelligenceTimelineView: React.FC<IntelligenceTimelineViewProps> = ({
  retainedRecords,
  onNavigate,
  onShowToast,
}) => {
  const [isReRunning, setIsReRunning] = useState(false);

  const handleReRunPipeline = () => {
    setIsReRunning(true);
    setTimeout(() => {
      setIsReRunning(false);
      onShowToast?.(
        'Institutional Learning Loop Re-Synchronized',
        `${retainedRecords.length + 25} Precedents re-verified against latest spot market indices. Zero vector drift confirmed.`,
        'MILVUS CHECK: 14.2ms LATENCY · 100% IN SYNC'
      );
    }, 800);
  };

  const learningStages = [
    {
      step: '01',
      title: 'RECALL — Precedent Memories Ingested',
      badge: 'Semantic Recall',
      badgeColor: 'bg-primary-fixed text-on-primary-fixed',
      summary: 'Relevant historical procurement contracts and crisis negotiations retrieved from the institutional memory bank.',
      metrics: [
        { label: 'Bank Source', value: 'negotiation-memory' },
        { label: 'Vector Metric', value: 'Cosine Similarity' },
        { label: 'Target Vendor', value: 'Alpha Supplier Precedents' }
      ]
    },
    {
      step: '02',
      title: 'CONDITION DIFFERENCE — Real-Time Divergence Detection',
      badge: '4 Divergences',
      badgeColor: 'bg-error-container text-on-error-container',
      summary: 'Dynamic multi-variable analysis contrasts historical shortage baseline against active market reality.',
      metrics: [
        { label: 'Supply Balance', value: 'SHORTAGE → SURPLUS' },
        { label: 'Supplier Leverage', value: 'HIGH → LOW' },
        { label: 'Buyer Leverage', value: 'LOW → HIGH' }
      ]
    },
    {
      step: '03',
      title: 'REFLECT — Hindsight Synthesis & Reasoning',
      badge: 'Hindsight Synthesis',
      badgeColor: 'bg-secondary-fixed text-on-secondary-fixed',
      summary: 'Synthesizes past contract hazards to prevent repeating obsolete playbooks (avoiding take-or-pay volume locks during market surplus).',
      metrics: [
        { label: 'Synthesis Model', value: 'Hindsight Reflect Engine' },
        { label: 'Bias Guard', value: 'Recency Anchoring Alert' },
        { label: 'Avoidance Target', value: '$4.8M - $8.4M Exposure' }
      ]
    },
    {
      step: '04',
      title: 'RECOMMEND — Strategic Posture & Tactical Levers',
      badge: 'High Confidence',
      badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
      summary: 'Formulates counter-proposal utilizing index-linked floating collar pricing, yield floor holding, and payment term extension.',
      metrics: [
        { label: 'Strategy', value: 'Competitive Mini-RFP' },
        { label: 'Collar Boundary', value: '+3.0% / -8.0%' },
        { label: 'Simulated Acceptance', value: '87.3% Probability' }
      ]
    },
    {
      step: '05',
      title: 'DECIDE — Executive Fiduciary Authorization',
      badge: 'Human Governance',
      badgeColor: 'bg-primary text-on-primary',
      summary: 'AI Recommends. Human Decides. Executive procurement officer validates, calibrates, or overrides proposed strategy.',
      metrics: [
        { label: 'Authority', value: 'Elena Vance (Level 4 CPO)' },
        { label: 'Directive', value: 'AI Recommends. Human Decides.' },
        { label: 'Signature', value: 'Ed25519 Verified' }
      ]
    },
    {
      step: '06',
      title: 'RETAIN — Outcome Sealed to Institutional Memory',
      badge: 'Feedback Sealed',
      badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
      summary: 'Negotiation result and director rationale are committed back to the memory corpus, continuously refining future strategic guidance.',
      metrics: [
        { label: 'Corpus Status', value: 'Appended & Indexed' },
        { label: 'Audit Trail', value: 'Immutable Decision Hash' },
        { label: 'Future Recalls', value: 'Dynamically Enriched' }
      ]
    }
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Executive Header Strip */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md mb-space-xl pt-space-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="font-label-caps text-label-caps tracking-widest text-primary uppercase bg-primary-fixed px-space-xs py-0.5 rounded font-semibold">
              Autonomous Institutional Learning Loop
            </span>
            <span className="font-code-id text-code-id text-outline flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              SHA-256 Vector Sign: 8f42..b70e
            </span>
          </div>
          <div className="flex items-baseline gap-space-md flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              05 Intelligence Timeline
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Every completed negotiation outcome recursively refines future executive strategy.
            </p>
          </div>
        </div>

        {/* Action Group & Metric Pill */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm flex items-center gap-space-md border border-surface-container">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps uppercase text-outline">
                Institutional Records
              </span>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-metric-num text-headline-sm text-primary font-bold">
                  {retainedRecords.length + 25}
                </span>
                <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-label-caps px-1.5 py-0.5 rounded uppercase font-semibold ml-1">
                  +{retainedRecords.length} Retained
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReRunPipeline}
            className="bg-surface-container-lowest hover:bg-surface-container text-on-surface px-space-md py-space-sm rounded-lg shadow-sm font-headline-sm text-headline-sm font-medium flex items-center gap-space-xs transition-colors border border-surface-container cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[18px] text-primary ${
                isReRunning ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
            <span>{isReRunning ? 'Re-Running...' : 'Re-Run Pipeline'}</span>
          </button>

          <div className="bg-primary text-on-primary px-space-md py-space-sm rounded-lg shadow-sm flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">
              Fiduciary Locked
            </span>
          </div>
        </div>
      </div>

      {/* Main Timeline Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
        {/* Left: 6-Stage Institutional Learning Loop */}
        <div className="xl:col-span-8 flex flex-col relative">
          <div className="flex flex-col gap-space-md">
            {learningStages.map((stage) => (
              <div
                key={stage.step}
                className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container transition-all hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-7 h-7 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-code-id text-code-id font-bold">
                      {stage.step}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {stage.title}
                    </span>
                  </div>
                  <span className={`font-label-caps text-label-caps px-space-xs py-0.5 rounded font-bold uppercase tracking-wider ${stage.badgeColor}`}>
                    {stage.badge}
                  </span>
                </div>

                <p className="font-body-md text-body-md text-on-surface-variant mb-space-md leading-relaxed">
                  {stage.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm bg-surface-container-low p-space-md rounded-lg border border-surface-container/60">
                  {stage.metrics.map((m, idx) => (
                    <div key={idx}>
                      <span className="font-label-caps text-label-caps text-outline uppercase block mb-0.5 font-semibold">
                        {m.label}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Real Retained Outcomes Log & Session Stream */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          {/* Retained Outcomes Log */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">database</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Retained Decisions ({retainedRecords.length})
                </h3>
              </div>
              <span className="font-code-id text-code-id text-tertiary font-bold">Live Synced</span>
            </div>

            <div className="flex flex-col gap-space-sm max-h-[500px] overflow-y-auto pr-1">
              {retainedRecords.map((item) => (
                <div
                  key={item.id}
                  className="p-space-md rounded-xl bg-surface-container-low border border-surface-container space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-on-surface text-sm block">{item.supplier}</span>
                      <span className="font-code-id text-outline text-[11px]">{item.id}</span>
                    </div>
                    <span
                      className={`font-label-caps text-label-caps px-2 py-0.5 rounded font-bold uppercase ${
                        item.decision === 'ACCEPTED'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : item.decision === 'MODIFIED'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {item.decision}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-surface-container-lowest border border-surface-container/60">
                    <span className="font-label-caps text-outline uppercase text-[10px] block font-semibold">
                      Retained Strategy:
                    </span>
                    <p className="text-on-surface font-semibold text-xs mt-0.5">
                      {item.finalTactic}
                    </p>
                  </div>

                  {item.directorNotes && (
                    <div>
                      <span className="font-label-caps text-outline uppercase text-[10px] block font-semibold">
                        Director Notes:
                      </span>
                      <p className="text-on-surface-variant text-xs mt-0.5 leading-relaxed">
                        {item.directorNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-surface-container text-[11px] font-code-id">
                    <span className="text-primary font-medium">{item.timestamp}</span>
                    <span className="text-tertiary font-bold">{item.projectedSavings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Event Stream */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container">
            <div className="flex items-center gap-space-xs mb-space-sm">
              <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Session Audit Stream
              </h3>
            </div>

            <div className="space-y-3 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container">
              {TIMELINE_EVENTS.map((event) => (
                <div key={event.id} className="relative text-xs">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                  <div className="flex items-center gap-1.5 text-[11px] font-code-id text-outline mb-0.5">
                    <span className="text-primary font-bold">{event.timestamp}</span>
                    <span>·</span>
                    <span className="px-1 py-0.2 rounded bg-surface-container text-on-surface">
                      {event.stage}
                    </span>
                  </div>
                  <h4 className="font-semibold text-on-surface text-xs">{event.title}</h4>
                  <p className="text-on-surface-variant text-[11px] mt-0.5 leading-snug">
                    {event.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
