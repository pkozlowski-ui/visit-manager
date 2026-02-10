import { createContext, useContext, useState, type ReactNode } from 'react';

type ViewMode = 'simple' | 'standard';

interface ViewModeContextType {
    mode: ViewMode;
    toggleMode: () => void;
    setMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
    // Force standard (Pro) mode
    const [mode] = useState<ViewMode>('standard');

    const setMode = (newMode: ViewMode) => {
        // No-op to prevent changes
        console.log("Mode is locked to standard", newMode);
    };

    const toggleMode = () => {
        // No-op
    };

    return (
        <ViewModeContext.Provider value={{ mode, toggleMode, setMode }}>
            {children}
        </ViewModeContext.Provider>
    );
};

export const useViewMode = () => {
    const context = useContext(ViewModeContext);
    if (context === undefined) {
        throw new Error('useViewMode must be used within a ViewModeProvider');
    }
    return context;
};
