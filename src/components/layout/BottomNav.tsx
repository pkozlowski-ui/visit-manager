import { NavLink } from 'react-router-dom';
import { Calendar, Users, Settings, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
    const navItems = [
        { label: 'Calendar', path: '/', icon: Calendar },
        { label: 'Stats', path: '/stats', icon: BarChart3 },
        { label: 'Clients', path: '/clients', icon: Users },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 md:hidden px-6">
            <nav className="bg-bg-card/80 backdrop-blur-md border border-border-subtle p-1 rounded-full flex items-center shadow-lg shadow-black/5 w-full max-w-sm">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-all relative no-underline ${isActive ? 'text-text-primary' : 'text-text-secondary'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-pill"
                                        className="absolute inset-0 bg-accent-red/5 rounded-full border border-accent-red/10"
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                    />
                                )}
                                <item.icon size={16} className={`relative z-10 ${isActive ? 'text-accent-red' : 'text-text-secondary/60'}`} />
                                <span className="font-display uppercase text-[12px] tracking-wider relative z-10 font-normal">
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
