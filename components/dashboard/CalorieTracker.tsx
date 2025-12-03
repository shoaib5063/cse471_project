'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { Badge } from '../ui/Badge'
import { Flame, Target, TrendingUp, TrendingDown } from 'lucide-react'

interface CalorieTrackerProps {
  dailyGoal: number
  consumed: number
  burned: number
  macros: {
    protein: number
    carbs: number
    fat: number
  }
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({
  dailyGoal,
  consumed,
  burned,
  macros
}) => {
  const remaining = dailyGoal - consumed + burned
  const progress = (consumed / dailyGoal) * 100
  
  const macroData = [
    { name: 'Protein', value: macros.protein, color: '#D7263D' },
    { name: 'Carbs', value: macros.carbs, color: '#B8FB3C' },
    { name: 'Fat', value: macros.fat, color: '#03045E' }
  ]
  
  const weeklyData = [
    { day: 'Mon', calories: 1850 },
    { day: 'Tue', calories: 2100 },
    { day: 'Wed', calories: 1950 },
    { day: 'Thu', calories: 2200 },
    { day: 'Fri', calories: 1800 },
    { day: 'Sat', calories: 2300 },
    { day: 'Sun', calories: consumed }
  ]
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Calorie Counter */}
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-electric">Daily Calories</h3>
          <Badge variant={progress > 100 ? 'crimson' : progress > 80 ? 'lemonade' : 'electric'}>
            {progress > 100 ? 'Over Goal' : progress > 80 ? 'On Track' : 'Under Goal'}
          </Badge>
        </div>
        
        <div className="space-y-6">
          {/* Progress Ring */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e5e5"
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#B8FB3C"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 40 * (1 - Math.min(progress / 100, 1))
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-electric">{consumed}</span>
                <span className="text-sm text-neutral-500">of {dailyGoal}</span>
                <span className="text-xs text-neutral-400">calories</span>
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <Target className="text-electric" size={20} />
              </div>
              <div className="text-lg font-bold text-electric">{dailyGoal}</div>
              <div className="text-xs text-neutral-500">Goal</div>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <Flame className="text-crimson" size={20} />
              </div>
              <div className="text-lg font-bold text-crimson">{burned}</div>
              <div className="text-xs text-neutral-500">Burned</div>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                {remaining > 0 ? (
                  <TrendingUp className="text-lemonade" size={20} />
                ) : (
                  <TrendingDown className="text-crimson" size={20} />
                )}
              </div>
              <div className={`text-lg font-bold ${remaining > 0 ? 'text-lemonade' : 'text-crimson'}`}>
                {Math.abs(remaining)}
              </div>
              <div className="text-xs text-neutral-500">
                {remaining > 0 ? 'Remaining' : 'Over'}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Macro Breakdown */}
      <Card>
        <h3 className="text-xl font-bold text-electric mb-4">Macros Today</h3>
        <div className="space-y-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {macroData.map((macro) => (
              <div key={macro.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: macro.color }}
                  />
                  <span className="text-sm font-medium">{macro.name}</span>
                </div>
                <span className="text-sm font-bold">{macro.value}g</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Weekly Trend */}
      <Card className="lg:col-span-3">
        <h3 className="text-xl font-bold text-electric mb-4">Weekly Calorie Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calories" fill="#B8FB3C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}