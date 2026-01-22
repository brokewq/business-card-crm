'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md md:max-w-xl',
        lg: 'max-w-lg md:max-w-3xl',
        xl: 'max-w-2xl md:max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative w-full ${sizeClasses[size]} card p-0 animate-fade-in max-h-[90vh] flex flex-col`}>
                {/* Header - only show if title is provided */}
                {title && (
                    <div className="flex items-center justify-between p-4 border-b border-dark-700/50">
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-dark-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-dark-400" />
                        </button>
                    </div>
                )}
                {/* Content */}
                <div className={title ? "p-4 overflow-y-auto flex-1" : "overflow-y-auto flex-1"}>
                    {children}
                </div>
            </div>
        </div>
    );
}
