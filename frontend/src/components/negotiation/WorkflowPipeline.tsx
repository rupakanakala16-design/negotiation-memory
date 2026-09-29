import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { PipelineStage } from '../../types/negotiation';

interface WorkflowPipelineProps {
  currentStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
  isOutcomeRetained: boolean;
  hasDecided: boolean;
}

interface StageStep {
  id: PipelineStage;
  label: string;
}

const STAGES: StageStep[] = [
  { id: 'RETAIN', label: 'Retain' },
  { id: 'RECALL', label: 'Recall' },
  { id: 'CONDITION_DIFF', label: 'Condition Diff' },
  { id: 'REFLECT', label: 'Reflect' },
  { id: 'RECOMMEND', label: 'Recommend' },
  { id: 'DECIDE', label: 'Decide' },
  { id: 'RETAIN_OUTCOME', label: 'Retain Outcome' }
];

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({
  currentStage,
  onSelectStage,
  isOutcomeRetained,
  hasDecided
}) => {
  const stageOrder: PipelineStage[] = [
    'RETAIN',
    'RECALL',
    'CONDITION_DIFF',
    'REFLECT',
    'RECOMMEND',
    'DECIDE',
    'RETAIN_OUTCOME'
  ];

  const getStageStatus = (idx: number, stageId: PipelineStage) => {
    if (isOutcomeRetained) return 'COMPLETED';
    if (stageId === 'RETAIN_OUTCOME') return isOutcomeRetained ? 'COMPLETED' : 'PENDING';
    if (stageId === 'DECIDE') return hasDecided ? 'COMPLETED' : 'ACTIVE';
    
    // Recall, Condition Diff, Reflect, Recommend are evaluated by system
    if (idx < 4) return 'COMPLETED';
    if (idx === 4) return hasDecided ? 'COMPLETED' : 'ACTIVE';
    return 'PENDING';
  };

  return (
    <nav
      className="flex items-center justify-between py-2 border-b border-[#1E293B]/70 select-none overflow-x-auto text-xs"
      aria-label="Negotiation Intelligence Process Pipeline"
    >
      <div className="flex items-center gap-1 w-full min-w-[700px]">
        {STAGES.map((stage, idx) => {
          const status = getStageStatus(idx, stage.id);
          const isCurrentActive = currentStage === stage.id;

          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => onSelectStage(stage.id)}
                className={`relative flex items-center gap-2 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer group ${
                  isCurrentActive
                    ? 'text-[#F8FAFC] font-medium'
                    : status === 'COMPLETED'
                    ? 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    : 'text-[#94A3B8]/60 hover:text-[#94A3B8]'
                }`}
                aria-current={isCurrentActive ? 'step' : undefined}
              >
                {/* Step indicator dot or check */}
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-mono transition-colors ${
                    status === 'COMPLETED'
                      ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40'
                      : isCurrentActive
                      ? 'bg-[#38BDF8] text-[#070A0F] font-bold'
                      : 'bg-[#121923] text-[#94A3B8] border border-[#1E293B]'
                  }`}
                >
                  {status === 'COMPLETED' ? <Check className="w-2.5 h-2.5 stroke-[2.5]" /> : idx + 1}
                </span>

                {/* Stage Label */}
                <span className="tracking-tight whitespace-nowrap">
                  {stage.label}
                </span>

                {/* Underline for selected focus */}
                {isCurrentActive && (
                  <motion.div
                    layoutId="pipelineStageActiveLine"
                    className="absolute bottom-0 left-2 right-2 h-[1px] bg-[#38BDF8]"
                    transition={{ duration: 0.15 }}
                  />
                )}
              </button>

              {/* Quiet hairline connector */}
              {idx < STAGES.length - 1 && (
                <span className="text-[#1E293B] font-mono text-[10px] px-0.5 select-none" aria-hidden="true">
                  →
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
