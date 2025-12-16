import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MealTrackingPage from './pages/MealTrackingPage';
import MealPlansPage from './pages/MealPlansPage';
import RecipeLabPage from './pages/RecipeLabPage';
import HealthTipsPage from './pages/HealthTipsPage';
import ProfilePage from './pages/ProfilePage';
import HealthMetricsPage from './pages/HealthMetricsPage';
import AdminPage from './pages/AdminPage';
import HealthQuestionsPage from './pages/HealthQuestionsPage';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/meal-tracking" element={<MealTrackingPage />} />
          <Route path="/dashboard/meal-plans" element={<MealPlansPage />} />
          <Route path="/dashboard/recipe-lab" element={<RecipeLabPage />} />
          <Route path="/dashboard/health-tips" element={<HealthTipsPage />} />
          <Route path="/dashboard/questions" element={<HealthQuestionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/health-metrics" element={<HealthMetricsPage />} />
          <Route path="/admin" element={<AdminPage />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
