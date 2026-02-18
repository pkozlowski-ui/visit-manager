import { format, endOfWeek, startOfWeek } from 'date-fns';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, List, Calendar as CalendarIcon, Filter, X } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import SpecialistFilter from '../specialists/SpecialistFilter';

import Button from '../ui/Button';

interface DashboardHeaderProps {
    selectedDate: Date;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    viewMode: 'calendar' | 'schedule';
    onViewModeChange: (mode: 'calendar' | 'schedule') => void;
    searchValue: string;
    onSearchChange: (query: string) => void;
    searchResultCount?: number;
    isTablet?: boolean;
}

function SearchInput({ value, onChange, resultCount, inputRef }: {
    value: string;
    onChange: (v: string) => void;
    resultCount?: number;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
    return (
        <div className="relative group flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-text-secondary group-focus-within:text-text-primary transition-colors" />
            </div>
            <input
                ref={inputRef}
                type="text"
                placeholder="SEARCH..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-12 md:h-14 pl-12 pr-16 bg-bg-card border border-border-subtle rounded-2xl font-display uppercase text-sm w-full md:w-64 md:focus:w-80 transition-all outline-none focus:ring-2 focus:ring-text-primary/5 shadow-sm focus:shadow-md placeholder:text-text-secondary/50"
            />
            {/* Clear + result count */}
            <div className="absolute inset-y-0 right-3 flex items-center gap-1.5">
                {value && resultCount !== undefined && (
                    <span className="font-ui text-[10px] text-text-secondary/60 uppercase tracking-wider tabular-nums">
                        {resultCount}
                    </span>
                )}
                {value && (
                    <button
                        onClick={() => onChange('')}
                        className="w-7 h-7 rounded-full bg-bg-surface hover:bg-bg-surface-hover flex items-center justify-center transition-colors"
                    >
                        <X size={14} className="text-text-secondary" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default function DashboardHeader({ selectedDate, onPrev, onNext, onToday, viewMode, onViewModeChange, searchValue, onSearchChange, searchResultCount, isTablet = false }: DashboardHeaderProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });

    // Cmd+K / Ctrl+K keyboard shortcut
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            searchInputRef.current?.focus();
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <>
            <header className="px-4 md:px-6 lg:px-8 py-4 lg:py-6 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 overflow-hidden">
                <div className="flex flex-col gap-0 w-full md:w-auto overflow-hidden">
                    <div className="flex items-center justify-between gap-4 w-full">
                        <h1 className="font-display text-[20px] xs:text-[24px] sm:text-[28px] md:text-[32px] lg:text-[42px] leading-[0.9] uppercase font-normal text-text-primary truncate">
                            {viewMode === 'calendar'
                                ? `${format(start, 'MMMM d')}—${format(end, 'd')}`
                                : format(selectedDate, 'MMMM d')
                            }
                        </h1>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <Button onClick={onPrev} size="icon" variant="secondary" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-border-subtle bg-bg-card">
                                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
                            <Button onClick={onToday} size="sm" variant="secondary" className="h-8 md:h-10 px-3 md:px-4 rounded-full border-2 border-border-subtle bg-bg-card font-display uppercase text-[10px] md:text-[12px] tracking-wider">
                                Today
                            </Button>
                            <Button onClick={onNext} size="icon" variant="secondary" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-border-subtle bg-bg-card">
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isFilterOpen && (
                        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsFilterOpen(false)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                className="relative bg-bg-surface w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl"
                            >
                                <div className="p-6 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-display text-xl uppercase">Filter View</h2>
                                        <button
                                            onClick={() => setIsFilterOpen(false)}
                                            className="w-10 h-10 rounded-full bg-bg-card flex items-center justify-center border border-border-subtle"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="min-h-[300px] flex">
                                        <SpecialistFilter />
                                    </div>
                                    <Button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="w-full h-14 rounded-2xl bg-text-primary text-bg-card font-display uppercase tracking-wider"
                                    >
                                        Done
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className={`flex items-center justify-between md:justify-end gap-3 md:gap-4 w-full md:w-auto border-t md:border-t-0 border-black/5 pt-4 md:pt-0 ${isTablet ? '!justify-start' : ''}`}>
                    {/* View Toggle */}
                    <div className="flex bg-bg-card rounded-2xl p-1.5 shadow-sm border border-border-subtle">
                        <Button
                            onClick={() => onViewModeChange('calendar')}
                            size="icon"
                            variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                            className={`rounded-xl ${viewMode === 'calendar' ? 'shadow-md' : 'hover:bg-bg-surface'}`}
                        >
                            <CalendarIcon size={20} />
                        </Button>
                        <Button
                            onClick={() => onViewModeChange('schedule')}
                            size="icon"
                            variant={viewMode === 'schedule' ? 'primary' : 'ghost'}
                            className={`rounded-xl ${viewMode === 'schedule' ? 'shadow-md' : 'hover:bg-bg-surface'}`}
                        >
                            <List size={20} />
                        </Button>
                    </div>

                    {/* Mobile Filter Button */}
                    <Button
                        onClick={() => setIsFilterOpen(true)}
                        size="icon"
                        variant="secondary"
                        className="w-12 h-12 md:hidden rounded-full border border-border-subtle bg-bg-card shrink-0"
                    >
                        <Filter className="w-5 h-5 text-text-primary" />
                    </Button>

                    {/* Search — hide on tablet (moves to bottom bar) */}
                    {!isTablet && (
                        <SearchInput
                            value={searchValue}
                            onChange={onSearchChange}
                            resultCount={searchResultCount}
                            inputRef={searchInputRef}
                        />
                    )}

                    {/* FAB — hide on tablet (moves to bottom bar) */}
                    {!isTablet && (
                        <NavLink to="/visit/new">
                            <button className="bg-accent-red text-white w-12 h-12 md:w-16 md:h-16 rounded-full border-none flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-accent-red/20 opacity-100">
                                <div className="grid grid-cols-3 grid-rows-3 gap-[2.5px] md:gap-[3px]">
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full col-start-2 row-start-1" />
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full col-start-2 row-start-2" />
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full col-start-2 row-start-3" />
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full col-start-1 row-start-2" />
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full col-start-3 row-start-2" />
                                </div>
                            </button>
                        </NavLink>
                    )}
                </div>
            </header>

            {/* Tablet Bottom Bar — Search + FAB sticky at bottom */}
            {isTablet && (
                <div
                    className="fixed bottom-3 left-[calc(16px+80px+16px+8px)] right-[24px] z-50 flex items-center gap-4 px-5 py-3 bg-bg-surface/90 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-lg"
                    style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
                >
                    <SearchInput
                        value={searchValue}
                        onChange={onSearchChange}
                        resultCount={searchResultCount}
                    />
                    <NavLink to="/visit/new">
                        <button className="bg-accent-red text-white w-12 h-12 rounded-full border-none flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-accent-red/25">
                            <div className="grid grid-cols-3 grid-rows-3 gap-[2.5px]">
                                <div className="w-1.5 h-1.5 bg-white rounded-full col-start-2 row-start-1" />
                                <div className="w-1.5 h-1.5 bg-white rounded-full col-start-2 row-start-2" />
                                <div className="w-1.5 h-1.5 bg-white rounded-full col-start-2 row-start-3" />
                                <div className="w-1.5 h-1.5 bg-white rounded-full col-start-1 row-start-2" />
                                <div className="w-1.5 h-1.5 bg-white rounded-full col-start-3 row-start-2" />
                            </div>
                        </button>
                    </NavLink>
                </div>
            )}
        </>
    );
}
