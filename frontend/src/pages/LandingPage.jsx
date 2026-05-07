import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Droplets, Sprout, CloudRain, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import DynamicFeatureSection from '../components/features/DynamicFeatureSection';

const HeroSection = () => {
    const { t } = useTranslation();
    return (
        <section className="min-h-screen flex flex-col items-start justify-center text-left px-6 md:px-20 relative z-10 max-w-7xl mx-auto">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-organic-green/10 to-transparent pointer-events-none"></div>
            <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-6xl md:text-8xl font-bold text-white pb-4 drop-shadow-sm leading-tight"
            >
                {t('landing_hero_title')}<br />
                <span className="text-organic-green">{t('landing_hero_subtitle')}</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-xl md:text-2xl text-gray-300 max-w-2xl mt-6 font-light"
            >
                {t('landing_hero_desc')}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-12 flex flex-col md:flex-row gap-6"
            >
                <Link to="/auth" className="px-8 py-4 bg-organic-green hover:bg-organic-green-600 rounded-full text-dark-navy font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-xl shadow-organic-green/20">
                    {t('get_started')} <ArrowRight size={20} />
                </Link>
                <button className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-white font-medium text-lg backdrop-blur-md transition-all">
                    {t('view_demo')}
                </button>
            </motion.div>
        </section>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="glass-panel p-8 hover:bg-white/5 transition-colors border border-white/5 hover:border-organic-green/30 group"
    >
        <div className="w-12 h-12 rounded-xl bg-organic-green/10 flex items-center justify-center mb-6 text-organic-green group-hover:scale-110 transition-transform">
            <Icon size={24} />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-organic-green transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-left">{desc}</p>
    </motion.div>
);

const FeaturesSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 px-6 md:px-12 relative z-10 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                    icon={Droplets}
                    title={t('smart_irrigation')}
                    desc={t('smart_irrigation_desc')}
                    delay={0.1}
                />
                <FeatureCard
                    icon={Sprout}
                    title={t('ai_fertilization')}
                    desc={t('ai_fertilization_desc')}
                    delay={0.2}
                />
                <FeatureCard
                    icon={CloudRain}
                    title={t('weather_forecast')}
                    desc={t('weather_forecast_desc')}
                    delay={0.3}
                />
            </div>
        </section>
    );
};

const ImpactSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 relative z-10 text-center border-t border-white/5">
            <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-4xl md:text-5xl font-bold mb-16 text-white"
            >
                {t('impact_title')} <span className="text-organic-green">{t('impact_subtitle')}</span>
            </motion.h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 max-w-6xl mx-auto">
                {[
                    { label: t("water_saved"), val: "40%" },
                    { label: t("yield_increase"), val: "25%" },
                    { label: t("farmers"), val: "10k+" },
                    { label: t("districts"), val: "15" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-organic-green/30 transition-all"
                    >
                        <span className="text-5xl md:text-6xl font-bold text-organic-green mb-2">{stat.val}</span>
                        <span className="text-gray-400 uppercase tracking-widest text-sm font-medium">{stat.label}</span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const LandingPage = () => {
    const { t } = useTranslation();
    return (
        <div className="w-full text-white overflow-hidden">
            <HeroSection />
            <DynamicFeatureSection />
            <FeaturesSection />
            <ImpactSection />

            {/* Footer */}
            <footer className="py-12 text-center text-gray-500 border-t border-white/5 z-10 relative bg-black">
                <p>{t('footer_text')}</p>
            </footer>
        </div>
    );
};

export default LandingPage;
