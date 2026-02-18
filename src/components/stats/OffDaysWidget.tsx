import { motion } from 'framer-motion';
import { CalendarOff, Coffee } from 'lucide-react';
import type { UpcomingOffDay } from '../../hooks/useStatsData';

interface OffDaysWidgetProps {
    data: UpcomingOffDay[];
}

export default function OffDaysWidget({ data }: OffDaysWidgetProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-card-color rounded-xl p-5 flex flex-col gap-4 min-h-[300px]"
        >
            <h3 className="text-[13px] font-display uppercase tracking-wide text-text-secondary font-medium">
                Upcoming Off Days
            </h3>

            <div className="flex flex-col gap-2">
                {data.length > 0 ? (
                    data.slice(0, 5).map((entry, idx) => (
                        <motion.div
                            key={`${entry.specialist.id}-${entry.formattedDate}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 + idx * 0.06 }}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${entry.specialist.color || '#94a3b8'}18` }}
                            >
                                <CalendarOff
                                    size={14}
                                    style={{ color: entry.specialist.color || '#94a3b8' }}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <span className="text-[13px] font-semibold text-text-primary block truncate">
                                    {entry.specialist.name}
                                </span>
                            </div>

                            <div className="text-right shrink-0">
                                <span className="text-[12px] font-medium text-text-secondary block">
                                    {entry.formattedDate}
                                </span>
                                <span className="text-[10px] text-text-muted block">
                                    {entry.dayOfWeek}
                                </span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center"
                    >
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Coffee size={32} className="text-text-muted opacity-40" />
                        </div>
                        <h4 className="text-[15px] font-bold text-text-primary mb-1">
                            Team is hard at work
                        </h4>
                        <p className="text-[12px] text-text-muted max-w-[200px] leading-relaxed">
                            No upcoming scheduled off days for any specialist in the next 14 days.
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
