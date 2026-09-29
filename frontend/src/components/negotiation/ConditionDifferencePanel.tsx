import React from 'react';
import { motion } from 'motion/react';
import { ConditionDiffItem, NegotiationContext } from '../../types/negotiation';

interface ConditionDifferencePanelProps {
  scenario: NegotiationContext;
  differences: ConditionDiffItem[];
}

export const ConditionDifferencePanel: React.FC<ConditionDifferencePanelProps> = ({
  scenario,
  differences
}) => {
  return (
    <section
      className="py-4 border-b border-[#1E293B]/60"
      aria-labelledby="condition-difference-heading"
    >
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8]">
            Core Intelligence Divergence
          </div>
          <h3
            id="condition-difference-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]"
          >
            Condition Difference
          </h3>
        </div>

        <div className="text-xs text-[#94A3B8] font-mono">
          Precedent Model vs Present Reality
        </div>
      </div>

      {/* Why It Matters Statement */}
      <div className="mb-5 p-3 rounded bg-[#0D1118] border-l-2 border-[#38BDF8] text-xs leading-relaxed text-[#F8FAFC]/90">
        <span className="font-semibold text-[#38BDF8] mr-1.5 uppercase font-mono text-[10px]">
          Why It Matters:
        </span>
        Historical procurement playbooks succeeded under severe supply crises. Today, with surplus factory capacity and 6 qualified replacement vendors, repeating the historical volume-lock defense would needlessly surrender buyer leverage.
      </div>

      {/* Prominent Visual Comparison Grid with Generous Breathing Room */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {differences.map((diff, index) => {
          const currentVal =
            diff.dimension === 'Supply Balance'
              ? scenario.supplyBalance
              : diff.dimension === 'Supplier Leverage'
              ? `${scenario.supplierLeverage} LEVERAGE`
              : diff.dimension === 'Procurement Urgency'
              ? scenario.urgency
              : `${scenario.alternativeSuppliers} ALTERNATIVES`;

          return (
            <motion.div
              key={diff.dimension}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="p-3.5 rounded bg-[#0D1118] border border-[#1E293B]/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase text-[#94A3B8] tracking-wider block mb-2">
                  {diff.dimension}
                </span>

                {/* Transition values */}
                <div className="space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#94A3B8]/60 uppercase">Historical:</span>
                    <span className="text-[#94A3B8] line-through decoration-[#F87171]/70">
                      {diff.historicalValue}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-1 border-t border-[#1E293B]/40">
                    <span className="text-[10px] text-[#34D399] uppercase font-bold">Current:</span>
                    <span className="text-[#F8FAFC] font-bold text-sm">
                      {currentVal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consequence note */}
              <p className="text-[11px] text-[#94A3B8] mt-3 pt-2 border-t border-[#1E293B]/40 leading-snug">
                {diff.strategicImplication}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
