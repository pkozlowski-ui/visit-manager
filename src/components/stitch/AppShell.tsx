import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
    children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen w-full bg-[#f2f4f6] flex items-center justify-center overflow-hidden relative selection:bg-primary/20">

            {/* Desktop Wallpaper / Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none hidden lg:block">
                {/* Abstract Gradient Blob 1 */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-primary/30 to-purple-400/30 rounded-full blur-[120px] opacity-60 animate-blob"></div>
                {/* Abstract Gradient Blob 2 */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-secondary/30 to-blue-400/30 rounded-full blur-[120px] opacity-60 animate-blob animation-delay-2000"></div>
                {/* Abstract Gradient Blob 3 */}
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-gradient-to-r from-pink-300/20 to-orange-200/20 rounded-full blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main Outer Container */}
            <div className="w-full h-screen lg:h-[90vh] lg:max-h-[900px] lg:w-[1200px] lg:rounded-[40px] bg-surface lg:shadow-2xl lg:shadow-primary/20 relative z-10 flex overflow-hidden lg:border-[8px] lg:border-white ring-1 ring-black/5 transform-gpu mx-auto">

                {/* Desktop Sidebar */}
                <div className="hidden lg:flex flex-col flex-shrink-0 w-64 h-full border-r border-gray-100 bg-white">
                    <Sidebar />
                </div>

                {/* Content Area */}
                <div className="flex-1 relative bg-surface flex flex-col overflow-hidden min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
