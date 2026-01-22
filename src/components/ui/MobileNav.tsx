'use client';

import { useState } from 'react';
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
    Menu,
    X,
} from 'lucide-react';

interface MobileNavProps {
    userEmail: string;
}

const navItems = [
    { href: '/contacts', icon: Users, label: 'Contacts' },
    { href: '/companies', icon: Building2, label: 'Companies' },
    { href: '/scan', icon: Camera, label: 'Scan Card' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav({ userEmail }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-900/95 backdrop-blur-lg border-t border-dark-700/50 pb-safe">
            <div className="grid grid-cols-3 items-end py-2">
                {/* Contacts */}
                <Link
                    href="/contacts"
                    className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${pathname === '/contacts' || pathname.startsWith('/contacts/')
                        ? 'text-primary-400'
                        : 'text-dark-400 hover:text-dark-200'
                        }`}
                >
                    <Users className="w-6 h-6" />
                    <span className="text-xs mt-1">Contacts</span>
                </Link>

                {/* Scan - Center */}
                <Link
                    href="/scan"
                    className="flex flex-col items-center group -mt-8"
                >
                    <div className={`w-14 h-14 mb-1 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-active:scale-95 ${pathname === '/scan'
                        ? 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-primary-500/30'
                        : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/20'
                        }`}>
                        <Camera className="w-7 h-7 text-white" />
                    </div>
                    <span className={`text-xs ${pathname === '/scan' ? 'text-primary-400' : 'text-dark-400'}`}>
                        Scan
                    </span>
                </Link>

                {/* Companies */}
                <Link
                    href="/companies"
                    className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${pathname === '/companies' || pathname.startsWith('/companies/')
                            ? 'text-primary-400'
                            : 'text-dark-400 hover:text-dark-200'
                        }`}
                >
                    <Building2 className="w-6 h-6" />
                    <span className="text-xs mt-1">Companies</span>
                </Link>
            </div>
        </nav>
    );
}
