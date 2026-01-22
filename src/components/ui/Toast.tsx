'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
    };

    const colors = {
        success: 'text-green-400 bg-green-500/10 border-green-500/20',
        error: 'text-red-400 bg-red-500/10 border-red-500/20',
        info: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
    };

    const Icon = icons[type];

    return (
        <div className={`toast flex items-center gap-3 ${colors[type]} border`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 text-sm">{message}</p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Toast container hook
interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

let toastId = 0;

export function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const ToastContainer = () => (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );

    return { showToast, ToastContainer };
}
