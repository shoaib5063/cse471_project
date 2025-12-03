'use client'

import React from 'react'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { HeroBanner } from '../components/home/HeroBanner'
import { AnimatedBanners } from '../components/home/AnimatedBanners'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header isAuthenticated={false} />
      <main>
        <HeroBanner />
        <AnimatedBanners />
      </main>
      <Footer />
    </div>
  )
}