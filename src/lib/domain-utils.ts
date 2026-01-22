/**
 * Domain utility functions for company auto-linking
 */

/**
 * Extract domain from a URL or email address
 * @param input - URL (e.g., "https://www.google.com/path") or email (e.g., "user@google.com")
 * @returns Cleaned domain (e.g., "google.com") or null if invalid
 */
export function extractDomain(input: string | null | undefined): string | null {
    if (!input || typeof input !== 'string') return null;

    let domain = input.trim().toLowerCase();

    // Handle email addresses
    if (domain.includes('@')) {
        const parts = domain.split('@');
        domain = parts[parts.length - 1];
    } else {
        // Handle URLs
        // Remove protocol
        domain = domain.replace(/^https?:\/\//, '');
        // Remove www.
        domain = domain.replace(/^www\./, '');
        // Remove path and query string
        domain = domain.split('/')[0];
        domain = domain.split('?')[0];
        domain = domain.split('#')[0];
    }

    // Validate domain format
    if (!domain || !domain.includes('.')) return null;

    // Remove trailing dots
    domain = domain.replace(/\.+$/, '');

    // Basic domain validation
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
    if (!domainRegex.test(domain)) return null;

    return domain;
}

/**
 * Get the primary domain from a contact's website or email
 * Prefers website over email for domain extraction
 */
export function getPrimaryDomain(
    website: string | null | undefined,
    emails: string[] | null | undefined
): string | null {
    // Try website first
    const websiteDomain = extractDomain(website);
    if (websiteDomain) return websiteDomain;

    // Fall back to first email domain
    if (emails && emails.length > 0) {
        for (const email of emails) {
            const emailDomain = extractDomain(email);
            if (emailDomain) return emailDomain;
        }
    }

    return null;
}
