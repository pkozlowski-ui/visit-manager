import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, Settings } from 'lucide-react';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        setIsDesktop(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    if (isDesktop) return null;

    const navItems = [
        { id: 'timeline', icon: Calendar, label: 'Calendar', path: '/' },
        { id: 'clients', icon: Users, label: 'Clients', path: '/clients' },
        { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none force-hide-lg">
            <div className="pointer-events-auto w-full max-w-[90%] sm:max-w-[360px]">
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-primary/10 rounded-full px-6 py-3 flex justify-between items-center">
                    {navItems.map((item) => {
                        // Flexible matching for sub-routes if needed
                        const isActive = item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                aria-label={item.label}
                                className={`relative flex flex-col items-center justify-center p-2 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-text-muted hover:text-text-main'
                                    }`}
                            >
                                <div className={`
                absolute -inset-2 bg-primary/10 rounded-full opacity-0 scale-50 transition-all duration-300
                ${isActive ? 'opacity-100 scale-100' : ''}
              `}></div>

                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
