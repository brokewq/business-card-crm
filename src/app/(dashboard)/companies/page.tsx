'use client';

import { useState, useEffect } from 'react';
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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCompanies();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchCompanies = async () => {
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
    };

    return (
        <div className="pb-20 lg:pb-0 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Companies</h1>
                    <p className="text-dark-400 mt-1">
                        {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} linked to your contacts
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
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
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            ) : companies.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
                        {searchQuery ? (
                            <Search className="w-8 h-8 text-dark-400" />
                        ) : (
                            <Building2 className="w-8 h-8 text-dark-400" />
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        {searchQuery ? 'No companies found' : 'No companies yet'}
                    </h3>
                    <p className="text-dark-400">
                        {searchQuery
                            ? `No companies found matching "${searchQuery}"`
                            : 'Companies are automatically created when you add contacts with business websites or email domains.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {companies.map((company) => (
                        <Link href={`/companies/${company.id}`} key={company.id} className="block group">
                            <div className="card card-hover p-5 h-full group-hover:border-primary-500/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">{company.name}</h3>
                                        {company.domain && (
                                            <div className="flex items-center gap-1.5 mt-1 text-dark-400">
                                                <Globe className="w-3.5 h-3.5" />
                                                <span className="text-sm truncate">{company.domain}</span>
                                            </div>
                                        )}
                                        {company.industry && (
                                            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-dark-700 text-dark-300 text-xs">
                                                {company.industry}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-dark-700/50 flex items-center gap-2 text-dark-400">
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
