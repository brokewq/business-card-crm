// Database Types for Business Card CRM

export interface User {
    id: string;
    email: string;
    created_at: string;
}

export interface Company {
    id: string;
    user_id: string;
    name: string;
    domain: string | null;
    description: string | null;
    industry: string | null;
    address: string | null;
    email: string | null;
    created_at: string;
}

export interface Contact {
    id: string;
    user_id: string;
    company_id: string | null;
    name: string;
    designation: string | null;
    email: string[];
    phone: string[];
    address: string | null;
    website: string | null;
    source: string | null;
    referral_details: string | null;
    industry: string | null;
    card_image_url: string | null;
    additional_details: string | null;
    created_at: string;
    // Joined fields
    company?: Company | null;
    tags?: Tag[];
}

export interface Tag {
    id: string;
    user_id: string;
    name: string;
    color: string;
}

export interface ContactTag {
    contact_id: string;
    tag_id: string;
}

export interface UserSetting {
    id: string;
    user_id: string;
    setting_type: 'INDUSTRY' | 'SOURCE';
    value: string;
}

// API Response Types
export interface OCRResult {
    contact_name: string | null;
    designation: string | null;
    company_name: string | null;
    description: string | null;
    phones: string[];
    emails: string[];
    website: string | null;
    address: string | null;
    industry_guess: string | null;
}

// Form Types
export interface ContactFormData {
    name: string;
    designation: string;
    email: string[];
    phone: string[];
    address: string;
    website: string;
    source: string;
    referral_details: string;
    industry: string;
    company_name: string;
    company_description: string;
    card_image_url: string;
    additional_details: string;
}

// Default options for dropdowns
export const DEFAULT_INDUSTRIES = [
    'Manufacturing',
    'IT',
    'Trading',
    'Healthcare',
    'Retail',
    'Real Estate',
    'Legal',
    'Finance',
    'Education',
    'Other',
] as const;

export const DEFAULT_SOURCES = [
    'BNI',
    'Exhibition',
    'Referral',
    'Cold Call',
    'Website',
    'Social Media',
    'Networking Event',
    'Other',
] as const;
