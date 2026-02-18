import { useState } from 'react';
import { motion } from 'framer-motion';
import type { TrendEntry, StatsPeriod } from '../../hooks/useStatsData';

interface VisitTrendChartProps {
    data: TrendEntry[];
    maxCount: number;
    period: StatsPeriod;
}

export default function VisitTrendChart({ data, maxCount, period }: VisitTrendChartProps) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const isMonth = period === 'month';
    const isYear = period === 'year';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-card-color rounded-xl p-5 md:p-6 flex flex-col gap-6 overflow-hidden"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-display uppercase tracking-wide text-text-secondary font-medium">
                    Visit Trend — {period.toUpperCase()}
                </h3>
            </div>

            {/* Chart area */}
            <div className={`flex items-end h-[180px] relative w-full ${isMonth ? 'gap-[2px]' : isYear ? 'gap-[12px]' : 'gap-[16px]'}`}>
                {data.map((entry, idx) => {
                    const heightPercent = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
                    const isHovered = hoveredIdx === idx;
                    const showValueAlways = !isMonth;

                    return (
                        <div
                            key={idx}
                            className="flex-1 flex flex-col items-center h-full relative group"
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        >
                            {/* Value Above Bar */}
                            <div className="h-6 flex items-end justify-center w-full mb-1">
                                {(showValueAlways || isHovered) && entry.count > 0 && (
                                    <motion.span
                                        initial={isHovered ? { opacity: 0, y: 4 } : { opacity: 1 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`text-[11px] font-bold text-text-primary tabular-nums ${isMonth && !isHovered ? 'hidden' : ''
                                            } ${isHovered ? 'z-10' : ''}`}
                                    >
                                        {entry.count}
                                    </motion.span>
                                )}
                            </div>

                            {/* Bar container with Track */}
                            <div className="flex-1 w-full bg-gray-50/50 rounded-t-md relative flex flex-col justify-end overflow-hidden">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(heightPercent, 2)}%` }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 0.1 + idx * (isMonth ? 0.01 : 0.03),
                                        ease: [0.33, 1, 0.68, 1],
                                    }}
                                    className={`w-full rounded-t-sm min-h-[4px] transition-all duration-200 relative ${entry.isCurrent
                                            ? 'bg-accent-red shadow-[0_0_15px_rgba(255,51,102,0.4)]'
                                            : isHovered
                                                ? 'bg-accent-red/80'
                                                : isMonth ? 'bg-accent-red/50' : 'bg-accent-red/60'
                                        }`}
                                >
                                    {/* Highlight effect for wider bars */}
                                    {!isMonth && (
                                        <div className="absolute inset-0 w-1/3 bg-white/10" />
                                    )}
                                </motion.div>
                            </div>

                            {/* Label Section */}
                            <div className="h-8 flex items-center justify-center w-full">
                                <span
                                    className={`text-[10px] font-display uppercase tracking-wider shrink-0 transition-opacity ${entry.isCurrent ? 'text-accent-red font-bold' : 'text-text-muted font-medium'
                                        } ${isMonth && idx % 5 !== 0 && !entry.isCurrent ? 'opacity-0' : 'opacity-100'}`}
                                >
                                    {entry.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
