import React, { useState } from "react";
import ChatDialog from "../ChatDialog/ChatDialog";

const ChatFAB: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#046753]/50"
        style={{
          background: "linear-gradient(135deg, #05644C 0%, #046753 100%)",
        }}
        aria-label="Open AI Chat"
      >
        <img
          src="/assets/foxHead_closedEye_tiltLeft.svg"
          alt="AI Chat"
          className="w-full h-full p-2 object-contain"
        />
      </button>

      {/* Chat Dialog */}
      <ChatDialog open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default ChatFAB;

