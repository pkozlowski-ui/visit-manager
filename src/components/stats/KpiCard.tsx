import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
    icon: LucideIcon;
    label: string;
    value: number | string;
    trend?: number;          // percentage change vs previous period
    trendLabel?: string;     // e.g. "vs last week"
    accentColor?: string;    // color for the icon background
    delay?: number;
}

export default function KpiCard({
    icon: Icon,
    label,
    value,
    trend,
    trendLabel,
    accentColor = 'var(--color-accent-red)',
    delay = 0,
}: KpiCardProps) {
    const trendIsPositive = trend !== undefined && trend > 0;
    const trendIsNegative = trend !== undefined && trend < 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-card-color rounded-xl p-5 flex flex-col gap-3"
        >
            {/* Icon + Label row */}
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}12` }}
                >
                    <Icon size={18} style={{ color: accentColor }} />
                </div>
                <span className="text-text-secondary text-[13px] font-medium uppercase tracking-wide font-display">
                    {label}
                </span>
            </div>

            {/* Value */}
            <div className="flex items-end gap-3">
                <span className="text-[32px] font-bold leading-none text-text-primary font-ui tracking-tight">
                    {value}
                </span>

                {trend !== undefined && (
                    <div className="flex items-center gap-1 pb-1">
                        <span
                            className={`text-[12px] font-semibold ${trendIsPositive
                                    ? 'text-emerald-500'
                                    : trendIsNegative
                                        ? 'text-red-400'
                                        : 'text-text-muted'
                                }`}
                        >
                            {trendIsPositive ? '↑' : trendIsNegative ? '↓' : '→'}
                            {Math.abs(trend)}%
                        </span>
                        {trendLabel && (
                            <span className="text-[11px] text-text-muted">{trendLabel}</span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
