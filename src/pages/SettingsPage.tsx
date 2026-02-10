import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from '../context/ServiceContext';
import { useSpecialists } from '../context/SpecialistContext';
import { useClients } from '../context/ClientContext';
import { useAvailability } from '../context/AvailabilityContext';
import { useTheme } from '../context/ThemeContext';
import type { Service, Specialist, Client } from '../types';
import { Plus, Edit2, Trash2, User, Scissors, Users, Clock, Calendar, Settings, Globe, Sun, Moon, Monitor, Download, Upload, Database } from 'lucide-react';
import { sanitizeName, sanitizePhone, sanitizeEmail, sanitizeText, sanitizeColor } from '../utils/sanitize';
import { downloadBackup, importData, clearAllData, getBackupStats } from '../utils/dataBackup';

type Tab = 'services' | 'team' | 'clients' | 'hours' | 'preferences';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const { services, addService, updateService, deleteService } = useServices();
    const { specialists, addSpecialist, updateSpecialist, deleteSpecialist } = useSpecialists();
    const { clients, addClient, updateClient, deleteClient } = useClients();
    const { salonSchedule, updateSalonSchedule, specialClosures, addSpecialClosure, removeSpecialClosure } = useAvailability();
    const { theme, setTheme, effectiveTheme } = useTheme();

    const [activeTab, setActiveTab] = useState<Tab>('services');

    // --- SERVICE STATE ---
    const [isEditingService, setIsEditingService] = useState<string | null>(null);
    const [serviceForm, setServiceForm] = useState<Omit<Service, 'id'>>({
        name: '',
        durationMinutes: 30,
        price: 0,
        color: '#D6BCFA'
    });
    const [isAddingService, setIsAddingService] = useState(false);

    // --- SPECIALIST STATE ---
    const [isEditingSpec, setIsEditingSpec] = useState<string | null>(null);
    const [specForm, setSpecForm] = useState<Omit<Specialist, 'id'>>({
        name: '',
        role: 'Stylist',
        offDays: [],
        availabilityOverrides: {}
    });
    const [isAddingSpec, setIsAddingSpec] = useState(false);

    // --- CLIENT STATE ---
    const [isEditingClient, setIsEditingClient] = useState<string | null>(null);
    const [clientForm, setClientForm] = useState<Omit<Client, 'id' | 'createdAt'>>({
        name: '',
        phone: '',
        email: '',
        notes: ''
    });
    const [isAddingClient, setIsAddingClient] = useState(false);

    // --- SERVICE HANDLERS ---
    const resetServiceForm = () => {
        setServiceForm({ name: '', durationMinutes: 30, price: 0, color: '#D6BCFA' });
        setIsEditingService(null);
        setIsAddingService(false);
    };

    const handleEditServiceClick = (service: Service) => {
        setServiceForm({
            name: service.name,
            durationMinutes: service.durationMinutes,
            price: service.price,
            color: service.color || '#D6BCFA'
        });
        setIsEditingService(service.id);
        setIsAddingService(false);
    };

    const handleSaveService = () => {
        // Sanitize service data before saving
        const sanitizedService = {
            ...serviceForm,
            name: sanitizeName(serviceForm.name),
            color: sanitizeColor(serviceForm.color || '#D6BCFA'),
        };

        if (isEditingService) {
            updateService(isEditingService, sanitizedService);
        } else {
            addService(sanitizedService);
        }
        resetServiceForm();
    };

    // --- SPECIALIST HANDLERS ---
    const resetSpecForm = () => {
        setSpecForm({ name: '', role: 'Stylist', offDays: [], availabilityOverrides: {} });
        setIsEditingSpec(null);
        setIsAddingSpec(false);
    };

    const handleEditSpecClick = (spec: Specialist) => {
        setSpecForm({
            name: spec.name,
            role: spec.role,
            offDays: spec.offDays || [],
            availabilityOverrides: spec.availabilityOverrides || {}
        });
        setIsEditingSpec(spec.id);
        setIsAddingSpec(false);
    };

    const handleSaveSpec = () => {
        // Sanitize specialist data before saving
        const sanitizedSpec = {
            ...specForm,
            name: sanitizeName(specForm.name),
            role: sanitizeName(specForm.role),
        };

        if (isEditingSpec) {
            updateSpecialist(isEditingSpec, sanitizedSpec);
        } else {
            addSpecialist(sanitizedSpec);
        }
        resetSpecForm();
    }

    // --- CLIENT HANDLERS ---
    const resetClientForm = () => {
        setClientForm({ name: '', phone: '', email: '', notes: '' });
        setIsEditingClient(null);
        setIsAddingClient(false);
    };

    const handleEditClientClick = (client: Client) => {
        setClientForm({
            name: client.name,
            phone: client.phone || '',
            email: client.email || '',
            notes: client.notes || ''
        });
        setIsEditingClient(client.id);
        setIsAddingClient(false);
    };

    const handleSaveClient = () => {
        // Sanitize client data before saving
        const sanitizedClient = {
            ...clientForm,
            name: sanitizeName(clientForm.name),
            phone: sanitizePhone(clientForm.phone || ''),
            email: sanitizeEmail(clientForm.email || ''),
            notes: sanitizeText(clientForm.notes || '', 500),
        };

        if (isEditingClient) {
            updateClient(isEditingClient, sanitizedClient);
        } else {
            addClient(sanitizedClient);
        }
        resetClientForm();
    };

    const handleDelete = (id: string, type: 'service' | 'specialist' | 'client') => {
        if (confirm(t('confirm_delete') || 'Are you sure?')) {
            if (type === 'service') deleteService(id);
            else if (type === 'specialist') deleteSpecialist(id);
            else deleteClient(id);
        }
    };

    const TabButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === id
                ? 'bg-white text-text-main shadow-sm ring-1 ring-black/5'
                : 'text-text-muted hover:text-text-main'
                }`}
        >
            <Icon size={16} strokeWidth={2.5} />
            {label}
        </button>
    );

    return (
        <div className="min-h-full bg-gray-50/30 pb-28">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-200">
                <div className="px-6 py-4 flex items-center gap-4">
                    <h1 className="text-2xl font-black text-text-main tracking-tightest">Settings</h1>
                </div>

                {/* Tabs - Segmented Control */}
                <div className="px-6 pb-4">
                    <div className="flex bg-gray-100/80 p-1 rounded-xl shrink-0 gap-1 backdrop-blur-sm">
                        <TabButton id="services" label="Services" icon={Scissors} />
                        <TabButton id="team" label="Team" icon={Users} />
                        <TabButton id="clients" label="Clients" icon={User} />
                        <TabButton id="hours" label="Hours" icon={Clock} />
                        <TabButton id="preferences" label="Preferences" icon={Settings} />
                    </div>
                </div>
            </header>

            <div className="px-6 py-6 space-y-6 animate-fade-in">
                {/* --- SERVICES TAB --- */}
                {activeTab === 'services' && (
                    <div className="space-y-5">

                        {(isAddingService || isEditingService) && (
                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-float space-y-4 animate-scale-in">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-sm text-text-muted uppercase tracking-wider">{isEditingService ? 'Edit Service' : 'New Service'}</h3>
                                    <button onClick={resetServiceForm} className="text-text-muted hover:text-text-main"><Trash2 size={16} /></button>
                                </div>
                                <input
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none font-bold text-lg transition-all"
                                    placeholder="Service Name"
                                    value={serviceForm.name}
                                    onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                                    autoFocus
                                />
                                <div>
                                    <label className="text-xs text-text-muted/60 font-bold mb-3 block text-center uppercase tracking-widest">Duration</label>
                                    <div className="flex gap-4 justify-center items-center">
                                        {/* Hours Spinner */}
                                        <div className="flex flex-col items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentHours = Math.floor(serviceForm.durationMinutes / 60);
                                                    const currentMinutes = serviceForm.durationMinutes % 60;
                                                    setServiceForm({ ...serviceForm, durationMinutes: (currentHours + 1) * 60 + currentMinutes });
                                                }}
                                                className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-main">
                                                    <path d="M8 6L12 10H4l4-4z" fill="currentColor" />
                                                </svg>
                                            </button>
                                            <div className="w-20 h-16 rounded-2xl bg-white border-2 border-gray-100 flex flex-col items-center justify-center">
                                                <div className="text-3xl font-black text-text-main tabular-nums">
                                                    {Math.floor(serviceForm.durationMinutes / 60)}
                                                </div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                    hour{Math.floor(serviceForm.durationMinutes / 60) !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentHours = Math.floor(serviceForm.durationMinutes / 60);
                                                    const currentMinutes = serviceForm.durationMinutes % 60;
                                                    if (currentHours > 0) {
                                                        setServiceForm({ ...serviceForm, durationMinutes: (currentHours - 1) * 60 + currentMinutes });
                                                    }
                                                }}
                                                className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                                disabled={Math.floor(serviceForm.durationMinutes / 60) === 0}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-main">
                                                    <path d="M8 10L4 6h8l-4 4z" fill="currentColor" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Separator */}
                                        <div className="text-3xl font-black text-text-muted/30 pb-8">:</div>

                                        {/* Minutes Spinner */}
                                        <div className="flex flex-col items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentHours = Math.floor(serviceForm.durationMinutes / 60);
                                                    const currentMinutes = serviceForm.durationMinutes % 60;
                                                    const newMinutes = currentMinutes === 30 ? 0 : 30;
                                                    const newHours = currentMinutes === 30 ? currentHours + 1 : currentHours;
                                                    setServiceForm({ ...serviceForm, durationMinutes: newHours * 60 + newMinutes });
                                                }}
                                                className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-main">
                                                    <path d="M8 6L12 10H4l4-4z" fill="currentColor" />
                                                </svg>
                                            </button>
                                            <div className="w-20 h-16 rounded-2xl bg-white border-2 border-gray-100 flex flex-col items-center justify-center">
                                                <div className="text-3xl font-black text-text-main tabular-nums">
                                                    {String(serviceForm.durationMinutes % 60).padStart(2, '0')}
                                                </div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                    min
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentHours = Math.floor(serviceForm.durationMinutes / 60);
                                                    const currentMinutes = serviceForm.durationMinutes % 60;
                                                    const newMinutes = currentMinutes === 0 ? 30 : 0;
                                                    const newHours = currentMinutes === 0 ? (currentHours > 0 ? currentHours - 1 : 0) : currentHours;
                                                    setServiceForm({ ...serviceForm, durationMinutes: newHours * 60 + newMinutes });
                                                }}
                                                className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                                disabled={serviceForm.durationMinutes === 0}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-main">
                                                    <path d="M8 10L4 6h8l-4 4z" fill="currentColor" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button onClick={handleSaveService} className="w-full py-3.5 text-base font-bold text-white bg-primary rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                                        {isEditingService ? 'Update Service' : 'Save Service'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {services.map(service => (
                                <div key={service.id} className="group relative bg-white border border-gray-100/50 rounded-3xl p-5 shadow-card hover:shadow-float transition-all duration-300 active:scale-[0.99] overflow-hidden">
                                    <div className="flex items-start gap-4 relaitve z-10">
                                        <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-xl font-bold transition-transform group-hover:rotate-6" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
                                            {service.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-extrabold text-text-main text-lg leading-tight mb-2">{service.name}</h3>
                                            <span className="bg-gray-100/80 px-2.5 py-1 rounded-lg text-xs font-bold text-text-muted inline-flex items-center gap-1">
                                                {service.durationMinutes} min
                                            </span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditServiceClick(service)} className="p-2 bg-white text-text-muted hover:text-primary shadow-sm ring-1 ring-gray-100 rounded-xl transition-colors"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(service.id, 'service')} className="p-2 bg-white text-red-400 hover:text-red-500 shadow-sm ring-1 ring-gray-100 rounded-xl transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TEAM TAB --- */}
                {activeTab === 'team' && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-text-main tracking-tight">Team Members</h2>
                        </div>

                        {(isAddingSpec || isEditingSpec) && (
                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-float space-y-4 animate-scale-in">
                                <h3 className="font-bold text-sm text-text-muted uppercase tracking-wider">{isEditingSpec ? 'Edit Member' : 'New Member'}</h3>
                                <input
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none font-bold text-lg transition-all"
                                    placeholder="Name (e.g. Anna)"
                                    value={specForm.name}
                                    onChange={e => setSpecForm({ ...specForm, name: e.target.value })}
                                    autoFocus
                                />
                                <input
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                    placeholder="Role (e.g. Stylist)"
                                    value={specForm.role}
                                    onChange={e => setSpecForm({ ...specForm, role: e.target.value })}
                                />

                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Availability Overrides</h4>
                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-text-muted">Off-days (Holidays)</span>
                                            <input
                                                type="date"
                                                className="text-[10px] p-1 border rounded bg-white font-bold"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        setSpecForm({ ...specForm, offDays: [...(specForm.offDays || []), e.target.value] });
                                                        e.target.value = ''; // Reset input
                                                    }
                                                }}
                                            />
                                        </div>
                                        {specForm.offDays && specForm.offDays.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {specForm.offDays.map(day => (
                                                    <span key={day} className="bg-white border border-gray-100 px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm">
                                                        {day}
                                                        <button onClick={() => setSpecForm({ ...specForm, offDays: specForm.offDays?.filter(d => d !== day) })} className="text-red-400 hover:text-red-500 transition-colors">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {(!specForm.offDays || specForm.offDays.length === 0) && <p className="text-xs text-text-muted italic">No custom off-days set</p>}
                                    </div>

                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3 text-sm">
                                        <h5 className="font-bold text-text-muted">Weekly Overrides (Beta)</h5>
                                        <p className="text-[10px] text-text-muted italic leading-tight">Setting overrides here will take precedence over Salon Hours for this member.</p>
                                        <div className="space-y-2">
                                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                                <div key={day} className="flex items-center justify-between">
                                                    <span className="text-xs font-bold capitalize">{day.substring(0, 3)}</span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={specForm.availabilityOverrides?.[day]?.isOpen || false}
                                                            onChange={(e) => {
                                                                const overrides = { ...specForm.availabilityOverrides };
                                                                if (e.target.checked) {
                                                                    overrides[day] = { isOpen: true, hours: [{ openTime: '09:00', closeTime: '17:00' }] };
                                                                } else {
                                                                    delete overrides[day];
                                                                }
                                                                setSpecForm({ ...specForm, availabilityOverrides: overrides });
                                                            }}
                                                            className="w-4 h-4"
                                                        />
                                                        {specForm.availabilityOverrides?.[day]?.isOpen && (
                                                            <div className="flex gap-1">
                                                                <input
                                                                    type="time"
                                                                    className="text-[10px] p-1 border rounded"
                                                                    value={specForm.availabilityOverrides[day].hours[0].openTime}
                                                                    onChange={(e) => {
                                                                        const overrides = { ...specForm.availabilityOverrides };
                                                                        overrides[day].hours[0].openTime = e.target.value;
                                                                        setSpecForm({ ...specForm, availabilityOverrides: overrides });
                                                                    }}
                                                                />
                                                                <input
                                                                    type="time"
                                                                    className="text-[10px] p-1 border rounded"
                                                                    value={specForm.availabilityOverrides[day].hours[0].closeTime}
                                                                    onChange={(e) => {
                                                                        const overrides = { ...specForm.availabilityOverrides };
                                                                        overrides[day].hours[0].closeTime = e.target.value;
                                                                        setSpecForm({ ...specForm, availabilityOverrides: overrides });
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button onClick={handleSaveSpec} className="w-full py-3.5 text-base font-bold text-white bg-primary rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                                        {isEditingSpec ? 'Update Member' : 'Save Member'}
                                    </button>
                                    <button onClick={resetSpecForm} className="w-full mt-2 py-3 text-sm font-semibold text-text-muted hover:text-text-main">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {specialists.map(spec => (
                                <div key={spec.id} className="group relative bg-white border border-gray-100 rounded-3xl p-5 shadow-card hover:shadow-float transition-all duration-300 flex flex-col items-center text-center">
                                    <div
                                        className="w-16 h-16 rounded-full text-white flex items-center justify-center font-black text-2xl mb-3 ring-4 ring-white shadow-lg overflow-hidden"
                                        style={{ background: `linear-gradient(135deg, ${spec.color || '#6C5DD3'}, ${spec.color || '#6C5DD3'}dd)` }}
                                    >
                                        {spec.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <h3 className="font-bold text-text-main text-lg leading-tight">{spec.name}</h3>
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-wide mt-1">{spec.role}</p>

                                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                                        <button onClick={() => handleEditSpecClick(spec)} className="p-1.5 bg-white text-text-muted hover:text-primary shadow-sm ring-1 ring-gray-100 rounded-lg"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(spec.id, 'specialist')} className="p-1.5 bg-white text-red-400 hover:text-red-500 shadow-sm ring-1 ring-gray-100 rounded-lg"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- CLIENTS TAB --- */}
                {activeTab === 'clients' && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-text-main tracking-tight">Client Database</h2>
                        </div>

                        {(isAddingClient || isEditingClient) && (
                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-float space-y-4 animate-scale-in">
                                <h3 className="font-bold text-sm text-text-muted uppercase tracking-wider">{isEditingClient ? 'Edit Client' : 'New Client'}</h3>
                                <input
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none font-bold text-lg"
                                    placeholder="Full Name"
                                    value={clientForm.name}
                                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                                    autoFocus
                                />
                                <div className="space-y-3">
                                    <input
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        placeholder="Phone Number"
                                        value={clientForm.phone}
                                        onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                                    />
                                    <input
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        placeholder="Email Address"
                                        value={clientForm.email}
                                        onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="pt-2">
                                    <button onClick={handleSaveClient} className="w-full py-3.5 text-base font-bold text-white bg-primary rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                                        {isEditingClient ? 'Update Client' : 'Save Client'}
                                    </button>
                                    <button onClick={resetClientForm} className="w-full mt-2 py-3 text-sm font-semibold text-text-muted hover:text-text-main">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {clients.map(client => (
                                <div key={client.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-3xl shadow-card hover:shadow-float hover:scale-[1.01] transition-all duration-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tertiary/20 to-secondary/20 text-text-main flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-text-main text-base">{client.name}</div>
                                            <div className="text-xs text-text-muted mt-0.5 font-medium flex gap-2 items-center">
                                                {client.phone && <span>{client.phone}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditClientClick(client)} className="w-9 h-9 flex items-center justify-center bg-gray-50 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(client.id, 'client')} className="w-9 h-9 flex items-center justify-center bg-gray-50 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* --- HOURS TAB --- */}
                {activeTab === 'hours' && (
                    <div className="space-y-6 animate-fade-in pb-10">
                        <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft">
                            <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                                <Clock className="text-primary" size={24} /> Weekly Schedule
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(salonSchedule).map(([day, schedule]) => (
                                    <div key={day} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={schedule.isOpen}
                                                onChange={(e) => {
                                                    const newSchedule = { ...salonSchedule };
                                                    newSchedule[day] = { ...schedule, isOpen: e.target.checked };
                                                    updateSalonSchedule(newSchedule);
                                                }}
                                                className="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="font-bold text-text-main capitalize">{day}</span>
                                        </div>
                                        {schedule.isOpen && schedule.hours.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={schedule.hours[0].openTime}
                                                    onChange={(e) => {
                                                        const newSchedule = { ...salonSchedule };
                                                        newSchedule[day].hours[0].openTime = e.target.value;
                                                        updateSalonSchedule(newSchedule);
                                                    }}
                                                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold shadow-sm"
                                                />
                                                <span className="text-text-muted text-xs font-bold">-</span>
                                                <input
                                                    type="time"
                                                    value={schedule.hours[0].closeTime}
                                                    onChange={(e) => {
                                                        const newSchedule = { ...salonSchedule };
                                                        newSchedule[day].hours[0].closeTime = e.target.value;
                                                        updateSalonSchedule(newSchedule);
                                                    }}
                                                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold shadow-sm"
                                                />
                                            </div>
                                        )}
                                        {!schedule.isOpen && (
                                            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Closed</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft">
                            <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                                <Calendar className="text-primary" size={24} /> Holiday & Special Closures
                            </h2>
                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-6 space-y-3">
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Add New Closure</p>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        id="new-closure-date"
                                        className="flex-1 p-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                        type="text"
                                        id="new-closure-reason"
                                        placeholder="Reason (e.g. Christmas)"
                                        className="flex-[2] p-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button
                                        onClick={() => {
                                            const dateEl = document.getElementById('new-closure-date') as HTMLInputElement;
                                            const reasonEl = document.getElementById('new-closure-reason') as HTMLInputElement;
                                            if (dateEl.value && reasonEl.value) {
                                                addSpecialClosure({ date: dateEl.value, reason: reasonEl.value });
                                                dateEl.value = '';
                                                reasonEl.value = '';
                                            }
                                        }}
                                        className="px-4 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
                                    >
                                        ADD
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {specialClosures.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <p className="text-text-muted text-sm font-medium">No special closures planned</p>
                                    </div>
                                ) : (
                                    specialClosures.map(closure => (
                                        <div key={closure.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div>
                                                <p className="font-bold text-text-main">{closure.date}</p>
                                                <p className="text-xs text-text-muted font-medium">{closure.reason}</p>
                                            </div>
                                            <button
                                                onClick={() => removeSpecialClosure(closure.date)}
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {/* --- PREFERENCES TAB --- */}
                {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        {/* Language Selector */}
                        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-float">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Globe size={20} className="text-primary" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Language</h3>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => i18n.changeLanguage('en')}
                                    className={`flex-1 py-4 px-6 rounded-2xl font-black text-base transition-all ${i18n.language === 'en'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                        : 'bg-gray-50 text-text-muted hover:bg-gray-100 hover:scale-105 active:scale-95 border border-gray-100'
                                        }`}
                                >
                                    🇬🇧 English
                                </button>
                                <button
                                    onClick={() => i18n.changeLanguage('pl')}
                                    className={`flex-1 py-4 px-6 rounded-2xl font-black text-base transition-all ${i18n.language === 'pl'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                        : 'bg-gray-50 text-text-muted hover:bg-gray-100 hover:scale-105 active:scale-95 border border-gray-100'
                                        }`}
                                >
                                    🇵🇱 Polski
                                </button>
                            </div>
                        </section>

                        {/* Theme Selector */}
                        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-float">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Sun size={20} className="text-primary" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Theme</h3>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex-1 py-4 px-4 rounded-2xl font-black text-sm transition-all flex flex-col items-center gap-2 ${theme === 'light'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                        : 'bg-gray-50 text-text-muted hover:bg-gray-100 hover:scale-105 active:scale-95 border border-gray-100'
                                        }`}
                                >
                                    <Sun size={24} strokeWidth={2.5} />
                                    Light
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 py-4 px-4 rounded-2xl font-black text-sm transition-all flex flex-col items-center gap-2 ${theme === 'dark'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                        : 'bg-gray-50 text-text-muted hover:bg-gray-100 hover:scale-105 active:scale-95 border border-gray-100'
                                        }`}
                                >
                                    <Moon size={24} strokeWidth={2.5} />
                                    Dark
                                </button>
                                <button
                                    onClick={() => setTheme('device')}
                                    className={`flex-1 py-4 px-4 rounded-2xl font-black text-sm transition-all flex flex-col items-center gap-2 ${theme === 'device'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                        : 'bg-gray-50 text-text-muted hover:bg-gray-100 hover:scale-105 active:scale-95 border border-gray-100'
                                        }`}
                                >
                                    <Monitor size={24} strokeWidth={2.5} />
                                    Device
                                </button>
                            </div>

                            {/* Current Theme Info */}
                            {theme === 'device' && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-text-muted font-semibold text-center">
                                        Currently using: <span className="font-black text-text-main capitalize">{effectiveTheme}</span> mode
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Data Backup */}
                        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-float">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Database size={20} className="text-primary" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Data Backup</h3>
                            </div>

                            {/* Backup Stats */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4">
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Current Data</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {(() => {
                                        const stats = getBackupStats();
                                        return (
                                            <>
                                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                    <div className="text-2xl font-black text-primary">{stats.clients}</div>
                                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clients</div>
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                    <div className="text-2xl font-black text-primary">{stats.visits}</div>
                                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Visits</div>
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                    <div className="text-2xl font-black text-primary">{stats.services}</div>
                                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Services</div>
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                    <div className="text-2xl font-black text-primary">{stats.specialists}</div>
                                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Team</div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={() => {
                                    try {
                                        downloadBackup();
                                        alert('✅ Backup downloaded successfully!');
                                    } catch {
                                        alert('❌ Failed to export data. Please try again.');
                                    }
                                }}
                                className="w-full py-4 px-6 rounded-2xl font-black text-base transition-all bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mb-3"
                            >
                                <Download size={20} strokeWidth={2.5} />
                                Export Backup
                            </button>

                            {/* Import Button */}
                            <label className="w-full py-4 px-6 rounded-2xl font-black text-base transition-all bg-gray-50 text-text-muted hover:bg-gray-100 hover:scale-105 active:scale-95 border border-gray-100 flex items-center justify-center gap-2 cursor-pointer mb-3">
                                <Upload size={20} strokeWidth={2.5} />
                                Import Backup
                                <input
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            try {
                                                const backup = JSON.parse(event.target?.result as string);
                                                const result = importData(backup);

                                                if (result.success) {
                                                    alert('✅ Data imported successfully! Reloading page...');
                                                    window.location.reload();
                                                } else {
                                                    alert(`❌ Failed to import: ${result.error}`);
                                                }
                                            } catch {
                                                alert('❌ Invalid backup file format.');
                                            }
                                        };
                                        reader.readAsText(file);
                                        e.target.value = ''; // Reset input
                                    }}
                                />
                            </label>

                            {/* Clear Data Button */}
                            <button
                                onClick={() => {
                                    if (confirm('⚠️ This will delete ALL data (clients, visits, services, team). This action cannot be undone!\n\nMake sure you have exported a backup first.\n\nAre you sure?')) {
                                        clearAllData();
                                        alert('🗑️ All data cleared. Reloading page...');
                                        window.location.reload();
                                    }
                                }}
                                className="w-full py-3 px-6 rounded-2xl font-bold text-sm transition-all bg-red-50 text-red-500 hover:bg-red-100 hover:scale-105 active:scale-95 border border-red-200 flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} strokeWidth={2.5} />
                                Clear All Data
                            </button>

                            {/* Info */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-600 font-semibold leading-relaxed">
                                    💡 <span className="font-black">Tip:</span> Export backups regularly to prevent data loss. All data is stored in your browser's LocalStorage.
                                </p>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Floating Action Button (Unified) */}
            <button
                onClick={() => {
                    if (activeTab === 'services') setIsAddingService(true);
                    else if (activeTab === 'team') setIsAddingSpec(true);
                    else if (activeTab === 'clients') setIsAddingClient(true);
                }}
                style={{ display: activeTab === 'hours' || activeTab === 'preferences' ? 'none' : 'flex' }}
                className="fixed bottom-24 right-6 bg-primary text-white px-6 py-4 rounded-full shadow-xl shadow-primary/40 flex items-center gap-2 animate-bounce-subtle z-30 hover:scale-105 transition-transform"
            >
                <Plus size={22} strokeWidth={3} />
                <span className="font-black text-sm uppercase tracking-wider">
                    Add {activeTab === 'services' ? 'Service' : activeTab === 'team' ? 'Member' : 'Client'}
                </span>
            </button>
        </div>
    );
}
