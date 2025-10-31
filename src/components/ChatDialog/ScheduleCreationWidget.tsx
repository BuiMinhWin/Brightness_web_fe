import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import chatService from '../../services/chatService';
import { eventBus } from '../../services/eventBus';
import { personalCoachService } from '../../services/personalCoachService';
import { useToast } from '../../hooks/useToast';
import { useAppSelector } from '../../store/hooks';
import { 
  LocalFireDepartment, 
  FitnessCenter, 
  SportsMartialArts, 
  DirectionsRun, 
  SelfImprovement,
  CalendarMonth,
  TrendingUp,
  AutoAwesome,
  Close,
  CheckCircle,
  Warning
} from '@mui/icons-material';

interface ScheduleCreationWidgetProps {
  sessionId: string;
  onScheduleCreated: (schedule: any, remainingMessages: number, dailyLimit: number, creditInfo?: { remainingCredits?: number; monthlyCredits?: number; subscriptionTier?: string }) => void;
  onCancel: () => void;
  onError?: (errorMessage: string) => void;
  suggestedGoal?: string;
  suggestedDifficulty?: string;
}

const GOAL_INFO = {
  weight_loss: {
    icon: <LocalFireDepartment />,
    title: 'Weight Loss',
    description: 'Burn calories and shed pounds with cardio and HIIT',
    color: '#ef4444',
  },
  muscle_gain: {
    icon: <FitnessCenter />,
    title: 'Muscle Gain',
    description: 'Build muscle mass with strength training',
    color: '#0a6a56',
  },
  strength: {
    icon: <SportsMartialArts />,
    title: 'Strength Training',
    description: 'Increase overall strength and power',
    color: '#8b5cf6',
  },
  endurance: {
    icon: <DirectionsRun />,
    title: 'Endurance',
    description: 'Improve stamina and cardiovascular fitness',
    color: '#3b82f6',
  },
  flexibility: {
    icon: <SelfImprovement />,
    title: 'Flexibility',
    description: 'Enhance mobility and prevent injuries',
    color: '#10b981',
  },
};

const ScheduleCreationWidget: React.FC<ScheduleCreationWidgetProps> = ({
  sessionId,
  onScheduleCreated,
  onCancel,
  onError,
  suggestedGoal,
  suggestedDifficulty,
}) => {
  const [goal, setGoal] = useState(suggestedGoal || 'weight_loss');
  const [durationDays, setDurationDays] = useState(30);
  const [difficultyLevel, setDifficultyLevel] = useState(suggestedDifficulty || 'intermediate');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showLottie, setShowLottie] = useState(false);
  const [creditBalance, setCreditBalance] = useState<{
    remainingCredits: number;
    monthlyCredits: number;
    canAffordOperation: boolean;
  } | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [existingScheduleInfo, setExistingScheduleInfo] = useState<{
    hasSchedule: boolean;
    hasCompletedDays: boolean;
    completedCount: number;
    totalDays: number;
  } | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const userId = useAppSelector((state) => state.auth.userId);

  // Animate icon transition when isCreating changes
  useEffect(() => {
    if (isCreating && iconRef.current) {
      // Shrink the original icon
      gsap.to(iconRef.current, {
        scale: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setShowLottie(true);
          // Scale in the Lottie animation
          if (iconRef.current) {
            gsap.fromTo(
              iconRef.current,
              { scale: 0 },
              { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
            );
          }
        },
      });
    } else if (!isCreating && showLottie) {
      // Reset when creation completes
      gsap.to(iconRef.current, {
        scale: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setShowLottie(false);
          // Scale in the original icon
          if (iconRef.current) {
            gsap.fromTo(
              iconRef.current,
              { scale: 0 },
              { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
            );
          }
        },
      });
    }
  }, [isCreating, showLottie]);

  const currentGoalInfo = GOAL_INFO[goal as keyof typeof GOAL_INFO];

  // Auto-analyze user profile and set intelligent defaults
  React.useEffect(() => {
    const fetchProfileAnalysis = async () => {
      setIsAnalyzing(true);
      
      try {
        // Call backend to analyze user profile
        const analysis = await chatService.analyzeProfile();
        
        // Set AI-recommended values
        setGoal(suggestedGoal || analysis.goal);
        setDifficultyLevel(suggestedDifficulty || analysis.difficultyLevel);
        setDurationDays(analysis.durationDays);
        
        setIsAnalyzing(false);
      } catch (err) {
        console.log('Could not auto-analyze profile, using defaults');
        
        // Fallback to defaults if analysis fails
        setGoal(suggestedGoal || 'weight_loss');
        setDifficultyLevel(suggestedDifficulty || 'intermediate');
        setDurationDays(30);
        setIsAnalyzing(false);
      }
    };

    fetchProfileAnalysis();
  }, [suggestedGoal, suggestedDifficulty]);

  // Fetch credit balance on mount
  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (!userId) return;
      
      try {
        const balance = await personalCoachService.getAICreditBalance(userId);
        setCreditBalance(balance);
      } catch (error) {
        console.error('Failed to fetch credit balance:', error);
      }
    };
    fetchCreditBalance();
  }, [userId]);

  // Check if user has existing schedule with completed days
  const checkExistingSchedule = async (): Promise<boolean> => {
    if (!userId) return true; // Allow if no userId (shouldn't happen)
    
    try {
      const schedules = await personalCoachService.getUserSchedules(userId);
      const activeSchedule = schedules.find(s => s.isLatest);
      
      if (!activeSchedule) {
        return true; // No active schedule, safe to proceed
      }
      
      // Check for completed days
      const completedDays = activeSchedule.days.filter(day => 
        day.exercises?.some(ex => ex.completed === true)
      );
      
      if (completedDays.length > 0) {
        // Has completed days, show warning
        setExistingScheduleInfo({
          hasSchedule: true,
          hasCompletedDays: true,
          completedCount: completedDays.length,
          totalDays: activeSchedule.days.length,
        });
        setShowWarningDialog(true);
        return false; // Block creation until user confirms
      }
      
      // Has schedule but no completed days, can proceed
      return true;
      
    } catch (error) {
      console.error('Failed to check existing schedule:', error);
      return true; // On error, allow proceeding
    }
  };

  const handleCreateSchedule = async (skipWarning: boolean = false) => {
    // Check credit balance before proceeding
    if (!creditBalance?.canAffordOperation) {
      showToast(
        `Insufficient AI credits. You have ${creditBalance?.remainingCredits ?? 0} of ${creditBalance?.monthlyCredits ?? 0} credits remaining.`,
        "warning"
      );
      return;
    }

    // Check for existing schedule with completed days (unless user already confirmed)
    if (!skipWarning) {
      const canProceed = await checkExistingSchedule();
      if (!canProceed) {
        return; // Warning dialog will be shown
      }
    }

    try {
      setIsCreating(true);
      setError(null);

      console.log('🚀 Creating schedule with params:', {
        sessionId,
        goal,
        durationDays,
        difficultyLevel,
        additionalNotes
      });

      const response = await chatService.createScheduleFromChat({
        sessionId,
        goal,
        durationDays,
        difficultyLevel,
        additionalNotes,
      });

      // Update credit balance after successful creation
      if (userId) {
        const newBalance = await personalCoachService.getAICreditBalance(userId);
        setCreditBalance(newBalance);
      }

      console.log('✅ Schedule created successfully:', response);
      console.log('📦 Response structure:', {
        hasSchedule: !!response.schedule,
        schedule: response.schedule,
        credits: `${response.remainingMessages}/${response.dailyLimit}`,
        remainingCredits: response.remainingCredits,
        monthlyCredits: response.monthlyCredits
      });
      
      // Emit events to sync other components (Schedule page, etc.)
      eventBus.emit('schedule-updated', { 
        scheduleId: response.schedule?.id, 
        service: 'schedule' 
      });
      eventBus.emit('credits-updated', { 
        service: 'schedule',
        creditsRemaining: response.remainingCredits 
      });
      
      onScheduleCreated(
        response.schedule, 
        response.remainingMessages, 
        response.dailyLimit,
        {
          remainingCredits: response.remainingCredits,
          monthlyCredits: response.monthlyCredits,
          subscriptionTier: response.subscriptionTier
        }
      );
    } catch (err: any) {
      console.error('Failed to create schedule:', err);
      
      // Show appropriate toast notification based on error type
      if (err.status === 429) {
        showToast("You've reached your daily AI usage limit. Please upgrade your subscription or wait until tomorrow.", "error");
      } else if (err.status === 402 || err.message?.includes('Insufficient')) {
        showToast("Insufficient AI credits. Please upgrade your plan to generate more schedules.", "warning");
      } else if (err.status === 500) {
        const backendMessage = err.details?.message || err.details?.error;
        showToast(backendMessage || "An unexpected error occurred while creating your schedule. Please try again.", "error");
      } else {
        showToast(err.message || "Failed to create schedule. Please try again.", "error");
      }
      
      // Pass error to parent if handler exists
      if (onError) {
        onError(err.message || "Failed to create schedule");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const getDurationLabel = (days: number) => {
    if (days === 7) return '1 week';
    if (days === 14) return '2 weeks';
    if (days === 21) return '3 weeks';
    if (days === 28) return '4 weeks';
    return `${days} days`;
  };

  // If still analyzing, show loading state
  if (isAnalyzing) {
    return (
      <div className="bg-white border-2 rounded-2xl p-6 mb-4 shadow-lg" style={{ borderColor: '#c8ead6' }}>
        <div className="flex items-center gap-3 mb-4">
          <AutoAwesome className="animate-spin" style={{ color: '#0a6a56', fontSize: 32 }} />
          <h3 className="text-xl font-bold" style={{ color: '#0a6a56' }}>Analyzing Your Profile</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: '#0a6a56' }}></div>
            <p className="text-sm" style={{ color: '#0b3d33', opacity: 0.8 }}>
              Reading your fitness goals and current level...
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: '#0a6a56' }}></div>
            <p className="text-sm" style={{ color: '#0b3d33', opacity: 0.8 }}>
              Checking your available workout days and equipment...
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: '#0a6a56' }}></div>
            <p className="text-sm" style={{ color: '#0b3d33', opacity: 0.8 }}>
              Calculating optimal program duration and difficulty...
            </p>
          </div>
        </div>

        <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-3">
          <p className="text-xs" style={{ color: '#0a6a56' }}>
            AI is personalizing your workout plan based on your profile data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 rounded-2xl p-5 mb-4 shadow-lg" style={{ borderColor: '#c8ead6' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CalendarMonth style={{ color: '#0a6a56', fontSize: 32 }} />
          <h3 className="text-xl font-bold" style={{ color: '#0a6a56' }}>
            {showCustomize ? 'Customize Your Plan' : 'AI-Generated Plan Ready'}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
        >
          <Close style={{ color: '#0a6a56', fontSize: 20 }} />
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-xl mb-3 text-sm flex items-center gap-2">
          <Close style={{ fontSize: 18 }} />
          {error}
        </div>
      )}

      {!showCustomize ? (
        // AI Recommendation View
        <div className="space-y-4">
          {/* Credit Balance Warning */}
          {creditBalance && !creditBalance.canAffordOperation && (
            <div 
              className="p-4 rounded-xl border-2"
              style={{ 
                background: "#fee2e2",
                borderColor: "#fecaca"
              }}
            >
              <div className="flex items-start gap-3">
                <Warning style={{ color: "#991b1b", fontSize: 24 }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#991b1b" }}>
                    Insufficient AI Credits
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                    You have {creditBalance.remainingCredits?.toLocaleString() ?? 0} of {creditBalance.monthlyCredits?.toLocaleString() ?? 0} credits remaining.
                    This operation requires approximately 7,500 credits.
                  </p>
                  <p className="text-xs mt-2 font-medium" style={{ color: "#991b1b" }}>
                    Please upgrade your plan or wait for your monthly reset to generate a new schedule.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AutoAwesome style={{ color: '#10b981', fontSize: 24 }} />
              <span className="font-semibold" style={{ color: '#0a6a56' }}>
                AI Recommendation Based on Your Profile
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <div className="text-xs mb-1" style={{ color: '#0b3d33', opacity: 0.6 }}>Goal</div>
                <div className="flex items-center justify-center gap-1">
                  <div style={{ color: currentGoalInfo.color }}>
                    {React.cloneElement(currentGoalInfo.icon, { style: { fontSize: 20 } })}
                  </div>
                  <span className="font-bold text-sm" style={{ color: '#0a6a56' }}>
                    {currentGoalInfo.title}
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs mb-1" style={{ color: '#0b3d33', opacity: 0.6 }}>Duration</div>
                <span className="font-bold text-sm" style={{ color: '#0a6a56' }}>
                  {getDurationLabel(durationDays)}
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-xs mb-1" style={{ color: '#0b3d33', opacity: 0.6 }}>Level</div>
                <span className="font-bold text-sm capitalize" style={{ color: '#0a6a56' }}>
                  {difficultyLevel}
                </span>
              </div>
            </div>

            <p className="text-xs" style={{ color: '#0b3d33', opacity: 0.7 }}>
              This plan is optimized for your fitness level, available time, and equipment access.
            </p>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#0a6a56' }}>
              Any Special Requests? <span style={{ color: '#0b3d33', opacity: 0.6, fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              maxLength={500}
              placeholder="e.g., Focus on upper body, avoid jumping exercises, include yoga..."
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none transition-all text-sm"
              style={{ borderColor: '#c8ead6' }}
              rows={3}
            />
            <div className="text-xs mt-1 text-right" style={{ color: '#0b3d33', opacity: 0.6 }}>
              {additionalNotes.length}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCustomize(true)}
              className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              style={{ borderColor: '#c8ead6', color: '#0a6a56' }}
            >
              <TrendingUp fontSize="small" />
              Customize
            </button>
            <button
              onClick={() => handleCreateSchedule()}
              disabled={isCreating || !creditBalance?.canAffordOperation}
              className="flex-[2] px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: '#0a6a56' }}
              title={!creditBalance?.canAffordOperation ? "Insufficient AI credits" : ""}
            >
              {isCreating ? (
                <>
                  <AutoAwesome className="animate-spin" fontSize="small" />
                  Generating...
                </>
              ) : (
                <>
                  <AutoAwesome fontSize="small" />
                  Generate My Plan
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // Customization View
        <div className="space-y-4">
        {/* Credit Balance Warning */}
        {creditBalance && !creditBalance.canAffordOperation && (
          <div 
            className="p-4 rounded-xl border-2"
            style={{ 
              background: "#fee2e2",
              borderColor: "#fecaca"
            }}
          >
            <div className="flex items-start gap-3">
              <Warning style={{ color: "#991b1b", fontSize: 24 }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: "#991b1b" }}>
                  Insufficient AI Credits
                </p>
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                  You have {creditBalance.remainingCredits?.toLocaleString() ?? 0} of {creditBalance.monthlyCredits?.toLocaleString() ?? 0} credits remaining.
                  This operation requires approximately 7,500 credits.
                </p>
                <p className="text-xs mt-2 font-medium" style={{ color: "#991b1b" }}>
                  💡 Please upgrade your plan or wait for your monthly reset to generate a new schedule.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Goal Selection with Visual Cards */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: '#0a6a56' }}>
            Select Your Fitness Goal
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(GOAL_INFO).map(([key, info]) => (
              <button
                key={key}
                type="button"
                onClick={() => setGoal(key)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  goal === key ? 'shadow-md' : 'hover:shadow-sm'
                }`}
                style={{
                  borderColor: goal === key ? info.color : '#c8ead6',
                  background: goal === key ? `${info.color}15` : 'white',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div style={{ color: info.color, fontSize: 24 }}>
                    {React.cloneElement(info.icon, { style: { fontSize: 24 } })}
                  </div>
                  <span className="font-semibold text-sm" style={{ color: '#0b3d33' }}>{info.title}</span>
                </div>
                <p className="text-xs" style={{ color: '#0b3d33', opacity: 0.7 }}>{info.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Goal Info */}
        {currentGoalInfo && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle style={{ color: '#10b981', fontSize: 20 }} />
              <div>
                <span className="font-semibold" style={{ color: '#0a6a56' }}>Selected: {currentGoalInfo.title}</span>
                <p className="text-xs mt-0.5" style={{ color: '#0b3d33', opacity: 0.7 }}>{currentGoalInfo.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Duration Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0a6a56' }}>
            Program Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { days: 7, label: '1 week', color: '#10b981' },
              { days: 14, label: '2 weeks', color: '#0ea5e9' },
              { days: 21, label: '3 weeks', color: '#f59e0b' },
              { days: 28, label: '4 weeks', color: '#ef4444' }
            ].map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => setDurationDays(option.days)}
                className={`py-3 px-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                  durationDays === option.days ? 'shadow-md' : 'hover:shadow-sm'
                }`}
                style={{
                  borderColor: durationDays === option.days ? option.color : '#c8ead6',
                  background: durationDays === option.days ? `${option.color}15` : 'white',
                  color: durationDays === option.days ? option.color : '#0b3d33',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection with Visual Pills */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0a6a56' }}>
            Difficulty Level
          </label>
          <div className="flex gap-2">
            {[
              { value: 'beginner', label: 'Beginner', color: '#10b981' },
              { value: 'intermediate', label: 'Intermediate', color: '#f59e0b' },
              { value: 'advanced', label: 'Advanced', color: '#ef4444' },
            ].map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setDifficultyLevel(level.value)}
                className={`flex-1 py-3 px-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                  difficultyLevel === level.value ? 'shadow-md' : 'hover:shadow-sm'
                }`}
                style={{
                  borderColor: difficultyLevel === level.value ? level.color : '#c8ead6',
                  background: difficultyLevel === level.value ? `${level.color}15` : 'white',
                  color: difficultyLevel === level.value ? level.color : '#0b3d33',
                }}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0a6a56' }}>
            Additional Notes <span style={{ color: '#0b3d33', opacity: 0.6, fontWeight: 'normal' }}>(Optional)</span>
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            maxLength={1000}
            placeholder="Tell the AI how you want your plan... (e.g., knee pain, prefer bodyweight exercises, focus on core)"
            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none transition-all"
            style={{ borderColor: '#c8ead6' }}
            rows={3}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs" style={{ color: '#0b3d33', opacity: 0.6 }}>
              Mention any injuries, equipment, or specific preferences
            </span>
            <span className="text-xs font-medium" style={{ color: '#0b3d33', opacity: 0.6 }}>
              {additionalNotes.length}/1000
            </span>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
          <div className="text-xs font-semibold mb-2" style={{ color: '#0a6a56' }}>SCHEDULE SUMMARY</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div style={{ color: '#0b3d33', opacity: 0.6 }}>Goal</div>
              <div className="font-bold capitalize" style={{ color: '#0a6a56' }}>{currentGoalInfo?.title}</div>
            </div>
            <div className="text-center">
              <div style={{ color: '#0b3d33', opacity: 0.6 }}>Duration</div>
              <div className="font-bold" style={{ color: '#0a6a56' }}>{getDurationLabel(durationDays)}</div>
            </div>
            <div className="text-center">
              <div style={{ color: '#0b3d33', opacity: 0.6 }}>Level</div>
              <div className="font-bold capitalize" style={{ color: '#0a6a56' }}>{difficultyLevel}</div>
            </div>
          </div>
        </div>

        {/* Customization Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setShowCustomize(false)}
            disabled={isCreating}
            className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-gray-50 transition-all disabled:opacity-50"
            style={{ borderColor: '#c8ead6', color: '#0b3d33' }}
          >
            Back to AI Plan
          </button>
          <button
            onClick={() => handleCreateSchedule()}
            disabled={isCreating || !creditBalance?.canAffordOperation}
            className="flex-[2] px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: '#0a6a56' }}
            title={!creditBalance?.canAffordOperation ? "Insufficient AI credits" : ""}
          >
            <div ref={iconRef} className="flex items-center">
            {showLottie ? (
              <DotLottieReact
                src="/animations/LoadingAI_Gen.lottie"
                loop
                autoplay
                style={{ width: 20, height: 20 }}
              />
            ) : (
              <AutoAwesome fontSize="small" />
            )}
          </div>
          <span>{isCreating ? 'Creating...' : 'Generate Custom Plan'}</span>
          </button>
        </div>
      </div>
      )}

      {/* Warning Dialog for Existing Schedule with Completed Days */}
      {showWarningDialog && existingScheduleInfo && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[99999]"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => {
            setShowWarningDialog(false);
            setExistingScheduleInfo(null);
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4"
            style={{ border: "2px solid #f59e0b" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Warning Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#fef3c7" }}>
                  <Warning style={{ color: "#f59e0b", fontSize: 28 }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: "#f59e0b" }}>
                    Replace Existing Schedule?
                  </h3>
                  <p className="text-xs" style={{ color: "#92400e" }}>
                    You have progress that will be archived
                  </p>
                </div>
              </div>

              {/* Warning Content */}
              <div
                className="p-4 rounded-xl mb-4"
                style={{ background: "#fef3c7", border: "2px solid #fde68a" }}
              >
                <p className="text-sm font-semibold mb-2" style={{ color: "#92400e" }}>
                  Your current schedule will be archived:
                </p>
                <ul className="space-y-2 text-sm" style={{ color: "#78350f" }}>
                  <li className="flex items-start gap-2">
                    <CheckCircle style={{ fontSize: 18, color: "#10b981", marginTop: 2 }} />
                    <span>
                      <strong>{existingScheduleInfo.completedCount}</strong> completed workout
                      {existingScheduleInfo.completedCount !== 1 ? 's' : ''} will be preserved in your history
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Warning style={{ fontSize: 18, color: "#f59e0b", marginTop: 2 }} />
                    <span>
                      Progress tracking and analytics will remain accessible
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CalendarMonth style={{ fontSize: 18, color: "#3b82f6", marginTop: 2 }} />
                    <span>
                      A fresh schedule will replace your current plan
                    </span>
                  </li>
                </ul>
              </div>

              {/* Info Message */}
              <div
                className="p-3 rounded-xl mb-4"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
              >
                <p className="text-xs" style={{ color: "#166534" }}>
                  <strong>Tip:</strong> Your completed workouts and progress are safely stored and won't be lost. 
                  This only replaces your upcoming workout plan.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowWarningDialog(false);
                    setExistingScheduleInfo(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-colors hover:bg-gray-50"
                  style={{ color: "#6b7280", border: "2px solid #e5e7eb" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowWarningDialog(false);
                    handleCreateSchedule(true); // Skip warning check
                  }}
                  className="flex-[2] px-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "#f59e0b" }}
                >
                  Replace & Create New Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCreationWidget;

