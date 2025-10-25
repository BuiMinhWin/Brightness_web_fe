import React, { useState, useRef } from 'react';
import { Upload, Close, CheckCircle, Edit, Save, Cancel, PictureAsPdf } from '@mui/icons-material';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ReactMarkdown from 'react-markdown';
import { personalCoachService } from '@/services/personalCoachService';
import chatService from '@/services/chatService';

interface HealthDataUploadWidgetProps {
  userId: string | null;
  sessionId?: string;
  onDataSaved: (data: any) => void;
  onCancel: () => void;
}

interface ExtractedData {
  [key: string]: string | number;
}

interface HealthMetrics {
  // Basic Info
  weight?: number;
  weightUnit?: string;
  height?: number;
  heightUnit?: string;
  age?: number;
  gender?: string;
  
  // Body Composition
  bmi?: number;
  bodyFat?: string;
  bodyFatMass?: number;
  leanBodyMass?: number;
  skeletalMuscleMass?: number;
  muscleMass?: number;
  boneMass?: number;
  
  // Water & Metabolism
  totalBodyWater?: number;
  bmr?: string;
  visceralFat?: number;
  
  // Blood Work (if available)
  cholesterol?: number;
  glucose?: number;
  bloodPressure?: string;
  heartRate?: number;
}

const HealthDataUploadWidget: React.FC<HealthDataUploadWidgetProps> = ({
  userId,
  sessionId,
  onDataSaved,
  onCancel,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({});
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    event.target.value = ''; // Reset input
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
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate image using service
    const validation = personalCoachService.validateHealthImage(file);
    if (!validation.valid) {
      setError(` ${validation.error || 'Invalid file'}\n\nPlease upload a clear photo of your health document (PDF, JPG, or PNG).`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    
    // Create preview for images only
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(''); // PDF, no preview
    }
  };

  const handleProcessImage = async () => {
    if (!selectedFile || !userId) {
      setError(' Please log in to process health documents');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Call AI OCR service directly (same as Fitness Profile)
      const result = await personalCoachService.processHealthLabResult(
        selectedFile,
        userId,
        "Extract all body measurements, weight, muscle mass, body fat percentage, blood test results, and any other health metrics from this health document.",
        'lab_result'
      );
      
      // Store raw data
      setExtractedData(result);
      
      // Parse and extract only relevant health metrics
      const parsedMetrics = parseHealthMetrics(result);
      setHealthMetrics(parsedMetrics);
      
    } catch (err: any) {
      console.log('Error processing image:', err);
      
      let errorMessage = '';
      
      if (err.status === 402) {
        const backendMsg = err.details?.message || '';
        const creditsNeeded = backendMsg.match(/requires (\d+) credits/)?.[1] || '5';
        const creditsRemaining = backendMsg.match(/only (\d+) remaining/)?.[1];
        const daysUntilReset = backendMsg.match(/Resets in (\d+) days/)?.[1] || backendMsg.match(/in (\d+) days/)?.[1] || backendMsg.match(/reset in (\d+) days/)?.[1];
        
        errorMessage = `💳 **Insufficient AI Credits**\n\nI need **${creditsNeeded} credits** to process your health document`;
        
        if (creditsRemaining) {
          errorMessage += `, but you only have **${creditsRemaining} credits** remaining`;
        }
        
        errorMessage += '.';
        
        if (daysUntilReset) {
          errorMessage += `\n\n🔄 Your credits will reset in **${daysUntilReset} days**.`;
        }
        
        errorMessage += '\n\n✨ **Upgrade your plan to get more credits:**\n- **Basic Plan** (79,000 VND): 500 credits/month (~100 health scans)\n- **Premium Plan** (149,000 VND): 1,200 credits/month (~240 health scans)\n\n[Upgrade Now →](/pricing)';
      } else if (err.message?.includes('format') || err.message?.includes('invalid')) {
        errorMessage = '📄 **Invalid Document Format**\n\nPlease ensure your document is a clear photo or scan in JPG, PNG, or PDF format.';
      } else {
        errorMessage = '❌ I had trouble reading your health document. Please make sure the image is clear and well-lit, then try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseHealthMetrics = (data: any): HealthMetrics => {
    // Try to parse processedContent if it's a JSON string
    let content = data.processedContent;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        console.error('Failed to parse processedContent:', e);
      }
    }
    
    return {
      // Basic Info
      weight: content?.weight,
      weightUnit: content?.weightUnit || 'lbs',
      height: content?.height,
      heightUnit: content?.heightUnit || 'cm',
      age: content?.age,
      gender: content?.gender,
      
      // Body Composition
      bmi: content?.bmi,
      bodyFat: content?.bodyFat,
      bodyFatMass: content?.bodyFatMass,
      leanBodyMass: content?.leanBodyMass,
      skeletalMuscleMass: content?.skeletalMuscleMass,
      muscleMass: content?.muscleMass,
      boneMass: content?.boneMass,
      
      // Water & Metabolism
      totalBodyWater: content?.totalBodyWater,
      bmr: content?.bmr,
      visceralFat: content?.visceralFat,
      
      // Blood Work
      cholesterol: content?.cholesterol,
      glucose: content?.glucose,
      bloodPressure: content?.bloodPressure,
      heartRate: content?.heartRate,
    };
  };

  const handleFieldChange = (key: keyof HealthMetrics, value: string | number) => {
    setHealthMetrics(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!userId) {
      setError(' Please log in to save your health data');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Prepare data for saving to user profile
      const profileData: any = {
        userId: userId,
      };

      // Add measurements if available
      if (healthMetrics.height && healthMetrics.weight) {
        const heightValue = parseFloat(String(healthMetrics.height));
        const heightUnit = healthMetrics.heightUnit?.toLowerCase() || 'cm';
        const heightInCm = heightUnit === 'in' || heightUnit === 'inch'
          ? heightValue * 2.54
          : heightValue;
        profileData.heightCm = heightInCm;

        const weightValue = parseFloat(String(healthMetrics.weight));
        const weightUnit = healthMetrics.weightUnit?.toLowerCase() || (weightValue > 100 ? 'lbs' : 'kg');
        const weightInKg = weightUnit === 'lbs' 
          ? weightValue * 0.453592 
          : weightValue;
        profileData.currentWeightKg = weightInKg;
        
        // Set target weight if not present (use ideal BMI)
        if (healthMetrics.bmi) {
          const heightM = heightInCm / 100;
          const idealBMI = 22;
          profileData.targetWeightKg = idealBMI * heightM * heightM;
        } else {
          profileData.targetWeightKg = weightInKg; // Default to current weight
        }
      }

      // Set defaults for required fields if not available
      if (!profileData.heightCm) profileData.heightCm = 170;
      if (!profileData.currentWeightKg) profileData.currentWeightKg = 70;
      if (!profileData.targetWeightKg) profileData.targetWeightKg = 70;
      
      profileData.fitnessLevel = 'intermediate';
      profileData.fitnessGoal = 'general_fitness';
      profileData.availableDays = ['Monday', 'Wednesday', 'Friday'];
      profileData.preferredWorkoutTime = 'morning';
      profileData.workoutDurationMinutes = 60;
      profileData.equipmentAvailable = ['Dumbbells', 'Bodyweight'];
      profileData.gymAccess = false;
      profileData.homeWorkoutOnly = true;
      profileData.dietaryRestrictions = [];
      profileData.dislikedExercises = [];
      profileData.favoriteExercises = [];

      // Save to user profile
      await personalCoachService.createOrUpdateProfile(profileData);
      
      // Invalidate chat context cache so AI knows about new health data
      try {
        await chatService.invalidateCache();
        console.log('Chat cache invalidated successfully');
      } catch (cacheErr) {
        console.warn('Failed to invalidate cache, but data was saved:', cacheErr);
      }
      
      // Pass data back to parent for chat message
      onDataSaved({
        ...extractedData,
        healthMetrics: healthMetrics,
      });
      
    } catch (err: any) {
      console.log('Error saving health data:', err);
      
      let errorMessage = ' I had trouble saving your health data. ';
      
      if (err.message?.includes('connection') || err.message?.includes('network')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again or contact support if the issue persists.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setExtractedData(null);
    setHealthMetrics({});
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2" style={{ borderColor: '#c8ead6' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Upload style={{ color: '#0a6a56', fontSize: 24 }} />
          <h3 className="font-bold text-lg" style={{ color: '#0a6a56' }}>
            Upload Health Lab Results
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
          style={{ color: '#0a6a56' }}
        >
          <Close fontSize="small" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm">
          <div className="prose prose-sm max-w-none text-red-700">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} className="text-red-600 hover:text-red-700 font-medium underline" />
                ),
                strong: ({ node, ...props }) => (
                  <strong {...props} className="font-bold text-red-800" />
                ),
                p: ({ node, ...props }) => (
                  <p {...props} className="mb-2 last:mb-0" />
                ),
              }}
            >
              {error}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {!extractedData && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${isDragging 
                  ? 'border-green-500 bg-green-50' 
                  : 'hover:bg-gray-50'
                }
              `}
              style={{ borderColor: isDragging ? '#0a6a56' : '#c8ead6' }}
            >
              <Upload style={{ fontSize: 48, color: '#0a6a56', opacity: isDragging ? 1 : 0.5 }} />
              <p className="mt-2 text-sm font-medium" style={{ color: '#0a6a56' }}>
                {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, PDF up to 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image/PDF Preview */}
              <div className="relative rounded-lg overflow-hidden border-2" style={{ borderColor: '#c8ead6' }}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-12 bg-gray-50">
                    <PictureAsPdf style={{ fontSize: 64, color: '#0a6a56', opacity: 0.5 }} />
                    <p className="text-sm font-medium text-gray-600">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">PDF Document</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 rounded-xl font-medium border-2 hover:bg-gray-50 transition-all"
                  style={{ borderColor: '#0a6a56', color: '#0a6a56' }}
                >
                  Choose Different Image
                </button>
                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 rounded-xl font-medium text-white hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: '#0a6a56' }}
                >
                  {isProcessing ? (
                    <>
                      <DotLottieReact
                        src="/animations/LoadingAI_Gen.lottie"
                        loop
                        autoplay
                        style={{ width: 20, height: 20 }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle fontSize="small" />
                      Process with AI
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extracted Data Review Section */}
      {extractedData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              Review extracted data and make corrections if needed:
            </p>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all flex items-center gap-1"
              style={{ color: '#0a6a56' }}
            >
              {isEditing ? <Cancel fontSize="small" /> : <Edit fontSize="small" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Data Fields - Organized by Category */}
          <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
            {/* Basic Information */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#0a6a56' }}>
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {healthMetrics.weight !== undefined && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Weight</label>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={healthMetrics.weight}
                          onChange={(e) => handleFieldChange('weight', parseFloat(e.target.value))}
                          className="flex-1 px-2 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                          style={{ borderColor: '#c8ead6' }}
                        />
                        <span className="px-2 py-1.5 text-sm text-gray-600">{healthMetrics.weightUnit}</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                        {healthMetrics.weight} {healthMetrics.weightUnit}
                      </div>
                    )}
                  </div>
                )}
                {healthMetrics.height !== undefined && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Height</label>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={healthMetrics.height}
                          onChange={(e) => handleFieldChange('height', parseFloat(e.target.value))}
                          className="flex-1 px-2 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                          style={{ borderColor: '#c8ead6' }}
                        />
                        <span className="px-2 py-1.5 text-sm text-gray-600">{healthMetrics.heightUnit}</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                        {healthMetrics.height} {healthMetrics.heightUnit}
                      </div>
                    )}
                  </div>
                )}
                {healthMetrics.age !== undefined && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Age</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={healthMetrics.age}
                        onChange={(e) => handleFieldChange('age', parseInt(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        style={{ borderColor: '#c8ead6' }}
                      />
                    ) : (
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.age}</div>
                    )}
                  </div>
                )}
                {healthMetrics.gender && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Gender</label>
                    <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm capitalize">{healthMetrics.gender}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Body Composition */}
            {(healthMetrics.bmi || healthMetrics.bodyFat || healthMetrics.skeletalMuscleMass) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#0a6a56' }}>
                  Body Composition
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {healthMetrics.bmi !== undefined && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">BMI</label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={healthMetrics.bmi}
                          onChange={(e) => handleFieldChange('bmi', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                          style={{ borderColor: '#c8ead6' }}
                        />
                      ) : (
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.bmi}</div>
                      )}
                    </div>
                  )}
                  {healthMetrics.bodyFat && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Body Fat</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={healthMetrics.bodyFat}
                          onChange={(e) => handleFieldChange('bodyFat', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                          style={{ borderColor: '#c8ead6' }}
                        />
                      ) : (
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.bodyFat}</div>
                      )}
                    </div>
                  )}
                  {healthMetrics.skeletalMuscleMass !== undefined && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Skeletal Muscle Mass</label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={healthMetrics.skeletalMuscleMass}
                          onChange={(e) => handleFieldChange('skeletalMuscleMass', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                          style={{ borderColor: '#c8ead6' }}
                        />
                      ) : (
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.skeletalMuscleMass} lbs</div>
                      )}
                    </div>
                  )}
                  {healthMetrics.leanBodyMass !== undefined && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Lean Body Mass</label>
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.leanBodyMass} lbs</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metabolism & Water */}
            {(healthMetrics.bmr || healthMetrics.totalBodyWater || healthMetrics.visceralFat !== undefined) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#0a6a56' }}>
                  Metabolism & Hydration
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {healthMetrics.bmr && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">BMR</label>
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.bmr}</div>
                    </div>
                  )}
                  {healthMetrics.visceralFat !== undefined && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Visceral Fat</label>
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.visceralFat} cm²</div>
                    </div>
                  )}
                  {healthMetrics.totalBodyWater !== undefined && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Total Body Water</label>
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.totalBodyWater} lbs</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Blood Work - If Available */}
            {(healthMetrics.cholesterol || healthMetrics.glucose || healthMetrics.bloodPressure || healthMetrics.heartRate) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#0a6a56' }}>
                  Blood Work & Vitals
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {healthMetrics.cholesterol !== undefined && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Cholesterol</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={healthMetrics.cholesterol}
                          onChange={(e) => handleFieldChange('cholesterol', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                          style={{ borderColor: '#c8ead6' }}
                        />
                      ) : (
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.cholesterol} mg/dL</div>
                      )}
                    </div>
                  )}
                  {healthMetrics.glucose !== undefined && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Glucose</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={healthMetrics.glucose}
                          onChange={(e) => handleFieldChange('glucose', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                          style={{ borderColor: '#c8ead6' }}
                        />
                      ) : (
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.glucose} mg/dL</div>
                      )}
                    </div>
                  )}
                  {healthMetrics.bloodPressure && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Blood Pressure</label>
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.bloodPressure}</div>
                    </div>
                  )}
                  {healthMetrics.heartRate !== undefined && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Heart Rate</label>
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{healthMetrics.heartRate} bpm</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t-2" style={{ borderColor: '#c8ead6' }}>
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 rounded-xl font-medium border-2 hover:bg-gray-50 transition-all"
              style={{ borderColor: '#0a6a56', color: '#0a6a56' }}
            >
              Upload New Image
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 rounded-xl font-medium text-white hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: '#0a6a56' }}
            >
              {isSaving ? (
                <>
                  <DotLottieReact
                    src="/animations/LoadingAI_Gen.lottie"
                    loop
                    autoplay
                    style={{ width: 20, height: 20 }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save fontSize="small" />
                  Save Health Data
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthDataUploadWidget;

