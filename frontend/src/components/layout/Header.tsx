import React, { useState } from 'react';
import { NegotiationContext } from '../../types/negotiation';

interface HeaderProps {
  currentScenario: NegotiationContext;
  onSelectScenario: (scenarioId: string) => void;
  allScenarios: NegotiationContext[];
  memoryCount: number;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectScenario,
  allScenarios,
  memoryCount,
  onOpenSettings,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-space-lg flex items-center justify-between border-b border-surface-container/60">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
              NEGOTIATION MEMORY
            </span>
            <span className="bg-primary-fixed text-on-primary-fixed-variant font-label-caps text-label-caps px-space-xs py-0.5 rounded font-semibold">
              ENTERPRISE
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Institutional Intelligence Console
          </span>
        </div>
      </div>

      {/* Middle Active Case Switcher Pill */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="hidden md:flex items-center gap-space-md bg-surface-container-low px-space-md py-space-xs rounded-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:bg-surface-container transition-colors cursor-pointer text-left border border-surface-container"
        >
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
              {currentScenario.supplier} · {currentScenario.category}
            </span>
            <span
              className={`font-label-caps text-label-caps px-space-xs py-0.5 rounded font-semibold ${
                currentScenario.supplyBalance === 'SHORTAGE' || currentScenario.supplyBalance === 'CRITICAL_DEFICIT'
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
              }`}
            >
              {currentScenario.supplyBalance}
            </span>
          </div>
          <div className="h-4 w-px bg-outline-variant"></div>
          <div className="flex items-center gap-space-xs">
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              {memoryCount.toLocaleString()}+ memories indexed
            </span>
          </div>
          <div className="h-4 w-px bg-outline-variant"></div>
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
            <span className="font-body-sm text-body-sm text-secondary font-medium">Hindsight Connected</span>
          </div>
          <span className="material-symbols-outlined text-outline text-[18px]">
            {dropdownOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute top-12 left-0 w-80 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-2 z-50">
            <div className="px-2 py-1 text-xs font-semibold text-outline uppercase tracking-wider">
              Select Active Enterprise Deal
            </div>
            {allScenarios.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelectScenario(c.id);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                  c.id === currentScenario.id ? 'bg-surface-container text-primary' : 'hover:bg-surface-container-low'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-on-surface">{c.supplier}</div>
                  <div className="text-xs text-on-surface-variant">{c.category} · {c.contractValue}</div>
                </div>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface">
                  {c.supplyBalance}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls: Fiduciary Badge & User Profile */}
      <div className="flex items-center gap-space-md">
        <div className="hidden sm:flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full">
          <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
          <span className="font-label-caps text-label-caps text-primary uppercase font-semibold">
            AI RECOMMENDS. HUMAN DECIDES.
          </span>
        </div>

        <div className="relative">
          <div
            className="flex items-center gap-space-sm pl-space-sm cursor-pointer"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xs">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-none font-semibold">
                Dir. Procurement
              </span>
              <span className="font-code-id text-code-id text-on-surface-variant">
                Executive Fiduciary
              </span>
            </div>
            <button
              className="p-space-xs rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings?.();
              }}
              title="Console Settings"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </div>

          {userMenuOpen && (
            <div className="absolute right-0 top-12 w-64 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-3 z-50">
              <div className="pb-2 border-b border-surface-container">
                <div className="font-semibold text-sm text-on-surface">Elena Vance (Level 4)</div>
                <div className="text-xs text-on-surface-variant">Chief Procurement Officer</div>
                <div className="font-mono text-[10px] text-outline mt-0.5">Auth ID: EV-88902-EXEC</div>
              </div>
              <div className="py-1 text-xs text-on-surface-variant space-y-1 mt-1">
                <div className="flex justify-between py-1 px-1 rounded hover:bg-surface-container-low cursor-pointer">
                  <span>Cryptographic Key</span>
                  <span className="text-tertiary font-medium">Active (Ed25519)</span>
                </div>
                <div className="flex justify-between py-1 px-1 rounded hover:bg-surface-container-low cursor-pointer">
                  <span>FastAPI Service</span>
                  <span className="text-primary font-medium">v4.2 Connected</span>
                </div>
                <div className="flex justify-between py-1 px-1 rounded hover:bg-surface-container-low cursor-pointer">
                  <span>Hindsight Bank</span>
                  <span className="text-tertiary font-medium">negotiation-memory</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
