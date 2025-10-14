

import type { ApiResponse } from "../models";
import { httpRequest } from "./httpClientRedux";

// Challenge Models
export interface ChallengeDTO {
  hostUserId: string;
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  status: string;
  maxParticipants?: number;
  prizePool?: number;
  category?: string;
  taskSummary?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Challenge extends ChallengeDTO {
  id: string;
}

// Challenge Rule Models
export interface ChallengeRuleDTO {
  challengeId: string;
  howToParticipate?: string[];
  ruleText?: string[];
}

export interface ChallengeRule extends ChallengeRuleDTO {
  id: string;
}

// Challenge Task Models
export interface ChallengeTaskDTO {
  challengeId: string;
  name: string;
  description?: string;
  taskType?: string;
  frequencyRule?: string;
  points?: number;
  isRequired: boolean;
  validationRule?: string;
  startDate?: string;
  endDate?: string;
}

export interface ChallengeTask extends ChallengeTaskDTO {
  id: string;
}

// Challenge Participant Models
export interface ChallengeParticipantDTO {
  challengeId: string;
  userId: string;
  joinedAt?: string;
  status?: string;
  totalPoints?: number;
  percentageCompleted?: number;
  currentStreak?: number;
  longestStreak?: number;
}

export interface ChallengeParticipant extends ChallengeParticipantDTO {
  id: string;
}

// Challenge Task Progress Models
export interface ChallengeTaskProgressDTO {
  participantId: string;
  taskId: string;
  status?: string;
  completedAt?: string;
  pointsEarned?: number;
  submissionData?: string;
  verificationStatus?: string;
}

export interface ChallengeTaskProgress extends ChallengeTaskProgressDTO {
  id: string;
}

// ✅ Achievement Models
export interface AchievementDTO {
  userId: string;
  challengeId?: string;
  code: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface Achievement extends AchievementDTO {
  id: string;
}

// ✅ Leaderboard Models
export interface LeaderboardEntry {
  userId: string;
  userName?: string;
  totalPoints: number;
  rank: number;
}

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
    return httpRequest<ApiResponse<string>>(`/challenge/api/Challenges/${id}`, { method: "DELETE" });
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
  if (!challengeId || challengeId === 'undefined' || challengeId === 'null') {
    console.error("❌ Invalid challengeId provided to getRulesByChallengeId:", challengeId);
    return [];
  }
  
  try {
    console.log(`🔍 Fetching rules for challenge: ${challengeId}`);
    const url = `/challenge/api/challenges/${challengeId}/rules`;
    console.log(`📡 API URL: ${url}`);
    
    const result = await httpRequest<ChallengeRule[]>(url, { method: "GET" });
    console.log(`✅ Rules response:`, result);
    
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

  async patchChallengeRule(id: string, patchData: Record<string, any>): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeRules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json-patch+json" },
      body: JSON.stringify(patchData),
    });
  },

  async deleteChallengeRule(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeRules/${id}`, { method: "DELETE" });
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
  if (!challengeId || challengeId === 'undefined' || challengeId === 'null') {
    console.error("❌ Invalid challengeId provided to getTasksByChallengeId:", challengeId);
    return [];
  }
  
  try {
    console.log(`🔍 Fetching tasks for challenge: ${challengeId}`);
    const url = `/challenge/api/challenges/${challengeId}/tasks`;
    console.log(`📡 API URL: ${url}`);
    
    const result = await httpRequest<ChallengeTask[]>(url, { method: "GET" });
    console.log(`✅ Tasks response:`, result);
    
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
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeTasks/${id}`, { method: "DELETE" });
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
    return httpRequest<ChallengeParticipant>(`/challenge/api/ChallengeParticipants/${id}`, { method: "GET" });
  },

  async getAllChallengeParticipants(): Promise<ChallengeParticipant[]> {
    return httpRequest<ChallengeParticipant[]>("/challenge/api/ChallengeParticipants", { method: "GET" });
  },

 async getParticipantsByChallengeId(challengeId: string): Promise<ChallengeParticipant[]> {
  if (!challengeId || challengeId === 'undefined' || challengeId === 'null') {
    console.error("❌ Invalid challengeId provided to getParticipantsByChallengeId:", challengeId);
    return [];
  }
  
  try {
    console.log(`🔍 Fetching participants for challenge: ${challengeId}`);
    const url = `/challenge/api/challenges/${challengeId}/participants`;
    console.log(`📡 API URL: ${url}`);
    
    const result = await httpRequest<ChallengeParticipant[]>(url, { method: "GET" });
    console.log(`✅ Participants response:`, result);
    
    return result;
  } catch (error) {
    console.error(`❌ Error fetching participants for challenge ${challengeId}:`, error);
    return [];
  }
},



  async updateChallengeParticipant(id: string, data: ChallengeParticipantDTO): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeParticipants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async deleteChallengeParticipant(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeParticipants/${id}`, { method: "DELETE" });
  },

  // ============ CHALLENGE TASK PROGRESS ENDPOINTS ============
  async createChallengeTaskProgress(data: ChallengeTaskProgressDTO): Promise<ChallengeTaskProgress> {
    return httpRequest<ChallengeTaskProgress>("/challenge/api/ChallengeTaskProgresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getChallengeTaskProgress(id: string): Promise<ChallengeTaskProgress> {
    return httpRequest<ChallengeTaskProgress>(`/challenge/api/ChallengeTaskProgresses/${id}`, { method: "GET" });
  },

  async getAllChallengeTaskProgresses(): Promise<ChallengeTaskProgress[]> {
    return httpRequest<ChallengeTaskProgress[]>("/challenge/api/ChallengeTaskProgresses", { method: "GET" });
  },

  async getProgressByParticipantId(participantId: string): Promise<ChallengeTaskProgress[]> {
    return httpRequest<ChallengeTaskProgress[]>(`/challenge/api/participants/${participantId}/progresses`, { method: "GET" });
  },

  async updateChallengeTaskProgress(id: string, data: ChallengeTaskProgressDTO): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeTaskProgresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async patchChallengeTaskProgress(id: string, patchData: Record<string, any>): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeTaskProgresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchData),
    });
  },

  async deleteChallengeTaskProgress(id: string): Promise<ApiResponse<string>> {
    return httpRequest<ApiResponse<string>>(`/challenge/api/ChallengeTaskProgresses/${id}`, { method: "DELETE" });
  },

  // ✅ ============ ACHIEVEMENT ENDPOINTS ============
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
    return httpRequest<ApiResponse<string>>(`/challenge/api/Achievements/${id}`, { method: "DELETE" });
  },

  // ✅ ============ LEADERBOARD ENDPOINTS ============
  async getAllLeaderboards(): Promise<LeaderboardEntry[]> {
    return httpRequest<LeaderboardEntry[]>("/challenge/api/leaderboard", { method: "GET" });
  },

  async getLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    return httpRequest<LeaderboardEntry[]>(`/challenge/api/leaderboard/${challengeId}`, { method: "GET" });
  },

  async getUserRank(challengeId: string, userId: string): Promise<LeaderboardEntry> {
    return httpRequest<LeaderboardEntry>(`/challenge/api/leaderboard/${challengeId}/users/${userId}`, { method: "GET" });
  },

  async resetLeaderboard(challengeId: string): Promise<void> {
    return httpRequest<void>(`/challenge/api/leaderboard/${challengeId}`, { method: "DELETE" });
  },
};
