'use client';

import { useState, useEffect } from 'react';
import { Contact, Tag } from '@/types';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactDetailModal } from '@/components/contacts/ContactDetailModal';
import { TagSidebar } from '@/components/tags/TagSidebar';
import { CreateTagModal } from '@/components/tags/CreateTagModal';
import { useToast } from '@/components/ui/Toast';
import { useContacts } from '@/hooks/useContacts';
import { useTags } from '@/hooks/useTags';
import {
    Search,
    Trash2,
    LayoutGrid,
    LayoutList,
    Loader2,
    Camera,
    Plus,
    Settings as SettingsIcon,
} from 'lucide-react';
import Link from 'next/link';

import {
    Users,
} from 'lucide-react';

export default function ContactsPage() {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [isMobile, setIsMobile] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ field: 'name' | 'company' | 'created_at', direction: 'asc' | 'desc' }>({
        field: 'created_at',
        direction: 'desc'
    });
    const { showToast, ToastContainer } = useToast();

    // SWR Hooks
    const { contacts, isLoading: contactsLoading, mutate: mutateContacts } = useContacts(selectedTag, searchQuery);
    const { tags, isLoading: tagsLoading, mutate: mutateTags } = useTags();

    // Sorting Logic
    const sortedContacts = [...contacts].sort((a, b) => {
        const { field, direction } = sortConfig;
        const modifier = direction === 'asc' ? 1 : -1;

        if (field === 'name') {
            return a.name.localeCompare(b.name) * modifier;
        }
        if (field === 'company') {
            const nameA = a.company?.name || '';
            const nameB = b.company?.name || '';
            return nameA.localeCompare(nameB) * modifier;
        }
        if (field === 'created_at') {
            return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * modifier;
        }
        return 0;
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setViewMode('cards');
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSort = (field: 'name' | 'company' | 'created_at') => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleDelete = async () => {
        if (selectedIds.size === 0) return;

        if (!confirm(`Delete ${selectedIds.size} contact(s)?`)) return;

        try {
            const response = await fetch('/api/contacts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });

            if (response.ok) {
                showToast(`Deleted ${selectedIds.size} contact(s)`, 'success');
                setSelectedIds(new Set());
                mutateContacts(); // Refresh contacts
            } else {
                showToast('Failed to delete contacts', 'error');
            }
        } catch (error) {
            showToast('Failed to delete contacts', 'error');
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const selectAll = () => {
        if (selectedIds.size === contacts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(contacts.map((c) => c.id)));
        }
    };

    const isLoading = contactsLoading || tagsLoading;

    return (
        <div className="flex gap-6 pb-20 lg:pb-0">
            {/* Tag Sidebar - Desktop only */}
            <div className="hidden lg:block w-64 flex-shrink-0">
                <TagSidebar
                    tags={tags}
                    selectedTag={selectedTag}
                    onSelectTag={setSelectedTag}
                    onTagsChange={mutateTags}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-4 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-navy-800">Contacts</h1>
                        <p className="text-gray-500 mt-1">
                            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                            {selectedTag && ` in ${tags.find((t) => t.id === selectedTag)?.name || 'selected tag'}`}
                        </p>
                    </div>
                    {/* Settings Button */}
                    <Link
                        href="/settings"
                        className="text-gray-400 hover:text-navy-700 transition-colors p-1"
                        title="Settings"
                    >
                        <SettingsIcon className="w-6 h-6" />
                    </Link>
                </div>

                {/* Search and Actions */}
                <div className="card p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-11"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {!isMobile && (
                                <div className="flex rounded-xl bg-gray-50 p-1">
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500'
                                            }`}
                                    >
                                        <LayoutList className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('cards')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500'
                                            }`}
                                    >
                                        <LayoutGrid className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {selectedIds.size > 0 && (
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-danger"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Delete ({selectedIds.size})</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Tag Filter */}
                <div className="lg:hidden overflow-x-auto -mx-4 px-4 w-[calc(100%+2rem)] max-w-[100vw]">
                    <div className="flex gap-2 pb-2">
                        {/* Create List Button */}
                        <button
                            onClick={() => setIsCreateTagModalOpen(true)}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:text-navy-500 hover:bg-gray-100 transition-colors flex-shrink-0"
                            title="Create List"
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        <div className="w-[1px] h-9 bg-gray-50 mx-1 flex-shrink-0" />

                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors shadow-sm ${!selectedTag
                                ? 'bg-accent-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            All Contacts
                        </button>
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => setSelectedTag(tag.id)}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors shadow-sm ${selectedTag === tag.id
                                    ? 'text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                style={selectedTag === tag.id ? { backgroundColor: tag.color } : {}}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-24 h-24 relative mx-auto mb-4">
                            {searchQuery ? (
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto shadow-clay">
                                    <Users className="w-8 h-8 text-accent-600" />
                                </div>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-navy-800 mb-2">
                            {searchQuery ? 'No contacts found' : 'No contacts yet'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery
                                ? `No results found for "${searchQuery}". Try a different search term.`
                                : 'Start by scanning a business card to add your first contact.'}
                        </p>
                        {!searchQuery && (
                            <Link href="/scan" className="btn btn-primary">
                                <Camera className="w-5 h-5" />
                                Scan Your First Card
                            </Link>
                        )}
                    </div>
                ) : viewMode === 'table' && !isMobile ? (
                    <ContactsTable
                        contacts={sortedContacts}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onSelectAll={selectAll}
                        onRefresh={mutateContacts}
                        onContactClick={setSelectedContact}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {contacts.map((contact) => (
                            <ContactCard
                                key={contact.id}
                                contact={contact}
                                isSelected={selectedIds.has(contact.id)}
                                onToggleSelect={() => toggleSelect(contact.id)}
                                onClick={() => setSelectedContact(contact)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Contact Detail Modal */}
            <ContactDetailModal
                contact={selectedContact}
                isOpen={!!selectedContact}
                onClose={() => setSelectedContact(null)}
                availableTags={tags}
                onContactUpdate={() => {
                    mutateContacts();
                    setSelectedContact(null);
                }}
            />

            {/* Create Tag Modal */}
            <CreateTagModal
                isOpen={isCreateTagModalOpen}
                onClose={() => setIsCreateTagModalOpen(false)}
                onTagCreated={mutateTags}
            />

            <ToastContainer />
        </div>
    );
}

