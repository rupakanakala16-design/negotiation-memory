/**
 * Case Service
 * Manages negotiation case retrieval with graceful mock fallback.
 */

import { NegotiationCase, HistoricalMemory } from '../types';
import { apiRequest } from './api.js';
import { MOCK_CASES, MOCK_MEMORIES } from '../mock/mockData.js';

export const caseService = {
  /**
   * Retrieve all active and historical negotiation cases
   */
  async getCases(): Promise<NegotiationCase[]> {
    try {
      return await apiRequest<NegotiationCase[]>('/api/cases');
    } catch (err) {
      console.warn('[caseService] Backend unavailable. Falling back to mock cases.', err);
      return [...MOCK_CASES];
    }
  },

  /**
   * Retrieve a single negotiation case by ID
   */
  async getCaseById(caseId: string): Promise<NegotiationCase> {
    try {
      return await apiRequest<NegotiationCase>(`/api/cases/${caseId}`);
    } catch (err) {
      console.warn(`[caseService] Backend unavailable for case ${caseId}. Falling back to mock.`, err);
      const found = MOCK_CASES.find(c => c.id === caseId);
      if (found) return found;
      throw new Error(`Case ${caseId} not found in mock store`);
    }
  },

  /**
   * Retrieve precedent memories associated with a case
   */
  async getCaseMemories(caseId: string): Promise<HistoricalMemory[]> {
    try {
      return await apiRequest<HistoricalMemory[]>(`/api/cases/${caseId}/memories`);
    } catch (err) {
      console.warn(`[caseService] Backend unavailable for case memories ${caseId}. Falling back to mock.`, err);
      return [...MOCK_MEMORIES];
    }
  }
};
