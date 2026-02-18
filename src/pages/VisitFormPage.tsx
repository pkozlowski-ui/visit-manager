import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { addMinutes, format, parse, parseISO } from 'date-fns';
import { ArrowLeft, X } from 'lucide-react';
import { useVisits } from '../context/VisitContext';
import { useServices } from '../context/ServiceContext';
import { useSpecialists } from '../context/SpecialistContext';
import { useClients } from '../context/ClientContext';
import { useAvailability } from '../context/AvailabilityContext';
import { roundToNearest15 } from '../utils/dateUtils';
import { sanitizeName } from '../utils/sanitize';
import SlotBrowser from '../components/stitch/SlotBrowser';
import type { AvailableSlot } from '../context/AvailabilityContext';

export default function VisitFormPage() {
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
    const [clientPhone, setClientPhone] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [customTags, setCustomTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [specialistId, setSpecialistId] = useState('any');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('30');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
    const [filterStartTime, setFilterStartTime] = useState('08:00');
    const [filterEndTime, setFilterEndTime] = useState('20:00');

    const isEdit = !!id;
    const initialVisit = isEdit ? visits.find(v => v.id === id) : null;

    // Filtered clients for autocomplete
    const filteredClients = useMemo(() => {
        if (clientName.length < 2) return [];
        return clients.filter(c =>
            c.name.toLowerCase().includes(clientName.toLowerCase())
        ).slice(0, 5);
    }, [clients, clientName]);

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
            setClientPhone(initialVisit.clientPhone || '');
            setClientId(initialVisit.clientId || '');
            setSelectedServiceIds(initialVisit.serviceIds || []);
            setCustomTags(initialVisit.customTags || []);
            setSpecialistId(initialVisit.specialistId || '');
        } else {
            const dateParam = searchParams.get('date');
            const initialDate = dateParam ? parseISO(dateParam) : new Date();
            const roundedDate = roundToNearest15(initialDate);

            setStartDate(format(roundedDate, 'yyyy-MM-dd'));
            setStartTime(''); // Don't pre-select time for New visits to allow explicit slot selection
            setDurationMinutes('30');
            setSpecialistId(searchParams.get('specialistId') || 'any');
        }
    }, [id, initialVisit, isEdit, searchParams]);

    // Reset selection when filtering criteria change (for New visits)
    useEffect(() => {
        if (!isEdit) {
            setStartTime('');
            setSelectedSlot(null);
        }
    }, [specialistId, durationMinutes, startDate, isEdit]);

    // Sync visits to AvailabilityContext
    useEffect(() => {
        setVisits(visits);
    }, [visits, setVisits]);

    // Auto-search for slots
    useEffect(() => {
        const dateStr = startDate || format(new Date(), 'yyyy-MM-dd');
        // Parse the start date at midnight to find slots for the selected day
        const searchDate = parseISO(dateStr);

        const slots = findAvailableSlots({
            specialistId,
            after: searchDate,
            durationMinutes: parseInt(durationMinutes),
            daysToSearch: 7,
            excludeVisitId: id
        });
        setAvailableSlots(slots);
    }, [specialistId, durationMinutes, startDate, id, findAvailableSlots]);

    const filteredAvailableSlots = useMemo(() => {
        return availableSlots.filter(slot => {
            return slot.startTime >= filterStartTime && slot.startTime <= filterEndTime;
        });
    }, [availableSlots, filterStartTime, filterEndTime]);

    const handleSlotSelect = (slot: AvailableSlot) => {
        setSelectedSlot(slot);
        setStartDate(format(slot.date, 'yyyy-MM-dd'));
        setStartTime(slot.startTime);
        setSpecialistId(slot.specialistId);
        setError(null);
    };

    const handleClientSelect = (client: typeof clients[0]) => {
        setClientName(client.name);
        setClientId(client.id);
        setClientPhone(client.phone || '');
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const [hours, minutes] = startTime.split(':').map(Number);
        const [year, month, day] = startDate.split('-').map(Number);
        const start = new Date(year, month - 1, day, hours, minutes);
        const end = addMinutes(start, parseInt(durationMinutes));

        if (!isSalonOpen(start)) {
            setError('Salon Closed');
            return;
        }

        if (specialistId !== 'any' && !isSpecialistAvailable(specialistId, start, end, id)) {
            setError('Specialist Busy');
            return;
        }

        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        const selectedClient = clients.find(c => c.id === clientId);
        const finalClientName = selectedClient ? selectedClient.name : clientName;

        const visitData = {
            clientId: clientId || undefined,
            clientName: sanitizeName(finalClientName),
            clientPhone: clientPhone || undefined,
            serviceIds: selectedServiceIds,
            customTags: customTags,
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
        if (confirm('Delete this visit?')) {
            if (id) removeVisit(id);
            navigate('/');
        }
    };

    const canSave = (clientId || clientName) && (selectedServiceIds.length > 0 || customTags.length > 0) && specialistId && startTime && startDate;

    return (
        <div className="h-full flex flex-col p-8 overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center mb-12 shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm group"
                    >
                        <ArrowLeft size={32} />
                    </button>
                    <div>
                        <h1 className="font-display text-[48px] leading-[0.9] uppercase font-normal">
                            {isEdit ? 'Edit Visit' : 'New Visit'}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Selected Slot Summary (In Header) - Only show if Edit mode OR user explicitly selected a slot */}
                    {(isEdit || selectedSlot) && startTime && (
                        <div className="bg-white rounded-[24px] p-4 flex items-center gap-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col">
                                <span className="font-ui text-[10px] font-black uppercase text-accent-red tracking-wider">Selected Visit</span>
                                <span className="font-display text-2xl text-text-primary uppercase leading-none mt-1">
                                    {startTime} — {format(addMinutes(parse(`${startTime}`, 'HH:mm', new Date()), parseInt(durationMinutes)), 'HH:mm')}
                                </span>
                            </div>

                            {(specialistId && specialistId !== 'any' || selectedSlot?.specialistId) && (
                                <div className="h-10 w-px bg-gray-100" />
                            )}

                            {(specialistId && specialistId !== 'any' || selectedSlot?.specialistId) && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-lg text-white shadow-sm"
                                        style={{ backgroundColor: specialists.find(s => s.id === (specialistId !== 'any' ? specialistId : selectedSlot?.specialistId))?.color || '#000' }}>
                                        {specialists.find(s => s.id === (specialistId !== 'any' ? specialistId : selectedSlot?.specialistId))?.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-ui text-[10px] font-black uppercase text-text-secondary/40 tracking-wider">Specialist</span>
                                        <span className="font-display text-lg text-text-primary uppercase leading-none">
                                            {specialists.find(s => s.id === (specialistId !== 'any' ? specialistId : selectedSlot?.specialistId))?.name.split(' ')[0]}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => { setStartTime(''); setSelectedSlot(null); }}
                                className="w-10 h-10 rounded-full bg-surface-color flex items-center justify-center text-text-secondary hover:text-accent-red transition-all group hover:scale-110 active:scale-95"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                    )}

                    {isEdit && (
                        <button onClick={handleDelete} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-accent-red hover:bg-accent-red hover:text-white transition-all shadow-sm">
                            <X size={24} />
                        </button>
                    )}
                </div>
            </header>

            {/* Content Form - Scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 h-full">

                    {/* Left Column: Client, Service, Specialist */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Client Section */}
                        <div className="bg-card-color rounded-[32px] p-6 flex flex-col gap-4 shadow-sm relative">
                            <h3 className="font-display uppercase text-xl text-text-secondary">Client</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={e => {
                                        setClientName(e.target.value);
                                        setClientId(''); // Reset ID if typing manual name
                                        setShowSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="CLIENT NAME..."
                                    className="w-full bg-surface-color h-14 rounded-2xl px-6 font-display uppercase text-xl placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-red/20 transition-all"
                                    required
                                />

                                {/* Autocomplete Suggestions */}
                                {showSuggestions && filteredClients.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                        {filteredClients.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => handleClientSelect(c)}
                                                className="w-full p-4 text-left hover:bg-surface-color transition-colors flex justify-between items-center group border-b border-gray-50 last:border-none"
                                            >
                                                <div>
                                                    <div className="font-display uppercase text-lg group-hover:text-accent-red transition-colors">{c.name}</div>
                                                    <div className="font-ui text-xs text-text-secondary">{c.phone || 'No phone'}</div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-surface-color flex items-center justify-center text-accent-red opacity-0 group-hover:opacity-100 transition-opacity">
                                                    +
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <input
                                type="tel"
                                value={clientPhone}
                                onChange={e => setClientPhone(e.target.value)}
                                placeholder="PHONE NUMBER (OPTIONAL)..."
                                className="w-full bg-surface-color h-12 rounded-xl px-4 font-display uppercase text-lg placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-red/20 transition-all mt-2"
                            />
                        </div>

                        {/* Service Section (Compacted) */}
                        <div className="bg-card-color rounded-[32px] p-6 flex flex-col gap-4 shadow-sm">
                            <h3 className="font-display uppercase text-xl text-text-secondary">Services</h3>

                            {/* Selected Services Tags */}
                            <div className="relative group">
                                <div className="w-full bg-surface-color min-h-14 rounded-xl px-4 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-accent-red/20 transition-all shadow-inner">
                                    {selectedServiceIds.map(sid => {
                                        const s = services.find(svc => svc.id === sid);
                                        return s ? (
                                            <span key={sid} className="bg-black text-white px-3 py-1.5 rounded-lg font-display uppercase text-xs flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                                                {s.name}
                                                <button type="button" onClick={() => setSelectedServiceIds(prev => prev.filter(i => i !== sid))} className="hover:text-accent-red transition-colors">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ) : null;
                                    })}
                                    {customTags.map((tag, idx) => (
                                        <span key={idx} className="bg-white text-text-primary border border-black/10 px-3 py-1.5 rounded-lg font-display uppercase text-xs flex items-center gap-2 italic animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                                            {tag}
                                            <button type="button" onClick={() => setCustomTags(prev => prev.filter((_, i) => i !== idx))} className="hover:text-accent-red transition-colors">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && tagInput.trim()) {
                                                e.preventDefault();
                                                setCustomTags(prev => [...prev, tagInput.trim()]);
                                                setTagInput('');
                                            }
                                        }}
                                        placeholder={selectedServiceIds.length === 0 && customTags.length === 0 ? "TYPE SERVICE OR TAG..." : ""}
                                        className="flex-1 min-w-[120px] bg-transparent h-10 font-display uppercase text-lg placeholder:text-text-secondary/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {services.map(s => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => {
                                            if (!selectedServiceIds.includes(s.id)) {
                                                setSelectedServiceIds(prev => [...prev, s.id]);
                                            } else {
                                                setSelectedServiceIds(prev => prev.filter(id => id !== s.id));
                                            }
                                        }}
                                        className={`px-3 py-1.5 rounded-lg border transition-colors font-ui uppercase text-[10px] font-bold tracking-wider ${selectedServiceIds.includes(s.id) ? 'bg-black text-white border-black' : 'border-black/10 hover:bg-black/5'}`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Specialist Section (Moved to Left) */}
                        <div className="bg-card-color rounded-[32px] p-6 flex flex-col gap-4 shadow-sm min-h-[160px]">
                            <h3 className="font-display uppercase text-xl text-text-secondary">Specialist</h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSpecialistId('any')}
                                    className={`flex-1 min-w-[60px] max-w-[80px] rounded-2xl p-2 flex flex-col items-center gap-1 transition-all border-2 ${specialistId === 'any' ? 'bg-card-color border-black shadow-lg shadow-black/5' : 'bg-transparent border-dashed border-gray-300 hover:border-black/20'}`}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <span className="text-[18px] font-display text-text-secondary leading-none">+</span>
                                    </div>
                                    <span className="font-display text-[10px] uppercase tracking-wider text-text-secondary leading-none">Any</span>
                                </button>
                                {specialists.map(spec => (
                                    <button
                                        key={spec.id}
                                        type="button"
                                        onClick={() => setSpecialistId(spec.id)}
                                        className={`flex-1 min-w-[60px] max-w-[80px] bg-card-color rounded-2xl p-2 flex flex-col items-center gap-1 transition-all border-2 ${specialistId === spec.id ? 'border-black shadow-lg shadow-black/5' : 'border-transparent hover:scale-[1.02] hover:bg-gray-50/50'}`}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center font-display text-sm text-white shadow-inner ring-2 ring-white/20"
                                            style={{ backgroundColor: spec.color }}
                                        >
                                            {spec.name.charAt(0)}
                                        </div>
                                        <span className="font-display text-[10px] uppercase tracking-wider leading-none">{spec.name.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit (Moved here) */}
                        <div className="mt-auto">
                            <button
                                type="submit"
                                disabled={!canSave || isSaving}
                                className="w-full bg-accent-red text-white h-24 rounded-[32px] font-display uppercase text-3xl tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-accent-red/20 shrink-0"
                            >
                                {isSaving ? 'Saving...' : (isEdit ? 'Update Visit' : 'Confirm Visit')}
                            </button>
                            {error && (
                                <div className="text-accent-red font-display uppercase text-center animate-pulse mt-2">
                                    ! {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: When & Submit */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Time & Date */}
                        <div className="bg-card-color rounded-[32px] p-8 flex flex-col gap-6 shadow-sm flex-1">
                            <h3 className="font-display uppercase text-2xl text-text-secondary">When</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-ui text-xs uppercase tracking-wider text-text-secondary mb-2 block">Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full bg-surface-color h-14 rounded-xl px-4 font-display uppercase text-lg focus:outline-none focus:ring-2 focus:ring-accent-red/20 shadow-inner"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-ui text-xs uppercase tracking-wider text-text-secondary mb-2 block">Preferred Hours</label>
                                    <div className="flex items-center gap-2 bg-surface-color rounded-xl px-3 h-14 shadow-inner">
                                        <input
                                            type="time"
                                            value={filterStartTime}
                                            onChange={e => setFilterStartTime(e.target.value)}
                                            className="flex-1 bg-transparent font-display text-lg focus:outline-none text-center"
                                        />
                                        <span className="text-text-secondary/20 font-display">—</span>
                                        <input
                                            type="time"
                                            value={filterEndTime}
                                            onChange={e => setFilterEndTime(e.target.value)}
                                            className="flex-1 bg-transparent font-display text-lg focus:outline-none text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="font-ui text-xs uppercase tracking-wider text-text-secondary mb-2 block">Duration</label>
                                <div className="flex gap-2 flex-wrap mb-4">
                                    {[
                                        { label: '30m', value: '30' },
                                        { label: '1h', value: '60' },
                                        { label: '1.5h', value: '90' },
                                        { label: '2h', value: '120' }
                                    ].map(dur => (
                                        <button
                                            key={dur.value}
                                            type="button"
                                            onClick={() => setDurationMinutes(dur.value)}
                                            className={`flex-1 min-w-[60px] h-12 rounded-xl flex items-center justify-center font-display text-lg transition-all ${durationMinutes === dur.value ? 'bg-accent-red text-white' : 'bg-surface-color hover:bg-black/5'}`}
                                        >
                                            {dur.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.5"
                                        placeholder="CUSTOM HOURS..."
                                        onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            if (!isNaN(val)) setDurationMinutes((val * 60).toString());
                                        }}
                                        className="w-full bg-surface-color h-12 rounded-xl px-4 font-display uppercase text-lg placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-red/20 transition-all"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-display text-xs text-text-secondary uppercase">Hours</div>
                                </div>
                            </div>

                            {/* Slot Browser */}
                            <SlotBrowser
                                slots={filteredAvailableSlots}
                                selectedSlot={selectedSlot}
                                onSelect={handleSlotSelect}
                            />
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
