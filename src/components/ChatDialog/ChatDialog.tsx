import React, { useEffect, useRef, useState } from "react";
import chatService, { MessageLimits } from "@/services/chatService";
import { useAppSelector } from "@/store/hooks";

type ChatDialogProps = {
  open: boolean;
  onClose: () => void;
};

type Message = {
  id: string;
  role: "ai" | "user";
  text: string;
};

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onClose }) => {
  const { userId } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "ai",
      text: "Hello! I'm BrightNest Assistant, your AI health and fitness coach. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [limits, setLimits] = useState<MessageLimits | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Fetch message limits when dialog opens
  useEffect(() => {
    if (open && userId) {
      fetchLimits();
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
      console.error("Failed to fetch limits:", err);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Check if limit reached
    if (limits?.isLimitReached) {
      setError("You've reached your daily message limit. Please upgrade your subscription for more messages.");
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

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID?.() ?? String(Date.now() + 1),
          role: "ai",
          text: response.message,
        },
      ]);

      // Update limits
      setLimits((prev) => prev ? {
        ...prev,
        remainingDaily: response.remainingMessages,
        dailyLimit: response.dailyLimit,
      } : null);
    } catch (err: any) {
      console.error("Failed to send message:", err);
      
      if (err.status === 429) {
        setError("You've reached your daily message limit. Please upgrade your subscription for more messages.");
      } else {
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 dialog-overlay z-40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl w-[360px] max-w-[95%] h-[480px] shadow-xl z-50 p-4 dialog-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <img
              src="/assets/Asset 10.svg"
              alt="AI avatar"
              className="w-10 h-10 rounded-full object-contain"
            />
            <div>
              <h3 className="font-bold text-lg">BrightNest Assistant</h3>
              <div className="text-xs text-gray-500">
                {limits ? `${limits.remainingDaily}/${limits.dailyLimit} messages today` : "AI helper"}
              </div>
            </div>
          </div>

          <button aria-label="Close chat" onClick={onClose} className="text-black/60 px-2 text-2xl">
            ×
          </button>
        </header>

        <div
          ref={listRef}
          className="chat-messages h-[330px] overflow-auto bg-gray-50 rounded-md p-3 space-y-3"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "ai" ? "flex items-start gap-3" : "flex items-start gap-3 justify-end"
              }
            >
              {m.role === "ai" && (
                <img src="/assets/Asset 10.svg" alt="ai" className="w-8 h-8 rounded-full" />
              )}
              <div
                className={
                  m.role === "ai"
                    ? "bg-white p-2 rounded-md shadow-sm text-sm text-gray-800 max-w-[80%]"
                    : "bg-[#046753] text-white p-2 rounded-md text-sm max-w-[80%]"
                }
              >
                {m.text}
              </div>
              {m.role === "user" && <div className="w-8 h-8 rounded-full bg-gray-200" />}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <img src="/assets/Asset 10.svg" alt="ai" className="w-8 h-8 rounded-full" />
              <div className="bg-white p-2 rounded-md shadow-sm text-sm text-gray-800">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
              {error}
              {limits?.isLimitReached && (
                <button className="ml-2 underline font-semibold" onClick={onClose}>
                  Upgrade Subscription
                </button>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-3 flex gap-2 items-center">
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2 text-sm disabled:opacity-50"
            placeholder={isLoading ? "AI is thinking..." : "Ask me about fitness, health, or nutrition..."}
            aria-label="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || limits?.isLimitReached}
          />
          <button 
            type="submit" 
            className="bg-[#046753] text-white rounded-full px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || limits?.isLimitReached}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatDialog;
