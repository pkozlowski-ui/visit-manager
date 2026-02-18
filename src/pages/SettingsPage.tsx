import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from '../context/ServiceContext';
import { useSpecialists } from '../context/SpecialistContext';

import { useAvailability } from '../context/AvailabilityContext';
import { useTheme } from '../context/ThemeContext';
import type { Service, Specialist } from '../types';
import { Edit2, Trash2, Sun, Download, Upload, Database, X, Plus } from 'lucide-react';
import { sanitizeName, sanitizeColor } from '../utils/sanitize';
import { downloadBackup, importData, clearAllData } from '../utils/dataBackup';
import { motion, AnimatePresence } from 'framer-motion';

import Button from '../components/ui/Button';

export default function SettingsPage() {
    const { t } = useTranslation();
    const { services, addService, updateService, deleteService } = useServices();
    const { specialists, addSpecialist, updateSpecialist, deleteSpecialist } = useSpecialists();

    const { salonSchedule, updateSalonSchedule, specialClosures, addSpecialClosure, removeSpecialClosure } = useAvailability();
    const { theme, setTheme } = useTheme();

    // --- SERVICE STATE ---
    const [isEditingService, setIsEditingService] = useState<string | null>(null);
    const [serviceForm, setServiceForm] = useState<Omit<Service, 'id'>>({ name: '', color: '#D6BCFA' });
    const [isAddingService, setIsAddingService] = useState(false);

    // --- SPECIALIST STATE ---
    const [isEditingSpec, setIsEditingSpec] = useState<string | null>(null);
    const [specForm, setSpecForm] = useState<Omit<Specialist, 'id'>>({ name: '', role: 'Stylist', offDays: [], availabilityOverrides: {} });
    const [isAddingSpec, setIsAddingSpec] = useState(false);


    // --- SERVICE HANDLERS ---
    const resetServiceForm = () => { setServiceForm({ name: '', color: '#D6BCFA' }); setIsEditingService(null); setIsAddingService(false); };
    const handleEditServiceClick = (service: Service) => { setServiceForm({ name: service.name, color: service.color || '#D6BCFA' }); setIsEditingService(service.id); setIsAddingService(true); };
    const handleSaveService = () => {
        const sanitized = { ...serviceForm, name: sanitizeName(serviceForm.name), color: sanitizeColor(serviceForm.color || '#D6BCFA') };
        if (isEditingService) updateService(isEditingService, sanitized); else addService(sanitized);
        resetServiceForm();
    };

    // --- SPECIALIST HANDLERS ---
    const resetSpecForm = () => { setSpecForm({ name: '', role: 'Stylist', offDays: [], availabilityOverrides: {} }); setIsEditingSpec(null); setIsAddingSpec(false); };
    const handleEditSpecClick = (spec: Specialist) => { setSpecForm({ name: spec.name, role: spec.role, offDays: spec.offDays || [], availabilityOverrides: spec.availabilityOverrides || {} }); setIsEditingSpec(spec.id); setIsAddingSpec(true); };
    const handleSaveSpec = () => {
        const sanitized = { ...specForm, name: sanitizeName(specForm.name), role: sanitizeName(specForm.role) };
        if (isEditingSpec) updateSpecialist(isEditingSpec, sanitized); else addSpecialist(sanitized);
        resetSpecForm();
    };



    const handleDelete = (id: string, type: 'service' | 'specialist') => {
        if (confirm(t('confirm_delete') || 'Are you sure?')) {
            if (type === 'service') deleteService(id);
            else deleteSpecialist(id);
        }
    };

    // Helper for section headers
    const SectionHeader = ({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) => (
        <div className="flex justify-between items-end mb-6 mt-12 first:mt-0 border-b border-black/5 pb-4">
            <div>
                {subtitle && <span className="font-ui uppercase tracking-[2px] text-[12px] text-text-secondary mb-1 block">{subtitle}</span>}
                <h2 className="font-display text-[32px] uppercase text-text-primary leading-none">{title}</h2>
            </div>
            {action}
        </div>
    );

    return (
        <div className="h-full flex flex-col p-4 md:p-8 overflow-hidden bg-bg-color">
            <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar pr-2 pb-20 space-y-12">
                {/* Main Header - Matching ClientsPage */}
                <header className="flex justify-between items-end mb-8 shrink-0">
                    <div>
                        <span className="font-ui uppercase tracking-[2px] text-[14px] text-text-secondary mb-2 block">Configuration</span>
                        <h1 className="font-display text-[48px] md:text-[64px] leading-[0.9] uppercase font-normal">Settings</h1>
                    </div>
                </header>

                {/* --- SERVICES SECTION --- */}
                <section>
                    <SectionHeader
                        title="Services"
                        subtitle="Offerings"
                        action={<Button onClick={() => { resetServiceForm(); setIsAddingService(true); }} size="sm" className="rounded-full px-4" variant="secondary"><Plus size={16} className="mr-2" /> Add Service</Button>}
                    />

                    {/* Service Form Inline */}
                    <AnimatePresence>
                        {isAddingService && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-lg space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-display uppercase text-lg text-text-secondary">{isEditingService ? 'Edit Service' : 'New Service'}</h3>
                                        <Button onClick={resetServiceForm} variant="ghost" size="icon"><X size={20} /></Button>
                                    </div>
                                    <input className="w-full bg-surface-color h-14 rounded-2xl px-6 font-display uppercase text-lg focus:outline-none focus:ring-2 focus:ring-accent-red/20"
                                        placeholder="SERVICE NAME..." value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} autoFocus />
                                    <Button onClick={handleSaveService} className="w-full" size="lg">{isEditingService ? 'Update' : 'Save'}</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {services.map(service => (
                            <motion.div key={service.id} layout className="group flex items-center justify-between p-4 bg-white hover:bg-white/80 border border-gray-100/50 hover:border-black/10 rounded-2xl transition-all shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm text-white shadow-sm" style={{ backgroundColor: service.color }}>
                                        {service.name.charAt(0)}
                                    </div>
                                    <span className="font-display uppercase text-lg leading-none">{service.name}</span>
                                </div>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button onClick={() => handleEditServiceClick(service)} size="icon" variant="ghost" className="w-8 h-8"><Edit2 size={14} /></Button>
                                    <Button onClick={() => handleDelete(service.id, 'service')} size="icon" variant="ghost" className="w-8 h-8 text-accent-red hover:bg-accent-red/10"><Trash2 size={14} /></Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* --- TEAM SECTION --- */}
                <section>
                    <SectionHeader
                        title="Team Members"
                        subtitle="Staff"
                        action={<Button onClick={() => { resetSpecForm(); setIsAddingSpec(true); }} size="sm" className="rounded-full px-4" variant="secondary"><Plus size={16} className="mr-2" /> Add Member</Button>}
                    />

                    <AnimatePresence>
                        {isAddingSpec && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-lg space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-display uppercase text-lg text-text-secondary">{isEditingSpec ? 'Edit Member' : 'New Member'}</h3>
                                        <Button onClick={resetSpecForm} variant="ghost" size="icon"><X size={20} /></Button>
                                    </div>
                                    <input className="w-full bg-surface-color h-14 rounded-2xl px-6 font-display uppercase text-lg focus:outline-none focus:ring-2 focus:ring-accent-red/20 mb-3"
                                        placeholder="NAME..." value={specForm.name} onChange={e => setSpecForm({ ...specForm, name: e.target.value })} autoFocus />
                                    <input className="w-full bg-surface-color h-14 rounded-2xl px-6 font-display uppercase text-lg focus:outline-none focus:ring-2 focus:ring-accent-red/20"
                                        placeholder="ROLE..." value={specForm.role} onChange={e => setSpecForm({ ...specForm, role: e.target.value })} />
                                    <Button onClick={handleSaveSpec} className="w-full mt-4" size="lg">{isEditingSpec ? 'Update' : 'Save'}</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {specialists.map(spec => (
                            <motion.div key={spec.id} layout className="group flex items-center justify-between p-4 bg-white hover:bg-white/80 border border-gray-100/50 hover:border-black/10 rounded-2xl transition-all shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm bg-gray-100 text-text-secondary">
                                        {spec.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-display uppercase text-lg leading-none">{spec.name}</h3>
                                        <p className="font-ui text-[10px] uppercase tracking-wider text-text-secondary">{spec.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button onClick={() => handleEditSpecClick(spec)} size="icon" variant="ghost" className="w-8 h-8"><Edit2 size={14} /></Button>
                                    <Button onClick={() => handleDelete(spec.id, 'specialist')} size="icon" variant="ghost" className="w-8 h-8 text-accent-red hover:bg-accent-red/10"><Trash2 size={14} /></Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* --- SCHEDULE SECTION --- */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <SectionHeader title="Opening Hours" subtitle="Schedule" />
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-2">
                            {Object.entries(salonSchedule).map(([day, schedule]) => (
                                <div key={day} className="flex items-center justify-between p-3 bg-surface-color/50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <input type="checkbox" checked={schedule.isOpen}
                                            onChange={(e) => updateSalonSchedule({ ...salonSchedule, [day]: { ...schedule, isOpen: e.target.checked } })}
                                            className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black accent-black" />
                                        <span className="font-display uppercase text-lg w-20">{day}</span>
                                    </div>
                                    {schedule.isOpen && schedule.hours.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <input type="time" value={schedule.hours[0].openTime}
                                                onChange={(e) => updateSalonSchedule({ ...salonSchedule, [day]: { ...schedule, hours: [{ ...schedule.hours[0], openTime: e.target.value }] } })}
                                                className="bg-transparent font-display text-lg outline-none w-20 text-right" />
                                            <span className="text-text-secondary">-</span>
                                            <input type="time" value={schedule.hours[0].closeTime}
                                                onChange={(e) => updateSalonSchedule({ ...salonSchedule, [day]: { ...schedule, hours: [{ ...schedule.hours[0], closeTime: e.target.value }] } })}
                                                className="bg-transparent font-display text-lg outline-none w-20" />
                                        </div>
                                    ) : (
                                        <span className="font-display uppercase text-text-secondary/50 tracking-wider text-sm">Closed</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <SectionHeader title="Closures" subtitle="Exceptions" />
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-6">
                            <div className="flex gap-2 mb-4">
                                <input type="date" id="new-closure-date" className="bg-surface-color px-3 py-2 rounded-xl font-display outline-none" />
                                <input type="text" id="new-closure-reason" placeholder="REASON..." className="flex-1 bg-surface-color px-3 py-2 rounded-xl font-display uppercase outline-none" />
                                <Button onClick={() => {
                                    const d = (document.getElementById('new-closure-date') as HTMLInputElement);
                                    const r = (document.getElementById('new-closure-reason') as HTMLInputElement);
                                    if (d.value && r.value) { addSpecialClosure({ date: d.value, reason: r.value }); d.value = ''; r.value = ''; }
                                }} size="icon" className="rounded-xl"><Plus size={18} /></Button>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {specialClosures.length === 0 && <div className="text-center py-4 text-text-secondary font-display uppercase text-sm">No dates</div>}
                                {specialClosures.map(c => (
                                    <div key={c.date} className="flex justify-between items-center p-3 bg-surface-color/50 rounded-xl">
                                        <div><p className="font-display">{c.date}</p><p className="text-[10px] uppercase text-text-secondary">{c.reason}</p></div>
                                        <Button onClick={() => removeSpecialClosure(c.date)} size="icon" variant="ghost" className="h-8 w-8 text-text-secondary hover:text-accent-red"><Trash2 size={14} /></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- PREFERENCES SECTION --- */}
                <section>
                    <SectionHeader title="Preferences" subtitle="System" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Theme */}
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="font-display uppercase text-lg mb-4 flex items-center gap-2"><Sun size={18} /> Theme</h3>
                            <div className="flex gap-2">
                                {['light', 'dark', 'device'].map((tMode) => (
                                    <button key={tMode} onClick={() => setTheme(tMode as any)}
                                        className={`flex-1 py-3 rounded-xl font-display uppercase text-sm border transition-all ${theme === tMode ? 'bg-black text-white border-black' : 'bg-transparent border-gray-200 hover:border-black'}`}>
                                        {tMode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data */}
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="font-display uppercase text-lg mb-4 flex items-center gap-2"><Database size={18} /> Data</h3>
                            <div className="flex gap-2">
                                <Button onClick={() => { try { downloadBackup(); alert('✅ Exported!'); } catch { alert('❌ Failed'); } }} className="flex-1" variant="secondary"><Download size={16} className="mr-2" /> Export</Button>
                                <label className="flex-1 flex items-center justify-center bg-surface-color hover:bg-gray-200 cursor-pointer rounded-xl font-display uppercase text-sm transition-colors">
                                    <Upload size={16} className="mr-2" /> Import
                                    <input type="file" accept=".json" className="hidden" onChange={(e) => {
                                        const f = e.target.files?.[0]; if (!f) return;
                                        const r = new FileReader(); r.onload = (ev) => { try { const res = importData(JSON.parse(ev.target?.result as string)); if (res.success) window.location.reload(); else alert(res.error); } catch { alert('Invalid file'); } };
                                        r.readAsText(f); e.target.value = '';
                                    }} />
                                </label>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <Button onClick={() => { if (confirm('⚠️ Erase ALL data?')) { clearAllData(); window.location.reload(); } }} variant="ghost" className="w-full text-accent-red hover:bg-accent-red/5"><Trash2 size={16} className="mr-2" /> Reset All Data</Button>
                            </div>
                        </div>
                    </div>
                </section>



                <div className="h-20"></div>
            </div>
        </div>
    );
}
