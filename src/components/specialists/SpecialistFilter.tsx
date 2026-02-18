import { useSpecialists } from '../../context/SpecialistContext';


interface SpecialistFilterProps {
    isRail?: boolean;
}

export default function SpecialistFilter({ isRail = false }: SpecialistFilterProps) {
    const { selectedSpecialistId, setSelectedSpecialistId, specialists } = useSpecialists();

    return (
        <div className={`flex flex-col gap-3 flex-1 min-h-0 ${isRail ? '' : 'bg-surface-color rounded-xl p-4'}`}>
            {!isRail && <div className="font-ui uppercase text-[10px] tracking-[1px] text-text-secondary mb-1">Filter View</div>}
            <div className={`flex flex-col gap-2 overflow-y-auto overflow-x-hidden ${isRail ? 'items-center' : ''} p-1 custom-scrollbar w-full flex-1`}>
                <div className={`grid ${isRail ? 'grid-cols-1' : 'grid-cols-2'} gap-2 w-full`}>
                    {specialists.map((spec) => (
                        <div
                            key={spec.id}
                            onClick={() => setSelectedSpecialistId(selectedSpecialistId === spec.id ? null : spec.id)}
                            className={`bg-card-color rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center cursor-pointer border-2 ${isRail ? 'p-2' : 'p-3 gap-2'} ${selectedSpecialistId === spec.id ? 'border-text-primary shadow-lg shadow-black/5' : 'border-transparent'
                                }`}
                        >
                            <div
                                className={`${isRail ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center font-display ${isRail ? 'text-xs' : 'text-md'} shadow-inner ring-2 ring-white/20`}
                                style={{ backgroundColor: spec.color, color: 'white' }}
                            >
                                {spec.name.charAt(0)}
                            </div>
                            {!isRail && <span className="font-display text-[12px] uppercase tracking-wider truncate w-full text-center">{spec.name}</span>}
                        </div>
                    ))}

                    {/* "All" Placeholder */}
                    <div
                        onClick={() => setSelectedSpecialistId(null)}
                        className={`rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer border border-dashed border-[#999] ${isRail ? 'p-2 h-12' : 'p-3 gap-2 h-[84px]'} ${selectedSpecialistId === null ? 'bg-card-color/50 border-text-primary' : 'bg-transparent'
                            }`}
                    >
                        <div className={`${isRail ? 'w-8 h-8' : 'w-10 h-10'} flex items-center justify-center`}>
                            <span className={`${isRail ? 'text-[14px]' : 'text-[18px]'} font-display`}>+</span>
                        </div>
                        {!isRail && <span className="font-display text-[12px] uppercase">All</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
