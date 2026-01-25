import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/ui/Sidebar';
import { MobileNav } from '@/components/ui/MobileNav';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="flex h-[100dvh] bg-clay-bg overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0 overflow-y-auto border-r border-clay-border">
                <Sidebar userEmail={user.email || ''} />
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden absolute inset-x-0 bottom-0 z-50">
                <MobileNav userEmail={user.email || ''} />
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
                <div className="p-4 lg:p-8 pb-24 lg:pb-8 w-full max-w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
