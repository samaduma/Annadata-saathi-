import React from 'react';
import { Tilt } from 'react-tilt';
import { FlaskConical, TrendingDown, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const NutrientCard = ({ label, value, unit, status, color }) => (
    <div className="bg-white/40 dark:bg-white/5 rounded-xl p-3 border border-white/20 dark:border-white/5 flex flex-col items-center shadow-sm">
        <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">{label}</span>
        <span className={`text-2xl font-bold my-1 text-${color}-600 dark:text-${color}-400`}>{value}</span>
        <span className="text-xs text-gray-500">{unit}</span>
        <div className={`mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${status === 'Optimal' ? 'bg-organic-green/10 dark:bg-organic-green/20 text-organic-green-700 dark:text-organic-green' :
            status === 'High' ? 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
            }`}>
            {status}
        </div>
    </div>
);

const SoilHealthCards = ({ sensorData }) => {
    // Default values (using 0 or '--') if data is missing
    const {
        nitrogen = 0,
        phosphorus = 0,
        potassium = 0,
        ph = 0,
        soil_moisture = 0,
        last_updated
    } = sensorData || {};

    const lastTestText = last_updated
        ? `Last update: ${new Date(last_updated).toLocaleTimeString()}`
        : 'Waiting for sensor data...';

    // Helper to determine status color/text
    const getStatus = (val, type) => {
        if (!sensorData) return { status: 'Syncing...', color: 'gray' };

        // Basic Logic (can be customized)
        if (type === 'ph') {
            // pH 6.0-7.5 is usually optimal
            if (val >= 6.0 && val <= 7.5) return { status: 'Optimal', color: 'green' };
            return { status: 'Attention', color: 'yellow' };
        }

        // For N, P, K (Simplified logic)
        // Removed strict 0 check to allow low values to show as Low/Critical instead of No Signal
        if (val > 200) return { status: 'High', color: 'red' };
        if (val < 50) return { status: 'Low', color: 'yellow' };
        return { status: 'Optimal', color: 'green' };
    };

    return (
        <Tilt className="w-full h-full" options={{ max: 10, scale: 1.02, speed: 400 }}>
            <div className="glass-panel p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-lg">
                        <FlaskConical size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-dark-navy dark:text-white">Soil Nutrition</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{lastTestText}</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                    <NutrientCard label="N" value={nitrogen} unit="kg/ha" {...getStatus(nitrogen, 'n')} />
                    <NutrientCard label="P" value={phosphorus} unit="kg/ha" {...getStatus(phosphorus, 'p')} />
                    <NutrientCard label="K" value={potassium} unit="kg/ha" {...getStatus(potassium, 'k')} />
                    <NutrientCard label="pH" value={ph} unit="" {...getStatus(ph, 'ph')} />
                </div>

                {/* Moisture Level Insight */}
                <div className="mt-auto bg-gradient-to-r from-blue-500/10 to-transparent dark:from-blue-500/20 p-4 rounded-xl border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-full text-white dark:text-dark-navy shadow-md">
                            <TrendingDown size={18} className="rotate-180" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Moisture Level</p>
                            <p className="text-sm font-bold text-dark-navy dark:text-white">{soil_moisture}%</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`flex items-center text-xs font-bold gap-1 ${soil_moisture < 30 ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
                            {soil_moisture < 30 ? 'Low Moisture' : 'Optimal'}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Live Sensor Data</span>
                    </div>
                </div>
            </div>
        </Tilt>
    );
};

export default SoilHealthCards;
