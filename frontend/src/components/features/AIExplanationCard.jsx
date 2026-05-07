import React from 'react';
import { Brain, TrendingUp, Info } from 'lucide-react';
import { Tilt } from 'react-tilt';

const AIExplanationCard = () => {
    return (
        <Tilt className="w-full h-full" options={{ max: 15, scale: 1.02, speed: 400 }}>
            <div className="glass-panel p-6 h-full flex flex-col group hover:border-organic-green-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
                        <Brain size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-dark-navy dark:text-white">Why this decision?</h3>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="p-4 bg-white/40 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Confidence Score</span>
                            <span className="text-organic-green font-bold">92%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-organic-green w-[92%] shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                        </div>
                    </div>

                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                            <TrendingUp size={16} className="text-blue-500 dark:text-blue-400 mt-1 min-w-[16px]" />
                            <span>Soil moisture dropped by <strong>12%</strong> since yesterday.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <TrendingUp size={16} className="text-yellow-600 dark:text-yellow-400 mt-1 min-w-[16px]" />
                            <span>No rain forecast for the next <strong>5 days</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Info size={16} className="text-purple-500 dark:text-purple-400 mt-1 min-w-[16px]" />
                            <span>Crop is in <strong>Flowering Stage</strong> (High water need).</span>
                        </li>
                    </ul>
                </div>

                <button className="mt-4 w-full py-2 bg-white/50 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg text-sm font-medium transition-colors text-dark-navy dark:text-gray-300">
                    See Historical Data
                </button>
            </div>
        </Tilt>
    );
};

export default AIExplanationCard;
