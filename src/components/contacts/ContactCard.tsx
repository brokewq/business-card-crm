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
            className={`card card-hover p-4 cursor-pointer flex items-center gap-4 ${isSelected ? 'ring-2 ring-primary-500' : ''
                }`}
        >
            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Name and designation */}
                <h3 className="font-semibold text-white text-lg truncate">{contact.name}</h3>
                {contact.designation && (
                    <p className="text-dark-400 text-sm truncate">{contact.designation}</p>
                )}

                {/* Company */}
                {contact.company && (
                    <div className="flex items-center gap-2 mt-2 text-dark-300">
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
                                className="badge text-white text-xs"
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
                className={`flex-shrink-0 w-5 h-5 rounded border transition-colors flex items-center justify-center ${isSelected
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-dark-600 hover:border-dark-500 bg-dark-800/50'
                    }`}
            >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
        </div>
    );
}
