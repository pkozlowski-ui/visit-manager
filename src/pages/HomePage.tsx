import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWeeks, subWeeks, addDays, subDays, isSameDay, format, startOfDay } from 'date-fns';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import { motion } from 'framer-motion';
import { listItem } from '../constants/motion';
import { useVisits } from '../context/VisitContext';
import { useSpecialists } from '../context/SpecialistContext';
import { useServices } from '../context/ServiceContext';
import type { Visit } from '../types';
import DateScroller from '../components/stitch/DateScroller';
import Timeline from '../components/stitch/Timeline';
import { useWindowSize } from '../hooks/useWindowSize';
import { useDebounce } from '../hooks/useDebounce';

const SEARCH_RESULT_LIMIT = 100;

export default function HomePage() {
    const navigate = useNavigate();
    const { visits, getVisitsForRange } = useVisits();
    const { specialists, selectedSpecialistId } = useSpecialists();
    const { services } = useServices();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'schedule'>('calendar');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllResults, setShowAllResults] = useState(false);
    const debouncedQuery = useDebounce(searchQuery, 300);
    const prevViewModeRef = useRef<'calendar' | 'schedule'>('calendar');

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

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setShowAllResults(false);
        if (query && viewMode !== 'schedule') {
            prevViewModeRef.current = viewMode;
            setViewMode('schedule');
        } else if (!query && prevViewModeRef.current === 'calendar') {
            // Auto-restore calendar view when clearing search
            setViewMode('calendar');
        }
    }, [viewMode]);

    // Pre-built search text index: Map<visitId, "clientname servicenames tags...">
    // Rebuilt only when visits or services change — eliminates nested find() during search
    const searchTextIndex = useMemo(() => {
        const serviceMap = new Map(services.map(s => [s.id, s.name.toLowerCase()]));
        const index = new Map<string, string>();
        for (const visit of visits) {
            const parts: string[] = [visit.clientName.toLowerCase()];
            if (visit.serviceIds) {
                for (const sid of visit.serviceIds) {
                    const sName = serviceMap.get(sid);
                    if (sName) parts.push(sName);
                }
            }
            if (visit.customTags) {
                for (const tag of visit.customTags) parts.push(tag.toLowerCase());
            }
            index.set(visit.id, parts.join(' '));
        }
        return index;
    }, [visits, services]);

    // Filter Logic — uses debounced query for search, date-range lookup for schedule
    const filteredVisits = useMemo(() => {
        let result: Visit[];

        // 1. Search Filter — uses pre-built text index for fast matching
        if (debouncedQuery) {
            const q = debouncedQuery.toLowerCase();
            result = visits.filter(visit => {
                const text = searchTextIndex.get(visit.id);
                return text ? text.includes(q) : false;
            });
        }
        // 2. Schedule Filter: Use date-range lookup (fetches only relevant days)
        else if (viewMode === 'schedule') {
            const start = startOfDay(selectedDate);
            const end = addDays(start, 14);
            result = getVisitsForRange(start, end);
        }
        // 3. Calendar view — data handled by CalendarGrid internally
        else {
            return [];
        }

        // Sort by time
        return result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [visits, debouncedQuery, viewMode, selectedDate, searchTextIndex, getVisitsForRange]);

    const totalResultCount = filteredVisits.length;
    const displayedVisits = showAllResults ? filteredVisits : filteredVisits.slice(0, SEARCH_RESULT_LIMIT);
    const hasMoreResults = totalResultCount > SEARCH_RESULT_LIMIT && !showAllResults;

    // Determine which specialists to show as columns
    const visibleSpecialists = useMemo(() => {
        if (selectedSpecialistId) {
            return specialists.filter(s => s.id === selectedSpecialistId);
        }
        return specialists;
    }, [specialists, selectedSpecialistId]);

    // Group visits per specialist, then by day
    const specialistColumns = useMemo(() => {
        return visibleSpecialists.map(spec => {
            const specVisits = displayedVisits.filter(v => v.specialistId === spec.id);

            // Group by day
            const dayGroups: { [key: string]: Visit[] } = {};
            specVisits.forEach(visit => {
                const dateKey = format(new Date(visit.startTime), 'yyyy-MM-dd');
                if (!dayGroups[dateKey]) dayGroups[dateKey] = [];
                dayGroups[dateKey].push(visit);
            });

            const days = Object.keys(dayGroups).sort().map(dateKey => ({
                date: new Date(dateKey),
                visits: dayGroups[dateKey]
            }));

            return { specialist: spec, days, totalVisits: specVisits.length };
        });
    }, [visibleSpecialists, displayedVisits]);

    const { width } = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    return (
        <div className={`h-full flex flex-col bg-bg-color overflow-hidden ${isTablet ? 'pb-[76px]' : ''}`}>
            <DashboardHeader
                selectedDate={selectedDate}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={handleToday}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                searchValue={searchQuery}
                onSearchChange={handleSearch}
                searchResultCount={debouncedQuery ? totalResultCount : undefined}
                isTablet={isTablet}
            />

            {viewMode === 'calendar' ? (
                isMobile ? (
                    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in px-4">
                        <DateScroller selectedDate={selectedDate} onDateChange={setSelectedDate} />
                        <Timeline
                            selectedDate={selectedDate}
                            onSlotClick={handleSlotClick}
                            onVisitClick={handleVisitClick}
                            filterSpecialistId={selectedSpecialistId}
                        />
                    </div>
                ) : isTablet ? (
                    <div className="flex-1 overflow-hidden animate-fade-in p-2 flex flex-col">
                        <CalendarGrid
                            selectedDate={selectedDate}
                            onSlotClick={handleSlotClick}
                            onVisitClick={handleVisitClick}
                            daysToShow={5}
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
                /* ═══════════════════════════════════════════
                   SCHEDULE VIEW — Specialist Column Layout
                   ═══════════════════════════════════════════ */
                <div className="flex-1 overflow-hidden animate-fade-in flex flex-col bg-bg-card rounded-[32px] shadow-sm mx-4 mb-4">
                    {/* Specialist columns */}
                    <div
                        className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar"
                        style={{ display: 'flex', gap: 0 }}
                    >
                        {specialistColumns.every(col => col.totalVisits === 0) ? (
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center py-20 px-12 bg-bg-surface rounded-3xl border border-dashed border-border-subtle">
                                    <p className="font-display uppercase text-xl text-text-secondary">
                                        {debouncedQuery ? `No results for "${debouncedQuery}"` : 'No visits found'}
                                    </p>
                                    <p className="font-ui text-sm text-text-muted mt-2">
                                        {debouncedQuery ? 'Try a different search term' : 'Try adjusting dates or filters'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            specialistColumns.map((col) => {
                                const spec = col.specialist;
                                const isSingle = visibleSpecialists.length === 1;
                                const specColor = spec.color || '#999';

                                return (
                                    <motion.div
                                        key={spec.id}
                                        variants={listItem}
                                        initial="hidden"
                                        animate="show"
                                        className={`flex flex-col border-r border-border-subtle last:border-r-0 ${isSingle ? 'flex-1 max-w-2xl mx-auto' : 'flex-1 min-w-[300px]'
                                            }`}
                                    >
                                        {/* Specialist Column Header — Sticky */}
                                        <div
                                            className="sticky top-0 z-20 px-4 py-4 flex items-center gap-3 border-b border-border-subtle bg-bg-card"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center font-display text-base text-white shadow-sm ring-4 ring-bg-card/50"
                                                style={{ backgroundColor: specColor }}
                                            >
                                                {spec.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-base text-text-primary leading-none truncate tracking-tight">
                                                    {spec.name}
                                                </span>
                                                <span className="font-ui text-[10px] text-text-muted uppercase font-bold tracking-widest leading-none mt-1">
                                                    {col.totalVisits} visit{col.totalVisits !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Column Content */}
                                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
                                            {col.totalVisits === 0 ? (
                                                <div className="flex-1 flex items-center justify-center p-6 grayscale opacity-40">
                                                    <p className="font-ui text-sm text-text-muted text-center font-bold italic">No output today</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-6">
                                                    {col.days.map((dayGroup) => (
                                                        <motion.div key={dayGroup.date.toISOString()} variants={listItem}>
                                                            {/* Day subheader */}
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className={`font-black uppercase text-xs leading-none tracking-tighter ${isSameDay(dayGroup.date, new Date())
                                                                    ? 'text-accent-red'
                                                                    : 'text-text-secondary'
                                                                    }`}>
                                                                    {isSameDay(dayGroup.date, new Date())
                                                                        ? 'Today'
                                                                        : format(dayGroup.date, 'EEE')}
                                                                </span>
                                                                <span className="font-ui text-[10px] text-text-muted uppercase font-bold tracking-widest">
                                                                    / {format(dayGroup.date, 'MMM d')}
                                                                </span>
                                                                <div className="flex-1 h-px bg-border-subtle" />
                                                            </div>

                                                            {/* Visit cards for this day */}
                                                            <div className="flex flex-col gap-3">
                                                                {dayGroup.visits.map(visit => (
                                                                    <div
                                                                        key={visit.id}
                                                                        onClick={() => handleVisitClick(visit)}
                                                                        className="p-4 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group relative overflow-hidden flex flex-col"
                                                                        style={{
                                                                            backgroundColor: `color-mix(in srgb, ${specColor} 20%, var(--bg-card))`,
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {/* Visit info */}
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="font-bold text-[11px] leading-none mb-1.5" style={{ color: specColor }}>
                                                                                    {format(new Date(visit.startTime), 'HH:mm')}
                                                                                </div>
                                                                                <h3 className="font-black text-sm text-text-primary leading-tight truncate">
                                                                                    {visit.clientName}
                                                                                </h3>

                                                                                <div className="flex flex-wrap items-center gap-1 mt-2">
                                                                                    {visit.serviceIds?.slice(0, 2).map(id => {
                                                                                        const service = services.find(s => s.id === id);
                                                                                        return service ? (
                                                                                            <span
                                                                                                key={id}
                                                                                                className="font-ui text-[8px] uppercase font-black tracking-widest text-text-secondary/70 bg-bg-card/50 px-1.5 py-0.5 rounded-md border border-text-primary/10 whitespace-nowrap"
                                                                                            >
                                                                                                {service.name}
                                                                                            </span>
                                                                                        ) : null;
                                                                                    })}
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                    {/* Show more button */}
                    {hasMoreResults && (
                        <div className="px-6 py-4 border-t border-border-subtle flex justify-center bg-bg-card rounded-b-[32px]">
                            <button
                                onClick={() => setShowAllResults(true)}
                                className="font-ui font-black uppercase text-[10px] tracking-widest text-text-secondary hover:text-text-primary bg-bg-surface hover:bg-bg-card px-8 py-3 rounded-xl border border-border-subtle hover:border-text-primary/20 transition-all shadow-sm hover:shadow-md"
                            >
                                Show {totalResultCount - SEARCH_RESULT_LIMIT} more results
                            </button>
                        </div>
                    )}
                </div>

            )}
        </div>
    );
}
