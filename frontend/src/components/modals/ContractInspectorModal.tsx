import React from 'react';

interface ContractInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName?: string;
}

export const ContractInspectorModal: React.FC<ContractInspectorModalProps> = ({
  isOpen,
  onClose,
  supplierName = 'Alpha Supplier',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-space-lg py-space-md border-b border-surface-container flex items-center justify-between bg-surface-container-low shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">history_edu</span>
            </div>
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {supplierName} Raw Silicon Master Agreement
                </span>
                <span className="bg-error-container text-on-error-container font-code-id text-code-id px-1.5 py-0.5 rounded font-bold">
                  ARCHIVED PRECEDENT
                </span>
              </div>
              <p className="font-code-id text-code-id text-on-surface-variant">
                Precedent: MEM-2021-998 · Annual Commitment: $42.0M USD · Executed: August 2021
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
          {/* Post-Mortem Forensic Callout */}
          <div className="p-space-md rounded-xl bg-error-container/30 border border-error-container flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-error text-[22px] shrink-0 mt-0.5">
              report_problem
            </span>
            <div>
              <div className="font-headline-sm text-headline-sm text-on-error-container font-bold">
                Institutional Post-Mortem Finding: $4.8M Overpayment Hazard
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                During the 2021 silicon bottleneck, this contract successfully guaranteed zero line-down events. However, the rigid 3-year take-or-pay structure (Clause 14.2) became an encumbrance when market supply normalized in 2022, resulting in significant uncollected wafer penalties.
              </p>
            </div>
          </div>

          {/* Raw Clause Dissection */}
          <div className="space-y-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-semibold">
              Archived Precedent Clauses
            </span>

            {/* Clause 14.2 */}
            <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-code-id text-code-id text-primary font-bold">
                  Clause 14.2 — Minimum Annual Purchase Commitment (Take-or-Pay)
                </span>
                <span className="text-error font-code-id text-code-id font-semibold">High Liability Risk</span>
              </div>
              <p className="font-code-id text-xs text-on-surface bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container leading-relaxed font-mono">
                "Buyer unconditionally warrants an annual draw of not less than 480,000 baseline wafer units. In the event of buyer demand deceleration, uncalled capacity will be billed at eighty-five percent (85%) of gross contracted unit pricing."
              </p>
            </div>

            {/* Clause 8.1 */}
            <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-code-id text-code-id text-primary font-bold">
                  Clause 8.1 — Fixed Unit Escalation Benchmark
                </span>
                <span className="text-outline font-code-id text-code-id font-medium">Fixed Escalator</span>
              </div>
              <p className="font-code-id text-xs text-on-surface bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container leading-relaxed font-mono">
                "Year 1 pricing set at $142.00 per unit, escalating by a compounding 3.5% annually regardless of ICIS polycrystalline silicon spot index fluctuations."
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-space-lg py-space-md border-t border-surface-container flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-code-id text-code-id">
            <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
            <span>Cryptographic Precedent ID: #MEM-2021-998</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
