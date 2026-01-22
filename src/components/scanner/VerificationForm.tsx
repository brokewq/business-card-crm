'use client';

import { useState, useEffect } from 'react';
import { OCRResult, DEFAULT_INDUSTRIES, DEFAULT_SOURCES } from '@/types';
import { Loader2, Save, X, Plus } from 'lucide-react';

interface VerificationFormProps {
    ocrResult: OCRResult;
    cardImage: string;
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
}

export function VerificationForm({
    ocrResult,
    cardImage,
    onSave,
    onCancel,
}: VerificationFormProps) {
    const [saving, setSaving] = useState(false);
    const [industries, setIndustries] = useState<string[]>([...DEFAULT_INDUSTRIES]);
    const [sources, setSources] = useState<string[]>([...DEFAULT_SOURCES]);

    const [formData, setFormData] = useState({
        name: ocrResult.contact_name || '',
        designation: ocrResult.designation || '',
        email: ocrResult.emails || [],
        phone: ocrResult.phones || [],
        address: ocrResult.address || '',
        website: ocrResult.website || '',
        source: '',
        referral_details: '',
        industry: ocrResult.industry_guess || '',
        company_name: ocrResult.company_name || '',
        company_description: ocrResult.description || '',
        additional_details: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');

    // Fetch custom settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const data = await response.json();
                    setIndustries(data.industries);
                    setSources(data.sources);
                }
            } catch (error) {
                console.error('Failed to fetch settings');
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const addEmail = () => {
        if (newEmail && !formData.email.includes(newEmail)) {
            handleChange('email', [...formData.email, newEmail]);
            setNewEmail('');
        }
    };

    const removeEmail = (email: string) => {
        handleChange('email', formData.email.filter((e) => e !== email));
    };

    const addPhone = () => {
        if (newPhone && !formData.phone.includes(newPhone)) {
            handleChange('phone', [...formData.phone, newPhone]);
            setNewPhone('');
        }
    };

    const removePhone = (phone: string) => {
        handleChange('phone', formData.phone.filter((p) => p !== phone));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-32 lg:pb-0 min-h-screen flex flex-col">
            {/* Header - Sticky on mobile */}
            <div className="sticky top-0 z-20 bg-dark-900/95 backdrop-blur-lg pb-2 pt-2 lg:relative lg:bg-transparent lg:backdrop-blur-none lg:pb-0 lg:pt-0 lg:mb-6">
                <div className="flex items-center justify-between lg:block">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-white">Verify Contact</h1>
                        <p className="text-dark-400 text-sm mt-1 hidden lg:block">
                            Review and edit the extracted information
                        </p>
                    </div>
                    {/* Mobile Save Button in Header */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            const form = document.getElementById('verification-form') as HTMLFormElement;
                            form?.requestSubmit();
                        }}
                        disabled={saving}
                        className="btn btn-primary py-2 px-4 lg:hidden"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Card Preview - Sticky on mobile (30% height max) */}
                <div className="sticky top-16 z-10 lg:relative lg:top-0 lg:self-start">
                    <div className="card p-3 lg:p-4 bg-dark-800/90 backdrop-blur-sm lg:bg-dark-800/50">
                        <p className="text-xs font-medium text-dark-400 mb-2 lg:mb-3">Scanned Card</p>
                        <div className="aspect-[16/10] max-h-[25vh] lg:max-h-none lg:aspect-video rounded-xl overflow-hidden bg-dark-900">
                            <img
                                src={cardImage}
                                alt="Business Card"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Form - Scrollable area */}
                <form id="verification-form" onSubmit={handleSubmit} className="card p-4 lg:p-6 space-y-4 lg:space-y-5">
                    {/* Name */}
                    <div>
                        <label className="label">
                            Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`input ${errors.name ? 'input-error' : ''}`}
                            placeholder="Full name"
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Designation */}
                    <div>
                        <label className="label">Designation</label>
                        <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) => handleChange('designation', e.target.value)}
                            className="input"
                            placeholder="Job title"
                        />
                    </div>

                    {/* Company */}
                    <div>
                        <label className="label">Company</label>
                        <input
                            type="text"
                            value={formData.company_name}
                            onChange={(e) => handleChange('company_name', e.target.value)}
                            className="input"
                            placeholder="Company name"
                        />
                    </div>

                    {/* Emails */}
                    <div>
                        <label className="label">Email Addresses</label>
                        <div className="space-y-2">
                            {formData.email.map((email) => (
                                <div
                                    key={email}
                                    className="flex items-center gap-2 px-3 py-2 bg-dark-800 rounded-lg"
                                >
                                    <span className="flex-1 text-sm text-dark-200">{email}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeEmail(email)}
                                        className="p-2 hover:bg-dark-700 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    >
                                        <X className="w-5 h-5 text-dark-400" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="input flex-1"
                                    placeholder="Add email"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                                />
                                <button
                                    type="button"
                                    onClick={addEmail}
                                    className="btn btn-secondary"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Phones */}
                    <div>
                        <label className="label">Phone Numbers</label>
                        <div className="space-y-2">
                            {formData.phone.map((phone) => (
                                <div
                                    key={phone}
                                    className="flex items-center gap-2 px-3 py-2 bg-dark-800 rounded-lg"
                                >
                                    <span className="flex-1 text-sm text-dark-200">{phone}</span>
                                    <button
                                        type="button"
                                        onClick={() => removePhone(phone)}
                                        className="p-2 hover:bg-dark-700 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    >
                                        <X className="w-4 h-4 text-dark-400" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    className="input flex-1"
                                    placeholder="Add phone"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhone())}
                                />
                                <button
                                    type="button"
                                    onClick={addPhone}
                                    className="btn btn-secondary"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Website */}
                    <div>
                        <label className="label">Website</label>
                        <input
                            type="text"
                            value={formData.website}
                            onChange={(e) => handleChange('website', e.target.value)}
                            className="input"
                            placeholder="example.com"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="label">Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="input min-h-[80px]"
                            placeholder="Full address"
                        />
                    </div>

                    {/* Industry */}
                    <div>
                        <label className="label">Industry</label>
                        <select
                            value={formData.industry}
                            onChange={(e) => handleChange('industry', e.target.value)}
                            className="input"
                        >
                            <option value="">Select industry</option>
                            {industries.map((industry) => (
                                <option key={industry} value={industry}>
                                    {industry}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Source */}
                    <div>
                        <label className="label">Source</label>
                        <select
                            value={formData.source}
                            onChange={(e) => handleChange('source', e.target.value)}
                            className="input"
                        >
                            <option value="">Select source</option>
                            {sources.map((source) => (
                                <option key={source} value={source}>
                                    {source}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Referral Details */}
                    {formData.source === 'Referral' && (
                        <div>
                            <label className="label">Referral Details</label>
                            <input
                                type="text"
                                value={formData.referral_details}
                                onChange={(e) => handleChange('referral_details', e.target.value)}
                                className="input"
                                placeholder="Who referred this contact?"
                            />
                        </div>
                    )}

                    {/* Additional Details */}
                    <div>
                        <label className="label">Additional Notes</label>
                        <textarea
                            value={formData.additional_details}
                            onChange={(e) => handleChange('additional_details', e.target.value)}
                            className="input min-h-[80px]"
                            placeholder="Any additional information..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-secondary flex-1 py-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary flex-1 py-3"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Contact
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
