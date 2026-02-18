import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useWindowSize } from '../../hooks/useWindowSize';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { width } = useWindowSize();
    const isTablet = width >= 768 && width < 1024;
    const isMobile = width < 768;


    return (
        <div className="flex flex-col md:flex-row w-full h-full md:gap-4 overflow-hidden bg-bg-canvas p-0 md:p-4">
            {/* Sidebar for Tablet/Desktop (>= 768px) */}
            <div className="hidden md:block shrink-0">
                <Sidebar isRail={isTablet} />
            </div>

            {/* Main Content */}
            <main className="flex-1 bg-surface-color rounded-none md:rounded-xl flex flex-col overflow-hidden relative mb-[70px] md:mb-0">
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {children}
                </div>
            </main>

            {/* Bottom Nav for Mobile (< 768px) */}
            {isMobile && (
                <div className="md:hidden">
                    <BottomNav />
                </div>
            )}
        </div>
    );
}
