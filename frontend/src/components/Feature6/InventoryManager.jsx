import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, TrendingUp, Truck, ShieldCheck, QrCode, Plus, Search, Filter } from 'lucide-react';

// Mock Data for Demo
const MOCK_STOCK = [
    { id: 'BATCH-2024-001', crop: 'Wheat (Lokwan)', quantity: '50 Quintal', price: '2,450', status: 'listed', date: '2024-03-15', quality: 'Grade A', hash: '8d9f...2a1' },
    { id: 'BATCH-2024-002', crop: 'Soybean', quantity: '20 Quintal', price: '4,100', status: 'sold', date: '2024-02-10', quality: 'Standard', hash: '7c4e...1b9' },
    { id: 'BATCH-2024-003', crop: 'Onion (Red)', quantity: '100 Quintal', price: '1,800', status: 'ready', date: '2024-03-20', quality: 'Grade A+', hash: 'PENDING' },
];

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="glass-panel p-5 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={60} />
        </div>
        <div className="relative z-10">
            <h4 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider font-semibold mb-1">{title}</h4>
            <div className="text-3xl font-bold text-dark-navy dark:text-white mb-1">{value}</div>
            <div className="text-xs text-organic-green dark:text-green-400 font-medium">{subtext}</div>
        </div>
    </div>
);

const InventoryManager = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title={t('total_inventory_value')} value="₹ 4.2 Lakh" subtext="+12% vs last season" icon={TrendingUp} color="text-green-500" />
                <StatCard title={t('active_listings')} value="2 Batches" subtext="70 Quintal Available" icon={Package} color="text-blue-500" />
                <StatCard title={t('pending_orders')} value="5 Orders" subtext="Needs Dispatch" icon={Truck} color="text-orange-500" />
                <StatCard title={t('blockchain_verified')} value="100%" subtext="All stocks traced" icon={ShieldCheck} color="text-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 text-dark-navy dark:text-white">{t('recent_stock_movement')}</h3>
                    <div className="space-y-3">
                        {MOCK_STOCK.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-organic-green/10 flex items-center justify-center text-organic-green">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-dark-navy dark:text-white">{item.crop}</div>
                                        <div className="text-xs text-gray-500">{item.id}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-dark-navy dark:text-white">₹{item.price}</div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'listed' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                                        item.status === 'sold' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                                            'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'
                                        }`}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-panel p-6 flex flex-col gap-4">
                    <h3 className="text-lg font-bold mb-2 text-dark-navy dark:text-white">{t('quick_actions')}</h3>
                    <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-organic-green text-white hover:bg-green-600 transition-colors shadow-lg shadow-organic-green/20">
                        <Plus size={24} />
                        <div className="text-left">
                            <div className="font-bold">{t('list_new_harvest')}</div>
                            <div className="text-xs opacity-90">{t('auto_fill_history')}</div>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-organic-green transition-colors text-dark-navy dark:text-white">
                        <QrCode size={24} className="text-purple-500" />
                        <div className="text-left">
                            <div className="font-bold">{t('generate_trust_passport')}</div>
                            <div className="text-xs opacity-60">{t('create_qr')}</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="pt-28 pb-12 w-full max-w-7xl mx-auto px-4 z-10 relative">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2 font-display text-dark-navy dark:text-white">{t('inventory_title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('inventory_subtitle')}</p>
                </div>

                <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 p-1 rounded-full border border-white/20 dark:border-white/10 backdrop-blur-md">
                    {['dashboard', 'stock', 'orders', 'logistics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-organic-green text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:text-organic-green'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'dashboard' ? renderDashboard() : (
                        <div className="glass-panel p-12 text-center">
                            <h3 className="text-2xl font-bold text-gray-400 mb-2">{t('module_under_construction')}</h3>
                            <p className="text-gray-500">
                                <Trans i18nKey="module_initializing" values={{ module: activeTab.toUpperCase() }}>
                                    The <b>{{ module: activeTab.toUpperCase() }}</b> module is being initialized...
                                </Trans>
                            </p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default InventoryManager;
