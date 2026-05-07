import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Power } from 'lucide-react';

const SmartIrrigation = ({ sensorData }) => {
    const [activePumps, setActivePumps] = useState({ p1: false, p2: false, p3: false });

    // Real-time data from sensors
    const moistureLevel = sensorData?.soil_moisture || 0;
    const flowRate = sensorData?.last_updated ? new Date(sensorData.last_updated).toLocaleTimeString() : "8ml/s";

    const togglePump = (pump) => {
        setActivePumps(prev => ({ ...prev, [pump]: !prev[pump] }));
    };

    const activeCount = Object.values(activePumps).filter(Boolean).length;

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <Droplets size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-dark-navy dark:text-white">Smart Controls</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Zones: {activeCount}/3</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${activeCount > 0 ? 'bg-organic-green/10 dark:bg-organic-green/20 border-organic-green/20 text-organic-green-600 dark:text-organic-green' : 'bg-gray-200 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}>
                    {activeCount > 0 ? 'ACTIVE' : 'IDLE'}
                </div>
            </div>

            <div className="flex gap-6">
                {/* Left Side: Stats */}
                <div className="w-1/2 flex flex-col gap-4">
                    {/* Moisture Circle */}
                    <div className="relative w-full aspect-square max-w-[140px] mx-auto flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                            <motion.circle
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: moistureLevel / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                cx="50%" cy="50%" r="45%"
                                stroke="currentColor" strokeWidth="8" fill="transparent"
                                className="text-blue-500"
                                strokeDasharray="360"
                                strokeLinecap="round"
                                style={{ pathLength: moistureLevel / 100 }}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold text-dark-navy dark:text-white">{moistureLevel}%</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Moisture</span>
                        </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TEMP</p>
                        <p className="text-xl font-bold text-red-500">28°C</p>
                    </div>
                </div>

                {/* Right Side: Pump Controls */}
                <div className="w-1/2 flex flex-col justify-between">
                    <div className="grid grid-cols-3 gap-2 h-full">
                        {['p1', 'p2', 'p3'].map((pump, idx) => (
                            <button
                                key={pump}
                                onClick={() => togglePump(pump)}
                                className={`rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${activePumps[pump]
                                        ? 'bg-organic-green text-white shadow-lg shadow-green-500/20'
                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                                style={{ height: '100%' }}
                            >
                                <Power size={20} />
                                <span className="text-xs font-bold uppercase">P-{idx + 1}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer: Flow Rate */}
            <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Flow Rate</span>
                <span className="text-lg font-bold text-blue-400">{flowRate}</span>
            </div>
        </div>
    );
};

export default SmartIrrigation;
