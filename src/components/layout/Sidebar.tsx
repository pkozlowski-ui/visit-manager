import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Users, Settings, BarChart3 } from 'lucide-react';

import SpecialistFilter from '../specialists/SpecialistFilter';




// --- Clock Widget ---
export interface ClockWidgetProps {
  size?: 'normal' | 'mini';
}

export function ClockWidget({ size = 'normal' }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const secondsDegrees = (time.getSeconds() / 60) * 360;
  const minutesDegrees = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const hoursDegrees = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  if (size === 'mini') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
        <div className="relative w-4 h-4 rounded-full border border-black/20">
          <div
            className="absolute bottom-1/2 left-1/2 w-[1px] h-[5px] bg-black origin-bottom -translate-x-1/2"
            style={{ transform: `translateX(-50%) rotate(${hoursDegrees}deg)` }}
          />
          <div
            className="absolute bottom-1/2 left-1/2 w-[1px] h-[7px] bg-black origin-bottom -translate-x-1/2"
            style={{ transform: `translateX(-50%) rotate(${minutesDegrees}deg)` }}
          />
        </div>
        <span className="font-display text-[12px] font-bold tabular-nums">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-surface-color rounded-xl p-4 relative aspect-square flex justify-center items-center scale-75 md:scale-90 lg:scale-100">
      <div className="relative w-full h-full max-w-[180px] max-h-[180px]">
        {/* Ticks */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[1px] h-[6px] bg-black left-1/2 top-0 origin-[50%_90px]"
            style={{ transform: `rotate(${i * 30}deg) translateX(-50%)` }}
          />
        ))}

        {/* Center Dot */}
        <div className="absolute w-1.5 h-1.5 bg-accent-red rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />

        {/* Hands */}
        <div
          className="absolute bottom-1/2 left-1/2 w-[3px] h-[45px] bg-black origin-bottom rounded-[4px] -translate-x-1/2"
          style={{ transform: `translateX(-50%) rotate(${hoursDegrees}deg)` }}
        />
        <div
          className="absolute bottom-1/2 left-1/2 w-[1.5px] h-[65px] bg-black origin-bottom rounded-[4px] -translate-x-1/2"
          style={{ transform: `translateX(-50%) rotate(${minutesDegrees}deg)` }}
        />
        <div
          className="absolute bottom-1/2 left-1/2 w-[1.5px] h-[75px] bg-accent-red origin-bottom rounded-[4px] -translate-x-1/2"
          style={{ transform: `translateX(-50%) rotate(${secondsDegrees}deg)` }}
        />
      </div>
    </div>
  );
}

// --- Nav Widget ---
function NavWidget({ isRail = false }: { isRail?: boolean }) {
  const navItems = [
    { label: 'Calendar', path: '/', icon: Calendar },
    { label: 'Stats', path: '/stats', icon: BarChart3 },
    { label: 'Clients', path: '/clients', icon: Users },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className={`flex flex-col gap-2 ${isRail ? 'items-center' : ''}`}>
      {navItems.map((item, index) => (
        <div key={item.path} className="w-full">
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center ${isRail ? 'justify-center' : 'justify-between'} px-4 py-4 rounded-lg cursor-pointer transition-all no-underline text-text-primary hover:bg-card-color/50 ${isActive ? '' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-card-color rounded-lg"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon size={20} className={isActive ? 'text-accent-red' : 'text-text-secondary'} />
                  {!isRail && <span className="font-display uppercase text-[18px] tracking-[1px]">{item.label}</span>}
                </div>
                {!isRail && isActive && (
                  <motion.span
                    layoutId="nav-dot"
                    className="w-1.5 h-1.5 bg-accent-red rounded-full relative z-10"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
          {!isRail && index < navItems.length - 1 && (
            <div className="h-[4px] w-full bg-[radial-gradient(circle,#ccc_1px,transparent_1px)] bg-[length:8px_4px] my-2.5 opacity-50" />
          )}
        </div>
      ))}
    </div>
  );
}



export default function Sidebar({ isRail = false }: { isRail?: boolean }) {
  const location = useLocation();
  const isCalendar = location.pathname === '/';

  return (
    <aside className={`${isRail ? 'w-20' : 'w-[260px]'} shrink-0 flex flex-col gap-4 h-full transition-all duration-300`}>
      {/* Clock - height auto to fit content, usually square */}
      {!isRail && <ClockWidget />}

      {/* Navigation - fixed size content */}
      <NavWidget isRail={isRail} />

      {/* Team Widget - Takes remaining space, only on Calendar */}
      <AnimatePresence mode="wait">
        {isCalendar && (
          <motion.div
            key="team-widget"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 min-h-0"
          >
            <SpecialistFilter isRail={isRail} />
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
