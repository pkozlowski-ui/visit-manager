import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { addMinutes, format, parseISO } from 'date-fns';
import { Clock, User, Scissors, ArrowLeft, Trash2, Calendar, Briefcase, Check, Users } from 'lucide-react';
import { useVisits } from '../context/VisitContext';
import { useServices } from '../context/ServiceContext';
import { useSpecialists } from '../context/SpecialistContext';
import { useClients } from '../context/ClientContext';
import { useAvailability } from '../context/AvailabilityContext';
import { roundToNearest15 } from '../utils/dateUtils';
import { sanitizeName, sanitizeText } from '../utils/sanitize';
import Autocomplete from '../components/stitch/Autocomplete';
import SlotBrowser from '../components/stitch/SlotBrowser';
import type { AvailableSlot } from '../context/AvailabilityContext';

export default function VisitFormPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const { visits, addVisit, updateVisit, removeVisit } = useVisits();
    const { services } = useServices();
    const { specialists } = useSpecialists();
    const { clients } = useClients();
    const { isSalonOpen, isSpecialistAvailable, findAvailableSlots, setVisits } = useAvailability();

    const [clientId, setClientId] = useState('');
    const [clientName, setClientName] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [specialistId, setSpecialistId] = useState('any');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('30');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isEdit = !!id;
    const initialVisit = isEdit ? visits.find(v => v.id === id) : null;

    // Initial Load & Query Params
    useEffect(() => {
        if (isEdit && initialVisit) {
            const start = new Date(initialVisit.startTime);
            const end = new Date(initialVisit.endTime);
            const duration = Math.round((end.getTime() - start.getTime()) / 60000);

            setStartDate(format(start, 'yyyy-MM-dd'));
            setStartTime(format(start, 'HH:mm'));
            setDurationMinutes(duration.toString());
            setClientName(initialVisit.clientName);
            setClientId(initialVisit.clientId || '');
            setServiceDescription(initialVisit.serviceDescription);
            setServiceId(initialVisit.serviceId || '');
            setSpecialistId(initialVisit.specialistId || '');
        } else {
            const dateParam = searchParams.get('date');
            const initialDate = dateParam ? parseISO(dateParam) : new Date();
            const roundedDate = roundToNearest15(initialDate);

            setStartDate(format(roundedDate, 'yyyy-MM-dd'));
            setStartTime(format(roundedDate, 'HH:mm'));
            setDurationMinutes('30');
            setSpecialistId(searchParams.get('specialistId') || 'any');
        }
    }, [id, initialVisit, isEdit, searchParams]);

    // Sync visits to AvailabilityContext for overlap detection
    useEffect(() => {
        setVisits(visits);
    }, [visits, setVisits]);

    // Auto-search for slots
    useEffect(() => {
        if (!isEdit) {
            const dateStr = startDate || format(new Date(), 'yyyy-MM-dd');
            const slots = findAvailableSlots({
                specialistId,
                after: new Date(dateStr),
                durationMinutes: parseInt(durationMinutes),
                daysToSearch: 14
            });
            setAvailableSlots(slots);
        }
    }, [specialistId, durationMinutes, startDate, isEdit]);

    const handleSlotSelect = (slot: AvailableSlot) => {
        setSelectedSlot(slot);
        setStartDate(format(slot.date, 'yyyy-MM-dd'));
        setStartTime(slot.startTime);
        setSpecialistId(slot.specialistId);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const [hours, minutes] = startTime.split(':').map(Number);
        const [year, month, day] = startDate.split('-').map(Number);
        const start = new Date(year, month - 1, day, hours, minutes);
        const end = addMinutes(start, parseInt(durationMinutes));

        if (!isSalonOpen(start)) {
            setError('Salon is closed at this time');
            return;
        }

        if (specialistId !== 'any' && !isSpecialistAvailable(specialistId, start, end, id)) {
            setError('Ten specjalista ma już wizytę w tym czasie');
            return;
        }

        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        const selectedService = services.find(s => s.id === serviceId);
        const finalServiceDesc = selectedService ? selectedService.name : serviceDescription;
        const selectedClient = clients.find(c => c.id === clientId);
        const finalClientName = selectedClient ? selectedClient.name : clientName;

        // Sanitize user input before saving
        const sanitizedClientName = sanitizeName(finalClientName);
        const sanitizedServiceDesc = sanitizeText(finalServiceDesc, 200);

        const visitData = {
            clientId: clientId || undefined,
            clientName: sanitizedClientName,
            serviceDescription: sanitizedServiceDesc,
            serviceId: serviceId || undefined,
            specialistId: specialistId === 'any' ? undefined : specialistId,
            startTime: start,
            endTime: end,
            status: 'confirmed' as const,
            isConfirmed: true,
        };

        if (isEdit && id) {
            updateVisit(id, visitData);
        } else {
            addVisit({ ...visitData, id: crypto.randomUUID() });
        }

        setIsSaving(false);
        navigate('/');
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (id) {
            removeVisit(id);
            navigate('/');
        }
    };

    const canSave = (clientId || clientName) && (serviceId || serviceDescription) && specialistId && startTime && startDate;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32 lg:pb-12">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 transition-colors text-text-muted outline-none"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-black text-text-main tracking-tightest">
                            {isEdit ? t('edit_visit') : t('new_visit')}
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 lg:p-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Selection & Availability */}
                    <div className="space-y-6">
                        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <Briefcase size={20} />
                                </div>
                                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Wybierz Specjalistę</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSpecialistId('any')}
                                    className={`p-4 rounded-2xl border-2 transition-all text-left group ${specialistId === 'any' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-sm transition-all ${specialistId === 'any' ? 'bg-gradient-to-br from-primary to-secondary text-white ring-2 ring-primary/20' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-text-muted group-hover:from-primary/10 group-hover:to-secondary/10 group-hover:text-primary'}`}>
                                            <Users size={20} />
                                        </div>
                                        {specialistId === 'any' && <Check size={18} className="text-primary" strokeWidth={3} />}
                                    </div>
                                    <span className={`block text-xs font-black uppercase tracking-tight ${specialistId === 'any' ? 'text-primary' : 'text-text-muted'}`}>Dowolny</span>
                                    <span className="text-[10px] text-text-muted/60 font-bold">Wszyscy specjaliści</span>
                                </button>
                                {specialists.map(spec => {
                                    const specColor = spec.color || '#6C5DD3';
                                    const isSelected = specialistId === spec.id;

                                    return (
                                        <button
                                            key={spec.id}
                                            type="button"
                                            onClick={() => setSpecialistId(spec.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all text-left group shadow-sm hover:shadow-md ${isSelected ? 'bg-white' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}
                                            style={{ borderColor: isSelected ? specColor : undefined }}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-sm transition-all text-white ${!isSelected && 'group-hover:scale-105'}`}
                                                    style={{
                                                        background: `linear-gradient(135deg, ${specColor}, ${specColor}dd)`,
                                                        boxShadow: `0 4px 12px ${specColor}40`
                                                    }}
                                                >
                                                    {spec.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                {isSelected && <Check size={18} strokeWidth={3} style={{ color: specColor }} />}
                                            </div>
                                            <span className={`block text-xs font-black uppercase tracking-tight`} style={{ color: isSelected ? specColor : '#6B7280' }}>
                                                {spec.name.split(' ')[0]}
                                            </span>
                                            <span className="text-[10px] text-text-muted/60 font-bold">{spec.role || 'Specjalista'}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                                    <Clock size={20} />
                                </div>
                                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Termin</h3>
                            </div>

                            <div className="bg-gray-50/50 p-4 rounded-[24px] border border-gray-100 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-text-muted/60 uppercase tracking-widest mb-3 text-center">Czas trwania usługi</label>
                                    <div className="flex gap-4 justify-center items-center">
                                        {/* Hours Spinner */}
                                        <div className="flex flex-col items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentDuration = parseInt(durationMinutes);
                                                    const currentHours = Math.floor(currentDuration / 60);
                                                    const currentMinutes = currentDuration % 60;
                                                    setDurationMinutes(((currentHours + 1) * 60 + currentMinutes).toString());
                                                }}
                                                className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-main">
                                                    <path d="M8 6L12 10H4l4-4z" fill="currentColor" />
                                                </svg>
                                            </button>
                                            <div className="w-20 h-16 rounded-2xl bg-white border-2 border-gray-100 flex flex-col items-center justify-center">
                                                <div className="text-3xl font-black text-text-main tabular-nums">
                                                    {Math.floor(parseInt(durationMinutes) / 60)}
                                                </div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                    hour{Math.floor(parseInt(durationMinutes) / 60) !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentDuration = parseInt(durationMinutes);
                                                    const currentHours = Math.floor(currentDuration / 60);
                                                    const currentMinutes = currentDuration % 60;
                                                    if (currentHours > 0) {
                                                        setDurationMinutes(((currentHours - 1) * 60 + currentMinutes).toString());
                                                    }
                                                }}
                                                className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                                disabled={Math.floor(parseInt(durationMinutes) / 60) === 0}
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
                                                    const currentDuration = parseInt(durationMinutes);
                                                    const currentHours = Math.floor(currentDuration / 60);
                                                    const currentMinutes = currentDuration % 60;
                                                    const newMinutes = currentMinutes === 30 ? 0 : 30;
                                                    const newHours = currentMinutes === 30 ? currentHours + 1 : currentHours;
                                                    setDurationMinutes((newHours * 60 + newMinutes).toString());
                                                }}
                                                className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-main">
                                                    <path d="M8 6L12 10H4l4-4z" fill="currentColor" />
                                                </svg>
                                            </button>
                                            <div className="w-20 h-16 rounded-2xl bg-white border-2 border-gray-100 flex flex-col items-center justify-center">
                                                <div className="text-3xl font-black text-text-main tabular-nums">
                                                    {String(parseInt(durationMinutes) % 60).padStart(2, '0')}
                                                </div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                    min
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentDuration = parseInt(durationMinutes);
                                                    const currentHours = Math.floor(currentDuration / 60);
                                                    const currentMinutes = currentDuration % 60;
                                                    const newMinutes = currentMinutes === 0 ? 30 : 0;
                                                    const newHours = currentMinutes === 0 ? (currentHours > 0 ? currentHours - 1 : 0) : currentHours;
                                                    setDurationMinutes((newHours * 60 + newMinutes).toString());
                                                }}
                                                className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                                disabled={parseInt(durationMinutes) === 0}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-main">
                                                    <path d="M8 10L4 6h8l-4 4z" fill="currentColor" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {!isEdit && (
                                    <SlotBrowser
                                        slots={availableSlots}
                                        selectedSlot={selectedSlot}
                                        onSelect={handleSlotSelect}
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                    <Calendar size={18} className="text-primary/60" />
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-text-muted/60 uppercase tracking-widest mb-0.5">Data</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full bg-transparent font-bold text-sm text-text-main border-none p-0 focus:ring-0 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                    <Clock size={18} className="text-primary/60" />
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-text-muted/60 uppercase tracking-widest mb-0.5">Godzina</label>
                                        <select
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full bg-transparent font-bold text-sm text-text-main border-none p-0 focus:ring-0 outline-none appearance-none"
                                        >
                                            {Array.from({ length: 48 }, (_, i) => {
                                                const h = Math.floor(i / 2) + 8;
                                                const m = (i % 2) * 30;
                                                if (h >= 21) return null;
                                                const t = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                                return <option key={t} value={t}>{t}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Details & Actions */}
                    <div className="space-y-6">
                        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                                    <User size={20} />
                                </div>
                                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Szczegóły Klienta</h3>
                            </div>

                            <Autocomplete
                                options={clients.map(c => ({ id: c.id, name: c.name }))}
                                value={clientId}
                                textValue={clientName}
                                onChange={(id, name) => {
                                    setClientId(id);
                                    setClientName(name);
                                }}
                                placeholder="Wybierz lub wpisz klienta…"
                                icon={<User size={18} />}
                                required
                            />
                        </section>

                        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                                    <Scissors size={20} />
                                </div>
                                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Usługa i Notatki</h3>
                            </div>

                            <Autocomplete
                                options={services.map(s => ({ id: s.id, name: s.name }))}
                                value={serviceId}
                                textValue={serviceDescription}
                                onChange={(id, desc) => {
                                    setServiceId(id);
                                    setServiceDescription(desc);
                                }}
                                placeholder="Co robimy? (np. Strzyżenie…)"
                                icon={<Scissors size={18} />}
                                required
                            />

                            <textarea
                                placeholder="Dodatkowe notatki do wizyty..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm text-text-main"
                            />
                        </section>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake">
                                <p className="text-xs text-red-500 font-bold text-center flex items-center justify-center gap-2">
                                    <X size={14} /> {error}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 lg:pt-4">
                            {isEdit && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="p-5 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors border border-red-100 group"
                                    title="Usuń wizytę"
                                >
                                    <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 py-5 rounded-2xl font-black text-text-muted bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || !canSave}
                                className="flex-[2] py-5 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check size={20} strokeWidth={3} />
                                        {isEdit ? t('update') : t('save')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
                        <h3 className="text-lg font-black text-text-main mb-2">Usuń wizytę?</h3>
                        <p className="text-sm text-text-muted mb-6">Czy na pewno chcesz usunąć tę wizytę? Tej operacji nie można cofnąć.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 rounded-2xl font-bold text-text-muted bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                            >
                                Usuń
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const X = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);
