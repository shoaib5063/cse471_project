'use client'

import React from 'react'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { CalorieTracker } from '../../components/dashboard/CalorieTracker'
import { MoodTracker } from '../../components/dashboard/MoodTracker'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Plus, TrendingUp, Award, Droplets } from 'lucide-react'

export default function DashboardPage() {
  const mockData = {
    dailyGoal: 2000,
    consumed: 1650,
    burned: 300,
    macros: {
      protein: 85,
      carbs: 180,
      fat: 65
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header isAuthenticated={true} userName="Sarah" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-electric mb-2">
                Good morning, Sarah! 🌅
              </h1>
              <p className="text-neutral-600">
                Ready to make today another healthy day? Let's track your progress.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="crimson">
                <Plus size={16} />
                Log Meal
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="w-12 h-12 gradient-lemonade rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} className="text-electric" />
            </div>
            <div className="text-2xl font-bold text-electric mb-1">7</div>
            <div className="text-sm text-neutral-600">Day Streak</div>
            <Badge variant="lemonade" size="sm" className="mt-2">
              On Fire! 🔥
            </Badge>
          </Card>
          
          <Card className="text-center">
            <div className="w-12 h-12 gradient-crimson rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award size={24} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-electric mb-1">12</div>
            <div className="text-sm text-neutral-600">Challenges Won</div>
            <Badge variant="crimson" size="sm" className="mt-2">
              Champion
            </Badge>
          </Card>
          
          <Card className="text-center">
            <div className="w-12 h-12 gradient-electric rounded-xl flex items-center justify-center mx-auto mb-3">
              <Droplets size={24} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-electric mb-1">6/8</div>
            <div className="text-sm text-neutral-600">Glasses Today</div>
            <Badge variant="electric" size="sm" className="mt-2">
              Almost There
            </Badge>
          </Card>
          
          <Card className="text-center">
            <div className="w-12 h-12 gradient-nights rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">🎯</span>
            </div>
            <div className="text-2xl font-bold text-electric mb-1">85%</div>
            <div className="text-sm text-neutral-600">Goal Progress</div>
            <Badge variant="nights" size="sm" className="mt-2">
              Excellent
            </Badge>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="space-y-8">
          {/* Calorie Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-electric mb-6">Nutrition Overview</h2>
            <CalorieTracker {...mockData} />
          </section>
          
          {/* Mood Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-electric mb-6">Mindful Moments</h2>
            <MoodTracker />
          </section>
          
          {/* Today's Insights */}
          <section>
            <h2 className="text-2xl font-bold text-electric mb-6">Today's Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card gradient="lemonade">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-electric mb-2">Nutrition Tip</h3>
                    <p className="text-electric/80 text-sm">
                      You're doing great with protein intake! Try adding more colorful 
                      vegetables to boost your vitamin intake.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card gradient="crimson">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Achievement</h3>
                    <p className="text-white/80 text-sm">
                      Congratulations! You've maintained your calorie goals for 
                      7 days straight. Keep up the amazing work!
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}