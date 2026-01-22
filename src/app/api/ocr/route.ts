import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processMultipleCards } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const frontImage = formData.get('frontImage') as string;
        const backImage = formData.get('backImage') as string | null;
        const mimeType = formData.get('mimeType') as string || 'image/jpeg';

        if (!frontImage) {
            return NextResponse.json({ error: 'Front image is required' }, { status: 400 });
        }

        // Process with Gemini AI
        const result = await processMultipleCards(
            frontImage,
            backImage || undefined,
            mimeType
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('OCR Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'OCR processing failed' },
            { status: 500 }
        );
    }
}
