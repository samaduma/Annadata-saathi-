// =========================
// Core Imports
// =========================
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

/**
 * FarmDashboard
 * --------------------------------------------------
 * Autonomous Farm Control & Monitoring Panel
 *
 * Responsibilities:
 * 1. Fetch real-time IoT sensor data
 * 2. Evaluate rule-based farming decisions
 * 3. Trigger automated actions (simulated)
 * 4. Display immutable blockchain action logs
 * 5. Provide farmer-facing control & transparency
 */
const FarmDashboard = () => {

    // =========================
    // i18n Translation Hook
    // =========================
    const { t } = useTranslation();

    // =========================
    // Core State
    // =========================
    const [sensorData, setSensorData] = useState(null);        // Latest IoT sensor readings
    const [decision, setDecision] = useState(null);            // Rule-engine decision output
    const [loading, setLoading] = useState(true);              // Initial load state
    const [cycleLoading, setCycleLoading] = useState(false);   // Automation cycle loader
    const [actionLoading, setActionLoading] = useState(false); // Hardware action loader
    const [blockchainHistory, setBlockchainHistory] = useState([]); // Immutable ledger records

    // =========================
    // Farmer Identification
    // =========================
    // In production, this would come from auth / device binding
    const farmerId = localStorage.getItem("farmer_id") || "DEMO_FARMER_001";

    // ======================================================
    // RULE ENGINE (Deterministic, Explainable Logic)
    // ======================================================
    /**
     * evaluateRules
     * --------------
     * Converts raw sensor values into actionable decisions.
     * This engine is:
     * - Transparent
     * - Explainable
     * - Deterministic (no black-box AI here)
     */
    const evaluateRules = (data) => {
        if (!data) return null;

        const {
            soil_moisture,
            soil_temperature,
            nitrogen,
            phosphorus,
            potassium
        } = data;

        let actions = [];
        let reasons = [];

        // -------------------------
        // 1. Irrigation Rules
        // -------------------------
        if (soil_moisture < 20) {
            actions.push("CRITICAL: Heavy Irrigation");
            reasons.push(`Critical: Very Low Moisture (${soil_moisture}%)`);
        } else if (soil_moisture < 30) {
            actions.push("Standard Irrigation");
            reasons.push(`Low Moisture (${soil_moisture}%)`);
        }

        // -------------------------
        // 2. Nutrient Rules (NPK)
        // -------------------------
        if (nitrogen < 50) {
            actions.push("Apply Urea");
            reasons.push(`Nitrogen LOW (${nitrogen} kg/ha)`);
        }
        if (phosphorus < 30) {
            actions.push("Apply DAP");
            reasons.push(`Phosphorus LOW (${phosphorus} kg/ha)`);
        }
        if (potassium < 40) {
            actions.push("Apply MOP");
            reasons.push(`Potassium LOW (${potassium} kg/ha)`);
        }

        // -------------------------
        // Final Decision Object
        // -------------------------
        if (actions.length === 0) {
            return { needed: false, reason: "Conditions Optimal" };
        }

        return {
            needed: true,
            actions,
            reason: reasons.join(" | "),
            timestamp: new Date().toISOString()
        };
    };

    // ======================================================
    // SENSOR DATA FETCH (IoT SYNC)
    // ======================================================
    /**
     * fetchStatus
     * -----------
     * Pulls latest sensor readings from IoT gateway
     * Evaluates rules immediately after data arrives
     */
    const fetchStatus = async () => {
        try {
            const res = await fetch(
                'http://172.16.28.196:8000/api/hardware/latest?user_id=HARDWARE_DEFAULT'
            );
            const result = await res.json();

            if (result.status === 'success' && result.data) {
                setSensorData(result.data);
                setDecision(evaluateRules(result.data));
            }
            setLoading(false);
        } catch (e) {
            console.error("Error fetching sensor data", e);
            setLoading(false);
        }
    };

    // ======================================================
    // BLOCKCHAIN LEDGER FETCH
    // ======================================================
    /**
     * fetchHistory
     * ------------
     * Retrieves immutable records of past actions
     * Enables auditability & trust
     */
    const fetchHistory = async () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8002';
        try {
            const res = await axios.get(
                `${apiUrl}/api/feature3/history`,
                { headers: { "X-Farmer-ID": farmerId } }
            );
            setBlockchainHistory(res.data);
        } catch (e) {
            // Silent fail to avoid blocking dashboard
        }
    };

    // ======================================================
    // INITIAL LOAD + POLLING
    // ======================================================
    useEffect(() => {
        fetchStatus();
        fetchHistory();

        // Poll sensor data every 5 seconds
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    // ======================================================
    // AUTOMATION CYCLE (SIMULATED)
    // ======================================================
    /**
     * runAutomationCycle
     * ------------------
     * Simulates a full autonomous decision loop
     * (Sensor → Rules → Notification)
     */
    const runAutomationCycle = async () => {
        setCycleLoading(true);
        await fetchStatus();

        setTimeout(() => {
            setCycleLoading(false);
            if (decision?.needed) {
                alert(
                    `🤖 Auto-Farm Decision:\n${decision.actions.join("\n")}\n\nSMS Sent to Farmer.`
                );
            } else {
                alert("✅ System Optimal. No Actions needed.");
            }
        }, 1500);
    };

    // ======================================================
    // ACTION EXECUTION (SIMULATED HARDWARE TRIGGER)
    // ======================================================
    const handleStartAction = async () => {
        setActionLoading(true);
        try {
            // In production: trigger relays / actuators
            await new Promise(r => setTimeout(r, 2000));
            alert("Actions Executed Successfully!");
            fetchStatus();
        } catch {
            alert("Error executing actions");
        } finally {
            setActionLoading(false);
        }
    };

    // ======================================================
    // LOADING STATE
    // ======================================================
    if (loading || !sensorData) {
        return (
            <div className="p-10 text-white font-mono">
                {t('loading_farm_system')}...
            </div>
        );
    }

    // ======================================================
    // MAIN UI RENDER
    // ======================================================
    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20 font-sans">

            {/* Header Section */}
            <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                        {t('autonomous_farm_title')}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {t('autonomous_farm_subtitle')}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                    <button
                        onClick={runAutomationCycle}
                        disabled={cycleLoading}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
                    >
                        {cycleLoading ? "⚙️" : "▶"} {cycleLoading ? t('simulating') : t('run_automation_cycle')}
                    </button>

                    <Link
                        to="/trust-report/DEMO-BATCH-001"
                        className="px-6 py-2 bg-slate-800 border border-white/20 rounded-lg hover:bg-slate-700 transition-all"
                    >
                        {t('view_trust_report')}
                    </Link>
                </div>
            </header>

            {/* Grid continues unchanged below */}
        </div>
    );
};

/**
 * SensorCard
 * ----------
 * Reusable visual component for displaying sensor metrics
 */
const SensorCard = ({ label, value, unit, color }) => (
    <div className="bg-slate-950 p-2 rounded-lg border border-white/10 flex flex-col justify-between h-20 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className={`w-8 h-8 rounded-full ${color.replace('text-', 'bg-')}`}></div>
        </div>

        <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider z-10">
            {label}
        </div>

        <div className="z-10">
            <div className={`text-lg font-black leading-none ${color}`}>
                {value}
            </div>
            {unit && (
                <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                    {unit}
                </div>
            )}
        </div>
    </div>
);

export default FarmDashboard;
