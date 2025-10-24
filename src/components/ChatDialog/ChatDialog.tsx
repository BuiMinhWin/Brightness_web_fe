import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import chatService, { MessageLimits } from "@/services/chatService";
import { useAppSelector } from "@/store/hooks";
import ScheduleCreationWidget from "./ScheduleCreationWidget";
import PreferenceUpdateWidget from "./PreferenceUpdateWidget";
import HealthDataUploadWidget from "./HealthDataUploadWidget";
import { Menu, CalendarMonth, Settings, Person, Upload } from "@mui/icons-material";
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
};

type WidgetType = "none" | "schedule" | "preference" | "healthUpload";

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onClose, initialMessage }) => {
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
  const [activeWidget, setActiveWidget] = useState<WidgetType>("none");
  const [pendingWidget, setPendingWidget] = useState<WidgetType | null>(null);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [detectedScheduleParams, setDetectedScheduleParams] = useState<any>({});
  const [detectedPreferenceChanges, setDetectedPreferenceChanges] = useState<any>({});
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

  // Activate pending widget once session is ready
  useEffect(() => {
    if (pendingWidget && sessionId) {
      setActiveWidget(pendingWidget);
      setPendingWidget(null);
    }
  }, [pendingWidget, sessionId]);

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

    setShowQuickMenu(false); // Close menu on send

    // Detect schedule creation intent
    const lowerText = text.toLowerCase();
    const scheduleKeywords = ['create schedule', 'make workout', 'generate plan', 'build program', 'workout schedule'];
    const hasScheduleIntent = scheduleKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasScheduleIntent) {
      const params = detectScheduleIntent(text);
      setDetectedScheduleParams(params);
      
      // Add user message to chat
      const newMsg: Message = { id: crypto.randomUUID?.() ?? String(Date.now()), role: "user", text };
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
      
      // Show loading to simulate AI thinking
      setIsLoading(true);
      
      // Ensure we have a session
      if (!sessionId) {
        const session = await chatService.createSession();
        setSessionId(session.id);
        
        // Wait a bit to simulate AI processing, then show widget
        setTimeout(() => {
          setIsLoading(false);
          setPendingWidget("schedule");
        }, 800);
      } else {
        // Wait a bit to simulate AI processing, then show widget
        setTimeout(() => {
          setIsLoading(false);
          setActiveWidget("schedule");
        }, 800);
      }
      
      return;
    }

    // Detect preference change intent
    const preferenceKeywords = ['i prefer', 'i want to workout', 'i can workout', 'change my'];
    const hasPreferenceIntent = preferenceKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasPreferenceIntent) {
      const changes = detectPreferenceChanges(text);
      if (Object.keys(changes).length > 0) {
        setDetectedPreferenceChanges(changes);
        
        // Add user message to chat
        const newMsg: Message = { id: crypto.randomUUID?.() ?? String(Date.now()), role: "user", text };
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
        
        // Show loading to simulate AI thinking
        setIsLoading(true);
        
        // Ensure we have a session
        if (!sessionId) {
          const session = await chatService.createSession();
          setSessionId(session.id);
          
          // Wait a bit to simulate AI processing, then show widget
          setTimeout(() => {
            setIsLoading(false);
            setPendingWidget("preference");
          }, 800);
        } else {
          // Wait a bit to simulate AI processing, then show widget
          setTimeout(() => {
            setIsLoading(false);
            setActiveWidget("preference");
          }, 800);
        }
        
        return;
      }
    }

    // Detect health data upload intent
    const healthUploadKeywords = ['upload health', 'lab result', 'blood test', 'health report', 'medical report', 'test results'];
    const hasHealthUploadIntent = healthUploadKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasHealthUploadIntent) {
      // Add user message to chat
      const newMsg: Message = { id: crypto.randomUUID?.() ?? String(Date.now()), role: "user", text };
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
      
      // Show loading to simulate AI thinking
      setIsLoading(true);
      
      // Wait a bit to simulate AI processing, then show widget
      setTimeout(() => {
        setIsLoading(false);
        setActiveWidget("healthUpload");
      }, 800);
      
      return;
    }

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

  // Extract intent and parameters from user message
  const detectPreferenceChanges = (message: string) => {
    const lowerMessage = message.toLowerCase();
    const changes: any = {};

    // Detect workout time
    if (lowerMessage.includes('morning')) {
      changes.preferredWorkoutTime = 'morning';
    } else if (lowerMessage.includes('afternoon')) {
      changes.preferredWorkoutTime = 'afternoon';
    } else if (lowerMessage.includes('evening') || lowerMessage.includes('night')) {
      changes.preferredWorkoutTime = 'evening';
    }

    // Detect days per week
    const daysMatch = lowerMessage.match(/(\d+)\s*(day|days|time|times)\s*(a\s*week|per\s*week|weekly)?/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      if (days >= 1 && days <= 7) {
        changes.workoutDaysPerWeek = days;
      }
    }

    return changes;
  };

  const detectScheduleIntent = (message: string) => {
    const lowerMessage = message.toLowerCase();
    const params: any = {};

    // Detect goal
    if (lowerMessage.includes('lose weight') || lowerMessage.includes('weight loss')) {
      params.goal = 'weight_loss';
    } else if (lowerMessage.includes('build muscle') || lowerMessage.includes('muscle gain') || lowerMessage.includes('get bigger')) {
      params.goal = 'muscle_gain';
    } else if (lowerMessage.includes('get stronger') || lowerMessage.includes('strength')) {
      params.goal = 'strength';
    } else if (lowerMessage.includes('endurance') || lowerMessage.includes('stamina') || lowerMessage.includes('cardio')) {
      params.goal = 'endurance';
    } else if (lowerMessage.includes('flexibility') || lowerMessage.includes('stretching') || lowerMessage.includes('yoga')) {
      params.goal = 'flexibility';
    }

    // Detect difficulty
    if (lowerMessage.includes('beginner') || lowerMessage.includes('easy') || lowerMessage.includes('new to')) {
      params.difficulty = 'beginner';
    } else if (lowerMessage.includes('advanced') || lowerMessage.includes('hard') || lowerMessage.includes('challenging')) {
      params.difficulty = 'advanced';
    } else if (lowerMessage.includes('intermediate') || lowerMessage.includes('moderate')) {
      params.difficulty = 'intermediate';
    }

    return params;
  };

  const handleQuickAction = async (action: string) => {
    setShowQuickMenu(false);
    
    // Ensure we have a session ID
    let currentSessionId = sessionId;
    const needsNewSession = !currentSessionId;
    
    if (needsNewSession) {
      const session = await chatService.createSession();
      currentSessionId = session.id;
      setSessionId(currentSessionId);
    }

    if (action === "schedule") {
      setDetectedScheduleParams({}); // Reset params for fresh analysis
      if (needsNewSession) {
        setPendingWidget("schedule");
      } else {
        setActiveWidget("schedule");
      }
    } else if (action === "preferences") {
      setDetectedPreferenceChanges({});
      if (needsNewSession) {
        setPendingWidget("preference");
      } else {
        setActiveWidget("preference");
      }
    } else if (action === "healthUpload") {
      if (needsNewSession) {
        setPendingWidget("healthUpload");
      } else {
        setActiveWidget("healthUpload");
      }
    } else if (action === "mystats") {
      // Add user message immediately
      const newMsg: Message = {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        role: "user",
        text: "What do you know about me?"
      };
      setMessages((prev) => [...prev, newMsg]);
      
      // Send to AI
      setIsLoading(true);
      try {
        const response = await chatService.sendMessage({
          sessionId: currentSessionId,
          message: "What do you know about me?",
        });
        
        if (!sessionId) setSessionId(response.sessionId);
        
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID?.() ?? String(Date.now() + 1),
            role: "ai",
            text: response.message,
          },
        ]);
        
        setLimits((prev) => prev ? {
          ...prev,
          remainingDaily: response.remainingMessages,
          dailyLimit: response.dailyLimit,
        } : null);
      } catch (err) {
        console.error("Failed to get profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleScheduleCreated = (schedule: any, remainingMessages: number, dailyLimit: number) => {
    console.log('📅 handleScheduleCreated called with:', {
      schedule,
      remainingMessages,
      dailyLimit,
      scheduleType: typeof schedule,
      scheduleKeys: schedule ? Object.keys(schedule) : 'null'
    });
    
    // Log each property individually
    console.log('🔍 Schedule properties:', {
      durationDays: schedule?.durationDays,
      totalDays: schedule?.totalDays, 
      duration: schedule?.duration,
      difficultyLevel: schedule?.difficultyLevel,
      difficulty: schedule?.difficulty,
      goal: schedule?.goal,
      fitnessGoal: schedule?.fitnessGoal,
      fullObject: JSON.stringify(schedule, null, 2)
    });
    
    setActiveWidget("none");
    setDetectedScheduleParams({});
    
    // Update limits after creating schedule
    setLimits((prev) => prev ? {
      ...prev,
      remainingDaily: remainingMessages,
      dailyLimit: dailyLimit,
    } : null);
    
    // Extract schedule details (handle different response structures)
    const durationDays = schedule?.durationDays || schedule?.totalDays || schedule?.duration || 'unknown';
    const difficultyLevel = schedule?.difficultyLevel || schedule?.difficulty || 'unknown';
    const goal = schedule?.goal || schedule?.fitnessGoal || 'unknown';
    
    console.log('📊 Extracted values:', { durationDays, difficultyLevel, goal });
    
    // Add success message with clickable link
    const successMessage = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      role: "ai" as const,
      text: `Your workout schedule has been created successfully! 🎉

**Schedule Details:**
- **Duration:** ${durationDays} days
- **Difficulty:** ${difficultyLevel}
- **Goal:** ${goal}
- **Credits Remaining:** ${remainingMessages}/${dailyLimit}

[Click here to view your schedule](/schedule) or navigate to the Schedule section of your dashboard.`,
    };
    
    setMessages((prev) => [...prev, successMessage]);
    console.log('✅ Success message added to chat');
    
    // Show toast notification
    setError(null);
    setTimeout(() => {
      setToast({
        open: true,
        message: 'Schedule created successfully! Visit the Schedule page to view it.',
        severity: 'success'
      });
    }, 500);
  };

  const handlePreferenceUpdated = (remainingMessages: number, dailyLimit: number) => {
    setActiveWidget("none");
    setDetectedPreferenceChanges({});
    
    // Update credit display
    setLimits((prev) => prev ? {
      ...prev,
      remainingDaily: remainingMessages,
      dailyLimit: dailyLimit,
    } : null);
    
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        role: "ai",
        text: `Your preferences have been updated successfully! This will help me give you better recommendations.`,
      },
    ]);
  };

  const handleHealthDataSaved = (data: any) => {
    setActiveWidget("none");
    
    // Format the health metrics for display
    const healthMetrics = data.healthMetrics || {};
    const dataEntries = Object.entries(healthMetrics)
      .filter(([_, value]) => value !== undefined && value !== null)
      .slice(0, 8) // Show top 8 metrics
      .map(([key, value]) => 
        `- **${key.replace(/([A-Z])/g, ' $1').trim()}:** ${value}`
      ).join('\n');
    
    const successMessage = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      role: "ai" as const,
      text: `Your health data has been processed and saved successfully! 🎉

**Key Health Metrics Extracted:**
${dataEntries || 'All data processed'}

I'll use this information to provide you with personalized workout plans, nutrition advice, and safety guidelines. You can always update this data by uploading a new report.`,
    };
    
    setMessages((prev) => [...prev, successMessage]);
    
    // Show toast notification
    setError(null);
    setTimeout(() => {
      setToast({
        open: true,
        message: 'Health data saved successfully!',
        severity: 'success'
      });
    }, 500);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleSend();
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        style={{ zIndex: 1 }}
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl w-[700px] max-w-[95%] h-[750px] shadow-xl p-6 flex flex-col"
        style={{ zIndex: 2 }}
      >
        <header className="flex items-center justify-between mb-4 flex-shrink-0">
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
          className="chat-messages flex-1 overflow-auto bg-gray-50 rounded-md p-4 space-y-4"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "ai" ? "flex items-start gap-3" : "flex items-start gap-3 justify-end"
              }
            >
              {m.role === "ai" && (
                <img src="/assets/Asset 10.svg" alt="ai" className="w-8 h-8 rounded-full flex-shrink-0" />
              )}
              <div
                className={
                  m.role === "ai"
                    ? "bg-white p-3 rounded-lg shadow-sm text-sm text-gray-800 max-w-[75%] prose prose-sm"
                    : "bg-[#046753] text-white p-3 rounded-lg text-sm max-w-[75%]"
                }
              >
                {m.role === "ai" ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="ml-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                      code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                ) : (
                  m.text
                )}
              </div>
              {m.role === "user" && <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />}
            </div>
          ))}

          {/* Active Widgets */}
          {activeWidget === "schedule" && sessionId && (
            <ScheduleCreationWidget
              sessionId={sessionId}
              onScheduleCreated={handleScheduleCreated}
              onCancel={() => {
                setActiveWidget("none");
                setDetectedScheduleParams({});
              }}
              suggestedGoal={detectedScheduleParams.goal}
              suggestedDifficulty={detectedScheduleParams.difficulty}
            />
          )}

          {activeWidget === "preference" && sessionId && (
            <PreferenceUpdateWidget
              userId={userId}
              sessionId={sessionId}
              detectedChanges={detectedPreferenceChanges}
              onPreferenceUpdated={handlePreferenceUpdated}
              onCancel={() => {
                setActiveWidget("none");
                setDetectedPreferenceChanges({});
              }}
            />
          )}

          {activeWidget === "healthUpload" && (
            <HealthDataUploadWidget
              userId={userId}
              onDataSaved={handleHealthDataSaved}
              onCancel={() => {
                setActiveWidget("none");
              }}
            />
          )}

          {isLoading && (
            <div className="flex items-start gap-3">
              <img src="/assets/Asset 10.svg" alt="ai" className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="bg-white p-3 rounded-lg shadow-sm text-sm text-gray-800">
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
                <a 
                  href="/pricing" 
                  className="ml-2 underline font-semibold hover:text-red-900"
                  onClick={onClose}
                >
                  Upgrade Subscription
                </a>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex-shrink-0 relative">
          {/* Quick Menu */}
          {showQuickMenu && (
            <div className="absolute bottom-full mb-2 left-0 bg-white border-2 rounded-2xl p-2 shadow-xl z-[1000]" style={{ borderColor: '#c8ead6' }}>
              <div className="text-xs font-semibold mb-2 px-3" style={{ color: '#0a6a56' }}>Quick Actions</div>
              <div className="space-y-1">
                <button
                  onClick={() => handleQuickAction("schedule")}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  <CalendarMonth style={{ color: '#0a6a56', fontSize: 18 }} />
                  <span style={{ color: '#0b3d33' }}>Create Workout Schedule</span>
                </button>
                <button
                  onClick={() => handleQuickAction("preferences")}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  <Settings style={{ color: '#0a6a56', fontSize: 18 }} />
                  <span style={{ color: '#0b3d33' }}>Update Preferences</span>
                </button>
                <button
                  onClick={() => handleQuickAction("healthUpload")}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  <Upload style={{ color: '#0a6a56', fontSize: 18 }} />
                  <span style={{ color: '#0b3d33' }}>Upload Health Data</span>
                </button>
                <button
                  onClick={() => handleQuickAction("mystats")}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  <Person style={{ color: '#0a6a56', fontSize: 18 }} />
                  <span style={{ color: '#0b3d33' }}>Show My Profile</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 items-center relative" style={{ zIndex: 999 }}>
            <button
              type="button"
              onClick={() => !(isLoading || activeWidget !== "none") && setShowQuickMenu(!showQuickMenu)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all border-2"
              style={{ 
                borderColor: '#c8ead6',
                opacity: (isLoading || activeWidget !== "none") ? 0.6 : 1,
                cursor: (isLoading || activeWidget !== "none") ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoading || activeWidget !== "none"}
            >
              <Menu style={{ color: '#0a6a56', fontSize: 20 }} />
            </button>
            <input
              type="text"
              className="flex-1 border-2 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ 
                borderColor: '#c8ead6',
                opacity: (isLoading || activeWidget !== "none") ? 0.6 : 1
              }}
              placeholder="Ask me about fitness, health, or nutrition..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !(isLoading || activeWidget !== "none")) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading || activeWidget !== "none"}
            />
            <button 
              type="button" 
              className="text-white rounded-full px-6 py-3 text-sm font-semibold hover:opacity-90 transition-all"
              style={{ 
                background: '#0a6a56', 
                opacity: (isLoading || activeWidget !== "none") ? 0.6 : 1,
                cursor: (isLoading || activeWidget !== "none") ? 'not-allowed' : 'pointer'
              }}
              onClick={handleSend}
              disabled={isLoading || activeWidget !== "none"}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ChatDialog;
