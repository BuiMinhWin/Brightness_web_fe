import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import chatService, { MessageLimits } from "@/services/chatService";
import { personalCoachService, AICreditBalance } from "@/services/personalCoachService";
import { useAppSelector } from "@/store/hooks";
import { Snackbar, Alert } from "@mui/material";

type ChatDialogProps = {
  open: boolean;
  onClose: () => void;
  initialMessage?: string;
};

type Message = {
  id: string;
  role: "ai" | "user";
  text: string;
  requiresConfirmation?: boolean;
  pendingActionType?: string;
  pendingActionParams?: { [key: string]: string };
  actionResult?: {
    success: boolean;
    data?: any;
  };
};

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onClose, initialMessage }) => {
  const { userId } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "ai",
      text: "Hello! I'm BrightNest Assistant, your AI health and fitness coach. I can help you:\n\n" +
            "🏋️ **Create & manage workout schedules**\n" +
            "📊 **View your progress and stats**\n" +
            "⚙️ **Update your preferences**\n" +
            "💪 **Get personalized recommendations**\n" +
            "📈 **Analyze your fitness journey**\n\n" +
            "Just tell me what you'd like to do!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [limits, setLimits] = useState<MessageLimits | null>(null);
  const [creditBalance, setCreditBalance] = useState<AICreditBalance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const listRef = useRef<HTMLDivElement | null>(null);

  // Set initial message when dialog opens
  useEffect(() => {
    if (open && initialMessage) {
      setInput(initialMessage);
    }
  }, [open, initialMessage]);

  // Fetch message limits and credit balance when dialog opens
  useEffect(() => {
    if (open && userId) {
      fetchLimits();
      fetchCreditBalance();
    }
  }, [open, userId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (!open) return null;

  const fetchLimits = async () => {
    try {
      const limitsData = await chatService.getLimits();
      setLimits(limitsData);
    } catch (err) {
      console.log("Could not fetch message limits, continuing without them");
    }
  };

  const fetchCreditBalance = async () => {
    if (!userId) return;
    try {
      const balance = await personalCoachService.getAICreditBalance(userId);
      setCreditBalance(balance);
    } catch (err) {
      console.log("Could not fetch credit balance, continuing without it");
    }
  };

  const handleSend = async (text = input) => {
    if (!text || isLoading) return;

    // Check if limit reached
    if (limits?.isLimitReached) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID?.() ?? String(Date.now()),
          role: "ai",
          text: "⚠️ **Daily Message Limit Reached**\n\nYou've reached your daily AI message limit. Please upgrade your subscription for more messages or wait until tomorrow when your limit resets.\n\n[View Subscription Plans →](/pricing)",
        },
      ]);
      return;
    }

    const newMsg: Message = { id: crypto.randomUUID?.() ?? String(Date.now()), role: "user", text };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage({
        sessionId,
        message: text,
      });

      // Update session ID if new
      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      // Add AI response with confirmation/action data
      const aiMsg: Message = {
        id: crypto.randomUUID?.() ?? String(Date.now() + 1),
        role: "ai",
        text: response.message,
        requiresConfirmation: response.requiresConfirmation,
        pendingActionType: response.pendingActionType,
        pendingActionParams: response.pendingActionParams,
        actionResult: response.actionResult,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Update limits
      setLimits((prev) => prev ? {
        ...prev,
        remainingDaily: response.remainingMessages,
        dailyLimit: response.dailyLimit,
      } : null);
      
      // Update credit balance from response if available
      if (response.remainingCredits !== undefined) {
        setCreditBalance((prev) => prev ? {
          ...prev,
          remainingCredits: response.remainingCredits!,
          monthlyCredits: response.monthlyCredits ?? prev.monthlyCredits,
          subscriptionTier: (response.subscriptionTier as "free" | "basic" | "premium") ?? prev.subscriptionTier,
        } : null);
      }
    } catch (err: any) {
      console.error("Failed to send message:", err);
      
      let errorMessage = '';
      
      if (err.status === 429) {
        errorMessage = '⚠️ **Daily message limit reached.**\n\nYou\'ve reached your daily AI message limit. Please upgrade your subscription for more messages or wait until tomorrow.\n\n[View Plans →](/pricing)';
      } else if (err.status === 402) {
        const backendMsg = err.details?.message || '';
        const daysUntilReset = backendMsg.match(/Resets in (\d+) days/)?.[1] || backendMsg.match(/in (\d+) days/)?.[1];
        
        errorMessage = '💳 **Insufficient AI Credits**\n\nYou\'ve run out of AI credits for this month.';
        
        if (daysUntilReset) {
          errorMessage += ` Credits will reset in **${daysUntilReset} days**.`;
        }
        
        errorMessage += '\n\n[Upgrade for More Credits →](/pricing)';
      } else {
        errorMessage = '❌ Failed to send message. Please try again.';
      }
      
      // Show error as AI message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID?.() ?? String(Date.now()),
          role: "ai",
          text: errorMessage,
        },
      ]);
      
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    // Send "yes" to confirm the pending action
    await handleSend("yes");
  };

  const handleCancel = async () => {
    // Send "no" to cancel the pending action
    await handleSend("no");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold">BrightNest AI Assistant</h2>
            <div className="text-xs text-white/90 mt-1">
              {creditBalance 
                ? `${creditBalance.remainingCredits}/${creditBalance.monthlyCredits} AI credits • ${creditBalance.subscriptionTier}`
                : limits 
                ? `${limits.remainingDaily}/${limits.dailyLimit} messages today` 
                : "AI-powered fitness coach"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                    : "bg-white shadow-md text-gray-800"
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} className="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer" />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong {...props} className="font-bold" />
                      ),
                      p: ({ node, ...props }) => (
                        <p {...props} className="mb-2 last:mb-0" />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc list-inside mb-2" />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol {...props} className="list-decimal list-inside mb-2" />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {/* Inline Confirmation Buttons */}
                {msg.requiresConfirmation && msg.role === "ai" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={handleConfirm}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✓ Confirm
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✗ Cancel
                    </button>
                  </div>
                )}

                {/* Action Result Indicator */}
                {msg.actionResult && msg.role === "ai" && (
                  <div className={`mt-2 text-xs ${msg.actionResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {msg.actionResult.success ? '✓ Action completed' : '✗ Action failed'}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything about fitness, nutrition, or your progress..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          <div className="mt-2 text-xs text-gray-500 text-center">
            Try: "Show my schedules" • "Create a workout plan" • "Update my preferences" • "How am I progressing?"
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast(prev => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ChatDialog;

