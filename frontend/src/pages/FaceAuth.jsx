import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Scan, UserCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FaceAuth = () => {
    const webcamRef = useRef(null);
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setLoading(true);
        setMessage(null);

        try {
            // Convert base64 to blob
            const res = await fetch(imageSrc);
            const blob = await res.blob();
            const file = new File([blob], "face.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append('file', file);

            let url = "";
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8002';
            if (mode === 'register') {
                if (!name) {
                    setMessage({ type: 'error', text: "Please enter your name first." });
                    setLoading(false);
                    return;
                }
                formData.append('name', name);
                url = `${apiBase}/api/face-auth/register`;
            } else {
                url = `${apiBase}/api/face-auth/login`;
            }

            const apiRes = await fetch(url, { method: 'POST', body: formData });
            const data = await apiRes.json();

            if (apiRes.ok) {
                setMessage({ type: 'success', text: data.message });
                if (mode === 'login') {
                    // Simulate login success - store token/user
                    localStorage.setItem('user', JSON.stringify(data.user));
                    setTimeout(() => {
                        navigate('/dashboard'); // Go to dashboard
                    }, 1500);
                }
            } else {
                setMessage({ type: 'error', text: data.detail || "Authentication Failed" });
            }

        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: "Server Error. Is the backend running?" });
        } finally {
            setLoading(false);
        }

    }, [webcamRef, mode, name]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {mode === 'login' ? 'Face Awareness Login' : 'Register Face ID'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {mode === 'login' ? 'Position your face in the frame to authenticate.' : 'Train the model to recognize you.'}
                    </p>
                    <button onClick={() => navigate('/auth')} className="text-xs text-blue-400 mt-2 hover:underline">Or use password login</button>
                </div>

                <div className="relative aspect-video bg-black">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-emerald-500/50 m-8 rounded-xl pointer-events-none"></div>
                    <Scan className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/50 animate-pulse" size={64} />
                </div>

                <div className="p-6 space-y-4">
                    {mode === 'register' && (
                        <input
                            type="text"
                            placeholder="Enter Your Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-700 text-white p-3 rounded-xl border border-slate-600 focus:border-emerald-500 focus:outline-none"
                        />
                    )}

                    {message && (
                        <div className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {message.type === 'success' ? <UserCheck size={16} /> : <AlertTriangle size={16} />}
                            {typeof message.text === 'object' ? JSON.stringify(message.text) : message.text}
                        </div>
                    )}

                    <button
                        onClick={capture}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Scan size={20} />}
                        {mode === 'login' ? 'Authenticate Now' : 'Register Face'}
                    </button>

                    <div className="text-center">
                        <button
                            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}
                            className="text-xs text-slate-400 hover:text-white underline"
                        >
                            {mode === 'login' ? "New user? Register here" : "Already registered? Login here"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceAuth;
