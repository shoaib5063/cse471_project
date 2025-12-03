'use client'

import React from 'react'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { MealLogger } from '../../components/meals/MealLogger'

export default function MealsPage() {
  const handleMealLogged = (mealData: any) => {
    console.log('Meal logged:', mealData)
    // Here you would typically send the data to your backend
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header isAuthenticated={true} userName="Sarah" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-electric mb-4">
            Log Your Meal
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Capture your food journey with photos or detailed entries. 
            Every meal is a step towards mindful eating.
          </p>
        </div>
        
        <MealLogger onMealLogged={handleMealLogged} />
      </main>
      
      <Footer />
    </div>
  )
}