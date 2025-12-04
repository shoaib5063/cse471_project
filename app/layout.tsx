import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '../contexts/AuthContext'

export const metadata: Metadata = {
  title: 'MindfulMeals - Healthy Eating Assistant',
  description: 'Track your meals, nourish your body, and discover mindful eating.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}