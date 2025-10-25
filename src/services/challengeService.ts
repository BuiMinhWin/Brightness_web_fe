import type { ApiResponse } from "../models/common";
import type {
  Achievement,
  AchievementDTO,
  Challenge,
  ChallengeDTO,
  ChallengeParticipant,
  ChallengeParticipantDTO,
  ChallengeRule,
  ChallengeRuleDTO,
  ChallengeTask,
  ChallengeTaskDTO,
  ChallengeTaskProgress,
  ChallengeTaskProgressDTO,
  LeaderboardEntry,
  UserChallengeStats,
} from "../models/challenge";
import { httpRequest } from "./httpClient";

const challengePrefix = "/challenge/api";

export const challengeService = {
  // ============ CHALLENGE ENDPOINTS ============
  async createChallenge(data: ChallengeDTO): Promise<Challenge> {
    return httpRequest<Challenge>("/challenge/api/Challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getChallenge(id: string): Promise<Challenge> {
    return httpRequest<Challenge>(`/challenge/api/Challenges/${id}`, { method: "GET" });
  },

  async getAllChallenges(): Promise<Challenge[]> {
    return httpRequest<Challenge[]>("/challenge/api/Challenges", { method: "GET" });
  },

  async updateChallenge(id: string, data: ChallengeDTO): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/Challenges/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async patchChallenge(id: string, patchData: Record<string, any>): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/Challenges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json-patch+json" },
      body: JSON.stringify(patchData),
    });
  },

  async deleteChallenge(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/Challenges/${id}`, {
      method: "DELETE",
    });
  },

  // ============ CHALLENGE RULE ENDPOINTS ============
  async createChallengeRule(data: ChallengeRuleDTO): Promise<ChallengeRule> {
    return httpRequest<ChallengeRule>("/challenge/api/ChallengeRules", {
      method: "POST",
      headers: { "Content-Type": "application/json-patch+json" },
      body: JSON.stringify(data),
    });
  },

  async getChallengeRule(id: string): Promise<ChallengeRule> {
    return httpRequest<ChallengeRule>(`/challenge/api/ChallengeRules/${id}`, { method: "GET" });
  },

  async getAllChallengeRules(): Promise<ChallengeRule[]> {
    return httpRequest<ChallengeRule[]>("/challenge/api/ChallengeRules", { method: "GET" });
  },

  async getRulesByChallengeId(challengeId: string): Promise<ChallengeRule[]> {
    if (!challengeId || challengeId === "undefined" || challengeId === "null") {
      console.error("❌ Invalid challengeId provided to getRulesByChallengeId:", challengeId);
      return [];
    }

    try {
      const url = `/challenge/api/challenges/${challengeId}/rules`;
      const result = await httpRequest<ChallengeRule[]>(url, { method: "GET" });
      return result;
    } catch (error) {
      console.error(`❌ Error fetching rules for challenge ${challengeId}:`, error);
      return [];
    }
  },

  async updateChallengeRule(id: string, data: ChallengeRuleDTO): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeRules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json-patch+json" },
      body: JSON.stringify(data),
    });
  },

  async patchChallengeRule(
    id: string,
    patchData: Record<string, any>
  ): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeRules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json-patch+json" },
      body: JSON.stringify(patchData),
    });
  },

  async deleteChallengeRule(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeRules/${id}`, {
      method: "DELETE",
    });
  },

  // ============ CHALLENGE TASK ENDPOINTS ============
  async createChallengeTask(data: ChallengeTaskDTO): Promise<ChallengeTask> {
    return httpRequest<ChallengeTask>("/challenge/api/ChallengeTasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getChallengeTask(id: string): Promise<ChallengeTask> {
    return httpRequest<ChallengeTask>(`/challenge/api/ChallengeTasks/${id}`, { method: "GET" });
  },

  async getAllChallengeTasks(): Promise<ChallengeTask[]> {
    return httpRequest<ChallengeTask[]>("/challenge/api/ChallengeTasks", { method: "GET" });
  },

  async getTasksByChallengeId(challengeId: string): Promise<ChallengeTask[]> {
    if (!challengeId || challengeId === "undefined" || challengeId === "null") {
      console.error("❌ Invalid challengeId provided to getTasksByChallengeId:", challengeId);
      return [];
    }

    try {
      const url = `/challenge/api/challenges/${challengeId}/tasks`;
      const result = await httpRequest<ChallengeTask[]>(url, { method: "GET" });
      return result;
    } catch (error) {
      console.error(`❌ Error fetching tasks for challenge ${challengeId}:`, error);
      return [];
    }
  },

  async updateChallengeTask(id: string, data: ChallengeTaskDTO): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeTasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async deleteChallengeTask(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeTasks/${id}`, {
      method: "DELETE",
    });
  },

  // ============ CHALLENGE PARTICIPANT ENDPOINTS ============
  async createChallengeParticipant(data: ChallengeParticipantDTO): Promise<ChallengeParticipant> {
    return httpRequest<ChallengeParticipant>("/challenge/api/ChallengeParticipants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getChallengeParticipant(id: string): Promise<ChallengeParticipant> {
    return httpRequest<ChallengeParticipant>(`/challenge/api/ChallengeParticipants/${id}`, {
      method: "GET",
    });
  },

  async getAllChallengeParticipants(): Promise<ChallengeParticipant[]> {
    return httpRequest<ChallengeParticipant[]>("/challenge/api/ChallengeParticipants", {
      method: "GET",
    });
  },

  async getParticipantsByUserId(userId: string): Promise<ChallengeParticipant[]> {
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("❌ Invalid userId provided to getParticipantsByUserId:", userId);
      return [];
    }

    try {
      // Reverting to client-side filtering as the direct API endpoint is not found.
      const allParticipants = await this.getAllChallengeParticipants();
      return allParticipants.filter((p) => p.userId === userId);
    } catch (error) {
      console.error(`❌ Error fetching participants for user ${userId}:`, error);
      return [];
    }
  },

  async getParticipantsByChallengeId(challengeId: string): Promise<ChallengeParticipant[]> {
    if (!challengeId || challengeId === "undefined" || challengeId === "null") {
      console.error(
        "❌ Invalid challengeId provided to getParticipantsByChallengeId:",
        challengeId
      );
      return [];
    }

    try {
      const url = `/challenge/api/challenges/${challengeId}/participants`;
      const result = await httpRequest<ChallengeParticipant[]>(url, { method: "GET" });
      return result;
    } catch (error) {
      console.error(`❌ Error fetching participants for challenge ${challengeId}:`, error);
      return [];
    }
  },

  async updateChallengeParticipant(
    id: string,
    data: ChallengeParticipantDTO
  ): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeParticipants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async deleteChallengeParticipant(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeParticipants/${id}`, {
      method: "DELETE",
    });
  },

  // ============ CHALLENGE TASK PROGRESS ENDPOINTS ============
  async createChallengeTaskProgress(
    data: ChallengeTaskProgressDTO
  ): Promise<ChallengeTaskProgress> {
    return httpRequest<ChallengeTaskProgress>("/challenge/api/ChallengeTaskProgresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getChallengeTaskProgress(id: string): Promise<ChallengeTaskProgress> {
    return httpRequest<ChallengeTaskProgress>(`/challenge/api/ChallengeTaskProgresses/${id}`, {
      method: "GET",
    });
  },

  async getAllChallengeTaskProgresses(): Promise<ChallengeTaskProgress[]> {
    return httpRequest<ChallengeTaskProgress[]>("/challenge/api/ChallengeTaskProgresses", {
      method: "GET",
    });
  },

  async getProgressByParticipantId(participantId: string): Promise<ChallengeTaskProgress[]> {
    return httpRequest<ChallengeTaskProgress[]>(
      `/challenge/api/participants/${participantId}/progresses`,
      { method: "GET" }
    );
  },

  async updateChallengeTaskProgress(
    id: string,
    data: ChallengeTaskProgressDTO
  ): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeTaskProgresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async patchChallengeTaskProgress(
    id: string,
    patchData: Record<string, any>
  ): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeTaskProgresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchData),
    });
  },

  async deleteChallengeTaskProgress(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeTaskProgresses/${id}`, {
      method: "DELETE",
    });
  },

  // ============ ACHIEVEMENT ENDPOINTS ============
  async createAchievement(data: AchievementDTO): Promise<Achievement> {
    return httpRequest<Achievement>("/challenge/api/Achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getAchievement(id: string): Promise<Achievement> {
    return httpRequest<Achievement>(`/challenge/api/Achievements/${id}`, { method: "GET" });
  },

  async getAchievementsByUser(userId?: string): Promise<Achievement[]> {
    const url = userId ? `/challenge/api/users/${userId}/achievements` : "/api/users/achievements";
    return httpRequest<Achievement[]>(url, { method: "GET" });
  },

  async updateAchievement(id: string, data: AchievementDTO): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/Achievements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async deleteAchievement(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/Achievements/${id}`, {
      method: "DELETE",
    });
  },

  async getAllLeaderboards(): Promise<LeaderboardEntry[]> {
    return httpRequest<LeaderboardEntry[]>("/challenge/api/leaderboard", { method: "GET" });
  },

  async getLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    return httpRequest<LeaderboardEntry[]>(`/challenge/api/leaderboard/${challengeId}`, {
      method: "GET",
    });
  },

  async resetLeaderboard(challengeId: string): Promise<void> {
    return httpRequest<void>(`/challenge/api/leaderboard/${challengeId}`, { method: "DELETE" });
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
      return allParticipants.filter((p) => p.userId === userId);
    } catch (error) {
      console.error("Error fetching user participations:", error);
      return [];
    }
  },

  /** Get user rank in a challenge leaderboard */
  async getUserRank(
    challengeId: string,
    userId: string
  ): Promise<{ rank: number; totalParticipants: number } | null> {
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

      const completed = participations.filter(
        (p) => p.status === "completed" || (p.percentageCompleted && p.percentageCompleted >= 100)
      );

      const inProgress = participations.filter(
        (p) => p.status === "active" || p.status === "in_progress"
      );

      // Calculate active days based on participation dates
      const activeDaysSet = new Set<string>();
      participations.forEach((p) => {
        const challenge = challenges.find((c) => c.id === p.challengeId);
        if (challenge && p.joinedAt) {
          const joinDate = new Date(p.joinedAt);
          const endDate = (challenge.status === "completed" && challenge.endAt) ? new Date(challenge.endAt) : new Date();
          const daysDiff = Math.floor(
            (endDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff >= 0) {
            for (let i = 0; i <= daysDiff; i++) {
              const date = new Date(joinDate);
              date.setDate(date.getDate() + i);
              activeDaysSet.add(date.toISOString().split("T")[0]);
            }
          }
        }
      });

      // Get best rank from all participations
      const ranks = await Promise.all(
        participations.map(async (p) => {
          const rank = await this.getUserRank(p.challengeId, userId);
          return rank?.rank || null;
        })
      );
      const bestRank = Math.min(...(ranks.filter((r) => r !== null) as number[]));

      // Get current and longest streak
      const currentStreak = Math.max(...participations.map((p) => p.currentStreak || 0), 0);
      const longestStreak = Math.max(...participations.map((p) => p.longestStreak || 0), 0);

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
