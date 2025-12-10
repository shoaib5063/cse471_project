# Meal Reminder Feature Setup Guide

## Overview
This guide explains how to set up the meal reminder feature with SendGrid email notifications.

## Features
- ✅ Create reminders for breakfast, lunch, dinner, and snacks
- ✅ Set custom reminder times (24-hour format)
- ✅ Receive email notifications at scheduled times
- ✅ Toggle reminders on/off without deleting
- ✅ Update reminder times anytime
- ✅ Beautiful React UI for reminder management

## Architecture

### Backend Flow
```
User sets reminder → API stores in MongoDB → Scheduler runs every minute
→ Checks if reminder time matches current time → Sends email via SendGrid
→ Updates lastSentAt to prevent duplicate sends
```

### Components

1. **MealReminder Model** (`server/src/models/MealReminder.js`)
   - Stores reminder configurations
   - Tracks last sent time to prevent duplicates

2. **Email Service** (`server/src/services/emailService.js`)
   - Integrates with SendGrid API
   - Creates beautiful HTML email templates
   - Sends reminder emails to users

3. **Reminder Scheduler** (`server/src/services/reminderScheduler.js`)
   - Runs every minute (cron job)
   - Checks all active reminders
   - Triggers email sends when time matches

4. **Reminder Controller** (`server/src/controllers/reminderController.js`)
   - CRUD operations for reminders
   - Validation and error handling

5. **Frontend Component** (`client/src/components/reminders/MealReminderManager.jsx`)
   - Full UI for managing reminders
   - Create, update, delete, toggle operations
   - Real-time feedback with success/error messages

## Setup Instructions

### Step 1: Get SendGrid API Key
1. Go to https://sendgrid.com
2. Sign up for a free account
3. Navigate to Settings → API Keys
4. Create a new API key with Mail Send permissions
5. Copy the API key

### Step 2: Update Environment Variables

**`server/.env`** (create if not exists):
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@mindfulmeals.com
APP_URL=http://localhost:3000
```

**Important**: 
- Replace `your_sendgrid_api_key_here` with your actual SendGrid API key
- Replace `noreply@mindfulmeals.com` with your SendGrid verified sender email
- Make sure `SENDGRID_FROM_EMAIL` is a verified sender in SendGrid account

### Step 3: Install Dependencies
```bash
cd server
npm install
```

This installs:
- `@sendgrid/mail` - SendGrid email service
- `node-cron` - Scheduler for reminder checks

### Step 4: Start the Server
```bash
cd server
PORT=5001 npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5001
🔔 Starting meal reminder scheduler...
✅ Meal reminder scheduler started (checks every minute)
```

### Step 5: Integrate Component in Dashboard

Add the reminder manager to your dashboard (e.g., `ProfilePage.jsx` or `DashboardPage.jsx`):

```jsx
import MealReminderManager from '../components/reminders/MealReminderManager';

// Inside your component:
<MealReminderManager 
  userId={user.uid} 
  userEmail={userProfile.email}
/>
```

## API Endpoints

### Create Reminder
```
POST /api/reminders
Body: {
  userId: "user_id",
  mealType: "breakfast",        // breakfast, lunch, dinner, snack
  reminderTime: "08:00",        // HH:mm format (24-hour)
  mealName: "Oatmeal",          // optional
  email: "user@example.com"
}
```

### Get User Reminders
```
GET /api/reminders/user/:userId
```

### Update Reminder
```
PUT /api/reminders/:reminderId
Body: {
  reminderTime: "09:00",
  mealName: "Updated Meal",
  isActive: true,
  email: "newemail@example.com"
}
```

### Toggle Reminder (on/off)
```
PATCH /api/reminders/:reminderId/toggle
```

### Delete Reminder
```
DELETE /api/reminders/:reminderId
```

## How Reminders Work

1. **User sets reminder**: "Send me a breakfast reminder at 08:00"
2. **Reminder stored**: Saved in MongoDB with userId, mealType, time, etc.
3. **Scheduler runs**: Every minute, the cron job checks all active reminders
4. **Time match**: When current time matches reminder time AND reminder hasn't been sent today
5. **Email sent**: Beautiful HTML email sent via SendGrid to user
6. **Prevention**: lastSentAt timestamp prevents duplicate emails on same day

## Email Template

The email includes:
- Meal type with emoji
- Meal name
- Motivational tips
- Link to log meal in app
- Professional styling

## Testing

### Manual Test
1. Create a reminder for 5 minutes from now
2. Wait for the scheduled time
3. Check your email inbox (check spam folder too)
4. Verify the beautiful HTML email arrives

### Test with Shorter Interval
To test more frequently, you can temporarily change the scheduler in `reminderScheduler.js`:
```javascript
// Instead of: cron.schedule('* * * * *', ...)  // every minute
// Use: cron.schedule('*/10 * * * * *', ...)    // every 10 seconds (for testing)
```

## Troubleshooting

### Emails Not Sending

1. **Check SendGrid API Key**:
   - Verify key is correct in `.env`
   - Verify key has "Mail Send" permission

2. **Check From Email**:
   - Must be a verified sender in SendGrid account
   - Not just any email address

3. **Check Server Logs**:
   - Look for error messages in terminal
   - Should show `✅ Meal reminder email sent to...` on success

4. **Check Email Spam**:
   - Emails might be in spam folder
   - SendGrid domain reputation may need time

5. **Verify MongoDB Connection**:
   - Ensure reminders are being saved
   - Check MongoDB has reminder documents

### Reminders Not Created

1. Check the API response for validation errors
2. Verify `reminderTime` format is `HH:mm`
3. Ensure userId and email are provided
4. Check for duplicate reminders (one per meal type per user)

## Production Deployment

When deploying to production:

1. **SendGrid**:
   - Use production SendGrid account
   - Verify domain with DKIM/SPF for better deliverability
   - Set from email to your domain

2. **Environment Variables**:
   - Store API keys securely (never in git)
   - Use environment configuration management
   - Different keys for dev/production if needed

3. **Monitoring**:
   - Log email send successes/failures
   - Monitor SendGrid dashboard
   - Set up alerts for failed sends

4. **Scheduler**:
   - Ensure only one instance runs (if multiple servers)
   - Use distributed locks if needed

## Future Enhancements

- [ ] SMS reminders via Twilio
- [ ] Push notifications for mobile app
- [ ] Recurring reminders (weekdays only, etc.)
- [ ] Reminder templates/suggestions
- [ ] Integration with calendar apps
- [ ] Meal timing analytics
