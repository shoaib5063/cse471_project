'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileForm } from '../../components/profile/ProfileForm';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ProfileForm />
    </div>
  );
}
