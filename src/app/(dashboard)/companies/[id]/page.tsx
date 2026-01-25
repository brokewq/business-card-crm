'use client';

import { useCompany } from '@/hooks/useCompany';
import { useContacts } from '@/hooks/useContacts';
import { useTags } from '@/hooks/useTags'; // Needed for ContactDetailModal
import { useToast } from '@/components/ui/Toast';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactDetailModal } from '@/components/contacts/ContactDetailModal';
import { Building2, Globe, ArrowLeft, Loader2, LayoutList, LayoutGrid, Users } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Contact } from '@/types';

// Next.js 14 provides params as a plain object
export default function CompanyDetailPage({ params }: { params: { id: string } }) {
    const companyId = params.id;

    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isMobile, setIsMobile] = useState(false);
    const { showToast, ToastContainer } = useToast();

    // Data Fetching
    const { company, isLoading: companyLoading } = useCompany(companyId);
    const { contacts, isLoading: contactsLoading, mutate: mutateContacts } = useContacts(null, '', companyId);
    const { tags } = useTags(); // For modal

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

    if (companyLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="text-center py-20 text-gray-500">
                <h2 className="text-xl font-semibold text-navy-500 mb-2">Company not found</h2>
                <Link href="/companies" className="text-primary-400 hover:text-primary-300">
                    Return to Companies
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-20 lg:pb-0 space-y-6">
            {/* Header */}
            <div>
                <Link href="/companies" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy-500 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Companies
                </Link>

                <div className="card p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-8 h-8 text-primary-400" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-navy-500 mb-2">{company.name}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-600">
                                {company.domain && (
                                    <div className="flex items-center gap-1.5">
                                        <Globe className="w-4 h-4 text-gray-500" />
                                        <span>{company.domain}</span>
                                    </div>
                                )}
                                {company.industry && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-sm">
                                        {company.industry}
                                    </span>
                                )}
                            </div>
                            {company.description && (
                                <p className="text-gray-500 mt-4 max-w-2xl">
                                    {company.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-200/50">
                            <Users className="w-4 h-4" />
                            <span className="font-medium text-navy-500">{contacts.length}</span>
                            <span>contact{contacts.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contacts List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-navy-500">Associated Contacts</h2>

                    {!isMobile && (
                        <div className="flex rounded-xl bg-gray-50 p-1">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-gray-100 text-navy-500' : 'text-gray-500'}`}
                            >
                                <LayoutList className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-gray-100 text-navy-500' : 'text-gray-500'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {contactsLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-gray-50/30 rounded-2xl border border-gray-200/50 border-dashed">
                        No contacts associated with this company.
                    </div>
                ) : viewMode === 'table' && !isMobile ? (
                    <ContactsTable
                        contacts={contacts}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onSelectAll={selectAll}
                        onRefresh={mutateContacts}
                        onContactClick={setSelectedContact}
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

            <ContactDetailModal
                contact={selectedContact}
                isOpen={!!selectedContact}
                onClose={() => setSelectedContact(null)}
                availableTags={tags} // Pass tags for editing
                onContactUpdate={() => {
                    mutateContacts();
                    setSelectedContact(null);
                }}
            />

            <ToastContainer />
        </div>
    );
}
