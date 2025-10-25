import React, { useState } from "react";
import { Cross2Icon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting?: boolean;
}

const reportReasons = [
  "Spam or misleading",
  "Harassment or hate speech",
  "Violence or dangerous content",
  "Inappropriate or offensive content",
  "Copyright or trademark violation",
  "False information",
  "Other",
];

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting = false }) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  const handleSubmit = () => {
    const reason = selectedReason === "Other" ? customReason : selectedReason;
    if (reason.trim()) {
      onSubmit(reason);
      // Reset state after submission
      setSelectedReason("");
      setCustomReason("");
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ExclamationTriangleIcon width={20} height={20} color="#ef4444" />
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "600",
                color: "#1a1a1a",
              }}
            >
              Report Post
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              background: "rgba(0, 0, 0, 0.05)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.05)";
            }}
          >
            <Cross2Icon width={16} height={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          <p
            style={{
              margin: "0 0 20px 0",
              fontSize: "14px",
              color: "#666",
              lineHeight: "1.5",
            }}
          >
            Help us understand what's wrong with this post. Your report is anonymous and will be reviewed by our team.
          </p>

          {/* Report Reasons */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1a1a1a",
              }}
            >
              Reason for reporting:
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {reportReasons.map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: `2px solid ${selectedReason === reason ? "#007E85" : "rgba(0, 0, 0, 0.1)"}`,
                    backgroundColor: selectedReason === reason ? "rgba(0, 126, 133, 0.05)" : "#fff",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting && selectedReason !== reason) {
                      e.currentTarget.style.borderColor = "rgba(0, 126, 133, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedReason !== reason) {
                      e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    disabled={isSubmitting}
                    style={{
                      marginRight: "12px",
                      width: "18px",
                      height: "18px",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      fontWeight: selectedReason === reason ? "500" : "400",
                    }}
                  >
                    {reason}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason Input */}
          {selectedReason === "Other" && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                Please specify:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe why you're reporting this post..."
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "12px",
                  border: "2px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "vertical",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              backgroundColor: "#fff",
              color: "#666",
              border: "1px solid rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !selectedReason ||
              (selectedReason === "Other" && !customReason.trim()) ||
              isSubmitting
            }
            style={{
              padding: "10px 20px",
              backgroundColor:
                selectedReason && (selectedReason !== "Other" || customReason.trim()) && !isSubmitting
                  ? "#ef4444"
                  : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor:
                selectedReason && (selectedReason !== "Other" || customReason.trim()) && !isSubmitting
                  ? "pointer"
                  : "not-allowed",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
              opacity: isSubmitting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (
                selectedReason &&
                (selectedReason !== "Other" || customReason.trim()) &&
                !isSubmitting
              ) {
                e.currentTarget.style.backgroundColor = "#dc2626";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedReason && (selectedReason !== "Other" || customReason.trim())) {
                e.currentTarget.style.backgroundColor = "#ef4444";
              }
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;

