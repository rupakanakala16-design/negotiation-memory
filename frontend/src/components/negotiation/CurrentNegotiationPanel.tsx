import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders } from 'lucide-react';
import { NegotiationContext, SupplyBalance, LeverageLevel, UrgencyLevel } from '../../types/negotiation';

interface CurrentNegotiationPanelProps {
  scenario: NegotiationContext;
  onUpdateScenario: (updated: NegotiationContext) => void;
}

export const CurrentNegotiationPanel: React.FC<CurrentNegotiationPanelProps> = ({
  scenario,
  onUpdateScenario
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <section className="pt-2 pb-4 border-b border-[#1E293B]/70" aria-label="Current Negotiation Briefing">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        {/* Large Case Briefing Statement */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] mb-1">
            Current Case Briefing · [{scenario.code}]
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
            {scenario.supplier.toUpperCase()}
          </h2>

          <div className="text-sm text-[#94A3B8] font-normal mt-0.5">
            {scenario.category} · <span className="font-mono text-[#F8FAFC] font-semibold">{scenario.contractValue}</span> Contract Value
          </div>

          {/* Quiet Current-State Line separated by typographic dots */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-[#94A3B8]">
            <span className="text-[#38BDF8] font-bold">{scenario.supplyBalance}</span>
            <span aria-hidden="true">·</span>
            <span>{scenario.supplierLeverage} SUPPLIER LEVERAGE</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#34D399]">{scenario.buyerLeverage} BUYER LEVERAGE</span>
            <span aria-hidden="true">·</span>
            <span>{scenario.urgency} URGENCY</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#F8FAFC] font-medium">{scenario.alternativeSuppliers} QUALIFIED ALTERNATIVES</span>
          </div>
        </div>

        {/* Quiet Condition Simulator Trigger */}
        <div className="shrink-0 self-start md:self-end">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-1.5 py-1 px-2.5 rounded bg-[#0D1118] border border-[#1E293B] cursor-pointer"
            aria-expanded={isEditing}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Market Shift</span>
          </button>
        </div>
      </div>

      {/* Simulator Drawer */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden mt-3 pt-3 border-t border-[#1E293B] text-xs"
          >
            <div className="text-[11px] font-mono text-[#94A3B8] mb-2 flex justify-between">
              <span>Adjust parameters to observe Hindsight condition divergence in real time:</span>
              <button
                onClick={() => {
                  onUpdateScenario({
                    ...scenario,
                    supplyBalance: 'SURPLUS',
                    supplierLeverage: 'LOW',
                    buyerLeverage: 'HIGH',
                    urgency: 'FLEXIBLE',
                    alternativeSuppliers: 6
                  });
                }}
                className="text-[#38BDF8] hover:underline"
              >
                Reset to Surplus Reality
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-mono text-[#94A3B8] block mb-1">
                  Supply Balance
                </label>
                <select
                  value={scenario.supplyBalance}
                  onChange={(e) =>
                    onUpdateScenario({
                      ...scenario,
                      supplyBalance: e.target.value as SupplyBalance
                    })
                  }
                  className="w-full bg-[#070A0F] border border-[#1E293B] rounded p-1.5 text-xs text-[#F8FAFC] font-mono"
                >
                  <option value="SURPLUS">SURPLUS</option>
                  <option value="BALANCED">BALANCED</option>
                  <option value="SHORTAGE">SHORTAGE</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#94A3B8] block mb-1">
                  Supplier Leverage
                </label>
                <select
                  value={scenario.supplierLeverage}
                  onChange={(e) =>
                    onUpdateScenario({
                      ...scenario,
                      supplierLeverage: e.target.value as LeverageLevel
                    })
                  }
                  className="w-full bg-[#070A0F] border border-[#1E293B] rounded p-1.5 text-xs text-[#F8FAFC] font-mono"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#94A3B8] block mb-1">
                  Urgency
                </label>
                <select
                  value={scenario.urgency}
                  onChange={(e) =>
                    onUpdateScenario({
                      ...scenario,
                      urgency: e.target.value as UrgencyLevel
                    })
                  }
                  className="w-full bg-[#070A0F] border border-[#1E293B] rounded p-1.5 text-xs text-[#F8FAFC] font-mono"
                >
                  <option value="FLEXIBLE">FLEXIBLE</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#94A3B8] block mb-1">
                  Alternatives ({scenario.alternativeSuppliers})
                </label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={scenario.alternativeSuppliers}
                  onChange={(e) =>
                    onUpdateScenario({
                      ...scenario,
                      alternativeSuppliers: parseInt(e.target.value, 10)
                    })
                  }
                  className="w-full accent-[#38BDF8]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
