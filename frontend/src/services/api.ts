/**
 * Negotiation Memory — Canonical Frontend API Integration Layer
 * 
 * Connected to FastAPI Backend (Base: http://127.0.0.1:8000 via Vite proxy or direct)
 * 
 * Canonical Endpoints:
 * - GET  /api/negotiations
 * - POST /api/negotiations/analyze
 * - POST /api/negotiations/decisions
 * - POST /api/negotiations/retain
 * - GET  /api/memories
 * - GET  /api/timeline
 */

import {
  NegotiationContext,
  PastExperience,
  ConditionDiffItem,
  HindsightReflectionData,
  RecommendedStrategyData,
  RetainedOutcomeRecord,
  TimelineEvent,
  RecordDecisionRequest,
  RecordDecisionResponse,
  RetainOutcomeRequest,
  SupplyBalance,
  LeverageLevel,
  UrgencyLevel
} from '../types/negotiation';

import {
  SCENARIOS,
  RECALLED_MEMORIES,
  CONDITION_DIFFERENCES,
  HINDSIGHT_REFLECTION,
  RECOMMENDED_STRATEGY,
  INITIAL_RETAINED_OUTCOMES,
  TIMELINE_EVENTS
} from '../data/mockData';

const API_BASE = '/api';

// Helper to attempt backend request with fallback
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackData?: T
): Promise<{ data: T; isLiveBackend: boolean }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (res.ok) {
      const data = await res.json();
      return { data, isLiveBackend: true };
    }
    console.info(`[API Service] ${endpoint} returned status ${res.status}. Using adapter fallback.`);
  } catch (err) {
    console.info(`[API Service] ${endpoint} unavailable (backend offline). Using adapter fallback.`);
  }

  return { data: fallbackData as T, isLiveBackend: false };
}

// ==========================================
// DATA NORMALIZATION ADAPTERS
// ==========================================

function normalizePastExperience(raw: any, index: number): PastExperience {
  if (!raw) return RECALLED_MEMORIES[index % RECALLED_MEMORIES.length];

  const relevance = typeof raw.relevance_score === 'number'
    ? (raw.relevance_score <= 1 ? Math.round(raw.relevance_score * 100) : Math.round(raw.relevance_score))
    : typeof raw.similarity === 'number'
    ? (raw.similarity <= 1 ? Math.round(raw.similarity * 100) : Math.round(raw.similarity))
    : typeof raw.relevanceScore === 'number'
    ? raw.relevanceScore
    : 75;

  const rawSupply = String(raw.supply_balance || raw.supplyBalance || 'BALANCED').toUpperCase();
  const supplyBalance: SupplyBalance =
    rawSupply === 'SURPLUS' || rawSupply === 'SHORTAGE' || rawSupply === 'CRITICAL_DEFICIT' ? rawSupply : 'BALANCED';

  const rawLev = String(raw.supplier_leverage_level || raw.supplier_leverage || raw.supplierLeverage || 'MEDIUM').toUpperCase();
  const supplierLeverage: LeverageLevel =
    rawLev === 'LOW' || rawLev === 'HIGH' || rawLev === 'MONOPOLY' ? rawLev : 'MEDIUM';

  const rawUrg = String(raw.urgency || 'NORMAL').toUpperCase();
  const urgency: UrgencyLevel =
    rawUrg === 'FLEXIBLE' || rawUrg === 'HIGH' || rawUrg === 'CRITICAL' ? rawUrg : 'NORMAL';

  const rawOutcome = String(raw.outcome_result || raw.outcomeResult || raw.status || raw.result || 'SUCCESSFUL').toUpperCase();
  const outcomeResult: 'SUCCESSFUL' | 'PARTIAL' | 'FAILED' =
    rawOutcome === 'FAILED' ? 'FAILED' : rawOutcome === 'PARTIAL' ? 'PARTIAL' : 'SUCCESSFUL';

  const rawAlign = String(raw.condition_alignment || raw.conditionAlignment || 'ALIGNED').toUpperCase();
  const conditionAlignment: 'MISMATCH' | 'PARTIAL_ALIGNMENT' | 'ALIGNED' =
    rawAlign === 'MISMATCH' ? 'MISMATCH' : rawAlign === 'PARTIAL_ALIGNMENT' ? 'PARTIAL_ALIGNMENT' : 'ALIGNED';

  return {
    id: String(raw.id || raw.experience_id || raw.case_id || `EXP-${index + 1}`),
    supplier: raw.supplier || raw.counterparty || raw.vendor || `Supplier Precedent ${index + 1}`,
    dealDate: raw.deal_date || raw.dealDate || raw.date || 'Precedent Case',
    category: raw.category || 'Industrial Components',
    relevanceScore: relevance,
    supplyBalance,
    supplierLeverage,
    urgency,
    alternativeSuppliers: typeof raw.alternative_suppliers === 'number'
      ? raw.alternative_suppliers
      : typeof raw.alternative_supplier_count === 'number'
      ? raw.alternative_supplier_count
      : 3,
    strategyUsed: raw.strategy_used || raw.strategyUsed || raw.strategy || raw.selected_strategy || 'Competitive benchmarking',
    outcomeResult,
    outcomeSummary: raw.outcome_summary || raw.outcomeSummary || raw.outcome || 'Strategy executed with favorable terms',
    conditionAlignment,
    historicalContext: raw.historical_context || raw.historicalContext || raw.context || 'Historical market conditions',
    hindsightLesson: raw.hindsight_lesson || raw.hindsightLesson || raw.reflection || raw.lesson || 'Conditions dictate leverage execution',
    costImpact: raw.cost_impact || raw.costImpact || raw.financial_impact || 'Baseline concession achieved'
  };
}

function normalizeHindsightReflection(raw: any, recalledCount: number): HindsightReflectionData {
  if (!raw) return HINDSIGHT_REFLECTION;

  if (typeof raw === 'string') {
    return {
      memoriesConsideredCount: recalledCount || 6,
      conditionAlignedCount: 3,
      conflictingSituationsCount: 2,
      coreReasoning: raw,
      evidenceNotes: [
        'Precedent evaluation derived from current market shift.',
        'Historical playbooks adjusted for current buyer leverage.'
      ]
    };
  }

  const notes = Array.isArray(raw.evidence_notes || raw.evidenceNotes || raw.evidence || raw.key_points)
    ? (raw.evidence_notes || raw.evidenceNotes || raw.evidence || raw.key_points).map(String)
    : typeof raw.evidence === 'string'
    ? [raw.evidence]
    : HINDSIGHT_REFLECTION.evidenceNotes;

  return {
    memoriesConsideredCount: typeof raw.memories_considered_count === 'number'
      ? raw.memories_considered_count
      : typeof raw.memoriesConsideredCount === 'number'
      ? raw.memoriesConsideredCount
      : recalledCount || HINDSIGHT_REFLECTION.memoriesConsideredCount,
    conditionAlignedCount: typeof raw.condition_aligned_count === 'number'
      ? raw.condition_aligned_count
      : typeof raw.conditionAlignedCount === 'number'
      ? raw.conditionAlignedCount
      : HINDSIGHT_REFLECTION.conditionAlignedCount,
    conflictingSituationsCount: typeof raw.conflicting_situations_count === 'number'
      ? raw.conflicting_situations_count
      : typeof raw.conflictingSituationsCount === 'number'
      ? raw.conflictingSituationsCount
      : HINDSIGHT_REFLECTION.conflictingSituationsCount,
    coreReasoning: raw.core_reasoning || raw.coreReasoning || raw.reflection_text || raw.reasoning || raw.summary || HINDSIGHT_REFLECTION.coreReasoning,
    evidenceNotes: notes
  };
}

function normalizeStrategyGuidance(raw: any): RecommendedStrategyData {
  if (!raw) return RECOMMENDED_STRATEGY;

  const primaryStrategy = raw.primary_strategy || raw.primaryStrategy || raw.recommended_strategy || raw.strategy || RECOMMENDED_STRATEGY.primaryStrategy;
  const rationale = raw.rationale || raw.why || raw.explanation || raw.strategic_intent || RECOMMENDED_STRATEGY.rationale;

  const tactics = Array.isArray(raw.supporting_tactics || raw.supportingTactics || raw.tactical_levers || raw.tactics)
    ? (raw.supporting_tactics || raw.supportingTactics || raw.tactical_levers || raw.tactics).map(String)
    : RECOMMENDED_STRATEGY.supportingTactics;

  const risks = Array.isArray(raw.risk_watchlist || raw.riskWatchlist || raw.risks)
    ? (raw.risk_watchlist || raw.riskWatchlist || raw.risks).map(String)
    : RECOMMENDED_STRATEGY.riskWatchlist;

  const concession = raw.expected_concession || raw.expectedConcession || raw.target_concession || RECOMMENDED_STRATEGY.expectedConcession;

  return {
    primaryStrategy,
    rationale,
    supportingTactics: tactics,
    riskWatchlist: risks,
    expectedConcession: concession
  };
}

function normalizeConditionDifference(diffRaw: any, contrastRaw: any): ConditionDiffItem[] {
  // If array of ConditionDifferenceSchema
  if (Array.isArray(diffRaw) && diffRaw.length > 0) {
    return diffRaw.map((d: any) => ({
      dimension: d.dimension || d.name || 'Market Parameter',
      historicalValue: String(d.historical_value || d.historicalValue || d.historical || d.past || 'N/A').toUpperCase(),
      currentValue: String(d.current_value || d.currentValue || d.current || d.present || 'N/A').toUpperCase(),
      shiftType: (d.severity === 'FAVORABLE' || d.shift_type === 'FAVORABLE' || d.shiftType === 'FAVORABLE' ? 'FAVORABLE' : 'CRITICAL_SHIFT') as any,
      strategicImplication: d.strategic_implication || d.strategicImplication || d.impact || d.implication || d.notes || 'Conditions have changed leverage dynamic.'
    }));
  }

  if (Array.isArray(contrastRaw) && contrastRaw.length > 0) {
    return contrastRaw.map((c: any) => ({
      dimension: c.dimension || c.factor || 'Condition Dimension',
      historicalValue: String(c.historical || c.past_value || c.historical_value || 'Historical State').toUpperCase(),
      currentValue: String(c.current || c.current_value || 'Current State').toUpperCase(),
      shiftType: 'CRITICAL_SHIFT',
      strategicImplication: c.impact || c.implication || 'Market shift dictates strategy adjustment.'
    }));
  }

  // If backend returns canonical condition_difference dictionary
  if (diffRaw && typeof diffRaw === 'object' && Object.keys(diffRaw).length > 0) {
    const items: ConditionDiffItem[] = [];

    // Check for specific canonical keys first
    if (diffRaw.supply_balance_shift || diffRaw.supplier_leverage_shift || diffRaw.buyer_leverage_shift || diffRaw.alternative_count_shift) {
      if (diffRaw.supply_balance_shift) {
        const parts = String(diffRaw.supply_balance_shift).split('->').map((s) => s.trim());
        items.push({
          dimension: 'Supply Balance',
          historicalValue: (parts[0] || 'SHORTAGE').toUpperCase(),
          currentValue: (parts[1] || 'SURPLUS').toUpperCase(),
          shiftType: 'CRITICAL_SHIFT',
          strategicImplication: 'Transitioned from tight allocation crisis to surplus buffer inventory.'
        });
      }
      if (diffRaw.supplier_leverage_shift) {
        const parts = String(diffRaw.supplier_leverage_shift).split('->').map((s) => s.trim());
        items.push({
          dimension: 'Supplier Leverage',
          historicalValue: (parts[0] || 'HIGH').toUpperCase(),
          currentValue: (parts[1] || 'LOW').toUpperCase(),
          shiftType: 'CRITICAL_SHIFT',
          strategicImplication: 'Counterparty monopoly broken; under-utilized factory capacity weakens vendor stance.'
        });
      }
      if (diffRaw.buyer_leverage_shift) {
        const parts = String(diffRaw.buyer_leverage_shift).split('->').map((s) => s.trim());
        items.push({
          dimension: 'Buyer Leverage',
          historicalValue: (parts[0] || 'LOW').toUpperCase(),
          currentValue: (parts[1] || 'HIGH').toUpperCase(),
          shiftType: 'FAVORABLE',
          strategicImplication: 'Multi-source certification and flexible lead times maximize procurement leverage.'
        });
      }
      if (diffRaw.alternative_count_shift) {
        const parts = String(diffRaw.alternative_count_shift).split('->').map((s) => s.trim());
        const hist = parts[0] ? parts[0].replace(/alternatives?/i, '').trim() : '0';
        const curr = parts[1] ? parts[1].replace(/alternatives?/i, '').trim() : '4';
        items.push({
          dimension: 'Alternative Suppliers',
          historicalValue: hist,
          currentValue: `${curr} QUALIFIED`,
          shiftType: 'FAVORABLE',
          strategicImplication: 'Certified secondary fabricators eliminate sole-source vendor dependence.'
        });
      }
      if (diffRaw.urgency_shift) {
        const parts = String(diffRaw.urgency_shift).split('->').map((s) => s.trim());
        items.push({
          dimension: 'Procurement Urgency',
          historicalValue: (parts[0] || 'URGENT').toUpperCase(),
          currentValue: (parts[1] || 'FLEXIBLE').toUpperCase(),
          shiftType: 'FAVORABLE',
          strategicImplication: 'Eliminates time pressure; permits competitive benchmarking rounds.'
        });
      }
      if (items.length > 0) return items;
    }

    // Generic key fallback while filtering out non-dimension metadata
    const skippedKeys = new Set(['past_supplier', 'current_supplier', 'summary', 'has_meaningful_shift', 'reference_memory_id', 'case_id']);
    for (const key of Object.keys(diffRaw)) {
      if (skippedKeys.has(key.toLowerCase())) continue;
      const val = diffRaw[key];
      const dimensionName = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      if (typeof val === 'string' && val.includes('->')) {
        const [hist, curr] = val.split('->').map((s) => s.trim());
        items.push({
          dimension: dimensionName.replace(' Shift', ''),
          historicalValue: hist.toUpperCase(),
          currentValue: curr.toUpperCase(),
          shiftType: 'CRITICAL_SHIFT',
          strategicImplication: 'Live divergence detected between precedent baseline and active negotiation.'
        });
      } else if (typeof val === 'object' && val !== null) {
        items.push({
          dimension: dimensionName,
          historicalValue: String(val.historical || val.historical_value || val.past || 'SHORTAGE').toUpperCase(),
          currentValue: String(val.current || val.current_value || val.present || 'SURPLUS').toUpperCase(),
          shiftType: 'CRITICAL_SHIFT',
          strategicImplication: String(val.implication || val.strategic_implication || val.impact || 'Parameter shifted in buyer favor.')
        });
      }
    }
    if (items.length > 0) return items;
  }

  return CONDITION_DIFFERENCES;
}

function normalizeNegotiationContext(raw: any, index: number): NegotiationContext {
  const rawSupply = String(raw.supply_balance || raw.supplyBalance || 'SURPLUS').toUpperCase();
  const supplyBalance: SupplyBalance =
    rawSupply === 'SURPLUS' || rawSupply === 'SHORTAGE' || rawSupply === 'CRITICAL_DEFICIT' ? rawSupply : 'BALANCED';

  const rawSuppLev = String(raw.supplier_leverage_level || raw.supplier_leverage || raw.supplierLeverage || 'LOW').toUpperCase();
  const supplierLeverage: LeverageLevel =
    rawSuppLev === 'LOW' || rawSuppLev === 'HIGH' || rawSuppLev === 'MONOPOLY' ? rawSuppLev : 'MEDIUM';

  const rawBuyerLev = String(raw.buyer_leverage_level || raw.buyer_leverage || raw.buyerLeverage || 'HIGH').toUpperCase();
  const buyerLeverage: LeverageLevel =
    rawBuyerLev === 'LOW' || rawBuyerLev === 'HIGH' || rawBuyerLev === 'MONOPOLY' ? rawBuyerLev : 'HIGH';

  const rawUrg = String(raw.urgency || 'FLEXIBLE').toUpperCase();
  const urgency: UrgencyLevel =
    rawUrg === 'FLEXIBLE' || rawUrg === 'HIGH' || rawUrg === 'CRITICAL' ? rawUrg : 'FLEXIBLE';

  return {
    id: String(raw.id || raw.case_id || `NEG-${index + 1}`),
    supplier: raw.supplier || raw.vendor || `Supplier ${index + 1}`,
    code: raw.code || raw.case_code || `CASE-0${index + 1}`,
    category: raw.category || 'Industrial Components',
    quantity: raw.quantity || '8,200 assemblies',
    targetDelivery: raw.target_delivery || raw.targetDelivery || '45 days',
    contractValue: raw.contract_value || raw.contractValue || '$3.40M',
    supplyBalance,
    supplierLeverage,
    buyerLeverage,
    urgency,
    alternativeSuppliers: typeof raw.alternative_supplier_count === 'number'
      ? raw.alternative_supplier_count
      : typeof raw.alternative_suppliers === 'number'
      ? raw.alternative_suppliers
      : 6,
    marketIndexTrend: raw.market_index_trend || raw.marketIndexTrend || '-6.8% YoY',
    description: raw.description || raw.market_conditions || 'Active contract negotiation under observation.'
  };
}

// ==========================================
// CANONICAL API ENDPOINTS
// ==========================================

/**
 * 1. GET /api/negotiations
 * Fetches the active negotiation cases
 */
export async function getNegotiations(): Promise<{
  negotiations: NegotiationContext[];
  isLiveBackend: boolean;
}> {
  const result = await apiFetch<any[]>('/negotiations', { method: 'GET' }, SCENARIOS);

  const rawList = Array.isArray(result.data) ? result.data : SCENARIOS;
  const negotiations = rawList.map(normalizeNegotiationContext);

  return {
    negotiations: negotiations.length > 0 ? negotiations : SCENARIOS,
    isLiveBackend: result.isLiveBackend
  };
}

/**
 * 2. POST /api/negotiations/analyze
 * Canonical Backend analyze request:
 * {
 *   supplier: string,
 *   category: string,
 *   market_conditions: string,
 *   supplier_leverage?: string,
 *   buyer_leverage?: string,
 *   supply_balance?: "shortage" | "balanced" | "surplus",
 *   supplier_leverage_level?: "high" | "medium" | "low",
 *   buyer_leverage_level?: "high" | "medium" | "low",
 *   urgency?: "urgent" | "normal" | "flexible",
 *   alternative_supplier_count?: number,
 *   negotiation_objective: string,
 *   constraints?: string
 * }
 */
export async function analyzeNegotiation(
  negotiationId: string,
  context?: NegotiationContext
): Promise<{
  reflection: HindsightReflectionData;
  strategy: RecommendedStrategyData;
  conditionDifferences: ConditionDiffItem[];
  recalledMemories: PastExperience[];
  isLiveBackend: boolean;
}> {
  const fallback = {
    reflection: HINDSIGHT_REFLECTION,
    strategy: RECOMMENDED_STRATEGY,
    conditionDifferences: CONDITION_DIFFERENCES,
    recalledMemories: RECALLED_MEMORIES
  };

  const activeCtx = context || SCENARIOS[0];

  const payload = {
    supplier: activeCtx.supplier,
    category: activeCtx.category,
    market_conditions: activeCtx.description || `${activeCtx.supplyBalance} with ${activeCtx.alternativeSuppliers} alternatives`,
    supplier_leverage: activeCtx.supplierLeverage,
    buyer_leverage: activeCtx.buyerLeverage,
    supply_balance: (activeCtx.supplyBalance.toLowerCase() === 'shortage'
      ? 'shortage'
      : activeCtx.supplyBalance.toLowerCase() === 'surplus'
      ? 'surplus'
      : 'balanced') as 'shortage' | 'balanced' | 'surplus',
    supplier_leverage_level: (activeCtx.supplierLeverage.toLowerCase() === 'high'
      ? 'high'
      : activeCtx.supplierLeverage.toLowerCase() === 'low'
      ? 'low'
      : 'medium') as 'high' | 'medium' | 'low',
    buyer_leverage_level: (activeCtx.buyerLeverage.toLowerCase() === 'high'
      ? 'high'
      : activeCtx.buyerLeverage.toLowerCase() === 'low'
      ? 'low'
      : 'medium') as 'high' | 'medium' | 'low',
    urgency: (activeCtx.urgency.toLowerCase() === 'urgent'
      ? 'urgent'
      : activeCtx.urgency.toLowerCase() === 'flexible'
      ? 'flexible'
      : 'normal') as 'urgent' | 'normal' | 'flexible',
    alternative_supplier_count: activeCtx.alternativeSuppliers,
    negotiation_objective: `Maximize buyer commercial advantage and benchmark pricing for ${activeCtx.category}`,
    constraints: `Target delivery: ${activeCtx.targetDelivery}, target quantity: ${activeCtx.quantity}`
  };

  const result = await apiFetch<any>(
    '/negotiations/analyze',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    fallback
  );

  if (result.isLiveBackend && result.data) {
    const raw = result.data;
    const recalled = Array.isArray(raw.recalled_experiences)
      ? raw.recalled_experiences.map(normalizePastExperience)
      : RECALLED_MEMORIES;

    const reflection = normalizeHindsightReflection(raw.hindsight_reflection_evidence, recalled.length);
    const strategy = normalizeStrategyGuidance(raw.strategy_guidance);
    const conditionDifferences = normalizeConditionDifference(raw.condition_difference, raw.condition_contrast);

    return {
      reflection,
      strategy,
      conditionDifferences,
      recalledMemories: recalled,
      isLiveBackend: true
    };
  }

  return { ...fallback, isLiveBackend: false };
}

/**
 * 3. POST /api/negotiations/decisions
 * Canonical Backend decision request:
 * {
 *   case_id: string,
 *   selected_strategy: string,
 *   status: "PENDING" | "ACCEPTED" | "MODIFIED" | "OVERRIDDEN" | "REJECTED",
 *   modifications?: string,
 *   notes?: string,
 *   decided_by?: string
 * }
 */
export async function recordDecision(
  payload: RecordDecisionRequest
): Promise<{ response: RecordDecisionResponse; isLiveBackend: boolean }> {
  const backendStatus = payload.decision === 'ACCEPTED'
    ? 'ACCEPTED'
    : payload.decision === 'MODIFIED'
    ? 'MODIFIED'
    : 'REJECTED';

  const body = {
    case_id: payload.negotiationId,
    selected_strategy: payload.finalTactic,
    status: backendStatus,
    modifications: payload.decision === 'MODIFIED' ? payload.finalTactic : undefined,
    notes: payload.notes || '',
    decided_by: 'Procurement Director'
  };

  const fallbackResponse: RecordDecisionResponse = {
    success: true,
    decisionId: `DEC-${Date.now().toString().slice(-6)}`,
    recordedAt: new Date().toISOString(),
    status: 'RECORDED'
  };

  const result = await apiFetch<any>(
    '/negotiations/decisions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    },
    fallbackResponse
  );

  return {
    response: {
      success: true,
      decisionId: result.data?.decision_id || result.data?.decisionId || fallbackResponse.decisionId,
      recordedAt: result.data?.recorded_at || result.data?.recordedAt || fallbackResponse.recordedAt,
      status: 'RECORDED'
    },
    isLiveBackend: result.isLiveBackend
  };
}

/**
 * 4. POST /api/negotiations/retain
 * Canonical Backend retain request:
 * Uses RetainOutcomeRequest fields.
 */
export async function retainOutcome(
  payload: RetainOutcomeRequest
): Promise<{ record: RetainedOutcomeRecord; isLiveBackend: boolean }> {
  const body = {
    supplier: payload.supplier || 'Alpha Supplier',
    category: 'Raw Materials',
    market_conditions: 'Settled contract terms under observation',
    supplier_leverage: 'Low',
    buyer_leverage: 'High',
    supply_balance: 'surplus',
    supplier_leverage_level: 'low',
    buyer_leverage_level: 'high',
    urgency: 'flexible',
    alternative_supplier_count: 4,
    negotiation_objective: `Settle contract with favorable terms for ${payload.supplier || 'supplier'}`,
    constraints: 'Standard commercial SLA',
    tactics_attempted: [payload.finalTactic || 'Competitive benchmarking'],
    what_worked: [payload.finalTactic || 'Competitive benchmarking'],
    what_failed: [],
    final_outcome: payload.projectedSavings || 'Settled contract with negotiated price reduction',
    tradeoffs: payload.directorNotes || 'Standard payment terms',
    lessons_learned: payload.directorNotes || 'Precedent retained to institutional memory',
    date_completed: new Date().toISOString().split('T')[0]
  };

  const fallbackRecord: RetainedOutcomeRecord = {
    id: `RET-${Date.now().toString().slice(-4)}`,
    negotiationId: payload.negotiationId,
    supplier: payload.supplier,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    decision: payload.decision,
    finalTactic: payload.finalTactic,
    directorNotes: payload.directorNotes,
    projectedSavings: payload.projectedSavings || 'Target 12.4% baseline cost reduction',
    status: 'RETAINED'
  };

  const result = await apiFetch<any>(
    '/negotiations/retain',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    },
    fallbackRecord
  );

  const resData = result.data;
  return {
    record: {
      id: resData?.deal_id || resData?.id || resData?.memory_id || fallbackRecord.id,
      negotiationId: payload.negotiationId,
      supplier: payload.supplier,
      timestamp: fallbackRecord.timestamp,
      decision: payload.decision,
      finalTactic: payload.finalTactic,
      directorNotes: payload.directorNotes,
      projectedSavings: payload.projectedSavings || fallbackRecord.projectedSavings,
      status: 'RETAINED'
    },
    isLiveBackend: result.isLiveBackend
  };
}

/**
 * 5. GET /api/memories
 * Backend returns the full memory list without query params.
 * Local filtering applied if requested by UI.
 */
export async function getMemories(filter?: {
  category?: string;
  query?: string;
}): Promise<{ memories: PastExperience[]; isLiveBackend: boolean }> {
  // Call /api/memories without ?category= or ?q= per backend contract
  const result = await apiFetch<any[]>('/memories', { method: 'GET' }, RECALLED_MEMORIES);

  const rawList = Array.isArray(result.data) ? result.data : RECALLED_MEMORIES;
  let memories = rawList.map(normalizePastExperience);

  if (memories.length === 0) {
    memories = RECALLED_MEMORIES;
  }

  // Local filtering only if filter params are provided
  if (filter?.category && filter.category !== 'ALL') {
    memories = memories.filter((m) =>
      m.category.toLowerCase().includes(filter.category!.toLowerCase())
    );
  }
  if (filter?.query) {
    const q = filter.query.toLowerCase();
    memories = memories.filter(
      (m) =>
        m.supplier.toLowerCase().includes(q) ||
        m.strategyUsed.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }

  return { memories, isLiveBackend: result.isLiveBackend };
}

/**
 * 6. GET /api/timeline
 * Backend returns a FLAT ARRAY of timeline events.
 * Adapted into frontend TimelineEvent[] and RetainedOutcomeRecord[].
 */
export async function getTimeline(): Promise<{
  timelineEvents: TimelineEvent[];
  retainedRecords: RetainedOutcomeRecord[];
  isLiveBackend: boolean;
}> {
  const result = await apiFetch<any[]>('/timeline', { method: 'GET' }, TIMELINE_EVENTS);

  const rawFlatArray = Array.isArray(result.data) ? result.data : (TIMELINE_EVENTS as any[]);

  const timelineEvents: TimelineEvent[] = rawFlatArray.map((ev: any, idx: number) => ({
    id: String(ev.id || `EVT-${idx + 1}`),
    timestamp: ev.timestamp || 'Just now',
    date: ev.date || 'Today',
    stage: (ev.stage || 'RECOMMEND').toUpperCase() as any,
    type: ev.type || ev.event_type || 'SYSTEM',
    title: ev.title || ev.summary || 'Negotiation Event',
    detail: ev.detail || ev.description || ev.notes || 'Event recorded in negotiation ledger'
  }));

  // Extract any retained records from flat timeline events
  const retainedFromTimeline: RetainedOutcomeRecord[] = rawFlatArray
    .filter((ev: any) => ev.stage === 'RETAIN_OUTCOME' || ev.type === 'OUTCOME_RETAINED' || ev.decision || ev.status === 'RETAINED')
    .map((ev: any, idx: number) => ({
      id: String(ev.id || `RET-2026-${(idx + 1).toString().padStart(3, '0')}`),
      negotiationId: ev.case_id || ev.negotiation_id || 'NEG-2026-DELTA',
      supplier: ev.supplier || 'Delta Manufacturing',
      timestamp: ev.timestamp || 'Recorded',
      decision: (ev.decision || ev.status || 'ACCEPTED').toUpperCase() as any,
      finalTactic: ev.final_tactic || ev.strategy || ev.selected_strategy || 'Competitive benchmarking + mini-RFP',
      directorNotes: ev.notes || ev.director_notes || 'Retained to institutional memory',
      projectedSavings: ev.projected_savings || ev.cost_impact || 'Target 12.4% baseline cost reduction',
      status: 'RETAINED'
    }));

  return {
    timelineEvents: timelineEvents.length > 0 ? timelineEvents : (TIMELINE_EVENTS as TimelineEvent[]),
    retainedRecords: retainedFromTimeline.length > 0 ? retainedFromTimeline : INITIAL_RETAINED_OUTCOMES,
    isLiveBackend: result.isLiveBackend
  };
}
