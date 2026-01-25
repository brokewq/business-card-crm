'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    Users,
    Building2,
    Camera,
} from 'lucide-react';

interface MobileNavProps {
    userEmail: string;
}

export function MobileNav({ userEmail }: MobileNavProps) {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-clay-border pb-safe shadow-clay-lg">
            <div className="grid grid-cols-3 items-end py-2">
                {/* Contacts */}
                <Link
                    href="/contacts"
                    className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors group ${pathname === '/contacts' || pathname.startsWith('/contacts/')
                        ? 'text-navy-800'
                        : 'text-gray-500 hover:text-navy-700'
                        }`}
                >
                    : 'text-gray-500 hover:text-navy-700'
                        }`}
                >
                    <Users
                        className={`w-6 h-6 mb-1 transition-all ${pathname === '/contacts' ? 'text-accent-500 fill-accent-50 drop-shadow-sm' : 'text-gray-400 group-hover:text-navy-700'}`}
                        strokeWidth={pathname === '/contacts' ? 2.5 : 2}
                    />
                    <span className={`text-[10px] font-bold ${pathname === '/contacts' ? 'text-navy-800' : 'text-gray-500'}`}>Contacts</span>
                </Link>

                {/* Scan - Center */}
                <Link
                    href="/scan"
                    className="flex flex-col items-center group -mt-8"
                >
                    <div className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center shadow-clay-lg transition-transform duration-300 group-active:scale-95 ${pathname === '/scan'
                        ? 'bg-gradient-to-br from-accent-400 to-accent-600 ring-4 ring-accent-100 shadow-glow-orange'
                        : 'bg-gradient-to-br from-navy-800 to-navy-900 ring-4 ring-white shadow-clay'
                        }`}>
                        <Camera className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2} />
                    </div>
                    <span className={`text-[10px] font-bold ${pathname === '/scan' ? 'text-accent-600' : 'text-gray-500'}`}>
                        Scan
                    </span>
                </Link>

                {/* Companies */}
                <Link
                    href="/companies"
                    className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors group ${pathname === '/companies' || pathname.startsWith('/companies/')
                        ? 'text-navy-800'
                        : 'text-gray-500 hover:text-navy-700'
                        }`}
                >
                    : 'text-gray-500 hover:text-navy-700'
                        }`}
                >
                    <Building2
                        className={`w-6 h-6 mb-1 transition-all ${pathname === '/companies' ? 'text-accent-500 fill-accent-50 drop-shadow-sm' : 'text-gray-400 group-hover:text-navy-700'}`}
                        strokeWidth={pathname === '/companies' ? 2.5 : 2}
                    />
                    <span className={`text-[10px] font-bold ${pathname === '/companies' ? 'text-navy-800' : 'text-gray-500'}`}>Companies</span>
                </Link>
            </div>
        </nav>
    );
}
