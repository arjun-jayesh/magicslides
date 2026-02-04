import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t: Toast) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-in
                            min-w-[200px] flex items-center justify-between pointer-events-auto
                            ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-200' : ''}
                            ${toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' : ''}
                            ${toast.type === 'info' ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' : ''}
                        `}
                    >
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setToasts(prev => prev.filter(t => t.id !== toast.id));
                            }}
                            className="ml-3 text-white/50 hover:text-white transition-colors underline bg-transparent border-none p-0 cursor-pointer pointer-events-auto"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
