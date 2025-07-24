/*
  # 皮膚疾患診断支援システム - 包括的データベーススキーマ

  1. 新しいテーブル
    - `diseases` - 疾患マスターテーブル
    - `symptoms` - 症状マスターテーブル  
    - `disease_symptoms` - 疾患-症状関連テーブル（多対多）
    - `treatments` - 治療法テーブル
    - `diagnosis_history` - 診断履歴テーブル
    - `medical_images` - 医療画像テーブル
    - `symptom_categories` - 症状カテゴリテーブル
    - `disease_categories` - 疾患カテゴリテーブル

  2. セキュリティ
    - 全テーブルでRLSを有効化
    - 適切なポリシーを設定
    - インデックスを最適化

  3. パフォーマンス最適化
    - 検索用インデックス
    - 全文検索対応
    - 複合インデックス
*/

-- 疾患カテゴリテーブル
CREATE TABLE IF NOT EXISTS disease_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_en text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 症状カテゴリテーブル
CREATE TABLE IF NOT EXISTS symptom_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_en text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 疾患マスターテーブル
CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text NOT NULL,
  category_id uuid REFERENCES disease_categories(id),
  overview text NOT NULL,
  detailed_description text,
  prevalence numeric(5,4) DEFAULT 0.0001, -- 発症率（0-1の範囲）
  severity_level text CHECK (severity_level IN ('low', 'mild', 'moderate', 'high', 'severe')) DEFAULT 'mild',
  is_common boolean DEFAULT false,
  is_emergency boolean DEFAULT false,
  age_group text[], -- 好発年齢層
  gender_preference text CHECK (gender_preference IN ('male', 'female', 'both')) DEFAULT 'both',
  seasonal_pattern text[], -- 季節性パターン
  genetic_factor boolean DEFAULT false,
  contagious boolean DEFAULT false,
  chronic boolean DEFAULT false,
  icd10_code text, -- ICD-10コード
  search_keywords text[], -- 検索用キーワード
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 症状マスターテーブル
CREATE TABLE IF NOT EXISTS symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text NOT NULL,
  category_id uuid REFERENCES symptom_categories(id),
  description text NOT NULL,
  severity_weight numeric(3,2) DEFAULT 1.0, -- 重要度重み（0.1-3.0）
  is_primary boolean DEFAULT false, -- 主要症状かどうか
  is_objective boolean DEFAULT true, -- 客観的症状かどうか
  measurement_unit text, -- 測定単位（該当する場合）
  normal_range text, -- 正常範囲（該当する場合）
  search_keywords text[], -- 検索用キーワード
  created_at timestamptz DEFAULT now()
);

-- 疾患-症状関連テーブル（多対多）
CREATE TABLE IF NOT EXISTS disease_symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid REFERENCES diseases(id) ON DELETE CASCADE,
  symptom_id uuid REFERENCES symptoms(id) ON DELETE CASCADE,
  relevance_score numeric(3,2) DEFAULT 1.0, -- 関連度スコア（0.1-3.0）
  frequency_percentage integer DEFAULT 50, -- 出現頻度（%）
  is_diagnostic boolean DEFAULT false, -- 診断的症状かどうか
  is_pathognomonic boolean DEFAULT false, -- 病理学的特徴的症状かどうか
  stage text, -- 病期（該当する場合）
  notes text, -- 備考
  created_at timestamptz DEFAULT now(),
  UNIQUE(disease_id, symptom_id)
);

-- 治療法テーブル
CREATE TABLE IF NOT EXISTS treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid REFERENCES diseases(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_en text,
  type text CHECK (type IN ('topical', 'oral', 'injection', 'procedure', 'lifestyle', 'alternative')) DEFAULT 'topical',
  description text,
  dosage text,
  duration text,
  effectiveness_score numeric(3,2) DEFAULT 1.0, -- 有効性スコア（0.1-3.0）
  evidence_level text CHECK (evidence_level IN ('A', 'B', 'C', 'D')) DEFAULT 'C',
  side_effects text[],
  contraindications text[],
  drug_interactions text[],
  cost_level text CHECK (cost_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  availability text CHECK (availability IN ('otc', 'prescription', 'hospital_only')) DEFAULT 'prescription',
  first_line boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 医療画像テーブル
CREATE TABLE IF NOT EXISTS medical_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid REFERENCES diseases(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_type text CHECK (image_type IN ('clinical', 'dermoscopy', 'histology', 'illustration')) DEFAULT 'clinical',
  title text,
  description text,
  body_part text,
  stage text,
  severity text,
  is_typical boolean DEFAULT true,
  source text,
  copyright_info text,
  created_at timestamptz DEFAULT now()
);

-- 診断履歴テーブル
CREATE TABLE IF NOT EXISTS diagnosis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid, -- 将来の認証機能用
  image_url text,
  image_analysis_results jsonb,
  symptoms_input text[],
  selected_symptoms uuid[], -- symptom_idの配列
  ai_confidence_scores jsonb, -- 疾患名をキー、信頼度を値とするJSON
  final_diagnosis text[],
  diagnosis_method text CHECK (diagnosis_method IN ('image', 'symptoms', 'combined')) DEFAULT 'combined',
  user_feedback integer CHECK (user_feedback BETWEEN 1 AND 5),
  feedback_comment text,
  is_accurate boolean,
  processing_time_ms integer,
  model_version text DEFAULT '1.0',
  created_at timestamptz DEFAULT now()
);

-- インデックス作成（パフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_diseases_name ON diseases USING gin(to_tsvector('japanese', name));
CREATE INDEX IF NOT EXISTS idx_diseases_category ON diseases(category_id);
CREATE INDEX IF NOT EXISTS idx_diseases_severity ON diseases(severity_level);
CREATE INDEX IF NOT EXISTS idx_diseases_common ON diseases(is_common);
CREATE INDEX IF NOT EXISTS idx_diseases_keywords ON diseases USING gin(search_keywords);

CREATE INDEX IF NOT EXISTS idx_symptoms_name ON symptoms USING gin(to_tsvector('japanese', name));
CREATE INDEX IF NOT EXISTS idx_symptoms_category ON symptoms(category_id);
CREATE INDEX IF NOT EXISTS idx_symptoms_primary ON symptoms(is_primary);
CREATE INDEX IF NOT EXISTS idx_symptoms_keywords ON symptoms USING gin(search_keywords);

CREATE INDEX IF NOT EXISTS idx_disease_symptoms_disease ON disease_symptoms(disease_id);
CREATE INDEX IF NOT EXISTS idx_disease_symptoms_symptom ON disease_symptoms(symptom_id);
CREATE INDEX IF NOT EXISTS idx_disease_symptoms_relevance ON disease_symptoms(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_disease_symptoms_diagnostic ON disease_symptoms(is_diagnostic);

CREATE INDEX IF NOT EXISTS idx_treatments_disease ON treatments(disease_id);
CREATE INDEX IF NOT EXISTS idx_treatments_type ON treatments(type);
CREATE INDEX IF NOT EXISTS idx_treatments_effectiveness ON treatments(effectiveness_score DESC);
CREATE INDEX IF NOT EXISTS idx_treatments_first_line ON treatments(first_line);

CREATE INDEX IF NOT EXISTS idx_diagnosis_history_session ON diagnosis_history(session_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_history_created ON diagnosis_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosis_history_method ON diagnosis_history(diagnosis_method);

-- RLS（Row Level Security）を有効化
ALTER TABLE disease_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_history ENABLE ROW LEVEL SECURITY;

-- 基本的な読み取りポリシー（全ユーザーが参照可能）
CREATE POLICY "Public read access for disease_categories"
  ON disease_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for symptom_categories"
  ON symptom_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for diseases"
  ON diseases FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for symptoms"
  ON symptoms FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for disease_symptoms"
  ON disease_symptoms FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for treatments"
  ON treatments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for medical_images"
  ON medical_images FOR SELECT
  TO public
  USING (true);

-- 診断履歴は挿入のみ許可（プライバシー保護）
CREATE POLICY "Allow insert for diagnosis_history"
  ON diagnosis_history FOR INSERT
  TO public
  WITH CHECK (true);

-- 更新用のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新トリガーを設定
CREATE TRIGGER update_diseases_updated_at
  BEFORE UPDATE ON diseases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 全文検索用の関数
CREATE OR REPLACE FUNCTION search_diseases(search_term text)
RETURNS TABLE (
  id uuid,
  name text,
  name_en text,
  overview text,
  relevance_score real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.name_en,
    d.overview,
    ts_rank(
      to_tsvector('japanese', d.name || ' ' || d.overview || ' ' || array_to_string(d.search_keywords, ' ')),
      plainto_tsquery('japanese', search_term)
    ) as relevance_score
  FROM diseases d
  WHERE to_tsvector('japanese', d.name || ' ' || d.overview || ' ' || array_to_string(d.search_keywords, ' '))
        @@ plainto_tsquery('japanese', search_term)
  ORDER BY relevance_score DESC;
END;
$$ LANGUAGE plpgsql;