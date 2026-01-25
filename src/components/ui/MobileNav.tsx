'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

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
                    <div className="w-7 h-7 relative mb-1">
                        <Image
                            src="/icons/clay-icon-contacts.png"
                            alt="Contacts"
                            fill
                            className={`object-contain transition-all ${pathname === '/contacts' ? 'scale-110 drop-shadow-md' : 'opacity-80 grayscale-[0.5]'}`}
                        />
                    </div>
                    <span className={`text-[10px] font-bold ${pathname === '/contacts' ? 'text-navy-800' : 'text-gray-500'}`}>Contacts</span>
                </Link>

                {/* Scan - Center */}
                <Link
                    href="/scan"
                    className="flex flex-col items-center group -mt-8"
                >
                    <div className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center shadow-clay-lg transition-transform duration-300 group-active:scale-95 ${pathname === '/scan'
                        ? 'bg-gradient-to-br from-accent-400 to-accent-600 ring-4 ring-accent-100 shadow-glow-orange'
                        : 'bg-white ring-4 ring-white shadow-clay'
                        }`}>
                        <div className="w-10 h-10 relative">
                            <Image
                                src="/icons/clay-icon-scan.png"
                                alt="Scan"
                                fill
                                className="object-contain"
                            />
                        </div>
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
                    <div className="w-7 h-7 relative mb-1">
                        <Image
                            src="/icons/clay-icon-companies.png"
                            alt="Companies"
                            fill
                            className={`object-contain transition-all ${pathname === '/companies' ? 'scale-110 drop-shadow-md' : 'opacity-80 grayscale-[0.5]'}`}
                        />
                    </div>
                    <span className={`text-[10px] font-bold ${pathname === '/companies' ? 'text-navy-800' : 'text-gray-500'}`}>Companies</span>
                </Link>
            </div>
        </nav>
    );
}
