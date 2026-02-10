import { format, isSameDay } from 'date-fns';
import { Clock, ChevronRight } from 'lucide-react';
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
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-text-muted/60 uppercase tracking-widest leading-loose">
                    No slots found for selected criteria.<br />Try changing specialist or duration.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted/60 uppercase tracking-widest ml-1">Wolne terminy</label>
            <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                {slots.map((slot, idx) => {
                    const specialist = specialists.find(s => s.id === slot.specialistId);
                    const isSelected = selectedSlot?.specialistId === slot.specialistId &&
                        selectedSlot?.startTime === slot.startTime &&
                        isSameDay(selectedSlot?.date, slot.date);

                    return (
                        <button
                            key={`${slot.specialistId}-${slot.date.getTime()}-${slot.startTime}-${idx}`}
                            type="button"
                            onClick={() => onSelect(slot)}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${isSelected ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-white border-gray-100 hover:border-primary/30 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${isSelected ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
                                    {specialist?.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-text-main'}`}>
                                        {format(slot.date, 'EEEE, d MMMM')}
                                    </div>
                                    <div className={`text-[10px] font-bold flex items-center gap-1.5 ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                                        <Clock size={10} />
                                        {slot.startTime} – {slot.endTime}
                                        <span className="mx-1 opacity-30">|</span>
                                        {specialist?.name}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={16} className={isSelected ? 'text-white' : 'text-text-muted/40'} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
