import { format, endOfWeek, startOfWeek } from 'date-fns';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, List, Calendar as CalendarIcon, Filter, X } from 'lucide-react';



import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import SpecialistFilter from '../specialists/SpecialistFilter';

import Button from '../ui/Button';

interface DashboardHeaderProps {

    selectedDate: Date;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    viewMode: 'calendar' | 'schedule';
    onViewModeChange: (mode: 'calendar' | 'schedule') => void;
    onSearch: (query: string) => void;
}

export default function DashboardHeader({ selectedDate, onPrev, onNext, onToday, viewMode, onViewModeChange, onSearch }: DashboardHeaderProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });

    return (
        <header className="px-4 md:px-8 py-4 md:py-6 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 overflow-hidden">
            <div className="flex flex-col gap-0 w-full md:w-auto overflow-hidden">
                <div className="flex items-center justify-between gap-4 w-full">
                    <h1 className="font-display text-[20px] xs:text-[24px] sm:text-[28px] md:text-[42px] leading-[0.9] uppercase font-normal text-text-primary truncate">
                        {viewMode === 'calendar'
                            ? `${format(start, 'MMM d')}—${format(end, 'd')}`
                            : format(selectedDate, 'MMMM d')
                        }
                    </h1>

                    <div className="flex items-center gap-1.5 shrink-0">

                        <Button onClick={onPrev} size="icon" variant="secondary" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-100 bg-white">
                            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                        <Button onClick={onToday} size="sm" variant="secondary" className="h-8 md:h-10 px-3 md:px-4 rounded-full border-2 border-gray-100 bg-white font-display uppercase text-[10px] md:text-[12px] tracking-wider">
                            Today
                        </Button>
                        <Button onClick={onNext} size="icon" variant="secondary" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-100 bg-white">
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
                            className="relative bg-surface-color w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-display text-xl uppercase">Filter View</h2>
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="min-h-[300px] flex">
                                    <SpecialistFilter />
                                </div>
                                <Button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-full h-14 rounded-2xl bg-black text-white font-display uppercase tracking-wider"
                                >
                                    Done
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>




            <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 w-full md:w-auto border-t md:border-t-0 border-black/5 pt-4 md:pt-0">
                {/* View Toggle */}
                <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
                    <Button
                        onClick={() => onViewModeChange('calendar')}
                        size="icon"
                        variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                        className={`rounded-xl ${viewMode === 'calendar' ? 'shadow-md' : 'hover:bg-gray-50'}`}
                    >
                        <CalendarIcon size={20} />
                    </Button>
                    <Button
                        onClick={() => onViewModeChange('schedule')}
                        size="icon"
                        variant={viewMode === 'schedule' ? 'primary' : 'ghost'}
                        className={`rounded-xl ${viewMode === 'schedule' ? 'shadow-md' : 'hover:bg-gray-50'}`}
                    >
                        <List size={20} />
                    </Button>
                </div>

                {/* Mobile Filter Button */}
                <Button
                    onClick={() => setIsFilterOpen(true)}
                    size="icon"
                    variant="secondary"
                    className="w-12 h-12 md:hidden rounded-full border border-gray-100 bg-white shrink-0"
                >
                    <Filter className="w-5 h-5 text-black" />
                </Button>

                <div className="relative group flex-1 md:flex-none">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-text-secondary group-focus-within:text-black transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH..."
                        onChange={(e) => onSearch(e.target.value)}
                        className="h-12 md:h-14 md:pl-12 pl-12 pr-6 bg-white border border-gray-100 rounded-2xl font-display uppercase text-sm w-full md:w-64 md:focus:w-80 transition-all outline-none focus:ring-2 focus:ring-black/5 shadow-sm focus:shadow-md placeholder:text-text-secondary/50"
                    />
                </div>

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



            </div>
        </header>
    );
}
