import React from 'react';
import { motion } from 'framer-motion';
import {
    Wrench,
    AlertTriangle,
    CheckCircle,
    AlertCircle,
    Activity,
    Gauge,
    Info
} from 'lucide-react';

/**
 * EquipmentHealthCard Component
 * 
 * Displays the AI analysis results for equipment.
 * Features:
 * - Equipment identification
 * - Health score with color-coded indicator
 * - Condition status
 * - Issues list with severity
 * - Confidence percentage
 */

const EquipmentHealthCard = ({ analysis, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="glass-panel p-6 rounded-2xl animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-xl" />
                    <div className="flex-1">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
                    </div>
                </div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="glass-panel p-6 rounded-2xl text-center">
                <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                    No analysis data available
                </p>
            </div>
        );
    }

    const {
        equipment_name,
        equipment_type,
        brand,
        model,
        health_score,
        condition,
        issues = [],
        summary,
        confidence
    } = analysis;

    // Health score color mapping
    const getHealthColor = (score) => {
        if (score >= 90) return { bg: 'bg-green-500', text: 'text-green-500', glow: 'shadow-green-500/50' };
        if (score >= 70) return { bg: 'bg-lime-500', text: 'text-lime-500', glow: 'shadow-lime-500/50' };
        if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-500', glow: 'shadow-yellow-500/50' };
        if (score >= 30) return { bg: 'bg-orange-500', text: 'text-orange-500', glow: 'shadow-orange-500/50' };
        return { bg: 'bg-red-500', text: 'text-red-500', glow: 'shadow-red-500/50' };
    };

    const healthColors = getHealthColor(health_score);

    // Condition icon mapping
    const getConditionIcon = (cond) => {
        switch (cond?.toLowerCase()) {
            case 'excellent':
            case 'good':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'fair':
                return <AlertCircle className="text-yellow-500" size={20} />;
            case 'poor':
            case 'critical':
                return <AlertTriangle className="text-red-500" size={20} />;
            default:
                return <Info className="text-gray-500" size={20} />;
        }
    };

    // Severity color mapping
    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'high':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'low':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-2xl"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${healthColors.bg} ${healthColors.glow} shadow-lg`}>
                        <Wrench size={28} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {equipment_name || 'Unknown Equipment'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {equipment_type}
                            {brand && ` • ${brand}`}
                            {model && ` ${model}`}
                        </p>
                    </div>
                </div>

                {/* Confidence Badge */}
                {confidence && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Activity size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {Math.round(confidence * 100)}% confident
                        </span>
                    </div>
                )}
            </div>

            {/* Health Score */}
            <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="relative">
                    <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <motion.circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeLinecap="round"
                            className={healthColors.text}
                            initial={{ strokeDasharray: '0 251.2' }}
                            animate={{
                                strokeDasharray: `${(health_score / 100) * 251.2} 251.2`
                            }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${healthColors.text}`}>
                            {health_score}
                        </span>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {getConditionIcon(condition)}
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">
                            {condition} Condition
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {summary}
                    </p>
                </div>
            </div>

            {/* Issues List */}
            {issues.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Identified Issues ({issues.length})
                    </h4>
                    <div className="space-y-2">
                        {issues.map((issue, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                            >
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                                    {issue.severity}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                                        {issue.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {issue.affected_part} • {issue.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Issues */}
            {issues.length === 0 && (
                <div className="text-center py-4">
                    <CheckCircle size={32} className="mx-auto text-green-500 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        No issues detected! Equipment appears to be in good condition.
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default EquipmentHealthCard;
