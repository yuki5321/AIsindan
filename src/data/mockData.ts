// Mock data for skin diseases and symptoms
export interface MockSymptom {
  id: string;
  name: string;
  name_en: string;
  category_id: string;
  description: string;
  severity_weight: number;
  is_primary: boolean;
  is_objective: boolean;
  search_keywords: string[];
}

export interface MockDisease {
  id: string;
  name: string;
  name_en: string;
  category_id: string;
  overview: string;
  detailed_description: string;
  prevalence: number;
  severity_level: 'low' | 'mild' | 'moderate' | 'high' | 'severe';
  is_common: boolean;
  is_emergency: boolean;
  symptoms: string[]; // symptom IDs
}

export const mockSymptoms: MockSymptom[] = [
  {
    id: 'sym_001',
    name: 'かゆみ',
    name_en: 'Itching',
    category_id: 'cat_001',
    description: '皮膚のかゆみや掻きたい感覚',
    severity_weight: 3,
    is_primary: true,
    is_objective: false,
    search_keywords: ['かゆみ', 'かゆい', 'むずむず', 'itching', 'pruritus']
  },
  {
    id: 'sym_002',
    name: '発疹',
    name_en: 'Rash',
    category_id: 'cat_001',
    description: '皮膚に現れる赤い斑点や隆起',
    severity_weight: 4,
    is_primary: true,
    is_objective: true,
    search_keywords: ['発疹', 'はっしん', 'ぶつぶつ', 'rash', 'eruption']
  },
  {
    id: 'sym_003',
    name: '乾燥',
    name_en: 'Dryness',
    category_id: 'cat_001',
    description: '皮膚の水分不足による乾燥状態',
    severity_weight: 2,
    is_primary: false,
    is_objective: true,
    search_keywords: ['乾燥', 'かんそう', 'カサカサ', 'dryness', 'xerosis']
  },
  {
    id: 'sym_004',
    name: '赤み',
    name_en: 'Redness',
    category_id: 'cat_001',
    description: '皮膚の炎症による赤色の変化',
    severity_weight: 3,
    is_primary: true,
    is_objective: true,
    search_keywords: ['赤み', 'あかみ', '赤い', 'redness', 'erythema']
  },
  {
    id: 'sym_005',
    name: '腫れ',
    name_en: 'Swelling',
    category_id: 'cat_001',
    description: '皮膚や組織の膨張',
    severity_weight: 4,
    is_primary: true,
    is_objective: true,
    search_keywords: ['腫れ', 'はれ', '膨らみ', 'swelling', 'edema']
  },
  {
    id: 'sym_006',
    name: '痛み',
    name_en: 'Pain',
    category_id: 'cat_002',
    description: '皮膚や患部の痛みや不快感',
    severity_weight: 4,
    is_primary: true,
    is_objective: false,
    search_keywords: ['痛み', 'いたみ', '痛い', 'pain', 'ache']
  },
  {
    id: 'sym_007',
    name: '水ぶくれ',
    name_en: 'Blisters',
    category_id: 'cat_001',
    description: '皮膚に形成される液体を含む小さな袋',
    severity_weight: 5,
    is_primary: true,
    is_objective: true,
    search_keywords: ['水ぶくれ', 'みずぶくれ', '水疱', 'blisters', 'vesicles']
  },
  {
    id: 'sym_008',
    name: 'うろこ状の皮膚',
    name_en: 'Scaling',
    category_id: 'cat_001',
    description: '皮膚の表面が剥がれてうろこ状になる',
    severity_weight: 3,
    is_primary: false,
    is_objective: true,
    search_keywords: ['うろこ', 'スケール', '皮むけ', 'scaling', 'desquamation']
  },
  {
    id: 'sym_009',
    name: '膿',
    name_en: 'Pus',
    category_id: 'cat_003',
    description: '感染による黄色や緑色の分泌物',
    severity_weight: 5,
    is_primary: true,
    is_objective: true,
    search_keywords: ['膿', 'うみ', '化膿', 'pus', 'purulent']
  },
  {
    id: 'sym_010',
    name: '黒い斑点',
    name_en: 'Dark spots',
    category_id: 'cat_004',
    description: '皮膚に現れる黒色や茶色の色素沈着',
    severity_weight: 2,
    is_primary: false,
    is_objective: true,
    search_keywords: ['黒い斑点', '色素沈着', 'シミ', 'dark spots', 'hyperpigmentation']
  }
];

export const mockDiseases: MockDisease[] = [
  {
    id: 'dis_001',
    name: 'アトピー性皮膚炎',
    name_en: 'Atopic Dermatitis',
    category_id: 'cat_001',
    overview: '慢性的な炎症性皮膚疾患で、強いかゆみと特徴的な皮疹を伴います。',
    detailed_description: 'アトピー性皮膚炎は、遺伝的要因と環境要因が複合的に関与する慢性炎症性皮膚疾患です。主に乳幼児期に発症し、成人まで持続することがあります。',
    prevalence: 15,
    severity_level: 'moderate',
    is_common: true,
    is_emergency: false,
    symptoms: ['sym_001', 'sym_002', 'sym_003', 'sym_004']
  },
  {
    id: 'dis_002',
    name: '接触性皮膚炎',
    name_en: 'Contact Dermatitis',
    category_id: 'cat_001',
    overview: '特定の物質との接触により引き起こされる皮膚の炎症反応です。',
    detailed_description: '接触性皮膚炎は、アレルゲンや刺激物質との接触により生じる皮膚炎症です。アレルギー性と刺激性の2つのタイプがあります。',
    prevalence: 20,
    severity_level: 'mild',
    is_common: true,
    is_emergency: false,
    symptoms: ['sym_001', 'sym_002', 'sym_004', 'sym_006']
  },
  {
    id: 'dis_003',
    name: '帯状疱疹',
    name_en: 'Herpes Zoster',
    category_id: 'cat_002',
    overview: '水痘・帯状疱疹ウイルスの再活性化により起こる感染症です。',
    detailed_description: '帯状疱疹は、過去に水痘に感染した人の神経節に潜伏していたウイルスが再活性化することで発症します。特徴的な帯状の水疱と強い痛みを伴います。',
    prevalence: 5,
    severity_level: 'high',
    is_common: false,
    is_emergency: false,
    symptoms: ['sym_006', 'sym_007', 'sym_004', 'sym_002']
  },
  {
    id: 'dis_004',
    name: '乾癬',
    name_en: 'Psoriasis',
    category_id: 'cat_001',
    overview: '慢性的な自己免疫性皮膚疾患で、特徴的な鱗屑を伴う紅斑が現れます。',
    detailed_description: '乾癬は、免疫系の異常により皮膚細胞の増殖が亢進する慢性疾患です。遺伝的素因と環境要因が関与します。',
    prevalence: 3,
    severity_level: 'moderate',
    is_common: false,
    is_emergency: false,
    symptoms: ['sym_004', 'sym_008', 'sym_001', 'sym_002']
  },
  {
    id: 'dis_005',
    name: '蜂窩織炎',
    name_en: 'Cellulitis',
    category_id: 'cat_003',
    overview: '皮膚と皮下組織の細菌感染症で、急速に拡大する可能性があります。',
    detailed_description: '蜂窩織炎は、主に連鎖球菌や黄色ブドウ球菌による皮膚・軟部組織感染症です。適切な治療を行わないと重篤な合併症を引き起こす可能性があります。',
    prevalence: 2,
    severity_level: 'high',
    is_common: false,
    is_emergency: true,
    symptoms: ['sym_004', 'sym_005', 'sym_006', 'sym_009']
  },
  {
    id: 'dis_006',
    name: '脂漏性皮膚炎',
    name_en: 'Seborrheic Dermatitis',
    category_id: 'cat_001',
    overview: '皮脂分泌の多い部位に生じる慢性炎症性皮膚疾患です。',
    detailed_description: '脂漏性皮膚炎は、皮脂分泌異常とマラセチア菌の関与により生じる皮膚炎です。頭皮、顔面、胸部などの脂漏部位に好発します。',
    prevalence: 8,
    severity_level: 'mild',
    is_common: true,
    is_emergency: false,
    symptoms: ['sym_001', 'sym_004', 'sym_008', 'sym_003']
  }
];

export const mockSymptomCategories = [
  { id: 'cat_001', name: '皮膚症状', name_en: 'Skin Symptoms' },
  { id: 'cat_002', name: '痛み・感覚', name_en: 'Pain & Sensation' },
  { id: 'cat_003', name: '感染症状', name_en: 'Infection Symptoms' },
  { id: 'cat_004', name: '色素変化', name_en: 'Pigmentation Changes' }
];

// Search function to find symptoms by keyword
export function searchSymptoms(query: string): MockSymptom[] {
  if (!query.trim()) return mockSymptoms;
  
  const searchTerm = query.toLowerCase().trim();
  return mockSymptoms.filter(symptom => 
    symptom.search_keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm)
    ) ||
    symptom.name.toLowerCase().includes(searchTerm) ||
    symptom.name_en.toLowerCase().includes(searchTerm)
  );
}

// Find diseases that match selected symptoms
export function findDiseasesBySymptoms(symptomIds: string[]): Array<{disease: MockDisease, matchScore: number, matchedSymptoms: string[]}> {
  if (symptomIds.length === 0) return [];
  
  const results = mockDiseases.map(disease => {
    const matchedSymptoms = disease.symptoms.filter(symptomId => 
      symptomIds.includes(symptomId)
    );
    const matchScore = matchedSymptoms.length / Math.max(disease.symptoms.length, symptomIds.length);
    
    return {
      disease,
      matchScore,
      matchedSymptoms
    };
  }).filter(result => result.matchedSymptoms.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
  
  return results;
}