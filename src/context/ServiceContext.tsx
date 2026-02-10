import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Service } from '../types';

interface ServiceContextType {
    services: Service[];
    addService: (service: Omit<Service, 'id'>) => void;
    updateService: (id: string, service: Partial<Service>) => void;
    deleteService: (id: string) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

const STORAGE_KEY = 'visit-manager-services';

// Dummy Data for immediate testing
const DEFAULT_SERVICES: Service[] = [
    { id: '1', name: 'Strzyżenie Męskie', durationMinutes: 30, price: 50, color: '#D6BCFA' }, // Purple-200
    { id: '2', name: 'Strzyżenie Damskie', durationMinutes: 60, price: 100, color: '#9AE6B4' }, // Green-200
    { id: '3', name: 'Koloryzacja', durationMinutes: 120, price: 250, color: '#FBD38D' }, // Orange-200
    { id: '4', name: 'Modelowanie', durationMinutes: 45, price: 80, color: '#E9D8FD' },
    { id: '5', name: 'Konsultacja', durationMinutes: 15, price: 0, color: '#A0AEC0' },
];

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
    const [services, setServices] = useState<Service[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_SERVICES;
        } catch {
            return DEFAULT_SERVICES;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    }, [services]);

    const addService = (newService: Omit<Service, 'id'>) => {
        const service = { ...newService, id: crypto.randomUUID() };
        setServices(prev => [...prev, service]);
    };

    const updateService = (id: string, updated: Partial<Service>) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    };

    const deleteService = (id: string) => {
        setServices(prev => prev.filter(s => s.id !== id));
    };

    return (
        <ServiceContext.Provider value={{ services, addService, updateService, deleteService }}>
            {children}
        </ServiceContext.Provider>
    );
};

export const useServices = () => {
    const context = useContext(ServiceContext);
    if (context === undefined) {
        throw new Error('useServices must be used within a ServiceProvider');
    }
    return context;
};
