import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleAdminSuccess = () => {
    navigate('/admin-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isAdminLogin ? 'Admin Login' : isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
          </div>

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {isAdminLogin ? (
              <LoginForm onSuccess={handleAdminSuccess} isAdmin={true} />
            ) : isLogin ? (
              <LoginForm onSuccess={handleSuccess} />
            ) : (
              <RegisterForm onSuccess={handleSuccess} />
            )}

            <div className="mt-6 space-y-3">
              {!isAdminLogin && (
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full text-center text-sm text-green-600 hover:text-green-500"
                >
                  {isLogin
                    ? "Don't have an account? Register"
                    : 'Already have an account? Login'}
                </button>
              )}
              
              <button
                onClick={() => {
                  setIsAdminLogin(!isAdminLogin);
                  if (isAdminLogin) setIsLogin(true);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
              >
                {isAdminLogin 
                  ? 'Back to User Login' 
                  : 'Admin Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
