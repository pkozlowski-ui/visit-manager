import { useMemo } from 'react';
import { useVisits } from '../../context/VisitContext';
import { useSpecialists } from '../../context/SpecialistContext';
import { useAvailability } from '../../context/AvailabilityContext';
import { formatTime } from '../../utils/dateUtils';
import { Clock } from 'lucide-react';
import type { Visit } from '../../types';

interface TimelineProps {
    selectedDate: Date;
    onSlotClick: (date: Date, specialistId?: string) => void;
    onVisitClick?: (visit: Visit) => void;
    filterSpecialistId?: string | null;
}

export default function Timeline({ selectedDate, onSlotClick, onVisitClick, filterSpecialistId }: TimelineProps) {
    const { getVisitsForDate } = useVisits();
    const { specialists } = useSpecialists();
    const { getSalonHours } = useAvailability();

    const getSpecialistInitials = (id?: string) => {
        if (!id) return '?';
        const s = specialists.find(spec => spec.id === id);
        return s ? s.name.substring(0, 2).toUpperCase() : '?';
    };

    const getSpecialistColor = (id?: string) => {
        if (!id) return '#6C5DD3';
        const s = specialists.find(spec => spec.id === id);
        return s?.color || '#6C5DD3';
    }

    const schedule = getSalonHours(selectedDate);

    // Pre-compute day visits and group by slot — replaces O(N) filtering in render
    const dayVisits = useMemo(() => {
        const all = getVisitsForDate(selectedDate);
        if (filterSpecialistId) {
            return all.filter(v => v.specialistId === filterSpecialistId);
        }
        return all;
    }, [getVisitsForDate, selectedDate, filterSpecialistId]);

    // Pre-group visits by "HH:mm" key for O(1) slot lookup
    const visitsBySlot = useMemo(() => {
        const map = new Map<string, Visit[]>();
        for (const v of dayVisits) {
            const start = new Date(v.startTime);
            const key = `${start.getHours()}:${start.getMinutes()}`;
            const arr = map.get(key);
            if (arr) arr.push(v);
            else map.set(key, [v]);
        }
        return map;
    }, [dayVisits]);

    if (!schedule || !schedule.isOpen) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                    <Clock size={32} className="text-text-muted/30" />
                </div>
                <h3 className="text-xl font-black text-text-main tracking-tight">Salon is Closed</h3>
                <p className="text-sm text-text-muted font-bold mt-1">Enjoy your day off! ✨</p>
            </div>
        );
    }

    const startH = schedule.hours.length > 0 ? parseInt(schedule.hours[0].openTime.split(':')[0]) : 8;
    const endH = schedule.hours.length > 0 ? parseInt(schedule.hours[schedule.hours.length - 1].closeTime.split(':')[0]) + 1 : 20;

    // Generate 30-minute slots
    const timeSlots: Date[] = [];
    for (let h = startH; h < endH; h++) {
        const slot1 = new Date(selectedDate);
        slot1.setHours(h, 0, 0, 0);
        timeSlots.push(slot1);

        const slot2 = new Date(selectedDate);
        slot2.setHours(h, 30, 0, 0);
        timeSlots.push(slot2);
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const showCurrentTime = now.getDate() === selectedDate.getDate() &&
        now.getMonth() === selectedDate.getMonth() &&
        now.getFullYear() === selectedDate.getFullYear();

    const isTeamMode = !filterSpecialistId;
    const teamSpecialists = specialists; // Everyone in team mode

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-in custom-scrollbar bg-white rounded-[32px] shadow-sm mb-4">
            <div className="relative pb-24 px-4 lg:px-6 min-h-full">
                {/* Time Slots - 30 minute intervals */}
                <div className="space-y-0 pt-4">
                    {timeSlots.map((timeDate, idx) => {
                        const hour = timeDate.getHours();
                        const minute = timeDate.getMinutes();
                        const isHourMark = minute === 0;

                        // O(1) slot lookup instead of O(N) filter
                        const slotVisits = visitsBySlot.get(`${hour}:${minute}`) || [];

                        return (
                            <div key={idx} className={`flex relative group ${isHourMark ? 'min-h-[60px]' : 'min-h-[60px]'}`}>
                                {/* Time Column */}
                                <div className="w-14 flex-shrink-0 text-right pr-4">
                                    {isHourMark && (
                                        <span className="text-xs font-bold text-text-secondary uppercase tracking-tight">
                                            {hour}:00
                                        </span>
                                    )}
                                </div>

                                {/* Event Area */}
                                <div
                                    className={`flex-1 ${isHourMark ? 'border-t border-gray-200' : 'border-t border-dashed border-gray-100'} relative cursor-pointer`}
                                >
                                    {/* Grid Columns indicator/click targets for Team Mode */}
                                    {isTeamMode ? (
                                        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${teamSpecialists.length}, 1fr)` }}>
                                            {teamSpecialists.map((spec) => (
                                                <div
                                                    key={spec.id}
                                                    className="h-full border-r border-gray-100/50 last:border-r-0 hover:bg-black/5 transition-colors group/cell relative"
                                                    onClick={() => onSlotClick(timeDate, spec.id)}
                                                >
                                                    {/* Hover indication specifically for the cell */}
                                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/cell:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                            className="absolute inset-0 flex items-center group/slot"
                                            onClick={() => onSlotClick(timeDate, filterSpecialistId || undefined)}
                                        >
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/slot:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                                        </div>
                                    )}

                                    {/* Render Visits */}
                                    {slotVisits.map(visit => {
                                        const start = new Date(visit.startTime);
                                        const end = new Date(visit.endTime);
                                        const durationMins = (end.getTime() - start.getTime()) / 60000;

                                        const height = Math.max(durationMins * (60 / 30), 40); // 60px per 30 min
                                        const topOffset = 0; // Always at top of slot since we filter by start time

                                        const color = getSpecialistColor(visit.specialistId);
                                        const isAssigned = !!visit.specialistId;
                                        const specialistIndex = isTeamMode && visit.specialistId
                                            ? teamSpecialists.findIndex(s => s.id === visit.specialistId)
                                            : -1;

                                        // Team Mode column logic
                                        const columnLeft = isTeamMode && specialistIndex !== -1
                                            ? `${(specialistIndex / teamSpecialists.length) * 100}%`
                                            : '4px';
                                        const columnWidth = isTeamMode && specialistIndex !== -1
                                            ? `${(1 / teamSpecialists.length) * 100}%`
                                            : 'calc(100% - 8px)';

                                        const backgroundColor = visit.isConfirmed
                                            ? `color-mix(in srgb, ${color} 12%, white)`
                                            : 'var(--color-gray-50)';

                                        return (
                                            <div
                                                key={visit.id}
                                                className={`absolute rounded-xl p-3 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col justify-center cursor-pointer overflow-hidden z-10 ${!visit.isConfirmed ? 'opacity-80' : ''}`}
                                                style={{
                                                    top: `${topOffset}px`,
                                                    height: `calc(${height}px - 4px)`,
                                                    left: `calc(${columnLeft} + 2px)`,
                                                    width: `calc(${columnWidth} - 4px)`,
                                                    backgroundColor
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onVisitClick?.(visit);
                                                }}
                                            >
                                                <div className="flex flex-col gap-1 mb-1.5">
                                                    <span className="font-bold text-[11px] leading-none" style={{ color }}>
                                                        {formatTime(new Date(visit.startTime))}
                                                    </span>
                                                    <span className="font-black text-sm text-text-primary leading-tight truncate">
                                                        {visit.clientName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-text-secondary font-medium">
                                                    {visit.customTags && visit.customTags.length > 0 && (
                                                        <span className="truncate">{visit.customTags[0]}</span>
                                                    )}
                                                </div>

                                                {isAssigned && isTeamMode && (
                                                    <div
                                                        className="absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm ring-2 ring-white/50"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {getSpecialistInitials(visit.specialistId)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Current Time Indicator */}
                                    {showCurrentTime && currentHour === hour && currentMinute >= minute && currentMinute < minute + 30 && (
                                        <div
                                            className="absolute left-0 right-0 z-20 pointer-events-none"
                                            style={{
                                                top: `${((currentMinute - minute) / 30) * 60}px`
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-accent-red -ml-1 shadow-lg shadow-accent-red/50" />
                                                <div className="flex-1 h-[2px] bg-accent-red/80" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
