'use client';

import { useState, useRef, useEffect, ReactNode, KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';

interface ActionButtonWithDropdownProps {
    items: string[];
    icon: ReactNode;
    onAction: (value: string) => void;
    ariaLabel: string;
    tooltip: string;
    disabled?: boolean;
}

export function ActionButtonWithDropdown({
    items,
    icon,
    onAction,
    ariaLabel,
    tooltip,
    disabled = false,
}: ActionButtonWithDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const hasMultiple = items.length > 1;
    const primaryValue = items[0] || '';

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setFocusedIndex(-1);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Focus management for dropdown items
    useEffect(() => {
        if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
            itemRefs.current[focusedIndex]?.focus();
        }
    }, [focusedIndex, isOpen]);

    const handleMainAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled || !primaryValue) return;
        onAction(primaryValue);
    };

    const handleDropdownToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled || !hasMultiple) return;
        setIsOpen(!isOpen);
        if (!isOpen) {
            setFocusedIndex(0);
        }
    };

    const handleItemClick = (value: string) => {
        onAction(value);
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex((prev) => (prev + 1) % items.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < items.length) {
                    handleItemClick(items[focusedIndex]);
                }
                break;
            case 'Tab':
                setIsOpen(false);
                setFocusedIndex(-1);
                break;
        }
    };

    return (
        <div className="relative inline-flex" ref={dropdownRef} onKeyDown={handleKeyDown}>
            {/* Main action button */}
            <button
                ref={buttonRef}
                onClick={handleMainAction}
                disabled={disabled}
                aria-label={ariaLabel}
                title={tooltip}
                className={`p-2 rounded-lg transition-colors ${disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:text-navy-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50'
                    }`}
            >
                {icon}
            </button>

            {/* Dropdown toggle (only if multiple items) */}
            {hasMultiple && !disabled && (
                <button
                    onClick={handleDropdownToggle}
                    aria-label={`More ${tooltip.toLowerCase()} options`}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    className="p-1 -ml-1 text-gray-400 hover:text-navy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/50 rounded"
                >
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            )}

            {/* Dropdown menu */}
            {isOpen && hasMultiple && (
                <div
                    className="absolute top-full mt-1 right-0 z-50 min-w-[200px] max-w-[280px] bg-white rounded-lg shadow-xl border border-gray-100 py-1 overflow-hidden"
                    role="listbox"
                    aria-label={`Select ${tooltip.toLowerCase()}`}
                >
                    {items.map((item, index) => (
                        <button
                            key={index}
                            ref={(el) => { itemRefs.current[index] = el; }}
                            onClick={() => handleItemClick(item)}
                            role="option"
                            aria-selected={index === 0}
                            className={`w-full px-3 py-2 text-left text-sm transition-colors truncate ${index === 0
                                ? 'font-medium text-navy-800 bg-accent-50'
                                : 'text-gray-700 hover:bg-gray-50'
                                } ${focusedIndex === index ? 'ring-2 ring-inset ring-accent-500' : ''}`}
                        >
                            {item}
                            {index === 0 && (
                                <span className="ml-2 text-xs text-accent-600">(Primary)</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
