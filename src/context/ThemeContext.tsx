import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'device';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    effectiveTheme: EffectiveTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme-preference';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize theme from localStorage or default to 'device'
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return (stored as Theme) || 'device';
    });

    const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');

    // Get system preference
    const getSystemTheme = (): EffectiveTheme => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Update effective theme based on current theme setting
    useEffect(() => {
        if (theme === 'device') {
            setEffectiveTheme(getSystemTheme());
        } else {
            setEffectiveTheme(theme);
        }
    }, [theme]);

    // Listen to system preference changes when in device mode
    useEffect(() => {
        if (theme !== 'device') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setEffectiveTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Apply theme to HTML element
    useEffect(() => {
        const root = document.documentElement;
        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [effectiveTheme]);

    // Persist theme preference
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
