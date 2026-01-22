'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardShortcuts() {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input/textarea is focused
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                (document.activeElement as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            // Command/Ctrl + K: Focus Search (Navigate to Contacts and focus search - tricky implementation, simplified to nav for now)
            // Or if we implementing global command palette later. 
            // For now, let's just do Navigation shortcuts.

            // Cmd+K -> Contacts Search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="text"]');
                if (searchInput) {
                    (searchInput as HTMLElement).focus();
                } else {
                    router.push('/contacts');
                    // We might need a small timeout to focus after nav, but simple is ok for now
                }
            }

            // Cmd+B -> New Scan
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                router.push('/scan');
            }

            // Navigate tabs
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '1') router.push('/contacts');
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '2') router.push('/companies');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    return null;
}
