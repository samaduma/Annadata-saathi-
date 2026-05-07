import React from 'react';
import { Layers } from 'lucide-react';
import { Tilt } from 'react-tilt';

const ZoneMap = () => {
    return (
        <Tilt className="w-full h-full" options={{ max: 10, scale: 1.02, speed: 400 }}>
            <div className="glass-panel p-6 h-full relative overflow-hidden group">
                <div className="absolute top-4 right-4 z-10 p-2 bg-black/40 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/10">
                    Your Farm: 4.2 Acres
                </div>

                {/* Simulated Map SVG */}
                <div className="w-full h-full bg-[#f0f9ff] dark:bg-[#1a1c23] rounded-xl relative overflow-hidden transition-colors border border-black/5 dark:border-white/5">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-10 dark:opacity-20"
                        style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    {/* Zones */}
                    <div className="absolute top-[20%] left-[10%] w-[30%] h-[60%] bg-organic-green/20 dark:bg-organic-green/30 border-2 border-organic-green rounded-lg flex items-center justify-center cursor-pointer hover:bg-organic-green/40 dark:hover:bg-organic-green/50 transition-colors shadow-sm">
                        <span className="font-bold text-xs text-organic-green-700 dark:text-organic-green drop-shadow-md">Zone A (Good)</span>
                    </div>

                    <div className="absolute top-[20%] right-[15%] w-[35%] h-[30%] bg-blue-500/20 dark:bg-blue-500/30 border-2 border-blue-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-500/40 dark:hover:bg-blue-500/50 transition-colors shadow-sm">
                        <span className="font-bold text-xs text-blue-600 dark:text-blue-400 drop-shadow-md">Zone B (Wet)</span>
                    </div>

                    <div className="absolute bottom-[10%] right-[15%] w-[35%] h-[40%] bg-yellow-500/20 dark:bg-yellow-500/30 border-2 border-yellow-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-500/40 dark:hover:bg-yellow-500/50 transition-colors animate-pulse shadow-sm">
                        <span className="font-bold text-xs text-yellow-600 dark:text-yellow-400 drop-shadow-md">Zone C (Dry)</span>
                    </div>
                </div>

                <div className="absolute bottom-6 left-6 flex gap-4">
                    <div className="flex items-center gap-2 text-xs text-dark-navy dark:text-gray-300">
                        <div className="w-3 h-3 rounded-full bg-organic-green"></div> Optimal
                    </div>
                    <div className="flex items-center gap-2 text-xs text-dark-navy dark:text-gray-300">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Dry
                    </div>
                </div>
            </div>
        </Tilt>
    );
};

export default ZoneMap;
