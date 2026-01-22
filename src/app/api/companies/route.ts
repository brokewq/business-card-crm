import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');

        let query = supabase
            .from('companies')
            .select(`
                *,
                contacts:contacts(count)
            `)
            .eq('user_id', user.id)
            .order('name', { ascending: true });

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data: companies, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(companies);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }
}
