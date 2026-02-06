'use client';

import { Contact } from '@/types';
import { Building2, Mail, Phone, MapPin, Globe, Tag, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ActionButtonWithDropdown } from './ActionButtonWithDropdown';
import { WhatsAppIcon, GmailIcon } from '../icons/BrandIcons';

// Utility functions for sanitizing phone numbers and emails
function sanitizePhoneForWhatsApp(phone: string): string {
    // Remove all non-digit characters, keeping only numbers
    return phone.replace(/\D/g, '');
}

function openWhatsAppChat(phone: string): void {
    const sanitizedPhone = sanitizePhoneForWhatsApp(phone);
    const url = `https://wa.me/${sanitizedPhone}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

function openEmailClient(email: string): void {
    const encodedEmail = encodeURIComponent(email);
    window.location.href = `mailto:${encodedEmail}`;
}

export type SortField = 'name' | 'company' | 'created_at' | 'email' | 'phone' | 'source' | 'tags';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

export interface FilterConfig {
    name?: string;
    company?: string;
    source?: string[];
    tags?: string[];
}

interface ContactsTableProps {
    contacts: Contact[];
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onSelectAll: () => void;
    onRefresh: () => void;
    onContactClick?: (contact: Contact) => void;
    sortConfig?: SortConfig;
    onSort?: (field: SortField) => void;
    filterConfig?: FilterConfig;
    onFilterChange?: (config: FilterConfig) => void;
    availableTags?: { id: string; name: string; color: string }[];
}

import { Filter, X, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Helper Components defined outside to prevent re-renders
const SortIcon = ({ field, sortConfig }: { field: SortField; sortConfig?: SortConfig }) => {
    if (!sortConfig || sortConfig.field !== field) {
        return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-accent-500" /> : <ArrowDown className="w-3 h-3 text-accent-500" />;
};

const FilterPopover = ({
    type,
    value,
    onChange,
    onClose,
    options = []
}: {
    type: 'text' | 'select' | 'multi-select';
    value: any;
    onChange: (val: any) => void;
    onClose: () => void;
    options?: string[] | { id: string; name: string; color?: string }[];
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (type === 'text' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [type]);

    return (
        <div
            className="absolute top-full mt-2 left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-100 p-3 z-50 cursor-default"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Filter</span>
                {value && (
                    <button
                        onClick={() => { onChange(undefined); onClose(); }}
                        className="text-xs text-red-500 hover:text-red-600"
                    >
                        Clear
                    </button>
                )}
            </div>

            {type === 'text' && (
                <input
                    ref={inputRef}
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value || undefined)}
                    placeholder="Contains..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                />
            )}

            {(type === 'select' || type === 'multi-select') && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                    {options.map((opt: any) => {
                        const optValue = typeof opt === 'string' ? opt : opt.id;
                        const optLabel = typeof opt === 'string' ? opt : opt.name;
                        const isSelected = Array.isArray(value) ? value.includes(optValue) : value === optValue;

                        return (
                            <label key={optValue} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-accent-500 border-accent-500' : 'border-gray-300 bg-white'}`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={() => {
                                        if (type === 'multi-select') {
                                            const current = Array.isArray(value) ? value : [];
                                            const create = current.includes(optValue)
                                                ? current.filter((v: any) => v !== optValue)
                                                : [...current, optValue];
                                            onChange(create.length > 0 ? create : undefined);
                                        } else {
                                            onChange(isSelected ? undefined : optValue);
                                        }
                                    }}
                                />
                                <span className="text-sm text-gray-700">{optLabel}</span>
                            </label>
                        );
                    })}
                    {options.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-2">No options available</p>
                    )}
                </div>
            )}
        </div>
    );
};

const HeaderCell = ({
    field,
    label,
    filterType,
    filterOptions,
    sortConfig,
    onSort,
    filterConfig,
    onFilterChange,
    className = ''
}: {
    field: SortField;
    label: string;
    filterType?: 'text' | 'select' | 'multi-select';
    filterOptions?: any[];
    sortConfig?: SortConfig;
    onSort?: (field: SortField) => void;
    filterConfig?: FilterConfig;
    onFilterChange?: (config: FilterConfig) => void;
    className?: string;
}) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterValue = filterConfig?.[field as keyof FilterConfig];
    const isActive = filterValue !== undefined && (Array.isArray(filterValue) ? filterValue.length > 0 : true);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isFilterOpen) return;
        const handleClick = () => setIsFilterOpen(false);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [isFilterOpen]);

    return (
        <th className={`table-cell text-left text-xs font-semibold text-gray-600 uppercase tracking-wider select-none ${className}`}>
            <div className="flex items-center gap-2">
                <div
                    className="flex items-center gap-2 cursor-pointer group hover:text-navy-700 transition-colors"
                    onClick={() => onSort?.(field)}
                >
                    {label}
                    <SortIcon field={field} sortConfig={sortConfig} />
                </div>

                {filterType && (
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFilterOpen(!isFilterOpen);
                            }}
                            className={`p-1 rounded hover:bg-gray-100 transition-colors ${isActive ? 'text-accent-500' : 'text-gray-300 hover:text-gray-500'}`}
                        >
                            <Filter className="w-3 h-3" />
                        </button>

                        {isFilterOpen && (
                            <FilterPopover
                                type={filterType}
                                value={filterValue}
                                onChange={(val) => onFilterChange?.({ ...filterConfig, [field]: val })}
                                onClose={() => setIsFilterOpen(false)}
                                options={filterOptions}
                            />
                        )}
                    </div>
                )}
            </div>
        </th>
    );
};

export function ContactsTable({
    contacts,
    selectedIds,
    onToggleSelect,
    onSelectAll,
    onContactClick,
    sortConfig,
    onSort,
    filterConfig = {},
    onFilterChange,
    availableTags = [],
}: ContactsTableProps) {
    const allSelected = contacts.length > 0 && selectedIds.size === contacts.length;

    // Get unique sources from contacts for the dropdown
    const availableSources = Array.from(new Set(contacts.map(c => c.source).filter(Boolean))) as string[];

    return (
        <div className="card overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="table-header">
                        <tr>
                            <th className="table-cell w-12">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={onSelectAll}
                                    className="w-4 h-4 rounded border-gray-300 bg-white text-accent-500 focus:ring-accent-500"
                                />
                            </th>
                            <HeaderCell
                                field="name"
                                label="Name"
                                filterType="text"
                                sortConfig={sortConfig}
                                onSort={onSort}
                                filterConfig={filterConfig}
                                onFilterChange={onFilterChange}
                            />
                            <HeaderCell
                                field="company"
                                label="Company"
                                filterType="text"
                                sortConfig={sortConfig}
                                onSort={onSort}
                                filterConfig={filterConfig}
                                onFilterChange={onFilterChange}
                            />
                            <HeaderCell
                                field="email"
                                label="Email"
                                sortConfig={sortConfig}
                                onSort={onSort}
                            />
                            <HeaderCell
                                field="phone"
                                label="Phone"
                                sortConfig={sortConfig}
                                onSort={onSort}
                            />
                            <th className="table-cell text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                                WhatsApp
                            </th>
                            <th className="table-cell text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                                Email
                            </th>
                            <HeaderCell
                                field="source"
                                label="Source"
                                sortConfig={sortConfig}
                                onSort={onSort}
                            />
                            <HeaderCell
                                field="tags"
                                label="Tags"
                                sortConfig={sortConfig}
                                onSort={onSort}
                            />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-clay-border">
                        {contacts.map((contact) => (
                            <tr
                                key={contact.id}
                                onClick={() => onContactClick?.(contact)}
                                className={`table-row cursor-pointer ${selectedIds.has(contact.id) ? 'bg-accent-50' : ''
                                    }`}
                            >
                                <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(contact.id)}
                                        onChange={() => onToggleSelect(contact.id)}
                                        className="w-4 h-4 rounded border-gray-300 bg-white text-accent-500 focus:ring-accent-500"
                                    />
                                </td>
                                <td className="table-cell">
                                    <div>
                                        <p className="font-medium text-navy-800">{contact.name}</p>
                                        {contact.designation && (
                                            <p className="text-sm text-gray-500">{contact.designation}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="table-cell">
                                    <div className="flex items-center gap-2">
                                        {contact.company && (
                                            <span className="text-gray-700">{contact.company.name}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="table-cell">
                                    {contact.email && contact.email.length > 0 && (
                                        <div className="flex flex-col">
                                            <a
                                                href={`mailto:${contact.email[0]}`}
                                                className="text-accent-600 hover:text-accent-700 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {contact.email[0]}
                                            </a>
                                            {contact.email.length > 1 && (
                                                <span className="text-xs text-gray-400">+{contact.email.length - 1} more</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="table-cell">
                                    {contact.phone && contact.phone.length > 0 && (
                                        <div className="flex flex-col">
                                            <a
                                                href={`tel:${contact.phone[0]}`}
                                                className="text-gray-700 hover:text-navy-700 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {contact.phone[0]}
                                            </a>
                                            {contact.phone.length > 1 && (
                                                <span className="text-xs text-gray-400">+{contact.phone.length - 1} more</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                {/* WhatsApp Action Column */}
                                <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                                    <ActionButtonWithDropdown
                                        items={contact.phone || []}
                                        icon={<WhatsAppIcon className="w-4 h-4" />}
                                        onAction={openWhatsAppChat}
                                        ariaLabel="Open WhatsApp chat"
                                        tooltip="WhatsApp"
                                        disabled={!contact.phone || contact.phone.length === 0}
                                    />
                                </td>
                                {/* Email Action Column */}
                                <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                                    <ActionButtonWithDropdown
                                        items={contact.email || []}
                                        icon={<GmailIcon className="w-4 h-4" />}
                                        onAction={openEmailClient}
                                        ariaLabel="Send email"
                                        tooltip="Email"
                                        disabled={!contact.email || contact.email.length === 0}
                                    />
                                </td>
                                <td className="table-cell">
                                    <span className="text-gray-600">{contact.source || '-'}</span>
                                </td>
                                <td className="table-cell">
                                    <div className="flex flex-wrap gap-1">
                                        {contact.tags?.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="badge text-navy-700"
                                                style={{ backgroundColor: tag.color }}
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                        {contact.tags && contact.tags.length > 2 && (
                                            <span className="badge bg-gray-100 text-gray-600">
                                                +{contact.tags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
