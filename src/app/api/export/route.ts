import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { contactIds, exportAll, tagId, search } = await request.json();

        let query = supabase
            .from('contacts')
            .select(`
        name,
        designation,
        email,
        phone,
        address,
        website,
        source,
        industry,
        referral_details,
        company:companies(name),
        created_at
      `)
            .eq('user_id', user.id);

        if (contactIds && contactIds.length > 0 && !exportAll) {
            query = query.in('id', contactIds);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,designation.ilike.%${search}%`);
        }

        const { data: contacts, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Filter by tag if needed
        let filteredContacts = contacts || [];
        if (tagId && exportAll) {
            // Need to fetch tag associations
            const { data: taggedIds } = await supabase
                .from('contact_tags')
                .select('contact_id')
                .eq('tag_id', tagId);

            const taggedIdSet = new Set(taggedIds?.map((t) => t.contact_id) || []);
            filteredContacts = filteredContacts.filter((c: any) => taggedIdSet.has(c.id));
        }

        // Transform data for Excel
        const excelData = filteredContacts.map((contact: any) => ({
            Name: contact.name,
            Designation: contact.designation || '',
            Company: contact.company?.name || '',
            Email: Array.isArray(contact.email) ? contact.email.join(', ') : '',
            Phone: Array.isArray(contact.phone) ? contact.phone.join(', ') : '',
            Address: contact.address || '',
            Website: contact.website || '',
            Source: contact.source || '',
            Industry: contact.industry || '',
            'Referral Details': contact.referral_details || '',
            'Created At': new Date(contact.created_at).toLocaleDateString(),
        }));

        // Create workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

        // Set column widths
        worksheet['!cols'] = [
            { wch: 25 }, // Name
            { wch: 20 }, // Designation
            { wch: 25 }, // Company
            { wch: 30 }, // Email
            { wch: 20 }, // Phone
            { wch: 40 }, // Address
            { wch: 25 }, // Website
            { wch: 15 }, // Source
            { wch: 15 }, // Industry
            { wch: 30 }, // Referral Details
            { wch: 15 }, // Created At
        ];

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="contacts-${Date.now()}.xlsx"`,
            },
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export contacts' }, { status: 500 });
    }
}
