'use client';

import { Contact } from '@/types';
import { Building2, Check } from 'lucide-react';

interface ContactCardProps {
    contact: Contact;
    isSelected: boolean;
    onToggleSelect: () => void;
    onClick: () => void;
}

export function ContactCard({ contact, isSelected, onToggleSelect, onClick }: ContactCardProps) {
    return (
        <div
            onClick={onClick}
            className={`card card-hover p-4 cursor-pointer flex items-center gap-4 ${isSelected ? 'ring-2 ring-accent-500 border-accent-300' : ''
                }`}
        >
            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Name and designation */}
                <h3 className="font-semibold text-navy-800 text-lg truncate">{contact.name}</h3>
                {contact.designation && (
                    <p className="text-gray-500 text-sm truncate">{contact.designation}</p>
                )}

                {/* Company */}
                {contact.company && (
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">{contact.company.name}</span>
                    </div>
                )}

                {/* Tags */}
                {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {contact.tags.map((tag) => (
                            <span
                                key={tag.id}
                                className="badge text-navy-700 text-xs"
                                style={{ backgroundColor: tag.color }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Selection checkbox */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect();
                }}
                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center aspect-square self-center ${isSelected
                    ? 'bg-accent-500 border-accent-500 shadow-sm'
                    : 'border-gray-300 hover:border-accent-400 bg-white'
                    }`}
            >
                {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </button>
        </div>
    );
}
