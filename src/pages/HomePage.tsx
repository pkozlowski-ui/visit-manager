import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWeeks, subWeeks, addDays, subDays, isSameDay, format } from 'date-fns';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import { motion } from 'framer-motion';
import { staggerContainer, listItem } from '../constants/motion';
import { useVisits } from '../context/VisitContext';
import { useSpecialists } from '../context/SpecialistContext';
import { useServices } from '../context/ServiceContext';
import type { Visit } from '../types';
import DateScroller from '../components/stitch/DateScroller';
import Timeline from '../components/stitch/Timeline';
import { useWindowSize } from '../hooks/useWindowSize';


export default function HomePage() {
    const navigate = useNavigate();
    const { visits } = useVisits();
    const { specialists } = useSpecialists();
    const { services } = useServices();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'schedule'>('calendar');
    const [searchQuery, setSearchQuery] = useState('');

    const handlePrev = () => {
        if (viewMode === 'calendar') {
            setSelectedDate(subWeeks(selectedDate, 1));
        } else {
            setSelectedDate(subDays(selectedDate, 1));
        }
    };

    const handleNext = () => {
        if (viewMode === 'calendar') {
            setSelectedDate(addWeeks(selectedDate, 1));
        } else {
            setSelectedDate(addDays(selectedDate, 1));
        }
    };

    const handleToday = () => setSelectedDate(new Date());

    const handleSlotClick = (date: Date, specialistId?: string) => {
        navigate(`/visit/new?date=${date.toISOString()}&specialistId=${specialistId || ''}`);
    };

    const handleVisitClick = (visit: Visit) => {
        navigate(`/visit/edit/${visit.id}`);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query && viewMode !== 'schedule') {
            setViewMode('schedule');
        }
    };

    // Filter Logic
    const filteredVisits = useMemo(() => {
        let result = visits;

        // 1. Search Filter (Global)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(visit => {
                const clientMatch = visit.clientName.toLowerCase().includes(q);
                const customTagMatch = visit.customTags?.some(tag => tag.toLowerCase().includes(q));
                const serviceMatch = visit.serviceIds?.some(id => {
                    const service = services.find(s => s.id === id);
                    return service?.name.toLowerCase().includes(q);
                });
                return clientMatch || customTagMatch || serviceMatch;
            });
        }
        // 2. Date Filter (Only for Schedule Mode when NOT searching)
        else if (viewMode === 'schedule') {
            result = result.filter(visit => isSameDay(new Date(visit.startTime), selectedDate));
        }

        // Sort by time
        return result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [visits, searchQuery, viewMode, selectedDate]);

    // Group by Day for Schedule View
    const groupedVisits = useMemo(() => {
        const groups: { [key: string]: Visit[] } = {};

        filteredVisits.forEach(visit => {
            const dateKey = format(new Date(visit.startTime), 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(visit);
        });

        // Return sorted array of groups
        return Object.keys(groups).sort().map(dateKey => ({
            date: new Date(dateKey),
            visits: groups[dateKey]
        }));
    }, [filteredVisits]);

    const { width } = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    return (
        <div className="h-full flex flex-col bg-bg-color overflow-hidden">
            <DashboardHeader
                selectedDate={selectedDate}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={handleToday}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onSearch={handleSearch}
            />

            {viewMode === 'calendar' ? (
                isMobile ? (
                    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in px-4">
                        <DateScroller selectedDate={selectedDate} onDateChange={setSelectedDate} />
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <Timeline
                                selectedDate={selectedDate}
                                onSlotClick={handleSlotClick}
                                onVisitClick={handleVisitClick}
                                filterSpecialistId={useSpecialists().selectedSpecialistId}
                            />
                        </div>

                    </div>
                ) : isTablet ? (
                    <div className="flex-1 overflow-hidden animate-fade-in">
                        <CalendarGrid
                            selectedDate={selectedDate}
                            onSlotClick={handleSlotClick}
                            onVisitClick={handleVisitClick}
                            daysToShow={3}
                        />
                    </div>
                ) : (
                    <CalendarGrid
                        selectedDate={selectedDate}
                        onSlotClick={handleSlotClick}
                        onVisitClick={handleVisitClick}
                    />
                )
            ) : (
                <div className="flex-1 overflow-y-auto animate-fade-in custom-scrollbar">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="max-w-3xl mx-auto pb-20 px-8"
                    >
                        {groupedVisits.length === 0 ? (
                            <motion.div variants={listItem} className="text-center py-20 bg-white/50 rounded-[32px] border border-dashed border-gray-200 mt-8">
                                <p className="font-display uppercase text-xl text-text-secondary">No visits found</p>
                            </motion.div>
                        ) : (
                            groupedVisits.map((group) => (
                                <motion.div
                                    key={group.date.toISOString()}
                                    variants={listItem}
                                    className="pb-12"
                                >
                                    {/* Day Header */}
                                    <div className="sticky top-0 z-10 pt-10 pb-4 bg-bg-color flex items-center justify-between border-b border-black/5 -mx-8 px-8">
                                        <div className="flex items-center gap-4">
                                            <h2 className={`font-display uppercase text-3xl tracking-tighter ${isSameDay(group.date, new Date()) ? 'text-accent-red font-black' : 'text-text-primary font-normal'}`}>
                                                {isSameDay(group.date, new Date()) ? 'Today' : format(group.date, 'EEEE')}
                                            </h2>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-ui text-[10px] font-black uppercase text-text-secondary/40 tracking-[0.2em] leading-none mb-1">
                                                {format(group.date, 'MMMM')}
                                            </span>
                                            <span className="font-display text-2xl font-normal text-text-primary leading-none">
                                                {format(group.date, 'dd')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visits Grid */}
                                    <div className="grid gap-3">
                                        {group.visits.map(visit => {
                                            const specialist = specialists.find(s => s.id === visit.specialistId);
                                            const borderColor = specialist?.color || '#e5e7eb';

                                            return (
                                                <div key={visit.id} onClick={() => handleVisitClick(visit)} className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden">
                                                    <div className="flex items-center gap-5 relative z-10">
                                                        <div className="text-center min-w-[60px]">
                                                            <div className="font-display text-xl text-text-primary leading-none mb-1">
                                                                {format(new Date(visit.startTime), 'HH:mm')}
                                                            </div>
                                                            <div className="font-ui text-[10px] font-bold uppercase text-text-secondary/60 tracking-wider">
                                                                {format(new Date(visit.endTime), 'HH:mm')}
                                                            </div>
                                                        </div>

                                                        {/* Specialist Color Indicator */}
                                                        <div
                                                            className="w-1.5 h-10 rounded-full transition-colors"
                                                            style={{ backgroundColor: borderColor }}
                                                        />

                                                        <div>
                                                            <h3 className="font-display uppercase text-lg text-text-primary mb-0.5">{visit.clientName}</h3>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {visit.serviceIds?.map(id => {
                                                                    const service = services.find(s => s.id === id);
                                                                    return service ? (
                                                                        <span key={id} className="font-ui text-[10px] uppercase tracking-wider text-text-secondary bg-surface-color px-2 py-0.5 rounded-full border border-gray-100">
                                                                            {service.name}
                                                                        </span>
                                                                    ) : null;
                                                                })}
                                                                {visit.customTags?.map((tag, idx) => (
                                                                    <span key={`${tag}-${idx}`} className="font-ui text-[10px] uppercase tracking-wider text-text-secondary bg-surface-color px-2 py-0.5 rounded-full border border-gray-100 italic">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                                {specialist && (
                                                                    <span className="font-ui text-[10px] uppercase tracking-wider text-text-secondary/50 px-1.5 py-0.5 bg-gray-50 rounded-md">
                                                                        {specialist.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 relative z-10">
                                                        <div className="px-4 py-2 bg-surface-color rounded-xl font-ui text-[10px] font-bold uppercase tracking-wider text-text-secondary group-hover:bg-black group-hover:text-white transition-colors">
                                                            Edit
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
