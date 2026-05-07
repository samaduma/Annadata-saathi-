import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'farmer' // Default
    });

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8002';

        try {
            const payload = mode === 'login'
                ? { email: formData.email, password: formData.password }
                : {
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                };

            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Authentication failed');
            }

            console.log("Auth Success:", data);

            // Store Session
            if (data.session_id) {
                localStorage.setItem('token', data.session_id);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect
            navigate(data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard');

        } catch (err) {
            console.error("Auth Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black text-white relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black italic tracking-tighter mb-2">
                        <span className="text-organic-green">ANNADATA</span> SAATHI
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {mode === 'login' ? 'Welcome back, farmer friend.' : 'Join the precision agriculture network.'}
                    </p>
                </div>

                <div className="flex justify-center mb-6">
                    <button
                        onClick={() => navigate('/auth-face')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-full border border-slate-600 transition-all flex items-center gap-2"
                    >
                        <ShieldCheck size={14} className="text-emerald-500" /> Use Face ID Login
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {mode === 'signup' && (
                        <div className="space-y-2">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-12 py-3.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-12 py-3.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-12 py-3.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {mode === 'signup' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">I am a:</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'farmer' })}
                                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${formData.role === 'farmer' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}
                                >
                                    FARMER
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'user' })}
                                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${formData.role === 'user' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}
                                >
                                    NORMAL USER
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                {mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'} <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-slate-400 text-sm">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError('');
                            }}
                            className="ml-2 text-blue-400 font-bold hover:text-blue-300 transition-colors"
                        >
                            {mode === 'login' ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-slate-600 text-xs">
                    <ShieldCheck size={12} />
                    <span>Secure End-to-End Encryption</span>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
