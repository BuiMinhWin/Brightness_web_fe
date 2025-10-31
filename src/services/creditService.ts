/**
 * Unified Credit Service
 * 
 * Provides centralized access to the BillingAPI credit management system.
 * All AI-related services (chat, schedule, etc.) should use this service
 * for credit balance and usage tracking.
 */

import { httpRequest } from './httpClientRedux';

export interface CreditBalance {
  remainingTokens: number;
  monthlyTokens: number;
  usedTokens: number;
  resetDate: string;
  subscriptionTier: 'free' | 'basic' | 'premium';
  canAfford: boolean;
  daysUntilReset: number;
}

export interface CreditOperationLog {
  id: string;
  userId: string;
  serviceName: string;
  operationType: string;
  tokensUsed: number;
  creditCost: number;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  referenceId?: string;
  createdAt: string;
}

export interface CreditHistoryResponse {
  operations: CreditOperationLog[];
  totalPages: number;
  currentPage: number;
}

export interface CanAffordResponse {
  canAfford: boolean;
  remainingTokens: number;
  estimatedCost: number;
}

class CreditService {
  private baseUrl = '/billing/api/AICredits';

  /**
   * Get credit balance for a specific service
   * @param userId User ID
   * @param serviceName Service name ('chat' or 'schedule')
   */
  async getCreditBalance(userId: string, serviceName: 'chat' | 'schedule'): Promise<CreditBalance> {
    const response = await httpRequest<{ success: boolean; data: CreditBalance }>(
      `${this.baseUrl}/${userId}/balance/${serviceName}`,
      { method: 'GET' }
    );

    // Calculate days until reset
    const resetDate = new Date(response.data.resetDate);
    const now = new Date();
    const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ...response.data,
      daysUntilReset: Math.max(0, daysUntilReset)
    };
  }

  /**
   * Check if user can afford an operation
   * @param userId User ID
   * @param serviceName Service name ('chat' or 'schedule')
   * @param estimatedTokens Estimated tokens needed
   */
  async canAffordOperation(
    userId: string,
    serviceName: 'chat' | 'schedule',
    estimatedTokens: number
  ): Promise<CanAffordResponse> {
    const response = await httpRequest<{ success: boolean; data: CanAffordResponse }>(
      `${this.baseUrl}/${userId}/can-afford?serviceName=${serviceName}&estimatedTokens=${estimatedTokens}`,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Get credit usage history
   * @param userId User ID
   * @param serviceName Optional service name filter
   * @param pageNumber Page number (1-based)
   * @param pageSize Number of records per page
   */
  async getCreditHistory(
    userId: string,
    serviceName?: 'chat' | 'schedule',
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<CreditHistoryResponse> {
    let url = `${this.baseUrl}/${userId}/history?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    
    if (serviceName) {
      url += `&serviceName=${serviceName}`;
    }

    const response = await httpRequest<{ success: boolean; data: CreditHistoryResponse }>(
      url,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Initialize credit pools for a user (admin/system use)
   * @param userId User ID
   * @param subscriptionTier Subscription tier
   */
  async initializeCreditPools(
    userId: string,
    subscriptionTier: 'free' | 'basic' | 'premium' = 'free'
  ): Promise<void> {
    await httpRequest(
      `${this.baseUrl}/${userId}/initialize?subscriptionTier=${subscriptionTier}`,
      { method: 'POST' }
    );
  }

  /**
   * Format tokens to human-readable string
   * @param tokens Number of tokens
   */
  formatTokens(tokens: number): string {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  }

  /**
   * Get user-friendly operation name
   * @param operationType Operation type from backend
   */
  getOperationDisplayName(operationType: string): string {
    const displayNames: Record<string, string> = {
      'chat_message': 'Chat Message',
      'schedule_generation': 'Schedule Generation',
      'schedule_modification': 'Schedule Modification',
      'schedule_adjustment': 'Schedule Adjustment',
    };

    return displayNames[operationType] || operationType;
  }

  /**
   * Get credit cost multiplier description
   * @param operationType Operation type
   */
  getCostMultiplierDescription(operationType: string): string {
    const descriptions: Record<string, string> = {
      'chat_message': '1x tokens (base cost)',
      'schedule_generation': '5x tokens (complex AI generation)',
      'schedule_modification': '3x tokens (moderate AI work)',
      'schedule_adjustment': '2x tokens (simple AI work)',
    };

    return descriptions[operationType] || 'Variable cost';
  }

  /**
   * Estimate tokens for an operation (rough estimates)
   */
  estimateTokens(operation: {
    type: 'chat_short' | 'chat_long' | 'schedule_full' | 'schedule_modify';
    messageLength?: number;
  }): number {
    switch (operation.type) {
      case 'chat_short':
        return 200;
      case 'chat_long':
        return operation.messageLength ? Math.ceil(operation.messageLength / 4) * 2 : 500;
      case 'schedule_full':
        return 1500; // Rough estimate for full schedule generation
      case 'schedule_modify':
        return 600; // Rough estimate for schedule modification
      default:
        return 100;
    }
  }
}

// Export singleton instance
export const creditService = new CreditService();
export default creditService;

