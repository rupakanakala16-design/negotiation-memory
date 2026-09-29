/**
 * Analysis Service
 * Manages condition difference detection, Hindsight reflection, and strategy recommendation.
 */

import {
  ConditionDiffRequest,
  ConditionDiffResponse,
  ReflectRequest,
  ReflectResponse,
  StrategyRecommendRequest,
  StrategyRecommendResponse
} from '../types';
import { apiRequest } from './api.js';
import { MOCK_CONDITION_DIFFS, MOCK_REFLECTIONS, MOCK_STRATEGIES } from '../mock/mockData.js';

export const analysisService = {
  /**
   * Compare past precedent conditions against active negotiation conditions
   */
  async computeConditionDiff(request: ConditionDiffRequest): Promise<ConditionDiffResponse> {
    try {
      return await apiRequest<ConditionDiffResponse>('/api/analysis/condition-diff', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    } catch (err) {
      console.warn('[analysisService] Backend condition-diff unavailable. Falling back to mock.', err);
      
      const caseId = request.current_case.id;
      const diffs = MOCK_CONDITION_DIFFS[caseId] || [
        {
          dimension: 'Supply Balance',
          historicalValue: 'SHORTAGE',
          currentValue: request.current_case.supplyBalance,
          impact: 'Condition shift detected',
          severity: 'MODERATE'
        }
      ];

      return {
        case_id: caseId,
        reference_memory_id: request.reference_memory_id || 'deal-alpha-shortage-001',
        differences: diffs,
        summary: `Condition difference evaluated for ${request.current_case.counterparty}: ${request.current_case.supplyBalance} balance with ${request.current_case.alternatives} alternatives.`,
        has_meaningful_shift: true,
        repeat_warning: 'Do not repeat historical volume exclusivity in a surplus market.',
        recommended_pivot: 'Deploy competitive tension and index-linked ratchets.'
      };
    }
  },

  /**
   * Run Hindsight reflection over retrieved memories and condition differences
   */
  async runReflection(request: ReflectRequest): Promise<ReflectResponse> {
    try {
      return await apiRequest<ReflectResponse>('/api/analysis/reflect', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    } catch (err) {
      console.warn('[analysisService] Backend reflect unavailable. Falling back to mock.', err);
      
      const reflection = MOCK_REFLECTIONS[request.case_id] || {
        memoriesConsidered: ['deal-alpha-shortage-001', 'deal-alpha-surplus-002'],
        alignedPatterns: ['Surplus markets favor unbundled competitive tension.'],
        conflictingPrecedents: ['Historical shortage required volume lock-in.'],
        synthesis: 'Past tactics cannot be repeated without adapting to current surplus conditions.',
        evidence: [
          { memoryId: 'deal-alpha-shortage-001', fact: 'Alpha held high leverage in shortage.', relevance: 0.95 }
        ],
        reflectionSource: 'fallback_rule_based'
      };

      return {
        case_id: request.case_id,
        reflection
      };
    }
  },

  /**
   * Formulate grounded negotiation strategy recommendations
   */
  async recommendStrategy(request: StrategyRecommendRequest): Promise<StrategyRecommendResponse> {
    try {
      return await apiRequest<StrategyRecommendResponse>('/api/analysis/recommend', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    } catch (err) {
      console.warn('[analysisService] Backend recommend unavailable. Falling back to mock.', err);
      
      const strategy = MOCK_STRATEGIES[request.case_id] || {
        title: 'Adaptive Procurement Strategy with Competitive Benchmarking',
        confidence: 0.88,
        rationale: 'Derived from precedent memory analysis and condition contrast.',
        tacticalLevers: [
          'Conduct competitive mini-RFP with qualified alternatives',
          'Unbundle contract pricing tiers',
          'Demand quarterly market index price adjustments'
        ],
        tacticsToAvoid: [
          'Do not offer exclusive multi-year volume commitments'
        ],
        concessionStrategy: 'Trade order predictability for baseline unit cost reduction.',
        supportingMemories: ['deal-alpha-surplus-002'],
        risks: ['Supplier may propose hidden access fees']
      };

      return {
        case_id: request.case_id,
        strategy,
        reflection_source: 'fallback_rule_based'
      };
    }
  }
};
