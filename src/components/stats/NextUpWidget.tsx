import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { NextUpVisit } from '../../hooks/useStatsData';
import { useServices } from '../../context/ServiceContext';

interface NextUpWidgetProps {
    data: NextUpVisit[];
}

export default function NextUpWidget({ data }: NextUpWidgetProps) {
    const { services } = useServices();

    const getServiceName = (visit: NextUpVisit) => {
        if (visit.visit.customTags?.length) return visit.visit.customTags[0];
        if (visit.visit.serviceIds?.length) {
            const service = services.find(s => s.id === visit.visit.serviceIds![0]);
            return service?.name || '—';
        }
        return '—';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-card-color rounded-xl p-5 flex flex-col gap-4"
        >
            <h3 className="text-[13px] font-display uppercase tracking-wide text-text-secondary font-medium">
                Next Up Today
            </h3>

            <div className="flex flex-col gap-2">
                {data.length > 0 ? (
                    data.map((entry, idx) => (
                        <motion.div
                            key={entry.visit.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.35 + idx * 0.06 }}
                            className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            {/* Time */}
                            <span className="text-[14px] font-bold tabular-nums text-text-primary w-12 shrink-0 font-display">
                                {entry.timeLabel}
                            </span>

                            {/* Specialist dot + name */}
                            <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: entry.specialistColor }}
                            />
                            <span className="text-[13px] font-semibold text-text-primary truncate">
                                {entry.specialistName}
                            </span>

                            {/* Arrow */}
                            <span className="text-text-muted text-[11px] shrink-0">→</span>

                            {/* Client + Service */}
                            <div className="flex-1 min-w-0 text-right">
                                <span className="text-[13px] text-text-secondary truncate block">
                                    {entry.visit.clientName}
                                </span>
                                <span className="text-[10px] text-text-muted truncate block">
                                    {getServiceName(entry)}
                                </span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex items-center gap-2 py-4 justify-center">
                        <Clock size={16} className="text-text-muted" />
                        <span className="text-[13px] text-text-muted italic">
                            No more visits today
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
