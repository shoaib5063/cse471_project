# Integration Examples - Meal Reminder Component

## Option 1: Add to ProfilePage (Recommended)

```jsx
// client/src/pages/ProfilePage.jsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MealReminderManager from '../components/reminders/MealReminderManager';

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Your existing profile content */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {userProfile?.name}'s Profile
          </h1>
          {/* ... other profile sections ... */}
        </div>

        {/* Add the Meal Reminder Manager */}
        <div className="bg-white rounded-lg shadow p-6">
          <MealReminderManager 
            userId={user.uid}
            userEmail={userProfile?.email || user.email}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

## Option 2: Add to DashboardPage

```jsx
// In the dashboard sidebar, add a new section:

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'meal-tracking', label: 'Meal Tracking', icon: ClipboardList, to: '/dashboard/meal-tracking' },
  { id: 'meal-plans', label: 'Meal Plans', icon: Utensils, to: '/dashboard/meal-plans' },
  { id: 'recipe-lab', label: 'Recipe Lab', icon: ChefHat, to: '/dashboard/recipe-lab' },
  { id: 'health-tips', label: 'Health Tips', icon: Lightbulb, to: '/dashboard/health-tips' },
  { id: 'reminders', label: 'Reminders', icon: Bell, to: '/dashboard/reminders' }, // NEW
];

// Then create a new section in the main content:

<section className="bg-white rounded-lg shadow p-6 mt-6">
  <MealReminderManager 
    userId={user.uid}
    userEmail={userProfile?.email || user.email}
  />
</section>
```

## Option 3: Create Dedicated Reminders Page

```jsx
// client/src/pages/RemindersPage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MealReminderManager from '../components/reminders/MealReminderManager';
import { Bell } from 'lucide-react';

export default function RemindersPage() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500">Settings</p>
            <h1 className="text-3xl font-bold text-gray-900">
              Meal Reminders
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Set up email notifications for your meals
            </p>
          </div>
          <Bell className="h-8 w-8 text-green-600" />
        </div>

        {/* Reminder Manager */}
        <div className="bg-white rounded-lg shadow p-6">
          <MealReminderManager 
            userId={user.uid}
            userEmail={userProfile?.email || user.email}
          />
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">⏰ Flexible Timing</h3>
            <p className="text-sm text-blue-800">
              Set reminders at any time that works for your schedule
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">📧 Email Notifications</h3>
            <p className="text-sm text-green-800">
              Receive beautiful email reminders to stay on track
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">✅ Easy Management</h3>
            <p className="text-sm text-purple-800">
              Turn reminders on/off or delete anytime
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

Then add to your router:
```jsx
import RemindersPage from './pages/RemindersPage';

// In your route config:
<Route path="/dashboard/reminders" element={<RemindersPage />} />
```

## Using the Component

### Basic Usage
```jsx
<MealReminderManager 
  userId={user.uid}
  userEmail={user.email}
/>
```

### Props
- `userId` (string, required): The Firebase user ID
- `userEmail` (string, required): The user's email for sending reminders

### Features Provided
- Create reminders for breakfast, lunch, dinner, snack
- Set custom reminder times
- Edit reminder times anytime
- Toggle reminders on/off
- Delete reminders
- View last sent time
- Beautiful error/success messages

## Email Example

When a reminder is triggered, users receive an email like:

```
Subject: 🍽️ Time for Breakfast!

Hi there!
It's time for your BREAKFAST!

Meal: Greek Yogurt Parfait
Type: Breakfast

Remember to:
- Eat mindfully and without distractions
- Chew slowly and enjoy your food
- Log your meal in MindfulMeals for tracking

[Log Your Meal Button]

---
You're receiving this because you set a reminder in MindfulMeals.
```

## Testing the Feature

### Quick Test Setup
1. Go to https://temp-mail.org for a temporary test email
2. Create a reminder with the test email
3. Set time 1 minute ahead
4. Wait for the email to arrive

### With Your Own Email
1. Create reminder with your real email
2. Set it for a few minutes from now
3. Check your inbox (including spam)

### Debugging
Add this to your server logs to debug:
```javascript
// In reminderScheduler.js
console.log('Checking reminders at:', new Date().toLocaleTimeString());
console.log('Active reminders:', reminders.length);
reminders.forEach(r => {
  console.log(`  - ${r.mealType} at ${r.reminderTime} for ${r.email}`);
});
```

## Common Integration Points

### In Settings/Account Page
Users manage reminders alongside other account settings

### In Navigation
Add Bell icon to main navigation that links to reminders

### Onboarding
Suggest setting reminders during user onboarding

### Meal Tracking
Quick link to create reminder for a meal after logging it

---

Choose the integration option that best fits your app's UX flow!
