const dotenv = require('dotenv');
// Load environment variables immediately
dotenv.config();

// Trigger restart for user route creation

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { startReminderScheduler } = require('./services/reminderScheduler');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const app = express();

// Middleware
app.use(cors());
// Increase JSON and URL-encoded body size limits to allow base64 image uploads
// Base64 increases payload size ~33% so allow larger limits (30mb here)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/grocery', require('./routes/grocery'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/hydration', require('./routes/hydration'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/health', require('./routes/health'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
// Improved error handler: respect status codes (e.g., PayloadTooLarge -> 413)
app.use((err, req, res, next) => {
  console.error('Express error handler:', err && err.stack ? err.stack : err);
  // body-parser/raw-body sets statusCode or status to 413 for large payloads
  const status = err?.statusCode || err?.status || (err?.type === 'entity.too.large' ? 413 : 500);
  const message = (status === 413)
    ? 'Request payload too large. Try a smaller image (reduce dimensions or file size).'
    : (err?.message || 'Something went wrong!');
  res.status(status).json({ error: message });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5001;

// Attempt to start the server on a port, with a small fallback strategy
const maxAttempts = 3;
let attempt = 0;
let portToTry = DEFAULT_PORT;

function startApp(port) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    // Start the meal reminder scheduler once the server is listening
    startReminderScheduler();
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is already in use.`);
      attempt += 1;
      if (attempt >= maxAttempts) {
        console.error('❌ All port attempts failed. Exiting.');
        process.exit(1);
      }
      // Try the next port (increment by 1); if original attempt was 5000, prefer 5001
      portToTry = port === 5000 ? 5001 : port + 1;
      console.log(`➡️ Trying port ${portToTry} (attempt ${attempt + 1}/${maxAttempts})`);
      // Small delay before retrying to avoid rapid loops
      setTimeout(() => startApp(portToTry), 300);
    } else {
      // Unexpected error — rethrow so it surfaces
      throw err;
    }
  });
}

startApp(portToTry);
