import { Contact, Tag, DEFAULT_INDUSTRIES, DEFAULT_SOURCES } from '@/types';
import { Modal } from '@/components/ui/Modal';
import {
    X,
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Copy,
    Check,
    Edit2,
    Loader2,
    Plus,
    Trash2,
    Save
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { FullScreenImageViewer } from '@/components/ui/FullScreenImageViewer';

interface ContactDetailModalProps {
    contact: Contact | null;
    isOpen: boolean;
    onClose: () => void;
    availableTags: Tag[];
    onContactUpdate: () => void;
}

export function ContactDetailModal({
    contact,
    isOpen,
    onClose,
    availableTags,
    onContactUpdate
}: ContactDetailModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isEditingTags, setIsEditingTags] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
    const [savingTags, setSavingTags] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editedContact, setEditedContact] = useState<Contact | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    // Separate state for company name since it's nested
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        if (contact) {
            setEditedContact(JSON.parse(JSON.stringify(contact))); // Deep copy
            setCompanyName(contact.company?.name || '');
        }
    }, [contact]);

    useEffect(() => {
        if (contact?.tags) {
            setSelectedTagIds(new Set(contact.tags.map(t => t.id)));
        } else {
            setSelectedTagIds(new Set());
        }
    }, [contact]);

    if (!contact) return null;

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const toggleTag = (tagId: string) => {
        const newSet = new Set(selectedTagIds);
        if (newSet.has(tagId)) {
            newSet.delete(tagId);
        } else {
            newSet.add(tagId);
        }
        setSelectedTagIds(newSet);
    };

    const saveTags = async () => {
        setSavingTags(true);
        try {
            const response = await fetch(`/api/contacts/${contact.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_ids: Array.from(selectedTagIds) }),
            });

            if (response.ok) {
                setIsEditingTags(false);
                onContactUpdate();
            }
        } catch (error) {
            console.error('Failed to update tags', error);
        } finally {
            setSavingTags(false);
        }
    };

    // Edit Handlers
    const handleSaveContact = async () => {
        if (!editedContact) return;
        setIsSaving(true);
        try {
            const response = await fetch(`/api/contacts/${contact.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editedContact.name,
                    designation: editedContact.designation,
                    email: editedContact.email,
                    phone: editedContact.phone,
                    address: editedContact.address,
                    website: editedContact.website,
                    additional_details: editedContact.additional_details,
                    company_name: companyName, // Send company name
                    source: editedContact.source,
                    industry: editedContact.industry
                }),
            });

            if (response.ok) {
                setIsEditing(false);
                onContactUpdate();
            } else {
                console.error('Failed to update contact');
            }
        } catch (error) {
            console.error('Error updating contact:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof Contact, value: string) => {
        if (!editedContact) return;
        setEditedContact({ ...editedContact, [field]: value });
    };

    const handleArrayChange = (field: 'email' | 'phone', index: number, value: string) => {
        if (!editedContact) return;
        const newArray = [...(editedContact[field] || [])];
        newArray[index] = value;
        setEditedContact({ ...editedContact, [field]: newArray });
    };

    const handleAddArrayItem = (field: 'email' | 'phone') => {
        if (!editedContact) return;
        const newArray = [...(editedContact[field] || []), ''];
        setEditedContact({ ...editedContact, [field]: newArray });
    };

    const handleRemoveArrayItem = (field: 'email' | 'phone', index: number) => {
        if (!editedContact) return;
        const newArray = [...(editedContact[field] || [])];
        newArray.splice(index, 1);
        setEditedContact({ ...editedContact, [field]: newArray });
    };

    const CopyButton = ({ text, field }: { text: string; field: string }) => (
        <button
            onClick={() => copyToClipboard(text, field)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-navy-700"
            title="Copy to clipboard"
        >
            {copiedField === field ? (
                <Check className="w-4 h-4 text-green-500" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-clay-border p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-navy-800">Contact Details</h2>
                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-700 transition-colors flex items-center gap-2"
                                title="Edit Contact"
                            >
                                <Edit2 className="w-5 h-5" />
                                <span className="text-sm font-medium hidden sm:inline">Edit</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 mr-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedContact(JSON.parse(JSON.stringify(contact))); // Reset
                                    }}
                                    className="text-sm text-gray-500 hover:text-navy-700 px-3 py-1.5 font-medium transition-colors"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveContact}
                                    className="text-sm bg-accent-500 text-white px-4 py-1.5 rounded-lg hover:bg-accent-600 flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Column: Image & Basic Info */}
                        <div className="lg:w-1/3 space-y-6">
                            {/* Card Image */}
                            {/* Card Image */}
                            {contact.card_image_url ? (
                                <div
                                    className="rounded-xl overflow-hidden bg-gray-50 border border-clay-border shadow-clay cursor-pointer group relative"
                                    onClick={() => setIsViewerOpen(true)}
                                >
                                    <img
                                        src={contact.card_image_url}
                                        alt="Business Card"
                                        className="w-full object-contain max-h-48 lg:max-h-64 transition-transform duration-300 group-hover:scale-[1.02]"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">View Full Screen</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-32 rounded-xl bg-gray-50 border border-clay-border flex items-center justify-center text-gray-400 text-sm italic">
                                    No card image
                                </div>
                            )}

                            {/* Name & Title (Mobile/Left Column) */}
                            <div className="text-center lg:text-left pb-4 border-b border-clay-border">
                                {isEditing && editedContact ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={editedContact.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full text-2xl font-bold text-navy-800 border-b-2 border-transparent focus:border-accent-500 outline-none bg-transparent placeholder-gray-300 text-center lg:text-left transition-colors"
                                            placeholder="Name"
                                        />
                                        <input
                                            type="text"
                                            value={editedContact.designation || ''}
                                            onChange={(e) => handleInputChange('designation', e.target.value)}
                                            className="w-full text-accent-600 font-medium border-b-2 border-transparent focus:border-accent-500 outline-none bg-transparent placeholder-gray-300 text-center lg:text-left transition-colors"
                                            placeholder="Designation"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-2xl font-bold text-navy-800">{contact.name}</h3>
                                        {contact.designation && (
                                            <p className="text-accent-600 mt-1 font-medium">{contact.designation}</p>
                                        )}
                                    </>
                                )}
                                {isEditing ? (
                                    <div className="flex items-center justify-center lg:justify-start gap-2 mt-2">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="min-w-0 flex-1 border-b border-transparent focus:border-accent-500 outline-none bg-transparent placeholder-gray-300 text-gray-600 transition-colors"
                                            placeholder="Company Name"
                                        />
                                    </div>
                                ) : (
                                    contact.company && (
                                        <div className="flex items-center justify-center lg:justify-start gap-2 mt-2 text-gray-600">
                                            <Building2 className="w-4 h-4" />
                                            <span>{contact.company.name}</span>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Created Date */}
                            <div className="text-center lg:text-left text-gray-500 text-sm">
                                Added on {new Date(contact.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="flex-1 space-y-6 lg:border-l lg:border-clay-border lg:pl-6">
                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Contact Information</h4>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    {/* Phones */}
                                    {isEditing && editedContact ? (
                                        <div className="sm:col-span-2 space-y-2">
                                            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-2">Phone Numbers</label>
                                            {editedContact.phone.map((phone, idx) => (
                                                <div key={`edit-phone-${idx}`} className="flex items-center gap-2">
                                                    <div className="flex-1 flex items-center bg-gray-50 rounded-lg border border-clay-border focus-within:border-accent-500 focus-within:ring-1 focus-within:ring-accent-500 transition-all">
                                                        <div className="pl-3 text-gray-400">
                                                            <Phone className="w-4 h-4" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={phone}
                                                            onChange={(e) => handleArrayChange('phone', idx, e.target.value)}
                                                            className="w-full p-2 bg-transparent outline-none text-navy-800"
                                                            placeholder="Phone Number"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveArrayItem('phone', idx)}
                                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => handleAddArrayItem('phone')}
                                                className="text-xs flex items-center gap-1 text-accent-600 hover:text-accent-700 font-medium px-2 py-1 hover:bg-accent-50 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> Add Phone
                                            </button>
                                        </div>
                                    ) : (
                                        contact.phone && contact.phone.map((phone, idx) => (
                                            <div key={`phone-${idx}`} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-clay-border min-h-[64px]">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-inner-sm flex-shrink-0">
                                                        <Phone className="w-5 h-5 text-accent-500" />
                                                    </div>
                                                    <a href={`tel:${phone}`} className="text-navy-800 font-medium break-all hover:text-accent-600 transition-colors">{phone}</a>
                                                </div>
                                                <CopyButton text={phone} field={`phone-${idx}`} />
                                            </div>
                                        ))
                                    )}

                                    {/* Emails */}
                                    {isEditing && editedContact ? (
                                        <div className="sm:col-span-2 space-y-2 mt-2">
                                            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-2">Email Addresses</label>
                                            {editedContact.email.map((email, idx) => (
                                                <div key={`edit-email-${idx}`} className="flex items-center gap-2">
                                                    <div className="flex-1 flex items-center bg-gray-50 rounded-lg border border-clay-border focus-within:border-accent-500 focus-within:ring-1 focus-within:ring-accent-500 transition-all">
                                                        <div className="pl-3 text-gray-400">
                                                            <Mail className="w-4 h-4" />
                                                        </div>
                                                        <input
                                                            type="email"
                                                            value={email}
                                                            onChange={(e) => handleArrayChange('email', idx, e.target.value)}
                                                            className="w-full p-2 bg-transparent outline-none text-navy-800"
                                                            placeholder="Email Address"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveArrayItem('email', idx)}
                                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => handleAddArrayItem('email')}
                                                className="text-xs flex items-center gap-1 text-accent-600 hover:text-accent-700 font-medium px-2 py-1 hover:bg-accent-50 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> Add Email
                                            </button>
                                        </div>
                                    ) : (
                                        contact.email && contact.email.map((email, idx) => (
                                            <div key={`email-${idx}`} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-clay-border sm:col-span-2 xl:col-span-1 min-h-[64px]">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-inner-sm flex-shrink-0">
                                                        <Mail className="w-5 h-5 text-accent-500" />
                                                    </div>
                                                    <a href={`mailto:${email}`} className="text-navy-800 font-medium break-all hover:text-accent-600 transition-colors">{email}</a>
                                                </div>
                                                <CopyButton text={email} field={`email-${idx}`} />
                                            </div>
                                        ))
                                    )}

                                    {/* Website */}
                                    {isEditing && editedContact ? (
                                        <div className="sm:col-span-2 mt-2">
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-clay-border focus-within:border-accent-500 focus-within:ring-1 focus-within:ring-accent-500 transition-all p-2">
                                                <Globe className="w-5 h-5 text-gray-400 mr-2" />
                                                <input
                                                    type="url"
                                                    value={editedContact.website || ''}
                                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                                    className="w-full bg-transparent outline-none text-navy-800"
                                                    placeholder="Website URL"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        contact.website && (
                                            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-clay-border sm:col-span-2 min-h-[64px]">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-inner-sm flex-shrink-0">
                                                        <Globe className="w-5 h-5 text-accent-500" />
                                                    </div>
                                                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-navy-800 font-medium break-all hover:text-accent-600 transition-colors">{contact.website}</a>
                                                </div>
                                                <CopyButton text={contact.website} field="website" />
                                            </div>
                                        )
                                    )}

                                    {/* Address */}
                                    {isEditing && editedContact ? (
                                        <div className="sm:col-span-2 mt-2">
                                            <div className="flex items-start bg-gray-50 rounded-lg border border-clay-border focus-within:border-accent-500 focus-within:ring-1 focus-within:ring-accent-500 transition-all p-2">
                                                <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                                <textarea
                                                    value={editedContact.address || ''}
                                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                                    className="w-full bg-transparent outline-none text-navy-800 resize-none min-h-[60px]"
                                                    placeholder="Address"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        contact.address && (
                                            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-clay-border sm:col-span-2 min-h-[64px]">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-inner-sm flex-shrink-0">
                                                        <MapPin className="w-5 h-5 text-accent-500" />
                                                    </div>
                                                    <span className="text-navy-800 font-medium break-words leading-tight">{contact.address}</span>
                                                </div>
                                                <CopyButton text={contact.address} field="address" />
                                            </div>
                                        )
                                    )}

                                    {/* Source & Industry */}
                                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold ml-1">Source</label>
                                            {isEditing && editedContact ? (
                                                <select
                                                    value={editedContact.source || ''}
                                                    onChange={(e) => handleInputChange('source', e.target.value)}
                                                    className="w-full bg-gray-50 rounded-lg border border-clay-border p-2 text-sm text-navy-800 outline-none focus:border-accent-500"
                                                >
                                                    <option value="">Select Source</option>
                                                    {DEFAULT_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            ) : (
                                                <div className="bg-gray-50 rounded-lg border border-clay-border p-3 text-sm font-medium text-navy-800">
                                                    {contact.source || <span className="text-gray-400 italic">Not set</span>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold ml-1">Industry</label>
                                            {isEditing && editedContact ? (
                                                <select
                                                    value={editedContact.industry || ''}
                                                    onChange={(e) => handleInputChange('industry', e.target.value)}
                                                    className="w-full bg-gray-50 rounded-lg border border-clay-border p-2 text-sm text-navy-800 outline-none focus:border-accent-500"
                                                >
                                                    <option value="">Select Industry</option>
                                                    {DEFAULT_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                                </select>
                                            ) : (
                                                <div className="bg-gray-50 rounded-lg border border-clay-border p-3 text-sm font-medium text-navy-800">
                                                    {contact.industry || (contact.company?.industry) || <span className="text-gray-400 italic">Not set</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {(isEditing || contact.additional_details) && (
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Notes</label>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-clay-border">
                                        {isEditing && editedContact ? (
                                            <textarea
                                                value={editedContact.additional_details || ''}
                                                onChange={(e) => handleInputChange('additional_details', e.target.value)}
                                                className="w-full bg-transparent outline-none text-gray-700 min-h-[100px] resize-none"
                                                placeholder="Add notes..."
                                            />
                                        ) : (
                                            <p className="text-gray-700 whitespace-pre-wrap">{contact.additional_details}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="pt-4 border-t border-clay-border">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Lists (Tags)</label>
                                    {!isEditingTags ? (
                                        <button
                                            onClick={() => setIsEditingTags(true)}
                                            className="p-1 rounded-lg hover:bg-gray-100 text-accent-600 transition-colors flex items-center gap-1 text-xs font-medium"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditingTags(false)}
                                                className="text-xs text-gray-500 hover:text-navy-700 px-2 py-1"
                                                disabled={savingTags}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveTags}
                                                className="text-xs bg-accent-500 text-white px-3 py-1 rounded-lg hover:bg-accent-600 flex items-center gap-1 shadow-sm"
                                                disabled={savingTags}
                                            >
                                                {savingTags && <Loader2 className="w-3 h-3 animate-spin" />}
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isEditingTags ? (
                                    <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-2 border border-clay-border">
                                        {availableTags.length === 0 ? (
                                            <p className="text-xs text-gray-500 col-span-2 text-center py-2">
                                                No lists available. Create one in the sidebar.
                                            </p>
                                        ) : (
                                            availableTags.map(tag => (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => toggleTag(tag.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedTagIds.has(tag.id)
                                                        ? 'bg-white text-navy-700 shadow-sm'
                                                        : 'hover:bg-white text-gray-600'
                                                        }`}
                                                >
                                                    <div
                                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedTagIds.has(tag.id)
                                                            ? 'bg-accent-500 border-accent-500'
                                                            : 'border-gray-300'
                                                            }`}
                                                    >
                                                        {selectedTagIds.has(tag.id) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                                    <span className="truncate">{tag.name}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {contact.tags && contact.tags.length > 0 ? (
                                            contact.tags.map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                                    style={{ backgroundColor: `${tag.color}20`, border: `1px solid ${tag.color}40`, color: tag.color }}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                                    {tag.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No tags assigned</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FullScreenImageViewer
                src={contact.card_image_url}
                alt={`Business Card - ${contact.name}`}
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
            />
        </Modal>
    );
}
