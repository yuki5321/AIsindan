import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Key is not set. Running in demo mode.');
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

// 拡張されたデータベース型定義
export interface DiseaseCategory {
  id: string;
  name: string;
  name_en: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SymptomCategory {
  id: string;
  name: string;
  name_en: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface Disease {
  id: string;
  name: string;
  name_en: string;
  category_id?: string;
  overview: string;
  detailed_description?: string;
  prevalence: number;
  severity_level: 'low' | 'mild' | 'moderate' | 'high' | 'severe';
  is_common: boolean;
  is_emergency: boolean;
  age_group?: string[];
  gender_preference: 'male' | 'female' | 'both';
  seasonal_pattern?: string[];
  genetic_factor: boolean;
  contagious: boolean;
  chronic: boolean;
  icd10_code?: string;
  search_keywords?: string[];
  created_at: string;
  updated_at: string;
  disease_categories?: DiseaseCategory;
}

export interface Symptom {
  id: string;
  name: string;
  name_en: string;
  category_id?: string;
  description: string;
  severity_weight: number;
  is_primary: boolean;
  is_objective: boolean;
  measurement_unit?: string;
  normal_range?: string;
  search_keywords?: string[];
  created_at: string;
  symptom_categories?: SymptomCategory;
  // 診断時に追加される情報
  relevance_score?: number;
  frequency_percentage?: number;
  is_diagnostic?: boolean;
}

export interface DiseaseSymptom {
  id: string;
  disease_id: string;
  symptom_id: string;
  relevance_score: number;
  frequency_percentage: number;
  is_diagnostic: boolean;
  is_pathognomonic: boolean;
  stage?: string;
  notes?: string;
  created_at: string;
}

export interface Treatment {
  id: string;
  disease_id: string;
  name: string;
  name_en?: string;
  type: 'topical' | 'oral' | 'injection' | 'procedure' | 'lifestyle' | 'alternative';
  description?: string;
  dosage?: string;
  duration?: string;
  effectiveness_score: number;
  evidence_level: 'A' | 'B' | 'C' | 'D';
  side_effects?: string[];
  contraindications?: string[];
  drug_interactions?: string[];
  cost_level: 'low' | 'medium' | 'high';
  availability: 'otc' | 'prescription' | 'hospital_only';
  first_line: boolean;
  created_at: string;
}

export interface MedicalImage {
  id: string;
  disease_id: string;
  image_url: string;
  image_type: 'clinical' | 'dermoscopy' | 'histology' | 'illustration';
  title?: string;
  description?: string;
  body_part?: string;
  stage?: string;
  severity?: string;
  is_typical: boolean;
  source?: string;
  copyright_info?: string;
  created_at: string;
}

export interface DiagnosisHistory {
  id: string;
  session_id: string;
  user_id?: string;
  image_url?: string;
  image_analysis_results?: any;
  symptoms_input?: string[];
  selected_symptoms?: string[];
  ai_confidence_scores: Record<string, number>;
  final_diagnosis: string[];
  diagnosis_method: 'image' | 'symptoms' | 'combined';
  user_feedback?: number;
  feedback_comment?: string;
  is_accurate?: boolean;
  processing_time_ms?: number;
  model_version: string;
  created_at: string;
}

// ユーティリティ型
export interface DiagnosisResult {
  disease: Disease;
  confidence: number;
  matchedSymptoms: Symptom[];
  diagnosticSymptoms?: Symptom[];
  totalScore?: number;
  enhancementFactor?: number;
}

export interface SearchFilters {
  category?: string;
  severity?: string[];
  isCommon?: boolean;
  isEmergency?: boolean;
  ageGroup?: string[];
  genderPreference?: string;
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && 
           supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined' &&
           isValidUrl(supabaseUrl) && supabaseAnonKey !== 'placeholder-key');
}

// データベース接続テスト関数
export async function testDatabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('diseases')
      .select('count(*)')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('データベース接続テストエラー:', error);
    return false;
  }
}

// データベース初期化状態チェック
export async function checkDatabaseInitialization(): Promise<{
  isInitialized: boolean;
  tableStatus: Record<string, boolean>;
  dataStatus: Record<string, number>;
}> {
  if (!isSupabaseConfigured()) {
    return {
      isInitialized: false,
      tableStatus: {},
      dataStatus: {}
    };
  }

  const tables = ['diseases', 'symptoms', 'disease_symptoms', 'treatments'];
  const tableStatus: Record<string, boolean> = {};
  const dataStatus: Record<string, number> = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact' })
        .limit(1);
      
      tableStatus[table] = !error;
      dataStatus[table] = data?.length || 0;
    } catch (error) {
      tableStatus[table] = false;
      dataStatus[table] = 0;
    }
  }

  const isInitialized = Object.values(tableStatus).every(status => status) &&
                       Object.values(dataStatus).some(count => count > 0);

  return {
    isInitialized,
    tableStatus,
    dataStatus
  };
}