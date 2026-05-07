import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoiceStore, useLanguageStore } from '../../store/themeStore';
import { getNavigationIntent } from '../../services/llmService';

const VoiceFloatingButton = () => {
    const {
        isListening,
        startListening,
        stopListening,
        transcript,
        setTranscript,
        isProcessing,
        setIsProcessing,
        feedback,
        setFeedback
    } = useVoiceStore();

    const { language } = useLanguageStore();
    const navigate = useNavigate();
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Stop after one command
            recognitionRef.current.interimResults = true;

            // Set language based on store or default to English/Hindi mix
            // Note: Modern browsers support switching, but 'en-IN' often captures both fairly well for Hinglish
            recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : (language === 'mr' ? 'mr-IN' : 'en-US');

            recognitionRef.current.onstart = () => {
                // Already handled by store, but double check
            };

            recognitionRef.current.onresult = (event) => {
                // Clear silence timer on every result
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);

                // Set a timer to detect end of speech if user stops talking
                silenceTimerRef.current = setTimeout(() => {
                    recognitionRef.current.stop();
                }, 2000);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setFeedback("Error listening. Please try again.");
                stopListening();
                setIsProcessing(false);
            };

            recognitionRef.current.onend = async () => {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                // Only process if we have a significant transcript and were actually listening
                // (This check helps avoid processing empty "end" events)
                const finalTranscript = useVoiceStore.getState().transcript;

                if (finalTranscript && finalTranscript.trim().length > 0) {
                    stopListening(); // Ensure UI updates
                    setIsProcessing(true);
                    setFeedback("Thinking...");

                    const result = await getNavigationIntent(finalTranscript);

                    setFeedback(result.feedback);

                    if (result.targetPath) {
                        // Small delay to let user read feedback before moving
                        setTimeout(() => {
                            navigate(result.targetPath);
                            setIsProcessing(false);
                            // Optional: clear feedback after navigation
                            setTimeout(() => setFeedback(''), 3000);
                        }, 1500);
                    } else {
                        setIsProcessing(false);
                        setTimeout(() => setFeedback(''), 3000);
                    }

                } else {
                    stopListening();
                    setFeedback(""); // Clear if empty
                }
            };
        } else {
            setFeedback("Voice navigation not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [language, navigate, setFeedback, setIsProcessing, setTranscript, stopListening]);


    const handleToggle = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            stopListening();
        } else {
            setTranscript('');
            setFeedback('Listening...');
            startListening();
            recognitionRef.current?.start();
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">

            <AnimatePresence>
                {(isListening || isProcessing || feedback) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="bg-dark-navy/90 backdrop-blur-md border border-organic-green/30 p-4 rounded-xl shadow-2xl mb-2 max-w-xs text-right"
                    >
                        {/* Status Header */}
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-xs uppercase tracking-wider text-organic-green font-bold">
                                {isProcessing ? 'AI Processing' : isListening ? 'Listening' : 'Assistant'}
                            </span>
                            {isProcessing && <Loader2 className="animate-spin w-3 h-3 text-organic-green" />}
                        </div>

                        {/* Transcript / Feedback */}
                        <p className="text-white text-sm font-medium leading-relaxed">
                            {feedback || transcript || "..."}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative">
                {/* Pulse Effect */}
                <AnimatePresence>
                    {isListening && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1.5, 2, 1.5] }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 bg-neon-green rounded-full opacity-20 blur-xl pointer-events-none"
                            transition={{
                                duration: 1.5,
                                ease: "easeInOut",
                                repeat: Infinity,
                                repeatType: "loop"
                            }}
                        />
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggle}
                    disabled={isProcessing}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all border-2 z-10 ${isListening
                        ? 'bg-organic-green border-neon-green text-dark-navy shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                        : isProcessing
                            ? 'bg-dark-navy border-organic-green text-organic-green cursor-wait'
                            : 'bg-dark-navy border-white/10 text-white hover:border-organic-green'
                        }`}
                >
                    {isProcessing ? (
                        <Navigation className="animate-pulse" size={28} />
                    ) : isListening ? (
                        <Mic className="animate-pulse" size={28} />
                    ) : (
                        <Mic size={28} />
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default VoiceFloatingButton;
