import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User } from 'lucide-react';
import axios from 'axios';

export default function HealthQuestionsPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: "Hello! I'm your health assistant. Ask me anything about nutrition, diet, or healthy eating habits!",
        },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        const userMessage = input.trim();
        setInput('');

        // Optimistically update UI
        const newMessages = [...messages, { type: 'user', text: userMessage }];
        setMessages(newMessages);
        setSending(true);

        try {
            // Prepare history for backend (exclude the latest user message which is sent separately)
            // Map frontend message format to what backend expects if needed, 
            // but here we just pass the raw array and let backend handle roles.
            const history = messages.map(m => ({
                role: m.type, // 'bot' or 'user'
                text: m.text
            }));

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/chatbot/message`,
                {
                    message: userMessage,
                    history: history,
                }
            );

            setMessages((prev) => [
                ...prev,
                { type: 'bot', text: response.data.botResponse },
            ]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [
                ...prev,
                {
                    type: 'bot',
                    text: "I'm sorry, I couldn't process your request. Please try again later.",
                },
            ]);
        } finally {
            setSending(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Health Assistant
                </h1>
                <p className="text-gray-600 mb-6">
                    Chat with our AI-powered health assistant for nutrition advice and
                    healthy eating tips.
                </p>

                {/* Chat Container */}
                <div className="flex-1 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden border border-gray-200">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''
                                    }`}
                            >
                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.type === 'user'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-blue-600 text-white'
                                        }`}
                                >
                                    {msg.type === 'user' ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.type === 'user'
                                        ? 'bg-green-600 text-white rounded-tr-none'
                                        : 'bg-gray-100 text-gray-900 rounded-tl-none'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {sending && (
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.1s' }}
                                        ></span>
                                        <span
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.2s' }}
                                        ></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={sendMessage}
                        className="p-4 border-t border-gray-200 bg-gray-50"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a health question..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={sending || !input.trim()}
                                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-900">
                        <strong>💡 Tip:</strong> Ask about calories, macros, meal planning,
                        or specific foods. For medical advice, please consult a healthcare
                        professional.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
