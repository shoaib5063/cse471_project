import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Heart, TrendingUp } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative bg-gradient-to-r from-green-400 to-blue-500 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl"
              >
                <span className="block">Welcome to</span>
                <span className="block">MindfulMeals</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-3 max-w-md mx-auto text-base text-white sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
              >
                Track your nutrition, monitor your health, and achieve your wellness goals with our comprehensive meal tracking platform.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
              >
                <div className="rounded-md shadow">
                  <Link
                    to="/auth"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3"
              >
                <div className="flex flex-col items-center">
                  <Utensils className="h-12 w-12 text-white mb-2" />
                  <h3 className="text-lg font-semibold text-white">Track Meals</h3>
                  <p className="text-white/80">Log your daily meals and nutrition</p>
                </div>
                <div className="flex flex-col items-center">
                  <Heart className="h-12 w-12 text-white mb-2" />
                  <h3 className="text-lg font-semibold text-white">Monitor Health</h3>
                  <p className="text-white/80">Keep track of your health metrics</p>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="h-12 w-12 text-white mb-2" />
                  <h3 className="text-lg font-semibold text-white">See Progress</h3>
                  <p className="text-white/80">Visualize your wellness journey</p>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
