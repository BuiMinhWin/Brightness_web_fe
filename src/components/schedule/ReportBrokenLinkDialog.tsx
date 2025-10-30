import React, { useState } from "react";
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
import brokenLinkReportService from "@/services/brokenLinkReportService";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/useToast";

interface ReportBrokenLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseName: string;
  videoUrl: string;
  onReportSuccess?: () => void;
}

const ReportBrokenLinkDialog: React.FC<ReportBrokenLinkDialogProps> = ({
  isOpen,
  onClose,
  exerciseId,
  exerciseName,
  videoUrl,
  onReportSuccess,
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = useAppSelector((state) => state.auth.userId);
  const { showToast } = useToast();

  const handleReport = async () => {
    if (!userId) {
      showToast("Please log in to report broken links", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await brokenLinkReportService.reportBrokenLink({
        exerciseId,
        exerciseName,
        brokenVideoUrl: videoUrl,
        userId,
        userComment: comment || undefined,
      });

      if (onReportSuccess) {
        onReportSuccess();
      }

      setComment("");
      onClose();
    } catch (error) {
      console.error("Failed to report broken link:", error);
      showToast("Failed to report broken link. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent
        className="bg-white rounded-3xl max-w-md"
        style={{ border: "2px solid #c8ead6" }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle style={{ color: "#0a6a56" }}>
            Report Broken Video Link
          </AlertDialogTitle>
          <AlertDialogDescription>
            Report a broken or incorrect video link for {exerciseName}. Your feedback helps us improve the exercise library.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 px-6 pb-2">
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium mb-1"
              style={{ color: "#0b3d33" }}
            >
              Additional details (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What's wrong with the video? (e.g., 404 error, wrong exercise, etc.)"
              className="w-full px-3 py-2 border-2 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20"
              style={{ borderColor: "#c8ead6", color: "#0b3d33" }}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
              {comment.length}/500 characters
            </p>
          </div>

          <p className="text-xs" style={{ color: "#6b7280" }}>
            Thank you for helping us improve! Our team will review and fix this issue.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl"
            style={{ borderColor: "#c8ead6" }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReport}
            disabled={isSubmitting}
            className="rounded-xl text-white hover:opacity-90"
            style={{ background: "#dc2626" }}
          >
            {isSubmitting ? "Reporting..." : "Report Issue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReportBrokenLinkDialog;

