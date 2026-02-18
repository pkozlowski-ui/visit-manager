import { useState, useMemo } from 'react';
import { useClients } from '../context/ClientContext';
import { Search, Phone, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, listItem } from '../constants/motion';
import FAB from '../components/ui/FAB';
import Button from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';

export default function ClientsPage() {
    const { clients, addClient, deleteClient } = useClients();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 200);

    const filteredClients = useMemo(() =>
        clients.filter(c =>
            c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            c.phone?.includes(debouncedSearch)
        ),
        [clients, debouncedSearch]
    );

    const handleAddClient = (e: React.FormEvent) => {
        e.preventDefault();
        if (newClientName.trim()) {
            addClient({
                name: newClientName,
                phone: newClientPhone
            });
            setNewClientName('');
            setNewClientPhone('');
            setIsAdding(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-8">
            {/* Header */}
            <header className="flex justify-between items-end mb-8">
                <div>
                    <span className="font-ui uppercase tracking-[2px] text-[14px] text-text-secondary mb-2 block">Directory</span>
                    <h1 className="font-display text-[64px] leading-[0.9] uppercase font-normal">Clients</h1>
                </div>
            </header>

            {/* Content Container */}
            <div className="bg-card-color rounded-[32px] p-6 flex-1 flex flex-col overflow-hidden shadow-sm relative">

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                    <input
                        type="text"
                        placeholder="SEARCH CLIENTS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-color h-14 rounded-2xl pl-14 pr-6 font-display uppercase text-lg placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-red/20 transition-all"
                    />
                </div>

                {/* Add Client Form Overlay */}
                {isAdding && (
                    <div className="absolute inset-x-6 top-24 z-10">
                        <form
                            onSubmit={handleAddClient}
                            className="bg-white p-6 rounded-[24px] shadow-xl border border-gray-100 animate-scale-in flex flex-col gap-4"
                        >
                            <h3 className="font-display uppercase text-xl text-text-secondary">New Client</h3>
                            <input
                                autoFocus
                                type="text"
                                placeholder="FULL NAME..."
                                value={newClientName}
                                onChange={e => setNewClientName(e.target.value)}
                                className="w-full bg-surface-color h-14 rounded-xl px-4 font-display uppercase text-lg focus:outline-none focus:ring-2 focus:ring-accent-red/20"
                            />
                            <input
                                type="tel"
                                placeholder="PHONE (OPTIONAL)..."
                                value={newClientPhone}
                                onChange={e => setNewClientPhone(e.target.value)}
                                className="w-full bg-surface-color h-14 rounded-xl px-4 font-display uppercase text-lg focus:outline-none focus:ring-2 focus:ring-accent-red/20"
                            />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!newClientName.trim()}
                                    size="sm"
                                >
                                    Add Client
                                </Button>
                            </div>
                        </form>
                        {/* Backdrop to close */}
                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsAdding(false)} />
                    </div>
                )}

                {/* Client List */}
                <motion.div
                    className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                >
                    {filteredClients.length === 0 ? (
                        <motion.div variants={listItem} className="text-center py-20 text-text-secondary font-ui uppercase tracking-widest">
                            No clients found
                        </motion.div>
                    ) : (
                        filteredClients.map(client => (
                            <motion.div
                                key={client.id}
                                variants={listItem}
                                className="group flex items-center justify-between p-5 bg-surface-color hover:bg-white border border-transparent hover:border-black/5 rounded-2xl transition-all cursor-pointer"
                            >

                                {/* Client Info */}
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-display text-lg text-text-secondary border-2 border-white shadow-sm">
                                        {client.name.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-display text-2xl leading-none mb-1 uppercase">{client.name}</h3>
                                        <p className="font-ui text-xs text-text-secondary uppercase tracking-wider">{client.phone || 'No Phone'}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {client.phone && (
                                        <a href={`tel:${client.phone}`} className="w-10 h-10 rounded-full bg-white text-text-primary hover:bg-black hover:text-white flex items-center justify-center transition-colors shadow-sm">
                                            <Phone size={16} />
                                        </a>
                                    )}
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete client?')) deleteClient(client.id);
                                        }}
                                        size="icon"
                                        variant="secondary"
                                        className="bg-white shadow-sm hover:bg-accent-red hover:text-white"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>

            {/* FAB */}
            <div className={`absolute bottom-10 right-10 transition-transform duration-300 ${isAdding ? 'rotate-45' : ''}`}>
                <FAB
                    color="red"
                    ariaLabel="Add New Client"
                    onClick={() => setIsAdding(!isAdding)}
                />
            </div>
        </div>
    );
}
