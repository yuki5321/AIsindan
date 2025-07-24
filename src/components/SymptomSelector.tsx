import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Plus, AlertCircle } from 'lucide-react';
import { diseaseService } from '../services/diseaseService';
import { isSupabaseConfigured } from '../lib/supabase';

interface Symptom {
  id: string;
  name: string;
  name_en: string;
  description: string;
  severity_weight: number;
  is_primary: boolean;
  category_id?: string;
  search_keywords?: string[];
}

interface SymptomCategory {
  id: string;
  name: string;
  name_en: string;
}

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
  onDiagnose: () => void;
  currentLanguage: 'ja' | 'en' | 'ko' | 'zh';
}

const translations = {
  ja: {
    selectSymptoms: '症状を選択',
    startDiagnosis: '診断開始',
    symptoms: '個の症状',
    demoMode: 'デモモードで動作中',
    demoDescription: '完全な機能を使用するには、右上の「Connect to Supabase」ボタンをクリックしてデータベースに接続してください。',
    searchPlaceholder: '症状を検索... (例: かゆみ、発疹、痛み)',
    all: 'すべて',
    selectedSymptoms: '選択された症状',
    availableSymptoms: '利用可能な症状',
    noResults: '検索条件に一致する症状が見つかりませんでした。',
    tryDifferent: '別のキーワードで検索してみてください。',
    primarySymptom: '主要症状',
    retry: '再試行',
    startWithSelected: '選択した症状で診断を開始'
  },
  en: {
    selectSymptoms: 'Select Symptoms',
    startDiagnosis: 'Start Diagnosis',
    symptoms: ' symptoms',
    demoMode: 'Running in demo mode',
    demoDescription: 'To use full functionality, click the "Connect to Supabase" button in the top right to connect to the database.',
    searchPlaceholder: 'Search symptoms... (e.g., itching, rash, pain)',
    all: 'All',
    selectedSymptoms: 'Selected Symptoms',
    availableSymptoms: 'Available Symptoms',
    noResults: 'No symptoms found matching the search criteria.',
    tryDifferent: 'Try searching with different keywords.',
    primarySymptom: 'Primary Symptom',
    retry: 'Retry',
    startWithSelected: 'Start diagnosis with selected symptoms'
  },
  ko: {
    selectSymptoms: '증상 선택',
    startDiagnosis: '진단 시작',
    symptoms: '개 증상',
    demoMode: '데모 모드로 실행 중',
    demoDescription: '전체 기능을 사용하려면 오른쪽 상단의 "Connect to Supabase" 버튼을 클릭하여 데이터베이스에 연결하세요.',
    searchPlaceholder: '증상 검색... (예: 가려움, 발진, 통증)',
    all: '전체',
    selectedSymptoms: '선택된 증상',
    availableSymptoms: '사용 가능한 증상',
    noResults: '검색 조건에 맞는 증상을 찾을 수 없습니다.',
    tryDifferent: '다른 키워드로 검색해보세요.',
    primarySymptom: '주요 증상',
    retry: '재시도',
    startWithSelected: '선택한 증상으로 진단 시작'
  },
  zh: {
    selectSymptoms: '选择症状',
    startDiagnosis: '开始诊断',
    symptoms: '个症状',
    demoMode: '演示模式运行中',
    demoDescription: '要使用完整功能，请点击右上角的"Connect to Supabase"按钮连接到数据库。',
    searchPlaceholder: '搜索症状... (例如：瘙痒、皮疹、疼痛)',
    all: '全部',
    selectedSymptoms: '已选择的症状',
    availableSymptoms: '可用症状',
    noResults: '未找到符合搜索条件的症状。',
    tryDifferent: '请尝试使用不同的关键词搜索。',
    primarySymptom: '主要症状',
    retry: '重试',
    startWithSelected: '使用选择的症状开始诊断'
  }
};

export default function SymptomSelector({ selectedSymptoms, onSymptomsChange, onDiagnose, currentLanguage }: SymptomSelectorProps) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [categories, setCategories] = useState<SymptomCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();
  const t = translations[currentLanguage];

  const loadSymptoms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [symptomsData, categoriesData] = await Promise.all([
        diseaseService.getSymptomsByCategory(selectedCategory || undefined),
        diseaseService.getSymptomCategories()
      ]);
      
      setSymptoms(symptomsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('症状読み込みエラー:', err);
      setError('症状データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSymptoms();
  }, [selectedCategory]);

  const filteredSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return symptoms;
    
    const query = searchQuery.toLowerCase();
    return symptoms.filter(symptom => 
      symptom.name.toLowerCase().includes(query) ||
      symptom.name_en.toLowerCase().includes(query) ||
      symptom.description.toLowerCase().includes(query) ||
      (symptom.search_keywords && symptom.search_keywords.some(keyword => 
        keyword.toLowerCase().includes(query)
      ))
    );
  }, [symptoms, searchQuery]);

  const handleSymptomToggle = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      onSymptomsChange(selectedSymptoms.filter(id => id !== symptomId));
    } else {
      onSymptomsChange([...selectedSymptoms, symptomId]);
    }
  };

  const getSelectedSymptomNames = () => {
    return selectedSymptoms.map(id => {
      const symptom = symptoms.find(s => s.id === id);
      return symptom ? symptom.name : id;
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {!isConfigured && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">{t.demoMode}</p>
            <p>{t.demoDescription}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.selectSymptoms}</h2>
        {selectedSymptoms.length > 0 && (
          <button
            onClick={onDiagnose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.startDiagnosis} ({selectedSymptoms.length}{t.symptoms})
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={loadSymptoms}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            {t.retry}
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedCategory === '' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.all}
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.selectedSymptoms}</h3>
          <div className="flex flex-wrap gap-2">
            {getSelectedSymptomNames().map((name, index) => (
              <span
                key={selectedSymptoms[index]}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {name}
                <button
                  onClick={() => handleSymptomToggle(selectedSymptoms[index])}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t.availableSymptoms} ({filteredSymptoms.length}{currentLanguage === 'ja' ? '件' : ''})
        </h3>
        
        {filteredSymptoms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>{t.noResults}</p>
            <p className="text-sm mt-1">{t.tryDifferent}</p>
          </div>
        ) : (
          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {filteredSymptoms.map(symptom => (
              <div
                key={symptom.id}
                onClick={() => handleSymptomToggle(symptom.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedSymptoms.includes(symptom.id)
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{symptom.name}</h4>
                      <span className="text-sm text-gray-500">({symptom.name_en})</span>
                      {symptom.is_primary && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
                          {t.primarySymptom}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{symptom.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedSymptoms.includes(symptom.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedSymptoms.includes(symptom.id) && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSymptoms.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onDiagnose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t.startWithSelected} ({selectedSymptoms.length}{t.symptoms})
          </button>
        </div>
      )}
    </div>
  );
}