import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Visit } from '../types';

interface VisitContextType {
    visits: Visit[];
    addVisit: (visit: Visit) => void;
    updateVisit: (id: string, updatedData: Partial<Visit>) => void;
    removeVisit: (id: string) => void;
}

import dummyData from '../data/dummy_data.json';

const VisitContext = createContext<VisitContextType | undefined>(undefined);

const STORAGE_KEY = 'visit-manager-visits-v2';

const DEFAULT_VISITS: Visit[] = dummyData.data.visits.map(v => ({
    ...v,
    startTime: new Date(v.startTime),
    endTime: new Date(v.endTime),
    // Ensure all required fields from Visit type are present
    // The dummy data seems to match the Visit type structure roughly
    isConfirmed: v.isConfirmed ?? true,
    status: (v.status as 'confirmed' | 'cancelled' | 'completed') ?? 'confirmed',
    serviceIds: [v.serviceId] // Map single serviceId to array if needed by type, checks needed
})) as unknown as Visit[];




export const VisitProvider = ({ children }: { children: ReactNode }) => {
    const [visits, setVisits] = useState<Visit[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return DEFAULT_VISITS;

            const parsed = JSON.parse(stored);
            // Re-instantiate Date objects
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

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
    }, [visits]);

    const addVisit = (visit: Visit) => {
        setVisits((prev) => [...prev, visit]);
    };

    const updateVisit = (id: string, updatedData: Partial<Visit>) => {
        setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...updatedData } : v)));
    };

    const removeVisit = (id: string) => {
        setVisits((prev) => prev.filter((v) => v.id !== id));
    };

    return (
        <VisitContext.Provider value={{ visits, addVisit, updateVisit, removeVisit }}>
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
