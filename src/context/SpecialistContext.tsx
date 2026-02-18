import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Specialist } from '../types';

interface SpecialistContextType {
    specialists: Specialist[];
    addSpecialist: (specialist: Omit<Specialist, 'id'>) => void;
    updateSpecialist: (id: string, specialist: Partial<Specialist>) => void;
    deleteSpecialist: (id: string) => void;
    selectedSpecialistId: string | null;
    setSelectedSpecialistId: (id: string | null) => void;
}

const SpecialistContext = createContext<SpecialistContextType | undefined>(undefined);

// Dummy Data
const DEFAULT_SPECIALISTS: Specialist[] = [
    { id: '1', name: 'Anna', role: 'Stylist', color: '#6B2737' }, // Wine Plum
    { id: '2', name: 'Marta', role: 'Junior Stylist', color: '#E08E45' }, // Toasted Almond
    { id: '3', name: 'Kate', role: 'Manager', color: '#3943B7' }, // Ocean Twilight
];

import { useToast } from './ToastContext';

export function SpecialistProvider({ children }: { children: ReactNode }) {
    const { addToast } = useToast();
    const [specialists, setSpecialists] = useState<Specialist[]>(DEFAULT_SPECIALISTS);
    const [selectedSpecialistId, setSelectedSpecialistId] = useState<string | null>(null);

    const addSpecialist = (newSpecialist: Omit<Specialist, 'id'>) => {
        const specialist = { ...newSpecialist, id: crypto.randomUUID() };
        setSpecialists(prev => [...prev, specialist]);
        addToast(`Team member added: ${specialist.name}`, 'success');
    };

    const updateSpecialist = (id: string, updated: Partial<Specialist>) => {
        setSpecialists(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
        addToast('Team member updated', 'success');
    };

    const deleteSpecialist = (id: string) => {
        setSpecialists(prev => prev.filter(s => s.id !== id));
        addToast('Team member removed', 'info');
    };

    return (
        <SpecialistContext.Provider value={{ specialists, addSpecialist, updateSpecialist, deleteSpecialist, selectedSpecialistId, setSelectedSpecialistId }}>
            {children}
        </SpecialistContext.Provider>
    );
}

export const useSpecialists = () => {
    const context = useContext(SpecialistContext);
    if (context === undefined) {
        throw new Error('useSpecialists must be used within a SpecialistProvider');
    }
    return context;
};
