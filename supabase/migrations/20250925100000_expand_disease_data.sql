-- Upsert diseases related to the Derma-MNIST model
-- Using English names as the conflict target to avoid duplicates.
INSERT INTO diseases (name, name_en, overview, category_id)
SELECT 
    t.name_ja, t.name_en, t.overview, dc.id
FROM (
    VALUES
        ('光線角化症/ボーエン病', 'Actinic keratoses and intraepithelial carcinoma / Bowen''s disease', '日光への長期間の曝露によって引き起こされる前がん病変または早期の皮膚がん。', '悪性腫瘍'),
        ('基底細胞がん', 'basal cell carcinoma', '最も一般的な皮膚がんで、通常はゆっくりと成長し、転移は稀です。', '悪性腫瘍'),
        ('良性角化症様病変', 'benign keratosis-like lesions', '脂漏性角化症や太陽黒子など、がんではない一般的な皮膚の成長物。', '良性腫瘍'),
        ('皮膚線維腫', 'dermatofibroma', '皮膚の小さな硬いしこりで、通常は良性です。', '良性腫瘍'),
        ('メラノーマ', 'melanoma', '最も危険なタイプの皮膚がんで、早期発見が極めて重要です。', '悪性腫瘍'),
        ('母斑細胞母斑', 'melanocytic nevi', 'いわゆる「ほくろ」。ほとんどは良性ですが、変化には注意が必要です。', '良性腫瘍'),
        ('血管性病変', 'vascular lesions', '血管腫や血管奇形など、血管の異常によって形成される病変。', '良性腫瘍')
) AS t(name_ja, name_en, overview, category_en)
JOIN disease_categories dc ON t.category_en = dc.name
ON CONFLICT (name_en) DO NOTHING;

-- Upsert disease-symptom relationships for the new diseases
-- This connects the AI model's diseases to the symptoms database.
CREATE TEMPORARY TABLE temp_relations_new (
    disease_en TEXT,
    symptom_en TEXT,
    relevance_score NUMERIC
);

INSERT INTO temp_relations_new (disease_en, symptom_en, relevance_score) VALUES
    ('basal cell carcinoma', 'Papule', 0.8),
    ('basal cell carcinoma', 'Redness', 0.7),
    ('melanoma', 'Asymmetrical Shape', 0.9),
    ('melanoma', 'Irregular Border', 0.9),
    ('melanoma', 'Black Pigmentation', 0.8),
    ('dermatofibroma', 'Papule', 0.7),
    ('Actinic keratoses and intraepithelial carcinoma / Bowen''s disease', 'Scaling', 0.8),
    ('Actinic keratoses and intraepithelial carcinoma / Bowen''s disease', 'Redness', 0.7);

INSERT INTO disease_symptoms (disease_id, symptom_id, relevance_score, is_diagnostic)
SELECT
    d.id,
    s.id,
    tr.relevance_score,
    (tr.relevance_score > 0.8) -- is_diagnostic if score is high
FROM temp_relations_new tr
JOIN diseases d ON tr.disease_en = d.name_en
JOIN symptoms s ON tr.symptom_en = s.name_en
ON CONFLICT (disease_id, symptom_id) DO NOTHING;

DROP TABLE temp_relations_new;

SELECT 'Database expanded with Derma-MNIST disease data.' as status;
