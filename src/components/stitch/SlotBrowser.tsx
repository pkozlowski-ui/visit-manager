import { format, parse } from 'date-fns';
import type { AvailableSlot } from '../../context/AvailabilityContext';
import { useSpecialists } from '../../context/SpecialistContext';

interface SlotBrowserProps {
    slots: AvailableSlot[];
    selectedSlot: AvailableSlot | null;
    onSelect: (slot: AvailableSlot) => void;
}

export default function SlotBrowser({ slots, selectedSlot, onSelect }: SlotBrowserProps) {
    const { specialists } = useSpecialists();

    if (slots.length === 0) {
        return (
            <div className="p-6 text-center bg-bg-surface rounded-2xl border border-dashed border-border-subtle">
                <p className="font-ui text-xs uppercase tracking-wider text-text-secondary">
                    No slots found.<br />Try adjusting your criteria.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
            <h4 className="font-display uppercase text-xl text-text-secondary shrink-0">Available Slots</h4>
            <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {slots.map((slot, idx) => {
                    const specialist = specialists.find(s => s.id === slot.specialistId);
                    const isSelected = selectedSlot?.specialistId === slot.specialistId &&
                        selectedSlot?.startTime === slot.startTime &&
                        selectedSlot?.date.getTime() === slot.date.getTime();

                    // Calculate duration
                    const start = parse(slot.startTime, 'HH:mm', slot.date);
                    const end = parse(slot.endTime, 'HH:mm', slot.date);
                    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

                    return (
                        <button
                            key={`${slot.specialistId}-${slot.date.getTime()}-${slot.startTime}-${idx}`}
                            type="button"
                            onClick={() => onSelect(slot)}
                            className={`p-4 rounded-xl flex flex-col items-start gap-2 transition-all border-2 text-left ${isSelected
                                ? 'bg-accent-red text-white border-accent-red shadow-lg shadow-accent-red/20'
                                : 'bg-surface-color border-transparent hover:border-black/10 hover:bg-white'
                                }`}
                        >
                            <div className="flex w-full justify-between items-start">
                                <div className="flex flex-col">
                                    <span className={`font-display text-lg leading-none ${isSelected ? 'text-white' : 'text-text-primary'}`}>
                                        {slot.startTime}
                                    </span>
                                    <span className={`font-ui text-[10px] font-bold uppercase tracking-wider mt-1 ${isSelected ? 'text-white/60' : 'text-text-secondary/60'}`}>
                                        {duration >= 60 ? `${duration / 60}h` : `${duration}m`}
                                    </span>
                                </div>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full mt-1" />}
                            </div>

                            <div className="flex flex-col gap-0.5 mt-auto">
                                <span className={`font-ui text-[10px] uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>
                                    {format(slot.date, 'EEE, d MMM')}
                                </span>
                                <span className={`font-ui text-[10px] uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>
                                    {specialist?.name.split(' ')[0]}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
