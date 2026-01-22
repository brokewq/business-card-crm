import { Contact, Tag } from '@/types';
import { Modal } from '@/components/ui/Modal';
import {
    X,
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Briefcase,
    Copy,
    Check,
    Image as ImageIcon,
    Edit2,
    Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';

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

    const CopyButton = ({ text, field }: { text: string; field: string }) => (
        <button
            onClick={() => copyToClipboard(text, field)}
            className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
            title="Copy to clipboard"
        >
            {copiedField === field ? (
                <Check className="w-4 h-4 text-green-400" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <div className="bg-dark-800 rounded-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-dark-800/95 backdrop-blur-sm border-b border-dark-700 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Contact Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Column: Image & Basic Info */}
                        <div className="lg:w-1/3 space-y-6">
                            {/* Card Image */}
                            {contact.card_image_url ? (
                                <div className="rounded-xl overflow-hidden bg-dark-900 border border-dark-700/50">
                                    <img
                                        src={contact.card_image_url}
                                        alt="Business Card"
                                        className="w-full object-contain max-h-48 lg:max-h-64"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-32 rounded-xl bg-dark-900 border border-dark-700/50 flex items-center justify-center text-dark-500 text-sm italic">
                                    No card image
                                </div>
                            )}

                            {/* Name & Title (Mobile/Left Column) */}
                            <div className="text-center lg:text-left pb-4 border-b border-dark-700">
                                <h3 className="text-2xl font-bold text-white">{contact.name}</h3>
                                {contact.designation && (
                                    <p className="text-primary-400 mt-1">{contact.designation}</p>
                                )}
                                {contact.company && (
                                    <div className="flex items-center justify-center lg:justify-start gap-2 mt-2 text-dark-300">
                                        <Building2 className="w-4 h-4" />
                                        <span>{contact.company.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Created Date */}
                            <div className="text-center lg:text-left text-dark-500 text-sm">
                                Added on {new Date(contact.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="flex-1 space-y-6 lg:border-l lg:border-dark-700 lg:pl-6">
                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm text-dark-400 uppercase tracking-wider font-semibold">Contact Information</h4>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    {/* Phones */}
                                    {contact.phone && contact.phone.map((phone, idx) => (
                                        <div key={`phone-${idx}`} className="flex items-center justify-between bg-dark-900 rounded-xl p-4 border border-dark-700/50">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                                <span className="text-white break-all">{phone}</span>
                                            </div>
                                            <CopyButton text={phone} field={`phone-${idx}`} />
                                        </div>
                                    ))}

                                    {/* Emails */}
                                    {contact.email && contact.email.map((email, idx) => (
                                        <div key={`email-${idx}`} className="flex items-center justify-between bg-dark-900 rounded-xl p-4 border border-dark-700/50 sm:col-span-2 xl:col-span-1">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                                <a href={`mailto:${email}`} className="text-white break-all hover:text-primary-400 transition-colors">{email}</a>
                                            </div>
                                            <CopyButton text={email} field={`email-${idx}`} />
                                        </div>
                                    ))}

                                    {/* Website */}
                                    {contact.website && (
                                        <div className="flex items-center justify-between bg-dark-900 rounded-xl p-4 border border-dark-700/50 sm:col-span-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Globe className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-white break-all hover:text-primary-400 transition-colors">{contact.website}</a>
                                            </div>
                                            <CopyButton text={contact.website} field="website" />
                                        </div>
                                    )}

                                    {/* Address */}
                                    {contact.address && (
                                        <div className="flex items-center justify-between bg-dark-900 rounded-xl p-4 border border-dark-700/50 sm:col-span-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                                <span className="text-white break-words">{contact.address}</span>
                                            </div>
                                            <CopyButton text={contact.address} field="address" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Info */}
                            {contact.additional_details && (
                                <div className="space-y-2">
                                    <label className="text-xs text-dark-400 uppercase tracking-wider">Notes</label>
                                    <div className="bg-dark-900 rounded-xl p-4 border border-dark-700/50">
                                        <p className="text-dark-200 whitespace-pre-wrap">{contact.additional_details}</p>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="pt-4 border-t border-dark-700">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-dark-400 uppercase tracking-wider">Lists (Tags)</label>
                                    {!isEditingTags ? (
                                        <button
                                            onClick={() => setIsEditingTags(true)}
                                            className="p-1 rounded-lg hover:bg-dark-700 text-primary-400 transition-colors flex items-center gap-1 text-xs font-medium"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditingTags(false)}
                                                className="text-xs text-dark-400 hover:text-white px-2 py-1"
                                                disabled={savingTags}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveTags}
                                                className="text-xs bg-primary-500 text-white px-2 py-1 rounded hover:bg-primary-600 flex items-center gap-1"
                                                disabled={savingTags}
                                            >
                                                {savingTags && <Loader2 className="w-3 h-3 animate-spin" />}
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isEditingTags ? (
                                    <div className="bg-dark-900 rounded-xl p-3 grid grid-cols-2 gap-2 border border-dark-700/50">
                                        {availableTags.length === 0 ? (
                                            <p className="text-xs text-dark-400 col-span-2 text-center py-2">
                                                No lists available. Create one in the sidebar.
                                            </p>
                                        ) : (
                                            availableTags.map(tag => (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => toggleTag(tag.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedTagIds.has(tag.id)
                                                        ? 'bg-dark-700 text-white'
                                                        : 'hover:bg-dark-800 text-dark-300'
                                                        }`}
                                                >
                                                    <div
                                                        className={`w-4 h-4 rounded border flex items-center justify-center ${selectedTagIds.has(tag.id)
                                                            ? 'bg-primary-500 border-primary-500'
                                                            : 'border-dark-600'
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
                                                    className="px-3 py-1 rounded-full text-white text-sm flex items-center gap-2"
                                                    style={{ backgroundColor: `${tag.color}20`, border: `1px solid ${tag.color}40`, color: tag.color }}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                                    {tag.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-dark-500 italic">No tags assigned</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
