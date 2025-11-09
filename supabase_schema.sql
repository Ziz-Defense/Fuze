-- FUZE Submission Portal - Supabase Schema
-- Run this in Supabase SQL Editor to create the submissions table

CREATE TABLE IF NOT EXISTS submissions (
    id BIGSERIAL PRIMARY KEY,

    -- Company Information
    company_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    company_size TEXT,
    company_type TEXT,

    -- Technology Details
    technology_name TEXT,
    technology_description TEXT,
    detailed_description TEXT,
    technology_category TEXT,
    unique_value_proposition TEXT,
    military_applications TEXT,
    commercial_applications TEXT,

    -- Technical Maturity
    trl_level INTEGER,
    mrl_level INTEGER,
    development_stage TEXT,
    ip_status TEXT,

    -- Team Information
    team_size INTEGER,
    team_expertise TEXT,

    -- Funding Information
    funding_pathway TEXT,
    funding_amount_requested REAL,
    previous_fuze_awards TEXT,
    previous_fuze_amount REAL,
    development_timeline TEXT,

    -- Government Registrations
    sam_gov_registered BOOLEAN,
    dsip_registered BOOLEAN,

    -- Assessment
    capability_score REAL,
    ai_assessment TEXT,
    recommendation TEXT,

    -- Metadata
    conversation_transcript TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on submissions" ON submissions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_company_name ON submissions(company_name);
CREATE INDEX IF NOT EXISTS idx_submissions_technology_category ON submissions(technology_category);
