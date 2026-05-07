import React from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Volume2 } from 'lucide-react';

const MandiPrices = () => {
    const prices = [
        { crop: "Wheat (Lokwan)", price: "2,450", trend: "up", change: "+1.2%" },
        { crop: "Soybean", price: "4,100", trend: "down", change: "-0.5%" },
        { crop: "Onion (Red)", price: "1,800", trend: "up", change: "+5.0%" },
    ];

    return (
        <div className="glass-panel p-6 h-full flex flex-col group hover:border-organic-green-500/30 transition-colors">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-dark-navy dark:text-white">Mandi Live</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">APMC Pune</p>
                </div>
                <button className="p-2 rounded-full bg-organic-green/10 hover:bg-organic-green/20 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
                    <Volume2 size={20} className="text-organic-green-600 dark:text-neon-green" />
                </button>
            </div>

            <div className="space-y-4 flex-1">
                {prices.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-sm">
                        <div className="flex flex-col">
                            <span className="font-medium text-dark-navy dark:text-gray-200">{item.crop}</span>
                            <span className="text-xs text-gray-500">₹/Quintal</span>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-lg flex items-center gap-1 justify-end text-dark-navy dark:text-white">
                                <IndianRupee size={14} />
                                {item.price}
                            </div>
                            <div className={`text-xs flex items-center justify-end gap-1 ${item.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                {item.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {item.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => window.open('https://farmer-mart-drab.vercel.app/', '_blank')}
                className="mt-4 w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-dark-navy dark:hover:text-white transition-colors font-medium"
            >
                View All Markets
            </button>
        </div>
    );
};

export default MandiPrices;
