import { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateScrollerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export default function DateScroller({ selectedDate, onDateChange }: DateScrollerProps) {
    const { i18n } = useTranslation();
    const locale = i18n.language === 'pl' ? pl : enUS;

    // Generate 2 weeks window (1 week past, 1 week future roughly around selected)
    // But for simple "infinite" scroll feel, let's just generate +/- 7 days from "center"
    // For now, simpler: static generation around Selected Date? 
    // Better: Always show today + next 14 days, or +/- 7 days from selected.

    // Let's generate a sliding window of dates around the selected date
    const [dates, setDates] = useState<Date[]>([]);

    useEffect(() => {
        const newDates = [];
        const start = addDays(selectedDate, -3); // start 3 days back
        for (let i = 0; i < 7; i++) {
            newDates.push(addDays(start, i));
        }
        setDates(newDates);
    }, [selectedDate]);

    return (
        <div className="flex items-center justify-between py-2 px-1">
            <button
                onClick={() => onDateChange(addDays(selectedDate, -1))}
                className="p-2 text-text-muted hover:text-primary transition-colors"
                aria-label="Previous Day"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="flex-1 flex justify-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2 py-3 -my-3">
                {dates.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onDateChange(date)}
                            className={`
                            flex flex-col items-center justify-center min-w-[50px] h-[70px] rounded-2xl transition-all duration-300
                            ${isSelected
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                    : 'bg-transparent text-text-muted hover:bg-gray-100'
                                }
                            ${isToday && !isSelected ? 'text-primary' : ''}
                        `}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                                {format(date, 'EE', { locale })}
                            </span>
                            <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-text-main'}`}>
                                {format(date, 'd')}
                            </span>
                            {isToday && (
                                <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-primary'}`}></div>
                            )}
                        </button>
                    )
                })}
            </div>

            <button
                onClick={() => onDateChange(addDays(selectedDate, 1))}
                className="p-2 text-text-muted hover:text-primary transition-colors"
                aria-label="Next Day"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
