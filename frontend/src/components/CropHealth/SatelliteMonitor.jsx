import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, Circle, Polygon, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { Phone, ExternalLink } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

const STATIC_AGRONOMISTS = [
    { name: "Dr. Neelay", phone: "7718883299" },
    { name: "Dr. Dhruv", phone: "9579649407" },
    { name: "Dr. Samarth", phone: "8408917498" },
    { name: "Dr. Kavya", phone: "8850194649" }
];

// NOTE: STATIC_SCHEMES removed in favor of dynamic fetching in Recovery Mode.
// The code now uses analysisData.parsedSubsidy.schemes

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapController = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 16, { duration: 2.5, easeLinearity: 0.25 });
        }
    }, [coords, map]);
    return null;
};

const DrawController = ({ isDrawing, onAddPoint }) => {
    useMapEvents({
        click(e) {
            if (isDrawing) {
                onAddPoint([e.latlng.lat, e.latlng.lng]);
            }
        }
    });
    return null;
};

const StatusBadge = ({ health }) => {
    let color = "bg-gray-500";
    let icon = "⚪";

    if (health.includes("Excellent") || health.includes("Good")) {
        color = "bg-green-500";
        icon = "🌿";
    } else if (health.includes("Stress") || health.includes("Moderate")) {
        color = "bg-yellow-500";
        icon = "⚠️";
    } else if (health.includes("Critical") || health.includes("Loss")) {
        color = "bg-red-500";
        icon = "🚨";
    }

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 shadow-lg backdrop-blur-md ${color}/20 text-white font-bold animate-in fade-in zoom-in duration-500`}>
            <span className="text-xl">{icon}</span>
            <span className={`tracking-wide text-sm uppercase ${health.includes("Critical") ? "animate-pulse" : ""}`}>{health}</span>
        </div>
    );
};

// --- MAIN COMPONENT ---

const SatelliteMonitor = () => {
    // --- STATE ---
    const navigate = useNavigate();
    const [center, setCenter] = useState([20.5937, 78.9629]); // Default: India
    const [heatmapData, setHeatmapData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dynamic Recovery Logic
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);

    // UI Logic States
    const [drawingMode, setDrawingMode] = useState(false);
    const [polygonPoints, setPolygonPoints] = useState([]);
    const [showAgent, setShowAgent] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [agentState, setAgentState] = useState({ step: "START", history: [] });

    // --- EFFECTS ---
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.warn("Location access denied.")
            );
        }
    }, []);

    // Trigger Agent Start
    useEffect(() => {
        if (showAgent && chatHistory.length === 0) {
            handleSendChat("START_SESSION_TRIGGER");
        }
    }, [showAgent]);

    // --- HANDLERS ---

    const handleSendChat = async (overrideMsg) => {
        const msg = overrideMsg || chatInput;
        if (!msg) return;

        if (!overrideMsg) {
            setChatHistory(prev => [...prev, { role: "user", content: msg }]);
            setChatInput("");
        }

        try {
            const currentState = { ...agentState };
            if (msg === "START_SESSION_TRIGGER") currentState.step = "START";

            const context = heatmapData ? {
                disease: "Vegetation Stress (NDVI)",
                confidence: 1.0,
                analysis: heatmapData.analysis
            } : null;

            const res = await axios.post(`${API_URL}/api/feature2/agent/chat`, {
                message: msg === "START_SESSION_TRIGGER" ? "" : msg,
                state: currentState,
                context: context
            });

            const result = res.data;
            setAgentState({ step: result.step, history: result.history, ndvi: currentState.ndvi });
            if (result.response) setChatHistory(prev => [...prev, { role: "agent", content: result.response }]);
        } catch (e) {
            setChatHistory(prev => [...prev, { role: "agent", content: "⚠️ Connection error." }]);
        }
    };

    const fetchRecoveryPlan = async () => {
        setAnalysisLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/feature2/analyze`, {
                disease: "Severe Drought/Vegetation Stress",
                confidence: 0.95
            });
            const data = response.data;

            // Parse nested JSONs for UI
            let parsedPlan = {};
            let parsedSubsidy = { schemes: [] };

            try {
                let rawJson = data.treatment.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedPlan = JSON.parse(rawJson);
            } catch (e) { parsedPlan = { timeline: [] }; }

            try {
                if (data.subsidy && data.subsidy.trim().startsWith('{')) {
                    parsedSubsidy = JSON.parse(data.subsidy);
                }
            } catch (e) { }

            setAnalysisData({ ...data, parsedPlan, parsedSubsidy });

        } catch (e) {
            console.error("Analysis Failed", e);
        } finally {
            setAnalysisLoading(false);
        }
    };

    const fetchNDVI = async () => {
        if (polygonPoints.length < 3) return;
        setLoading(true);
        setError(null);
        setIsRecoveryMode(false);
        setAnalysisData(null);

        try {
            const lats = polygonPoints.map(p => p[0]);
            const lngs = polygonPoints.map(p => p[1]);
            const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs);
            const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
            const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

            const payload = {
                lat: centerLat, lng: centerLng,
                bbox: [minLng, minLat, maxLng, maxLat]
            };

            const response = await axios.post(`${API_URL}/api/feature2/ndvi`, payload);
            const data = response.data;
            setHeatmapData(data);
            setCenter([centerLat, centerLng]);
            setDrawingMode(false);

            // CHECK RECOVERY MODE TRIGGER
            if (data.average_ndvi < 0.4) {
                setIsRecoveryMode(true);
                fetchRecoveryPlan(); // Auto-fetch dynamic advice
            }

        } catch (error) {
            setError("Unable to connect to Satellite Network.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setPolygonPoints([]);
        setHeatmapData(null);
        setDrawingMode(false);
        setError(null);
        setIsRecoveryMode(false);
        setAnalysisData(null);
    };

    // --- RENDER ---
    return (
        <div className="flex flex-col min-h-screen w-full bg-slate-950 text-white font-sans overflow-x-hidden">
            <header className={`h-16 border-b border-white/10 backdrop-blur-md flex items-center justify-between px-6 z-50 transition-colors duration-500 ${isRecoveryMode ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-900/50'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-2xl">🛰️</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">SatView <span className="text-blue-400">Pro</span></h1>
                        {isRecoveryMode && <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] uppercase font-bold tracking-widest rounded animate-pulse">Critical Mode</span>}
                    </div>
                </div>
                {heatmapData && <StatusBadge health={heatmapData.overall_health} />}
            </header>

            <main className="flex-1 flex flex-col lg:flex-row relative">
                {/* LEFT PANEL: MAP (Shrinks in Recovery Mode) */}
                <div className={`relative min-h-[50vh] bg-slate-900 group transition-all duration-700 ${isRecoveryMode ? 'lg:w-1/3 border-r border-red-500/20' : 'flex-1'}`}>
                    <MapContainer center={center} zoom={14} zoomControl={false} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='&copy; Esri' />
                        <MapController coords={center} />
                        <DrawController isDrawing={drawingMode} onAddPoint={(pt) => setPolygonPoints(prev => [...prev, pt])} />
                        {polygonPoints.length > 0 && <Polygon positions={polygonPoints} pathOptions={{ color: '#06b6d4' }} />}
                        {heatmapData?.heatmap_points.map((pt, idx) => (
                            <Circle key={idx} center={[pt.lat, pt.lng]} radius={35} pathOptions={{ fillColor: pt.intensity < 0.4 ? "#ef4444" : pt.intensity < 0.6 ? "#eab308" : "#22c55e", color: "transparent", fillOpacity: 0.6 }} />
                        ))}
                    </MapContainer>

                    {/* Controls Overlay */}
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4 z-[900]">
                        {!drawingMode && polygonPoints.length === 0 && !heatmapData && (
                            <button onClick={() => setDrawingMode(true)} className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl font-bold text-lg">📍 Mark My Farm</button>
                        )}
                        {drawingMode && (
                            <div className="flex gap-3">
                                <button onClick={fetchNDVI} disabled={polygonPoints.length < 3} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold">📡 Scan Now</button>
                                <button onClick={() => { setDrawingMode(false); setPolygonPoints([]); }} className="px-6 py-3 bg-slate-800 text-white rounded-xl border border-white/10">Cancel</button>
                            </div>
                        )}
                        {heatmapData && (
                            <button onClick={handleReset} className="px-6 py-3 bg-slate-800/80 backdrop-blur hover:bg-slate-700 text-white rounded-xl border border-white/20 font-bold shadow-lg">🔄 New Scan</button>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: DYNAMIC DASHBOARD */}
                {(heatmapData || error) && (
                    <div className={`bg-slate-900 border-l border-white/10 p-6 overflow-y-auto z-40 shadow-2xl transition-all duration-700 ${isRecoveryMode ? 'lg:w-2/3 bg-gradient-to-br from-red-950/30 to-slate-950' : 'lg:w-[400px]'}`}>

                        {error && <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm font-medium">❌ {error}</div>}

                        {/* RECOVERY MODE UI */}
                        {isRecoveryMode && analysisData ? (
                            <div className="animate-in slide-in-from-right duration-700">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 flex items-center gap-3">
                                    <span className="text-red-500">Recovery</span> Protocol
                                </h2>
                                <p className="text-red-400/60 font-mono text-sm mb-8">CRITICAL CROP CONDITION DETECTED • IMMEDIATE ACTION REQUIRED</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* COL 1: WHAT HAPPENED */}
                                    <div className="space-y-4">
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <h3 className="text-red-400 font-bold uppercase text-xs tracking-wider mb-2">Diagnosis</h3>
                                            <p className="text-slate-300 text-sm leading-relaxed">{analysisData.analysis}</p>
                                        </div>

                                        {/* AI Chat Bot - Recovery Mode */}
                                        <button
                                            onClick={() => setShowAgent(true)}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🤖</div>
                                                <div className="text-left">
                                                    <div className="font-bold text-sm">Ask AI Agronomist</div>
                                                    <div className="text-xs text-blue-200">Chat about this diagnosis</div>
                                                </div>
                                            </div>
                                            <span className="text-blue-200 group-hover:translate-x-1 transition-transform">→</span>
                                        </button>
                                        {/* Dynamic Experts (Reusing Static List) */}
                                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-blue-500/20">
                                            <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider mb-3">Expert Consultation</h3>
                                            <div className="space-y-2">
                                                {STATIC_AGRONOMISTS.slice(0, 2).map((exp, i) => (
                                                    <div key={i} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-white/5">
                                                        <span className="text-xs font-bold">{exp.name}</span>
                                                        <a href={`tel:${exp.phone}`} className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-all">Call</a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* COL 2: WHAT TO DO NEXT */}
                                    <div className="bg-slate-950/30 p-5 rounded-3xl border border-yellow-500/20 md:col-span-1">
                                        <h3 className="text-yellow-500 font-bold uppercase text-sm tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Recovery Steps
                                        </h3>
                                        {analysisData.parsedPlan?.timeline ? (
                                            <div className="space-y-4 relative pl-4 border-l border-yellow-500/20">
                                                {analysisData.parsedPlan.timeline.slice(0, 4).map((step, i) => (
                                                    <div key={i} className="relative group">
                                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-yellow-500 shadow-lg"></div>
                                                        <span className="text-[10px] text-yellow-500/70 font-mono uppercase block mb-1">{step.day}</span>
                                                        <p className="text-xs text-slate-300 font-bold">{step.title}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{step.task}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div className="text-sm text-slate-500 italic">Generating plan...</div>}
                                    </div>

                                    {/* COL 3: FINANCIAL SUPPORT */}
                                    <div className="space-y-4">
                                        <h3 className="text-green-500 font-bold uppercase text-sm tracking-widest mb-1">Financial Aid</h3>
                                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                            {analysisData.parsedSubsidy?.schemes?.length > 0 ? (
                                                analysisData.parsedSubsidy.schemes.map((scheme, idx) => (
                                                    <div key={idx} className="bg-green-900/10 p-4 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all group">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="font-bold text-green-100 text-sm leading-tight">{scheme.name}</h5>
                                                            {scheme.priority && <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold uppercase">{scheme.priority}</span>}
                                                        </div>
                                                        <p className="text-[10px] text-green-100/60 mb-3 line-clamp-3">{scheme.details}</p>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => navigate('/insurance-claim')} className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2">
                                                                <span>📄</span> Apply for Claim
                                                            </button>
                                                            {scheme.website_url && (
                                                                <a href={scheme.website_url} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-white/10">
                                                                    <ExternalLink size={14} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl">
                                                    <p className="text-xs text-slate-500 animate-pulse">Finding Schemes...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* STANDARD DASHBOARD (For Healthy/Good Stats) */
                            !isRecoveryMode && heatmapData && (
                                <div className="space-y-6 animate-in fade-in">
                                    <h2 className="text-2xl font-bold text-white">Crop Health Report</h2>
                                    <div className="bg-slate-800 rounded-3xl p-6 border border-white/5 shadow-inner">
                                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Vegetation Index (NDVI)</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-6xl font-black ${heatmapData.average_ndvi < 0.4 ? "text-red-400" : heatmapData.average_ndvi < 0.6 ? "text-yellow-400" : "text-green-400"}`}>{heatmapData.average_ndvi}</span>
                                            <span className="text-slate-500">/ 1.0</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-5">
                                        <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold uppercase text-xs tracking-wider">🤖 Analysis</div>
                                        <p className="text-slate-300 text-sm leading-relaxed">{heatmapData.analysis}</p>
                                    </div>
                                    <button onClick={() => setShowAgent(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl border border-white/5 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">💬</div>
                                            <div className="text-left"><div className="font-bold text-sm">Ask AI Agronomist</div></div>
                                        </div>
                                        <span className="text-slate-500 group-hover:translate-x-1">→</span>
                                    </button>
                                </div>
                            )
                        )}

                        {/* Loading State for Recovery Mode */}
                        {isRecoveryMode && analysisLoading && (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-red-400 font-mono text-sm animate-pulse">GENERATING RECOVERY PROTOCOL...</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* CHAT MODAL Component (Standard) */}
            {showAgent && (
                <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-slate-900 w-full max-w-lg h-[80vh] sm:h-[600px] sm:rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
                        {/* Header */}
                        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="bg-green-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">AI</span>
                                Agronomist Assistant
                            </h3>
                            <button onClick={() => setShowAgent(false)} className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors">✕</button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                                        }`}>
                                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>') }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-800 border-t border-slate-700">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="Ask for advice..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                                />
                                <button
                                    onClick={() => handleSendChat()}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-xl font-bold transition-all active:scale-95"
                                >
                                    ➤
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SatelliteMonitor;
