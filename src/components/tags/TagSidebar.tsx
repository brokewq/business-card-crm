'use client';

import { useState } from 'react';
import { Tag } from '@/types';
import { Plus, Tag as TagIcon, Trash2, X } from 'lucide-react';

interface TagSidebarProps {
    tags: Tag[];
    selectedTag: string | null;
    onSelectTag: (tagId: string | null) => void;
    onTagsChange: () => void;
}

const TAG_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#64748b',
];

export function TagSidebar({
    tags,
    selectedTag,
    onSelectTag,
    onTagsChange,
}: TagSidebarProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!newTagName.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
            });

            if (response.ok) {
                setNewTagName('');
                setIsCreating(false);
                onTagsChange();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (tagId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this tag?')) return;

        try {
            const response = await fetch('/api/tags', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tagId }),
            });

            if (response.ok) {
                if (selectedTag === tagId) {
                    onSelectTag(null);
                }
                onTagsChange();
            }
        } catch (error) {
            console.error('Failed to delete tag');
        }
    };

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                    <TagIcon className="w-5 h-5 text-accent-500" />
                    Lists
                </h3>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    {isCreating ? (
                        <X className="w-5 h-5 text-gray-500" />
                    ) : (
                        <Plus className="w-5 h-5 text-gray-500" />
                    )}
                </button>
            </div>

            {/* Create new tag */}
            {isCreating && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl space-y-3 border border-clay-border">
                    <input
                        type="text"
                        placeholder="Tag name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="input py-2 text-sm"
                        autoFocus
                    />
                    <div className="flex gap-1.5 flex-wrap">
                        {TAG_COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => setNewTagColor(color)}
                                className={`w-6 h-6 rounded-full transition-transform ${newTagColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-50 scale-110' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={loading || !newTagName.trim()}
                        className="btn btn-primary w-full py-2 text-sm"
                    >
                        Create Tag
                    </button>
                </div>
            )}

            {/* All contacts */}
            <button
                onClick={() => onSelectTag(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${!selectedTag
                    ? 'bg-accent-50 text-accent-600 border border-accent-200'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
            >
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                All Contacts
            </button>

            {/* Tags list */}
            <div className="mt-2 space-y-1">
                {tags.map((tag) => (
                    <button
                        key={tag.id}
                        onClick={() => onSelectTag(tag.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${selectedTag === tag.id
                            ? 'bg-accent-50 text-accent-600 border border-accent-200'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                        />
                        <span className="flex-1 text-left truncate">{tag.name}</span>
                        <button
                            onClick={(e) => handleDelete(tag.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                    </button>
                ))}
            </div>

            {tags.length === 0 && !isCreating && (
                <p className="text-gray-400 text-sm text-center py-4">
                    No tags yet. Create one to organize your contacts.
                </p>
            )}
        </div>
    );
}
