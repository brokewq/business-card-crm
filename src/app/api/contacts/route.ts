import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPrimaryDomain } from '@/lib/domain-utils';

/**
 * Normalize URL - prepend https:// if missing protocol
 */
function normalizeUrl(url: string | null | undefined): string | null {
    if (!url || url.trim() === '') return null;

    const trimmed = url.trim();
    // If already has protocol, return as-is
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    // Prepend https://
    return `https://${trimmed}`;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const tagId = searchParams.get('tagId');
        const companyId = searchParams.get('companyId');
        const search = searchParams.get('search');

        let query = supabase
            .from('contacts')
            .select(`
        *,
        company:companies(id, name, domain),
        tags:contact_tags(tag:tags(id, name, color))
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (search) {
            // Simple search on main table first to narrow down if possible, 
            // but since we need to search joined tables/arrays, it's safer to fetch and filter in memory for this MVP scale.
            // However, to keep it performant, rely on .or() for top-level fields if we want, but let's just fetch all and filter JS-side 
            // OR use a more complex Supabase query.

            // For MVP: Fetch all (paginated in real app, but here simple) and filter.
            // Actually, we can just fetch all for the user and filter.
        }

        const { data: contacts, error } = await query;

        if (error) {
            console.error('Error fetching contacts:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        let filteredContacts = contacts || [];

        // Apply Search and Tag filters in memory
        if (search) {
            const searchLower = search.toLowerCase();
            filteredContacts = filteredContacts.filter((contact: any) => {
                const nameMatch = contact.name?.toLowerCase().includes(searchLower);
                const designationMatch = contact.designation?.toLowerCase().includes(searchLower);
                const companyMatch = contact.company?.name?.toLowerCase().includes(searchLower);

                // Phone is likely an array of strings
                const phoneMatch = Array.isArray(contact.phone)
                    ? contact.phone.some((p: string) => p.includes(searchLower))
                    : contact.phone?.includes(searchLower);

                return nameMatch || designationMatch || companyMatch || phoneMatch;
            });
        }

        if (tagId) {
            filteredContacts = filteredContacts.filter((contact: any) =>
                contact.tags?.some((t: any) => t.tag?.id === tagId)
            );
        }

        if (companyId) {
            filteredContacts = filteredContacts.filter((contact: any) =>
                contact.company_id === companyId
            );
        }

        // Transform the data
        const transformedContacts = filteredContacts.map((contact: any) => ({
            ...contact,
            tags: contact.tags?.map((t: any) => t.tag).filter(Boolean) || [],
        }));

        return NextResponse.json(transformedContacts);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            designation,
            email,
            phone,
            address,
            website,
            source,
            referral_details,
            industry,
            company_name,
            company_description,
            card_image_url,
            additional_details,
            tag_ids,
        } = body;

        // Normalize website URL (prepend https:// if missing)
        const normalizedWebsite = normalizeUrl(website);

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Company auto-linking logic
        let company_id: string | null = null;
        const domain = getPrimaryDomain(website, email);

        if (domain) {
            // Check for existing company with same domain
            const { data: existingCompany } = await supabase
                .from('companies')
                .select('id')
                .eq('user_id', user.id)
                .eq('domain', domain)
                .single();

            if (existingCompany) {
                company_id = existingCompany.id;
            } else {
                // Create new company
                const { data: newCompany, error: companyError } = await supabase
                    .from('companies')
                    .insert({
                        user_id: user.id,
                        name: company_name || 'Unknown Company',
                        domain,
                        description: company_description,
                        industry,
                    })
                    .select('id')
                    .single();

                if (newCompany) {
                    company_id = newCompany.id;
                }
            }
        } else if (company_name) {
            // No domain, create company without domain
            const { data: newCompany } = await supabase
                .from('companies')
                .insert({
                    user_id: user.id,
                    name: company_name,
                    description: company_description,
                    industry,
                })
                .select('id')
                .single();

            if (newCompany) {
                company_id = newCompany.id;
            }
        }

        // Create contact
        const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .insert({
                user_id: user.id,
                company_id,
                name,
                designation,
                email: email || [],
                phone: phone || [],
                address,
                website: normalizedWebsite,
                source,
                referral_details,
                industry,
                card_image_url,
                additional_details,
            })
            .select()
            .single();

        if (contactError) {
            console.error('Error creating contact:', contactError);
            return NextResponse.json({ error: contactError.message }, { status: 500 });
        }

        // Add tags if provided
        if (tag_ids && tag_ids.length > 0) {
            const tagInserts = tag_ids.map((tagId: string) => ({
                contact_id: contact.id,
                tag_id: tagId,
            }));

            await supabase.from('contact_tags').insert(tagInserts);
        }

        return NextResponse.json(contact, { status: 201 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Contact IDs are required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('contacts')
            .delete()
            .in('id', ids)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting contacts:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to delete contacts' }, { status: 500 });
    }
}
