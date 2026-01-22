'use client';

import { Contact } from '@/types';
import { Building2, Mail, Phone, MapPin, Globe, Tag, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortField = 'name' | 'company' | 'created_at';
export type SortDirection = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    direction: SortDirection;
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
}

export function ContactsTable({
    contacts,
    selectedIds,
    onToggleSelect,
    onSelectAll,
    onContactClick,
    sortConfig,
    onSort,
}: ContactsTableProps) {
    const allSelected = contacts.length > 0 && selectedIds.size === contacts.length;

    const SortIcon = ({ field }: { field: SortField }) => {
        if (!sortConfig || sortConfig.field !== field) {
            return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary-400" /> : <ArrowDown className="w-3 h-3 text-primary-400" />;
    };

    const SortableHeader = ({ field, label, className = '' }: { field: SortField; label: string; className?: string }) => (
        <th
            className={`table-cell text-left text-xs font-semibold text-dark-300 uppercase tracking-wider cursor-pointer group hover:text-white transition-colors select-none ${className}`}
            onClick={() => onSort?.(field)}
        >
            <div className="flex items-center gap-2">
                {label}
                <SortIcon field={field} />
            </div>
        </th>
    );

    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="table-header">
                        <tr>
                            <th className="table-cell w-12">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={onSelectAll}
                                    className="w-4 h-4 rounded border-dark-500 bg-dark-700 text-primary-500 focus:ring-primary-500"
                                />
                            </th>
                            <SortableHeader field="name" label="Name" />
                            <SortableHeader field="company" label="Company" />
                            <th className="table-cell text-left text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="table-cell text-left text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="table-cell text-left text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                Source
                            </th>
                            <th className="table-cell text-left text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                Tags
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700/50">
                        {contacts.map((contact) => (
                            <tr
                                key={contact.id}
                                onClick={() => onContactClick?.(contact)}
                                className={`table-row cursor-pointer hover:bg-dark-700/30 ${selectedIds.has(contact.id) ? 'bg-primary-500/5' : ''
                                    }`}
                            >
                                <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(contact.id)}
                                        onChange={() => onToggleSelect(contact.id)}
                                        className="w-4 h-4 rounded border-dark-500 bg-dark-700 text-primary-500 focus:ring-primary-500"
                                    />
                                </td>
                                <td className="table-cell">
                                    <div>
                                        <p className="font-medium text-white">{contact.name}</p>
                                        {contact.designation && (
                                            <p className="text-sm text-dark-400">{contact.designation}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="table-cell">
                                    <div className="flex items-center gap-2">
                                        {contact.company && (
                                            <>
                                                <Building2 className="w-4 h-4 text-dark-400" />
                                                <span className="text-dark-200">{contact.company.name}</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="table-cell">
                                    {contact.email && contact.email.length > 0 && (
                                        <a
                                            href={`mailto:${contact.email[0]}`}
                                            className="text-primary-400 hover:text-primary-300 transition-colors"
                                        >
                                            {contact.email[0]}
                                        </a>
                                    )}
                                    {contact.email && contact.email.length > 1 && (
                                        <span className="text-dark-500 text-xs ml-1">
                                            +{contact.email.length - 1}
                                        </span>
                                    )}
                                </td>
                                <td className="table-cell">
                                    {contact.phone && contact.phone.length > 0 && (
                                        <a
                                            href={`tel:${contact.phone[0]}`}
                                            className="text-dark-200 hover:text-white transition-colors"
                                        >
                                            {contact.phone[0]}
                                        </a>
                                    )}
                                    {contact.phone && contact.phone.length > 1 && (
                                        <span className="text-dark-500 text-xs ml-1">
                                            +{contact.phone.length - 1}
                                        </span>
                                    )}
                                </td>
                                <td className="table-cell">
                                    <span className="text-dark-300">{contact.source || '-'}</span>
                                </td>
                                <td className="table-cell">
                                    <div className="flex flex-wrap gap-1">
                                        {contact.tags?.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="badge text-white"
                                                style={{ backgroundColor: tag.color }}
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                        {contact.tags && contact.tags.length > 2 && (
                                            <span className="badge bg-dark-700 text-dark-300">
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
