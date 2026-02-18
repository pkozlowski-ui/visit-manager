import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { format, isSameDay, parse, addDays, startOfDay, addMinutes } from 'date-fns';
import type { WeeklySchedule, SpecialClosure, DaySchedule, Visit } from '../types';
import { useSpecialists } from './SpecialistContext';
import { roundToNearest15 } from '../utils/dateUtils';

interface AvailabilityContextType {
    salonSchedule: WeeklySchedule;
    specialClosures: SpecialClosure[];
    updateSalonSchedule: (schedule: WeeklySchedule) => void;
    addSpecialClosure: (closure: SpecialClosure) => void;
    removeSpecialClosure: (date: string) => void;
    isSalonOpen: (date: Date) => boolean;
    getSalonHours: (date: Date) => DaySchedule | null;
    isSpecialistAvailable: (specialistId: string, start: Date, end: Date, excludeVisitId?: string) => boolean;
    findNextAvailableSlot: (specialistId: string, after: Date, durationMinutes: number) => Date | null;
    findAvailableSlots: (params: { specialistId?: string, after: Date, durationMinutes: number, daysToSearch?: number, excludeVisitId?: string }) => AvailableSlot[];
    setVisits: (visits: Visit[]) => void;
}

export interface AvailableSlot {
    specialistId: string;
    date: Date;
    startTime: string;
    endTime: string;
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(undefined);

const DEFAULT_SALON_SCHEDULE: WeeklySchedule = {
    monday: { isOpen: true, hours: [{ openTime: '09:00', closeTime: '19:00' }] },
    tuesday: { isOpen: true, hours: [{ openTime: '09:00', closeTime: '19:00' }] },
    wednesday: { isOpen: true, hours: [{ openTime: '09:00', closeTime: '19:00' }] },
    thursday: { isOpen: true, hours: [{ openTime: '09:00', closeTime: '19:00' }] },
    friday: { isOpen: true, hours: [{ openTime: '09:00', closeTime: '19:00' }] },
    saturday: { isOpen: true, hours: [{ openTime: '10:00', closeTime: '14:00' }] },
    sunday: { isOpen: false, hours: [] },
};

import { useToast } from './ToastContext';

export function AvailabilityProvider({ children }: { children: ReactNode }) {
    const { addToast } = useToast();
    const [salonSchedule, setSalonSchedule] = useState<WeeklySchedule>(() => {
        const saved = localStorage.getItem('salonSchedule');
        return saved ? JSON.parse(saved) : DEFAULT_SALON_SCHEDULE;
    });

    const [specialClosures, setSpecialClosures] = useState<SpecialClosure[]>(() => {
        const saved = localStorage.getItem('specialClosures');
        return saved ? JSON.parse(saved) : [];
    });

    const [visits, setVisits] = useState<Visit[]>([]);

    const { specialists } = useSpecialists();

    useEffect(() => {
        localStorage.setItem('salonSchedule', JSON.stringify(salonSchedule));
    }, [salonSchedule]);

    useEffect(() => {
        localStorage.setItem('specialClosures', JSON.stringify(specialClosures));
    }, [specialClosures]);

    const updateSalonSchedule = (schedule: WeeklySchedule) => {
        setSalonSchedule(schedule);
        addToast('Salon schedule updated', 'success');
    };

    const addSpecialClosure = (closure: SpecialClosure) => {
        setSpecialClosures(prev => [...prev, closure]);
        addToast(`Special closure added: ${closure.date}`, 'warning');
    };

    const removeSpecialClosure = (date: string) => {
        setSpecialClosures(prev => prev.filter(c => c.date !== date));
        addToast('Special closure removed', 'info');
    };

    const getSalonHours = (date: Date): DaySchedule | null => {
        const dayName = format(date, 'eeee').toLowerCase();
        const isClosedDay = specialClosures.some(c => isSameDay(parse(c.date, 'yyyy-MM-dd', new Date()), date));

        if (isClosedDay) return { isOpen: false, hours: [] };
        return salonSchedule[dayName] || { isOpen: false, hours: [] };
    };

    const isSalonOpen = (date: Date): boolean => {
        const schedule = getSalonHours(date);
        if (!schedule || !schedule.isOpen) return false;

        const timeStr = format(date, 'HH:mm');
        return schedule.hours.some(range => timeStr >= range.openTime && timeStr < range.closeTime);
    };

    const isSpecialistAvailable = (specialistId: string, start: Date, end: Date, excludeVisitId?: string): boolean => {
        if (!isSalonOpen(start) || !isSalonOpen(end)) return false;

        const specialist = specialists.find(s => s.id === specialistId);
        if (!specialist) return true; // Default to salon hours if no spec found

        const dayName = format(start, 'eeee').toLowerCase();
        const dateStr = format(start, 'yyyy-MM-dd');

        // Check off-days
        if (specialist.offDays?.includes(dateStr)) return false;

        // Check overrides
        const schedule = specialist.availabilityOverrides?.[dayName] || getSalonHours(start);
        if (!schedule || !schedule.isOpen) return false;

        const startStr = format(start, 'HH:mm');
        const endStr = format(end, 'HH:mm');

        const hasScheduleTime = schedule.hours.some(range => startStr >= range.openTime && endStr <= range.closeTime);
        if (!hasScheduleTime) return false;

        // Check for overlapping visits
        const hasOverlap = visits.some(visit => {
            if (excludeVisitId && visit.id === excludeVisitId) return false; // Skip current visit when editing
            if (visit.specialistId !== specialistId) return false;

            const visitStart = new Date(visit.startTime);
            const visitEnd = new Date(visit.endTime);

            // Check if times overlap
            return start < visitEnd && end > visitStart;
        });

        return !hasOverlap;
    };

    const findNextAvailableSlot = (specialistId: string, after: Date, durationMinutes: number): Date | null => {
        let current = addMinutes(roundToNearest15(after), 15);

        // Safety: search up to 7 days ahead
        const limit = addDays(after, 7);

        while (current < limit) {
            const end = addMinutes(current, durationMinutes);

            // Check if salon is open at this specific time slot
            const schedule = getSalonHours(current);
            if (schedule?.isOpen) {
                if (isSpecialistAvailable(specialistId, current, end)) {
                    return current;
                }
            } else {
                // If salon is closed today, jump to start of next day
                current = startOfDay(addDays(current, 1));
                continue;
            }

            // Next 15 min slot
            current = addMinutes(current, 15);
        }
        return null;
    };

    const findAvailableSlots = ({ specialistId, after, durationMinutes, daysToSearch = 7, excludeVisitId }: { specialistId?: string, after: Date, durationMinutes: number, daysToSearch?: number, excludeVisitId?: string }): AvailableSlot[] => {
        const slots: AvailableSlot[] = [];
        const specialistsToSearch = specialistId && specialistId !== 'any'
            ? specialists.filter(s => s.id === specialistId)
            : specialists;

        for (let i = 0; i < daysToSearch; i++) {
            const searchDate = startOfDay(addDays(after, i));
            const schedule = getSalonHours(searchDate);
            if (!schedule || !schedule.isOpen) continue;

            specialistsToSearch.forEach(spec => {
                const specSchedule = spec.availabilityOverrides?.[format(searchDate, 'eeee').toLowerCase()] || schedule;
                if (!specSchedule.isOpen) return;

                specSchedule.hours.forEach(range => {
                    let current = parse(range.openTime, 'HH:mm', searchDate);
                    const rangeEnd = parse(range.closeTime, 'HH:mm', searchDate);

                    if (isSameDay(current, after)) {
                        const nearest = roundToNearest15(after);
                        if (nearest > current) current = addMinutes(nearest, 0);
                    }

                    while (addMinutes(current, durationMinutes) <= rangeEnd) {
                        const slotEnd = addMinutes(current, durationMinutes);
                        if (isSpecialistAvailable(spec.id, current, slotEnd, excludeVisitId)) {
                            slots.push({
                                specialistId: spec.id,
                                date: searchDate,
                                startTime: format(current, 'HH:mm'),
                                endTime: format(slotEnd, 'HH:mm')
                            });
                        }
                        current = addMinutes(current, 15);
                        if (slots.length >= 12) return;
                    }
                });
            });
            if (slots.length >= 12) break;
        }
        return slots;
    };

    return (
        <AvailabilityContext.Provider value={{
            salonSchedule,
            specialClosures,
            updateSalonSchedule,
            addSpecialClosure,
            removeSpecialClosure,
            isSalonOpen,
            getSalonHours,
            isSpecialistAvailable,
            findNextAvailableSlot,
            findAvailableSlots,
            setVisits
        }}>
            {children}
        </AvailabilityContext.Provider>
    );
}

export const useAvailability = () => {
    const context = useContext(AvailabilityContext);
    if (context === undefined) {
        throw new Error('useAvailability must be used within an AvailabilityProvider');
    }
    return context;
};
