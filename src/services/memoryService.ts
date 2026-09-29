/**
 * Memory Service
 * Handles memory recall, thematic clustering, and timeline retrieval.
 */

import {
  HistoricalMemory,
  MemoryRecallRequest,
  MemoryRecallResponse,
  MemoryCluster,
  MemoryTimelineEvent
} from '../types';
import { apiRequest } from './api.js';
import { MOCK_MEMORIES, MOCK_CLUSTERS, MOCK_TIMELINE } from '../mock/mockData.js';

export const memoryService = {
  /**
   * Recall relevant precedents using vector and condition similarity
   */
  async recallMemories(request: MemoryRecallRequest): Promise<MemoryRecallResponse> {
    try {
      return await apiRequest<MemoryRecallResponse>('/api/memory/recall', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    } catch (err) {
      console.warn('[memoryService] Backend recall unavailable. Falling back to mock memories.', err);
      
      const topK = request.top_k || 6;
      let memories = [...MOCK_MEMORIES];

      // If category is provided, prioritize it
      if (request.category) {
        memories = memories.sort((a, b) => {
          const matchA = a.category.toLowerCase().includes(request.category!.toLowerCase()) ? 1 : 0;
          const matchB = b.category.toLowerCase().includes(request.category!.toLowerCase()) ? 1 : 0;
          return matchB - matchA;
        });
      }

      return {
        memories: memories.slice(0, topK),
        retrieval_metadata: {
          method: 'mock_precedent',
          top_k: topK,
          bank_id: 'negotiation-memory',
          total_evaluated: MOCK_MEMORIES.length
        }
      };
    }
  },

  /**
   * Retrieve thematic clusters of institutional memory
   */
  async getMemoryClusters(): Promise<MemoryCluster[]> {
    try {
      return await apiRequest<MemoryCluster[]>('/api/memory/clusters');
    } catch (err) {
      console.warn('[memoryService] Backend clusters unavailable. Falling back to mock.', err);
      return [...MOCK_CLUSTERS];
    }
  },

  /**
   * Retrieve chronological memory timeline
   */
  async getMemoryTimeline(supplier?: string): Promise<MemoryTimelineEvent[]> {
    const query = supplier ? `?supplier=${encodeURIComponent(supplier)}` : '';
    try {
      return await apiRequest<MemoryTimelineEvent[]>(`/api/memory/timeline${query}`);
    } catch (err) {
      console.warn('[memoryService] Backend timeline unavailable. Falling back to mock.', err);
      if (supplier) {
        return MOCK_TIMELINE.filter(t => t.counterparty.toLowerCase().includes(supplier.toLowerCase()));
      }
      return [...MOCK_TIMELINE];
    }
  }
};
