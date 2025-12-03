'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Smile, Frown, Meh, Heart, Zap, Coffee, Moon } from 'lucide-react'

interface MoodEntry {
  id: string
  mood: string
  energy: number
  time: string
  meal: string
  notes?: string
}

export const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [energyLevel, setEnergyLevel] = useState<number>(3)
  
  const moods = [
    { id: 'happy', label: 'Happy', icon: Smile, color: 'lemonade' },
    { id: 'neutral', label: 'Neutral', icon: Meh, color: 'electric' },
    { id: 'sad', label: 'Sad', icon: Frown, color: 'crimson' },
    { id: 'energetic', label: 'Energetic', icon: Zap, color: 'lemonade' },
    { id: 'tired', label: 'Tired', icon: Moon, color: 'nights' },
    { id: 'stressed', label: 'Stressed', icon: Coffee, color: 'crimson' }
  ]
  
  const recentEntries: MoodEntry[] = [
    {
      id: '1',
      mood: 'happy',
      energy: 4,
      time: '2:30 PM',
      meal: 'Lunch',
      notes: 'Felt great after the salad!'
    },
    {
      id: '2',
      mood: 'energetic',
      energy: 5,
      time: '8:00 AM',
      meal: 'Breakfast',
      notes: 'Perfect start with oatmeal'
    },
    {
      id: '3',
      mood: 'tired',
      energy: 2,
      time: '6:00 PM',
      meal: 'Dinner',
      notes: 'Heavy meal made me sleepy'
    }
  ]
  
  const getMoodIcon = (moodId: string) => {
    const mood = moods.find(m => m.id === moodId)
    return mood ? mood.icon : Meh
  }
  
  const getMoodColor = (moodId: string) => {
    const mood = moods.find(m => m.id === moodId)
    return mood ? mood.color : 'neutral'
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mood Logger */}
      <Card>
        <h3 className="text-xl font-bold text-electric mb-6">How are you feeling?</h3>
        
        <div className="space-y-6">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Select your mood
            </label>
            <div className="grid grid-cols-3 gap-3">
              {moods.map((mood) => {
                const IconComponent = mood.icon
                return (
                  <motion.button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedMood === mood.id
                        ? `border-${mood.color} bg-${mood.color}/10`
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconComponent 
                      size={24} 
                      className={`mx-auto mb-2 ${
                        selectedMood === mood.id ? `text-${mood.color}` : 'text-neutral-400'
                      }`} 
                    />
                    <div className={`text-xs font-medium ${
                      selectedMood === mood.id ? `text-${mood.color}` : 'text-neutral-600'
                    }`}>
                      {mood.label}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
          
          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Energy Level: {energyLevel}/5
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    level <= energyLevel
                      ? 'bg-lemonade'
                      : 'bg-neutral-200 hover:bg-neutral-300'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lemonade/50 focus:border-lemonade"
              rows={3}
              placeholder="How did this meal make you feel?"
            />
          </div>
          
          <Button variant="lemonade" className="w-full">
            <Heart size={16} />
            Log Mood
          </Button>
        </div>
      </Card>
      
      {/* Recent Entries */}
      <Card>
        <h3 className="text-xl font-bold text-electric mb-6">Recent Mood Entries</h3>
        
        <div className="space-y-4">
          {recentEntries.map((entry) => {
            const IconComponent = getMoodIcon(entry.mood)
            const moodColor = getMoodColor(entry.mood)
            
            return (
              <motion.div
                key={entry.id}
                className="p-4 bg-neutral-50 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-${moodColor}/20 rounded-full flex items-center justify-center`}>
                      <IconComponent size={20} className={`text-${moodColor}`} />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-800 capitalize">
                        {entry.mood}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {entry.time} • {entry.meal}
                      </div>
                    </div>
                  </div>
                  <Badge variant={moodColor as any}>
                    Energy: {entry.energy}/5
                  </Badge>
                </div>
                {entry.notes && (
                  <p className="text-sm text-neutral-600 mt-2 italic">
                    "{entry.notes}"
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
        
        {/* Mood Insights */}
        <div className="mt-6 p-4 bg-gradient-to-r from-lemonade/10 to-electric/10 rounded-xl">
          <h4 className="font-semibold text-electric mb-2">💡 Insight</h4>
          <p className="text-sm text-neutral-600">
            You tend to feel more energetic after lighter meals. Consider having 
            salads or fruits for sustained energy throughout the day.
          </p>
        </div>
      </Card>
    </div>
  )
}