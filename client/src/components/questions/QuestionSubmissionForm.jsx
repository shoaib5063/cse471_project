import React, { useState } from 'react';
import axios from 'axios';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function QuestionSubmissionForm({ userId, userEmail }) {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/questions`, {
                userId,
                userEmail,
                question
            });
            setSuccess('Question submitted! An expert will reply to your email.');
            setQuestion('');
        } catch (err) {
            console.error(err);
            setError('Failed to submit question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ask a Health Question</h3>

            {success && (
                <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Question
                    </label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. How much protein should I eat after a workout?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 h-32 resize-none"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        We'll send the answer to {userEmail}
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <Send className="h-4 w-4" />
                    {loading ? 'Sending...' : 'Submit Question'}
                </button>
            </form>
        </div>
    );
}
