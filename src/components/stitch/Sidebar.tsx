import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'timeline', icon: Calendar, label: 'Calendar', path: '/' },
        { id: 'clients', icon: Users, label: 'Clients', path: '/clients' },
        { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col z-40">
            {/* Logo area */}
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Calendar size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-text-main uppercase tracking-tighter">Visit</h2>
                        <h3 className="text-[10px] font-bold text-primary tracking-widest leading-none">MANAGER</h3>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path);

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
                                ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                                    : 'text-text-muted hover:bg-gray-50 hover:text-text-main'
                                }`}
                        >
                            <item.icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                            />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Account */}
            <div className="p-4 border-t border-gray-50">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group">
                    <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
