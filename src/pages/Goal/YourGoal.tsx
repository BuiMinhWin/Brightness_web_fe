import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Bell, Clock, Loader2 } from "lucide-react";
import "./YourGoal.css";
import { challengeService } from "../../services/challengeService";
import type {
  Challenge,
  ChallengeDTO,
  ChallengeParticipantDTO,
} from "../../services/challengeService";
import { useAppSelector } from "../../store/hooks";
import { selectUserId } from "../../store/slices/authSlice";

interface GoalItem {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  deadlineDate?: number;
  status?: string;
  icon?: ReactNode;
}

const formatDeadline = (value?: string | null): string => {
  if (!value) {
    return "No deadline";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const toTimestamp = (value?: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toIsoOrUndefined = (value: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();
};

const sortGoals = (items: GoalItem[]): GoalItem[] => {
  return [...items].sort((a, b) => {
    if (a.deadlineDate === undefined && b.deadlineDate === undefined) {
      return a.title.localeCompare(b.title);
    }
    if (a.deadlineDate === undefined) {
      return 1;
    }
    if (b.deadlineDate === undefined) {
      return -1;
    }
    if (a.deadlineDate === b.deadlineDate) {
      return a.title.localeCompare(b.title);
    }
    return a.deadlineDate - b.deadlineDate;
  });
};

interface GoalCardProps {
  title: string;
  description?: string;
  deadline: string;
  icon?: ReactNode;
  status?: string;
}

function GoalCard({ title, description, deadline, icon, status }: GoalCardProps) {
  const effectiveIcon = icon ?? <Bell className="w-[20px] h-[20px] text-[#05644C]" />;
  const displayDescription =
    description && description.trim().length > 0 ? description : "No description yet.";

  return (
    <div className="w-full h-[120px] rounded-xl goal-card-bg shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 p-3 flex items-start">
        <div className="w-[53px] h-[53px] bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          {effectiveIcon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-brightnest-primary font-dm-sans text-xl font-medium leading-none">
            {title}
          </h3>
          {status && (
            <p className="text-brightnest-primary font-poppins text-[11px] uppercase tracking-[0.5px] mt-1">
              {status}
            </p>
          )}
          <p className="text-black font-dm-sans text-sm mt-2 leading-snug line-clamp-2">
            {displayDescription}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white mx-3" />
      <div className="absolute bottom-2 left-[72px] flex items-center text-white font-poppins text-xs">
        <Clock className="w-[17px] h-[17px] mr-2" />
        <span>Deadline {deadline}</span>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange?: (value: string) => void;
  multiline?: boolean;
  readOnly?: boolean;
}

function FormField({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
  multiline = false,
  readOnly,
}: FormFieldProps) {
  const isReadOnly = readOnly ?? typeof onChange !== "function";
  const commonClasses =
    "text-gray-800 font-dm-sans text-xl bg-transparent border-0 outline-none w-full placeholder:text-gray-400";

  return (
    <div className="w-full goal-field p-4 border-0">
      <label className="text-brightnest-text-muted font-dm-sans text-base block mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          className={`${commonClasses} resize-none`}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          readOnly={isReadOnly}
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          className={commonClasses}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          readOnly={isReadOnly}
        />
      )}
    </div>
  );
}

export default function GoalPage() {
  const userId = useAppSelector(selectUserId);

  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
  });

  const mapChallengeToGoal = useCallback((challenge: Challenge): GoalItem => {
    const deadlineSource = challenge.endAt ?? challenge.startAt ?? null;
    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      status: challenge.status,
      deadline: formatDeadline(deadlineSource),
      deadlineDate: toTimestamp(deadlineSource),
    };
  }, []);

  const loadGoals = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const participants = await challengeService.getParticipantsByUserId(userId);
      const participantChallengeIds = new Set(participants.map((p) => p.challengeId));

      if (participantChallengeIds.size === 0) {
        setGoals([]);
        return;
      }

      // Fetch all challenges and filter them on the client-side
      // This is more efficient than fetching each challenge individually.
      const allChallenges = await challengeService.getAllChallenges();

      const userChallenges = allChallenges.filter((challenge) =>
        participantChallengeIds.has(challenge.id)
      );

      const mappedGoals = userChallenges
        .map((challenge) => mapChallengeToGoal(challenge));

      setGoals(sortGoals(mappedGoals));
    } catch (fetchError) {
      console.error("Failed to load goals", fetchError);
      setError("Unable to load your goals right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, mapChallengeToGoal]);

  useEffect(() => {
    if (!userId) {
      setGoals([]);
      setError(null);
      return;
    }

    void loadGoals();
  }, [userId, loadGoals]);

  const handleFieldChange =
    (field: "title" | "description" | "startAt" | "endAt") => (value: string) => {
      setNewGoal((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (formError) {
        setFormError(null);
      }
    };

  const handleCreateGoal = async () => {
    if (!userId) {
      setFormError("You need to sign in before creating a goal.");
      return;
    }

    if (!newGoal.title.trim()) {
      setFormError("Please enter a goal title.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: ChallengeDTO = {
        hostUserId: userId,
        title: newGoal.title.trim(),
        description: newGoal.description.trim() || undefined,
        startAt: toIsoOrUndefined(newGoal.startAt) ?? new Date().toISOString(),
        endAt: toIsoOrUndefined(newGoal.endAt),
        status: "Active",
        taskSummary: newGoal.description.trim() || undefined,
      };

      console.log("[GoalPage] Creating challenge with payload:", payload);
      const createdChallenge = await challengeService.createChallenge(payload);
      console.log("[GoalPage] createChallenge response:", createdChallenge);

      // Automatically create a default daily task for the new challenge
      // This allows users to track their progress daily on the Schedule page.
      const taskPayload = {
        challengeId: createdChallenge.id,
        name: createdChallenge.title,
        description: createdChallenge.description || "Complete your daily goal.",
        taskType: "Daily",
        frequencyRule: "Daily", // Assuming backend understands this rule
        isRequired: true,
      };

      console.log("[GoalPage] Creating default task with payload:", taskPayload);
      const createdTask = await challengeService.createChallengeTask(taskPayload);
      console.log("[GoalPage] createChallengeTask response:", createdTask);

      const participantPayload: ChallengeParticipantDTO = {
        challengeId: createdChallenge.id,
        userId,
        status: "Active",
        joinedAt: new Date().toISOString(),
      };

      console.log("[GoalPage] Creating participant with payload:", participantPayload);
      const participantResponse =
        await challengeService.createChallengeParticipant(participantPayload);
      console.log("[GoalPage] createChallengeParticipant response:", participantResponse);

      setGoals((prev) => sortGoals([...prev, mapChallengeToGoal(createdChallenge)]));
      setNewGoal({
        title: "",
        description: "",
        startAt: "",
        endAt: "",
      });

      // Refresh to ensure we reflect backend state (e.g. participation records)
      await loadGoals();
    } catch (createError) {
      console.error("Failed to create goal", createError);
      setFormError("Unable to create the goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAddDisabled = !newGoal.title.trim() || isSubmitting || !userId;

  return (
    <div className="goals-bg relative overflow-y-auto flex flex-col">
      <main className="px-8 py-12 flex-grow">
        <div className="mb-8">
          <h2 className="text-brightnest-primary font-dm-sans text-5xl font-bold leading-[46px] capitalize mb-4">
            Your Goals
          </h2>
          <div className="text-center mb-8">
            <h3 className="text-brightnest-accent font-pacifico text-4xl leading-[50px] max-w-[789px] mx-auto">
              You are almost there, Don't give up!!!
            </h3>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1 max-w-[358px]">
            <h3 className="text-brightnest-primary font-poppins text-2xl font-semibold tracking-[0.5px] mb-6">
              Goal Preview
            </h3>
            <div className="space-y-4 h-[420px] overflow-y-auto pr-2 no-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-brightnest-primary gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-dm-sans text-sm">Loading goals...</span>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 font-dm-sans text-sm px-2">{error}</div>
              ) : goals.length === 0 ? (
                <div className="text-center text-brightnest-text-muted font-dm-sans text-sm px-4">
                  {userId
                    ? "You have not joined any goals yet."
                    : "Sign in to see the goals you are part of."}
                </div>
              ) : (
                goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    title={goal.title}
                    description={goal.description}
                    deadline={goal.deadline}
                    icon={goal.icon}
                    status={goal.status}
                  />
                ))
              )}
            </div>
          </div>

          <div className="goal-divider h-[496px] mx-8" />

          <div className="flex-1 max-w-[358px]">
            <h3 className="text-brightnest-primary font-dm-sans text-2xl font-semibold tracking-[0.5px] mb-8">
              Add New Goal
            </h3>
            <div className="space-y-4">
              <FormField
                label="Goal Title"
                value={newGoal.title}
                placeholder="E.g. Drink 5 cups of water"
                onChange={handleFieldChange("title")}
              />
              <FormField
                label="Goal Description"
                value={newGoal.description}
                placeholder="Describe your goal"
                onChange={handleFieldChange("description")}
                multiline
              />
              <FormField
                label="Start Date"
                value={newGoal.startAt}
                type="date"
                onChange={handleFieldChange("startAt")}
              />
              <FormField
                label="Deadline"
                value={newGoal.endAt}
                type="date"
                onChange={handleFieldChange("endAt")}
              />
            </div>
            {formError && (
              <p className="text-red-500 font-dm-sans text-sm mt-4 leading-snug">{formError}</p>
            )}
            {!userId && (
              <p className="text-brightnest-text-muted font-dm-sans text-sm mt-2">
                Please sign in to create a new goal.
              </p>
            )}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleCreateGoal}
                disabled={isAddDisabled}
                className="goal-add-btn font-dm-sans text-2xl tracking-[0.5px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
