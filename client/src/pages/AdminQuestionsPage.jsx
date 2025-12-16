import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Send, Check, Clock, MessageSquare } from 'lucide-react';

export default function AdminQuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState({}); // Map of questionId -> reply text
    const [sending, setSending] = useState({}); // Map of questionId -> bool

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions`);
            setQuestions(response.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplyChange = (id, text) => {
        setReplyText(prev => ({ ...prev, [id]: text }));
    };

    const handleSendReply = async (questionId) => {
        const answer = replyText[questionId];
        if (!answer) return;

        setSending(prev => ({ ...prev, [questionId]: true }));
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/questions/${questionId}/reply`,
                { answer }
            );
            // Refresh list to show updated status
            await fetchQuestions();
            // Clear reply text
            setReplyText(prev => ({ ...prev, [questionId]: '' }));
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Failed to send reply');
        } finally {
            setSending(prev => ({ ...prev, [questionId]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin: Health Questions</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="space-y-6">
                        {questions.length === 0 && (
                            <p className="text-gray-500">No questions submitted yet.</p>
                        )}

                        {questions.map((q) => (
                            <div key={q._id} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className={`h-2 w-full ${q.status === 'answered' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${q.status === 'answered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {q.status}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                From: {q.userEmail} • {new Date(q.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{q.question}</h3>

                                    {q.status === 'answered' ? (
                                        <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <p className="text-sm font-semibold text-gray-700 mb-1">Answer:</p>
                                            <p className="text-gray-600">{q.answer}</p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Answered on {new Date(q.answeredAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Write Reply
                                            </label>
                                            <textarea
                                                value={replyText[q._id] || ''}
                                                onChange={(e) => handleReplyChange(q._id, e.target.value)}
                                                placeholder="Type your expert answer..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 h-24 mb-2"
                                            />
                                            <button
                                                onClick={() => handleSendReply(q._id)}
                                                disabled={sending[q._id] || !replyText[q._id]}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                                            >
                                                <Send className="h-4 w-4" />
                                                {sending[q._id] ? 'Sending...' : 'Send Reply via Email'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
