import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, CloudLightning, CloudSnow, MapPin, Loader2, AlertCircle, Droplets, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WeatherForecast = () => {
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('Locating...');
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        const fetchWeather = async (lat, lon) => {
            try {
                const apiKey = import.meta.env.VITE_OPEN_WEATHER_MAP_API;
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
                );

                if (!response.ok) throw new Error('Failed to fetch weather');

                const data = await response.json();
                setLocationName(data.city.name);

                // Filter for one reading per day (closest to noon 12:00:00)
                // The API returns 3-hour steps. We want 5 distinct days.
                const dailyData = [];
                const seenDates = new Set();

                // Get today's date string YYYY-MM-DD
                const today = new Date().toISOString().split('T')[0];

                for (const item of data.list) {
                    const date = item.dt_txt.split(' ')[0];
                    if (date !== today && !seenDates.has(date) && item.dt_txt.includes("12:00:00")) {
                        dailyData.push(item);
                        seenDates.add(date);
                    }
                }

                // If we didn't get enough "12:00" slots (maybe it's night), take the first available slot for each new day
                if (dailyData.length < 4) {
                    for (const item of data.list) {
                        const date = item.dt_txt.split(' ')[0];
                        if (date !== today && !seenDates.has(date)) {
                            dailyData.push(item);
                            seenDates.add(date);
                        }
                        if (dailyData.length >= 4) break;
                    }
                }

                // Get current weather for "Today"
                const currentResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
                );
                const currentData = await currentResponse.json();

                const finalData = [currentData, ...dailyData.slice(0, 4)];
                setForecast(finalData);
                setSelectedDay(finalData[0]); // Select today by default
                setLoading(false);

            } catch (err) {
                console.error("Weather Error:", err);
                setError("Unavailable");
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    setError("Location Denied");
                    setLoading(false);
                }
            );
        } else {
            setError("No GPS");
            setLoading(false);
        }
    }, []);

    const getWeatherIcon = (condition, className = "") => {
        const main = condition?.toLowerCase();
        if (main?.includes('rain') || main?.includes('drizzle')) return <CloudRain size={20} className={`text-sky-500 ${className}`} />;
        if (main?.includes('cloud')) return <Cloud size={20} className={`text-gray-400 ${className}`} />;
        if (main?.includes('clear')) return <Sun size={20} className={`text-yellow-500 ${className}`} />;
        if (main?.includes('thunder')) return <CloudLightning size={20} className={`text-purple-500 ${className}`} />;
        if (main?.includes('snow')) return <CloudSnow size={20} className={`text-cyan-300 ${className}`} />;
        return <Sun size={20} className={`text-yellow-500 ${className}`} />;
    };

    const getDayName = (dateStr) => {
        if (!dateStr) return 'Today';
        const date = new Date(dateStr * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    if (loading) return (
        <div className="glass-panel p-6 flex flex-col items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin text-organic-green mb-2" />
            <span className="text-xs text-gray-500 animate-pulse">Loading Forecast...</span>
        </div>
    );

    if (error) return (
        <div className="glass-panel p-6 flex flex-col items-center justify-center h-full text-center">
            <AlertCircle size={32} className="text-red-400 mb-2" />
            <span className="text-xs text-gray-500">{error}</span>
        </div>
    );

    return (
        <div className="glass-panel p-6 relative overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-lg font-bold text-dark-navy dark:text-white flex items-center gap-2">
                    Field Weather
                    <span className="text-[10px] font-normal bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin size={10} /> {locationName}
                    </span>
                </h3>
            </div>

            {/* Scrollable Container (Hidden Scrollbar) */}
            <div
                className="flex items-center gap-3 overflow-x-auto pb-2 snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style>{`
                    div::-webkit-scrollbar { display: none; }
                `}</style>

                {forecast.map((day, i) => {
                    const isSelected = selectedDay === day;
                    return (
                        <motion.button
                            key={i}
                            onClick={() => setSelectedDay(day)}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex flex-col items-center p-3 rounded-2xl min-w-[70px] snap-center transition-all duration-300 border ${isSelected
                                ? 'bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)] scale-105'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <span className={`text-xs mb-2 font-bold ${isSelected ? 'text-sky-400' : 'text-gray-500'}`}>
                                {getDayName(day.dt)}
                            </span>
                            {React.cloneElement(getWeatherIcon(day.weather[0].main), {
                                size: isSelected ? 24 : 20,
                                className: isSelected ? "mb-2 drop-shadow-md" : "mb-2 opacity-80"
                            })}
                            <span className={`text-lg font-black ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                {Math.round(day.main.temp)}°
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Detailed View for Selected Day (Sliding Up) */}
            <AnimatePresence mode="wait">
                {selectedDay && (
                    <motion.div
                        key={selectedDay.dt || 'today'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4"
                    >
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                            <Wind size={18} className="text-gray-400" />
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Wind</div>
                                <div className="text-sm font-bold text-white">{selectedDay.wind.speed} m/s</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                            <Droplets size={18} className="text-blue-400" />
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Humidity</div>
                                <div className="text-sm font-bold text-white">{selectedDay.main.humidity}%</div>
                            </div>
                        </div>
                        <div className="col-span-2 text-center text-xs text-gray-400 italic">
                            "{selectedDay.weather[0].description}"
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WeatherForecast;
