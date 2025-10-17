import React, { useState } from 'react';
import chatService from '../../services/chatService';
import { Settings, WbSunny, LightMode, Nightlight, CalendarToday, CheckCircle, Close, Edit } from '@mui/icons-material';

interface PreferenceUpdateWidgetProps {
  sessionId: string;
  detectedChanges: {
    preferredWorkoutTime?: string;
    workoutDaysPerWeek?: number;
  };
  onPreferenceUpdated: () => void;
  onCancel: () => void;
}

const PreferenceUpdateWidget: React.FC<PreferenceUpdateWidgetProps> = ({
  sessionId,
  detectedChanges,
  onPreferenceUpdated,
  onCancel,
}) => {
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState(detectedChanges.preferredWorkoutTime || '');
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState(detectedChanges.workoutDaysPerWeek || 3);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsUpdating(true);
      setError(null);

      const updateData: any = { sessionId };
      if (preferredWorkoutTime) updateData.preferredWorkoutTime = preferredWorkoutTime;
      if (workoutDaysPerWeek) updateData.workoutDaysPerWeek = workoutDaysPerWeek;

      await chatService.updatePreferenceFromChat(updateData);

      onPreferenceUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update preference');
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = preferredWorkoutTime || workoutDaysPerWeek;

  return (
    <div className="bg-white border-2 rounded-2xl p-5 mb-4 shadow-lg" style={{ borderColor: '#c8ead6' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Settings style={{ color: '#0a6a56', fontSize: 32 }} />
          <h3 className="text-xl font-bold" style={{ color: '#0a6a56' }}>Update Workout Preferences</h3>
        </div>
        <div className="flex items-center gap-2">
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-3 py-1.5 rounded-lg border-2 hover:bg-gray-50 transition-all flex items-center gap-1.5 text-sm font-medium"
              style={{ borderColor: '#c8ead6', color: '#0a6a56' }}
            >
              <Edit style={{ fontSize: 16 }} />
              Edit
            </button>
          )}
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
          >
            <Close style={{ color: '#0a6a56', fontSize: 20 }} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-xl mb-3 text-sm flex items-center gap-2">
          <Close style={{ fontSize: 18 }} />
          {error}
        </div>
      )}

      <div className="space-y-3 mb-4">
        {editMode ? (
          <>
            {/* Editable Workout Time */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0a6a56' }}>
                Preferred Workout Time
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'morning', label: 'Morning', icon: <WbSunny /> },
                  { value: 'afternoon', label: 'Afternoon', icon: <LightMode /> },
                  { value: 'evening', label: 'Evening', icon: <Nightlight /> },
                ].map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setPreferredWorkoutTime(time.value)}
                    className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-1.5 text-sm font-medium ${
                      preferredWorkoutTime === time.value ? 'shadow-md' : 'hover:shadow-sm'
                    }`}
                    style={{
                      borderColor: preferredWorkoutTime === time.value ? '#0a6a56' : '#c8ead6',
                      background: preferredWorkoutTime === time.value ? '#0a6a5615' : 'white',
                      color: preferredWorkoutTime === time.value ? '#0a6a56' : '#0b3d33',
                    }}
                  >
                    {React.cloneElement(time.icon, { style: { fontSize: 18 } })}
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Days Per Week */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0a6a56' }}>
                Workout Days Per Week: <span>{workoutDaysPerWeek}</span>
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={workoutDaysPerWeek}
                onChange={(e) => setWorkoutDaysPerWeek(parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #0a6a56 0%, #0a6a56 ${((workoutDaysPerWeek - 1) / 6) * 100}%, #c8ead6 ${((workoutDaysPerWeek - 1) / 6) * 100}%, #c8ead6 100%)`
                }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#0b3d33', opacity: 0.6 }}>
                <span>1 day</span>
                <span>7 days</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Display Detected Changes */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
              <p className="text-sm font-semibold mb-3" style={{ color: '#0a6a56' }}>
                I detected the following preference changes:
              </p>
              {preferredWorkoutTime && (
                <div className="flex items-center gap-2 text-sm mb-2">
                  {preferredWorkoutTime === 'morning' && <WbSunny style={{ color: '#0a6a56', fontSize: 20 }} />}
                  {preferredWorkoutTime === 'afternoon' && <LightMode style={{ color: '#0a6a56', fontSize: 20 }} />}
                  {preferredWorkoutTime === 'evening' && <Nightlight style={{ color: '#0a6a56', fontSize: 20 }} />}
                  <span className="font-medium" style={{ color: '#0b3d33' }}>Workout Time:</span>
                  <span className="capitalize px-2 py-1 rounded-lg font-semibold" style={{ background: '#0a6a5620', color: '#0a6a56' }}>
                    {preferredWorkoutTime}
                  </span>
                </div>
              )}
              {workoutDaysPerWeek && (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarToday style={{ color: '#0a6a56', fontSize: 20 }} />
                  <span className="font-medium" style={{ color: '#0b3d33' }}>Days Per Week:</span>
                  <span className="px-2 py-1 rounded-lg font-semibold" style={{ background: '#0a6a5620', color: '#0a6a56' }}>
                    {workoutDaysPerWeek} {workoutDaysPerWeek === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        {editMode ? (
          <>
            <button
              onClick={() => setEditMode(false)}
              disabled={isUpdating}
              className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-gray-50 transition-all disabled:opacity-50"
              style={{ borderColor: '#c8ead6', color: '#0b3d33' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUpdating || !hasChanges}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: '#0a6a56' }}
            >
              {isUpdating ? (
                <>
                  <CheckCircle className="animate-pulse" fontSize="small" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle fontSize="small" />
                  Save Changes
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onCancel}
              disabled={isUpdating}
              className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-gray-50 transition-all disabled:opacity-50"
              style={{ borderColor: '#0a6a56', color: '#0a6a56' }}
            >
              No, Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUpdating || !hasChanges}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: '#0a6a56' }}
            >
              {isUpdating ? (
                <>
                  <CheckCircle className="animate-pulse" fontSize="small" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle fontSize="small" />
                  Yes, Confirm
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PreferenceUpdateWidget;

