'use client';

import { useState, useRef, useEffect } from 'react';
import { Tag } from '@/types';
import { Plus, Tag as TagIcon, Trash2, X, ChevronDown, ListFilter } from 'lucide-react';

interface ListsFilterProps {
    tags: Tag[];
    selectedTag: string | null;
    onSelectTag: (tagId: string | null) => void;
    onTagsChange: () => void;
}

const TAG_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#64748b',
];

export function ListsFilter({
    tags,
    selectedTag,
    onSelectTag,
    onTagsChange,
}: ListsFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsCreating(false); // Reset creating state on close too
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleSelect = (tagId: string | null) => {
        onSelectTag(tagId);
        setIsOpen(false); // Auto-close
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${isOpen || selectedTag
                        ? 'bg-white border-accent-200 text-accent-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
            >
                <ListFilter className="w-5 h-5" />
                <span className="font-medium">Lists / Filters</span>
                {selectedTag && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-100 text-accent-700 text-xs">
                        1
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between p-2 mb-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">My Lists</span>
                        <button
                            onClick={() => setIsCreating(!isCreating)}
                            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-600 transition-colors"
                            title="Create new list"
                        >
                            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Create new tag form */}
                    {isCreating && (
                        <div className="p-2 mb-2 bg-gray-50 rounded-lg space-y-2 border border-gray-100">
                            <input
                                type="text"
                                placeholder="List name"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                className="input py-1.5 text-sm bg-white"
                                autoFocus
                            />
                            <div className="flex gap-1.5 flex-wrap">
                                {TAG_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewTagColor(color)}
                                        className={`w-5 h-5 rounded-full transition-transform ${newTagColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-50 scale-110' : ''
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleCreate}
                                disabled={loading || !newTagName.trim()}
                                className="btn btn-primary w-full py-1.5 text-xs"
                            >
                                Create List
                            </button>
                        </div>
                    )}

                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                        {/* All Contacts Option */}
                        <button
                            onClick={() => handleSelect(null)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${!selectedTag
                                ? 'bg-accent-50 text-accent-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                            All Contacts
                        </button>

                        {/* Tag List */}
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => handleSelect(tag.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm ${selectedTag === tag.id
                                    ? 'bg-accent-50 text-accent-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: tag.color }}
                                />
                                <span className="flex-1 text-left truncate">{tag.name}</span>
                                <div
                                    role="button"
                                    onClick={(e) => handleDelete(tag.id, e)}
                                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all text-gray-400"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </div>
                            </button>
                        ))}

                        {tags.length === 0 && !isCreating && (
                            <div className="px-3 py-4 text-center text-xs text-gray-400">
                                No lists created yet
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
