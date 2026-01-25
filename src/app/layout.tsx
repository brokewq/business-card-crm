import type { Metadata, Viewport } from "next";
import "./globals.css";
import { KeyboardShortcuts } from '@/components/ui/KeyboardShortcuts';

export const metadata: Metadata = {
    title: "Business Card CRM",
    description: "Scan business cards and manage contacts with AI-powered OCR",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "CardCRM",
    },
    icons: {
        icon: "/icons/logo.png",
        apple: "/icons/logo.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#F4F7FA",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    // Prevents content from being hidden behind virtual keyboard
    interactiveWidget: 'resizes-content',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="min-h-screen bg-clay-bg text-navy-900 antialiased overflow-x-hidden selection:bg-accent-200 selection:text-navy-900">
                <KeyboardShortcuts />
                {children}
            </body>
        </html>
    );
}
