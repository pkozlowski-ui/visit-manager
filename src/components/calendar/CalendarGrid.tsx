import { useMemo, useState, useCallback, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
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
const END_HOUR = 19;
const HOUR_HEIGHT = 120;

interface PositionedVisit extends Visit {
    top: number;
    height: number;
    left: number;
    width: number;
}

interface TooltipState {
    visit: Visit;
    color: string;
    specialistName?: string;
    x: number;
    y: number;
}

// --- Extracted VisitTile with React.memo ---
interface VisitTileProps {
    visit: PositionedVisit;
    color: string;
    specialistName?: string;
    showAvatar: boolean;
    services: { id: string; name: string }[];
    onClick: (visit: Visit) => void;
    onMouseEnter: (e: React.MouseEvent, visit: Visit, color: string, specialistName?: string) => void;
    onMouseLeave: () => void;
}

const VisitTile = memo(function VisitTile({
    visit, color, specialistName, showAvatar, services, onClick, onMouseEnter, onMouseLeave
}: VisitTileProps) {
    const backgroundColor = `color-mix(in srgb, ${color} 12%, white)`;

    return (
        <motion.div
            onClick={(e) => { e.stopPropagation(); onClick(visit); }}
            onMouseEnter={(e) => onMouseEnter(e, visit, color, specialistName)}
            onMouseLeave={onMouseLeave}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING_SNAPPY}
            className="absolute rounded-xl p-3 flex flex-col overflow-hidden z-10 transition-all cursor-pointer hover:z-30"
            style={{
                top: `${visit.top}px`,
                height: `calc(${Math.max(visit.height, 40)}px - 4px)`,
                left: `calc(${visit.left}% + 2px)`,
                width: `calc(${visit.width}% - 4px)`,
                backgroundColor
            }}
        >
            <div className="flex flex-col h-full relative">
                <span className="font-display text-[11px] font-bold leading-none mb-1.5" style={{ color }}>
                    {format(new Date(visit.startTime), 'HH:mm')}
                </span>
                <span className="font-display text-[12px] font-semibold leading-tight text-text-primary/90 truncate pr-4 tracking-wide">
                    {visit.clientName.split(' ')[0]}
                </span>
                {showAvatar && specialistName && (
                    <div className="absolute bottom-0 right-0 translate-y-1 translate-x-1">
                        <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-display text-white shadow-sm ring-2 ring-white/50"
                            style={{ backgroundColor: color }}
                        >
                            {specialistName.charAt(0)}
                        </div>
                    </div>
                )}
                {visit.height > 80 && (
                    <div className="font-display text-[9px] text-text-secondary/50 mt-auto truncate pr-4 opacity-70">
                        {[
                            ...(visit.serviceIds?.map(id => services.find(s => s.id === id)?.name).filter(Boolean) || []),
                            ...(visit.customTags || [])
                        ].join(', ')}
                    </div>
                )}
            </div>
        </motion.div>
    );
});

// --- Lane computation for overlapping visits (pure function) ---
function computePositionedVisits(dayVisits: Visit[]): PositionedVisit[] {
    const sorted = [...dayVisits].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const lanes: { endTime: number }[] = [];
    const result: (Visit & { lane: number })[] = [];

    sorted.forEach(visit => {
        const start = new Date(visit.startTime).getTime();
        const end = new Date(visit.endTime).getTime();

        let laneIndex = lanes.findIndex(lane => start >= lane.endTime);
        if (laneIndex === -1) {
            laneIndex = lanes.length;
            lanes.push({ endTime: end });
        } else {
            lanes[laneIndex].endTime = end;
        }
        result.push({ ...visit, lane: laneIndex });
    });

    const maxLanes = lanes.length > 0 ? lanes.length : 1;

    return result.map(visit => {
        const start = new Date(visit.startTime);
        const end = new Date(visit.endTime);
        const dayStart = setHours(startOfDay(start), START_HOUR);
        const minutesFromStart = differenceInMinutes(start, dayStart);
        const duration = differenceInMinutes(end, start);

        return {
            ...visit,
            top: (minutesFromStart / 60) * HOUR_HEIGHT,
            height: (duration / 60) * HOUR_HEIGHT,
            left: (visit.lane / maxLanes) * 100,
            width: 100 / maxLanes
        };
    });
}

export default function CalendarGrid({ selectedDate, onSlotClick, onVisitClick, daysToShow = 5 }: CalendarGridProps) {
    const { getVisitsForDate } = useVisits();
    const { selectedSpecialistId, specialists } = useSpecialists();
    const { services } = useServices();
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleVisitMouseEnter = useCallback((e: React.MouseEvent, visit: Visit, color: string, specialistName?: string) => {
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTooltip({
            visit,
            color,
            specialistName,
            x: rect.left + rect.width / 2,
            y: rect.top,
        });
    }, []);

    const handleVisitMouseLeave = useCallback(() => {
        tooltipTimeout.current = setTimeout(() => setTooltip(null), 100);
    }, []);

    // Generate days for the week (starting Monday)
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = useMemo(
        () => [...Array(daysToShow)].map((_, i) => addDays(weekStart, i)),
        [weekStart.getTime(), daysToShow]
    );

    // Generate time slots labels
    const timeSlots = useMemo(
        () => [...Array(END_HOUR - START_HOUR + 1)].map((_, i) => i + START_HOUR),
        []
    );

    // Memoized per-day positioned visits — uses O(1) date lookup + specialist filter
    const positionedVisitsByDay = useMemo(() => {
        const result = new Map<string, PositionedVisit[]>();
        for (const day of weekDays) {
            const dayVisits = getVisitsForDate(day);
            const filtered = selectedSpecialistId
                ? dayVisits.filter(v => v.specialistId === selectedSpecialistId)
                : dayVisits;
            result.set(day.toISOString(), computePositionedVisits(filtered));
        }
        return result;
    }, [weekDays, getVisitsForDate, selectedSpecialistId]);

    const getSpecialist = useCallback(
        (id?: string) => specialists.find(s => s.id === id),
        [specialists]
    );

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-in custom-scrollbar bg-white rounded-[32px] shadow-sm">
            <div className="w-full min-h-full p-4">
                <div
                    className="grid relative w-full"
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
                        const dailyVisits = positionedVisitsByDay.get(day.toISOString()) || [];

                        return (
                            <div key={day.toISOString()} className="relative flex flex-col">
                                {/* Header */}
                                <div className="h-[60px] flex items-center justify-center font-display uppercase text-sm text-text-secondary sticky top-0 z-10 bg-white">
                                    <span className={`px-4 py-2 ${isToday ? 'text-accent-red bg-accent-red/10 rounded-lg' : ''}`}>
                                        {format(day, 'EEE d')}
                                    </span>
                                </div>

                                {/* Column Content */}
                                <div className="relative border-l border-gray-200 border-dashed flex-1" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
                                    {/* Hour Grid Lines */}
                                    {timeSlots.map(hour => (
                                        <div
                                            key={hour}
                                            className="absolute w-full border-b border-gray-200 border-dashed"
                                            style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
                                        />
                                    ))}

                                    {/* Interactive Background Layer (for creating new slots) */}
                                    {timeSlots.map(hour => {
                                        if (hour === END_HOUR) return null;
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

                                        return (
                                            <VisitTile
                                                key={visit.id}
                                                visit={visit}
                                                color={color}
                                                specialistName={specialist?.name}
                                                showAvatar={!selectedSpecialistId && !!specialist}
                                                services={services}
                                                onClick={onVisitClick}
                                                onMouseEnter={handleVisitMouseEnter}
                                                onMouseLeave={handleVisitMouseLeave}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Portal-based Tooltip — renders outside scroll container */}
            {tooltip && createPortal(
                <div
                    className="fixed pointer-events-none z-[9999] transition-opacity duration-150"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <div
                        className="rounded-xl px-4 py-3 shadow-lg whitespace-nowrap min-w-[160px] mb-2"
                        style={{ backgroundColor: `color-mix(in srgb, ${tooltip.color} 90%, black)` }}
                    >
                        <p className="font-display text-[13px] font-bold text-white tracking-wide mb-1">
                            {tooltip.visit.clientName}
                        </p>
                        <p className="font-ui text-[11px] text-white/70">
                            {format(new Date(tooltip.visit.startTime), 'HH:mm')} – {format(new Date(tooltip.visit.endTime), 'HH:mm')}
                        </p>
                        {tooltip.specialistName && (
                            <p className="font-ui text-[10px] text-white/50 mt-1">
                                {tooltip.specialistName}
                            </p>
                        )}
                        {(tooltip.visit.serviceIds?.length || tooltip.visit.customTags?.length) ? (
                            <p className="font-ui text-[9px] text-white/40 mt-1">
                                {[
                                    ...(tooltip.visit.serviceIds?.map(id => services.find(s => s.id === id)?.name).filter(Boolean) || []),
                                    ...(tooltip.visit.customTags || [])
                                ].join(' · ')}
                            </p>
                        ) : null}
                        {(tooltip.visit as any).notes && (
                            <p className="font-ui text-[9px] text-white/40 mt-1 italic max-w-[200px] truncate">
                                „{(tooltip.visit as any).notes}"
                            </p>
                        )}
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                            style={{ borderTopColor: `color-mix(in srgb, ${tooltip.color} 90%, black)` }}
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
