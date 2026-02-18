import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [toast, onRemove]);

    const variants = {
        initial: { opacity: 0, y: 50, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    const icons = {
        success: <Check size={18} className="text-emerald-400" />,
        error: <X size={18} className="text-rose-400" />,
        warning: <AlertTriangle size={18} className="text-amber-400" />,
        info: <Info size={18} className="text-sky-400" />
    };

    return (
        <motion.div
            layout
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            className={`
                flex items-center gap-3 px-5 py-3.5 
                bg-gray-900/95 text-white backdrop-blur-md
                rounded-2xl border border-white/10 shadow-xl 
                min-w-[300px] max-w-md pointer-events-auto
            `}
        >
            <div className="shrink-0">
                {icons[toast.type]}
            </div>
            <p className="font-ui text-[14px] font-medium leading-tight grow pr-2">
                {toast.message}
            </p>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-gray-400 hover:text-white transition-colors p-1 -mr-2"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType = 'success', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full px-4">
                <AnimatePresence mode='popLayout'>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
