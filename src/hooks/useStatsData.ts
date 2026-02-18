import { useMemo } from 'react';
import {
    startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
    startOfYear, endOfYear, subWeeks, subMonths, subYears, eachDayOfInterval,
    format, isAfter, isBefore, differenceInMinutes, addDays, parse
} from 'date-fns';
import { useVisits } from '../context/VisitContext';
import { useSpecialists } from '../context/SpecialistContext';
import { useAvailability } from '../context/AvailabilityContext';
import type { Visit, Specialist } from '../types';

export type StatsPeriod = 'week' | 'month' | 'year';

export interface TrendEntry {
    date: Date;
    label: string;       // e.g. "Mon", "Jan", or "1" (day number)
    count: number;
    isCurrent: boolean;   // isToday or isCurrentMonth
}

export interface TeamLoadEntry {
    specialist: Specialist;
    visitCount: number;
    totalMinutes: number;
    availableMinutes: number;
    loadPercent: number;  // 0-100
}

export interface UpcomingOffDay {
    specialist: Specialist;
    date: Date;
    formattedDate: string;
    dayOfWeek: string;
}

export interface NextUpVisit {
    visit: Visit;
    specialistName: string;
    specialistColor: string;
    timeLabel: string;    // e.g. "14:00"
}

export interface StatsData {
    // KPI
    todayVisitCount: number;
    periodVisitCount: number;
    previousPeriodVisitCount: number;
    cancelledCount: number;
    cancelledPercent: number;
    completedCount: number;
    period: StatsPeriod;

    // Trend
    trendData: TrendEntry[];
    maxTrendCount: number;
    teamLoad: TeamLoadEntry[];
    upcomingOffDays: UpcomingOffDay[];
    nextUpToday: NextUpVisit[];
}

export function useStatsData(period: StatsPeriod = 'week'): StatsData {
    const { visits } = useVisits();
    const { specialists } = useSpecialists();
    const { getSalonHours } = useAvailability();

    return useMemo(() => {
        const now = new Date();
        const today = startOfDay(now);
        const todayEnd = endOfDay(now);

        // --- Period range ---
        let periodStart, periodEnd;
        if (period === 'week') {
            periodStart = startOfWeek(now, { weekStartsOn: 1 });
            periodEnd = endOfWeek(now, { weekStartsOn: 1 });
        } else if (period === 'month') {
            periodStart = startOfMonth(now);
            periodEnd = endOfMonth(now);
        } else {
            periodStart = startOfYear(now);
            periodEnd = endOfYear(now);
        }

        // --- Previous period (for comparison) ---
        let prevPeriodStart, prevPeriodEnd;
        if (period === 'week') {
            prevPeriodStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
            prevPeriodEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        } else if (period === 'month') {
            prevPeriodStart = startOfMonth(subMonths(now, 1));
            prevPeriodEnd = endOfMonth(subMonths(now, 1));
        } else {
            prevPeriodStart = startOfYear(subYears(now, 1));
            prevPeriodEnd = endOfYear(subYears(now, 1));
        }

        // --- Filter visits ---
        const todayVisits = visits.filter(v => {
            const s = new Date(v.startTime);
            return s >= today && s <= todayEnd;
        });

        const periodVisits = visits.filter(v => {
            const s = new Date(v.startTime);
            return s >= periodStart && s <= periodEnd;
        });

        const previousPeriodVisits = visits.filter(v => {
            const s = new Date(v.startTime);
            return s >= prevPeriodStart && s <= prevPeriodEnd;
        });

        // --- KPI ---
        const cancelledInPeriod = periodVisits.filter(v => v.status === 'cancelled');
        const completedInPeriod = periodVisits.filter(v => v.status === 'completed');

        const cancelledPercent = periodVisits.length > 0
            ? Math.round((cancelledInPeriod.length / periodVisits.length) * 100)
            : 0;

        // --- Trend Data ---
        let trendData: TrendEntry[] = [];

        if (period === 'week') {
            const trendInterval = eachDayOfInterval({ start: periodStart, end: periodEnd });
            trendData = trendInterval.map(day => {
                const dayStart = startOfDay(day);
                const dayEnd = endOfDay(day);
                const count = visits.filter(v => {
                    const s = new Date(v.startTime);
                    return s >= dayStart && s <= dayEnd && v.status !== 'cancelled';
                }).length;

                return {
                    date: day,
                    label: format(day, 'EEE'),
                    count,
                    isCurrent: format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
                };
            });
        } else if (period === 'month') {
            const trendInterval = eachDayOfInterval({ start: periodStart, end: periodEnd });
            trendData = trendInterval.map(day => {
                const dayStart = startOfDay(day);
                const dayEnd = endOfDay(day);
                const count = visits.filter(v => {
                    const s = new Date(v.startTime);
                    return s >= dayStart && s <= dayEnd && v.status !== 'cancelled';
                }).length;

                return {
                    date: day,
                    label: format(day, 'd'),
                    count,
                    isCurrent: format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
                };
            });
        } else if (period === 'year') {
            // Group by month
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(now.getFullYear(), i, 1);
                const monthStart = startOfMonth(monthDate);
                const monthEnd = endOfMonth(monthDate);

                const count = visits.filter(v => {
                    const s = new Date(v.startTime);
                    return s >= monthStart && s <= monthEnd && v.status !== 'cancelled';
                }).length;

                trendData.push({
                    date: monthDate,
                    label: format(monthDate, 'MMM'),
                    count,
                    isCurrent: monthDate.getMonth() === now.getMonth(),
                });
            }
        }

        const maxTrendCount = Math.max(...trendData.map(d => d.count), 1);

        // --- Team load (based on current period) ---
        const teamLoad: TeamLoadEntry[] = specialists.map(spec => {
            const specVisits = periodVisits.filter(
                v => v.specialistId === spec.id && v.status !== 'cancelled'
            );
            const totalMinutes = specVisits.reduce((sum, v) => {
                return sum + differenceInMinutes(new Date(v.endTime), new Date(v.startTime));
            }, 0);

            // Calculate available minutes in period
            const days = eachDayOfInterval({ start: periodStart, end: periodEnd > today ? today : periodEnd });
            let availableMinutes = 0;
            for (const day of days) {
                const dateStr = format(day, 'yyyy-MM-dd');
                if (spec.offDays?.includes(dateStr)) continue;

                const schedule = getSalonHours(day);
                if (!schedule?.isOpen) continue;

                for (const range of schedule.hours) {
                    const open = parse(range.openTime, 'HH:mm', day);
                    const close = parse(range.closeTime, 'HH:mm', day);
                    availableMinutes += differenceInMinutes(close, open);
                }
            }

            const loadPercent = availableMinutes > 0
                ? Math.min(Math.round((totalMinutes / availableMinutes) * 100), 100)
                : 0;

            return {
                specialist: spec,
                visitCount: specVisits.length,
                totalMinutes,
                availableMinutes,
                loadPercent,
            };
        });

        // --- Upcoming off days (next 14 days) ---
        const upcomingOffDays: UpcomingOffDay[] = [];
        const lookAhead = addDays(today, 14);

        for (const spec of specialists) {
            if (!spec.offDays) continue;
            for (const dateStr of spec.offDays) {
                const offDate = parse(dateStr, 'yyyy-MM-dd', new Date());
                if (isAfter(offDate, today) && isBefore(offDate, lookAhead)) {
                    upcomingOffDays.push({
                        specialist: spec,
                        date: offDate,
                        formattedDate: format(offDate, 'd MMM'),
                        dayOfWeek: format(offDate, 'EEEE'),
                    });
                }
            }
        }
        upcomingOffDays.sort((a, b) => a.date.getTime() - b.date.getTime());

        // --- Next up today ---
        const upcomingToday = todayVisits
            .filter(v => {
                const start = new Date(v.startTime);
                return isAfter(start, now) && v.status !== 'cancelled';
            })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 4);

        const nextUpToday: NextUpVisit[] = upcomingToday.map(visit => {
            const spec = specialists.find(s => s.id === visit.specialistId);
            return {
                visit,
                specialistName: spec?.name ?? '—',
                specialistColor: spec?.color ?? '#94a3b8',
                timeLabel: format(new Date(visit.startTime), 'HH:mm'),
            };
        });

        return {
            todayVisitCount: todayVisits.filter(v => v.status !== 'cancelled').length,
            periodVisitCount: periodVisits.filter(v => v.status !== 'cancelled').length,
            previousPeriodVisitCount: previousPeriodVisits.filter(v => v.status !== 'cancelled').length,
            cancelledCount: cancelledInPeriod.length,
            cancelledPercent,
            completedCount: completedInPeriod.length,
            period,
            trendData,
            maxTrendCount,
            teamLoad,
            upcomingOffDays,
            nextUpToday: nextUpToday,
        };
    }, [visits, specialists, period, getSalonHours]);
}
