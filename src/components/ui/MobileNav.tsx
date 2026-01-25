'use client';

import Link from 'next/link';
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

    const isContactsActive = pathname === '/contacts' || pathname.startsWith('/contacts/');
    const isCompaniesActive = pathname === '/companies' || pathname.startsWith('/companies/');
    const isScanActive = pathname === '/scan';

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-clay-border pb-safe shadow-clay-lg">
            <div className="grid grid-cols-3 items-end py-1">
                {/* Contacts */}
                <Link
                    href="/contacts"
                    className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors group ${isContactsActive
                        ? 'text-navy-800'
                        : 'text-gray-500 hover:text-navy-700'
                        }`}
                >
                    <div className="w-11 h-11 mb-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/icons/contacts-icon.png"
                            alt="Contacts"
                            className={`w-full h-full object-contain transition-opacity duration-300 ${isContactsActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                        />
                    </div>
                    <span className={`text-[10px] font-bold ${isContactsActive ? 'text-navy-800' : 'text-gray-500'}`}>Contacts</span>
                </Link>

                {/* Scan - Center */}
                <Link
                    href="/scan"
                    className="flex flex-col items-center group -mt-10"
                >
                    <div className={`w-20 h-20 mb-0 flex items-center justify-center transition-transform duration-300 group-active:scale-95`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/icons/scan-icon.png"
                            alt="Scan"
                            className={`w-full h-full object-contain ${isScanActive ? 'brightness-110 drop-shadow-glow-orange' : 'brightness-100'}`}
                        />
                    </div>
                    <span className={`text-[10px] font-bold -mt-2 ${isScanActive ? 'text-accent-600' : 'text-gray-500'}`}>
                        Scan
                    </span>
                </Link>

                {/* Companies */}
                <Link
                    href="/companies"
                    className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors group ${isCompaniesActive
                        ? 'text-navy-800'
                        : 'text-gray-500 hover:text-navy-700'
                        }`}
                >
                    <div className="w-11 h-11 mb-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/icons/companies-icon.png"
                            alt="Companies"
                            className={`w-full h-full object-contain transition-opacity duration-300 ${isCompaniesActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                        />
                    </div>
                    <span className={`text-[10px] font-bold ${isCompaniesActive ? 'text-navy-800' : 'text-gray-500'}`}>Companies</span>
                </Link>
            </div>
        </nav>
    );
}
