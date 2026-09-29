import React from 'react';
import { PastExperience } from '../../types/negotiation';

interface PrecedentDossierModalProps {
  experience: PastExperience | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrecedentDossierModal: React.FC<PrecedentDossierModalProps> = ({
  experience,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !experience) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-space-lg py-space-md border-b border-surface-container flex items-center justify-between bg-surface-container-low shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {experience.supplier}
                </span>
                <span className="bg-primary-fixed text-on-primary-fixed-variant font-code-id text-code-id px-1.5 py-0.5 rounded font-bold">
                  {experience.id}
                </span>
              </div>
              <p className="font-code-id text-code-id text-on-surface-variant">
                Category: {experience.category} · Executed: {experience.dealDate}
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

        {/* Body */}
        <div className="p-space-lg overflow-y-auto space-y-space-md">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm bg-surface-container-low p-space-md rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-outline block">Condition</span>
              <span className="font-headline-sm text-body-sm font-bold text-on-surface">
                {experience.supplyBalance}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-outline block">Vector Similarity</span>
              <span className="font-headline-sm text-body-sm font-bold text-primary">
                {experience.relevanceScore}% Match
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-outline block">Supplier Leverage</span>
              <span className="font-headline-sm text-body-sm font-bold text-on-surface">
                {experience.supplierLeverage}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-outline block">Outcome</span>
              <span className="font-headline-sm text-body-sm font-bold text-tertiary">
                {experience.outcomeResult}
              </span>
            </div>
          </div>

          {/* Core Strategic Context */}
          <div className="space-y-space-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-semibold">
              Historical Context & Objective
            </span>
            <p className="font-body-md text-body-md text-on-surface bg-surface-container-low p-space-md rounded-xl leading-relaxed">
              {experience.historicalContext}
            </p>
          </div>

          {/* Strategy Employed */}
          <div className="space-y-space-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-semibold">
              Strategy Employed
            </span>
            <p className="font-body-md text-body-md text-on-surface bg-surface-container-low p-space-md rounded-xl leading-relaxed">
              {experience.strategyUsed}
            </p>
          </div>

          {/* Outcome & Retrospective */}
          <div className="space-y-space-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-semibold">
              Outcome Summary & Financial Impact
            </span>
            <div className="bg-surface-container-low p-space-md rounded-xl flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface font-medium">
                {experience.outcomeSummary}
              </span>
              <span className="font-code-id text-code-id text-tertiary font-bold">
                {experience.costImpact}
              </span>
            </div>
          </div>

          {/* Hindsight Retrospective Lesson */}
          <div className="bg-secondary-fixed/30 rounded-xl p-space-md border border-secondary-fixed space-y-1">
            <div className="flex items-center gap-1 text-secondary font-label-caps text-label-caps uppercase font-bold">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Hindsight Institutional Lesson</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
              “{experience.hindsightLesson}”
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-space-lg py-space-md border-t border-surface-container flex items-center justify-between bg-surface-container-low shrink-0">
          <span className="font-code-id text-code-id text-outline">
            Precedent Record: {experience.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
