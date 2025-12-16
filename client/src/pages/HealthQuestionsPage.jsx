import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import QuestionSubmissionForm from '../components/questions/QuestionSubmissionForm';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HealthQuestionsPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading && !user) {
            navigate('/auth');
        }
    }, [user, loading, navigate]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Q&A</h1>
                <p className="text-gray-600 mb-6">
                    Have a question about your diet or health? Ask our experts and get a personalized reply via email.
                </p>

                <QuestionSubmissionForm userId={user.uid} userEmail={user.email} />

                <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
                    <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                        <li>Submit your detailed health question above.</li>
                        <li>Our nutrition experts review questions daily.</li>
                        <li>You will receive a comprehensive answer directly to <strong>{user.email}</strong>.</li>
                    </ul>
                </div>
            </main>
            <Footer />
        </div>
    );
}
