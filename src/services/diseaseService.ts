import { supabase } from '../lib/supabase';

export const diseaseService = {
  /**
   * Fetches all symptoms from the database.
   */
  async getSymptoms() {
    const { data, error } = await supabase
      .from('symptoms')
      .select('id, name, name_en, description, severity_weight, is_primary, category_id, search_keywords');

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
   * If no categoryId is provided, it fetches all symptoms.
   */
  async getSymptomsByCategory(categoryId?: string) {
    let query = supabase
      .from('symptoms')
      .select('id, name, name_en, description, severity_weight, is_primary, category_id, search_keywords');

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
    if (symptomIds.length === 0) {
      return [];
    }

    // 1. Fetch all relationships that include any of the selected symptoms
    const { data: relations, error: relationError } = await supabase
      .from('disease_symptoms')
      .select(`
        relevance_score,
        disease:diseases (*, category:disease_categories (name)),
        symptom:symptoms (id, name, name_en)
      `)
      .in('symptom_id', symptomIds);

    if (relationError) {
      console.error('Error fetching disease-symptom relations:', relationError);
      throw relationError;
    }

    if (!relations) {
      return [];
    }

    // 2. Calculate scores for each disease
    const diseaseScores: { [key: string]: any } = {};

    for (const relation of relations) {
      const disease = relation.disease;
      if (!disease) continue;

      if (!diseaseScores[disease.id]) {
        diseaseScores[disease.id] = {
          disease: disease,
          totalScore: 0,
          matchedSymptoms: [],
        };
      }
      diseaseScores[disease.id].totalScore += relation.relevance_score;
      diseaseScores[disease.id].matchedSymptoms.push(relation.symptom);
    }

    // 3. Convert scores object to an array and calculate confidence
    const results = Object.values(diseaseScores);
    const maxScore = Math.max(...results.map(r => r.totalScore), 1); // Avoid division by zero

    const formattedResults = results.map(result => ({
      ...result,
      confidence: Math.min(Math.round((result.totalScore / maxScore) * 100), 100),
    }));

    // 4. Sort by confidence
    formattedResults.sort((a, b) => b.confidence - a.confidence);

    return formattedResults;
  },
};
