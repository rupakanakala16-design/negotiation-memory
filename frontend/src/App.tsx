import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { CommandCenter } from './pages/CommandCenter';
import { ActiveNegotiationView } from './pages/ActiveNegotiationView';
import { PastExperiencesView } from './pages/PastExperiencesView';
import { HindsightMemoryView } from './pages/HindsightMemoryView';
import { IntelligenceTimelineView } from './pages/IntelligenceTimelineView';
import { MarketShiftModal } from './components/modals/MarketShiftModal';
import { ContractInspectorModal } from './components/modals/ContractInspectorModal';
import { CounterfactualModal } from './components/modals/CounterfactualModal';
import { PrecedentDossierModal } from './components/modals/PrecedentDossierModal';
import { Toast } from './components/common/Toast';
import {
  SCENARIOS,
  RECALLED_MEMORIES,
  INITIAL_RETAINED_OUTCOMES
} from './data/mockData';
import { NegotiationContext, PastExperience, RetainedOutcomeRecord } from './types/negotiation';
import { getNegotiations, getMemories, getTimeline } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('01');
  const [allScenarios, setAllScenarios] = useState<NegotiationContext[]>(SCENARIOS);
  const [currentScenario, setCurrentScenario] = useState<NegotiationContext>(SCENARIOS[0]);
  const [memories, setMemories] = useState<PastExperience[]>(RECALLED_MEMORIES);
  const [retainedRecords, setRetainedRecords] = useState<RetainedOutcomeRecord[]>(
    INITIAL_RETAINED_OUTCOMES
  );

  // Modals state
  const [marketShiftOpen, setMarketShiftOpen] = useState(false);
  const [contractInspectorOpen, setContractInspectorOpen] = useState(false);
  const [counterfactualOpen, setCounterfactualOpen] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<PastExperience | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    desc?: string;
    hash?: string;
  }>({
    show: false,
    title: '',
  });

  const showToast = (title: string, desc?: string, hash?: string) => {
    setToast({ show: true, title, desc, hash });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { negotiations } = await getNegotiations();
        if (negotiations && negotiations.length > 0) {
          setAllScenarios(negotiations);
          setCurrentScenario(negotiations[0]);
        }
        const { memories: fetchedMemories } = await getMemories();
        if (fetchedMemories && fetchedMemories.length > 0) {
          setMemories(fetchedMemories);
        }
        const { retainedRecords: fetchedRetained } = await getTimeline();
        if (fetchedRetained && fetchedRetained.length > 0) {
          setRetainedRecords(fetchedRetained);
        }
      } catch (err) {
        console.info('API service initial load completed with fallback:', err);
      }
    }
    loadData();
  }, []);

  const handleSelectScenario = (id: string) => {
    const found = allScenarios.find((s) => s.id === id);
    if (found) {
      setCurrentScenario(found);
      showToast(`Case Context Switched to ${found.supplier}`);
    }
  };

  const handleUpdateScenario = (updated: NegotiationContext) => {
    setCurrentScenario(updated);
    setAllScenarios((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleCommitNewMemory = (newMemory: PastExperience) => {
    setMemories((prev) => [newMemory, ...prev]);

    const newRecord: RetainedOutcomeRecord = {
      id: `RET-2026-${(retainedRecords.length + 1).toString().padStart(3, '0')}`,
      negotiationId: currentScenario.id,
      supplier: currentScenario.supplier,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      decision: 'ACCEPTED',
      finalTactic: newMemory.strategyUsed,
      directorNotes: newMemory.historicalContext,
      projectedSavings: newMemory.costImpact,
      status: 'RETAINED'
    };

    setRetainedRecords((prev) => [newRecord, ...prev]);
  };

  const handleApplyShift = (settings: { spotIndexDrop: number; fabUtilization: number; qualifiedFabs: number }) => {
    const updated: NegotiationContext = {
      ...currentScenario,
      supplyBalance: settings.spotIndexDrop < 0 && settings.fabUtilization < 80 ? 'SURPLUS' : 'SHORTAGE',
      alternativeSuppliers: settings.qualifiedFabs,
      supplierLeverage: settings.fabUtilization < 75 ? 'LOW' : 'HIGH',
      buyerLeverage: settings.qualifiedFabs >= 4 ? 'HIGH' : 'MEDIUM'
    };
    handleUpdateScenario(updated);
    showToast(
      'Market Shift Scenarios Injected',
      `Spot index delta: ${settings.spotIndexDrop}%, Fab utilization: ${settings.fabUtilization}%, Alternatives: ${settings.qualifiedFabs}.`,
      'STRATEGY VECTOR RE-WEIGHTED'
    );
  };

  const handleOpenDossier = (exp: PastExperience) => {
    setSelectedExperience(exp);
    setDossierOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex">
      {/* 1. Fixed Light Enterprise Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        retainedCount={retainedRecords.length}
        milvusSyncRate="99.8%"
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 pl-64">
        {/* Fixed Header */}
        <Header
          currentScenario={currentScenario}
          onSelectScenario={handleSelectScenario}
          allScenarios={allScenarios}
          memoryCount={memories.length + 1414}
          onOpenSettings={() => {
            showToast(
              'Console Settings: Fiduciary Mode',
              'Ed25519 signature enforcement active · Zero drift verification enabled.'
            );
          }}
        />

        {/* View Viewport */}
        <main className="w-full pt-14 px-space-lg bg-surface min-h-screen">
          <div className="py-space-md">
            {activeTab === '01' && (
              <CommandCenter
                currentScenario={currentScenario}
                onUpdateScenario={handleUpdateScenario}
                memories={memories}
                onCommitNewMemory={handleCommitNewMemory}
                onNavigate={setActiveTab}
                onOpenMarketShift={() => setMarketShiftOpen(true)}
                onOpenDossier={handleOpenDossier}
                onShowToast={showToast}
              />
            )}

            {activeTab === '02' && (
              <ActiveNegotiationView
                scenario={currentScenario}
                onUpdateScenario={handleUpdateScenario}
                memories={memories}
                onCommitNewMemory={handleCommitNewMemory}
                onNavigate={setActiveTab}
                onShowToast={showToast}
                onOpenContractInspector={() => setContractInspectorOpen(true)}
                onOpenCounterfactual={() => setCounterfactualOpen(true)}
                onOpenDossier={handleOpenDossier}
              />
            )}

            {activeTab === '03' && (
              <PastExperiencesView
                memories={memories}
                onOpenDossier={handleOpenDossier}
                onShowToast={showToast}
              />
            )}

            {activeTab === '04' && (
              <HindsightMemoryView
                memories={memories}
                currentScenario={currentScenario}
                onNavigate={setActiveTab}
                onShowToast={showToast}
              />
            )}

            {activeTab === '05' && (
              <IntelligenceTimelineView
                retainedRecords={retainedRecords}
                onNavigate={setActiveTab}
                onShowToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Interactive Modals */}
      <MarketShiftModal
        isOpen={marketShiftOpen}
        onClose={() => setMarketShiftOpen(false)}
        onApplyShift={handleApplyShift}
      />

      <ContractInspectorModal
        isOpen={contractInspectorOpen}
        onClose={() => setContractInspectorOpen(false)}
        supplierName={currentScenario.supplier}
      />

      <CounterfactualModal
        isOpen={counterfactualOpen}
        onClose={() => setCounterfactualOpen(false)}
      />

      <PrecedentDossierModal
        experience={selectedExperience}
        isOpen={dossierOpen}
        onClose={() => setDossierOpen(false)}
      />

      {/* Global Toast */}
      <Toast
        show={toast.show}
        title={toast.title}
        desc={toast.desc}
        hash={toast.hash}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
