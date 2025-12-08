# MindfulMeals - React + Express Application

A comprehensive meal tracking and health monitoring platform built with React and Express.

## 🚀 Running Servers

Both servers are currently running:

- **Client (React)**: http://localhost:3000
- **Server (Express)**: http://localhost:5000

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── auth/      # Login & Register forms
│   │   │   ├── home/      # Hero & Animated banners
│   │   │   └── layout/    # Header & Footer
│   │   ├── contexts/      # AuthContext for user state
│   │   ├── lib/           # Firebase configuration
│   │   │   └── firebase/  # Auth & user profile functions
│   │   ├── pages/         # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── HealthMetricsPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── App.jsx        # Main app with routing
│   │   └── main.jsx       # Entry point
│   └── .env               # Environment variables
│
└── server/                # Express backend
    ├── src/
    │   ├── config/        # MongoDB configuration
    │   ├── routes/        # API routes
    │   │   ├── auth.js
    │   │   ├── users.js
    │   │   ├── meals.js
    │   │   └── admin.js
    │   └── server.js      # Express server
    └── .env               # Environment variables
```

## ✨ Features Implemented

### Frontend (React)
- ✅ Authentication (Login/Register with Firebase)
- ✅ Protected routes with AuthContext
- ✅ Dashboard with meal tracking
- ✅ Profile management
- ✅ Health metrics visualization with charts
- ✅ Admin panel for user management
- ✅ Responsive design with Tailwind CSS
- ✅ Smooth animations with Framer Motion
- ✅ Icons with Lucide React

### Backend (Express)
- ✅ RESTful API structure
- ✅ CORS enabled
- ✅ MongoDB configuration ready
- ✅ API routes for:
  - Authentication
  - User management
  - Meal tracking
  - Admin operations

## 🔧 Technologies Used

### Client
- React 18
- React Router DOM
- Firebase (Auth & Firestore)
- Axios
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React
- Vite

### Server
- Express
- MongoDB/Mongoose
- Firebase Admin
- CORS
- Dotenv
- Nodemon

## 📝 Available Pages

1. **Home** (`/`) - Landing page with hero banner and features
2. **Auth** (`/auth`) - Login and registration
3. **Dashboard** (`/dashboard`) - Meal tracking and daily stats
4. **Profile** (`/profile`) - User profile management
5. **Health Metrics** (`/health-metrics`) - Health tracking with charts
6. **Admin** (`/admin`) - Admin dashboard (admin role only)

## 🔐 Environment Variables

### Client (.env)
- Firebase configuration
- API URL (http://localhost:5000)

### Server (.env)
- PORT (5000)
- MongoDB connection string

## 🎯 Next Steps

To complete the application:

1. **Database Models**: Create Mongoose schemas for Users, Meals, and HealthMetrics
2. **API Implementation**: Replace TODO comments in routes with actual database operations
3. **Firebase Admin**: Set up Firebase Admin SDK for token verification
4. **Authentication Middleware**: Add middleware to protect API routes
5. **Error Handling**: Enhance error handling and validation
6. **Testing**: Add unit and integration tests

## 🛠️ Development Commands

### Client
```bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Server
```bash
cd server
npm run dev      # Start with nodemon
npm start        # Start production server
```

## 📦 Installation

If you need to reinstall dependencies:

```bash
# Client
cd client
npm install

# Server
cd server
npm install
```

---

Built with ❤️ for healthy living!
