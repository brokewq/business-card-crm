'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LogOut,
} from 'lucide-react';

interface SidebarProps {
    userEmail: string;
}

const navItems = [
    { href: '/contacts', imageSrc: '/icons/clay-icon-contacts.png', label: 'Contacts' },
    { href: '/companies', imageSrc: '/icons/clay-icon-companies.png', label: 'Companies' },
    { href: '/scan', imageSrc: '/icons/clay-icon-scan.png', label: 'Scan Card' },
    { href: '/settings', imageSrc: '/icons/clay-icon-settings.png', label: 'Settings' },
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
                <div className="p-6 border-b border-clay-border">
                    <Link href="/contacts" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 relative transition-transform group-hover:scale-105">
                            <Image
                                src="/icons/clay-icon-logo.png"
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-navy-800">CardCRM</h1>
                            <p className="text-xs text-gray-500">Business Cards</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link h-12 ${isActive ? 'sidebar-link-active bg-white border-2 border-accent-200 shadow-sm' : ''}`}
                            >
                                <div className="w-6 h-6 relative mr-2">
                                    <Image
                                        src={item.imageSrc}
                                        alt={item.label}
                                        fill
                                        className={`object-contain transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'opacity-80 grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-100'}`}
                                    />
                                </div>
                                <span className={isActive ? 'font-semibold text-navy-800' : 'font-medium'}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-clay-border">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center shadow-clay border-2 border-white">
                            <span className="text-sm font-bold text-white">
                                {userEmail.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-navy-800 truncate">{userEmail}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
