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
    { id: '1', name: "Men's Haircut", color: '#D6BCFA' }, // Purple-200
    { id: '2', name: "Women's Haircut", color: '#9AE6B4' }, // Green-200
    { id: '3', name: 'Coloring', color: '#FBD38D' }, // Orange-200
    { id: '4', name: 'Styling', color: '#E9D8FD' },
    { id: '5', name: 'Consultation', color: '#A0AEC0' },
];

import { useToast } from './ToastContext';

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
    const { addToast } = useToast();
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
        addToast(`Service added: ${service.name}`, 'success');
    };

    const updateService = (id: string, updated: Partial<Service>) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
        addToast('Service updated', 'success');
    };

    const deleteService = (id: string) => {
        setServices(prev => prev.filter(s => s.id !== id));
        addToast('Service removed', 'info');
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
