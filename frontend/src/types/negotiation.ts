export type SupplyBalance = 'SURPLUS' | 'BALANCED' | 'SHORTAGE' | 'CRITICAL_DEFICIT';
export type LeverageLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'MONOPOLY';
export type UrgencyLevel = 'FLEXIBLE' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type NegotiationStatus = 'ACTIVE' | 'PREPARING' | 'DECIDED' | 'RETAINED';

export type PipelineStage = 
  | 'RETAIN' 
  | 'RECALL' 
  | 'CONDITION_DIFF' 
  | 'REFLECT' 
  | 'RECOMMEND' 
  | 'DECIDE' 
  | 'RETAIN_OUTCOME';

export interface NegotiationContext {
  id: string;
  supplier: string;
  code: string;
  category: string;
  quantity: string;
  targetDelivery: string;
  contractValue: string;
  supplyBalance: SupplyBalance;
  supplierLeverage: LeverageLevel;
  buyerLeverage: LeverageLevel;
  urgency: UrgencyLevel;
  alternativeSuppliers: number;
  marketIndexTrend: string;
  description: string;
}

export interface PastExperience {
  id: string;
  supplier: string;
  dealDate: string;
  category: string;
  relevanceScore: number; // 0 - 100
  supplyBalance: SupplyBalance;
  supplierLeverage: LeverageLevel;
  urgency: UrgencyLevel;
  alternativeSuppliers: number;
  strategyUsed: string;
  outcomeResult: 'SUCCESSFUL' | 'PARTIAL' | 'FAILED';
  outcomeSummary: string;
  conditionAlignment: 'MISMATCH' | 'PARTIAL_ALIGNMENT' | 'ALIGNED';
  historicalContext: string;
  hindsightLesson: string;
  costImpact: string;
}

export interface ConditionDiffItem {
  dimension: string;
  historicalValue: string;
  currentValue: string;
  shiftType: 'FAVORABLE' | 'NEUTRAL' | 'CRITICAL_SHIFT';
  strategicImplication: string;
}

export interface HindsightReflectionData {
  memoriesConsideredCount: number;
  conditionAlignedCount: number;
  conflictingSituationsCount: number;
  coreReasoning: string;
  evidenceNotes: string[];
}

export interface RecommendedStrategyData {
  primaryStrategy: string;
  rationale: string;
  supportingTactics: string[];
  riskWatchlist: string[];
  expectedConcession: string;
}

export type HumanDecisionAction = 'ACCEPTED' | 'MODIFIED' | 'REJECTED' | 'PENDING';

export interface RetainedOutcomeRecord {
  id: string;
  negotiationId: string;
  supplier: string;
  timestamp: string;
  decision: HumanDecisionAction;
  finalTactic: string;
  directorNotes: string;
  projectedSavings: string;
  status: 'RETAINED' | 'PENDING';
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  date: string;
  stage: PipelineStage;
  type: string;
  title: string;
  detail: string;
}

export interface RecordDecisionRequest {
  negotiationId: string;
  supplier: string;
  decision: HumanDecisionAction;
  finalTactic: string;
  notes?: string;
  timestamp?: string;
}

export interface RecordDecisionResponse {
  success: boolean;
  decisionId: string;
  recordedAt: string;
  status: 'RECORDED' | 'ACKNOWLEDGED';
}

export interface RetainOutcomeRequest {
  negotiationId: string;
  supplier: string;
  finalTactic: string;
  directorNotes: string;
  decision: HumanDecisionAction;
  projectedSavings?: string;
}
