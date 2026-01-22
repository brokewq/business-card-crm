-- Business Card CRM Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  description TEXT,
  industry TEXT,
  address TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for domain-based matching
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(user_id, domain);
CREATE INDEX IF NOT EXISTS idx_companies_user ON companies(user_id);

-- ============================================
-- CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  designation TEXT,
  email JSONB DEFAULT '[]'::jsonb,
  phone JSONB DEFAULT '[]'::jsonb,
  address TEXT,
  website TEXT,
  source TEXT,
  referral_details TEXT,
  industry TEXT,
  card_image_url TEXT,
  additional_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);

-- ============================================
-- CONTACT_TAGS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_tags (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);

-- ============================================
-- USER_SETTINGS (Custom Dropdowns)
-- ============================================
CREATE TYPE setting_type AS ENUM ('INDUSTRY', 'SOURCE');

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_type setting_type NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(user_id, setting_type, value)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view own companies" ON companies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies" ON companies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own companies" ON companies
  FOR DELETE USING (auth.uid() = user_id);

-- Contacts policies
CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);

-- Contact_tags policies (check ownership via contacts)
CREATE POLICY "Users can view own contact_tags" ON contact_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM contacts WHERE id = contact_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert own contact_tags" ON contact_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM contacts WHERE id = contact_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own contact_tags" ON contact_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM contacts WHERE id = contact_id AND user_id = auth.uid())
  );

-- User_settings policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET FOR CARD IMAGES
-- ============================================
-- Run this in Supabase Dashboard > Storage > Create bucket

-- Create a bucket named 'card-images' with public access for reading
-- In Supabase Dashboard, create bucket with:
-- Name: card-images
-- Public: true (for easy image display)

-- Storage policies (run in SQL editor):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('card-images', 'card-images', true);

-- CREATE POLICY "Users can upload card images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'card-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Anyone can view card images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'card-images');

-- CREATE POLICY "Users can delete own card images" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'card-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
