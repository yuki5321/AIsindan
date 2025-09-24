import { supabase } from '../lib/supabase';

export const diseaseService = {
  /**
   * Fetches all symptoms from the database.
   */
  async getSymptoms() {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*');

    if (error) {
      console.error('Error fetching symptoms:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Fetches all symptom categories from the database.
   */
  async getSymptomCategories() {
    const { data, error } = await supabase
      .from('symptom_categories')
      .select('id, name, name_en')
      .order('display_order');

    if (error) {
      console.error('Error fetching symptom categories:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Fetches symptoms filtered by a specific category ID.
   */
  async getSymptomsByCategory(categoryId?: string) {
    let query = supabase.from('symptoms').select('*');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error(`Error fetching symptoms for category ${categoryId}:`, error);
      throw error;
    }
    return data || [];
  },

  /**
   * Calculates diagnosis based on selected symptoms.
   */
  async getDiseasesBySymptoms(symptomIds: string[]) {
    if (symptomIds.length === 0) return [];

    const { data: relations, error } = await supabase
      .from('disease_symptoms')
      .select('relevance_score, disease:diseases(*, category:disease_categories(name))')
      .in('symptom_id', symptomIds);

    if (error) throw error;

    const diseaseScores: { [key: string]: any } = {};
    for (const relation of relations) {
      if (!relation.disease) continue;
      const diseaseId = relation.disease.id;
      if (!diseaseScores[diseaseId]) {
        diseaseScores[diseaseId] = { disease: relation.disease, totalScore: 0, matchedSymptoms: [] };
      }
      diseaseScores[diseaseId].totalScore += relation.relevance_score;
      diseaseScores[diseaseId].matchedSymptoms.push(relation.symptom_id);
    }

    const results = Object.values(diseaseScores);
    const maxScore = Math.max(...results.map(r => r.totalScore), 1);
    const formattedResults = results.map(r => ({ ...r, confidence: Math.min(Math.round((r.totalScore / maxScore) * 100), 100) }));
    
    return formattedResults.sort((a, b) => b.confidence - a.confidence);
  },

  /**
   * Fetches a single disease by its ID, including related category.
   */
  async getDiseaseById(diseaseId: string) {
    const { data, error } = await supabase
      .from('diseases')
      .select('*, disease_categories(name)')
      .eq('id', diseaseId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetches all treatments for a given disease ID.
   */
  async getTreatmentsByDiseaseId(diseaseId: string) {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('disease_id', diseaseId)
      .order('first_line', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
