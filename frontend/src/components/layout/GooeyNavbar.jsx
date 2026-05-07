import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Globe, Mic, Wrench, Sprout, LogIn, LogOut, User } from 'lucide-react';
import { useThemeStore, useLanguageStore } from '../../store/themeStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavItem = ({ to, label, isActive }) => (
    <Link to={to} className={`relative px-4 py-2 z-10 text-sm font-medium transition-colors ${isActive ? "text-white" : "text-gray-600 dark:text-gray-300 hover:text-organic-green dark:hover:text-white"}`}>
        {isActive && (
            <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-organic-green rounded-full -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        )}
        <span>{label}</span>
    </Link>
);

const GooeyNavbar = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Check if user is logged in
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const NAV_GROUPS = [
        {
            id: 'ops',
            label: t('operations'),
            items: [
                { to: '/dashboard', label: t('dashboard') },
                { to: '/autonomous-farm', label: t('auto_farm') },
                { to: '/mark-my-land', label: t('land_map') },
            ]
        },
        {
            id: 'ai',
            label: t('intelligence'),
            items: [
                { to: '/crop-recommendation', label: t('crop_ai') },
                { to: '/equipment', label: t('equipment') },
                { to: '/schemes-assistant', label: t('schemes') },
            ]
        },
        {
            id: 'comm',
            label: t('commerce'),
            items: [
                { to: '/inventory', label: t('inventory'), icon: Sprout, highlight: true },
            ]
        }
    ];

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
            <div className="glass-panel px-6 py-2 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group mr-4">
                    <div className="w-9 h-9 rounded-full bg-organic-green flex items-center justify-center text-dark-navy font-bold shadow-lg shadow-organic-green/40">
                        A
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display font-bold text-lg leading-none tracking-tight text-dark-navy dark:text-white group-hover:text-organic-green transition-colors">
                            Annadata
                        </span>
                        <span className="text-[10px] uppercase tracking-widest opacity-60 font-semibold">Saathi</span>
                    </div>
                </Link>

                {/* Desktop Nav - Grouped */}
                <div className="hidden lg:flex items-center gap-2">
                    {NAV_GROUPS.map((group, groupIdx) => (
                        <div key={group.id} className="flex items-center">
                            {groupIdx > 0 && <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-2" />}
                            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-full p-1 border border-black/5 dark:border-white/5">
                                {group.items.map((link) => (
                                    <NavItem
                                        key={link.to}
                                        to={link.to}
                                        label={link.label}
                                        isActive={location.pathname === link.to}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tablet/Mobile Simplified Nav (Hidden on LG) */}
                <div className="hidden md:flex lg:hidden items-center gap-2 bg-black/5 dark:bg-white/5 rounded-full p-1">
                    <NavItem to="/dashboard" label="Dashboard" isActive={location.pathname === '/dashboard'} />
                    <NavItem to="/inventory" label="Inventory" isActive={location.pathname === '/inventory'} />
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4 ml-4">
                    {/* Premium Theme Toggle Switch */}
                    <button
                        onClick={toggleTheme}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-organic-green ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5 border border-black/5'}`}
                        aria-label="Toggle Theme"
                    >
                        <div className="absolute inset-0 flex items-center justify-between px-1.5">
                            <Sun size={12} className={`transition-opacity duration-300 ${theme === 'dark' ? 'opacity-50 text-gray-400' : 'opacity-100 text-yellow-500'}`} />
                            <Moon size={12} className={`transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100 text-sky-400' : 'opacity-50 text-gray-400'}`} />
                        </div>
                        <motion.div
                            layout
                            className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center z-10"
                            animate={{ x: theme === 'dark' ? 28 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                            {theme === 'dark'
                                ? <Moon size={10} className="text-dark-navy" />
                                : <Sun size={10} className="text-yellow-500" />
                            }
                        </motion.div>
                    </button>
                    <button
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-medium text-dark-navy dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        onClick={() => {
                            const langs = ['en', 'hi', 'mr'];
                            const nextIndex = (langs.indexOf(language) + 1) % langs.length;
                            setLanguage(langs[nextIndex]);
                        }}
                    >
                        <Globe size={14} />
                        {language.toUpperCase()}
                    </button>

                    {/* Login/Logout Button */}
                    {user ? (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-organic-green/10 border border-organic-green/20">
                                <User size={14} className="text-organic-green" />
                                <span className="text-xs font-medium text-organic-green">{user.full_name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                                <LogOut size={14} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/auth"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-organic-green text-dark-navy text-sm font-bold hover:bg-organic-green/90 transition-all shadow-lg shadow-organic-green/20"
                        >
                            <LogIn size={16} />
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden p-2 text-dark-navy dark:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="absolute top-full mt-4 w-full glass-panel-heavy p-6 flex flex-col gap-6 lg:hidden max-h-[80vh] overflow-y-auto"
                    >
                        {NAV_GROUPS.map((group) => (
                            <div key={group.id}>
                                <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">{group.label}</h4>
                                <div className="flex flex-col gap-2">
                                    {group.items.map((link) => (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            onClick={() => setIsOpen(false)}
                                            className="text-lg font-medium text-gray-300 hover:text-organic-green p-2 hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default GooeyNavbar;
