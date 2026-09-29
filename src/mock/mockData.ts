/**
 * Mock Data Repository for Offline / Development Mode
 */

import {
  NegotiationCase,
  HistoricalMemory,
  ConditionDifference,
  Reflection,
  RecommendedStrategy,
  HumanDecision,
  RetainedOutcome,
  MemoryCluster,
  MemoryTimelineEvent
} from '../types';

export const MOCK_CASES: NegotiationCase[] = [
  {
    id: 'case-alpha-2026',
    counterparty: 'Alpha Supplier',
    product: 'Industrial High-Grade Steel Billets & Structural Coils',
    contractValue: '$4,200,000',
    targetQuantity: '12,500 MT',
    targetLeadTime: '14 Days',
    marketTrend: 'Supply surplus, softening global demand, 4 alternative mills actively quoting',
    paymentTerms: 'Target Net 60 (currently Net 30)',
    supplyBalance: 'SURPLUS',
    supplierLeverage: 'LOW',
    buyerLeverage: 'HIGH',
    urgency: 'FLEXIBLE',
    alternatives: 4,
    category: 'Raw Materials',
    negotiationObjective: 'Achieve 15% unit cost reduction, eliminate volume take-or-pay locks, and establish quarterly downward index ratchets.',
    constraints: 'Must maintain ASTM-A36 compliance and guaranteed 14-day rail delivery cycles.',
    createdAt: '2026-09-28T10:00:00Z',
    updatedAt: '2026-09-29T08:00:00Z'
  },
  {
    id: 'case-omega-2026',
    counterparty: 'Omega Components',
    product: 'Automotive Grade 32-bit Microcontrollers (MCU)',
    contractValue: '$1,850,000',
    targetQuantity: '300,000 Units',
    targetLeadTime: '24 Weeks',
    marketTrend: 'Global wafer fab capacity crunch, severe allocation rationing, 44-week spot lead times',
    paymentTerms: 'Net 30',
    supplyBalance: 'SHORTAGE',
    supplierLeverage: 'HIGH',
    buyerLeverage: 'LOW',
    urgency: 'URGENT',
    alternatives: 0,
    category: 'Electronic Components & Microcontrollers',
    negotiationObjective: 'Secure guaranteed wafer fabrication allocation slots and cap price escalation below 8%.',
    constraints: 'Proprietary pinout; zero pin-compatible second source without $350k PCB re-spin.',
    createdAt: '2026-09-29T07:30:00Z',
    updatedAt: '2026-09-29T08:15:00Z'
  },
  {
    id: 'case-gamma-2026',
    counterparty: 'Gamma Logistics',
    product: 'Transpacific Ocean Freight & Intermodal Drayage',
    contractValue: '$2,400,000',
    targetQuantity: '1,800 FEU Containers',
    targetLeadTime: 'Weekly Departure',
    marketTrend: 'Global container vessel overcapacity, spot rates collapsed 32%, carriers aggressively underbidding',
    paymentTerms: 'Target Net 90',
    supplyBalance: 'SURPLUS',
    supplierLeverage: 'LOW',
    buyerLeverage: 'HIGH',
    urgency: 'FLEXIBLE',
    alternatives: 5,
    category: 'Logistics & Freight Forwarding',
    negotiationObjective: 'Contract rate reduction of 25% with flexible quarterly index adjustments and demurrage waiver.',
    constraints: '98.5% on-time vessel departure SLA mandatory.',
    createdAt: '2026-09-27T14:00:00Z',
    updatedAt: '2026-09-28T16:00:00Z'
  }
];

export const MOCK_MEMORIES: HistoricalMemory[] = [
  {
    id: 'deal-alpha-shortage-001',
    organization: 'Alpha Supplier',
    category: 'Raw Materials',
    date: '2024-03-15',
    strategy: 'Exclusive Multi-Year Volume Commitment with Take-or-Pay Floor',
    conditions: {
      supplyBalance: 'SHORTAGE',
      supplierLeverage: 'HIGH',
      buyerLeverage: 'LOW',
      alternatives: 0,
      marketTrend: 'Severe global capacity bottleneck, 6-month order backlog'
    },
    outcome: 'Secured 100% capacity allocation and 12% discount off spot index for 18 months.',
    relevanceScore: 0.94,
    result: 'SUCCESS',
    lessons: 'In a supply shortage with high supplier leverage, volume commitment is the primary currency. Threatening alternatives backfires when market capacity is constrained. Exclusivity commitment was necessary to protect factory continuity.',
    tacticsAttempted: [
      'Spot market price benchmarking threats (failed)',
      'Multi-year 85% volume commitment (succeeded)',
      'Quarterly forecast transparency (succeeded)'
    ],
    whatWorked: ['Multi-year 85% volume commitment', 'Forecast transparency'],
    whatFailed: ['Aggressive spot benchmark threats'],
    tradeoffs: 'Locked procurement into rigid 85% share of wallet with take-or-pay penalty.'
  },
  {
    id: 'deal-alpha-surplus-002',
    organization: 'Alpha Supplier',
    category: 'Raw Materials',
    date: '2024-11-20',
    strategy: 'Competitive Mini-RFP Benchmarking & Floating Index Pricing',
    conditions: {
      supplyBalance: 'SURPLUS',
      supplierLeverage: 'LOW',
      buyerLeverage: 'HIGH',
      alternatives: 4,
      marketTrend: 'Mill capacity glut, prices down 22%'
    },
    outcome: '16% price reduction, zero take-or-pay clauses, Net 60 terms, quarterly market index adjustments.',
    relevanceScore: 0.98,
    result: 'SUCCESS',
    lessons: 'In a market surplus with low supplier leverage, NEVER repeat the shortage playbook of volume lock-ins. Use competitive alternatives to dismantle rigid terms and demand flexible index pricing.',
    tacticsAttempted: [
      'Competitive mini-RFP with 4 alternative vendor quotes',
      'Unbundled contract terms',
      'Refusal of multi-year locks'
    ],
    whatWorked: ['Presenting alternative quotes', 'Quarterly index ratchet formula'],
    whatFailed: ['Offering volume exclusivity (deliberately avoided)'],
    tradeoffs: 'Granted 50% baseline allocation if quarterly index price stays within 2% of market median.'
  },
  {
    id: 'deal-zeta-microchips-007',
    organization: 'Zeta Technologies',
    category: 'Electronic Components & Microcontrollers',
    date: '2024-01-25',
    strategy: 'Binding Rolling NCNR Order Placement & Executive Sponsor Bridging',
    conditions: {
      supplyBalance: 'SHORTAGE',
      supplierLeverage: 'HIGH',
      buyerLeverage: 'LOW',
      alternatives: 0,
      marketTrend: 'Wafer fab capacity oversubscribed by 140%, 48-week lead times'
    },
    outcome: '100% volume allocation protected across 4 quarters with delivery certainty.',
    relevanceScore: 0.96,
    result: 'SUCCESS',
    lessons: 'Cross-supplier precedent: In critical semiconductor shortages with zero alternatives, attempting punitive penalty clauses destroys supplier goodwill. Committing binding demand visibility and upfront deposits is the only reliable path to secure scarce fab capacity.',
    tacticsAttempted: [
      'Non-cancellable non-returnable (NCNR) order commitment',
      'Executive sponsor alignment',
      'Demanding late delivery penalties (rejected)'
    ],
    whatWorked: ['12-month rolling NCNR commitment', 'Executive relationship bridging'],
    whatFailed: ['Demanding liquidated damages for delivery delays'],
    tradeoffs: 'Committed to 100% firm NCNR orders with 30% upfront cash deposit on wafer lots.'
  },
  {
    id: 'deal-beta-components-003',
    organization: 'Beta Electronics',
    category: 'Electronic Components & Microcontrollers',
    date: '2024-07-20',
    strategy: 'Visible Dual-Sourcing Qualification Run & Tiered Rebates',
    conditions: {
      supplyBalance: 'BALANCED',
      supplierLeverage: 'MEDIUM',
      buyerLeverage: 'MEDIUM',
      alternatives: 2,
      marketTrend: 'Lead times stabilizing from 32 weeks to 10 weeks'
    },
    outcome: '7.5% price cut on core MCUs, Net 60 terms, volume split 70/30.',
    relevanceScore: 0.88,
    result: 'SUCCESS',
    lessons: 'Visible credible alternatives create leverage even before full switchover. Credible dual-sourcing breaks supplier complacency without burning relationships.',
    tacticsAttempted: ['Dual-sourcing qualification announcement', 'Tiered rebates', 'Demanding Net 90'],
    whatWorked: ['Dual-sourcing qualification run', 'Tiered growth rebates'],
    whatFailed: ['Demanding Net 90 payment terms'],
    tradeoffs: 'Incurred minor engineering testing costs to qualify secondary supplier.'
  }
];

export const MOCK_CONDITION_DIFFS: Record<string, ConditionDifference[]> = {
  'case-alpha-2026': [
    {
      dimension: 'Supply / Demand Balance',
      historicalValue: 'SHORTAGE (Severe Capacity Bottleneck)',
      currentValue: 'SURPLUS (65% Mill Utilization)',
      impact: 'Shifts fundamental pricing power entirely to buyer',
      severity: 'CRITICAL'
    },
    {
      dimension: 'Supplier Leverage Level',
      historicalValue: 'HIGH (Exclusive supplier with 6-month backlog)',
      currentValue: 'LOW (Hungry for baseload orders)',
      impact: 'Dismantles supplier justification for fixed price premiums',
      severity: 'CRITICAL'
    },
    {
      dimension: 'Viable Alternate Suppliers',
      historicalValue: '0 (Sole source qualification)',
      currentValue: '4 (Pre-qualified alternative mills)',
      impact: 'Enables credible competitive tension and mini-RFP auctions',
      severity: 'CRITICAL'
    },
    {
      dimension: 'Buyer Urgency',
      historicalValue: 'URGENT (Zero buffer inventory)',
      currentValue: 'FLEXIBLE (60-day buffer stock in plant)',
      impact: 'Allows patient tactical posturing and walk-away credibility',
      severity: 'MODERATE'
    }
  ],
  'case-omega-2026': [
    {
      dimension: 'Supply / Demand Balance',
      historicalValue: 'SHORTAGE (Wafer Fabrication Deficit)',
      currentValue: 'SHORTAGE (Global Wafer Crunch)',
      impact: 'Consistent condition: scarcity requires capacity-securing tactics',
      severity: 'NEUTRAL'
    },
    {
      dimension: 'Supplier Leverage Level',
      historicalValue: 'HIGH (Fab allocations rationed)',
      currentValue: 'HIGH (Oversubscribed 130%)',
      impact: 'Confrontational tactics will trigger allocation de-prioritization',
      severity: 'CRITICAL'
    }
  ]
};

export const MOCK_REFLECTIONS: Record<string, Reflection> = {
  'case-alpha-2026': {
    memoriesConsidered: ['deal-alpha-shortage-001', 'deal-alpha-surplus-002', 'deal-gamma-freight-004'],
    alignedPatterns: [
      'In surplus markets across Raw Materials and Freight, competitive benchmarking consistently extracts 14-18% discounts.',
      'Transitioning to floating index-linked contracts eliminates margin-padding in declining commodity cycles.'
    ],
    conflictingPrecedents: [
      'Historical deal-alpha-shortage-001 utilized multi-year 85% volume exclusivity commitments to win 12% discount.',
      'Applying this historical exclusivity playbook today under surplus would needlessly surrender buyer pricing power and lock in above-market rates.'
    ],
    synthesis: 'Hindsight reflection confirms an inverse condition shift. Past volume lock-ins were an emergency defense against shortage; repeating them today is counter-productive. Deploy competitive tension with the 4 alternative mills.',
    evidence: [
      {
        memoryId: 'deal-alpha-shortage-001',
        fact: 'Alpha held High leverage in 2024 shortage; 85% volume commitment was necessary to avoid shutdown.',
        relevance: 0.94
      },
      {
        memoryId: 'deal-alpha-surplus-002',
        fact: 'In 2024 surplus, mini-RFP quoting competing mills forced 16% unit cut and eliminated take-or-pay penalties.',
        relevance: 0.98
      }
    ],
    reflectionSource: 'hindsight_reflect_llm'
  }
};

export const MOCK_STRATEGIES: Record<string, RecommendedStrategy> = {
  'case-alpha-2026': {
    title: 'Deploy Competitive Tension, Spot Benchmarking & Floating Index Ratchet',
    confidence: 0.94,
    rationale: 'Hindsight memory analysis demonstrates that Alpha Supplier concedes significantly when exposed to verified quotes from alternative mills in surplus markets. Long-term volume commitments must be strictly avoided.',
    tacticalLevers: [
      'Conduct an immediate competitive mini-RFP with the 4 pre-qualified alternative mills.',
      'Unbundle contract tiers: refuse multi-year volume locks and negotiate quarterly volume review triggers.',
      'Demand index-linked pricing tied to published steel benchmarks with downward ratchet protection.',
      'Extend payment terms from Net 30 to Net 60 days.',
      'Offer flexible order allocation (60/40 split with second-source option if Alpha misses quarterly cost-down targets).'
    ],
    tacticsToAvoid: [
      'DO NOT offer exclusive volume commitments or take-or-pay guarantees in a surplus market.',
      'DO NOT sign multi-year fixed-price agreements that insulate the supplier from declining market prices.',
      'DO NOT treat this supplier as a sole source when market capacity and qualified alternatives exist.'
    ],
    concessionStrategy: 'Make zero concessions on volume exclusivity. Trade order predictability for price cuts.',
    supportingMemories: ['deal-alpha-surplus-002', 'deal-alpha-shortage-001'],
    risks: [
      'Supplier may offer superficial upfront discounts while introducing hidden delivery surcharges.',
      'Secondary mills must be vetted for ASTM metallurgical consistency before diverting major volume.'
    ]
  },
  'case-omega-2026': {
    title: 'Secure Capacity Allocation & Supply Continuity via Structured NCNR Commitments',
    confidence: 0.91,
    rationale: 'Cross-supplier precedent (Zeta Technologies) proves that in semiconductor wafer crunches with zero secondary sources, aggressive price ultimatums cause immediate allocation cancellation. Security of supply is paramount.',
    tacticalLevers: [
      'Provide 12-month rolling binding NCNR demand visibility to secure Tier-1 fab scheduling.',
      'Engage C-level executive sponsor alignment to reinforce strategic customer tier status.',
      'Explore price ceiling indexing to cap runaway spot escalation while conceding on baseline unit price.',
      'Negotiate contractual safety buffer stock held at supplier warehouse.'
    ],
    tacticsToAvoid: [
      'Avoid punitive penalty clauses or liquidated damages threats (will provoke outright bid rejection).',
      'Avoid fragmented purchase orders across disparate divisions.'
    ],
    concessionStrategy: 'Trade forecast visibility and upfront deposit for guaranteed shipment delivery slots.',
    supportingMemories: ['deal-zeta-microchips-007'],
    risks: [
      'Downside lock-in risk if consumer demand contracts while bound by 12-month NCNR order commitments.'
    ]
  }
};

export const MOCK_DECISIONS: Record<string, HumanDecision> = {
  'case-alpha-2026': {
    caseId: 'case-alpha-2026',
    status: 'ACCEPTED',
    selectedStrategy: 'Deploy Competitive Tension, Spot Benchmarking & Floating Index Ratchet',
    modifications: 'Accepted Hindsight guidance with modification: will cap initial RFP reallocation at 40% to preserve relationship.',
    notes: 'Procurement Director approved strategy pivot away from historical volume commitment.',
    timestamp: '2026-09-29T08:30:00Z',
    decidedBy: 'Marcus Vance (Principal Category Director)'
  }
};

export const MOCK_CLUSTERS: MemoryCluster[] = [
  {
    id: 'cluster-surplus-rfp',
    theme: 'Surplus Market Competitive Unbundling',
    category: 'Cross-Category (Raw Materials, Logistics, MRO)',
    memoryCount: 6,
    representativeDeal: 'deal-alpha-surplus-002',
    dominantCondition: 'Surplus / Low Supplier Leverage',
    commonTactics: ['Mini-RFP', 'Index-Linked Pricing', 'Extended Payment Terms', 'Unbundled Scopes']
  },
  {
    id: 'cluster-shortage-allocation',
    theme: 'Critical Shortage Allocation Protection',
    category: 'Semiconductors & Specialty Chemicals',
    memoryCount: 5,
    representativeDeal: 'deal-zeta-microchips-007',
    dominantCondition: 'Shortage / High Supplier Leverage',
    commonTactics: ['NCNR Commitments', 'Executive Sponsorship', 'Consignment Buffers', 'Forecast Transparency']
  },
  {
    id: 'cluster-balanced-dualsource',
    theme: 'Balanced Market Dual-Sourcing & Amortization',
    category: 'Electronic Components & Packaging',
    memoryCount: 4,
    representativeDeal: 'deal-beta-components-003',
    dominantCondition: 'Balanced Market Dynamics',
    commonTactics: ['Visible Trial Runs', 'NRE Tooling Amortization', 'Gainsharing Rebates']
  }
];

export const MOCK_TIMELINE: MemoryTimelineEvent[] = [
  {
    id: 'tl-1',
    date: '2024-01-25',
    counterparty: 'Zeta Technologies',
    category: 'Electronic Components',
    event: 'Wafer Fab Shortage Crisis',
    conditionShift: 'Shortage / High Supplier Leverage',
    outcome: 'Secured 100% allocation via 12-month NCNR commitment'
  },
  {
    id: 'tl-2',
    date: '2024-03-15',
    counterparty: 'Alpha Supplier',
    category: 'Raw Materials',
    event: 'Steel Mill Capacity Squeeze',
    conditionShift: 'Shortage / High Supplier Leverage',
    outcome: 'Locked 85% volume exclusivity to guarantee 18-month supply'
  },
  {
    id: 'tl-3',
    date: '2024-07-20',
    counterparty: 'Beta Electronics',
    category: 'Electronic Components',
    event: 'Dual-Sourcing Market Introduction',
    conditionShift: 'Balanced / Medium Leverage',
    outcome: '7.5% price cut by qualifying second source'
  },
  {
    id: 'tl-4',
    date: '2024-11-20',
    counterparty: 'Alpha Supplier',
    category: 'Raw Materials',
    event: 'Macro Surplus Reversal & Strategy Pivot',
    conditionShift: 'Surplus / Low Supplier Leverage',
    outcome: 'Dismantled volume lock-in; won 16% discount via mini-RFP'
  },
  {
    id: 'tl-5',
    date: '2026-09-29',
    counterparty: 'Alpha Supplier',
    category: 'Raw Materials',
    event: 'Active Negotiation Round Evaluation',
    conditionShift: 'Surplus / High Buyer Dominance',
    outcome: 'Strategy Advisor recommends index ratchets & competitive tension'
  }
];
