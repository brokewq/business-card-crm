'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const TAG_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#64748b',
];

interface CreateTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTagCreated: () => void;
}

export function CreateTagModal({ isOpen, onClose, onTagCreated }: CreateTagModalProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(TAG_COLORS[0]);
    const [loading, setLoading] = useState(false);
    const { showToast, ToastContainer } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), color }),
            });

            if (response.ok) {
                showToast('List created successfully', 'success');
                setName('');
                setColor(TAG_COLORS[0]);
                onTagCreated();
                setTimeout(onClose, 500);
            } else {
                showToast('Failed to create list', 'error');
            }
        } catch (error) {
            showToast('Failed to create list', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New List">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                        List Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Leads, Friends"
                        className="input w-full"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                        Color Tag
                    </label>
                    <div className="flex gap-3 flex-wrap">
                        {TAG_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-full transition-all ${color === c
                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-white scale-110 shadow-md'
                                    : 'hover:scale-105'
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !name.trim()}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Create List
                    </button>
                </div>
            </form>
            <ToastContainer />
        </Modal>
    );
}
