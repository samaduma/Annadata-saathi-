// =========================
// Core React + Hooks
// =========================
import React, {
    useState,
    useRef,
    useCallback,
    useEffect
} from 'react';

// Webcam access for real-time image capture
import Webcam from "react-webcam";

// Icon set used across the diagnostic UI
import {
    Scan, AlertTriangle, CheckCircle, Activity,
    ThermometerSun, Droplets, ShieldAlert, Calendar,
    MoreHorizontal, ThumbsUp, ThumbsDown, Volume2, Leaf, FlaskConical, TrendingUp,
    Trash2, ShoppingCart, Minus, Plus, Send, MessageSquare,
    Bot, User, FileText, ExternalLink, Phone
} from 'lucide-react';

// =========================
// Static Expert Directory
// (Simulated for Hackathon)
// =========================
const STATIC_AGRONOMISTS = [
    { name: "Dr. Neelay", phone: "7718883299" },
    { name: "Dr. Dhruv", phone: "9579649407" },
    { name: "Dr. Samarth", phone: "8408917498" },
    { name: "Dr. Kavya", phone: "8850194649" }
];

/**
 * CameraDiagnose Component
 * ----------------------------------------------------
 * This is the core AI-powered crop diagnosis interface.
 * Responsibilities:
 * 1. Capture or upload crop images
 * 2. Run CNN-based disease detection
 * 3. Generate expert treatment plans
 * 4. Provide AI chat assistance
 * 5. Convert diagnosis → actionable treatments → marketplace
 */
const CameraDiagnose = () => {

    // =========================
    // Core Scan State
    // =========================
    const [image, setImage] = useState(null);                 // Captured or uploaded image
    const [loading, setLoading] = useState(false);            // Global processing state
    const [result, setResult] = useState(null);               // CNN output (class, confidence, heatmap)
    const [analysis, setAnalysis] = useState(null);           // Detailed AI-generated treatment plan
    const [showHeatmap, setShowHeatmap] = useState(false);    // Toggle heatmap overlay
    const [cameraError, setCameraError] = useState(null);     // Camera access errors

    // =========================
    // Cart & Order State
    // =========================
    const [cart, setCart] = useState({ organic: [], chemical: [] });
    const [orderPlaced, setOrderPlaced] = useState(false);

    // =========================
    // Expert Consultation
    // =========================
    const [experts, setExperts] = useState([]); // Randomly selected agronomists

    // =========================
    // Chat (AI Agronomist)
    // =========================
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatContainerRef = useRef(null);

    // Webcam reference
    const webcamRef = useRef(null);

    /**
     * Handle Camera Permission / Hardware Errors
     * -------------------------------------------
     * Converts browser camera errors into farmer-friendly messages
     */
    const handleCameraError = useCallback((error) => {
        console.error("Camera Error:", error);
        let msg = "Camera unavailable.";
        if (error.name === "NotReadableError") msg = "Camera is in use by another app.";
        else if (error.name === "NotAllowedError") msg = "Permission denied.";
        else if (error.name === "NotFoundError") msg = "No camera found.";
        setCameraError(msg);
    }, []);

    /**
     * Capture Image from Webcam
     * -------------------------
     * Resets any previous results to ensure fresh diagnosis
     */
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
        setResult(null);
        setAnalysis(null);
    }, []);

    /**
     * Handle Image Upload from Device
     * --------------------------------
     * Allows diagnosis from gallery images (low-connectivity friendly)
     */
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
            setResult(null);
            setAnalysis(null);
        };
        reader.readAsDataURL(file);
    };

    /**
     * STEP 1: CNN Scan
     * ----------------
     * - Sends image to ML backend
     * - Receives disease class, confidence & heatmap
     */
    const runScan = async () => {
        setLoading(true);
        setResult(null);
        setAnalysis(null);

        try {
            const res = await fetch(image);
            const blob = await res.blob();

            const formData = new FormData();
            formData.append('file', blob, 'crop_image.jpg');

            const response = await fetch(
                'http://127.0.0.1:8002/api/feature2/predict',
                { method: 'POST', body: formData }
            );

            if (!response.ok) throw new Error("Scan failed");

            const data = await response.json();
            setResult(data);

        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * STEP 2: Expert-Level Analysis
     * -----------------------------
     * Converts CNN output into:
     * - Treatment plan
     * - Severity assessment
     * - Recovery timeline
     * - Subsidy & scheme info
     */
    const getAnalysis = async () => {
        setLoading(true);

        try {
            const response = await fetch(
                'http://127.0.0.1:8002/api/feature2/analyze',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        disease: result.class,
                        confidence: result.confidence
                    })
                }
            );

            if (!response.ok) throw new Error("Analysis failed");
            const data = await response.json();

            // --- Parse treatment JSON safely ---
            let parsedPlan = {};
            try {
                let raw = data.treatment
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();
                parsedPlan = JSON.parse(raw);
            } catch {
                parsedPlan = { severity: "Medium" };
            }

            // --- Parse subsidy information ---
            let parsedSubsidy = null;
            try {
                parsedSubsidy = data.subsidy?.trim().startsWith('{')
                    ? JSON.parse(data.subsidy)
                    : { schemes: [{ name: "General Advice", details: data.subsidy }] };
            } catch {
                parsedSubsidy = { schemes: [] };
            }

            setAnalysis({ ...data, parsedPlan, parsedSubsidy });

            // Randomly assign experts for consultation
            const shuffled = [...STATIC_AGRONOMISTS].sort(() => 0.5 - Math.random());
            setExperts(shuffled.slice(0, 2));

            // Initialize AI chat with diagnosis summary
            setChatHistory([{
                role: 'ai',
                content: `Diagnosis Complete: ${result.class}\n\n${data.analysis}`
            }]);

        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * AI Chat Handler
     * ---------------
     * Enables conversational follow-up questions
     */
    const handleChatSend = async () => {
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput("");
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatLoading(true);

        try {
            const response = await fetch(
                'http://127.0.0.1:8002/api/feature2/agent/chat',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: userMsg,
                        state: { history: chatHistory },
                        context: {
                            disease: result?.class,
                            confidence: result?.confidence
                        }
                    })
                }
            );

            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'ai', content: data.response }]);

        } catch {
            setChatHistory(prev => [...prev, { role: 'ai', content: "Network issue. Please try again." }]);
        } finally {
            setChatLoading(false);
        }
    };

    /**
     * Auto-scroll chat window
     */
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    /**
     * Helper: Generate consistent, affordable prices
     * (Simulation for Farmer Mart integration)
     */
    const getPrice = (name) => {
        const n = name.toLowerCase();
        if (n.includes('neem')) return 250;
        if (n.includes('urea') || n.includes('npk')) return 300;
        if (n.includes('fungicide')) return 450;
        if (n.includes('pesticide')) return 550;
        if (n.includes('seeds')) return 180;

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return 150 + (Math.abs(hash) % 700);
    };

    /**
     * Initialize Treatment Cart once analysis arrives
     */
    useEffect(() => {
        if (!analysis?.parsedPlan?.treatment) return;

        const formatItems = (items) =>
            (Array.isArray(items) ? items : [items]).map(i => ({
                ...i,
                qty: 1,
                price: getPrice(i.item || i.name || "Treatment")
            }));

        setCart({
            organic: formatItems(analysis.parsedPlan.treatment.organic),
            chemical: formatItems(analysis.parsedPlan.treatment.chemical)
        });
    }, [analysis]);
} 

export default CameraDiagnose;
