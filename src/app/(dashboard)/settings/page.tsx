'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Settings as SettingsIcon, Plus, Trash2, Loader2, Download, LogOut } from 'lucide-react';

interface CustomSetting {
    id: string;
    setting_type: 'INDUSTRY' | 'SOURCE';
    value: string;
}

export default function SettingsPage() {
    const [industries, setIndustries] = useState<string[]>([]);
    const [sources, setSources] = useState<string[]>([]);
    const [newIndustry, setNewIndustry] = useState('');
    const [newSource, setNewSource] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const { showToast, ToastContainer } = useToast();

    const fetchSettings = useCallback(async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setIndustries(data.industries);
                setSources(data.sources);
            }
        } catch (error) {
            showToast('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const addCustomValue = async (type: 'INDUSTRY' | 'SOURCE', value: string) => {
        if (!value.trim()) return;

        setSaving(true);
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setting_type: type, value: value.trim() }),
            });

            if (response.ok) {
                showToast(`Added "${value}" successfully`, 'success');
                await fetchSettings();
                if (type === 'INDUSTRY') {
                    setNewIndustry('');
                } else {
                    setNewSource('');
                }
            } else {
                showToast('Failed to add value', 'error');
            }
        } catch (error) {
            showToast('Failed to add value', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exportAll: true }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `contacts-${Date.now()}.xlsx`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('Contacts exported successfully', 'success');
            } else {
                showToast('Export failed', 'error');
            }
        } catch (error) {
            showToast('Export failed', 'error');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-navy-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                        <SettingsIcon className="w-6 h-6 text-accent-600" />
                    </div>
                    Settings
                </h1>
                <p className="text-gray-500 mt-1">
                    Manage your account and preferences
                </p>
            </div>

            {/* Account Management */}
            <div className="card p-6 mb-6">
                <h2 className="text-lg font-semibold text-navy-500 mb-4">Account</h2>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-gray-600 font-medium">Session Control</p>
                        <p className="text-gray-500 text-sm">Sign out to end your current session safely.</p>
                    </div>
                    <button
                        onClick={async () => {
                            const { createClient } = await import('@/lib/supabase/client');
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                        }}
                        className="btn whitespace-nowrap bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Export Data */}
            <div className="card p-6 mb-6">
                <h2 className="text-lg font-semibold text-navy-500 mb-4">Export Data</h2>
                <p className="text-gray-500 text-sm mb-4">
                    Download all your contacts as an Excel spreadsheet.
                </p>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="btn btn-primary"
                >
                    {exporting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Export All Contacts
                        </>
                    )}
                </button>
            </div>

            {/* Industries */}
            <div className="card p-6 mb-6">
                <h2 className="text-lg font-semibold text-navy-800 mb-4">Industries</h2>
                <p className="text-gray-500 text-sm mb-4">
                    Add custom industry options for categorizing your contacts.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {industries.map((industry) => (
                        <span
                            key={industry}
                            className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm"
                        >
                            {industry}
                        </span>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newIndustry}
                        onChange={(e) => setNewIndustry(e.target.value)}
                        placeholder="Add new industry..."
                        className="input flex-1"
                        onKeyDown={(e) =>
                            e.key === 'Enter' && addCustomValue('INDUSTRY', newIndustry)
                        }
                    />
                    <button
                        onClick={() => addCustomValue('INDUSTRY', newIndustry)}
                        disabled={saving || !newIndustry.trim()}
                        className="btn btn-primary"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Sources */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-navy-800 mb-4">Sources</h2>
                <p className="text-gray-500 text-sm mb-4">
                    Add custom source options for tracking where you met contacts.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {sources.map((source) => (
                        <span
                            key={source}
                            className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm"
                        >
                            {source}
                        </span>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        placeholder="Add new source..."
                        className="input flex-1"
                        onKeyDown={(e) =>
                            e.key === 'Enter' && addCustomValue('SOURCE', newSource)
                        }
                    />
                    <button
                        onClick={() => addCustomValue('SOURCE', newSource)}
                        disabled={saving || !newSource.trim()}
                        className="btn btn-primary"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}
