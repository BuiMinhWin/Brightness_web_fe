import React, { useEffect, useRef, useState } from "react";

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "ai",
      text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (!open) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = { id: crypto.randomUUID?.() ?? String(Date.now()), role: "user", text };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Auto-reply mock to confirm chat works
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID?.() ?? String(Date.now() + 1),
          role: "ai",
          text: 'Đây là phản hồi tự động. Mình đã nhận: "' + text + '"',
        },
      ]);
    }, 600);
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
              <div className="text-xs text-gray-500">AI helper</div>
            </div>
          </div>

          <button aria-label="Close chat" onClick={onClose} className="text-black/60 px-2">
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
                    ? "bg-white p-2 rounded-md shadow-sm text-sm text-gray-800"
                    : "bg-[#046753] text-white p-2 rounded-md text-sm"
                }
              >
                {m.text}
              </div>
              {m.role === "user" && <div className="w-8 h-8 rounded-full bg-gray-200" />}
            </div>
          ))}

          <div className="text-sm text-gray-500">
            Placeholder chat UI — integrate chat service here.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 flex gap-2 items-center">
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2 text-sm"
            placeholder="Type a message..."
            aria-label="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="bg-[#046753] text-white rounded-full px-4 py-2 text-sm">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatDialog;
