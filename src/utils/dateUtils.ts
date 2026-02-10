import { addMinutes, format, startOfDay, setHours } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import i18n from '../i18n';

// Configuration
export const START_HOUR = 8;
export const END_HOUR = 20;
export const SLOT_DURATION = 30; // minutes

export const getLocale = () => (i18n.language === 'pl' ? pl : enUS);

// Generate time slots for the day
export const generateTimeSlots = () => {
    const slots: Date[] = [];
    const baseDate = startOfDay(new Date());
    let currentTime = setHours(baseDate, START_HOUR);
    const endTime = setHours(baseDate, END_HOUR);

    while (currentTime < endTime) {
        slots.push(currentTime);
        currentTime = addMinutes(currentTime, SLOT_DURATION);
    }

    return slots;
};

// Format time (e.g., 10:00)
export const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: getLocale() });
};

// Format date (e.g., Poniedziałek, 12 Maja)
export const formatDateFull = (date: Date) => {
    return format(date, 'EEEE, d MMMM', { locale: getLocale() });
};
// Round date to nearest 15 minutes
export const roundToNearest15 = (date: Date): Date => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    const roundedDate = new Date(date);
    roundedDate.setMinutes(roundedMinutes);
    roundedDate.setSeconds(0);
    roundedDate.setMilliseconds(0);
    return roundedDate;
};
