import useSWR from 'swr';
import { Contact } from '@/types';
import { fetcher } from '@/lib/fetcher';

export function useContacts(tagId: string | null, searchQuery: string, companyId?: string) {
    // Construct the query string key for SWR
    // If tagId or searchQuery changes, the key changes, triggering a re-fetch (or cache lookup)
    const params = new URLSearchParams();
    if (tagId) params.set('tagId', tagId);
    if (companyId) params.set('companyId', companyId);
    if (searchQuery) params.set('search', searchQuery);

    const key = `/api/contacts?${params.toString()}`;

    const { data, error, isLoading, mutate } = useSWR<Contact[]>(key, fetcher, {
        revalidateOnFocus: false, // Don't revalidate every time window gets focus (optional, usually good to have false for less jitter)
        dedupingInterval: 5000,   // Cache for 5 seconds locally before verifying with server
    });

    return {
        contacts: data || [],
        isLoading,
        isError: error,
        mutate, // Function to manually trigger a re-fetch/update
    };
}
