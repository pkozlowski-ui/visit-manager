import { useState } from 'react';
import { useClients } from '../context/ClientContext';
import { Search, Phone, UserPlus, Trash2 } from 'lucide-react';
import { sanitizeName } from '../utils/sanitize';

export default function ClientsPage() {
    const { clients, addClient, deleteClient } = useClients();
    const [searchTerm, setSearchTerm] = useState('');

    // Create New Client State (Simple inline or modal? Let's use simple inline for MVP or just a button that might open a modal later. 
    // For now let's just list with a "Add" placeholder that does nothing or simple prompt)

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="pb-24 pt- safe-top">
            {/* Header */}
            <div className="px-6 py-6 bg-white sticky top-0 z-20 border-b border-gray-100 shadow-sm backdrop-blur-md bg-white/80">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-black text-text-main tracking-tightest">Clients</h1>
                </div>

                {/* Search */}
                <div className="relative mt-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" size={20} />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-base font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted/70"
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-4 py-2 space-y-3">
                {filteredClients.length === 0 ? (
                    <div className="text-center py-10 text-text-muted">
                        <p>No clients found.</p>
                    </div>
                ) : (
                    filteredClients.map(client => (
                        <div key={client.id} className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[32px] shadow-soft hover:shadow-float hover:scale-[1.01] transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center text-white font-bold shadow-sm">
                                        {client.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main leading-tight">{client.name}</h3>
                                        {(client.phone || client.email) && (
                                            <p className="text-xs text-text-muted mt-0.5 flex flex-col">
                                                {client.phone && <span>{client.phone}</span>}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {client.phone && (
                                        <a href={`tel:${client.phone}`} className="w-11 h-11 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors active:scale-95">
                                            <Phone size={20} strokeWidth={2.5} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => deleteClient(client.id)}
                                        className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors active:scale-95"
                                    >
                                        <Trash2 size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => {
                    const name = prompt('Client Name:');
                    if (name) {
                        const sanitizedName = sanitizeName(name);
                        if (sanitizedName) {
                            addClient({ name: sanitizedName });
                        }
                    }
                }}
                className="fixed bottom-24 right-6 bg-primary text-white px-6 py-4 rounded-full shadow-xl shadow-primary/40 flex items-center gap-2 animate-bounce-subtle z-30 hover:scale-105 transition-transform"
            >
                <UserPlus size={22} strokeWidth={3} />
                <span className="font-black text-sm uppercase tracking-wider">New Client</span>
            </button>
        </div>
    );
}
