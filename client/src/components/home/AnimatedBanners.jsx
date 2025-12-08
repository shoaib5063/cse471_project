import React from 'react';
import { motion } from 'framer-motion';

const banners = [
  {
    title: 'Nutrition Tracking',
    description: 'Monitor your daily calorie intake and macronutrients',
    gradient: 'gradient-crimson',
  },
  {
    title: 'Health Metrics',
    description: 'Track weight, BMI, and other vital health indicators',
    gradient: 'gradient-lemonade',
  },
  {
    title: 'Smart Analytics',
    description: 'Get insights and recommendations based on your data',
    gradient: 'gradient-electric',
  },
  {
    title: 'Goal Setting',
    description: 'Set and achieve your personalized wellness goals',
    gradient: 'gradient-nights',
  },
];

export default function AnimatedBanners() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Everything You Need for Healthy Living
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Powerful features to help you achieve your wellness goals
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {banners.map((banner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`${banner.gradient} rounded-lg shadow-lg p-6 text-white`}
            >
              <h3 className="text-xl font-bold mb-2">{banner.title}</h3>
              <p className="text-white/90">{banner.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
