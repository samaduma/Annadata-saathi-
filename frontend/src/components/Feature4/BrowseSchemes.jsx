// =========================
// Core React Imports
// =========================
import React, { useState, useEffect } from 'react';

// UI Icons
import { Search, Filter, Loader2, AlertCircle } from 'lucide-react';

// Reusable Scheme Card Component
import SchemeCard from './SchemeCard';

/**
 * BrowseSchemes
 * --------------------------------------------------
 * Discovery & exploration interface for government schemes.
 *
 * Responsibilities:
 * 1. Fetch available schemes from backend
 * 2. Apply intelligent filtering (search, state, category)
 * 3. Gracefully fallback to mock data if backend is unavailable
 * 4. Allow users to apply to schemes via child components
 */
const BrowseSchemes = ({ profile, onApply }) => {

    // =========================
    // Data State
    // =========================
    const [schemes, setSchemes] = useState([]);               // Raw schemes list
    const [filteredSchemes, setFilteredSchemes] = useState([]); // Filtered result set
    const [states, setStates] = useState([]);                 // Available states for filtering

    // =========================
    // UI State
    // =========================
    const [loading, setLoading] = useState(true);             // Loading indicator
    const [error, setError] = useState(null);                 // Error message (if any)

    // =========================
    // Filter State
    // =========================
    const [searchQuery, setSearchQuery] = useState('');       // Text search
    const [selectedState, setSelectedState] = useState('');   // State filter
    const [selectedCategory, setSelectedCategory] = useState(''); // Category filter

    // ======================================================
    // INITIAL DATA FETCH
    // ======================================================
    useEffect(() => {
        fetchSchemes();
    }, []);

    // ======================================================
    // APPLY FILTERS WHEN INPUT CHANGES
    // ======================================================
    useEffect(() => {
        filterSchemes();
    }, [schemes, searchQuery, selectedState, selectedCategory]);

    // ======================================================
    // FETCH SCHEMES FROM BACKEND
    // ======================================================
    /**
     * Attempts to fetch schemes from API.
     * Falls back to mock data if:
     * - Backend is unreachable
     * - API quota exceeded
     * - Empty dataset returned
     */
    const fetchSchemes = async () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8002';

        try {
            setLoading(true);

            // Optional state-based personalization
            const stateParam = profile?.state
                ? `?state=${encodeURIComponent(profile.state)}`
                : '';

            const response = await fetch(
                `${apiUrl}/api/feature4/schemes${stateParam}`
            );

            // Handle API-level errors
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Force fallback if API returns empty data
            if (!data.schemes || data.schemes.length === 0) {
                throw new Error("No schemes returned");
            }

            setSchemes(data.schemes);
            setStates(data.available_states || []);
            setError(null);

        } catch (err) {
            // ----------------------------------
            // MOCK DATA FALLBACK (DEMO MODE)
            // ----------------------------------
            console.warn("Backend unavailable, using mock data for demonstration.");

            setSchemes([
                {
                    scheme_name: "PM-KISAN Samman Nidhi",
                    description:
                        "Income support of ₹6,000 per year in three equal installments to all land holding farmer families.",
                    category: "Central Scheme",
                    state: "All India",
                    subsidy_percentage: 100,
                    formatted_max_amount: "₹6,000/year",
                    tags: ["Financial Support", "Small Farmers"]
                },
                {
                    scheme_name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                    description:
                        "Crop insurance scheme providing financial support against crop loss.",
                    category: "Central Scheme",
                    state: "All India",
                    subsidy_percentage: 98,
                    formatted_max_amount: "Cover varies",
                    tags: ["Insurance", "Crop Loss"]
                },
                {
                    scheme_name: "National Mission for Sustainable Agriculture (NMSA)",
                    description:
                        "Promoting organic farming and soil health management.",
                    category: "Central Scheme",
                    state: "All India",
                    subsidy_percentage: 50,
                    formatted_max_amount: "₹50,000/ha",
                    tags: ["Sustainability", "Organic"]
                },
                {
                    scheme_name: "Tractor Subsidy Scheme",
                    description:
                        "Subsidy on purchase of new tractors for farm mechanization.",
                    category: "State Scheme",
                    state: "Maharashtra",
                    subsidy_percentage: 40,
                    formatted_max_amount: "₹1.25 Lakhs",
                    tags: ["Mechanization", "Equipment"]
                },
                {
                    scheme_name: "Drip Irrigation Subsidy",
                    description:
                        "Financial assistance for installing drip irrigation systems.",
                    category: "State Scheme",
                    state: "Punjab",
                    subsidy_percentage: 80,
                    formatted_max_amount: "₹45,000/acre",
                    tags: ["Irrigation", "Water Saving"]
                }
            ]);

            setStates([
                "Maharashtra",
                "Punjab",
                "Uttar Pradesh",
                "Madhya Pradesh",
                "All India"
            ]);

            setError(null);

        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // FILTER LOGIC
    // ======================================================
    /**
     * Applies:
     * 1. Text search
     * 2. State filter (with Central Scheme override)
     * 3. Category filter
     */
    const filterSchemes = () => {
        let filtered = [...schemes];

        // Text Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.scheme_name.toLowerCase().includes(query) ||
                s.description.toLowerCase().includes(query)
            );
        }

        // State Filter
        if (selectedState) {
            filtered = filtered.filter(s =>
                s.state === selectedState ||
                s.category === 'Central Scheme'
            );
        }

        // Category Filter
        if (selectedCategory) {
            filtered = filtered.filter(
                s => s.category === selectedCategory
            );
        }

        setFilteredSchemes(filtered);
    };

    // ======================================================
    // LOADING STATE
    // ======================================================
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2
                    className="animate-spin text-organic-green"
                    size={40}
                />
            </div>
        );
    }

    // ======================================================
    // ERROR STATE
    // ======================================================
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <AlertCircle size={40} className="text-red-400 mb-4" />
                <p>{error}</p>
                <button
                    onClick={fetchSchemes}
                    className="mt-4 px-4 py-2 bg-organic-green rounded-lg text-white"
                >
                    Retry
                </button>
            </div>
        );
    }

    // ======================================================
    // MAIN UI RENDER
    // ======================================================
    return (
        <div className="space-y-6">

            {/* =====================
                FILTER CONTROLS
            ===================== */}
            <div className="flex flex-wrap gap-4">

                {/* Search Input */}
                <div className="flex-1 min-w-[200px] relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search schemes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg
                                   pl-10 pr-4 py-2 text-white placeholder-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-organic-green"
                    />
                </div>

                {/* State Filter */}
                <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2
                               text-white focus:outline-none focus:ring-2 focus:ring-organic-green"
                >
                    <option value="">All States</option>
                    {states.map(state => (
                        <option key={state} value={state}>
                            {state}
                        </option>
                    ))}
                </select>

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2
                               text-white focus:outline-none focus:ring-2 focus:ring-organic-green"
                >
                    <option value="">All Categories</option>
                    <option value="Central Scheme">Central Schemes</option>
                    <option value="State Scheme">State Schemes</option>
                </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-400">
                Showing {filteredSchemes.length} of {schemes.length} schemes
            </div>

            {/* Schemes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSchemes.map((scheme, idx) => (
                    <SchemeCard
                        key={idx}
                        scheme={scheme}
                        onApply={onApply}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredSchemes.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                    No schemes found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default BrowseSchemes;
