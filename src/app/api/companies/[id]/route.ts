import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: company, error } = await supabase
            .from('companies')
            .select(`
                *,
                contacts:contacts(count)
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error fetching company:', error);
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
    }
}
