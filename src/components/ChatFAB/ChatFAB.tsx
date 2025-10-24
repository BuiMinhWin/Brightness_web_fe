import React, { useState, useEffect, useRef } from "react";
import ChatDialog from "../ChatDialog/ChatDialog";
import { FitnessCenter, Chat, EmojiEvents, Favorite, TrendingUp } from "@mui/icons-material";
import { gsap } from "gsap";

interface ChatFABProps {
  initialMessage?: string;
  openChat?: boolean;
  onChatOpenChange?: (open: boolean) => void;
}

const BUBBLE_MESSAGES = [
  { text: "Need fitness advice?", icon: FitnessCenter },
  { text: "Ask me anything!", icon: Chat },
  { text: "Ready to help!", icon: Favorite },
  { text: "Your health coach here!", icon: EmojiEvents },
  { text: "Let's get fit together!", icon: TrendingUp },
];

const ChatFAB: React.FC<ChatFABProps> = ({ initialMessage, openChat, onChatOpenChange }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<{ text: string; icon: any }>({ text: "", icon: null });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Sync with external control if provided
  useEffect(() => {
    if (openChat !== undefined) {
      setChatOpen(openChat);
    }
  }, [openChat]);

  // Periodic text bubble animation
  useEffect(() => {
    if (chatOpen) {
      setShowBubble(false);
      return;
    }

    // Show bubble after initial delay
    const initialDelay = setTimeout(() => {
      showRandomBubble();
    }, 5000); // Show first bubble after 5 seconds

    // Then show bubbles periodically
    const interval = setInterval(() => {
      showRandomBubble();
    }, 25000); // Show bubble every 25 seconds

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [chatOpen]);

  const showRandomBubble = () => {
    const randomMessage = BUBBLE_MESSAGES[Math.floor(Math.random() * BUBBLE_MESSAGES.length)];
    setCurrentMessage(randomMessage);
    setShowBubble(true);
  };

  // Animate bubble when it appears
  useEffect(() => {
    if (showBubble && bubbleRef.current) {
      // GSAP animation for bubble appearance
      gsap.fromTo(
        bubbleRef.current,
        {
          x: 30,
          opacity: 0,
          scale: 0.8,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        }
      );

      // GSAP animation for FAB wiggle - make it more noticeable
      if (fabRef.current) {
        // Create a timeline for more complex animation
        const tl = gsap.timeline();
        
        // Wiggle animation
        tl.to(fabRef.current, {
          rotation: 15,
          duration: 0.15,
          yoyo: true,
          repeat: 11, // 6 full wiggles (back and forth = 2 animations per wiggle)
          ease: "power2.inOut",
          transformOrigin: "center center",
        });
        
        // Bounce animation overlapping with wiggle
        tl.to(fabRef.current, {
          y: -8,
          duration: 0.3,
          yoyo: true,
          repeat: 5,
          ease: "power1.inOut",
        }, 0); // Start at the same time as wiggle
      }

      // Hide bubble after 5 seconds with fade out
      const hideTimeout = setTimeout(() => {
        if (bubbleRef.current) {
          gsap.to(bubbleRef.current, {
            opacity: 0,
            scale: 0.9,
            x: 20,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              setShowBubble(false);
            },
          });
        }
      }, 5000);

      return () => clearTimeout(hideTimeout);
    }
  }, [showBubble]);

  const handleOpenChange = (open: boolean) => {
    setChatOpen(open);
    onChatOpenChange?.(open);
    if (open) {
      setShowBubble(false);
    }
  };

  return (
    <>
      {/* Text Bubble */}
      {showBubble && !chatOpen && (
        <div
          ref={bubbleRef}
          className="fixed bottom-32 right-16 z-40 bg-white rounded-2xl shadow-xl px-4 py-3 max-w-[220px]"
          style={{ opacity: 0, transform: 'translateX(30px) scale(0.8)' }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[#046753]">
            {currentMessage.icon && (
              <currentMessage.icon 
                style={{ 
                  fontSize: 20, 
                  color: '#046753' 
                }} 
              />
            )}
            <span>{currentMessage.text}</span>
          </div>
          {/* Speech bubble pointer */}
          <div
            className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45"
            style={{
              boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        ref={fabRef}
        onClick={() => handleOpenChange(true)}
        className="fixed bottom-8 right-8 z-40 w-20 h-20 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#046753]/50"
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
      <ChatDialog 
        open={chatOpen} 
        onClose={() => handleOpenChange(false)} 
        initialMessage={initialMessage}
      />
    </>
  );
};

export default ChatFAB;

