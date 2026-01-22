import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_INDUSTRIES, DEFAULT_SOURCES } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: customSettings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Merge defaults with custom settings
        const customIndustries = customSettings
            ?.filter((s) => s.setting_type === 'INDUSTRY')
            .map((s) => s.value) || [];

        const customSources = customSettings
            ?.filter((s) => s.setting_type === 'SOURCE')
            .map((s) => s.value) || [];

        const industries = [...DEFAULT_INDUSTRIES, ...customIndustries];
        const sources = [...DEFAULT_SOURCES, ...customSources];

        return NextResponse.json({
            industries: Array.from(new Set(industries)),
            sources: Array.from(new Set(sources)),
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { setting_type, value } = await request.json();

        if (!setting_type || !value) {
            return NextResponse.json({ error: 'Type and value are required' }, { status: 400 });
        }

        if (!['INDUSTRY', 'SOURCE'].includes(setting_type)) {
            return NextResponse.json({ error: 'Invalid setting type' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('user_settings')
            .insert({
                user_id: user.id,
                setting_type,
                value,
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                // Already exists, just return success
                return NextResponse.json({ success: true });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
    }
}
