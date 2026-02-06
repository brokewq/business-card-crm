'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Building2, Users, Globe, Loader2, Search, LayoutGrid, LayoutList, Filter, ChevronDown, X, Check } from 'lucide-react';
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
    const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const industryDropdownRef = useRef<HTMLDivElement>(null);
    const { showToast, ToastContainer } = useToast();

    // Extract unique industries from companies
    const availableIndustries = useMemo(() => {
        const industries = companies
            .map(c => c.industry)
            .filter((industry): industry is string => !!industry);
        return Array.from(new Set(industries)).sort();
    }, [companies]);

    // Filter companies based on selected industries
    const filteredCompanies = useMemo(() => {
        if (selectedIndustries.length === 0) return companies;
        return companies.filter(company =>
            company.industry && selectedIndustries.includes(company.industry)
        );
    }, [companies, selectedIndustries]);

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

    // Check for mobile viewport
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

    // Close industry dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (industryDropdownRef.current && !industryDropdownRef.current.contains(event.target as Node)) {
                setIsIndustryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleIndustry = (industry: string) => {
        setSelectedIndustries(prev =>
            prev.includes(industry)
                ? prev.filter(i => i !== industry)
                : [...prev, industry]
        );
    };

    const clearIndustryFilters = () => {
        setSelectedIndustries([]);
    };

    return (
        <div className="pb-20 lg:pb-0 space-y-6 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-800">Companies</h1>
                    <p className="text-gray-500 mt-1">
                        {filteredCompanies.length} compan{filteredCompanies.length !== 1 ? 'ies' : 'y'}
                        {selectedIndustries.length > 0 && ` (filtered)`}
                    </p>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3">
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

                    {/* Industry Filter Dropdown */}
                    <div className="relative" ref={industryDropdownRef}>
                        <button
                            onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${selectedIndustries.length > 0
                                ? 'bg-accent-50 border-accent-300 text-accent-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm font-medium">
                                Industry
                                {selectedIndustries.length > 0 && ` (${selectedIndustries.length})`}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isIndustryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isIndustryDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                                <div className="p-3 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-navy-800">Filter by Industry</span>
                                        {selectedIndustries.length > 0 && (
                                            <button
                                                onClick={clearIndustryFilters}
                                                className="text-xs text-accent-600 hover:text-accent-700 font-medium"
                                            >
                                                Clear all
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {availableIndustries.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            No industries available
                                        </div>
                                    ) : (
                                        availableIndustries.map(industry => (
                                            <button
                                                key={industry}
                                                onClick={() => toggleIndustry(industry)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedIndustries.includes(industry)
                                                    ? 'bg-accent-500 border-accent-500'
                                                    : 'border-gray-300'
                                                    }`}>
                                                    {selectedIndustries.includes(industry) && (
                                                        <Check className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-700">{industry}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* View Toggle - Desktop Only */}
                    {!isMobile && (
                        <div className="flex rounded-xl bg-gray-50 p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500'
                                    }`}
                                title="List view"
                            >
                                <LayoutList className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500'
                                    }`}
                                title="Card view"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Active Filters Display */}
            {selectedIndustries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedIndustries.map(industry => (
                        <span
                            key={industry}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-sm"
                        >
                            {industry}
                            <button
                                onClick={() => toggleIndustry(industry)}
                                className="hover:bg-accent-100 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    <button
                        onClick={clearIndustryFilters}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-24 h-24 relative mx-auto mb-4">
                        {searchQuery || selectedIndustries.length > 0 ? (
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
                        {searchQuery || selectedIndustries.length > 0 ? 'No companies found' : 'No companies yet'}
                    </h3>
                    <p className="text-gray-500">
                        {searchQuery
                            ? `No companies found matching "${searchQuery}"`
                            : selectedIndustries.length > 0
                                ? 'No companies match the selected industry filter'
                                : 'Companies are automatically created when you add contacts with business websites or email domains.'}
                    </p>
                    {selectedIndustries.length > 0 && (
                        <button
                            onClick={clearIndustryFilters}
                            className="mt-4 text-accent-600 hover:text-accent-700 font-medium text-sm"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : viewMode === 'list' && !isMobile ? (
                /* List View */
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Company</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700 hidden md:table-cell">Domain</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700 hidden lg:table-cell">Industry</th>
                                <th className="text-right px-4 py-3 text-sm font-semibold text-navy-700">Contacts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.map((company) => (
                                <tr
                                    key={company.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                                >
                                    <td className="px-4 py-3">
                                        <Link href={`/companies/${company.id}`} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center flex-shrink-0">
                                                <Building2 className="w-5 h-5 text-accent-600" />
                                            </div>
                                            <span className="font-medium text-navy-800 group-hover:text-accent-600 transition-colors">
                                                {company.name}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        {company.domain ? (
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <Globe className="w-3.5 h-3.5" />
                                                <span className="text-sm">{company.domain}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        {company.industry ? (
                                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                                                {company.industry}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-gray-500">
                                            <Users className="w-4 h-4" />
                                            <span className="text-sm">
                                                {company.contacts?.[0]?.count || 0}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Card View */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
                    {filteredCompanies.map((company) => (
                        <Link href={`/companies/${company.id}`} key={company.id} className="block group h-full">
                            <div className="card card-hover p-5 h-full min-h-[160px] flex flex-col justify-between group-hover:border-accent-400 transition-colors">
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
                                <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">
                                            {company.contacts?.[0]?.count || 0} contact{(company.contacts?.[0]?.count || 0) !== 1 ? 's' : ''}
                                        </span>
                                    </div>
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

