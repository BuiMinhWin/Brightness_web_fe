import { httpRequest } from "./httpClientRedux";

export interface SendMessageRequest {
  sessionId?: string;
  message: string;
}

export interface SendMessageResponse {
  sessionId: string;
  message: string;
  role: string;
  remainingMessages: number;
  dailyLimit: number;
  createdAt: string;
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

export const createScheduleFromChat = async (request: CreateScheduleRequest): Promise<any> => {
  return httpRequest<any>("/chat/create-schedule", {
    method: "POST",
    body: JSON.stringify(request),
  });
};

export const updatePreferenceFromChat = async (request: PreferenceUpdateRequest): Promise<{ message: string }> => {
  return httpRequest<{ message: string }>("/chat/update-preference", {
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
};

export default chatService;

