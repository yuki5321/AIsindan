-- diseases table: Stores information about skin diseases.
CREATE TABLE diseases (
    id BIGSERIAL PRIMARY KEY,
    name_ja TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ja TEXT,
    description_en TEXT,
    causes_ja TEXT,
    causes_en TEXT,
    treatment_ja TEXT,
    treatment_en TEXT,
    prevention_ja TEXT,
    prevention_en TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- symptoms table: Stores a list of symptoms.
CREATE TABLE symptoms (
    id BIGSERIAL PRIMARY KEY,
    name_ja TEXT NOT NULL UNIQUE,
    name_en TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- disease_symptoms join table: Links diseases to their common symptoms.
CREATE TABLE disease_symptoms (
    id BIGSERIAL PRIMARY KEY,
    disease_id BIGINT NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    symptom_id BIGINT NOT NULL REFERENCES symptoms(id) ON DELETE CASCADE,
    UNIQUE (disease_id, symptom_id)
);

-- diary_records table: Stores user's daily diary entries.
CREATE TABLE diary_records (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    memo TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for the diary_records table to protect user data.
ALTER TABLE diary_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diary_records:
-- 1. Users can see their own records.
CREATE POLICY "Allow users to view their own records"
ON diary_records FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can insert records for themselves.
CREATE POLICY "Allow users to insert their own records"
ON diary_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own records.
CREATE POLICY "Allow users to update their own records"
ON diary_records FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Users can delete their own records.
CREATE POLICY "Allow users to delete their own records"
ON diary_records FOR DELETE
USING (auth.uid() = user_id);

-- Auto-update the 'updated_at' timestamp on record changes.
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_diary_records_update
BEFORE UPDATE ON diary_records
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
