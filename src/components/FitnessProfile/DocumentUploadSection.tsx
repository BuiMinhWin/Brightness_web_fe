import React, { useState } from "react";
import { Upload, FileText, CheckCircle, Info, Sparkles, ArrowUp, Bot, X, Image as ImageIcon } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SectionCard from "./SectionCard";

interface UploadedFileInfo {
  file: File;
  preview?: string;
  status: "processing" | "success" | "error";
  progress: string;
}

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentProgress, setCurrentProgress] = useState("");
  const [freeAttemptsRemaining, setFreeAttemptsRemaining] = useState(3);

  // Load free attempts from localStorage on mount
  React.useEffect(() => {
    if (!userId) return;
    
    const storageKey = `fitness_profile_free_uploads_${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setFreeAttemptsRemaining(data.remaining);
      } catch (error) {
        console.error('Failed to parse stored upload attempts:', error);
        // Reset to 3 if corrupt
        localStorage.setItem(storageKey, JSON.stringify({ remaining: 3, used: 0 }));
        setFreeAttemptsRemaining(3);
      }
    } else {
      // First time user - give 3 free attempts
      localStorage.setItem(storageKey, JSON.stringify({ remaining: 3, used: 0 }));
      setFreeAttemptsRemaining(3);
    }
  }, [userId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleMultipleFiles(files);
    }
    e.target.value = ""; // Reset input
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
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      handleMultipleFiles(files);
    }
  };

  const handleMultipleFiles = (files: File[]) => {
    // Check if we can accept more files (max 2 total)
    const remainingSlots = 2 - uploadedFiles.length;
    if (remainingSlots === 0) {
      onError("Maximum 2 files allowed. Please remove a file first.", "warning");
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        onError(`${file.name}: Please upload an image (JPG, PNG, WEBP) or PDF file`, "error");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        onError(`${file.name}: File size must be less than 10MB`, "error");
        return;
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          addFileToQueue(file, reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        addFileToQueue(file);
      }
    });
  };

  const addFileToQueue = (file: File, preview?: string) => {
    const newFile: UploadedFileInfo = {
      file,
      preview,
      status: "processing",
      progress: "Queued..."
    };

    setUploadedFiles(prev => [...prev, newFile]);
    
    // Start processing immediately if not already processing
    if (!isProcessing) {
      processNextFile([...uploadedFiles, newFile]);
    }
  };

  const processNextFile = async (queue: UploadedFileInfo[]) => {
    const fileToProcess = queue.find(f => f.status === "processing" && f.progress === "Queued...");
    if (!fileToProcess) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    await handleFileUpload(fileToProcess);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (fileInfo: UploadedFileInfo) => {
    if (!userId) {
      onError("Please log in to upload documents", "error");
      return;
    }

    // Check if user has free attempts remaining
    if (freeAttemptsRemaining <= 0) {
      onError("You've used all 3 free upload attempts. Please manually input your data below. Don't worry - this feature is just to help you get started quickly!", "warning");
      // Remove file from queue
      setUploadedFiles(prev => prev.filter(f => f.file !== fileInfo.file));
      setIsProcessing(false);
      return;
    }

    const { file } = fileInfo;

    // Update file progress
    setUploadedFiles(prev => prev.map(f => 
      f.file === file 
        ? { ...f, progress: "Uploading..." }
        : f
    ));
    setCurrentProgress(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("UserId", userId);
      formData.append("Prompt", "Extract all body measurements, weight, muscle mass, body fat percentage, and any other health metrics from this InBody or medical document.");
      formData.append("DataType", "lab_result");

      setUploadedFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, progress: "Processing with AI..." }
          : f
      ));
      setCurrentProgress(`Processing ${file.name}...`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-ocr/api/OCR/ai-vision-upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process document");

      const data = await response.json();
      
      // Mark as success
      setUploadedFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: "success", progress: "Complete!" }
          : f
      ));

      // Deduct a free attempt
      const storageKey = `fitness_profile_free_uploads_${userId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const attemptData = JSON.parse(stored);
        const newRemaining = Math.max(0, attemptData.remaining - 1);
        const newUsed = attemptData.used + 1;
        localStorage.setItem(storageKey, JSON.stringify({ remaining: newRemaining, used: newUsed }));
        setFreeAttemptsRemaining(newRemaining);
      }
      
      onUploadSuccess(data);
      
      // Process next file in queue
      setTimeout(() => {
        const currentQueue = uploadedFiles.map(f => 
          f.file === file ? { ...f, status: "success" as const, progress: "Complete!" } : f
        );
        processNextFile(currentQueue);
      }, 100);
      
    } catch (error) {
      console.error("Document upload error:", error);
      
      // Mark as error
      setUploadedFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: "error", progress: "Failed" }
          : f
      ));
      
      onError(`Failed to process ${file.name}. Please try again.`, "error");
      
      // Continue with next file
      setTimeout(() => {
        const currentQueue = uploadedFiles.map(f => 
          f.file === file ? { ...f, status: "error" as const, progress: "Failed" } : f
        );
        processNextFile(currentQueue);
      }, 100);
    }
  };

  return (
    <SectionCard
      title="Quick Import (Optional)"
      subtitle="Upload InBody or medical reports for instant auto-fill"
      icon={<FileText size={20} />}
    >
      {/* Uploaded Files Grid - Shows files with previews */}
      {uploadedFiles.length > 0 && (
        <div className="mb-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            Imported Documents ({uploadedFiles.length}/2)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uploadedFiles.map((fileInfo, index) => (
              <div
                key={index}
                className={`
                  relative rounded-lg border-2 overflow-hidden transition-all
                  ${fileInfo.status === "success" ? "border-emerald-400 bg-emerald-50" : ""}
                  ${fileInfo.status === "processing" ? "border-blue-400 bg-blue-50" : ""}
                  ${fileInfo.status === "error" ? "border-red-400 bg-red-50" : ""}
                `}
              >
                {/* Preview Image or PDF Icon */}
                <div className="relative h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {fileInfo.preview ? (
                    <img
                      src={fileInfo.preview}
                      alt={fileInfo.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={48} className="text-gray-400" />
                      <p className="text-xs text-gray-500 font-medium">PDF Document</p>
                    </div>
                  )}
                  
                  {/* Processing Overlay */}
                  {fileInfo.status === "processing" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <DotLottieReact
                        src="/animations/ImageLoading.lottie"
                        loop
                        autoplay
                        style={{ width: 48, height: 48 }}
                      />
                    </div>
                  )}
                  
                  {/* Success Badge */}
                  {fileInfo.status === "success" && (
                    <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-800 truncate mb-1" title={fileInfo.file.name}>
                    {fileInfo.file.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      {(fileInfo.file.size / 1024).toFixed(1)} KB
                    </p>
                    <div className="flex items-center gap-2">
                      {fileInfo.status === "processing" && (
                        <span className="text-xs text-blue-600 font-medium">{fileInfo.progress}</span>
                      )}
                      {fileInfo.status === "success" && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle size={12} />
                          Complete
                        </span>
                      )}
                      {fileInfo.status === "error" && (
                        <span className="text-xs text-red-600 font-medium">Failed</span>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Remove file"
                      >
                        <X size={14} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Free Attempts Badge */}
      {freeAttemptsRemaining > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-3 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-sm">
                  {freeAttemptsRemaining === 3 ? "Welcome Bonus!" : "Free Uploads Remaining"}
                </p>
                <p className="text-xs text-amber-700">
                  {freeAttemptsRemaining} of 3 free AI uploads • No credits used!
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < freeAttemptsRemaining ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-bold text-emerald-800 text-base mb-2 flex items-center gap-2">
              AI-Powered Personalization
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Upload your <span className="font-semibold text-emerald-900">InBody report</span> or{" "}
              <span className="font-semibold text-emerald-900">medical documents</span> to automatically fill your profile. 
              Your health data will be securely stored and analyzed by our AI to create highly 
              personalized <span className="font-semibold text-teal-900">workout plans</span>,{" "}
              <span className="font-semibold text-teal-900">nutrition recommendations</span>, and{" "}
              <span className="font-semibold text-teal-900">safety guidelines</span>.
            </p>
            <div className="bg-white/80 border border-emerald-200 rounded-lg px-3 py-2 flex items-start gap-2">
              <Info size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700">
                <strong className="text-red-600">Privacy:</strong>{" "}
                <span className="text-red-600">Your data is encrypted, never shared, and only used to improve your experience.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      {uploadedFiles.length < 2 && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${isDragging 
              ? "border-emerald-500 bg-emerald-50" 
              : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50"
            }
            ${isProcessing ? "cursor-not-allowed opacity-70" : ""}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
            multiple
          />
          
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <DotLottieReact
                src="/animations/ImageLoading.lottie"
                loop
                autoplay
                style={{ width: 56, height: 56 }}
              />
              <p className="text-base font-semibold text-gray-800">{currentProgress}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Bot size={12} className="text-emerald-600" />
                Processing in queue...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-1">
                <Upload className="text-emerald-600" size={24} />
              </div>
              <p className="text-base font-semibold text-gray-800">
                {uploadedFiles.length === 0 ? "Upload Documents" : "Upload Another Document"}
              </p>
              <p className="text-sm text-gray-600">
                Drag & drop or click • JPG, PNG, PDF • Max 2 files
              </p>
              {freeAttemptsRemaining > 0 ? (
                <p className="text-xs font-semibold text-amber-600">
                  ✨ FREE upload ({freeAttemptsRemaining}/3 remaining) • No AI credits used!
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  AI will automatically extract and fill your measurements
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* All files uploaded message */}
      {uploadedFiles.length === 2 && !isProcessing && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-center">
          <CheckCircle size={32} className="text-emerald-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-emerald-800">
            Maximum files uploaded (2/2)
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Remove a file to upload a different one
          </p>
        </div>
      )}
    </SectionCard>
  );
};

export default DocumentUploadSection;

