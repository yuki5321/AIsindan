import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  mockSymptoms, 
  mockDiseases, 
  mockSymptomCategories, 
  searchSymptoms, 
  findDiseasesBySymptoms,
  type MockSymptom,
  type MockDisease 
} from '../data/mockData';

export class DiseaseService {
  // Check if we should use mock data
  private shouldUseMockData(): boolean {
    return !isSupabaseConfigured();
  }

  async getSymptomsByCategory(categoryId?: string) {
    if (this.shouldUseMockData()) {
      // Use mock data when Supabase is not configured
      if (categoryId) {
        return mockSymptoms.filter(symptom => symptom.category_id === categoryId);
      }
      return mockSymptoms;
    }

    try {
      let query = supabase
        .from('symptoms')
        .select(`
          *,
          symptom_categories (
            id,
            name,
            name_en
          )
        `)
        .order('name');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('症状取得エラー:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('症状取得エラー:', error);
      throw error;
    }
  }

  async getSymptomCategories() {
    if (this.shouldUseMockData()) {
      return mockSymptomCategories;
    }

    try {
      const { data, error } = await supabase
        .from('symptom_categories')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('症状カテゴリ取得エラー:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('症状カテゴリ取得エラー:', error);
      throw error;
    }
  }

  async searchSymptoms(query: string) {
    if (this.shouldUseMockData()) {
      return searchSymptoms(query);
    }

    try {
      const { data, error } = await supabase
        .from('symptoms')
        .select(`
          *,
          symptom_categories (
            id,
            name,
            name_en
          )
        `)
        .or(`name.ilike.%${query}%,name_en.ilike.%${query}%,search_keywords.cs.{${query}}`)
        .order('name');

      if (error) {
        console.error('症状検索エラー:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('症状検索エラー:', error);
      throw error;
    }
  }

  async getDiseasesBySymptoms(symptomIds: string[]) {
    if (this.shouldUseMockData()) {
      const results = findDiseasesBySymptoms(symptomIds);
      return results.map(result => ({
        disease: result.disease,
        confidence: Math.round(result.matchScore * 100),
        matchedSymptoms: result.matchedSymptoms.map(id => 
          mockSymptoms.find(s => s.id === id)
        ).filter(Boolean),
        totalScore: result.matchScore,
        enhancementFactor: 1
      }));
    }

    if (symptomIds.length === 0) {
      return [];
    }

    try {
      // Get diseases that have relationships with the selected symptoms
      const { data: diseaseSymptoms, error: dsError } = await supabase
        .from('disease_symptoms')
        .select(`
          disease_id,
          symptom_id,
          relevance_score,
          frequency_percentage,
          is_diagnostic,
          diseases (
            id,
            name,
            name_en,
            overview,
            detailed_description,
            prevalence,
            severity_level,
            is_common,
            is_emergency,
            disease_categories (
              id,
              name,
              name_en
            )
          ),
          symptoms (
            id,
            name,
            name_en,
            description,
            severity_weight,
            is_primary
          )
        `)
        .in('symptom_id', symptomIds);

      if (dsError) {
        console.error('疾患-症状関係取得エラー:', dsError);
        throw dsError;
      }

      // Group by disease and calculate scores
      const diseaseMap = new Map();

      diseaseSymptoms?.forEach(ds => {
        const diseaseId = ds.disease_id;
        if (!diseaseMap.has(diseaseId)) {
          diseaseMap.set(diseaseId, {
            disease: ds.diseases,
            matchedSymptoms: [],
            totalScore: 0,
            diagnosticCount: 0,
            maxRelevance: 0
          });
        }

        const diseaseData = diseaseMap.get(diseaseId);
        diseaseData.matchedSymptoms.push({
          ...ds.symptoms,
          relevance_score: ds.relevance_score,
          frequency_percentage: ds.frequency_percentage,
          is_diagnostic: ds.is_diagnostic
        });

        // Calculate weighted score
        const symptomWeight = ds.symptoms.severity_weight || 1;
        const relevanceWeight = ds.relevance_score / 100;
        const frequencyWeight = ds.frequency_percentage / 100;
        const diagnosticBonus = ds.is_diagnostic ? 1.5 : 1;

        const symptomScore = symptomWeight * relevanceWeight * frequencyWeight * diagnosticBonus;
        diseaseData.totalScore += symptomScore;

        if (ds.is_diagnostic) {
          diseaseData.diagnosticCount++;
        }

        diseaseData.maxRelevance = Math.max(diseaseData.maxRelevance, ds.relevance_score);
      });

      // Convert to array and calculate final confidence scores
      const results = Array.from(diseaseMap.values()).map(diseaseData => {
        const matchRatio = diseaseData.matchedSymptoms.length / symptomIds.length;
        const diagnosticBonus = diseaseData.diagnosticCount > 0 ? 1.3 : 1;
        const commonBonus = diseaseData.disease.is_common ? 1.1 : 1;
        
        const enhancementFactor = diagnosticBonus * commonBonus;
        const baseConfidence = Math.min(diseaseData.totalScore * matchRatio * 10, 100);
        const finalConfidence = Math.min(baseConfidence * enhancementFactor, 100);

        return {
          disease: diseaseData.disease,
          confidence: Math.round(finalConfidence),
          matchedSymptoms: diseaseData.matchedSymptoms,
          diagnosticSymptoms: diseaseData.matchedSymptoms.filter(s => s.is_diagnostic),
          totalScore: diseaseData.totalScore,
          enhancementFactor
        };
      });

      // Sort by confidence score
      results.sort((a, b) => b.confidence - a.confidence);

      return results;
    } catch (error) {
      console.error('疾患診断エラー:', error);
      throw error;
    }
  }

  async getDiseaseById(diseaseId: string) {
    if (this.shouldUseMockData()) {
      return mockDiseases.find(disease => disease.id === diseaseId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('diseases')
        .select(`
          *,
          disease_categories (
            id,
            name,
            name_en
          )
        `)
        .eq('id', diseaseId)
        .single();

      if (error) {
        console.error('疾患詳細取得エラー:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('疾患詳細取得エラー:', error);
      throw error;
    }
  }

  async getTreatmentsByDiseaseId(diseaseId: string) {
    if (this.shouldUseMockData()) {
      // Return mock treatments for demonstration
      return [
        {
          id: 'treat_001',
          name: '保湿剤の使用',
          type: 'topical',
          description: '皮膚の乾燥を防ぐための保湿剤を定期的に使用します。',
          effectiveness_score: 2.4,
          evidence_level: 'A',
          first_line: true,
          side_effects: ['軽微な皮膚刺激'],
          dosage: '1日2-3回、清潔な皮膚に塗布',
          duration: '継続使用'
        },
        {
          id: 'treat_002',
          name: 'ステロイド外用薬',
          type: 'topical',
          description: '炎症を抑えるためのステロイド系外用薬を使用します。',
          effectiveness_score: 2.7,
          evidence_level: 'A',
          first_line: true,
          side_effects: ['皮膚萎縮', '毛細血管拡張', '色素沈着'],
          dosage: '1日1-2回、患部に薄く塗布',
          duration: '2-4週間'
        },
        {
          id: 'treat_003',
          name: '抗ヒスタミン薬',
          type: 'oral',
          description: 'かゆみを抑えるための内服薬です。',
          effectiveness_score: 2.0,
          evidence_level: 'B',
          first_line: false,
          side_effects: ['眠気', '口渇', 'めまい'],
          dosage: '1日1-2回、食後に服用',
          duration: '症状に応じて調整'
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('disease_id', diseaseId)
        .order('first_line', { ascending: false })
        .order('effectiveness_score', { ascending: false });

      if (error) {
        console.error('治療法取得エラー:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('治療法取得エラー:', error);
      throw error;
    }
  }

  // 疾患の詳細情報を取得（症状診断用）
  async getDiseaseDetails(diseaseId: string) {
    try {
      const [disease, symptoms, treatments] = await Promise.all([
        this.getDiseaseById(diseaseId),
        this.getSymptomsByCategory(),
        this.getTreatmentsByDiseaseId(diseaseId)
      ]);

      return {
        disease,
        symptoms: symptoms || [],
        treatments: treatments || [],
        relatedDiseases: [],
        medicalImages: []
      };
    } catch (error) {
      console.error('疾患詳細取得エラー:', error);
      throw error;
    }
  }

  // 検索機能
  async searchDiseases(query: string, category?: string, page: number = 1, limit: number = 20) {
    if (this.shouldUseMockData()) {
      let filteredDiseases = mockDiseases;
      
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredDiseases = filteredDiseases.filter(disease =>
          disease.name.toLowerCase().includes(searchTerm) ||
          disease.name_en.toLowerCase().includes(searchTerm) ||
          disease.overview.toLowerCase().includes(searchTerm)
        );
      }

      return {
        diseases: filteredDiseases.slice((page - 1) * limit, page * limit),
        total: filteredDiseases.length,
        page,
        limit
      };
    }

    try {
      let query_builder = supabase
        .from('diseases')
        .select(`
          *,
          disease_categories (
            id,
            name,
            name_en
          )
        `, { count: 'exact' });

      if (query) {
        query_builder = query_builder.or(`name.ilike.%${query}%,name_en.ilike.%${query}%,overview.ilike.%${query}%`);
      }

      if (category) {
        query_builder = query_builder.eq('category_id', category);
      }

      const { data, error, count } = await query_builder
        .range((page - 1) * limit, page * limit - 1)
        .order('name');

      if (error) {
        console.error('疾患検索エラー:', error);
        throw error;
      }

      return {
        diseases: data || [],
        total: count || 0,
        page,
        limit
      };
    } catch (error) {
      console.error('疾患検索エラー:', error);
      throw error;
    }
  }
}

export const diseaseService = new DiseaseService();