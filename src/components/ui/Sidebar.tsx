'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Users,
    Building2,
    Camera,
    Settings,
    LogOut,
    Sparkles,
    Tags,
} from 'lucide-react';

interface SidebarProps {
    userEmail: string;
}

const navItems = [
    { href: '/contacts', icon: Users, label: 'Contacts' },
    { href: '/companies', icon: Building2, label: 'Companies' },
    { href: '/scan', icon: Camera, label: 'Scan Card' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ userEmail }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <aside className="sidebar">
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="p-6 border-b border-dark-700/50">
                    <Link href="/contacts" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-white">CardCRM</h1>
                            <p className="text-xs text-dark-400">Business Cards</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-dark-700/50">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-dark-300">
                                {userEmail.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-200 truncate">{userEmail}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
