// =========================
// Core React Imports
// =========================
import React, { useState } from 'react';

// Feature Modules
import CameraDiagnose from './CameraDiagnose';
import SatelliteMonitor from './SatelliteMonitor';

/**
 * CropHealthDashboard
 * --------------------------------------------------
 * Acts as the central command hub for crop analysis.
 *
 * Responsibilities:
 * 1. Present high-level diagnostic options
 * 2. Switch between Optical (Camera) and Satellite modes
 * 3. Maintain a clean, distraction-free full-screen workflow
 */
const CropHealthDashboard = () => {

    /**
     * Mode State
     * ----------
     * null       → Main dashboard (mode selection)
     * 'camera'   → Optical / Camera-based diagnosis
     * 'satellite'→ Satellite-based crop monitoring
     */
    const [mode, setMode] = useState(null);

    return (
        <div className="w-full min-h-screen text-gray-200 bg-[#0a0f1c]">

            {/* ======================================================
                DASHBOARD VIEW
                ------------------------------------------------------
                Displayed when no mode is selected.
                Provides entry points into different diagnostic systems.
            ====================================================== */}
            {!mode && (
                <div className="container mx-auto p-4 max-w-6xl pt-20">

                    {/* Dashboard Title */}
                    <h1 className="text-4xl font-bold mb-12 text-center text-green-400 tracking-wider uppercase">
                        Dr. Crop: AI Command Center
                    </h1>

                    {/* Mode Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Optical / Camera-Based Diagnosis */}
                        <button
                            onClick={() => setMode('camera')}
                            className="group relative h-80 bg-slate-900 rounded-3xl border border-slate-700
                                       hover:border-green-500 transition-all
                                       flex flex-col items-center justify-center gap-6
                                       overflow-hidden
                                       hover:shadow-[0_0_50px_-12px_rgba(74,222,128,0.5)]"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-transparent
                                            opacity-50 group-hover:opacity-100 transition-opacity" />

                            {/* Icon */}
                            <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
                                📸
                            </span>

                            {/* Text Content */}
                            <div className="text-center z-10 relative">
                                <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">
                                    Optical Diagnostic
                                </h2>
                                <p className="text-slate-400 px-4 font-mono text-sm">
                                    Analyze crop pathology via Computer Vision
                                </p>
                            </div>
                        </button>

                        {/* Satellite-Based Monitoring */}
                        <button
                            onClick={() => setMode('satellite')}
                            className="group relative h-80 bg-slate-900 rounded-3xl border border-slate-700
                                       hover:border-blue-500 transition-all
                                       flex flex-col items-center justify-center gap-6
                                       overflow-hidden
                                       hover:shadow-[0_0_50px_-12px_rgba(96,165,250,0.5)]"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent
                                            opacity-50 group-hover:opacity-100 transition-opacity" />

                            {/* Icon */}
                            <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
                                🛰️
                            </span>

                            {/* Text Content */}
                            <div className="text-center z-10 relative">
                                <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">
                                    Satellite Monitor
                                </h2>
                                <p className="text-slate-400 px-4 font-mono text-sm">
                                    Macro-scale NDVI stress analysis
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* ======================================================
                MODE VIEW (FULL SCREEN)
                ------------------------------------------------------
                Renders selected diagnostic module.
                Includes a floating exit button for quick navigation.
            ====================================================== */}
            {mode && (
                <div className="animate-in fade-in zoom-in-95 duration-500 w-full h-full">

                    {/* Floating Exit / Back Button */}
                    <button
                        onClick={() => setMode(null)}
                        className="fixed top-6 right-6 z-50
                                   bg-black/50 hover:bg-red-600/80
                                   text-white p-3 rounded-full
                                   backdrop-blur border border-white/10
                                   transition-all hover:rotate-90"
                        title="Exit Module"
                    >
                        {/* Close Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>

                    {/* Conditional Rendering of Diagnostic Modules */}
                    {mode === 'camera' && <CameraDiagnose />}
                    {mode === 'satellite' && <SatelliteMonitor />}
                </div>
            )}
        </div>
    );
};

export default CropHealthDashboard;
