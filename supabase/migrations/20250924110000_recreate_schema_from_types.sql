
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for better data integrity
CREATE TYPE severity_level_enum AS ENUM ('low', 'mild', 'moderate', 'high', 'severe');
CREATE TYPE gender_preference_enum AS ENUM ('male', 'female', 'both');
CREATE TYPE treatment_type_enum AS ENUM ('topical', 'oral', 'injection', 'procedure', 'lifestyle', 'alternative');
CREATE TYPE evidence_level_enum AS ENUM ('A', 'B', 'C', 'D');
CREATE TYPE cost_level_enum AS ENUM ('low', 'medium', 'high');
CREATE TYPE availability_enum AS ENUM ('otc', 'prescription', 'hospital_only');
CREATE TYPE image_type_enum AS ENUM ('clinical', 'dermoscopy', 'histology', 'illustration');
CREATE TYPE diagnosis_method_enum AS ENUM ('image', 'symptoms', 'combined');

-- Table for Disease Categories
CREATE TABLE disease_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    display_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for Symptom Categories
CREATE TABLE symptom_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    display_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for Diseases
CREATE TABLE diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category_id UUID REFERENCES disease_categories(id),
    overview TEXT NOT NULL,
    detailed_description TEXT,
    prevalence NUMERIC,
    severity_level severity_level_enum,
    is_common BOOLEAN,
    is_emergency BOOLEAN,
    age_group TEXT[],
    gender_preference gender_preference_enum,
    seasonal_pattern TEXT[],
    genetic_factor BOOLEAN,
    contagious BOOLEAN,
    chronic BOOLEAN,
    icd10_code TEXT,
    search_keywords TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for Symptoms
CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category_id UUID REFERENCES symptom_categories(id),
    description TEXT NOT NULL,
    severity_weight NUMERIC,
    is_primary BOOLEAN,
    is_objective BOOLEAN,
    measurement_unit TEXT,
    normal_range TEXT,
    search_keywords TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Join Table for Diseases and Symptoms
CREATE TABLE disease_symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    symptom_id UUID NOT NULL REFERENCES symptoms(id) ON DELETE CASCADE,
    relevance_score NUMERIC NOT NULL,
    frequency_percentage NUMERIC,
    is_diagnostic BOOLEAN,
    is_pathognomonic BOOLEAN,
    stage TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (disease_id, symptom_id)
);

-- Table for Treatments
CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_en TEXT,
    type treatment_type_enum,
    description TEXT,
    dosage TEXT,
    duration TEXT,
    effectiveness_score NUMERIC,
    evidence_level evidence_level_enum,
    side_effects TEXT[],
    contraindications TEXT[],
    drug_interactions TEXT[],
    cost_level cost_level_enum,
    availability availability_enum,
    first_line BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for Medical Images
CREATE TABLE medical_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type image_type_enum,
    title TEXT,
    description TEXT,
    body_part TEXT,
    stage TEXT,
    severity TEXT,
    is_typical BOOLEAN,
    source TEXT,
    copyright_info TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for Diagnosis History (AI interaction log)
CREATE TABLE diagnosis_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    image_url TEXT,
    image_analysis_results JSONB,
    symptoms_input TEXT[],
    selected_symptoms TEXT[],
    ai_confidence_scores JSONB,
    final_diagnosis TEXT[],
    diagnosis_method diagnosis_method_enum,
    user_feedback INTEGER,
    feedback_comment TEXT,
    is_accurate BOOLEAN,
    processing_time_ms INTEGER,
    model_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for Diary Records (User's manual log)
CREATE TABLE diary_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    memo TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for diary_records
ALTER TABLE diary_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to own diary records" ON diary_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS for diagnosis_history (assuming users can only see their own history)
ALTER TABLE diagnosis_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to own diagnosis history" ON diagnosis_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_disease_categories_update BEFORE UPDATE ON disease_categories FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_diseases_update BEFORE UPDATE ON diseases FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_diary_records_update BEFORE UPDATE ON diary_records FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
