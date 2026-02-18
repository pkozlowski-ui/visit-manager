import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { format, eachDayOfInterval } from 'date-fns';
import type { Visit } from '../types';

interface VisitContextType {
    visits: Visit[];
    addVisit: (visit: Visit) => void;
    updateVisit: (id: string, updatedData: Partial<Visit>) => void;
    removeVisit: (id: string) => void;
    /** O(1) lookup: get visits for a specific date */
    getVisitsForDate: (date: Date) => Visit[];
    /** Get visits for a date range (inclusive) */
    getVisitsForRange: (start: Date, end: Date) => Visit[];
}

import dummyData from '../data/dummy_data.json';

const VisitContext = createContext<VisitContextType | undefined>(undefined);

const STORAGE_KEY = 'visit-manager-visits-v2';

const DEFAULT_VISITS: Visit[] = dummyData.data.visits.map(v => ({
    ...v,
    startTime: new Date(v.startTime),
    endTime: new Date(v.endTime),
    isConfirmed: v.isConfirmed ?? true,
    status: (v.status as 'confirmed' | 'cancelled' | 'completed') ?? 'confirmed',
    serviceIds: [v.serviceId]
})) as unknown as Visit[];

import { useToast } from './ToastContext';

/** Build a Map<YYYY-MM-DD, Visit[]> index for O(1) date lookups */
function buildDateIndex(visits: Visit[]): Map<string, Visit[]> {
    const map = new Map<string, Visit[]>();
    for (const visit of visits) {
        const key = format(new Date(visit.startTime), 'yyyy-MM-dd');
        const arr = map.get(key);
        if (arr) {
            arr.push(visit);
        } else {
            map.set(key, [visit]);
        }
    }
    return map;
}

export const VisitProvider = ({ children }: { children: ReactNode }) => {
    const { addToast } = useToast();
    const [visits, setVisits] = useState<Visit[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return DEFAULT_VISITS;

            const parsed = JSON.parse(stored);
            return parsed.map((v: unknown) => {
                const visit = v as Visit;
                return {
                    ...visit,
                    startTime: new Date(visit.startTime),
                    endTime: new Date(visit.endTime)
                };
            });
        } catch (e) {
            console.error('Failed to load visits', e);
            return [];
        }
    });

    // Pre-indexed map — rebuilt only when visits array changes
    const visitsByDate = useMemo(() => buildDateIndex(visits), [visits]);

    const getVisitsForDate = useCallback((date: Date): Visit[] => {
        const key = format(date, 'yyyy-MM-dd');
        return visitsByDate.get(key) || [];
    }, [visitsByDate]);

    const getVisitsForRange = useCallback((start: Date, end: Date): Visit[] => {
        const days = eachDayOfInterval({ start, end });
        const result: Visit[] = [];
        for (const day of days) {
            const key = format(day, 'yyyy-MM-dd');
            const dayVisits = visitsByDate.get(key);
            if (dayVisits) result.push(...dayVisits);
        }
        return result;
    }, [visitsByDate]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
    }, [visits]);

    const addVisit = (visit: Visit) => {
        setVisits((prev) => [...prev, visit]);
        addToast(`Visit added for ${visit.clientName}`, 'success');
    };

    const updateVisit = (id: string, updatedData: Partial<Visit>) => {
        setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...updatedData } : v)));
        addToast('Visit updated successfully', 'success');
    };

    const removeVisit = (id: string) => {
        setVisits((prev) => prev.filter((v) => v.id !== id));
        addToast('Visit removed', 'info');
    };

    return (
        <VisitContext.Provider value={{ visits, addVisit, updateVisit, removeVisit, getVisitsForDate, getVisitsForRange }}>
            {children}
        </VisitContext.Provider>
    );
};

export const useVisits = () => {
    const context = useContext(VisitContext);
    if (!context) {
        throw new Error('useVisits must be used within a VisitProvider');
    }
    return context;
};
