import React from 'react';
import { FileText, MapPin, Percent, ArrowRight } from 'lucide-react';

const SchemeCard = ({ scheme, onApply }) => {
    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-organic-green/50 transition-all group">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${scheme.category === 'Central Scheme'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                        {scheme.category}
                    </span>
                    {scheme.state && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-300 ml-2">
                            <MapPin size={10} className="inline mr-1" />
                            {scheme.state}
                        </span>
                    )}
                </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-organic-green transition-colors">
                {scheme.scheme_name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {scheme.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Max Subsidy</div>
                    <div className="text-organic-green font-bold">{scheme.formatted_max_amount}</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Percentage</div>
                    <div className="text-white font-bold flex items-center">
                        <Percent size={14} className="mr-1 text-organic-green" />
                        {scheme.subsidy_percentage}%
                    </div>
                </div>
            </div>

            {/* Eligibility */}
            {scheme.eligibility && scheme.eligibility.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Eligibility</div>
                    <div className="flex flex-wrap gap-1">
                        {scheme.eligibility.slice(0, 2).map((e, i) => (
                            <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-gray-300">
                                {e}
                            </span>
                        ))}
                        {scheme.eligibility.length > 2 && (
                            <span className="text-xs text-gray-500">+{scheme.eligibility.length - 2} more</span>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onApply(scheme)}
                    className="flex-1 bg-organic-green hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    Apply Now
                    <ArrowRight size={16} />
                </button>
                {scheme.application_url && (
                    <a
                        href={scheme.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                    >
                        Official Site
                    </a>
                )}
            </div>
        </div>
    );
};

export default SchemeCard;
