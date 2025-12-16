import { useState } from 'react';

const MoodTracker = ({ moodBefore, moodAfter, moodNotes, onMoodChange }) => {
  const moods = [
    { value: 'very_bad', emoji: '😞', label: 'Very Bad' },
    { value: 'bad', emoji: '😕', label: 'Bad' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'good', emoji: '😊', label: 'Good' },
    { value: 'excellent', emoji: '😄', label: 'Excellent' }
  ];

  return (
    <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="font-semibold text-purple-900 flex items-center gap-2">
        <span>🧠</span> Mood Tracking
      </h3>
      
      {/* Mood Before Meal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How do you feel before eating?
        </label>
        <div className="flex gap-2 flex-wrap">
          {moods.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => onMoodChange('moodBefore', mood.value)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                moodBefore === mood.value
                  ? 'border-purple-500 bg-purple-100 scale-105'
                  : 'border-gray-300 bg-white hover:border-purple-300'
              }`}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-xs mt-1">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood After Meal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How do you feel after eating?
        </label>
        <div className="flex gap-2 flex-wrap">
          {moods.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => onMoodChange('moodAfter', mood.value)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                moodAfter === mood.value
                  ? 'border-purple-500 bg-purple-100 scale-105'
                  : 'border-gray-300 bg-white hover:border-purple-300'
              }`}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-xs mt-1">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={moodNotes || ''}
          onChange={(e) => onMoodChange('moodNotes', e.target.value)}
          placeholder="Any thoughts about your emotional state? (e.g., stressed, happy, tired)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows="2"
        />
      </div>
    </div>
  );
};

export default MoodTracker;
