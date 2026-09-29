/**
 * Decision Service
 * Records human procurement manager decisions and retains post-negotiation outcomes.
 */

import {
  DecisionRecordRequest,
  DecisionRecordResponse,
  OutcomeRetainRequest,
  OutcomeRetainResponse
} from '../types';
import { apiRequest } from './api.js';
import { MOCK_DECISIONS } from '../mock/mockData.js';

export const decisionService = {
  /**
   * Record human procurement manager discretionary decision
   */
  async recordDecision(request: DecisionRecordRequest): Promise<DecisionRecordResponse> {
    try {
      return await apiRequest<DecisionRecordResponse>('/api/decisions', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    } catch (err) {
      console.warn('[decisionService] Backend recordDecision unavailable. Falling back to local storage.', err);
      
      const decisionId = `dec-${request.case_id}-${Date.now()}`;
      MOCK_DECISIONS[request.case_id] = {
        id: decisionId,
        caseId: request.case_id,
        status: request.status,
        selectedStrategy: request.selected_strategy,
        modifications: request.modifications || '',
        notes: request.notes || '',
        timestamp: new Date().toISOString(),
        decidedBy: request.decided_by || 'Human Procurement Manager'
      };

      return {
        decision_id: decisionId,
        case_id: request.case_id,
        recorded_at: new Date().toISOString(),
        status: request.status,
        message: 'Decision recorded locally (mock mode).'
      };
    }
  },

  /**
   * Retain completed negotiation outcome back into Hindsight memory bank
   */
  async retainOutcome(request: OutcomeRetainRequest): Promise<OutcomeRetainResponse> {
    try {
      return await apiRequest<OutcomeRetainResponse>('/api/outcomes/retain', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    } catch (err) {
      console.warn('[decisionService] Backend retainOutcome unavailable. Falling back to local retention.', err);
      
      const outcomeId = `outcome-${request.case_id}-${Date.now()}`;
      const memoryId = `deal-${request.case_id}-${Date.now()}`;

      return {
        retained_outcome_id: outcomeId,
        memory_id: memoryId,
        case_id: request.case_id,
        hindsight_synced: false,
        retained_at: new Date().toISOString(),
        message: 'Outcome retained into local memory store (mock mode).'
      };
    }
  }
};
