import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MOCK_CASES,
  MOCK_MEMORIES,
  MOCK_CONDITION_DIFFS,
  MOCK_REFLECTIONS,
  MOCK_STRATEGIES,
  MOCK_DECISIONS
} from '../../dist/mock/mockData.js';

import {
  caseService,
  memoryService,
  analysisService,
  decisionService
} from '../../dist/services/index.js';

test('1. NegotiationCase schema validation', () => {
  assert.ok(MOCK_CASES.length >= 3, 'Must have at least 3 mock cases');
  for (const c of MOCK_CASES) {
    assert.ok(c.id, 'Case must have id');
    assert.ok(c.counterparty, 'Case must have counterparty');
    assert.ok(c.product, 'Case must have product');
    assert.ok(c.contractValue, 'Case must have contractValue');
    assert.ok(c.targetQuantity, 'Case must have targetQuantity');
    assert.ok(c.targetLeadTime, 'Case must have targetLeadTime');
    assert.ok(c.marketTrend, 'Case must have marketTrend');
    assert.ok(c.paymentTerms, 'Case must have paymentTerms');
    assert.ok(['SHORTAGE', 'BALANCED', 'SURPLUS'].includes(c.supplyBalance), 'Valid supplyBalance');
    assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(c.supplierLeverage), 'Valid supplierLeverage');
    assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(c.buyerLeverage), 'Valid buyerLeverage');
    assert.ok(['URGENT', 'NORMAL', 'FLEXIBLE'].includes(c.urgency), 'Valid urgency');
    assert.ok(typeof c.alternatives === 'number', 'alternatives must be a number');
  }
});

test('2. HistoricalMemory schema validation', () => {
  assert.ok(MOCK_MEMORIES.length >= 4, 'Must have historical memories');
  for (const m of MOCK_MEMORIES) {
    assert.ok(m.id, 'Memory must have id');
    assert.ok(m.organization, 'Memory must have organization');
    assert.ok(m.category, 'Memory must have category');
    assert.ok(m.date, 'Memory must have date');
    assert.ok(m.strategy, 'Memory must have strategy');
    assert.ok(m.conditions, 'Memory must have conditions');
    assert.ok(m.outcome, 'Memory must have outcome');
    assert.ok(typeof m.relevanceScore === 'number', 'relevanceScore must be number');
    assert.ok(m.result, 'Memory must have result');
    assert.ok(m.lessons, 'Memory must have lessons');
  }
});

test('3. ConditionDifference schema validation', () => {
  const diffs = MOCK_CONDITION_DIFFS['case-alpha-2026'];
  assert.ok(diffs && diffs.length > 0, 'Must have condition differences for Alpha');
  for (const d of diffs) {
    assert.ok(d.dimension, 'Diff must have dimension');
    assert.ok(d.historicalValue !== undefined, 'Diff must have historicalValue');
    assert.ok(d.currentValue !== undefined, 'Diff must have currentValue');
    assert.ok(d.impact, 'Diff must have impact');
    assert.ok(['CRITICAL', 'MODERATE', 'NEUTRAL', 'FAVORABLE'].includes(d.severity), 'Valid severity');
  }
});

test('4. Reflection & Recommendation schema validation', () => {
  const ref = MOCK_REFLECTIONS['case-alpha-2026'];
  assert.ok(ref, 'Must have mock reflection');
  assert.ok(Array.isArray(ref.memoriesConsidered), 'memoriesConsidered must be array');
  assert.ok(Array.isArray(ref.alignedPatterns), 'alignedPatterns must be array');
  assert.ok(Array.isArray(ref.conflictingPrecedents), 'conflictingPrecedents must be array');
  assert.ok(typeof ref.synthesis === 'string', 'synthesis must be string');
  assert.ok(Array.isArray(ref.evidence), 'evidence must be array');

  const strat = MOCK_STRATEGIES['case-alpha-2026'];
  assert.ok(strat, 'Must have mock strategy');
  assert.ok(strat.title, 'Strategy must have title');
  assert.ok(typeof strat.confidence === 'number', 'confidence must be number');
  assert.ok(strat.rationale, 'Strategy must have rationale');
  assert.ok(Array.isArray(strat.tacticalLevers), 'tacticalLevers must be array');
  assert.ok(Array.isArray(strat.supportingMemories), 'supportingMemories must be array');
  assert.ok(Array.isArray(strat.risks), 'risks must be array');
});

test('5. HumanDecision schema validation', () => {
  const dec = MOCK_DECISIONS['case-alpha-2026'];
  assert.ok(dec, 'Must have mock decision');
  assert.ok(dec.caseId, 'Decision must have caseId');
  assert.ok(['PENDING', 'ACCEPTED', 'MODIFIED', 'OVERRIDDEN', 'REJECTED'].includes(dec.status), 'Valid status');
  assert.ok(dec.selectedStrategy, 'Must have selectedStrategy');
  assert.ok(dec.timestamp, 'Must have timestamp');
});

test('6. Service Layer mock fallback execution', async () => {
  // Test caseService
  const cases = await caseService.getCases();
  assert.ok(cases.length >= 3, 'caseService returns cases in mock mode');

  const alpha = await caseService.getCaseById('case-alpha-2026');
  assert.equal(alpha.counterparty, 'Alpha Supplier');

  // Test memoryService
  const recallRes = await memoryService.recallMemories({
    condition_vector: {
      supply_balance: 'SURPLUS',
      supplier_leverage: 'LOW',
      buyer_leverage: 'HIGH',
      urgency: 'FLEXIBLE',
      alternatives: 4
    },
    top_k: 3
  });
  assert.ok(recallRes.memories.length <= 3);

  // Test analysisService
  const diffRes = await analysisService.computeConditionDiff({
    current_case: alpha
  });
  assert.ok(diffRes.differences.length > 0);

  const stratRes = await analysisService.recommendStrategy({
    case_id: 'case-alpha-2026'
  });
  assert.ok(stratRes.strategy.title.length > 0);

  // Test decisionService
  const decRes = await decisionService.recordDecision({
    case_id: 'case-alpha-2026',
    status: 'ACCEPTED',
    selected_strategy: 'Competitive Tension'
  });
  assert.ok(decRes.decision_id);

  const retainRes = await decisionService.retainOutcome({
    case_id: 'case-alpha-2026',
    actual_outcome: 'Settled at -16%',
    lessons: 'Competitive tension works',
    retained_strategy: 'Mini-RFP'
  });
  assert.ok(retainRes.retained_outcome_id);
});
