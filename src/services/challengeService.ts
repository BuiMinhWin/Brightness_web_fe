import type { ApiResponse } from "../models/common";
import type { Challenge, ChallengeParticipant, UserChallengeStats } from "../models/challenge";
import { httpRequest } from "./httpClient";

const challengePrefix = "/challenge/api";

export const challengeService = {
  /** Get all challenges */
  async getAllChallenges(): Promise<Challenge[]> {
    const response = await httpRequest<Challenge[]>(`${challengePrefix}/Challenges`, {
      method: "GET",
    });
    return response;
  },

  /** Get challenge by ID */
  async getChallengeById(challengeId: string): Promise<Challenge> {
    const response = await httpRequest<Challenge>(`${challengePrefix}/Challenges/${challengeId}`, {
      method: "GET",
    });
    return response;
  },

  /** Get all participants for a challenge */
  async getChallengeParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
    const response = await httpRequest<ChallengeParticipant[]>(
      `${challengePrefix}/challenges/${challengeId}/participants`,
      {
        method: "GET",
      }
    );
    return response;
  },

  /** Get all participations for a user */
  async getUserParticipations(userId: string): Promise<ChallengeParticipant[]> {
    try {
      // Get all participants
      const allParticipants = await httpRequest<ChallengeParticipant[]>(
        `${challengePrefix}/ChallengeParticipants`,
        {
          method: "GET",
        }
      );
      
      // Filter by userId
      return allParticipants.filter(p => p.userId === userId);
    } catch (error) {
      console.error("Error fetching user participations:", error);
      return [];
    }
  },

  /** Get user rank in a challenge leaderboard */
  async getUserRank(challengeId: string, userId: string): Promise<{ rank: number; totalParticipants: number } | null> {
    try {
      const response = await httpRequest<{ rank: number; totalParticipants: number }>(
        `${challengePrefix}/leaderboard/${challengeId}/users/${userId}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching user rank:", error);
      return null;
    }
  },

  /** Calculate user challenge statistics */
  async getUserChallengeStats(userId: string): Promise<UserChallengeStats> {
    try {
      const participations = await this.getUserParticipations(userId);
      const challenges = await this.getAllChallenges();
      
      const completed = participations.filter(p => 
        p.status === 'completed' || (p.percentageCompleted && p.percentageCompleted >= 100)
      );
      
      const inProgress = participations.filter(p => 
        p.status === 'active' || p.status === 'in_progress'
      );

      // Calculate active days based on participation dates
      const activeDaysSet = new Set<string>();
      participations.forEach(p => {
        const challenge = challenges.find(c => c.id === p.challengeId);
        if (challenge) {
          const joinDate = new Date(p.joinedAt);
          const endDate = challenge.status === 'completed' ? new Date(challenge.endAt) : new Date();
          const daysDiff = Math.floor((endDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
          
          for (let i = 0; i <= daysDiff; i++) {
            const date = new Date(joinDate);
            date.setDate(date.getDate() + i);
            activeDaysSet.add(date.toISOString().split('T')[0]);
          }
        }
      });

      // Get best rank from all participations
      const ranks = await Promise.all(
        participations.map(async p => {
          const rank = await this.getUserRank(p.challengeId, userId);
          return rank?.rank || null;
        })
      );
      const bestRank = Math.min(...ranks.filter(r => r !== null) as number[]);

      // Get current and longest streak
      const currentStreak = Math.max(...participations.map(p => p.currentStreak || 0), 0);
      const longestStreak = Math.max(...participations.map(p => p.longestStreak || 0), 0);

      return {
        totalParticipated: participations.length,
        totalCompleted: completed.length,
        totalInProgress: inProgress.length,
        activeDays: activeDaysSet.size,
        currentStreak,
        longestStreak,
        bestRank: bestRank !== Infinity ? bestRank : undefined,
      };
    } catch (error) {
      console.error("Error calculating user challenge stats:", error);
      return {
        totalParticipated: 0,
        totalCompleted: 0,
        totalInProgress: 0,
        activeDays: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }
  },
};
