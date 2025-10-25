// Challenge Models
export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  joinedAt: string;
  status: string;
  totalPoints?: number;
  percentageCompleted?: number;
  currentStreak?: number;
  longestStreak?: number;
}

export interface Challenge {
  id: string;
  hostUserId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  status: string;
  maxParticipants?: number;
  prizePool?: number;
  category: string;
  taskSummary?: string;
  createdAt: string;
  updatedAt?: string;
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

