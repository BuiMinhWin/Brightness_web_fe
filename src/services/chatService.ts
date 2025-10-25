import { httpRequest } from "./httpClientRedux";

export interface SendMessageRequest {
  sessionId?: string;
  message: string;
}

export interface SendMessageResponse {
  sessionId: string;
  message: string;
  role: string;
  remainingMessages: number;  // Legacy
  dailyLimit: number;          // Legacy
  createdAt: string;
  // New credit system fields
  remainingCredits?: number;
  monthlyCredits?: number;
  subscriptionTier?: "free" | "basic" | "premium";
  // AI Agent fields
  requiresConfirmation?: boolean;
  pendingActionType?: string;
  pendingActionParams?: { [key: string]: string };
  actionResult?: {
    success: boolean;
    message: string;
    data?: any;
    errorCode?: string;
    creditsUsed?: number;
    remainingCredits?: number;
  };
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  role: string;
  content: string;
  tokenCount?: number;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  summary?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MessageLimits {
  remainingDaily: number;
  dailyLimit: number;
  remainingMonthly: number;
  monthlyLimit: number;
  isLimitReached: boolean;
}

export interface CreateScheduleRequest {
  sessionId: string;
  goal: string;
  durationDays: number;
  difficultyLevel: string;
  additionalNotes?: string;
}

export interface PreferenceUpdateRequest {
  sessionId: string;
  preferredWorkoutTime?: string;
  workoutDaysPerWeek?: number;
  additionalNotes?: string;
}

export const sendMessage = async (request: SendMessageRequest): Promise<SendMessageResponse> => {
  return httpRequest<SendMessageResponse>("/chat/send", {
    method: "POST",
    body: JSON.stringify(request),
  });
};

export const getSessions = async (): Promise<ChatSession[]> => {
  return httpRequest<ChatSession[]>("/chat/sessions", {
    method: "GET",
  });
};

export const getMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  return httpRequest<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`, {
    method: "GET",
  });
};

export const createSession = async (title?: string): Promise<ChatSession> => {
  return httpRequest<ChatSession>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
};

export const getLimits = async (): Promise<MessageLimits> => {
  return httpRequest<MessageLimits>("/chat/limits", {
    method: "GET",
  });
};

export interface CreateScheduleResponse {
  schedule: any;
  remainingMessages: number;  // Legacy
  dailyLimit: number;          // Legacy
  message: string;
  // New credit system fields
  remainingCredits?: number;
  monthlyCredits?: number;
  subscriptionTier?: string;
}

export const createScheduleFromChat = async (request: CreateScheduleRequest): Promise<CreateScheduleResponse> => {
  return httpRequest<CreateScheduleResponse>("/chat/create-schedule", {
    method: "POST",
    body: JSON.stringify(request),
  });
};

export interface UpdatePreferenceResponse {
  message: string;
  remainingMessages: number;  // Legacy
  dailyLimit: number;          // Legacy
  // New credit system fields
  remainingCredits?: number;
  monthlyCredits?: number;
  subscriptionTier?: string;
}

export const updatePreferenceFromChat = async (request: PreferenceUpdateRequest): Promise<UpdatePreferenceResponse> => {
  return httpRequest<UpdatePreferenceResponse>("/chat/update-preference", {
    method: "POST",
    body: JSON.stringify(request),
  });
};

export const getSchedules = async (): Promise<any[]> => {
  return httpRequest<any[]>("/chat/schedules", {
    method: "GET",
  });
};

export const analyzeProfile = async (): Promise<{
  goal: string;
  difficultyLevel: string;
  durationDays: number;
  reasoning: string;
}> => {
  return httpRequest<{
    goal: string;
    difficultyLevel: string;
    durationDays: number;
    reasoning: string;
  }>("/chat/analyze-profile", {
    method: "GET",
  });
};

export const invalidateCache = async (): Promise<{ message: string }> => {
  return httpRequest<{ message: string }>("/chat/invalidate-cache", {
    method: "POST",
  });
};

export const trackAiAction = async (): Promise<{ remainingMessages: number; dailyLimit: number }> => {
  return httpRequest<{ remainingMessages: number; dailyLimit: number }>("/chat/track-ai-action", {
    method: "POST",
  });
};

const chatService = {
  sendMessage,
  getSessions,
  getMessages,
  createSession,
  getLimits,
  createScheduleFromChat,
  updatePreferenceFromChat,
  getSchedules,
  analyzeProfile,
  invalidateCache,
  trackAiAction,
};

export default chatService;

