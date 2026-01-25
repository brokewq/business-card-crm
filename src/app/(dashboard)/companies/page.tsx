'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Building2, Users, Globe, Loader2, Search } from 'lucide-react';
import Link from 'next/link';


interface Company {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    contacts: { count: number }[];
}

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast, ToastContainer } = useToast();

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);

            const response = await fetch(`/api/companies?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setCompanies(data);
            }
        } catch (error) {
            showToast('Failed to load companies', 'error');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, showToast]);

    // Fetch companies on mount and when searchQuery (stable via debounce) changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCompanies();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchCompanies]);

    return (
        <div className="pb-20 lg:pb-0 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-800">Companies</h1>
                    <p className="text-gray-500 mt-1">
                        {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} linked to your contacts
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
                </div>
            ) : companies.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-24 h-24 relative mx-auto mb-4">
                        {searchQuery ? (
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto shadow-clay">
                                <Building2 className="w-8 h-8 text-accent-600" />
                            </div>
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-navy-500 mb-2">
                        {searchQuery ? 'No companies found' : 'No companies yet'}
                    </h3>
                    <p className="text-gray-500">
                        {searchQuery
                            ? `No companies found matching "${searchQuery}"`
                            : 'Companies are automatically created when you add contacts with business websites or email domains.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {companies.map((company) => (
                        <Link href={`/companies/${company.id}`} key={company.id} className="block group">
                            <div className="card card-hover p-5 h-full group-hover:border-accent-400 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-6 h-6 text-accent-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-navy-800 truncate group-hover:text-accent-600 transition-colors">{company.name}</h3>
                                        {company.domain && (
                                            <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                                                <Globe className="w-3.5 h-3.5" />
                                                <span className="text-sm truncate">{company.domain}</span>
                                            </div>
                                        )}
                                        {company.industry && (
                                            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                                                {company.industry}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center gap-2 text-gray-500">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm">
                                        {company.contacts?.[0]?.count || 0} contact{(company.contacts?.[0]?.count || 0) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <ToastContainer />
        </div>
    );
}
