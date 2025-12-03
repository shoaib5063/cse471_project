'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, Plus, Clock, Utensils } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'

interface MealLoggerProps {
  onMealLogged?: (meal: any) => void
}

export const MealLogger: React.FC<MealLoggerProps> = ({ onMealLogged }) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'manual'>('photo')
  const [mealType, setMealType] = useState<string>('breakfast')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [mealTitle, setMealTitle] = useState<string>('')
  const [mealNotes, setMealNotes] = useState<string>('')
  
  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'lemonade' },
    { id: 'lunch', label: 'Lunch', icon: '☀️', color: 'electric' },
    { id: 'dinner', label: 'Dinner', icon: '🌙', color: 'nights' },
    { id: 'snack', label: 'Snack', icon: '🍎', color: 'crimson' }
  ]
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleMealSubmit = () => {
    const mealData = {
      type: mealType,
      title: mealTitle,
      notes: mealNotes,
      image: selectedImage,
      timestamp: new Date().toISOString(),
      method: activeTab
    }
    
    onMealLogged?.(mealData)
    
    // Reset form
    setMealTitle('')
    setMealNotes('')
    setSelectedImage(null)
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-electric">Log Your Meal</h2>
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <Clock size={16} />
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      
      {/* Meal Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Meal Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mealTypes.map((type) => (
            <motion.button
              key={type.id}
              onClick={() => setMealType(type.id)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                mealType === type.id
                  ? `border-${type.color} bg-${type.color}/10`
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className={`text-sm font-medium ${
                mealType === type.id ? `text-${type.color}` : 'text-neutral-600'
              }`}>
                {type.label}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Logging Method Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-neutral-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'photo'
                ? 'bg-white text-electric shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <Camera size={16} className="inline mr-2" />
            Photo Upload
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'manual'
                ? 'bg-white text-electric shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <Utensils size={16} className="inline mr-2" />
            Manual Entry
          </button>
        </div>
      </div>
      
      {/* Photo Upload Tab */}
      {activeTab === 'photo' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Image Upload Area */}
          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-lemonade transition-colors duration-200">
            {selectedImage ? (
              <div className="space-y-4">
                <img
                  src={selectedImage}
                  alt="Uploaded meal"
                  className="max-w-full h-48 object-cover rounded-lg mx-auto"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload size={48} className="mx-auto text-neutral-400" />
                <div>
                  <p className="text-lg font-medium text-neutral-700 mb-2">
                    Upload a photo of your meal
                  </p>
                  <p className="text-sm text-neutral-500 mb-4">
                    Drag and drop or click to browse
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="meal-image"
                  />
                  <label htmlFor="meal-image">
                    <Button variant="lemonade" size="sm" className="cursor-pointer">
                      <Camera size={16} />
                      Choose Photo
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Food Item"
              placeholder="e.g., Grilled Chicken Salad"
              value={mealTitle}
              onChange={(e) => setMealTitle(e.target.value)}
            />
            <Input
              label="Calories (optional)"
              type="number"
              placeholder="e.g., 350"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Protein (g)"
              type="number"
              placeholder="25"
            />
            <Input
              label="Carbs (g)"
              type="number"
              placeholder="15"
            />
            <Input
              label="Fat (g)"
              type="number"
              placeholder="12"
            />
          </div>
        </motion.div>
      )}
      
      {/* Common Fields */}
      <div className="space-y-4 mt-6">
        <Input
          label="Meal Title"
          placeholder="Give your meal a name..."
          value={mealTitle}
          onChange={(e) => setMealTitle(e.target.value)}
        />
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-lemonade/50 focus:border-lemonade transition-all duration-200"
            rows={3}
            placeholder="How did it taste? How did you feel?"
            value={mealNotes}
            onChange={(e) => setMealNotes(e.target.value)}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex space-x-3 mt-6">
        <Button
          variant="crimson"
          className="flex-1"
          onClick={handleMealSubmit}
          disabled={!mealTitle.trim()}
        >
          <Plus size={16} />
          Log Meal
        </Button>
        <Button variant="outline" className="px-6">
          Save Draft
        </Button>
      </div>
      
      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-lemonade/10 to-electric/10 rounded-xl">
        <h4 className="font-semibold text-electric mb-2">💡 Quick Tips</h4>
        <ul className="text-sm text-neutral-600 space-y-1">
          <li>• Take photos in good lighting for better recognition</li>
          <li>• Include portion sizes in your notes</li>
          <li>• Log meals right after eating for accuracy</li>
        </ul>
      </div>
    </Card>
  )
}