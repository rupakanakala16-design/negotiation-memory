import React, { useState, useMemo } from 'react';
import { PastExperience } from '../types/negotiation';

interface PastExperiencesViewProps {
  memories: PastExperience[];
  onOpenDossier?: (exp: PastExperience) => void;
  onShowToast?: (title: string, desc?: string, hash?: string) => void;
}

export const PastExperiencesView: React.FC<PastExperiencesViewProps> = ({
  memories,
  onOpenDossier,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('All Suppliers');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [selectedOutcome, setSelectedOutcome] = useState('All Outcomes');
  const [selectedSort, setSelectedSort] = useState('Sort: Most Recent');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Extract unique suppliers and categories from real memories
  const uniqueSuppliers = useMemo(() => {
    const set = new Set<string>();
    memories.forEach((m) => set.add(m.supplier));
    return Array.from(set);
  }, [memories]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    memories.forEach((m) => set.add(m.category));
    return Array.from(set);
  }, [memories]);

  // Filter and sort real memories
  const filteredExperiences = useMemo(() => {
    return memories.filter((exp) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        searchTerm === '' ||
        exp.supplier.toLowerCase().includes(term) ||
        exp.strategyUsed.toLowerCase().includes(term) ||
        exp.hindsightLesson.toLowerCase().includes(term) ||
        exp.historicalContext.toLowerCase().includes(term) ||
        exp.category.toLowerCase().includes(term) ||
        exp.id.toLowerCase().includes(term);

      const matchSupplier =
        selectedSupplier === 'All Suppliers' || exp.supplier === selectedSupplier;

      const matchCategory =
        selectedCategory === 'All Categories' || exp.category === selectedCategory;

      const matchCondition =
        selectedCondition === 'All Conditions' ||
        (selectedCondition === 'Shortage Cycle' && exp.supplyBalance === 'SHORTAGE') ||
        (selectedCondition === 'Surplus' && exp.supplyBalance === 'SURPLUS') ||
        (selectedCondition === 'Critical Deficit' && exp.supplyBalance === 'CRITICAL_DEFICIT') ||
        (selectedCondition === 'Balanced' && exp.supplyBalance === 'BALANCED');

      const matchOutcome =
        selectedOutcome === 'All Outcomes' ||
        (selectedOutcome === 'Successful' && exp.outcomeResult === 'SUCCESSFUL') ||
        (selectedOutcome === 'Partial' && exp.outcomeResult === 'PARTIAL') ||
        (selectedOutcome === 'Failed' && exp.outcomeResult === 'FAILED');

      return matchSearch && matchSupplier && matchCategory && matchCondition && matchOutcome;
    }).sort((a, b) => {
      if (selectedSort === 'Sort: Highest Analogue %') {
        return b.relevanceScore - a.relevanceScore;
      }
      return 0;
    });
  }, [memories, searchTerm, selectedSupplier, selectedCategory, selectedCondition, selectedOutcome, selectedSort]);

  const totalPages = Math.max(1, Math.ceil(filteredExperiences.length / itemsPerPage));
  const currentItems = filteredExperiences.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSupplier('All Suppliers');
    setSelectedCategory('All Categories');
    setSelectedCondition('All Conditions');
    setSelectedOutcome('All Outcomes');
    setSelectedSort('Sort: Most Recent');
    setCurrentPage(1);
    onShowToast?.('Filters Reset', `Showing all ${memories.length} institutional negotiation precedents.`);
  };

  const handleExportCSV = () => {
    const headers = ['Memory ID', 'Supplier', 'Category', 'Date', 'Supply Balance', 'Relevance %', 'Objective / Context', 'Strategy Employed', 'Outcome Result', 'Financial Impact', 'Hindsight Lesson'];
    const rows = filteredExperiences.map((e) => [
      `"${e.id}"`,
      `"${e.supplier}"`,
      `"${e.category}"`,
      `"${e.dealDate}"`,
      `"${e.supplyBalance}"`,
      `"${e.relevanceScore}%"`,
      `"${(e.historicalContext || '').replace(/"/g, '""')}"`,
      `"${(e.strategyUsed || '').replace(/"/g, '""')}"`,
      `"${e.outcomeResult}"`,
      `"${(e.costImpact || '').replace(/"/g, '""')}"`,
      `"${(e.hindsightLesson || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'institutional_precedents_dossier.csv';
    link.click();
    URL.revokeObjectURL(url);

    onShowToast?.('Precedent Dossier Exported', `Exported ${filteredExperiences.length} precedent records to CSV.`);
  };

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Page Header & Index Status Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-sm mb-space-lg">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary font-semibold">
              PRE-APPROVED PRECEDENTS
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="font-code-id text-code-id text-on-surface-variant font-medium">
              MILVUS COSINE SIMILARITY ENGINE
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            PAST EXPERIENCES
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Institutional Memory Library — Historical negotiations available for contextual recall, tactical precedent anchoring, and risk pattern mitigation.
          </p>
        </div>

        {/* Metric / Sync Counter */}
        <div className="flex items-center gap-space-md bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm self-start md:self-auto border border-surface-container">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
              <span className="font-label-caps text-label-caps text-on-surface font-bold tracking-wider">
                {memories.length} EXPERIENCES INDEXED
              </span>
            </div>
            <div className="flex items-center gap-space-xs mt-0.5">
              <span className="font-code-id text-code-id text-on-surface-variant">
                FastAPI / Hindsight Connected
              </span>
              <span className="font-code-id text-code-id text-tertiary font-semibold">· 0.04s latency</span>
            </div>
          </div>
          <div className="h-8 w-px bg-surface-container"></div>
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export CSV"
            className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container flex items-center justify-center text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
        </div>
      </div>

      {/* Top Controls & Filtering Toolbar */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg flex flex-col lg:flex-row gap-space-md items-stretch lg:items-center justify-between border border-surface-container">
        {/* Search Bar */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search experiences by supplier, clause, or market dynamic..."
            className="w-full bg-surface-container-low pl-10 pr-space-md py-2.5 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all border border-surface-container"
          />
        </div>

        {/* Dropdown Filters & Sort */}
        <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
          {/* Supplier Selector */}
          <div className="relative">
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm pl-space-md pr-8 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-container transition-colors border border-surface-container"
            >
              <option>All Suppliers</option>
              {uniqueSuppliers.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Category Selector */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm pl-space-md pr-8 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-container transition-colors border border-surface-container"
            >
              <option>All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Condition Selector */}
          <div className="relative">
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm pl-space-md pr-8 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-container transition-colors border border-surface-container"
            >
              <option>All Conditions</option>
              <option>Shortage Cycle</option>
              <option>Surplus</option>
              <option>Critical Deficit</option>
              <option>Balanced</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Outcome Selector */}
          <div className="relative">
            <select
              value={selectedOutcome}
              onChange={(e) => {
                setSelectedOutcome(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm pl-space-md pr-8 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-container transition-colors border border-surface-container"
            >
              <option>All Outcomes</option>
              <option>Successful</option>
              <option>Partial</option>
              <option>Failed</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          <div className="h-6 w-px bg-surface-container mx-space-xs hidden md:block"></div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="appearance-none bg-surface-container text-primary font-body-sm text-body-sm font-medium pl-space-md pr-8 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-container transition-colors border border-surface-container"
            >
              <option>Sort: Most Recent</option>
              <option>Sort: Highest Analogue %</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-primary text-[16px] pointer-events-none">
              swap_vert
            </span>
          </div>
        </div>
      </div>

      {/* Active Context Filter Pills */}
      <div className="flex items-center gap-space-xs flex-wrap mb-space-md px-1">
        <span className="font-code-id text-code-id text-on-surface-variant mr-space-xs">
          Active Precedent Filters:
        </span>
        <span className="inline-flex items-center gap-1 bg-surface-container-high text-primary px-space-xs py-0.5 rounded-full font-label-caps text-label-caps">
          SUPPLIERS: {selectedSupplier}
        </span>
        <span className="inline-flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-space-xs py-0.5 rounded-full font-label-caps text-label-caps">
          HINDSIGHT WEIGHT: 1.0x
        </span>
        <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface-variant px-space-xs py-0.5 rounded-full font-label-caps text-label-caps">
          CONFIDENCE THRESHOLD &gt; 75%
        </span>
        <button
          type="button"
          onClick={handleResetFilters}
          className="font-label-caps text-label-caps text-primary hover:underline ml-space-xs font-semibold cursor-pointer"
        >
          Reset Filters
        </button>
      </div>

      {/* Cards Grid — Clean Light Enterprise Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
        {currentItems.map((exp) => (
          <div
            key={exp.id}
            className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group border border-surface-container"
          >
            <div>
              {/* Top Bar: Supplier, Category, ID, Score */}
              <div className="flex items-start justify-between gap-space-xs mb-space-sm">
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight group-hover:text-primary transition-colors truncate">
                    {exp.supplier}
                  </span>
                  <div className="flex items-center gap-space-xs mt-0.5">
                    <span className="font-code-id text-code-id text-on-surface-variant">
                      {exp.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span className="font-code-id text-code-id text-outline font-medium">
                      {exp.id}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1 bg-primary-fixed text-on-primary-fixed font-code-id text-code-id px-space-xs py-1 rounded-md font-semibold tracking-tight shadow-2xs shrink-0">
                  <span className="material-symbols-outlined text-[13px] text-primary">target</span>
                  <span>{exp.relevanceScore}% Match</span>
                </div>
              </div>

              {/* Date & Market Condition Badge */}
              <div className="flex items-center justify-between py-space-xs px-space-sm bg-surface-container-low rounded-lg mb-space-md border border-surface-container/60">
                <div className="flex items-center gap-1.5 text-on-surface-variant font-code-id text-code-id">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  <span>{exp.dealDate}</span>
                </div>
                <span
                  className={`font-label-caps text-label-caps px-space-xs py-0.5 rounded font-bold uppercase tracking-wider ${
                    exp.supplyBalance === 'SHORTAGE' || exp.supplyBalance === 'CRITICAL_DEFICIT'
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                  }`}
                >
                  {exp.supplyBalance}
                </span>
              </div>

              {/* Objective & Strategy Employed */}
              <div className="flex flex-col gap-space-xs mb-space-md">
                <div className="bg-surface-container-low/70 p-space-sm rounded-lg border border-surface-container/40">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block mb-0.5 font-semibold">
                    Negotiation Objective / Context
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-snug line-clamp-2">
                    {exp.historicalContext}
                  </p>
                </div>
                <div className="bg-surface-container-low/70 p-space-sm rounded-lg border border-surface-container/40">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block mb-0.5 font-semibold">
                    Strategy Employed
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface leading-snug line-clamp-2">
                    {exp.strategyUsed}
                  </p>
                </div>
              </div>

              {/* Outcome Metrics */}
              <div className="mb-space-md bg-surface-container-high/40 p-space-sm rounded-lg flex items-center justify-between border border-surface-container/60">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps uppercase text-outline">
                    Realized Outcome
                  </span>
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                    {exp.outcomeSummary || exp.outcomeResult}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-label-caps text-label-caps uppercase text-outline">
                    Financial Impact
                  </span>
                  <span className="font-code-id text-code-id font-bold text-tertiary">
                    {exp.costImpact}
                  </span>
                </div>
              </div>
            </div>

            {/* Hindsight Retrospective Lesson */}
            <div className="bg-secondary-fixed/40 rounded-lg p-space-sm border border-secondary-fixed/70">
              <div className="flex items-center gap-1 mb-1 text-secondary font-label-caps text-label-caps uppercase font-bold tracking-wider">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                <span>Hindsight Retrospective Lesson</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface font-normal italic leading-relaxed line-clamp-3">
                “{exp.hindsightLesson}”
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 text-on-surface-variant font-code-id text-code-id border-t border-secondary-fixed/40">
                <span className="text-secondary font-medium">Record: {exp.id}</span>
                <button
                  type="button"
                  onClick={() => onOpenDossier?.(exp)}
                  className="text-primary hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                >
                  <span>View dossier</span>
                  <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination & Summary */}
      <div className="mt-space-lg bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md border border-surface-container">
        <div className="flex items-center gap-space-xs">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Showing</span>
          <span className="font-body-sm text-body-sm font-semibold text-on-surface">
            {filteredExperiences.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredExperiences.length)}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">of</span>
          <span className="font-body-sm text-body-sm font-semibold text-on-surface">
            {filteredExperiences.length} institutional negotiation precedents
          </span>
        </div>

        {/* Navigation Pagination Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={`px-space-sm py-1.5 rounded-lg font-body-sm text-body-sm flex items-center gap-0.5 border border-surface-container ${
              currentPage === 1
                ? 'text-outline bg-surface-container-low opacity-50 cursor-not-allowed'
                : 'text-on-surface bg-surface-container-low hover:bg-surface-container cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            <span>Previous</span>
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg font-body-sm text-body-sm flex items-center justify-center cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={`px-space-sm py-1.5 rounded-lg font-body-sm text-body-sm flex items-center gap-0.5 border border-surface-container ${
              currentPage === totalPages
                ? 'text-outline bg-surface-container-low opacity-50 cursor-not-allowed'
                : 'text-on-surface bg-surface-container-low hover:bg-surface-container cursor-pointer'
            }`}
          >
            <span>Next</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
