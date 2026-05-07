import React from 'react';
import { Camera, Scan, Activity } from 'lucide-react';
import SpotlightCard from '../react-bits/SpotlightCard';

import { useNavigate } from 'react-router-dom';

const CropHealth = () => {
    const navigate = useNavigate();

    return (
        <SpotlightCard
            spotlightColor="rgba(34, 197, 94, 0.2)"
            className="cursor-pointer group h-full"
        >
            <div
                onClick={() => navigate('/crop-health')}
                className="p-6 h-full flex flex-col relative z-20"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-organic-green transition-colors">Crop Vision</h3>
                        <p className="text-sm text-gray-400">AI Disease Detection</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg text-organic-green">
                        <Activity size={20} />
                    </div>
                </div>
                <div
                    onClick={() => navigate('/crop-health')}
                    className="glass-panel p-6 relative overflow-hidden group cursor-pointer hover:border-organic-green/50 transition-all"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <Activity className="text-organic-green" size={24} />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-organic-green/20 flex items-center justify-center">
                            <Scan size={16} className="text-organic-green" />
                        </div>
                        <h3 className="text-lg font-bold text-dark-navy dark:text-white uppercase tracking-tighter italic">ANNADATA <span className="text-organic-green">VISION</span></h3>
                    </div>

                    {/* Camera Viewport Simulation */}
                    <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden mb-6 border border-white/10 shadow-inner group-hover:border-organic-green/30 transition-colors">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-700"></div>

                        {/* Scanner Overlay */}
                        <div className="absolute inset-4 border border-white/20 rounded-lg overflow-hidden">
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-organic-green"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-organic-green"></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-organic-green"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-organic-green"></div>

                            <div className="w-full h-[1px] bg-organic-green/80 absolute top-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                            <button className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/10 hover:bg-organic-green hover:text-dark-navy hover:border-organic-green transition-all text-white text-xs font-medium group/btn">
                                <Camera size={14} />
                                <span>Scan Field</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="text-left">
                            <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Health Score</span>
                            <span className="text-2xl font-bold text-organic-green">94%</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Status</span>
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-organic-green/10 border border-organic-green/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-organic-green animate-pulse"></div>
                                <span className="text-xs font-bold text-organic-green">Healthy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SpotlightCard>
    );
};

export default CropHealth;
