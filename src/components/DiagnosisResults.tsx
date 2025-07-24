import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, TrendingUp, Clock, Users, Stethoscope, Eye, FileImage, RotateCcw } from 'lucide-react';
import { diseaseService } from '../services/diseaseService';
import DiseaseDetailModal from './DiseaseDetailModal';

interface DiagnosisResult {
  disease: any;
  confidence: number;
  matchedSymptoms: any[];
  diagnosticSymptoms?: any[];
  totalScore?: number;
  enhancementFactor?: number;
}

interface DiagnosisResultsProps {
  selectedSymptoms: string[];
  onBack: () => void;
  currentLanguage: 'ja' | 'en' | 'ko' | 'zh';
}

const translations = {
  ja: {
    diagnosisCandidates: '診断候補（信頼度順）',
    symptomDiagnosisResults: '症状診断結果',
    backToSymptoms: '症状選択に戻る',
    noMatches: '該当する疾患が見つかりませんでした',
    noMatchesDescription: '選択された症状の組み合わせに一致する皮膚疾患がデータベースに見つかりませんでした。',
    moreSymptoms: 'より多くの症状を選択するか、異なる症状を試してみてください。',
    reselectSymptoms: '症状を再選択',
    topCandidate: '最有力候補',
    overview: '概要',
    matchedSymptoms: '一致した症状',
    emergency: '緊急性あり',
    common: '一般的',
    clickForDetails: '→ クリックで詳細表示',
    importantNotice: '重要な注意事項',
    consultSpecialist: '医療専門家への相談を推奨',
    diagnosticSupportOnly: 'この情報は診断支援目的のものです。症状が続く場合や悪化する場合は、必ず皮膚科専門医にご相談ください。自己判断による治療は症状を悪化させる可能性があります。'
  },
  en: {
    diagnosisCandidates: 'Diagnosis Candidates (by confidence)',
    symptomDiagnosisResults: 'Symptom Diagnosis Results',
    backToSymptoms: 'Back to Symptom Selection',
    noMatches: 'No matching diseases found',
    noMatchesDescription: 'No skin diseases matching the selected symptom combination were found in the database.',
    moreSymptoms: 'Try selecting more symptoms or different symptoms.',
    reselectSymptoms: 'Reselect Symptoms',
    topCandidate: 'Top Candidate',
    overview: 'Overview',
    matchedSymptoms: 'Matched Symptoms',
    emergency: 'Emergency',
    common: 'Common',
    clickForDetails: '→ Click for details',
    importantNotice: 'Important Notice',
    consultSpecialist: 'Consultation with medical professionals recommended',
    diagnosticSupportOnly: 'This information is for diagnostic support purposes. If symptoms persist or worsen, please consult a dermatologist. Self-diagnosis and treatment may worsen symptoms.'
  },
  ko: {
    diagnosisCandidates: '진단 후보 (신뢰도 순)',
    symptomDiagnosisResults: '증상 진단 결과',
    backToSymptoms: '증상 선택으로 돌아가기',
    noMatches: '해당하는 질환을 찾을 수 없습니다',
    noMatchesDescription: '선택된 증상 조합과 일치하는 피부 질환이 데이터베이스에서 발견되지 않았습니다.',
    moreSymptoms: '더 많은 증상을 선택하거나 다른 증상을 시도해보세요.',
    reselectSymptoms: '증상 재선택',
    topCandidate: '최유력 후보',
    overview: '개요',
    matchedSymptoms: '일치하는 증상',
    emergency: '응급상황',
    common: '일반적',
    clickForDetails: '→ 클릭하여 세부사항 보기',
    importantNotice: '중요한 주의사항',
    consultSpecialist: '의료 전문가와의 상담을 권장합니다',
    diagnosticSupportOnly: '이 정보는 진단 지원 목적입니다. 증상이 지속되거나 악화되는 경우 반드시 피부과 전문의와 상담하세요. 자가 진단과 치료는 증상을 악화시킬 수 있습니다.'
  },
  zh: {
    diagnosisCandidates: '诊断候选（按可信度排序）',
    symptomDiagnosisResults: '症状诊断结果',
    backToSymptoms: '返回症状选择',
    noMatches: '未找到匹配的疾病',
    noMatchesDescription: '数据库中未找到与所选症状组合匹配的皮肤疾病。',
    moreSymptoms: '请尝试选择更多症状或不同的症状。',
    reselectSymptoms: '重新选择症状',
    topCandidate: '最有可能',
    overview: '概述',
    matchedSymptoms: '匹配症状',
    emergency: '紧急情况',
    common: '常见',
    clickForDetails: '→ 点击查看详情',
    importantNotice: '重要提示',
    consultSpecialist: '建议咨询医疗专家',
    diagnosticSupportOnly: '此信息仅用于诊断支持目的。如果症状持续或恶化，请务必咨询皮肤科专家。自我诊断和治疗可能会使症状恶化。'
  }
};

// 疾患詳細情報データベース（画像診断と同じデータ）
const conditionDetails = {
  'アトピー性皮膚炎': {
    overview: 'アトピー性皮膚炎は、慢性的にかゆみを伴う湿疹が良くなったり悪くなったりを繰り返す皮膚疾患です。',
    symptoms: [
      '強いかゆみ',
      '皮膚の乾燥',
      '赤み・炎症',
      '皮膚のごわつき',
      '掻き傷による出血',
      '色素沈着'
    ],
    causes: [
      '遺伝的要因（家族歴）',
      'アレルギー体質',
      '皮膚バリア機能の低下',
      '環境要因（ダニ、花粉など）',
      'ストレス',
      '気候変化'
    ],
    treatments: [
      'ステロイド外用薬',
      'タクロリムス軟膏',
      '保湿剤の継続使用',
      '抗ヒスタミン薬（内服）',
      'スキンケア指導',
      '生活習慣の改善'
    ],
    prevention: [
      '適切な保湿ケア',
      'アレルゲンの回避',
      '爪を短く切る',
      '綿素材の衣類着用',
      'ストレス管理',
      '室内環境の整備'
    ],
    prognosis: '適切な治療により症状をコントロールできます。成人までに改善することが多いですが、慢性的な管理が必要な場合もあります。'
  },
  '接触皮膚炎': {
    overview: '接触皮膚炎は、特定の物質との接触により皮膚に炎症が起こる疾患です。アレルギー性と刺激性の2つのタイプがあります。',
    symptoms: [
      '赤み・炎症',
      '強いかゆみ',
      '水疱形成',
      '皮膚の腫れ',
      '痛みや灼熱感',
      '皮膚の剥離',
      '接触部位の境界明瞭な皮疹'
    ],
    causes: [
      'アレルゲン物質（ニッケル、ゴム、香料など）',
      '刺激性物質（洗剤、石鹸、化学薬品）',
      '化粧品・スキンケア製品',
      '植物（うるし、イチョウなど）',
      '金属アレルギー（アクセサリー、時計など）',
      '職業性接触物質'
    ],
    treatments: [
      '原因物質の特定と除去',
      'ステロイド外用薬（中等度〜強力）',
      '抗ヒスタミン薬（内服）',
      '冷湿布・冷却療法',
      'パッチテストによる原因特定',
      '重症例では経口ステロイド'
    ],
    prevention: [
      '原因物質の完全な回避',
      'パッチテストの実施',
      '保護具の使用（手袋など）',
      '低刺激性製品の選択',
      '成分表示の確認',
      '職場環境の改善'
    ],
    prognosis: '原因物質を特定し完全に避けることで症状は改善します。再接触により再発するため、継続的な注意が必要です。'
  },
  '接触性皮膚炎': {
    overview: '接触性皮膚炎は、特定の物質との接触により皮膚に炎症が起こる疾患です。アレルギー性と刺激性の2つのタイプがあります。',
    symptoms: [
      '赤み・炎症',
      '強いかゆみ',
      '水疱形成',
      '皮膚の腫れ',
      '痛みや灼熱感',
      '皮膚の剥離',
      '接触部位の境界明瞭な皮疹'
    ],
    causes: [
      'アレルゲン物質（ニッケル、ゴム、香料など）',
      '刺激性物質（洗剤、石鹸、化学薬品）',
      '化粧品・スキンケア製品',
      '植物（うるし、イチョウなど）',
      '金属アレルギー（アクセサリー、時計など）',
      '職業性接触物質'
    ],
    treatments: [
      '原因物質の特定と除去',
      'ステロイド外用薬（中等度〜強力）',
      '抗ヒスタミン薬（内服）',
      '冷湿布・冷却療法',
      'パッチテストによる原因特定',
      '重症例では経口ステロイド'
    ],
    prevention: [
      '原因物質の完全な回避',
      'パッチテストの実施',
      '保護具の使用（手袋など）',
      '低刺激性製品の選択',
      '成分表示の確認',
      '職場環境の改善'
    ],
    prognosis: '原因物質を特定し完全に避けることで症状は改善します。再接触により再発するため、継続的な注意が必要です。'
  },
  '脂漏性皮膚炎': {
    overview: '脂漏性皮膚炎は、皮脂分泌の多い部位に起こる慢性的な炎症性皮膚疾患です。',
    symptoms: ['鱗屑', '赤み', 'かゆみ', '皮脂の過剰分泌', 'フケ'],
    causes: ['マラセチア菌', '皮脂分泌異常', 'ストレス', '季節変化', '免疫力低下'],
    treatments: ['抗真菌薬外用', 'ステロイド外用薬', '抗真菌シャンプー', '生活習慣改善'],
    prevention: ['適切な洗髪', 'ストレス管理', '規則正しい生活', '栄養バランス'],
    prognosis: '適切な治療により症状をコントロールできますが、再発しやすい疾患です。'
  },
  '乾癬': {
    overview: '乾癬は、皮膚の細胞が異常に速く作られることで起こる慢性的な炎症性皮膚疾患です。',
    symptoms: ['鱗屑を伴う紅斑', 'かゆみ', '皮膚の肥厚', '関節痛', '爪の変化'],
    causes: ['遺伝的要因', '免疫異常', 'ストレス', '感染症', '薬剤'],
    treatments: ['ビタミンD3製剤', 'ステロイド外用薬', '光線療法', '生物学的製剤'],
    prevention: ['ストレス管理', '適度な日光浴', '禁煙', '適正体重維持'],
    prognosis: '慢性疾患ですが、適切な治療により症状をコントロールできます。'
  },
  '帯状疱疹': {
    overview: '帯状疱疹は、水痘・帯状疱疹ウイルスの再活性化により起こる感染症です。',
    symptoms: ['帯状の水疱', '強い痛み', '神経痛', '発熱', '倦怠感'],
    causes: ['ウイルスの再活性化', '免疫力の低下', '加齢', 'ストレス'],
    treatments: ['抗ウイルス薬', '鎮痛薬', 'ステロイド薬', '神経ブロック'],
    prevention: ['ワクチン接種', '免疫力の維持', 'ストレス管理'],
    prognosis: '早期治療により後遺症を予防できます。'
  }
};

export default function DiagnosisResults({ selectedSymptoms, onBack, currentLanguage }: DiagnosisResultsProps) {
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const t = translations[currentLanguage];

  useEffect(() => {
    const performDiagnosis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const diagnosisResults = await diseaseService.getDiseasesBySymptoms(selectedSymptoms);
        setResults(diagnosisResults);
      } catch (err) {
        console.error('診断エラー:', err);
        setError('診断の実行中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    if (selectedSymptoms.length > 0) {
      performDiagnosis();
    }
  }, [selectedSymptoms]);

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'mild': return 'text-yellow-600 bg-yellow-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'severe': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityLabel = (severity: string) => {
    switch(severity) {
      case 'high': return '重度';
      case 'moderate': return '中等度';
      case 'mild': return '軽度';
      case 'low': return '軽微';
      default: return '低リスク';
    }
  };

  const openDetailModal = (disease: any) => {
    setSelectedDisease(disease);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDisease(null);
  };

  // 疾患名の正規化関数（表記ゆれに対応）
  const normalizeDiseaseName = (name: string) => {
    // 接触皮膚炎と接触性皮膚炎を統一
    if (name === '接触皮膚炎' || name === '接触性皮膚炎') {
      return '接触皮膚炎';
    }
    return name;
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
          </div>
          <p className="text-gray-700 font-medium mt-4">AI解析処理中...</p>
          <p className="text-sm text-gray-500 mt-1">症状に基づく診断を実行しています</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">診断エラー</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            症状選択に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <Info className="w-5 h-5 text-white" />
            </div>
            診断候補（信頼度順）
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              症状診断結果
            </span>
            <button
              onClick={onBack}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-gray-200 hover:border-blue-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              症状選択に戻る
            </button>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noMatches}</h3>
            <p className="text-gray-600 mb-4">
              {t.noMatchesDescription}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {t.moreSymptoms}
            </p>
            <button
              onClick={onBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              {t.reselectSymptoms}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div 
                  key={result.disease.id || index} 
                  className="border border-gray-200 rounded-xl p-5 hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => openDetailModal(result.disease.name)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-lg">
                      {result.disease.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getConfidenceColor(result.confidence)}`}>
                        {result.confidence}%
                      </span>
                      {index === 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          {t.topCandidate}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.disease.severity_level)}`}>
                      {getSeverityLabel(result.disease.severity_level)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {result.disease.is_emergency && (
                        <div className="px-3 py-1 rounded-full text-sm font-medium text-red-800 bg-red-200">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          {t.emergency}
                        </div>
                      )}
                      {result.disease.is_common && (
                        <div className="px-3 py-1 rounded-full text-sm font-medium text-green-800 bg-green-200">
                          <Users className="w-3 h-3 inline mr-1" />
                          {t.common}
                        </div>
                      )}
                      <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        {t.clickForDetails}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    <span className="font-semibold text-gray-800">{t.overview}:</span> {result.disease.overview}
                  </p>

                  {result.matchedSymptoms && result.matchedSymptoms.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        {t.matchedSymptoms} ({result.matchedSymptoms.length}{currentLanguage === 'ja' ? '個' : ''})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {result.matchedSymptoms.slice(0, 5).map((symptom, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {symptom.name}
                            {symptom.is_diagnostic && (
                              <span className="ml-1 text-orange-600">●</span>
                            )}
                          </span>
                        ))}
                        {result.matchedSymptoms.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{result.matchedSymptoms.length - 5}{currentLanguage === 'ja' ? '個' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-3 rounded-full transition-all duration-1000 ease-out shadow-sm bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm text-yellow-800">
                  <p className="font-bold mb-2">{t.importantNotice}</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    <li>{translations[currentLanguage].diagnosticSupportTool || 'This system is a diagnostic support tool'}</li>
                    <li>{translations[currentLanguage].consultDoctor || 'Final diagnosis and treatment decisions should be made by a physician'}</li>
                    <li>{translations[currentLanguage].emergencyConsult || 'Consult a specialist immediately if emergency is suspected'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 詳細情報モーダル（画像診断と同じ形式） */}
      {showDetailModal && selectedDisease && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedDisease}</h2>
                <p className="text-sm text-gray-600 mt-1">詳細情報</p>
              </div>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {(() => {
                const normalizedName = normalizeDiseaseName(selectedDisease);
                const details = conditionDetails[normalizedName];
                
                if (!details) {
                  return (
                    <div className="text-center py-8">
                      <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">この疾患の詳細情報は現在準備中です。</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* 概要 */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mr-3">
                          <Info className="w-4 h-4 text-white" />
                        </div>
                        概要
                      </h3>
                      <p className="text-blue-800 leading-relaxed text-base">
                        {details.overview}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* 症状 */}
                      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                        <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                          <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center mr-3">
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                          主な症状
                        </h3>
                        <ul className="space-y-3">
                          {details.symptoms.map((symptom, index) => (
                            <li key={index} className="flex items-center text-red-800">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-4 flex-shrink-0"></div>
                              <span className="text-sm font-medium">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 原因 */}
                      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                        <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center">
                          <div className="w-6 h-6 bg-yellow-600 rounded-md flex items-center justify-center mr-3">
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                          主な原因
                        </h3>
                        <ul className="space-y-3">
                          {details.causes.map((cause, index) => (
                            <li key={index} className="flex items-center text-yellow-800">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-4 flex-shrink-0"></div>
                              <span className="text-sm font-medium">{cause}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 治療法 */}
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                          <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center mr-3">
                            <FileImage className="w-4 h-4 text-white" />
                          </div>
                          治療法
                        </h3>
                        <ul className="space-y-3">
                          {details.treatments.map((treatment, index) => (
                            <li key={index} className="flex items-center text-green-800">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-4 flex-shrink-0"></div>
                              <span className="text-sm font-medium">{treatment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 予防・対策 */}
                      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                        <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                          <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center mr-3">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                          予防・対策
                        </h3>
                        <ul className="space-y-3">
                          {details.prevention.map((prevention, index) => (
                            <li key={index} className="flex items-center text-purple-800">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 flex-shrink-0"></div>
                              <span className="text-sm font-medium">{prevention}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 予後 */}
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                      <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                        <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center mr-3">
                          <Info className="w-4 h-4 text-white" />
                        </div>
                        予後・見通し
                      </h3>
                      <p className="text-indigo-800 leading-relaxed text-base font-medium">
                        {details.prognosis}
                      </p>
                    </div>

                    {/* 注意事項 */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm text-orange-800">
                          <p className="font-bold mb-2 text-base">{t.consultSpecialist}</p>
                          <p className="leading-relaxed">
                            {t.diagnosticSupportOnly}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}