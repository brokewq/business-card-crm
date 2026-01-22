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
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <TagIcon className="w-5 h-5 text-primary-400" />
                    Lists
                </h3>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors"
                >
                    {isCreating ? (
                        <X className="w-5 h-5 text-dark-400" />
                    ) : (
                        <Plus className="w-5 h-5 text-dark-400" />
                    )}
                </button>
            </div>

            {/* Create new tag */}
            {isCreating && (
                <div className="mb-4 p-3 bg-dark-800 rounded-xl space-y-3">
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
                                className={`w-6 h-6 rounded-full transition-transform ${newTagColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800 scale-110' : ''
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
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-dark-300 hover:bg-dark-800'
                    }`}
            >
                <div className="w-3 h-3 rounded-full bg-dark-500" />
                All Contacts
            </button>

            {/* Tags list */}
            <div className="mt-2 space-y-1">
                {tags.map((tag) => (
                    <button
                        key={tag.id}
                        onClick={() => onSelectTag(tag.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${selectedTag === tag.id
                                ? 'bg-primary-500/10 text-primary-400'
                                : 'text-dark-300 hover:bg-dark-800'
                            }`}
                    >
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                        />
                        <span className="flex-1 text-left truncate">{tag.name}</span>
                        <button
                            onClick={(e) => handleDelete(tag.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                    </button>
                ))}
            </div>

            {tags.length === 0 && !isCreating && (
                <p className="text-dark-500 text-sm text-center py-4">
                    No tags yet. Create one to organize your contacts.
                </p>
            )}
        </div>
    );
}
