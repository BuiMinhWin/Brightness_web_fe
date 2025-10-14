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

const chatService = {
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return httpRequest<SendMessageResponse>("/chat/send", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async getSessions(): Promise<ChatSession[]> {
    return httpRequest<ChatSession[]>("/chat/sessions", {
      method: "GET",
    });
  },

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return httpRequest<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`, {
      method: "GET",
    });
  },

  async createSession(title?: string): Promise<ChatSession> {
    return httpRequest<ChatSession>("/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  async getLimits(): Promise<MessageLimits> {
    return httpRequest<MessageLimits>("/chat/limits", {
      method: "GET",
    });
  },
};

export default chatService;

