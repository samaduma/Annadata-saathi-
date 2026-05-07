import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import TodaysActionCard from '../components/features/TodaysActionCard';
import ZoneMap from '../components/features/ZoneMap';
import AIExplanationCard from '../components/features/AIExplanationCard';
import SoilHealthCards from '../components/features/SoilHealthCards';
import CropHealth from '../components/features/CropHealth';
import MandiPrices from '../components/features/MandiPrices';
import WeatherForecast from '../components/features/WeatherForecast';
import SmartIrrigation from '../components/features/SmartIrrigation';
import { ArrowRight, Bell, Settings } from 'lucide-react';

const DashboardSection = ({ title, children, className = "" }) => (
    <div className={`flex flex-col h-full ${className}`}>
        {title && <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs mb-3 ml-1">{title}</h3>}
        {children}
    </div>
);

// ... (DashboardSection is at the top, modifying it effectively)

// ... (skipping to footer area)

const FarmerDashboard = () => {
    const { t } = useTranslation();
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const [sensorData, setSensorData] = useState(null);

    useEffect(() => {
        const fetchSensorData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userId = user.id || 'HARDWARE_DEFAULT';

                console.log(`Fetching sensor data for ${userId}...`);
                // Fetch from your Python backend
                const response = await fetch('http://172.16.28.196:8000/api/hardware/latest?user_id=HARDWARE_DEFAULT');
                console.log('Sensor API Response Status:', response.status);

                const result = await response.json();
                console.log('Sensor API Result:', result);

                if (result.status === 'success' && result.data) {
                    setSensorData(result.data);
                }
            } catch (error) {
                console.error('Error fetching sensor data from backend:', error);
            }
        };

        // Initial fetch
        fetchSensorData();

        // Poll every 5 seconds
        const intervalId = setInterval(fetchSensorData, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="min-h-screen pt-28 px-4 pb-12 max-w-[1600px] mx-auto z-10 relative">

            {/* Header */}
            <div className="flex justify-between items-end mb-8 px-2">
                <div>
                    <h1 className="text-4xl font-bold mb-1 font-display text-dark-navy dark:text-white">{t('namaste')}, Rajesh Farm</h1>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-organic-green animate-pulse"></span>
                        {t('system_status_online')}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="p-3 bg-white/50 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 key-button rounded-full relative transition-colors shadow-sm">
                        <Bell size={24} className="text-dark-navy dark:text-white" />
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-dark-navy"></span>
                    </button>
                    <button className="p-3 bg-white/50 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 key-button rounded-full transition-colors shadow-sm">
                        <Settings size={24} className="text-dark-navy dark:text-white" />
                    </button>
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-6 auto-rows-min"
            >
                {/* ROW 1: PRIMARY ACTION & MAP (Hero) */}
                <motion.div variants={item} className="col-span-1 md:col-span-8 lg:col-span-5 row-span-2 min-h-[400px]">
                    <DashboardSection title={t('primary_decision')}>
                        <TodaysActionCard sensorData={sensorData} />
                    </DashboardSection>
                </motion.div>

                <motion.div variants={item} className="col-span-1 md:col-span-4 lg:col-span-3 min-h-[250px]">
                    <DashboardSection title={t('irrigation_zones')}>
                        <ZoneMap />
                    </DashboardSection>
                </motion.div>

                <motion.div variants={item} className="col-span-1 md:col-span-12 lg:col-span-4 min-h-[250px]">
                    <DashboardSection title={t('explainable_ai')}>
                        <AIExplanationCard />
                    </DashboardSection>
                </motion.div>

                {/* ROW 2: FERTILIZER & WEATHER */}
                <motion.div variants={item} className="col-span-1 md:col-span-6 lg:col-span-4 min-h-[200px]">
                    <DashboardSection title={t('soil_health_title')}>
                        <SoilHealthCards sensorData={sensorData} />
                    </DashboardSection>
                </motion.div>

                <motion.div variants={item} className="col-span-1 md:col-span-6 lg:col-span-3 min-h-[200px]">
                    <DashboardSection title={t('field_weather')}>
                        <Tilt className="w-full h-full" options={{ max: 10, scale: 1.02 }}>
                            <WeatherForecast />
                        </Tilt>
                    </DashboardSection>
                </motion.div>

                {/* ROW 3: DETAILED TOOLS */}
                <motion.div variants={item} className="col-span-1 md:col-span-6 lg:col-span-4">
                    <DashboardSection title={t('crop_vision')}>
                        <Tilt className="w-full h-full" options={{ max: 10, scale: 1.02 }}>
                            <CropHealth />
                        </Tilt>
                    </DashboardSection>
                </motion.div>

                <motion.div variants={item} className="col-span-1 md:col-span-6 lg:col-span-4">
                    <DashboardSection title={t('market_intel')}>
                        <Tilt className="w-full h-full" options={{ max: 10, scale: 1.02 }}>
                            <MandiPrices />
                        </Tilt>
                    </DashboardSection>
                </motion.div>

                <motion.div variants={item} className="col-span-1 md:col-span-12 lg:col-span-4">
                    <DashboardSection title={t('smart_controls')}>
                        <Tilt className="w-full h-full" options={{ max: 10, scale: 1.02 }}>
                            <SmartIrrigation sensorData={sensorData} /> {/* Pass sensorData to SmartIrrigation */}
                        </Tilt>
                    </DashboardSection>
                </motion.div>

            </motion.div>

            {/* Floating Learning Timeline (Footer style) */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-12 p-6 glass-panel flex items-center justify-between"
            >
                <div>
                    <h4 className="font-bold mb-1 text-dark-navy dark:text-white">{t('ai_learning_progress')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('ai_learning_desc')}</p>
                </div>
                <div className="flex-1 mx-8 max-w-xl">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>{t('day_1')}</span>
                        <span>{t('day_15')}</span>
                        <span>{t('day_30')}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 bg-organic-green w-[65%] rounded-full shadow-[0_0_10px_#22c55e]"></div>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-organic-green font-bold hover:underline">
                    {t('view_analysis')} <ArrowRight size={18} />
                </button>
            </motion.div>

        </div>
    );
};

export default FarmerDashboard;
