import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Warning, CheckCircle, FitnessCenter } from "@mui/icons-material";
import type { ConflictingWorkout } from "@/services/personalCoachService";

interface ScheduleConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conflicts: ConflictingWorkout[];
  isGenerating?: boolean;
}

const ScheduleConflictDialog: React.FC<ScheduleConflictDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  conflicts,
  isGenerating = false,
}) => {
  const completedCount = conflicts.filter((c) => c.isCompleted).length;
  const incompleteCount = conflicts.length - completedCount;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent
        className="bg-white rounded-3xl max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        style={{ border: "2px solid #fed7aa" }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2" style={{ color: "#9a3412" }}>
            <Warning />
            Schedule Conflicts Detected
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            <div className="space-y-3">
              <p style={{ color: "#78350f" }}>
                Creating this schedule will override <strong>{conflicts.length} workout{conflicts.length !== 1 ? 's' : ''}</strong> on the following dates:
              </p>
              
              {/* Summary */}
              <div className="flex gap-2 text-sm">
                {completedCount > 0 && (
                  <div
                    className="px-3 py-1 rounded-lg flex items-center gap-1"
                    style={{ background: "#dcfce7", color: "#166534" }}
                  >
                    <CheckCircle style={{ fontSize: 16 }} />
                    {completedCount} completed
                  </div>
                )}
                {incompleteCount > 0 && (
                  <div
                    className="px-3 py-1 rounded-lg flex items-center gap-1"
                    style={{ background: "#fef3c7", color: "#78350f" }}
                  >
                    <FitnessCenter style={{ fontSize: 16 }} />
                    {incompleteCount} incomplete
                  </div>
                )}
              </div>

              {/* Conflict List */}
              <div
                className="border-2 rounded-xl p-4 max-h-64 overflow-y-auto"
                style={{ borderColor: "#fed7aa", background: "#fffbeb" }}
              >
                <div className="space-y-2">
                  {conflicts.map((conflict, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg"
                      style={{
                        background: conflict.isCompleted ? "#f0fdf4" : "#fff",
                        border: `1px solid ${conflict.isCompleted ? "#bbf7d0" : "#e5e7eb"}`,
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm" style={{ color: "#0b3d33" }}>
                          {formatDate(conflict.date)}
                        </div>
                        <div className="text-xs" style={{ color: "#6b7280" }}>
                          {conflict.focusArea} • {conflict.exerciseCount} exercise{conflict.exerciseCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {conflict.isCompleted && (
                        <div
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{ background: "#dcfce7", color: "#166534" }}
                        >
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm" style={{ color: "#9a3412" }}>
                <strong>Note:</strong> Your old schedule will be archived and remain accessible in your history. All workout data will be preserved.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-xl"
            style={{ borderColor: "#c8ead6" }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isGenerating}
            className="rounded-xl text-white hover:opacity-90 disabled:opacity-50"
            style={{ background: "#ea580c" }}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              "Continue & Override"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ScheduleConflictDialog;




