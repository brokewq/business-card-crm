import useSWR from 'swr';
import { Tag } from '@/types';
import { fetcher } from '@/lib/fetcher';

export function useTags() {
    const { data, error, isLoading, mutate } = useSWR<Tag[]>('/api/tags', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000, // Tags change rarely, cache for 1 minute
    });

    return {
        tags: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}
