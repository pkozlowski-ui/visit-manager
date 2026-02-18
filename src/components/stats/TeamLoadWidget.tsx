import { motion } from 'framer-motion';
import type { TeamLoadEntry } from '../../hooks/useStatsData';

interface TeamLoadWidgetProps {
    data: TeamLoadEntry[];
}

export default function TeamLoadWidget({ data }: TeamLoadWidgetProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-card-color rounded-xl p-5 flex flex-col gap-4 min-h-[300px]"
        >
            <h3 className="text-[13px] font-display uppercase tracking-wide text-text-secondary font-medium">
                Team Load
            </h3>

            <div className="flex-1 flex flex-wrap items-center justify-center gap-8 py-4">
                {data.map((entry, idx) => {
                    const isOverloaded = entry.loadPercent > 85;
                    const radius = 45;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (entry.loadPercent / 100) * circumference;
                    const color = entry.specialist.color || '#94a3b8';

                    return (
                        <div key={entry.specialist.id} className="flex flex-col items-center gap-3">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* SVG Circle */}
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    {/* Background Circle */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r={radius}
                                        fill="transparent"
                                        stroke="rgba(0,0,0,0.05)"
                                        strokeWidth="8"
                                    />
                                    {/* Progress Circle */}
                                    <motion.circle
                                        cx="50"
                                        cy="50"
                                        r={radius}
                                        fill="transparent"
                                        stroke={color}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset }}
                                        transition={{
                                            duration: 1,
                                            delay: 0.3 + idx * 0.1,
                                            ease: [0.25, 0.46, 0.45, 0.94],
                                        }}
                                        className={isOverloaded ? 'opacity-80' : ''}
                                    />
                                </svg>

                                {/* Center content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-xl font-display font-bold ${isOverloaded ? 'text-accent-red' : 'text-text-primary'}`}>
                                        {entry.loadPercent}%
                                    </span>
                                    <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                                        Load
                                    </span>
                                </div>

                                {isOverloaded && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-accent-red rounded-full border-2 border-card-color animate-pulse" title="Overloaded" />
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[14px] font-bold text-text-primary">
                                    {entry.specialist.name}
                                </span>
                                <span className="text-[11px] text-text-muted uppercase tracking-wider">
                                    {entry.visitCount} visits
                                </span>
                            </div>
                        </div>
                    );
                })}

                {data.length === 0 && (
                    <p className="text-[13px] text-text-muted italic">No team data available</p>
                )}
            </div>
        </motion.div>
    );
}
