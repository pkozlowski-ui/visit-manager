import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Visit } from '../types';

interface VisitContextType {
    visits: Visit[];
    addVisit: (visit: Visit) => void;
    updateVisit: (id: string, updatedData: Partial<Visit>) => void;
    removeVisit: (id: string) => void;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

const STORAGE_KEY = 'visit-manager-visits';

export const VisitProvider = ({ children }: { children: ReactNode }) => {
    const [visits, setVisits] = useState<Visit[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
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
