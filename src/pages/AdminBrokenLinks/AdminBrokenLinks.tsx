import React, { useState, useEffect } from "react";
import { Flag, CheckCircle, Delete, Link as LinkIcon } from "@mui/icons-material";
import { Snackbar, Alert } from "@mui/material";
import brokenLinkReportService, { BrokenLinkReportListItem } from "@/services/brokenLinkReportService";
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

const AdminBrokenLinks: React.FC = () => {
  const [reports, setReports] = useState<BrokenLinkReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("pending");
  const [showFixDialog, setShowFixDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<BrokenLinkReportListItem | null>(null);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const statusFilter = filter === "all" ? undefined : filter;
      const data = await brokenLinkReportService.getAllReports(statusFilter);
      
      // Add isResolved flag for easier template rendering
      const reportsWithFlag = data.map(report => ({
        ...report,
        isResolved: report.status === 'resolved'
      }));
      
      setReports(reportsWithFlag);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFixDialog = (report: BrokenLinkReportListItem) => {
    setSelectedReport(report);
    setNewVideoUrl(report.brokenVideoUrl); // Pre-fill with broken URL for editing
    setAdminNotes("");
    setShowFixDialog(true);
  };

  const handleResolve = async () => {
    if (!selectedReport || !newVideoUrl.trim()) {
      setToast({
        open: true,
        message: "Please provide a valid video URL",
        severity: "warning",
      });
      return;
    }

    setIsResolving(true);
    try {
      await brokenLinkReportService.resolveBrokenLink(selectedReport.id, {
        newVideoUrl: newVideoUrl.trim(),
        adminNotes: adminNotes.trim() || undefined,
        adminUserId: "00000000-0000-0000-0000-000000000000", // Will be replaced by backend auth
      });
      
      setShowFixDialog(false);
      setSelectedReport(null);
      setNewVideoUrl("");
      setAdminNotes("");
      
      // Switch to resolved filter to show the fixed report
      setFilter("resolved");
      
      setToast({
        open: true,
        message: ` Broken link fixed! Exercise library updated and all reports resolved.`,
        severity: "success",
      });
      
      // Fetch will happen automatically due to filter change triggering useEffect
    } catch (error) {
      console.error("Failed to resolve report:", error);
      setToast({
        open: true,
        message: "Failed to fix broken link. Please try again.",
        severity: "error",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleDelete = (reportId: string) => {
    setReportToDelete(reportId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    setIsDeleting(true);
    try {
      await brokenLinkReportService.deleteReport(reportToDelete);
      
      setShowDeleteDialog(false);
      setReportToDelete(null);
      
      setToast({
        open: true,
        message: "Report deleted successfully",
        severity: "success",
      });
      
      await fetchReports();
    } catch (error) {
      console.error("Failed to delete report:", error);
      setToast({
        open: true,
        message: "Failed to delete report. Please try again.",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#0a6a56" }}>
              Broken Link Reports
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              Manage video link issues reported by users
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                filter === "all"
                  ? "text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
              style={filter === "all" ? { background: "#0a6a56" } : { color: "#0a6a56", border: "2px solid #c8ead6" }}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                filter === "pending"
                  ? "text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
              style={filter === "pending" ? { background: "#dc2626" } : { color: "#dc2626", border: "2px solid #fecaca" }}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                filter === "resolved"
                  ? "text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
              style={filter === "resolved" ? { background: "#16a34a" } : { color: "#16a34a", border: "2px solid #bbf7d0" }}
            >
              Resolved
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent"
              style={{ color: "#0a6a56" }}>
            </div>
            <p className="mt-4" style={{ color: "#6b7280" }}>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl" style={{ border: "2px solid #c8ead6" }}>
            <Flag style={{ fontSize: 64, color: "#d1d5db" }} />
            <p className="mt-4 text-lg font-medium" style={{ color: "#6b7280" }}>
              No {filter === "all" ? "" : filter} reports found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-3xl p-6"
                style={{ border: "2px solid #c8ead6" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Flag style={{ fontSize: 20, color: report.isResolved ? "#16a34a" : "#dc2626" }} />
                      <h3 className="text-xl font-semibold" style={{ color: "#0a6a56" }}>
                        {report.exerciseName}
                      </h3>
                      {report.isResolved && (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100" style={{ color: "#16a34a" }}>
                          Resolved
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm" style={{ color: "#6b7280" }}>
                      <div className="flex items-center gap-2">
                        <LinkIcon style={{ fontSize: 16 }} />
                        <a
                          href={report.brokenVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          style={{ color: "#0a6a56" }}
                        >
                          {report.brokenVideoUrl}
                        </a>
                      </div>

                      {report.userComment && (
                        <div className="mt-2 p-3 rounded-xl bg-gray-50">
                          <p className="text-sm font-medium mb-1" style={{ color: "#0b3d33" }}>
                            User Comment:
                          </p>
                          <p className="text-sm" style={{ color: "#6b7280" }}>
                            {report.userComment}
                          </p>
                        </div>
                      )}

                      {report.isResolved && report.newVideoUrl && (
                        <div className="mt-2 p-3 rounded-xl" style={{ background: "#dcfce7" }}>
                          <p className="text-sm font-medium mb-1" style={{ color: "#0a6a56" }}>
                            Fixed Video URL:
                          </p>
                          <a
                            href={report.newVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:underline font-mono"
                            style={{ color: "#166534", wordBreak: "break-all" }}
                          >
                            {report.newVideoUrl}
                          </a>
                        </div>
                      )}

                      {report.isResolved && report.adminNotes && (
                        <div className="mt-2 p-3 rounded-xl" style={{ background: "#dcfce7" }}>
                          <p className="text-sm font-medium mb-1" style={{ color: "#0a6a56" }}>
                            Admin Notes:
                          </p>
                          <p className="text-sm" style={{ color: "#166534" }}>
                            {report.adminNotes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: "#e5e7eb" }}>
                        <span>Reported: {formatDate(report.reportedAt)}</span>
                        {report.isResolved && report.resolvedAt && (
                          <span>Resolved: {formatDate(report.resolvedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!report.isResolved && (
                      <button
                        onClick={() => handleOpenFixDialog(report)}
                        className="px-4 py-2 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90"
                        style={{ background: "#16a34a" }}
                        title="Fix and resolve"
                      >
                        <CheckCircle style={{ fontSize: 18 }} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="px-4 py-2 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90"
                      style={{ background: "#dc2626" }}
                      title="Delete report"
                    >
                      <Delete style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fix Broken Link Dialog */}
      <AlertDialog open={showFixDialog} onOpenChange={setShowFixDialog}>
        <AlertDialogContent
          className="bg-white rounded-3xl max-w-2xl"
          style={{ border: "2px solid #c8ead6" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#0a6a56" }}>
              Fix Broken Video Link
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "#0b3d33" }}>
                    Exercise:
                  </p>
                  <p className="text-base font-semibold" style={{ color: "#0a6a56" }}>
                    {selectedReport?.exerciseName}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "#0b3d33" }}>
                    Current (Broken) URL:
                  </p>
                  <p className="text-sm font-mono p-2 rounded bg-gray-100" style={{ color: "#dc2626", wordBreak: "break-all" }}>
                    {selectedReport?.brokenVideoUrl}
                  </p>
                </div>

                {selectedReport?.userComment && (
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "#0b3d33" }}>
                      User Comment:
                    </p>
                    <p className="text-sm p-2 rounded bg-gray-50" style={{ color: "#6b7280" }}>
                      {selectedReport.userComment}
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="newVideoUrl"
                    className="block text-sm font-medium mb-1"
                    style={{ color: "#0b3d33" }}
                  >
                    New (Corrected) Video URL <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    id="newVideoUrl"
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    style={{ borderColor: "#c8ead6", color: "#0b3d33" }}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="adminNotes"
                    className="block text-sm font-medium mb-1"
                    style={{ color: "#0b3d33" }}
                  >
                    Admin Notes (optional)
                  </label>
                  <textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="E.g., Found correct video on official channel"
                    className="w-full px-3 py-2 border-2 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    style={{ borderColor: "#c8ead6", color: "#0b3d33" }}
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                    {adminNotes.length}/500 characters
                  </p>
                </div>

                <div className="p-3 rounded-xl" style={{ background: "#fef3c7" }}>
                  <p className="text-xs font-medium" style={{ color: "#92400e" }}>
                    ⚠️ This will update the video URL in the Exercise Library and automatically resolve all reports for this exercise.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowFixDialog(false);
                setSelectedReport(null);
                setNewVideoUrl("");
                setAdminNotes("");
              }}
              disabled={isResolving}
              className="rounded-xl"
              style={{ borderColor: "#c8ead6" }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResolve}
              disabled={isResolving || !newVideoUrl.trim()}
              className="rounded-xl text-white hover:opacity-90"
              style={{ background: "#16a34a" }}
            >
              {isResolving ? "Fixing..." : "Fix & Resolve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          className="bg-white rounded-3xl"
          style={{ border: "2px solid #c8ead6" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#dc2626" }}>
              Delete Report?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this broken link report?
              <br />
              <br />
              <span style={{ color: "#dc2626", fontWeight: 500 }}>
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setReportToDelete(null);
              }}
              disabled={isDeleting}
              className="rounded-xl"
              style={{ borderColor: "#c8ead6" }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-xl text-white hover:opacity-90"
              style={{ background: "#dc2626" }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBrokenLinks;

