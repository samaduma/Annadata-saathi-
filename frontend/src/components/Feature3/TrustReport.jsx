// =========================
// Core React & Routing
// =========================
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Animation & UI
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    Calendar,
    Droplets,
    Sprout,
    Leaf,
    Activity,
    CheckCircle2,
    AlertTriangle,
    Box
} from 'lucide-react';

// Internationalization
import { useTranslation } from 'react-i18next';

/**
 * TrustReport
 * --------------------------------------------------
 * Blockchain-backed Trust Passport for agricultural produce.
 *
 * Responsibilities:
 * 1. Fetch immutable blockchain timeline for a crop batch
 * 2. Verify authenticity and tamper status
 * 3. Display farm-to-market lifecycle transparently
 * 4. Build consumer trust using verifiable data
 */
const TrustReport = () => {

    // =========================
    // i18n Translation Hook
    // =========================
    const { t } = useTranslation();

    // =========================
    // Route Parameter
    // =========================
    // batchId uniquely identifies a crop batch on the ledger
    const { batchId } = useParams();

    // =========================
    // Component State
    // =========================
    const [reportData, setReportData] = useState(null); // Blockchain report payload
    const [loading, setLoading] = useState(true);       // Ledger verification loader
    const [error, setError] = useState('');             // Error handling state

    // ======================================================
    // FETCH BLOCKCHAIN TIMELINE
    // ======================================================
    /**
     * Fetches the full immutable lifecycle of a crop batch:
     * - Genesis (registration)
     * - Farming actions
     * - Harvest & logistics
     */
    useEffect(() => {
        const fetchTimeline = async () => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8002';
            try {
                const res = await fetch(`${apiUrl}/api/feature6/timeline/${batchId}`);
                const data = await res.json();
                setReportData(data);
            } catch (err) {
                setError("Could not load blockchain report.");
            } finally {
                setLoading(false);
            }
        };

        if (batchId) fetchTimeline();
    }, [batchId]);

    // ======================================================
    // LOADING STATE (LEDGER VERIFICATION)
    // ======================================================
    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-mono animate-pulse">
                VERIFYING BLOCKCHAIN LEDGER...
            </p>
        </div>
    );

    // ======================================================
    // ERROR / INVALID STATE
    // ======================================================
    if (error || !reportData) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Verification Failed
                </h2>
                <p className="text-slate-500">
                    {error || "Batch not found."}
                </p>
            </div>
        </div>
    );

    // ======================================================
    // DESTRUCTURE REPORT DATA
    // ======================================================
    const { product_info, timeline, is_valid } = reportData;

    // ======================================================
    // MAIN TRUST REPORT UI
    // ======================================================
    return (
        <div className="min-h-screen bg-[#F0FDF4] font-sans pb-20">

            {/* ==================================================
                CERTIFICATE HEADER / TRUST BANNER
            ================================================== */}
            <div className="bg-emerald-600 text-white pt-12 pb-24 px-6 relative overflow-hidden">

                {/* Watermark Icon */}
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3">
                    <ShieldCheck size={400} />
                </div>

                {/* Header Content */}
                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-700/50 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-emerald-400/30">
                        <ShieldCheck size={14} className="text-emerald-300" />
                        Trust Passport • Verified by Annadata Saathi
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                        {product_info?.crop_name || "Crop"} Batch
                    </h1>

                    <p className="text-emerald-100 text-lg opacity-90 max-w-lg mx-auto">
                        This product's entire journey from farm to market has been
                        cryptographically secured on our blockchain.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 -mt-16 relative z-20">

                {/* ==================================================
                    AUTHENTICITY STATUS CARD
                ================================================== */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-b-4 border-emerald-500 flex flex-col items-center text-center">
                    {is_valid ? (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 size={40} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                100% Authentic & Untampered
                            </h2>
                            <p className="text-slate-500 mt-2 text-sm">
                                The digital signature of this batch matches the immutable ledger record.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={40} className="text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-red-600">
                                Tampering Detected
                            </h2>
                            <p className="text-slate-500 mt-2 text-sm">
                                The data has been modified. Do not trust this source.
                            </p>
                        </>
                    )}
                </div>

                {/* ==================================================
                    PRODUCT SPECIFICATIONS
                ================================================== */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
                        Product Specifications
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Batch ID */}
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Batch ID</div>
                            <div
                                className="font-mono font-bold text-slate-700 text-sm truncate"
                                title={product_info?.batch_id}
                            >
                                {product_info?.batch_id}
                            </div>
                        </div>

                        {/* Variety */}
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Variety</div>
                            <div className="font-bold text-slate-700">
                                {product_info?.variety}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Volume</div>
                            <div className="font-bold text-slate-700">
                                {product_info?.quantity} Q
                            </div>
                        </div>

                        {/* Farmer ID */}
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Farmer ID</div>
                            <div className="font-mono text-slate-600 text-xs truncate">
                                {product_info?.farmer_id}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================================================
                    BLOCKCHAIN TIMELINE
                ================================================== */}
                <div className="relative pl-8 border-l-2 border-slate-200 space-y-12">
                    {timeline.map((block, index) => (
                        <div key={index} className="relative group">

                            {/* Timeline Node */}
                            <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 border-slate-300
                                            group-hover:border-emerald-500 transition-colors z-10 flex items-center justify-center">
                                <div className="w-2 h-2 bg-slate-300 group-hover:bg-emerald-500 rounded-full transition-colors"></div>
                            </div>

                            {/* Event Card */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100
                                            group-hover:border-emerald-500/30 group-hover:shadow-md transition-all">

                                {/* Event Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 text-slate-500 rounded-lg
                                                        group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            {block.event === 'SOWING' && <Sprout size={20} />}
                                            {block.event === 'IRRIGATION' && <Droplets size={20} />}
                                            {block.event === 'FERTILIZER' && <Leaf size={20} />}
                                            {block.event === 'HARVEST' && <Box size={20} />}
                                            {block.event === 'GENESIS' && <ShieldCheck size={20} />}
                                            {!['SOWING', 'IRRIGATION', 'FERTILIZER', 'HARVEST', 'GENESIS']
                                                .includes(block.event) && <Activity size={20} />}
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-slate-800">
                                                {block.event}
                                            </h4>
                                            <div className="text-xs text-slate-400 font-mono">
                                                {new Date(block.timestamp * 1000).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right hidden sm:block">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">
                                            Block #{block.index}
                                        </div>
                                    </div>
                                </div>

                                {/* Event Data */}
                                {block.data && Object.keys(block.data).length > 0 && (
                                    <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 font-mono space-y-1">
                                        {Object.entries(block.data).map(([k, v]) => (
                                            <div key={k} className="flex justify-between">
                                                <span className="text-slate-400">{k}:</span>
                                                <span className="font-bold">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Hash Footer */}
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2
                                                text-[10px] text-slate-300 font-mono truncate">
                                    <ShieldCheck size={12} />
                                    <span>HASH: {block.hash}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ==================================================
                    CALL TO ACTION
                ================================================== */}
                <div className="mt-12 bg-emerald-700 rounded-3xl p-8 text-center shadow-2xl shadow-emerald-900/20">
                    <h3 className="text-2xl font-bold text-white mb-2">
                        Want this Fresh Produce?
                    </h3>
                    <p className="text-emerald-100/70 mb-6 font-medium">
                        Verified source. Direct from farmer. Cryptographically secured.
                    </p>

                    <button
                        onClick={() => window.open('https://farmer-mart-drab.vercel.app/', '_blank')}
                        className="px-10 py-4 bg-white text-emerald-700 font-bold rounded-2xl
                                   hover:bg-emerald-50 transition-all flex items-center justify-center gap-2
                                   mx-auto active:scale-95 shadow-xl"
                    >
                        <Box size={20} /> Buy Fresh Direct
                    </button>

                    <p className="mt-4 text-[10px] text-emerald-300/50 uppercase tracking-widest font-bold">
                        Encrypted Transaction Powered by AnnadataSaathi
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TrustReport;
