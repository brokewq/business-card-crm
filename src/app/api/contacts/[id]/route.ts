
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPrimaryDomain } from '@/lib/domain-utils';

function normalizeUrl(url: string | null | undefined): string | null {
    if (!url || url.trim() === '') return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    return `https://${trimmed}`;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
            company_name,
            company_description,
            tag_ids, // Array of tag IDs to SET (replaces existing)
            additional_details
        } = body;

        const contactId = params.id;

        // 1. Update basic contact fields
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (designation !== undefined) updateData.designation = designation;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (website !== undefined) updateData.website = normalizeUrl(website);
        if (additional_details !== undefined) updateData.additional_details = additional_details;

        // 1.5 Handle Company Update
        if (company_name !== undefined) {
            let companyId: string | null = null;
            const domain = getPrimaryDomain(website || updateData.website, email || updateData.email);

            if (company_name === '') {
                updateData.company_id = null;
            } else {
                // Check if company exists
                let query = supabase
                    .from('companies')
                    .select('id')
                    .eq('user_id', user.id);

                if (domain) {
                    query = query.eq('domain', domain);
                } else {
                    query = query.ilike('name', company_name);
                }

                const { data: existingCompany } = await query.maybeSingle();

                if (existingCompany) {
                    companyId = existingCompany.id;
                } else {
                    // Create new company
                    const { data: newCompany, error: createCompanyError } = await supabase
                        .from('companies')
                        .insert({
                            user_id: user.id,
                            name: company_name,
                            domain: domain,
                            description: company_description, // Optional: might want to allow updating this too
                        })
                        .select('id')
                        .single();

                    if (createCompanyError) {
                        console.error('Error creating company:', createCompanyError);
                        // Fallback or error? Let's log and ignore or return error. 
                        // For now, return error to be safe.
                        return NextResponse.json({ error: "Failed to create new company" }, { status: 500 });
                    }
                    companyId = newCompany.id;
                }
                updateData.company_id = companyId;
            }
        }

        if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
                .from('contacts')
                .update(updateData)
                .eq('id', contactId)
                .eq('user_id', user.id);

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }
        }

        // 2. Update tags if provided
        if (tag_ids !== undefined) {
            // First delete existing tags
            const { error: deleteTagsError } = await supabase
                .from('contact_tags')
                .delete()
                .eq('contact_id', contactId);

            if (deleteTagsError) {
                return NextResponse.json({ error: "Failed to clear existing tags" }, { status: 500 });
            }

            // Then insert new ones
            if (Array.isArray(tag_ids) && tag_ids.length > 0) {
                const tagInserts = tag_ids.map((tagId: string) => ({
                    contact_id: contactId,
                    tag_id: tagId,
                }));

                const { error: insertTagsError } = await supabase
                    .from('contact_tags')
                    .insert(tagInserts);

                if (insertTagsError) {
                    return NextResponse.json({ error: "Failed to update tags" }, { status: 500 });
                }
            }
        }

        // 3. Fetch updated contact with tags and company
        const { data: updatedContact, error: fetchError } = await supabase
            .from('contacts')
            .select(`
                *,
                company:companies(id, name, domain),
                tags:contact_tags(tag:tags(id, name, color))
            `)
            .eq('id', contactId)
            .single();

        if (fetchError) {
            return NextResponse.json({ error: "Failed to fetch updated contact" }, { status: 500 });
        }

        // Transform for frontend
        const transformedContact = {
            ...updatedContact,
            tags: updatedContact.tags?.map((t: any) => t.tag).filter(Boolean) || [],
        };

        return NextResponse.json(transformedContact);

    } catch (error) {
        console.error('Error updating contact:', error);
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
}
