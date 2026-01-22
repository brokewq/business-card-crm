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
        icon: "/icons/icon-192.png",
        apple: "/icons/icon-192.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#0ea5e9",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
            <body className="min-h-screen bg-dark-900 text-dark-50 antialiased">
                <KeyboardShortcuts />
                {children}
            </body>
        </html>
    );
}
