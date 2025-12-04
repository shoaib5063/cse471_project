'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Utensils, Heart, Target, TrendingUp, Apple, Droplets, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const AnimatedBanners: React.FC = () => {
  const router = useRouter()
  
  const horizontalBanners = [
    {
      icon: Utensils,
      title: "Smart Meal Tracking",
      description: "Upload photos or manually log your meals with ease",
      gradient: "gradient-lemonade",
      textColor: "text-electric"
    },
    {
      icon: Heart,
      title: "Mindful Eating",
      description: "Connect with your emotions and build healthy habits",
      gradient: "gradient-crimson",
      textColor: "text-white"
    },
    {
      icon: Target,
      title: "Personalized Goals",
      description: "AI-powered insights tailored to your health journey",
      gradient: "gradient-electric",
      textColor: "text-white"
    }
  ]
  
  const verticalBanners = [
    {
      icon: Activity,
      title: "Health Metrics",
      description: "BMI and daily calorie goals calculated based on your data",
      gradient: "gradient-electric",
      textColor: "text-white",
      link: "/health-metrics"
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Visualize your nutrition trends and improvements",
      gradient: "gradient-nights",
      textColor: "text-white",
      link: null
    },
    {
      icon: Apple,
      title: "Recipe Discovery",
      description: "Explore healthy recipes matched to your preferences",
      gradient: "gradient-lemonade",
      textColor: "text-electric",
      link: null
    },
    {
      icon: Droplets,
      title: "Hydration Tracking",
      description: "Stay hydrated with smart reminders and goals",
      gradient: "gradient-crimson",
      textColor: "text-white",
      link: null
    }
  ]
  
  return (
    <section className="py-20 bg-gradient-to-b from-white to-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-electric mb-4">
            Everything You Need for
            <span className="block gradient-crimson bg-clip-text text-transparent">
              Mindful Nutrition
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Discover powerful features designed to transform your eating habits and wellness journey
          </p>
        </motion.div>
        
        {/* Horizontal Sliding Banners */}
        <div className="mb-16 overflow-hidden">
          <motion.div 
            className="flex space-x-6"
            animate={{ x: [0, -100, 0] }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...horizontalBanners, ...horizontalBanners].map((banner, index) => (
              <motion.div
                key={index}
                className={`flex-shrink-0 w-80 h-48 ${banner.gradient} rounded-2xl p-6 flex flex-col justify-between`}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <banner.icon size={24} className={banner.textColor} />
                  </div>
                  <h3 className={`text-xl font-bold ${banner.textColor}`}>
                    {banner.title}
                  </h3>
                </div>
                <p className={`${banner.textColor} opacity-90 text-sm leading-relaxed`}>
                  {banner.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Vertical Sliding Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-96">
          {verticalBanners.map((banner, index) => (
            <div key={index} className="overflow-hidden rounded-2xl">
              <motion.div
                className={`h-full ${banner.gradient} p-6 flex flex-col justify-between ${banner.link ? 'cursor-pointer' : ''}`}
                animate={{ y: [0, -20, 0] }}
                transition={{ 
                  duration: 4 + index, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
                whileHover={{ scale: 1.02 }}
                onClick={() => banner.link && router.push(banner.link)}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <banner.icon size={32} className={banner.textColor} />
                  </div>
                  <h3 className={`text-2xl font-bold ${banner.textColor}`}>
                    {banner.title}
                  </h3>
                </div>
                <p className={`${banner.textColor} opacity-90 leading-relaxed`}>
                  {banner.description}
                </p>
                {banner.link && (
                  <div className={`${banner.textColor} text-sm font-semibold flex items-center`}>
                    View Details →
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>
        
        {/* Floating Stats */}
        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {[
            { number: "2M+", label: "Calories Tracked", color: "text-crimson" },
            { number: "15K+", label: "Recipes Shared", color: "text-lemonade" },
            { number: "98%", label: "User Satisfaction", color: "text-electric" },
            { number: "24/7", label: "AI Support", color: "text-nights" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.number}
              </div>
              <div className="text-neutral-600 text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}