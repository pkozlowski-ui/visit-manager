import { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';


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
        <div className="flex items-center bg-bg-color border-b border-gray-100/50">
            <div className="flex-1 flex px-2 py-4 gap-1 overflow-x-auto no-scrollbar scroll-smooth">
                {dates.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onDateChange(date)}
                            className={`
                            flex items-center justify-center px-4 py-2 rounded-full transition-all duration-200 shrink-0
                            ${isSelected
                                    ? 'bg-accent-red/10 text-accent-red'
                                    : 'bg-transparent text-text-secondary hover:bg-black/5'
                                }
                        `}
                        >
                            <span className="font-display uppercase text-[13px] tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                                <span className="opacity-70 font-medium">
                                    {format(date, 'EEE', { locale })}
                                </span>
                                <span className="font-bold">
                                    {format(date, 'd')}
                                </span>
                            </span>
                            {isToday && !isSelected && (
                                <div className="ml-1.5 w-1.5 h-1.5 rounded-full bg-accent-red/40"></div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
