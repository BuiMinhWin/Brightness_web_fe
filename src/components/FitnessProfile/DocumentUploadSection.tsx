import React, { useState } from "react";
import { Upload, FileText, CheckCircle, Info } from "lucide-react";
import { CircularProgress } from "@mui/material";
import SectionCard from "./SectionCard";

interface DocumentUploadSectionProps {
  userId: string | null;
  onUploadSuccess: (data: any) => void;
  onError: (message: string, severity: "error" | "warning") => void;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  userId,
  onUploadSuccess,
  onError,
}) => {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    if (!userId) {
      onError("Please log in to upload documents", "error");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      onError("Please upload an image (JPG, PNG, WEBP) or PDF file", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError("File size must be less than 10MB", "error");
      return;
    }

    setUploadStatus("uploading");
    setUploadedFile(file);
    setUploadProgress("Uploading document...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("UserId", userId);
      formData.append("Prompt", "Extract all body measurements, weight, muscle mass, body fat percentage, and any other health metrics from this InBody or medical document.");
      formData.append("DataType", "lab_result");

      setUploadProgress("Processing with AI...");
      setUploadStatus("processing");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-ocr/api/OCR/ai-vision-upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process document");

      const data = await response.json();
      setUploadStatus("success");
      setUploadProgress("Complete!");
      onUploadSuccess(data);
    } catch (error) {
      console.error("Document upload error:", error);
      setUploadStatus("error");
      setUploadProgress("");
      onError("Failed to process document. Please try again.", "error");
    }
  };

  return (
    <SectionCard
      title="Quick Import (Optional)"
      subtitle="Upload InBody or medical reports for instant auto-fill"
      icon={<FileText size={20} />}
    >
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 mb-4">
        <div className="flex gap-2">
          <Info className="text-emerald-600 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-emerald-900 text-sm mb-1">🤖 AI-Powered Personalization</p>
            <p className="text-xs text-emerald-700 leading-relaxed mb-2">
              Upload your InBody report or medical documents to automatically fill your profile. 
              Your health data will be securely stored and analyzed by our AI to create highly 
              personalized workout plans, nutrition recommendations, and safety guidelines.
            </p>
            <p className="text-xs text-emerald-600 bg-white/50 rounded px-2 py-1 inline-block">
              <strong>Privacy:</strong> Your data is encrypted, never shared, and only used to improve your experience.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragging 
            ? "border-emerald-500 bg-emerald-50" 
            : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50"
          }
          ${uploadStatus !== "idle" && uploadStatus !== "success" ? "cursor-not-allowed opacity-70" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => uploadStatus === "idle" && document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploadStatus !== "idle"}
        />
        
        {uploadStatus === "uploading" || uploadStatus === "processing" ? (
          <div className="flex flex-col items-center gap-2">
            <CircularProgress size={40} thickness={4} sx={{ color: "#0a6a56" }} />
            <p className="text-base font-semibold text-gray-800">{uploadProgress}</p>
            <p className="text-sm text-gray-600">{uploadedFile?.name}</p>
            <p className="text-xs text-gray-500">
              {uploadStatus === "uploading" ? "⬆️ Uploading..." : "🤖 Processing..."}
            </p>
          </div>
        ) : uploadStatus === "success" && uploadedFile ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle size={40} className="text-emerald-500" />
            <p className="text-base font-semibold text-gray-800">Document processed successfully!</p>
            <p className="text-sm text-gray-600">{uploadedFile.name}</p>
            <button
              className="mt-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFile(null);
                setUploadStatus("idle");
                setUploadProgress("");
              }}
            >
              Upload Another Document
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-1">
              <Upload className="text-emerald-600" size={24} />
            </div>
            <p className="text-base font-semibold text-gray-800">Upload InBody or Medical Report</p>
            <p className="text-sm text-gray-600">
              Drag & drop or click to upload • JPG, PNG, PDF
            </p>
            <p className="text-xs text-gray-500">
              AI will automatically extract and fill your measurements
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default DocumentUploadSection;

