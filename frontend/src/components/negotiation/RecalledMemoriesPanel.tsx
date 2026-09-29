import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PastExperience } from '../../types/negotiation';

interface RecalledMemoriesPanelProps {
  memories: PastExperience[];
  selectedMemoryId: string | null;
  onSelectMemory: (id: string | null) => void;
}

export const RecalledMemoriesPanel: React.FC<RecalledMemoriesPanelProps> = ({
  memories,
  selectedMemoryId,
  onSelectMemory
}) => {
  const [showAll, setShowAll] = useState(false);

  // Top 3 primary precedent memories, with others expandable
  const primaryMemories = showAll ? memories : memories.slice(0, 3);

  return (
    <div className="space-y-3" aria-labelledby="recalled-memories-title">
      <div className="flex items-baseline justify-between border-b border-[#1E293B]/60 pb-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
            Hindsight Memory Precedents
          </span>
          <h4 id="recalled-memories-title" className="text-base font-semibold text-[#F8FAFC]">
            Recalled Past Experiences
          </h4>
        </div>

        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-mono text-[#38BDF8] hover:underline cursor-pointer"
        >
          {showAll ? 'Show Top 3' : `View All (${memories.length})`}
        </button>
      </div>

      <div className="space-y-2">
        {primaryMemories.map((mem) => {
          const isSelected = selectedMemoryId === mem.id;

          return (
            <div
              key={mem.id}
              onClick={() => onSelectMemory(isSelected ? null : mem.id)}
              className={`p-3 rounded transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-[#0D1118] border-[#38BDF8]/50'
                  : 'bg-[#070A0F] border-[#1E293B]/70 hover:border-[#1E293B] hover:bg-[#0D1118]/60'
              }`}
            >
              {/* Top row: Supplier & Relevance */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-[#F8FAFC] tracking-tight">
                    {mem.supplier.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    · {mem.dealDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-[#F8FAFC] tabular-nums">
                    {mem.relevanceScore}%
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">relevance</span>
                </div>
              </div>

              {/* Animated Vector Similarity Bar (0% → score) */}
              <div className="w-full h-1 bg-[#121923] rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mem.relevanceScore}%` }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="h-full bg-[#38BDF8]/80 rounded-full"
                />
              </div>

              {/* Strategy & Outcome line */}
              <div className="text-xs text-[#94A3B8] leading-tight">
                <span className="text-[#F8FAFC] font-medium block">
                  {mem.strategyUsed}
                </span>
                <span className="text-[11px] text-[#34D399] font-mono mt-0.5 block">
                  Outcome: {mem.outcomeSummary}
                </span>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden mt-2.5 pt-2 border-t border-[#1E293B]/60 text-xs space-y-1.5 text-[#94A3B8]"
                  >
                    <p className="leading-relaxed">
                      <strong className="text-[#F8FAFC]">Context: </strong>
                      {mem.historicalContext}
                    </p>
                    <p className="text-[11px] leading-relaxed text-[#F8FAFC]/90 bg-[#121923] p-2 rounded border border-[#1E293B]">
                      <strong className="text-[#38BDF8] font-mono uppercase text-[10px] block mb-0.5">
                        Hindsight Retrospective Lesson:
                      </strong>
                      {mem.hindsightLesson}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
