import { useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, setHours, startOfDay, differenceInMinutes } from 'date-fns';
import { useVisits } from '../../context/VisitContext';
import { useSpecialists } from '../../context/SpecialistContext';
import { useServices } from '../../context/ServiceContext';
import { motion } from 'framer-motion';
import { SPRING_SNAPPY } from '../../constants/motion';
import type { Visit } from '../../types';

interface CalendarGridProps {
    selectedDate: Date;
    onSlotClick: (date: Date, specialistId?: string) => void;
    onVisitClick: (visit: Visit) => void;
    daysToShow?: number;
}

// Constants for layout
const START_HOUR = 8;
const END_HOUR = 19; // 19:00 to extend a bit
const HOUR_HEIGHT = 120; // px per hour

interface PositionedVisit extends Visit {
    top: number;
    height: number;
    left: number;
    width: number;
}

export default function CalendarGrid({ selectedDate, onSlotClick, onVisitClick, daysToShow = 5 }: CalendarGridProps) {
    const { visits } = useVisits();
    const { selectedSpecialistId, specialists } = useSpecialists();
    const { services } = useServices();

    // Generate days for the week (starting Monday)
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = [...Array(daysToShow)].map((_, i) => addDays(weekStart, i));

    // Generate time slots labels
    const timeSlots = [...Array(END_HOUR - START_HOUR + 1)].map((_, i) => i + START_HOUR);

    // Filter visits based on specialist selection
    const filteredVisits = useMemo(() => {
        return visits.filter((visit) => {
            if (selectedSpecialistId && visit.specialistId !== selectedSpecialistId) return false;
            return true;
        });
    }, [visits, selectedSpecialistId]);

    // Calculate layout for a specific day
    const getVisitsForDay = (day: Date): PositionedVisit[] => {
        const dayVisits = filteredVisits.filter(v => isSameDay(new Date(v.startTime), day));

        // Sort by start time
        dayVisits.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        // Simple overlap detection logic
        // We will assign a "lane" to each visit.
        const lanes: { endTime: number }[] = [];
        const result: (Visit & { lane: number })[] = [];

        dayVisits.forEach(visit => {
            const start = new Date(visit.startTime).getTime();
            const end = new Date(visit.endTime).getTime();

            // Find first lane where this visit fits (start >= lane.endTime)
            let laneIndex = lanes.findIndex(lane => start >= lane.endTime);

            if (laneIndex === -1) {
                // No fit, new lane
                laneIndex = lanes.length;
                lanes.push({ endTime: end });
            } else {
                // Update lane end time
                lanes[laneIndex].endTime = end;
            }

            result.push({ ...visit, lane: laneIndex });
        });

        // Current simplified logic: If max lanes is N, width = 100/N.
        // This is a naive heuristic but works for basic overlaps.
        const maxLanes = lanes.length > 0 ? lanes.length : 1;

        return result.map(visit => {
            const start = new Date(visit.startTime);
            const end = new Date(visit.endTime);

            // Calculate Top (minutes from START_HOUR)
            const dayStart = setHours(startOfDay(start), START_HOUR);
            const minutesFromStart = differenceInMinutes(start, dayStart);
            const top = (minutesFromStart / 60) * HOUR_HEIGHT;

            // Calculate Height (duration)
            const duration = differenceInMinutes(end, start);
            const height = (duration / 60) * HOUR_HEIGHT;

            return {
                ...visit,
                top,
                height,
                left: (visit.lane / maxLanes) * 100,
                width: 100 / maxLanes
            };
        });
    };

    const getSpecialist = (id?: string) => specialists.find(s => s.id === id);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div
                className="grid relative"
                style={{ gridTemplateColumns: `60px repeat(${daysToShow}, 1fr)` }}
            >

                {/* Time Labels Column */}
                <div className="relative mr-4">
                    {timeSlots.slice(1).map(hour => (
                        <div
                            key={hour}
                            className="absolute w-full text-right pr-4 font-ui text-xs text-text-secondary -translate-y-1/2"
                            style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
                        >
                            {`${hour}:00`}
                        </div>
                    ))}
                </div>

                {/* Day Columns */}
                {weekDays.map(day => {
                    const isToday = isSameDay(day, new Date());
                    const dailyVisits = getVisitsForDay(day);

                    return (
                        <div key={day.toISOString()} className="relative flex flex-col">
                            {/* Header */}
                            <div className="h-[60px] flex items-center justify-center font-display uppercase text-sm text-text-secondary sticky top-0 z-10 bg-bg-color">
                                <span className={`px-4 py-2 ${isToday ? 'text-accent-red bg-accent-red/10 rounded-lg' : ''}`}>
                                    {format(day, 'EEE d')}
                                </span>
                            </div>

                            {/* Column Content */}
                            <div className="relative border-l border-gray-100 flex-1" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
                                {/* Hour Grid Lines */}
                                {timeSlots.map(hour => (
                                    <div
                                        key={hour}
                                        className="absolute w-full border-b border-gray-100 border-dashed"
                                        style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
                                    />
                                ))}

                                {/* Interactive Backgroud Layer (for creating new slots) */}
                                {timeSlots.map(hour => {
                                    if (hour === END_HOUR) return null; // Don't create slot after last hour
                                    return (
                                        <div
                                            key={`slot-${hour}`}
                                            className="absolute w-full hover:bg-black/5 transition-colors cursor-pointer z-0"
                                            style={{
                                                top: (hour - START_HOUR) * HOUR_HEIGHT,
                                                height: HOUR_HEIGHT
                                            }}
                                            onClick={() => {
                                                const date = new Date(day);
                                                date.setHours(hour);
                                                date.setMinutes(0);
                                                onSlotClick(date, selectedSpecialistId || undefined);
                                            }}
                                        />
                                    );
                                })}

                                {/* Visits */}
                                {dailyVisits.map(visit => {
                                    const specialist = getSpecialist(visit.specialistId);
                                    const color = specialist?.color || 'var(--color-brand-500)';
                                    // Use a lighter gray as background for all tiles, regardless of specialist color
                                    const backgroundColor = '#F8FAFC'; // Slate-50 or Gray-50 equivalent

                                    return (
                                        <motion.div
                                            key={visit.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onVisitClick(visit);
                                            }}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ scale: 1.05, zIndex: 50, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                                            transition={SPRING_SNAPPY}
                                            className="absolute rounded-lg p-2 flex flex-col justify-center cursor-pointer shadow-sm border-l-4 overflow-hidden z-10 hover:brightness-95 transition-all"
                                            style={{
                                                top: `${visit.top}px`,
                                                height: `${Math.max(visit.height, 40)}px`, // Min height for visibility
                                                left: `${visit.left}%`,
                                                width: `${visit.width}%`,
                                                borderLeftColor: color,
                                                backgroundColor: backgroundColor
                                            }}
                                        >
                                            <div className="flex justify-between items-center gap-1">
                                                <div className="min-w-0">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-display text-[13px] font-semibold leading-tight text-text-primary/90">
                                                            {format(new Date(visit.startTime), 'HH:mm')}
                                                        </span>
                                                        <span className="font-ui text-[11px] font-semibold leading-tight truncate text-black/80">
                                                            {visit.clientName.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Specialist Avatar (Only in 'All' view) - make it smaller */}
                                                {!selectedSpecialistId && specialist && (
                                                    <div
                                                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-display text-white shrink-0 shadow-sm opacity-80"
                                                        style={{ backgroundColor: color }}
                                                        title={specialist.name}
                                                    >
                                                        {specialist.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hide details for cleaner look as requested, or keep very subtle if space allows */}
                                            {visit.height > 60 && (
                                                <div className="font-display text-[9px] text-text-secondary/60 mt-1 truncate">
                                                    {[
                                                        ...(visit.serviceIds?.map(id => services.find(s => s.id === id)?.name).filter(Boolean) || []),
                                                        ...(visit.customTags || [])
                                                    ].join(', ')}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
