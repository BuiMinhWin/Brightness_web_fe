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
  progress?: ChallengeTaskProgress[]; // Add progress to the participant type
}

// Challenge Task Progress Models
export interface ChallengeTaskProgressDTO {
  participantId: string;
  challengeTaskId: string;
  targetDate?: string;
  status?: string;
  validationData?: string;
  pointsEarned?: number;
  completedAt?: string;
}

export interface ChallengeTaskProgress extends ChallengeTaskProgressDTO {
  id: string;
}

// Achievement Models
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

// Leaderboard Models
export interface LeaderboardEntry {
  userId: string;
  userName?: string;
  totalPoints: number;
  rank: number;
}

export interface UserChallengeStats {
  totalParticipated: number;
  totalCompleted: number;
  totalInProgress: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  bestRank?: number;
}