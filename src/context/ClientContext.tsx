import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Client } from '../types';

interface ClientContextType {
    clients: Client[];
    addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
    updateClient: (id: string, updated: Partial<Client>) => void;
    deleteClient: (id: string) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

import dummyData from '../data/dummy_data.json';

const STORAGE_KEY = 'visit-manager-clients-v2';

// Dummy Data
const DEFAULT_CLIENTS: Client[] = dummyData.data.clients.map(c => ({
    ...c,
    createdAt: new Date(c.createdAt)
})) as Client[];


export const ClientProvider = ({ children }: { children: ReactNode }) => {
    const [clients, setClients] = useState<Client[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_CLIENTS;
        } catch {
            return DEFAULT_CLIENTS;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    }, [clients]);

    const addClient = (newClient: Omit<Client, 'id' | 'createdAt'>) => {
        const client = {
            ...newClient,
            id: crypto.randomUUID(),
            createdAt: new Date()
        };
        setClients(prev => [...prev, client]);
    };

    const updateClient = (id: string, updated: Partial<Client>) => {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    };

    const deleteClient = (id: string) => {
        setClients(prev => prev.filter(c => c.id !== id));
    };

    return (
        <ClientContext.Provider value={{ clients, addClient, updateClient, deleteClient }}>
            {children}
        </ClientContext.Provider>
    );
};

export const useClients = () => {
    const context = useContext(ClientContext);
    if (context === undefined) {
        throw new Error('useClients must be used within a ClientProvider');
    }
    return context;
};
