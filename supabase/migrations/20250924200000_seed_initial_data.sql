-- This script inserts initial data into the database.
-- It is designed to be idempotent, meaning it can be run multiple times without creating duplicates.

-- 1. Insert Disease Categories
INSERT INTO disease_categories (name, name_en, display_order)
VALUES
    ('炎症性疾患', 'Inflammatory Diseases', 1),
    ('良性腫瘍', 'Benign Tumors', 2),
    ('悪性腫瘍', 'Malignant Tumors', 3)
ON CONFLICT (name_en) DO NOTHING;

-- 2. Insert Symptom Categories
INSERT INTO symptom_categories (name, name_en, display_order)
VALUES
    ('一般的な症状', 'General Symptoms', 1),
    ('形状・見た目', 'Appearance & Morphology', 2),
    ('感覚', 'Sensation', 3)
ON CONFLICT (name_en) DO NOTHING;

-- 3. Insert Symptoms
-- Using a temporary table to handle lookups for category_id
CREATE TEMPORARY TABLE temp_symptoms (
    name_ja TEXT,
    name_en TEXT,
    category_en TEXT,
    description TEXT
);

INSERT INTO temp_symptoms (name_ja, name_en, category_en, description) VALUES
    ('かゆみ', 'Itching', 'Sensation', '皮膚を掻きたくなる不快な感覚。'),
    ('発疹', 'Rash', 'General Symptoms', '皮膚に現れる赤みやぶつぶつなどの総称。'),
    ('乾燥', 'Dryness', 'General Symptoms', '皮膚の水分が不足し、カサカサした状態。'),
    ('赤み', 'Redness', 'Appearance & Morphology', '皮膚が赤くなること。炎症の兆候の一つ。'),
    ('鱗屑', 'Scaling', 'Appearance & Morphology', '皮膚の表面が剥がれ落ち、フケのようになる状態。'),
    ('丘疹', 'Papule', 'Appearance & Morphology', '皮膚の小さな盛り上がり（直径1cm未満）。'),
    ('痛み', 'Pain', 'Sensation', '鋭い、または鈍い不快な感覚。'),
    ('黒い色素沈着', 'Black Pigmentation', 'Appearance & Morphology', '皮膚が黒または濃い茶色に変色すること。'),
    ('左右非対称な形状', 'Asymmetrical Shape', 'Appearance & Morphology', 'ほくろや病変の形が左右で異なること。'),
    ('不規則な境界', 'Irregular Border', 'Appearance & Morphology', 'ほくろや病変の縁がギザギザしていること。');

INSERT INTO symptoms (name, name_en, category_id, description, severity_weight, is_primary)
SELECT 
    ts.name_ja, 
    ts.name_en, 
    sc.id, 
    ts.description,
    5, -- Default severity_weight
    TRUE -- Default is_primary
FROM temp_symptoms ts
JOIN symptom_categories sc ON ts.category_en = sc.name_en
ON CONFLICT (name_en) DO NOTHING;

DROP TABLE temp_symptoms;

-- 4. Insert Diseases
-- Using a temporary table for lookups
CREATE TEMPORARY TABLE temp_diseases (
    name_ja TEXT,
    name_en TEXT,
    category_en TEXT,
    overview TEXT
);

INSERT INTO temp_diseases (name_ja, name_en, category_en, overview) VALUES
    ('アトピー性皮膚炎', 'Atopic Dermatitis', 'Inflammatory Diseases', '強いかゆみを伴う慢性の皮膚炎。アレルギー体質の人に多い。'),
    ('脂漏性角化症', 'Seborrheic Keratosis', 'Benign Tumors', '高齢者によく見られる良性のいぼ。通常は治療不要。'),
    ('メラノーマ（悪性黒色腫）', 'Melanoma', 'Malignant Tumors', '悪性度の高い皮膚がん。早期発見と治療が極めて重要。'),
    ('基底細胞がん', 'Basal Cell Carcinoma', 'Malignant Tumors', '最も頻度の高い皮膚がん。転移は稀だが局所的に進行する。'),
    ('乾癬', 'Psoriasis', 'Inflammatory Diseases', '銀白色の鱗屑を伴う赤い発疹が特徴の慢性疾患。');

INSERT INTO diseases (name, name_en, category_id, overview, severity_level, is_common)
SELECT
    td.name_ja,
    td.name_en,
    dc.id,
    td.overview,
    'moderate', -- Default severity
    TRUE -- Default is_common
FROM temp_diseases td
JOIN disease_categories dc ON td.category_en = dc.name_en
ON CONFLICT (name_en) DO NOTHING;

DROP TABLE temp_diseases;

-- 5. Create Disease-Symptom relationships
-- Using a temporary table for lookups
CREATE TEMPORARY TABLE temp_relations (
    disease_en TEXT,
    symptom_en TEXT,
    relevance_score NUMERIC
);

INSERT INTO temp_relations (disease_en, symptom_en, relevance_score) VALUES
    -- Atopic Dermatitis
    ('Atopic Dermatitis', 'Itching', 0.9),
    ('Atopic Dermatitis', 'Rash', 0.8),
    ('Atopic Dermatitis', 'Dryness', 0.8),
    ('Atopic Dermatitis', 'Redness', 0.7),
    -- Seborrheic Keratosis
    ('Seborrheic Keratosis', 'Papule', 0.7),
    ('Seborrheic Keratosis', 'Black Pigmentation', 0.6),
    -- Melanoma
    ('Melanoma', 'Black Pigmentation', 0.9),
    ('Melanoma', 'Asymmetrical Shape', 0.9),
    ('Melanoma', 'Irregular Border', 0.9),
    ('Melanoma', 'Pain', 0.3),
    -- Basal Cell Carcinoma
    ('Basal Cell Carcinoma', 'Papule', 0.8),
    ('Basal Cell Carcinoma', 'Redness', 0.7),
    -- Psoriasis
    ('Psoriasis', 'Scaling', 0.9),
    ('Psoriasis', 'Rash', 0.8),
    ('Psoriasis', 'Redness', 0.8),
    ('Psoriasis', 'Itching', 0.6);

INSERT INTO disease_symptoms (disease_id, symptom_id, relevance_score, is_diagnostic)
SELECT
    d.id,
    s.id,
    tr.relevance_score,
    (tr.relevance_score > 0.8) -- is_diagnostic if score is high
FROM temp_relations tr
JOIN diseases d ON tr.disease_en = d.name_en
JOIN symptoms s ON tr.symptom_en = s.name_en
ON CONFLICT (disease_id, symptom_id) DO NOTHING;

DROP TABLE temp_relations;

-- Notify completion
SELECT 'Seed data insertion complete.' as status;
