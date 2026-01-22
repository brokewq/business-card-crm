import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface Company {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    description: string | null;
    address: string | null;
    email: string | null;
    contacts: { count: number }[];
}

export function useCompany(id: string) {
    const { data, error, isLoading, mutate } = useSWR<Company>(
        id ? `/api/companies/${id}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    return {
        company: data,
        isLoading,
        isError: error,
        mutate,
    };
}
