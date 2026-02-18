import { useState } from 'react';
import { TrendingUp, XCircle } from 'lucide-react';
import { useStatsData, type StatsPeriod } from '../hooks/useStatsData';
import KpiCard from '../components/stats/KpiCard';
import VisitTrendChart from '../components/stats/VisitTrendChart';
import TeamLoadWidget from '../components/stats/TeamLoadWidget';
import OffDaysWidget from '../components/stats/OffDaysWidget';

export default function StatsPage() {
    const [period, setPeriod] = useState<StatsPeriod>('week');
    const stats = useStatsData(period);

    // Calculate trend vs previous period
    const visitTrend = stats.previousPeriodVisitCount > 0
        ? Math.round(
            ((stats.periodVisitCount - stats.previousPeriodVisitCount) / stats.previousPeriodVisitCount) * 100
        )
        : 0;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="shrink-0 px-4 md:px-6 pt-5 pb-3 flex items-center justify-between bg-bg-surface z-10">
                <h1 className="font-display text-[22px] md:text-[28px] uppercase tracking-[2px] text-text-primary">
                    Stats
                </h1>

                {/* Period Selector */}
                <div className="flex items-center bg-bg-card rounded-full p-1 gap-0.5">
                    {(['week', 'month', 'year'] as StatsPeriod[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-full text-[12px] font-display uppercase tracking-wider transition-all cursor-pointer ${period === p
                                ? 'bg-accent-red text-white'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Year'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 no-scrollbar">
                <div className="flex flex-col gap-4 min-h-full">

                    {/* KPI Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <KpiCard
                            icon={TrendingUp}
                            label={period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
                            value={stats.periodVisitCount}
                            trend={visitTrend}
                            trendLabel={period === 'week' ? 'vs last week' : period === 'month' ? 'vs last month' : 'vs last year'}
                            accentColor="var(--color-accent-blue)"
                            delay={0.05}
                        />
                        <KpiCard
                            icon={XCircle}
                            label="Cancelled"
                            value={`${stats.cancelledCount} (${stats.cancelledPercent}%)`}
                            accentColor={stats.cancelledPercent > 15 ? 'var(--color-status-error)' : 'var(--color-status-warning)'}
                            delay={0.1}
                        />
                    </div>

                    {/* Trend Chart */}
                    <VisitTrendChart data={stats.trendData} maxCount={stats.maxTrendCount} period={stats.period} />

                    {/* Team Load + Off Days */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                        <TeamLoadWidget data={stats.teamLoad} />
                        <OffDaysWidget data={stats.upcomingOffDays} />
                    </div>
                </div>
            </div>
        </div>
    );
}
