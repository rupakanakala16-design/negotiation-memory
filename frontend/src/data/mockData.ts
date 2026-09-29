import {
  NegotiationContext,
  PastExperience,
  ConditionDiffItem,
  HindsightReflectionData,
  RecommendedStrategyData,
  RetainedOutcomeRecord
} from '../types/negotiation';

export const SCENARIOS: NegotiationContext[] = [
  {
    id: 'NEG-2026-DELTA',
    supplier: 'Delta Manufacturing',
    code: 'DELT-HYD-04',
    category: 'Hydraulic Manifolds',
    quantity: '8,200 assemblies',
    targetDelivery: '45 days',
    contractValue: '$3.40M',
    supplyBalance: 'SURPLUS',
    supplierLeverage: 'LOW',
    buyerLeverage: 'HIGH',
    urgency: 'FLEXIBLE',
    alternativeSuppliers: 6,
    marketIndexTrend: '-6.8% YoY',
    description: 'Annual contract renewal for precision hydraulic assemblies. Counter-party has uncommitted factory capacity and high holding inventory.'
  },
  {
    id: 'NEG-2026-ALPHA',
    supplier: 'Alpha Components',
    code: 'ALPH-IND-01',
    category: 'Industrial Components',
    quantity: '10,000 units',
    targetDelivery: '45 days',
    contractValue: '$1.42M',
    supplyBalance: 'SURPLUS',
    supplierLeverage: 'LOW',
    buyerLeverage: 'HIGH',
    urgency: 'FLEXIBLE',
    alternativeSuppliers: 6,
    marketIndexTrend: '-4.2% YoY',
    description: 'Annual contract renewal for precision cast actuators. Excess regional supply with 6 qualified substitute tier-1 vendors available.'
  },
  {
    id: 'NEG-2026-ZETA',
    supplier: 'Zeta Materials',
    code: 'ZETA-SPEC-09',
    category: 'Specialty Resins',
    quantity: '4,500 kg',
    targetDelivery: '18 days',
    contractValue: '$890K',
    supplyBalance: 'SHORTAGE',
    supplierLeverage: 'HIGH',
    buyerLeverage: 'LOW',
    urgency: 'HIGH',
    alternativeSuppliers: 1,
    marketIndexTrend: '+14.6% YoY',
    description: 'Emergency allocation for ISO-grade fluoropolymer. Strict feedstock bottleneck with limited overseas alternative certification.'
  },
  {
    id: 'NEG-2026-BETA',
    supplier: 'Beta Industrial',
    code: 'BETA-MET-03',
    category: 'Extruded Aluminum Profiles',
    quantity: '32,000 meters',
    targetDelivery: '30 days',
    contractValue: '$2.15M',
    supplyBalance: 'BALANCED',
    supplierLeverage: 'MEDIUM',
    buyerLeverage: 'MEDIUM',
    urgency: 'NORMAL',
    alternativeSuppliers: 3,
    marketIndexTrend: '+0.8% YoY',
    description: 'Quarterly structural beam replenishment. Stable commodity baseline with dynamic energy surcharges.'
  }
];

export const RECALLED_MEMORIES: PastExperience[] = [
  {
    id: 'MEM-2023-ZETA',
    supplier: 'Zeta Materials',
    dealDate: 'October 2023',
    category: 'Specialty Resins',
    relevanceScore: 92,
    supplyBalance: 'SHORTAGE',
    supplierLeverage: 'HIGH',
    urgency: 'URGENT' as any,
    alternativeSuppliers: 0,
    strategyUsed: 'Volume commitment + multi-year floor',
    outcomeResult: 'SUCCESSFUL',
    outcomeSummary: 'Volume commitment → Successful',
    conditionAlignment: 'MISMATCH',
    historicalContext: 'Raw material shortage triggered price gouging. Procurement traded a 24-month minimum order commitment for price ceiling protection and guaranteed allocation.',
    hindsightLesson: 'Volume commitments were essential ONLY because supply was severely constrained and supplier had monopoly pricing power. Ineffective when supply is in surplus.',
    costImpact: '+8.4% vs index (allocation protected)'
  },
  {
    id: 'MEM-2024-BETA',
    supplier: 'Beta Industrial',
    dealDate: 'May 2024',
    category: 'Structural Metal Extrusions',
    relevanceScore: 81,
    supplyBalance: 'BALANCED',
    supplierLeverage: 'MEDIUM',
    urgency: 'NORMAL',
    alternativeSuppliers: 2,
    strategyUsed: 'Index pricing + escalator clause collar',
    outcomeResult: 'SUCCESSFUL',
    outcomeSummary: 'Index pricing → Successful',
    conditionAlignment: 'PARTIAL_ALIGNMENT',
    historicalContext: 'Balanced market where neither party held dominant leverage. Tied contract rates to London Metal Exchange quarterly averages with a ±5% dead-band.',
    hindsightLesson: 'Index-linked contracts protected margins against commodity swings without requiring speculative forward inventory holding.',
    costImpact: '-3.8% below initial vendor quote'
  },
  {
    id: 'MEM-2023-OMEGA',
    supplier: 'Omega Components',
    dealDate: 'November 2023',
    category: 'Industrial Valves',
    relevanceScore: 79,
    supplyBalance: 'SHORTAGE',
    supplierLeverage: 'HIGH',
    urgency: 'URGENT' as any,
    alternativeSuppliers: 1,
    strategyUsed: 'Flexible volume tranche with milestone payment',
    outcomeResult: 'SUCCESSFUL',
    outcomeSummary: 'Flexible volume → Successful',
    conditionAlignment: 'MISMATCH',
    historicalContext: 'Single alternative qualified. Supplier demanded upfront tooling amortization. Buyer negotiated quarterly release orders with tiered penalties.',
    hindsightLesson: 'Preserved cash flow despite tight supply, but yielded on unit cost premium due to lack of competitive alternatives.',
    costImpact: '+4.2% unit price variance'
  },
  {
    id: 'MEM-2024-DELTA',
    supplier: 'Delta Manufacturing',
    dealDate: 'August 2024',
    category: 'Machined Castings',
    relevanceScore: 73,
    supplyBalance: 'SURPLUS',
    supplierLeverage: 'LOW',
    urgency: 'FLEXIBLE',
    alternativeSuppliers: 5,
    strategyUsed: 'Competitive benchmarking mini-RFP + unbundled logistics',
    outcomeResult: 'SUCCESSFUL',
    outcomeSummary: 'Benchmark mini-RFP → Net -12% savings',
    conditionAlignment: 'ALIGNED',
    historicalContext: 'Buyer market with high idle foundry capacity. Issued a 14-day mini-RFP across 5 approved vendors, unbundling packaging and transit.',
    hindsightLesson: 'Surplus conditions rewarded aggressive multi-source bidding. Incumbent matched lowest rate within 48 hours to prevent volume migration.',
    costImpact: '-12.4% baseline cost reduction'
  },
  {
    id: 'MEM-2022-NOVA',
    supplier: 'Nova Industrial',
    dealDate: 'March 2022',
    category: 'Custom Fasteners',
    relevanceScore: 68,
    supplyBalance: 'SHORTAGE',
    supplierLeverage: 'HIGH',
    urgency: 'CRITICAL',
    alternativeSuppliers: 0,
    strategyUsed: 'Exclusive volume lock-in (Over-committed)',
    outcomeResult: 'FAILED',
    outcomeSummary: 'Volume lock-in → Stranded inventory loss',
    conditionAlignment: 'MISMATCH',
    historicalContext: 'Panicked procurement team signed a 3-year take-or-pay contract to secure scarce alloy clips. Market normalized 9 months later, stranding excess cost.',
    hindsightLesson: 'WARNING: Over-committing long-term volume during cyclical shortages creates disastrous structural overpayment once supply restores.',
    costImpact: '+$420,000 stranded contractual excess'
  },
  {
    id: 'MEM-2024-SIGMA',
    supplier: 'Sigma Precision',
    dealDate: 'September 2024',
    category: 'Pneumatic Actuators',
    relevanceScore: 62,
    supplyBalance: 'BALANCED',
    supplierLeverage: 'MEDIUM',
    urgency: 'NORMAL',
    alternativeSuppliers: 4,
    strategyUsed: 'Tiered volume rebate with Net 60 terms',
    outcomeResult: 'SUCCESSFUL',
    outcomeSummary: 'Rebate tiering → Target reached',
    conditionAlignment: 'PARTIAL_ALIGNMENT',
    historicalContext: 'Targeted extended cash conversion cycle. Conceded on base list price while establishing retroactive 6% rebates upon achieving 8,000 units.',
    hindsightLesson: 'Payment terms extension to Net 60 was readily accepted when combined with clear incentive threshold tiers.',
    costImpact: '+$68,000 annual working capital gain'
  }
];

export const CONDITION_DIFFERENCES: ConditionDiffItem[] = [
  {
    dimension: 'Supply Balance',
    historicalValue: 'SHORTAGE',
    currentValue: 'SURPLUS',
    shiftType: 'FAVORABLE',
    strategicImplication: 'Suppliers are carrying idle capacity and buffer inventory. Concession leverage shifts entirely to the buyer.'
  },
  {
    dimension: 'Supplier Leverage',
    historicalValue: 'HIGH',
    currentValue: 'LOW',
    shiftType: 'FAVORABLE',
    strategicImplication: 'Incumbent cannot dictate take-or-pay terms or pass through arbitrary raw material surcharges.'
  },
  {
    dimension: 'Procurement Urgency',
    historicalValue: 'URGENT',
    currentValue: 'FLEXIBLE',
    shiftType: 'FAVORABLE',
    strategicImplication: '45-day runway permits multi-round competitive inquiries without line-down production threats.'
  },
  {
    dimension: 'Alternative Suppliers',
    historicalValue: '0 ALTERNATIVES',
    currentValue: '6 ALTERNATIVES',
    shiftType: 'CRITICAL_SHIFT',
    strategicImplication: '6 certified tier-1 replacements exist in database, creating genuine BATNA (Best Alternative to a Negotiated Agreement).'
  }
];

export const HINDSIGHT_REFLECTION: HindsightReflectionData = {
  memoriesConsideredCount: 6,
  conditionAlignedCount: 3,
  conflictingSituationsCount: 2,
  coreReasoning: 'Historical shortage negotiations rewarded volume commitments when supplier leverage was high. The current situation has surplus inventory, low supplier leverage, and multiple alternatives, so repeating the historical volume-commitment strategy would not match the current conditions.',
  evidenceNotes: [
    'Zeta Materials 2023 memory traded 24-month commitments for allocation because market was at zero alternatives. Doing this with Alpha today would needlessly surrender buyer flexibility.',
    'Nova Industrial 2022 case proves that locking long-term commitments during turning points creates catastrophic stranded liability once surplus takes hold.',
    'Delta Manufacturing 2024 demonstrated that surplus + 5 alternatives produced a verified -12.4% cost reduction via mini-RFP and unbundled freight.'
  ]
};

export const RECOMMENDED_STRATEGY: RecommendedStrategyData = {
  primaryStrategy: 'Competitive benchmarking + mini-RFP',
  rationale: 'Exploit surplus capacity across 6 qualified alternates to compel Alpha Components to align with bottom-quartile market benchmarks without surrendering long-term volume rigidity.',
  supportingTactics: [
    'Request competing quotes from top 3 alternative suppliers (Beta, Delta, Titan)',
    'Use index-linked pricing rather than fixed commitments',
    'Keep volume flexible with quarterly split-source optionality',
    'Push Net 60 payment terms (upgraded from incumbent Net 30 standard)',
    'Avoid large volume commitment or single-source lock-in'
  ],
  riskWatchlist: [
    'Alpha may claim proprietary tooling amortization if volume drops below 8,000 units',
    'Ensure alternate suppliers have active PPAP / ISO qualification on file'
  ],
  expectedConcession: 'Target 9.5% – 13.0% unit price decrease + Net 60 working capital improvement'
};

export const INITIAL_RETAINED_OUTCOMES: RetainedOutcomeRecord[] = [
  {
    id: 'RET-2025-081',
    negotiationId: 'NEG-2025-SIGMA',
    supplier: 'Sigma Precision',
    timestamp: '2025-11-14 16:45',
    decision: 'ACCEPTED',
    finalTactic: 'Tiered rebate structure tied to Net 60 terms',
    directorNotes: 'Adopted Hindsight guidance verbatim. Vendor accepted Net 60 within 3 business days once 4 alternatives were brought up.',
    projectedSavings: '$94,200 annual recurring',
    status: 'RETAINED'
  },
  {
    id: 'RET-2025-072',
    negotiationId: 'NEG-2025-DELTA',
    supplier: 'Delta Manufacturing',
    timestamp: '2025-08-22 11:20',
    decision: 'MODIFIED',
    finalTactic: 'Mini-RFP benchmark + 70/30 split award',
    directorNotes: 'Modified AI guidance from 100% reallocation to 70/30 dual source to maintain backup redundancy in case of shipping disruptions.',
    projectedSavings: '$184,000 verified savings',
    status: 'RETAINED'
  }
];

export const TIMELINE_EVENTS = [
  {
    id: 'TL-01',
    timestamp: '14:32:05',
    date: 'Today',
    stage: 'RECALL',
    type: 'MEMORY_QUERY',
    title: 'Recalled 6 Historical Experiences',
    detail: 'Hindsight vectorized search matched 6 historical negotiations against current condition vectors (Industrial Components, Surplus, Low Supplier Leverage).'
  },
  {
    id: 'TL-02',
    timestamp: '14:32:09',
    date: 'Today',
    stage: 'CONDITION_DIFF',
    type: 'DIFF_EVALUATION',
    title: 'Condition Drift Detected (Critical Shift)',
    detail: 'Identified major divergence from 2023 Zeta benchmark: Shortage → Surplus, 0 Alternatives → 6 Alternatives. Flagged high risk of repeating historical volume commitment.'
  },
  {
    id: 'TL-03',
    timestamp: '14:32:14',
    date: 'Today',
    stage: 'REFLECT',
    type: 'REFLECTION_SYNTHESIS',
    title: 'Hindsight Reflection Synthesized',
    detail: 'Processed 3 aligned patterns and 2 conflicting historical precedents. Established that historical volume-lock defense would compromise buyer leverage.'
  },
  {
    id: 'TL-04',
    timestamp: '14:32:21',
    date: 'Today',
    stage: 'RECOMMEND',
    type: 'STRATEGY_GENERATED',
    title: 'Recommended Strategy: Competitive Benchmarking + mini-RFP',
    detail: 'Generated 5 supporting tactical levers prioritizing index pricing, Net 60 terms, and alternative quote leverage.'
  },
  {
    id: 'TL-05',
    timestamp: '14:33:00',
    date: 'Today',
    stage: 'DECIDE',
    type: 'HUMAN_INTERACTION',
    title: 'Awaiting Human Procurement Decision',
    detail: 'Human Director review required before institutional execution. System recommends; human decides.'
  }
];
