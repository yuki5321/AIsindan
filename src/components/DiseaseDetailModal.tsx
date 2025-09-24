import React, { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, Pill, Activity, ExternalLink, Star } from 'lucide-react';
import { diseaseService } from '../services/diseaseService';
import { Disease, Symptom, Treatment } from '../lib/supabase';

interface DiseaseDetailModalProps {
  disease: Disease;
  onClose: () => void;
  currentLanguage: 'ja' | 'en' | 'ko' | 'zh'; // この行を追加
}

const DiseaseDetailModal: React.FC<DiseaseDetailModalProps> = ({ 
  disease, 
  onClose, 
  currentLanguage // この引数も追加
}) => {
  // 言語に応じたテキストを取得する関数を追加
  type LanguageKey = 'ja' | 'en' | 'ko' | 'zh';
  type TextsMap = { [key: string]: string };
  const getLocalizedText = (key: string) => {
    const texts: Record<LanguageKey, TextsMap> = {
      ja: {
        diseaseDetail: '疾患詳細',
        overview: '概要',
        symptoms: '症状',
        treatments: '治療法',
        relatedInfo: '関連情報',
        common: '一般的',
        emergency: '緊急性あり',
        chronic: '慢性疾患',
        acute: '急性疾患',
        geneticFactor: '遺伝要因あり',
        noGeneticFactor: '遺伝要因なし',
        prevalence: '発症率',
        loading: '詳細情報を読み込み中...',
        loadError: '詳細情報の読み込みに失敗しました',
        close: '閉じる',
        basicInfo: '基本情報',
        category: 'カテゴリ',
        genderTendency: '性別傾向',
        infectivity: '感染性',
        both: '男女共通',
        male: '男性に多い',
        female: '女性に多い',
        yes: 'あり',
        no: 'なし',
        primarySymptom: '主要症状',
        diagnostic: '診断的',
        relevance: '関連度',
        frequency: '出現頻度',
        importance: '重要度',
        noSymptoms: '症状情報がありません',
        effectiveness: '有効性',
        firstChoice: '第一選択',
        evidence: 'エビデンス',
        dosage: '用法・用量',
        duration: '治療期間',
        sideEffects: '副作用',
        noTreatments: '治療法情報がありません',
        medicalConsultation: '医療専門家への相談を推奨',
        disclaimer: 'この情報は診断支援目的のものです。症状が続く場合や悪化する場合は、必ず皮膚科専門医にご相談ください。自己判断による治療は症状を悪化させる可能性があります。'
      },
      en: {
        diseaseDetail: 'Disease Details',
        overview: 'Overview',
        symptoms: 'Symptoms',
        treatments: 'Treatments',
        relatedInfo: 'Related Information',
        common: 'Common',
        emergency: 'Emergency',
        chronic: 'Chronic Disease',
        acute: 'Acute Disease',
        geneticFactor: 'Genetic Factor',
        noGeneticFactor: 'No Genetic Factor',
        prevalence: 'Prevalence',
        loading: 'Loading detailed information...',
        loadError: 'Failed to load detailed information',
        close: 'Close',
        basicInfo: 'Basic Information',
        category: 'Category',
        genderTendency: 'Gender Tendency',
        infectivity: 'Infectivity',
        both: 'Both Genders',
        male: 'More Common in Males',
        female: 'More Common in Females',
        yes: 'Yes',
        no: 'No',
        primarySymptom: 'Primary Symptom',
        diagnostic: 'Diagnostic',
        relevance: 'Relevance',
        frequency: 'Frequency',
        importance: 'Importance',
        noSymptoms: 'No symptom information available',
        effectiveness: 'Effectiveness',
        firstChoice: 'First Choice',
        evidence: 'Evidence',
        dosage: 'Dosage',
        duration: 'Duration',
        sideEffects: 'Side Effects',
        noTreatments: 'No treatment information available',
        medicalConsultation: 'Consultation with medical professionals recommended',
        disclaimer: 'This information is for diagnostic support purposes. If symptoms persist or worsen, please consult a dermatologist. Self-treatment may worsen symptoms.'
      },
      ko: {
        diseaseDetail: '질병 세부사항',
        overview: '개요',
        symptoms: '증상',
        treatments: '치료법',
        relatedInfo: '관련 정보',
        common: '일반적',
        emergency: '응급',
        chronic: '만성 질환',
        acute: '급성 질환',
        geneticFactor: '유전적 요인 있음',
        noGeneticFactor: '유전적 요인 없음',
        prevalence: '유병률',
        loading: '세부 정보를 불러오는 중...',
        loadError: '세부 정보 불러오기 실패',
        close: '닫기',
        basicInfo: '기본 정보',
        category: '카테고리',
        genderTendency: '성별 경향',
        infectivity: '감염성',
        both: '남녀 공통',
        male: '남성에게 많음',
        female: '여성에게 많음',
        yes: '있음',
        no: '없음',
        primarySymptom: '주요 증상',
        diagnostic: '진단적',
        relevance: '관련성',
        frequency: '빈도',
        importance: '중요도',
        noSymptoms: '증상 정보가 없습니다',
        effectiveness: '효과',
        firstChoice: '1차 선택',
        evidence: '근거',
        dosage: '용법·용량',
        duration: '치료 기간',
        sideEffects: '부작용',
        noTreatments: '치료법 정보가 없습니다',
        medicalConsultation: '의료 전문가와의 상담 권장',
        disclaimer: '이 정보는 진단 지원 목적입니다. 증상이 지속되거나 악화될 경우 피부과 전문의와 상담하세요. 자가 치료는 증상을 악화시킬 수 있습니다.'
      },
      zh: {
        diseaseDetail: '疾病详情',
        overview: '概述',
        symptoms: '症状',
        treatments: '治疗方法',
        relatedInfo: '相关信息',
        common: '常见',
        emergency: '紧急',
        chronic: '慢性疾病',
        acute: '急性疾病',
        geneticFactor: '有遗传因素',
        noGeneticFactor: '无遗传因素',
        prevalence: '患病率',
        loading: '正在加载详细信息...',
        loadError: '加载详细信息失败',
        close: '关闭',
        basicInfo: '基本信息',
        category: '类别',
        genderTendency: '性别倾向',
        infectivity: '感染性',
        both: '男女都有',
        male: '男性较多',
        female: '女性较多',
        yes: '有',
        no: '无',
        primarySymptom: '主要症状',
        diagnostic: '诊断性',
        relevance: '相关性',
        frequency: '频率',
        importance: '重要性',
        noSymptoms: '无症状信息',
        effectiveness: '有效性',
        firstChoice: '首选',
        evidence: '证据',
        dosage: '用法用量',
        duration: '治疗期间',
        sideEffects: '副作用',
        noTreatments: '无治疗信息',
        medicalConsultation: '建议咨询医疗专家',
        disclaimer: '此信息仅用于诊断支持。如果症状持续或恶化，请咨询皮肤科专家。自我治疗可能会使症状恶化。'
      }
    };
    
    return texts[currentLanguage]?.[key] || texts.ja[key] || key;
  };

  const [details, setDetails] = useState<{
    disease: Disease;
    symptoms: Symptom[];
    treatments: Treatment[];
    relatedDiseases: Disease[];
    medicalImages: unknown[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'symptoms' | 'treatments' | 'related'>('overview');

  const loadDiseaseDetails = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // 疾患の基本情報を取得
      const diseaseData = await diseaseService.getDiseaseById(disease.id);
      
      // 関連する症状を取得
      const symptomsData = await diseaseService.getSymptomsByCategory();
      
      // 治療法を取得
      const treatmentsData = await diseaseService.getTreatmentsByDiseaseId(disease.id);
      
      // 関連疾患は空配列で初期化（必要に応じて実装）
      const relatedDiseases: Disease[] = [];
      
      setDetails({
        disease: diseaseData || disease,
        symptoms: symptomsData || [],
        treatments: treatmentsData || [],
        relatedDiseases,
        medicalImages: []
      });
    } catch (error) {
      console.error('疾患詳細読み込みエラー:', error);
      // エラーが発生した場合は、渡された疾患データを使用
      setDetails({
        disease: disease,
        symptoms: [],
        treatments: [],
        relatedDiseases: [],
        medicalImages: []
      });
    } finally {
      setLoading(false);
    }
  }, [disease]);

  useEffect(() => {
    loadDiseaseDetails();
  }, [disease.id, loadDiseaseDetails]);

  const getSeverityColor = (severity: string) => {
    const colors = {
      'low': 'bg-blue-100 text-blue-800 border-blue-200',
      'mild': 'bg-green-100 text-green-800 border-green-200',
      'moderate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'severe': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity as keyof typeof colors] || colors.mild;
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      'low': '軽微',
      'mild': '軽度',
      'moderate': '中等度',
      'high': '重度',
      'severe': '重篤'
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  const getEvidenceColor = (level: string) => {
    const colors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-gray-100 text-gray-800'
    };
    return colors[level as keyof typeof colors] || colors.C;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">{getLocalizedText('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{getLocalizedText('loadError')}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {getLocalizedText('close')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 w-full">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{details.disease.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(details.disease.severity_level)}`}>
                {getSeverityLabel(details.disease.severity_level)}
              </span>
              {details.disease.is_common && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200">
                  {getLocalizedText('common')}
                </span>
              )}
              {details.disease.is_emergency && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full border border-red-200">
                  {getLocalizedText('emergency')}
                </span>
              )}
            </div>
            <p className="text-gray-600">{details.disease.name_en}</p>
            <p className="text-sm text-gray-500 mt-1">
              {getLocalizedText('prevalence')}: {(details.disease.prevalence * 100).toFixed(2)}% | 
              {details.disease.chronic ? ` ${getLocalizedText('chronic')}` : ` ${getLocalizedText('acute')}`} |
              {details.disease.genetic_factor ? ` ${getLocalizedText('geneticFactor')}` : ` ${getLocalizedText('noGeneticFactor')}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* タブナビゲーション */}
        <div className="flex border-b border-gray-200 px-8">
          {[
            { key: 'overview', label: getLocalizedText('overview'), icon: Info },
            { key: 'symptoms', label: getLocalizedText('symptoms'), icon: Activity },
            { key: 'treatments', label: getLocalizedText('treatments'), icon: Pill },
            { key: 'related', label: getLocalizedText('relatedInfo'), icon: ExternalLink }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'overview' | 'symptoms' | 'treatments' | 'related')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 border-b-2 ${
                activeTab === tab.key
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.key === 'symptoms' && details.symptoms.length > 0 && (
                <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1">
                  {details.symptoms.length}
                </span>
              )}
              {tab.key === 'treatments' && details.treatments.length > 0 && (
                <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1">
                  {details.treatments.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  {getLocalizedText('diseaseDetail')}
                </h3>
                <p className="text-blue-800 leading-relaxed mb-4">{details.disease.overview}</p>
                {details.disease.detailed_description && (
                  <p className="text-blue-700 leading-relaxed text-sm">
                    {details.disease.detailed_description}
                  </p>
                )}
              </div>

              {/* 基本情報 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">{getLocalizedText('basicInfo')}</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{getLocalizedText('category')}:</span>
                      <span className="font-medium">{details.disease.disease_categories?.name || '未分類'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{getLocalizedText('prevalence')}:</span>
                      <span className="font-medium">{(details.disease.prevalence * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{getLocalizedText('genderTendency')}:</span>
                      <span className="font-medium">
                        {details.disease.gender_preference === 'both' ? getLocalizedText('both') :
                         details.disease.gender_preference === 'male' ? getLocalizedText('male') : getLocalizedText('female')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{getLocalizedText('infectivity')}:</span>
                      <span className="font-medium">{details.disease.contagious ? getLocalizedText('yes') : getLocalizedText('no')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">特徴</h4>
                  <div className="space-y-2">
                    {details.disease.is_common && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mr-2 mb-2">
                        {getLocalizedText('common')}
                      </span>
                    )}
                    {details.disease.is_emergency && (
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full mr-2 mb-2">
                        {getLocalizedText('emergency')}
                      </span>
                    )}
                    {details.disease.chronic && (
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full mr-2 mb-2">
                        {getLocalizedText('chronic')}
                      </span>
                    )}
                    {details.disease.genetic_factor && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full mr-2 mb-2">
                        {getLocalizedText('geneticFactor')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'symptoms' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{getLocalizedText('symptoms')}</h3>
              {details.symptoms.length > 0 ? (
                <div className="grid gap-4">
                  {details.symptoms.map(symptom => (
                    <div key={symptom.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{symptom.name}</h4>
                            {symptom.is_primary && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                {getLocalizedText('primarySymptom')}
                              </span>
                            )}
                            {symptom.is_diagnostic && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                {getLocalizedText('diagnostic')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{symptom.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{getLocalizedText('relevance')}: {symptom.relevance_score?.toFixed(1) || 'N/A'}</span>
                            <span>{getLocalizedText('frequency')}: {symptom.frequency_percentage || 'N/A'}%</span>
                            <span>{getLocalizedText('importance')}: {symptom.severity_weight.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              style={{ width: `${(symptom.relevance_score || 0) * 33.33}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>{getLocalizedText('noSymptoms')}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'treatments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{getLocalizedText('treatments')}</h3>
              {details.treatments.length > 0 ? (
                <div className="grid gap-4">
                  {details.treatments.map(treatment => (
                    <div key={treatment.id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-bold text-gray-900">{treatment.name}</h4>
                            {treatment.first_line && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                {getLocalizedText('firstChoice')}
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full ${getEvidenceColor(treatment.evidence_level)}`}>
                              {getLocalizedText('evidence')}{treatment.evidence_level}
                            </span>
                          </div>
                          {treatment.name_en && (
                            <p className="text-sm text-gray-500 mb-2">{treatment.name_en}</p>
                          )}
                          {treatment.description && (
                            <p className="text-sm text-gray-700 mb-3">{treatment.description}</p>
                          )}
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            {treatment.dosage && (
                              <div>
                                <span className="font-medium text-gray-700">{getLocalizedText('dosage')}:</span>
                                <p className="text-gray-600">{treatment.dosage}</p>
                              </div>
                            )}
                            {treatment.duration && (
                              <div>
                                <span className="font-medium text-gray-700">{getLocalizedText('duration')}:</span>
                                <p className="text-gray-600">{treatment.duration}</p>
                              </div>
                            )}
                          </div>

                          {treatment.side_effects && treatment.side_effects.length > 0 && (
                            <div className="mt-3">
                              <span className="font-medium text-gray-700 text-sm">{getLocalizedText('sideEffects')}:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {treatment.side_effects.map((effect, index) => (
                                  <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                    {effect}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className="text-sm text-gray-600 mb-1">{getLocalizedText('effectiveness')}</div>
                          <div className="text-lg font-bold text-blue-600">
                            {(treatment.effectiveness_score * 33.33).toFixed(0)}%
                          </div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                              style={{ width: `${treatment.effectiveness_score * 33.33}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>{getLocalizedText('noTreatments')}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'related' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{getLocalizedText('relatedInfo')}</h3>
              
              {/* ICD-10コード */}
              {details.disease.icd10_code && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">{getLocalizedText('icd10_code')}</h4>
                  <p className="text-blue-800 font-mono">{details.disease.icd10_code}</p>
                </div>
              )}

              {/* 検索キーワード */}
              {details.disease.search_keywords && details.disease.search_keywords.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">{getLocalizedText('relatedKeywords')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {details.disease.search_keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 年齢層・季節性 */}
              <div className="grid md:grid-cols-2 gap-4">
                {details.disease.age_group && details.disease.age_group.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">{getLocalizedText('ageGroup')}</h4>
                    <div className="flex flex-wrap gap-1">
                      {details.disease.age_group.map((age, index) => (
                        <span key={index} className="px-2 py-1 bg-green-200 text-green-800 text-sm rounded">
                          {age}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {details.disease.seasonal_pattern && details.disease.seasonal_pattern.length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-2">{getLocalizedText('seasonalPattern')}</h4>
                    <div className="flex flex-wrap gap-1">
                      {details.disease.seasonal_pattern.map((season, index) => (
                        <span key={index} className="px-2 py-1 bg-yellow-200 text-yellow-800 text-sm rounded">
                          {season}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 関連疾患 */}
              {details.relatedDiseases.length > 0 ? (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">{getLocalizedText('relatedDiseases')}</h4>
                  <div className="grid gap-4">
                    {details.relatedDiseases.map(relatedDisease => (
                      <div key={relatedDisease.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{relatedDisease.name}</h4>
                            <p className="text-sm text-gray-500 mb-2">{relatedDisease.name_en}</p>
                            <p className="text-sm text-gray-700">{relatedDisease.overview}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(relatedDisease.severity_level)}`}>
                            {getSeverityLabel(relatedDisease.severity_level)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>{getLocalizedText('noRelatedDiseases')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-gradient-to-r from-yellow-50 to-orange-50 border-t-2 border-yellow-200 px-8 py-4">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-bold mb-1">{getLocalizedText('medicalConsultation')}</p>
              <p>
                {getLocalizedText('disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetailModal;