import { X } from 'lucide-react';
import { useEffect } from 'react';

interface FullScreenImageViewerProps {
    src: string | null;
    alt?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function FullScreenImageViewer({
    src,
    alt = 'Image',
    isOpen,
    onClose
}: FullScreenImageViewerProps) {
    // Prevent scrolling when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            return;
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !src) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-[60]"
                aria-label="Close full screen view"
            >
                <X className="w-6 h-6" />
            </button>
            <div
                className="relative max-w-full max-h-full p-4 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
            </div>
        </div>
    );
}
