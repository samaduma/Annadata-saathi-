// =========================
// Core React Imports
// =========================
import React, { useState, useRef, useEffect } from 'react';

// UI Icons
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';

// =========================
// API Configuration
// =========================
// Uses environment variable if available, otherwise falls back to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

/**
 * AskAI
 * --------------------------------------------------
 * Conversational AI interface for Government Scheme Guidance.
 *
 * Responsibilities:
 * 1. Load farmer profile (from props or API)
 * 2. Maintain conversational context
 * 3. Interact with AI backend for scheme recommendations
 * 4. Handle offline / quota-exceeded fallback gracefully
 * 5. Trigger scheme application submissions
 */
const AskAI = ({ profile: initialProfile, onApplicationSubmit }) => {

    // =========================
    // Core State
    // =========================
    const [profile, setProfile] = useState(initialProfile || null); // Farmer profile
    const [messages, setMessages] = useState([]);                  // Chat history
    const [input, setInput] = useState('');                        // User input field
    const [isLoading, setIsLoading] = useState(false);             // AI response loader

    // Reference to auto-scroll chat
    const messagesEndRef = useRef(null);

    // =========================
    // Auto-scroll Helper
    // =========================
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // ======================================================
    // LOAD PROFILE (If not provided via props)
    // ======================================================
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/feature4/profile?user_id=default`
                );
                const data = await response.json();
                if (data.profile) {
                    setProfile(data.profile);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        };

        if (!initialProfile) {
            loadProfile();
        }
    }, []);

    // ======================================================
    // SYNC PROFILE WHEN PROP CHANGES
    // ======================================================
    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
        }
    }, [initialProfile]);

    // ======================================================
    // INITIAL GREETING MESSAGE
    // ======================================================
    useEffect(() => {
        const greeting =
            `Namaste! I am your AI Scheme Advisor. ` +
            `${profile?.name ? `Welcome, ${profile.name}! ` : ''}` +
            `Tell me about your farming needs, and I'll recommend the best government schemes for you.`;

        if (messages.length === 0) {
            setMessages([{ role: 'agent', content: greeting }]);
        }
    }, [profile]);

    // ======================================================
    // AUTO-SCROLL ON NEW MESSAGE
    // ======================================================
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ======================================================
    // SEND MESSAGE HANDLER
    // ======================================================
    const handleSend = async () => {
        if (!input.trim()) return;

        // Append user message locally
        const userMsg = { role: 'user', content: input };
        const updatedMessages = [...messages, userMsg];

        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            // ----------------------------------
            // Refresh profile before sending
            // ----------------------------------
            let currentProfile = profile;
            try {
                const profileResponse = await fetch(
                    `${API_URL}/api/feature4/profile?user_id=default`
                );
                const profileData = await profileResponse.json();
                if (profileData.profile) {
                    currentProfile = profileData.profile;
                    setProfile(currentProfile);
                }
            } catch {
                // Fallback to cached profile
                console.log('Using cached profile');
            }

            // ----------------------------------
            // Convert history to backend format
            // ----------------------------------
            const history = updatedMessages.map(m => ({
                role: m.role === 'agent' ? 'assistant' : 'user',
                content: m.content
            }));

            // ----------------------------------
            // Send chat request
            // ----------------------------------
            const response = await fetch(`${API_URL}/api/feature4/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    history,
                    thread_id: 'demo-thread',
                    user_state: currentProfile || {}
                })
            });

            // Handle API failures (e.g., rate limits)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // ----------------------------------
            // Successful AI Response
            // ----------------------------------
            if (data && data.response) {
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'agent',
                        content: data.response,
                        schemes: data.found_schemes,
                        applicationStatus: data.application_status
                    }
                ]);

                // Notify parent if application submitted
                if (
                    data.application_status === 'submitted' &&
                    data.application_details &&
                    onApplicationSubmit
                ) {
                    onApplicationSubmit(data.application_details);
                }
            } else {
                throw new Error("Invalid API response format");
            }

        } catch (error) {
            // ==================================================
            // OFFLINE / FALLBACK AI MODE
            // ==================================================
            console.warn("Backend unavailable or quota exhausted, using mock AI response.");

            setTimeout(() => {
                let textResponse = "I am currently running in offline mode. ";
                const lowerInput = userMsg.content.toLowerCase();
                let mockApplication = null;

                if (lowerInput.includes("apply")) {
                    textResponse =
                        "Great! I have submitted your application for the scheme. " +
                        "You can track its status in the 'My Applications' tab. " +
                        "Reference No: APP-DEMO-2026.";

                    mockApplication = {
                        scheme_name: "PM-KISAN (Demo)",
                        applicant_name: profile?.name || "Farmer",
                        state: profile?.state || "Maharashtra",
                        status: "Submitted",
                        reference_no: "APP-DEMO-" + Math.floor(Math.random() * 1000)
                    };
                } else if (lowerInput.includes("tractor")) {
                    textResponse +=
                        "For tractors, subsidies are available under SMAM (25%–50%).";
                } else if (
                    lowerInput.includes("irrigation") ||
                    lowerInput.includes("water") ||
                    lowerInput.includes("pump")
                ) {
                    textResponse +=
                        "PM Krishi Sinchai Yojana offers up to 55% subsidy for drip and sprinkler systems.";
                } else if (
                    lowerInput.includes("insurance") ||
                    lowerInput.includes("loss")
                ) {
                    textResponse +=
                        "PM Fasal Bima Yojana covers crop loss due to natural calamities.";
                } else {
                    textResponse +=
                        "Most schemes require Aadhar, Bank Passbook, and Land Records (7/12).";
                }

                setMessages(prev => [
                    ...prev,
                    { role: 'agent', content: textResponse }
                ]);

                if (mockApplication && onApplicationSubmit) {
                    onApplicationSubmit(mockApplication);
                }

            }, 1500);

        } finally {
            setIsLoading(false);
        }
    };

    // ======================================================
    // ENTER KEY HANDLING
    // ======================================================
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ======================================================
    // SUGGESTED PROMPTS (Onboarding)
    // ======================================================
    const suggestedQuestions = [
        "What subsidies are available for tractors?",
        "I want to install solar pumps on my farm",
        "Any schemes for SC/ST farmers in Maharashtra?",
        "How to get subsidy for cold storage?"
    ];

    // ======================================================
    // UI RENDER
    // ======================================================
    return (
        <div className="flex flex-col h-full">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                            ${msg.role === 'user' ? 'bg-blue-500' : 'bg-organic-green'}`}>
                            {msg.role === 'user'
                                ? <User size={16} className="text-white" />
                                : <Bot size={16} className="text-white" />}
                        </div>

                        {/* Message Bubble */}
                        <div className={`max-w-[80%] rounded-2xl p-4
                            ${msg.role === 'user'
                                ? 'bg-blue-500/20 text-white rounded-tr-none'
                                : 'bg-white/10 text-gray-100 rounded-tl-none'}`}>
                            <div className="whitespace-pre-wrap">
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-organic-green flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                            <Loader2 className="animate-spin text-organic-green" size={20} />
                            <span className="text-gray-400 text-sm">
                                Analyzing schemes...
                            </span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Sparkles size={14} className="text-organic-green" />
                        Try asking:
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(q)}
                                className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10
                                           border border-white/10 rounded-full text-gray-300 transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-black/20 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask about subsidies, schemes, insurance..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3
                                   text-white placeholder-gray-400 focus:outline-none
                                   focus:ring-2 focus:ring-organic-green transition-all"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2 bg-organic-green hover:bg-green-600
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   rounded-xl text-white transition-colors
                                   flex items-center justify-center"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AskAI;
