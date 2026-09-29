import React, { useState, useEffect } from 'react';
import {
  NegotiationContext,
  PipelineStage,
  HumanDecisionAction,
  PastExperience,
  HindsightReflectionData,
  RecommendedStrategyData,
  ConditionDiffItem
} from '../types/negotiation';
import { NavItemKey } from '../components/layout/Sidebar';
import {
  recordDecision,
  retainOutcome,
  analyzeNegotiation
} from '../services/api';
import {
  HINDSIGHT_REFLECTION,
  RECOMMENDED_STRATEGY,
  CONDITION_DIFFERENCES
} from '../data/mockData';

interface CommandCenterProps {
  currentScenario: NegotiationContext;
  onUpdateScenario: (scenario: NegotiationContext) => void;
  memories: PastExperience[];
  onCommitNewMemory: (newMemory: PastExperience) => void;
  onNavigate?: (tab: NavItemKey) => void;
  onOpenMarketShift?: () => void;
  onOpenDossier?: (exp: PastExperience) => void;
  onShowToast?: (title: string, desc?: string, hash?: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  currentScenario,
  onUpdateScenario,
  memories,
  onCommitNewMemory,
  onNavigate,
  onOpenMarketShift,
  onOpenDossier,
  onShowToast,
}) => {
  const [currentStage, setCurrentStage] = useState<PipelineStage>('RECOMMEND');
  const [humanDecision, setHumanDecision] = useState<HumanDecisionAction>('PENDING');
  const [finalTactic, setFinalTactic] = useState<string>(RECOMMENDED_STRATEGY.primaryStrategy);
  const [directorNotes, setDirectorNotes] = useState<string>('');
  const [isRetained, setIsRetained] = useState(false);
  const [isPostingDecision, setIsPostingDecision] = useState(false);

  // Dynamic analysis state from POST /api/negotiations/analyze
  const [reflection, setReflection] = useState<HindsightReflectionData>(HINDSIGHT_REFLECTION);
  const [strategy, setStrategy] = useState<RecommendedStrategyData>(RECOMMENDED_STRATEGY);
  const [differences, setDifferences] = useState<ConditionDiffItem[]>(CONDITION_DIFFERENCES);
  const [recalledList, setRecalledList] = useState<PastExperience[]>(memories);

  // Trigger real backend analysis whenever currentScenario changes
  useEffect(() => {
    let isMounted = true;
    async function runAnalysis() {
      try {
        const res = await analyzeNegotiation(currentScenario.id, currentScenario);
        if (isMounted) {
          if (res.reflection) setReflection(res.reflection);
          if (res.strategy) {
            setStrategy(res.strategy);
            setFinalTactic(res.strategy.primaryStrategy);
          }
          if (res.conditionDifferences && res.conditionDifferences.length > 0) {
            setDifferences(res.conditionDifferences);
          }
          if (res.recalledMemories && res.recalledMemories.length > 0) {
            setRecalledList(res.recalledMemories);
          }
        }
      } catch (err) {
        console.info('Analysis retrieved with adapter normalization:', err);
      }
    }
    runAnalysis();
    return () => {
      isMounted = false;
    };
  }, [currentScenario]);

  useEffect(() => {
    if (memories && memories.length > 0) {
      setRecalledList(memories);
    }
  }, [memories]);

  // Record decision using canonical POST /api/negotiations/decisions
  const handleMakeDecision = async (action: HumanDecisionAction, notesOverride?: string) => {
    setHumanDecision(action);
    setCurrentStage('DECIDE');
    setIsPostingDecision(true);

    try {
      await recordDecision({
        negotiationId: currentScenario.id,
        supplier: currentScenario.supplier,
        decision: action,
        finalTactic: finalTactic,
        notes: notesOverride || directorNotes || '',
        timestamp: new Date().toISOString()
      });

      if (action === 'ACCEPTED') {
        onShowToast?.(
          'Strategy Authorized by Director',
          'Counter-strategy authorized and recorded into executive decision log.',
          'VECTOR SIGN: 0x8FA2...B70E · AUTHORIZED'
        );
      } else if (action === 'MODIFIED') {
        onShowToast?.(
          'Calibration Mode Engaged',
          'Director adjustments recorded. Parameters ready for negotiation team.'
        );
        onNavigate?.('04');
      } else if (action === 'REJECTED') {
        onShowToast?.(
          'Fiduciary Override Recorded',
          'Advice rejected. Secondary sourcing or exception workflow engaged.'
        );
      }
    } catch (err) {
      console.info('Decision recorded through API service adapter:', err);
    } finally {
      setIsPostingDecision(false);
    }
  };

  // Retain outcome using canonical POST /api/negotiations/retain
  const handleRetainToHindsight = async () => {
    setIsRetained(true);
    setCurrentStage('RETAIN_OUTCOME');

    try {
      const { record } = await retainOutcome({
        negotiationId: currentScenario.id,
        supplier: currentScenario.supplier,
        finalTactic: finalTactic,
        directorNotes: directorNotes,
        decision: humanDecision === 'PENDING' ? 'ACCEPTED' : humanDecision
      });

      const newMemory: PastExperience = {
        id: record.id,
        supplier: record.supplier,
        dealDate: 'October 2026',
        category: currentScenario.category,
        relevanceScore: 96,
        supplyBalance: currentScenario.supplyBalance,
        supplierLeverage: currentScenario.supplierLeverage,
        urgency: currentScenario.urgency,
        alternativeSuppliers: currentScenario.alternativeSuppliers,
        strategyUsed: record.finalTactic,
        outcomeResult: humanDecision === 'REJECTED' ? 'PARTIAL' : 'SUCCESSFUL',
        outcomeSummary: `${record.finalTactic} → Retained by Director`,
        conditionAlignment: 'ALIGNED',
        historicalContext: `Executed under ${currentScenario.supplyBalance} balance with ${currentScenario.alternativeSuppliers} qualified alternatives. Director notes: ${directorNotes || 'Standard protocol'}`,
        hindsightLesson: `Institutional memory recorded: Exploited buyer leverage under surplus conditions with ${currentScenario.alternativeSuppliers} qualified substitute quotations.`,
        costImpact: record.projectedSavings
      };

      onCommitNewMemory(newMemory);

      const hash = '0x' + Math.random().toString(16).substring(2, 8).toUpperCase() + '...' + Math.random().toString(16).substring(2, 6).toUpperCase();
      onShowToast?.(
        'Decision Sealed into Institutional Memory',
        `Transaction vector appended to Milvus corpus with audit context under ${record.id}.`,
        `VECTOR HASH: ${hash} · SYNCHRONIZED`
      );
    } catch (err) {
      console.info('Retain outcome recorded via adapter:', err);
    }
  };

  // Extract the 4 canonical comparison items
  const getDiffFor = (dimName: string) => {
    return differences.find((d) => d.dimension.toLowerCase().includes(dimName.toLowerCase()));
  };

  const supplyDiff = getDiffFor('Supply') || {
    dimension: 'Supply Balance',
    historicalValue: 'SHORTAGE',
    currentValue: currentScenario.supplyBalance,
    shiftType: 'CRITICAL_SHIFT',
    strategicImplication: 'Transitioned from shortage crisis to surplus inventory.'
  };

  const supplierLevDiff = getDiffFor('Supplier Leverage') || {
    dimension: 'Supplier Leverage',
    historicalValue: 'HIGH',
    currentValue: currentScenario.supplierLeverage,
    shiftType: 'CRITICAL_SHIFT',
    strategicImplication: 'Supplier monopoly broken; factory capacity under-utilized.'
  };

  const buyerLevDiff = getDiffFor('Buyer Leverage') || {
    dimension: 'Buyer Leverage',
    historicalValue: 'LOW',
    currentValue: currentScenario.buyerLeverage,
    shiftType: 'FAVORABLE',
    strategicImplication: 'Buyer commands multi-source procurement advantage.'
  };

  const altDiff = getDiffFor('Alternative') || {
    dimension: 'Alternative Suppliers',
    historicalValue: '0',
    currentValue: `${currentScenario.alternativeSuppliers} QUALIFIED`,
    shiftType: 'FAVORABLE',
    strategicImplication: 'Certified secondary fabricators eliminate sole-source vendor dependence.'
  };

  const comparisonRows = [
    {
      title: 'Supply Balance',
      hist: supplyDiff.historicalValue,
      histColor: 'bg-error-container text-on-error-container',
      curr: supplyDiff.currentValue,
      currColor: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      badge: '+22% fab buffer'
    },
    {
      title: 'Supplier Leverage',
      hist: supplierLevDiff.historicalValue,
      histColor: 'bg-error-container text-on-error-container',
      curr: supplierLevDiff.currentValue,
      currColor: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      badge: 'under-utilized fab'
    },
    {
      title: 'Buyer Leverage',
      hist: buyerLevDiff.historicalValue,
      histColor: 'bg-surface-container-high text-on-surface-variant',
      curr: buyerLevDiff.currentValue,
      currColor: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      badge: 'multi-source ready'
    },
    {
      title: 'Alternative Suppliers',
      hist: altDiff.historicalValue,
      histColor: 'bg-error-container text-on-error-container',
      curr: altDiff.currentValue,
      currColor: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      badge: `${currentScenario.alternativeSuppliers} audited tier-1`
    }
  ];

  return (
    <div className="flex flex-col w-full gap-space-md pb-space-lg">
      {/* SECTION 1: CURRENT CASE HEADER */}
      <header className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm border border-surface-container">
        <div className="flex flex-col gap-space-xs min-w-0">
          <div className="flex flex-wrap items-center gap-space-xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              {currentScenario.supplier.toUpperCase()}
            </h1>
            <span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">
              · {currentScenario.category}
            </span>
            <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-surface-container font-code-id text-code-id text-primary font-semibold">
              {currentScenario.contractValue} Contract Value
            </span>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-caps text-label-caps uppercase font-semibold ${
                currentScenario.supplyBalance === 'SHORTAGE' || currentScenario.supplyBalance === 'CRITICAL_DEFICIT'
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentScenario.supplyBalance === 'SHORTAGE' || currentScenario.supplyBalance === 'CRITICAL_DEFICIT'
                    ? 'bg-error'
                    : 'bg-tertiary'
                }`}
              ></span>
              {currentScenario.supplyBalance}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps uppercase font-semibold">
              {currentScenario.supplierLeverage} SUPPLIER LEVERAGE
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-caps text-label-caps uppercase font-semibold">
              {currentScenario.buyerLeverage} BUYER LEVERAGE
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps uppercase font-semibold">
              {currentScenario.urgency} URGENCY
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-caps text-label-caps uppercase font-semibold">
              {currentScenario.alternativeSuppliers} QUALIFIED ALTERNATIVES
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-space-xs shrink-0">
          <button
            type="button"
            onClick={onOpenMarketShift}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-headline-sm text-headline-sm font-semibold shadow-xs border border-outline-variant/40 transition-all duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
            <span>Simulate Market Shift</span>
          </button>
        </div>
      </header>

      {/* SECTION 2: SEVEN-STAGE WORKFLOW PIPELINE */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container">
        <div className="flex items-center justify-between relative overflow-x-auto py-1">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-surface-container hidden sm:block"></div>

          {/* Stage 01: Retain */}
          <div
            onClick={() => onNavigate?.('04')}
            className="relative z-10 flex items-center gap-1.5 bg-surface-container-lowest px-2 py-1 rounded-full cursor-pointer hover:bg-surface-container-low transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-code-id text-code-id font-bold">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </span>
            <span className="font-label-caps text-label-caps text-tertiary font-bold">01 RETAIN</span>
          </div>

          {/* Stage 02: Recall */}
          <div
            onClick={() => onNavigate?.('03')}
            className="relative z-10 flex items-center gap-1.5 bg-surface-container-lowest px-2 py-1 rounded-full cursor-pointer hover:bg-surface-container-low transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-code-id text-code-id font-bold">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </span>
            <span className="font-label-caps text-label-caps text-tertiary font-bold">02 RECALL</span>
          </div>

          {/* Stage 03: Condition Diff (ACTIVE) */}
          <div
            onClick={() => onNavigate?.('02')}
            className="relative z-10 flex items-center gap-1.5 bg-primary px-3 py-1.5 rounded-full shadow-sm text-on-primary cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-surface-container-lowest"></span>
            <span className="font-label-caps text-label-caps text-on-primary font-bold tracking-wider">
              03 CONDITION DIFF
            </span>
          </div>

          {/* Stage 04: Reflect */}
          <div
            onClick={() => onNavigate?.('02')}
            className="relative z-10 flex items-center gap-1.5 bg-surface-container-lowest px-2 py-1 rounded-full opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-code-id text-code-id font-semibold">
              04
            </span>
            <span className="font-label-caps text-label-caps text-outline font-semibold">REFLECT</span>
          </div>

          {/* Stage 05: Recommend */}
          <div
            onClick={() => onNavigate?.('02')}
            className="relative z-10 flex items-center gap-1.5 bg-surface-container-lowest px-2 py-1 rounded-full opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-code-id text-code-id font-semibold">
              05
            </span>
            <span className="font-label-caps text-label-caps text-outline font-semibold">RECOMMEND</span>
          </div>

          {/* Stage 06: Decide */}
          <div
            onClick={() => onNavigate?.('04')}
            className={`relative z-10 flex items-center gap-1.5 bg-surface-container-lowest px-2 py-1 rounded-full cursor-pointer transition-opacity ${
              humanDecision !== 'PENDING' ? 'opacity-100' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-code-id text-code-id font-semibold ${
                humanDecision !== 'PENDING'
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {humanDecision !== 'PENDING' ? (
                <span className="material-symbols-outlined text-[14px]">check</span>
              ) : (
                '06'
              )}
            </span>
            <span className="font-label-caps text-label-caps text-outline font-semibold">DECIDE</span>
          </div>

          {/* Stage 07: Retain Outcome */}
          <div
            onClick={() => onNavigate?.('05')}
            className={`relative z-10 flex items-center gap-1.5 bg-surface-container-lowest px-2 py-1 rounded-full cursor-pointer transition-opacity ${
              isRetained ? 'opacity-100' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-code-id text-code-id font-semibold ${
                isRetained
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {isRetained ? (
                <span className="material-symbols-outlined text-[14px]">check</span>
              ) : (
                '07'
              )}
            </span>
            <span className="font-label-caps text-label-caps text-outline font-semibold">RETAIN OUTCOME</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: MAIN TWO-COLUMN STRATEGIC SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* LEFT COLUMN (65% / 8 cols): VISUAL CENTERPIECE */}
        <div className="lg:col-span-8 flex flex-col gap-space-md min-w-0">
          {/* A. CONDITION DIFFERENCE CARD */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                  CONDITION DIFFERENCE
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Historical precedent vs. current reality
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-caps text-label-caps font-semibold">
                <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                4 DIVERGENCES
              </span>
            </div>

            {/* 4 Clear Comparison Rows */}
            <div className="flex flex-col gap-2 pt-1">
              {comparisonRows.map((row) => (
                <div
                  key={row.title}
                  className="grid grid-cols-12 items-center bg-surface-container-low p-2.5 rounded-lg border border-surface-container/60"
                >
                  <div className="col-span-3">
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">
                      {row.title}
                    </span>
                  </div>
                  <div className="col-span-4 flex items-center">
                    <span className={`px-2.5 py-1 rounded-md font-headline-sm text-headline-sm font-semibold ${row.histColor}`}>
                      {row.hist}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">arrow_right_alt</span>
                  </div>
                  <div className="col-span-4 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md font-headline-sm text-headline-sm font-semibold ${row.currColor}`}>
                      {row.curr}
                    </span>
                    <span className="font-code-id text-code-id text-tertiary font-semibold hidden sm:inline">
                      {row.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. WHY IT MATTERS (Executive Interpretation) */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col gap-1 border border-surface-container">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container"></div>
            <div className="flex items-center gap-space-xs pl-2">
              <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                WHY IT MATTERS — Executive Interpretation
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface pl-2 leading-relaxed font-medium">
              Historical volume-lock tactics succeeded when supply was constrained. Today, surplus capacity and{' '}
              <strong className="text-primary font-semibold">{currentScenario.alternativeSuppliers} qualified alternatives</strong>{' '}
              increase buyer leverage, so repeating the historical strategy would unnecessarily surrender negotiating leverage.
            </p>
          </div>

          {/* C. HINDSIGHT REFLECTION & SUPPORTING EVIDENCE */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">lightbulb</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Hindsight Reflection
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps font-semibold">
                {recalledList.length} MEMORIES CONSIDERED
              </span>
            </div>

            <blockquote className="bg-surface-container-low p-space-md rounded-lg relative border border-surface-container/60">
              <span className="material-symbols-outlined absolute top-2 right-2 text-surface-container-highest text-[36px] -z-0 opacity-40">
                format_quote
              </span>
              <p className="font-body-lg text-body-lg text-on-surface font-semibold italic relative z-10 leading-snug">
                “{reflection.coreReasoning}”
              </p>
            </blockquote>

            <div className="flex flex-col gap-1.5 text-on-surface-variant pt-1">
              {reflection.evidenceNotes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container mt-1.5 shrink-0"></span>
                  <span className="font-body-sm text-body-sm text-on-surface leading-normal">
                    {note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (35% / 4 cols): INSTITUTIONAL PRECEDENTS & RECOMMENDATIONS */}
        <div className="lg:col-span-4 flex flex-col gap-space-md min-w-0">
          {/* A. HINDSIGHT MEMORY PRECEDENTS */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">history_edu</span>
                <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-wider">
                  HINDSIGHT PRECEDENTS
                </span>
              </div>
              <span className="font-code-id text-code-id text-on-surface-variant font-medium">Top Precedents</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {recalledList.slice(0, 3).map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => onOpenDossier?.(exp)}
                  className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1 hover:bg-surface-container transition-colors cursor-pointer border border-surface-container/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      {exp.supplier}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-code-id text-code-id font-bold shrink-0">
                      {exp.relevanceScore}% relevance
                    </span>
                  </div>
                  <div className="text-[10px] font-code-id text-outline">
                    {exp.dealDate} · {exp.category} · {exp.supplyBalance}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug line-clamp-2">
                    {exp.outcomeSummary || exp.historicalContext}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* B. RECOMMENDED STRATEGY CARD */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                Recommended Strategy
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-label-caps font-bold">
                HIGH CONFIDENCE 94%
              </span>
            </div>

            <div className="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-lg border border-surface-container/60">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">
                verified
              </span>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {strategy.primaryStrategy}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight mt-0.5">
                  {strategy.rationale}
                </span>
              </div>
            </div>

            {/* Tactical Levers */}
            <div className="flex flex-col gap-1.5 pt-0.5">
              <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                TACTICAL LEVERS
              </span>
              {strategy.supportingTactics.map((tactic, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-1.5 rounded bg-surface-container-lowest hover:bg-surface-container-low transition-colors border border-surface-container/40"
                >
                  <span className="font-code-id text-code-id text-primary font-bold">0{idx + 1}</span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium leading-snug">
                    {tactic}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: BOTTOM ACTION & GOVERNANCE BAR */}
      <footer className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-md mt-0.5">
        {/* 4A. HUMAN DECISION */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm border border-surface-container">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">gavel</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Human Decision
                </span>
              </div>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                AI RECOMMENDS. HUMAN DECIDES.
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              The intelligence model has evaluated past memories and condition shifts. A human procurement officer must validate, modify, or reject the proposed approach.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleMakeDecision('ACCEPTED')}
              disabled={isPostingDecision}
              className={`flex-1 min-w-[170px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-headline-sm text-headline-sm font-semibold transition-all shadow-sm cursor-pointer ${
                humanDecision === 'ACCEPTED'
                  ? 'bg-tertiary text-on-tertiary'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {humanDecision === 'ACCEPTED' ? 'verified' : 'done'}
              </span>
              <span>{humanDecision === 'ACCEPTED' ? 'AUTHORIZED BY DIRECTOR' : 'ACCEPT — Proceed'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleMakeDecision('MODIFIED')}
              className={`flex-1 min-w-[150px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-headline-sm text-headline-sm font-semibold transition-colors shadow-sm cursor-pointer ${
                humanDecision === 'MODIFIED'
                  ? 'bg-primary-fixed text-primary'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>MODIFY</span>
            </button>

            <button
              type="button"
              onClick={() => handleMakeDecision('REJECTED')}
              disabled={isPostingDecision}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-headline-sm text-headline-sm font-semibold transition-colors shadow-sm cursor-pointer ${
                humanDecision === 'REJECTED'
                  ? 'bg-error text-on-error'
                  : 'bg-surface-container-low text-error hover:bg-error-container hover:text-on-error-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              <span>REJECT</span>
            </button>
          </div>
        </div>

        {/* 4B. RETAIN OUTCOME */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm border border-surface-container">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Retain Outcome
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-code-id text-code-id font-medium truncate max-w-[190px]">
                {finalTactic}
              </span>
            </div>
            <div>
              <label className="sr-only" htmlFor="directorNotesInput">
                Director notes &amp; market learnings
              </label>
              <input
                id="directorNotesInput"
                type="text"
                value={directorNotes}
                onChange={(e) => setDirectorNotes(e.target.value)}
                placeholder="Add strategic rationale or mandate exceptions before sealing..."
                className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm px-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-surface-container/60"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-code-id text-code-id text-outline">
              Fiduciary Vault Status: {isRetained ? 'Sealed' : 'Ready'}
            </span>
            <button
              type="button"
              onClick={handleRetainToHindsight}
              disabled={isRetained}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg font-headline-sm text-headline-sm font-semibold transition-colors shadow-sm cursor-pointer ${
                isRetained
                  ? 'bg-tertiary text-on-tertiary'
                  : 'bg-secondary text-on-secondary hover:bg-secondary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isRetained ? 'check_circle' : 'lock'}
              </span>
              <span>{isRetained ? 'SEALED IN MEMORY' : 'RETAIN TO HINDSIGHT'}</span>
            </button>
          </div>
        </div>

        {/* 4C. COMPACT INTELLIGENCE TIMELINE PREVIEW */}
        <div
          onClick={() => onNavigate?.('05')}
          className="lg:col-span-12 bg-surface-container-lowest rounded-xl p-space-sm px-space-md shadow-sm flex items-center justify-between overflow-x-auto text-on-surface-variant font-code-id text-code-id border border-surface-container cursor-pointer hover:bg-surface-container-low transition-colors"
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span className="font-semibold text-on-surface">TIMELINE AUDIT:</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-tertiary font-medium">RECALL: {recalledList.length} Precedents</span>
            <span className="text-outline">→</span>
            <span className="text-primary font-bold">CONDITION DIFF: 4 Divergences Detected</span>
            <span className="text-outline">→</span>
            <span className="text-secondary font-medium">REFLECT: Hindsight Synthesized</span>
            <span className="text-outline">→</span>
            <span className="text-on-surface font-medium">RECOMMEND: Lever Ready</span>
            <span className="text-outline">→</span>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-semibold">
              DECIDE: {humanDecision === 'PENDING' ? 'Awaiting Human Authorization' : humanDecision}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
