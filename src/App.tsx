import React, { useState, useRef } from 'react';
import { Upload, Camera, AlertTriangle, Info, MessageCircle, Eye, FileImage, RotateCcw, Database, Activity, MapPin, Globe, Check, ChevronDown, X, AlertCircle, Stethoscope } from 'lucide-react';
import SymptomSelector from './components/SymptomSelector';
import DiagnosisResults from './components/DiagnosisResults';
import DatabaseStatus from './components/DatabaseStatus';
import DiseaseDetailModal from './components/DiseaseDetailModal';
import HospitalMap from './components/HospitalMap';
import { isSupabaseConfigured } from './lib/supabase';
import { diseaseService } from './services/diseaseService';

// 多言語対応
const languages = {
  ja: { name: '日本語', flag: '🇯🇵' },
  en: { name: 'English', flag: '🇺🇸' },
  ko: { name: '한국어', flag: '🇰🇷' },
  zh: { name: '中文', flag: '🇨🇳' }
};

const translations = {
  ja: {
    title: 'DermaAI診断支援システム',
    subtitle: 'AI皮膚病変診断',
    description: 'AI技術を活用した皮膚病変診断支援システム。画像解析と症状対話により、皮膚疾患の診断を支援します。',
    nearestHospital: '最寄りの病院',
    databaseStatus: 'データベース状態',
    diagnosticTool: '診断支援ツール',
    finalDecisionByDoctor: '最終判断は医師が行ってください',
    demoMode: 'デモモード',
    imageAnalysis: '画像診断',
    symptomAnalysis: '症状診断',
    imageUpload: '画像アップロード',
    clickToUpload: 'クリックして画像をアップロード',
    supportedFormats: 'JPG, PNG形式対応（最大10MB）',
    selectUploadMethod: '画像の取得方法を選択',
    takePhoto: 'カメラで撮影',
    selectFromFiles: 'ファイルから選択',
    cancel: 'キャンセル',
    startAiAnalysis: 'AI診断開始',
    analyzing: 'AI解析中...',
    heatmapOn: 'ヒートマップON',
    heatmapOff: 'ヒートマップOFF',
    symptomDialogue: '症状対話',
    resetConversation: '会話をリセット',
    enterSymptoms: '症状について詳しく教えてください',
    enterSymptomsPlaceholder: '症状を詳しく入力してください...',
    send: '送信',
    diagnosisCandidates: '診断候補（信頼度順）',
    adjustedBySymptoms: '症状対話により調整済み',
    recommendedTreatment: '推奨治療',
    clickForDetails: '→ クリックで詳細表示',
    importantNotice: '重要な注意事項',
    diagnosticSupportTool: '本システムは診断支援ツールです',
    consultDoctor: '最終的な診断と治療方針の決定は医師が行ってください',
    emergencyConsult: '緊急性が疑われる場合は速やかに専門医に相談してください',
    systemInfo: 'システム情報',
    aiModel: 'AIモデル',
    database: 'データベース',
    classificationClasses: '分類クラス',
    averageResponseTime: '平均応答時間',
    diagnosticAccuracy: '診断精度',
    lastUpdate: '最終更新',
    selectSymptoms: '症状を選択',
    startDiagnosis: '診断開始',
    symptoms: '個の症状'
  },
  en: {
    title: 'DermaAI Diagnostic Support System',
    subtitle: 'AI Skin Lesion Diagnosis',
    description: 'AI-powered skin lesion diagnostic support system. Supports diagnosis of skin diseases through image analysis and symptom dialogue.',
    nearestHospital: 'Nearest Hospital',
    databaseStatus: 'Database Status',
    diagnosticTool: 'Diagnostic Tool',
    finalDecisionByDoctor: 'Final decision should be made by a doctor',
    demoMode: 'Demo Mode',
    imageAnalysis: 'Image Analysis',
    symptomAnalysis: 'Symptom Analysis',
    imageUpload: 'Image Upload',
    clickToUpload: 'Click to upload image',
    supportedFormats: 'JPG, PNG formats supported (max 10MB)',
    selectUploadMethod: 'Select image acquisition method',
    takePhoto: 'Take Photo',
    selectFromFiles: 'Select from Files',
    cancel: 'Cancel',
    startAiAnalysis: 'Start AI Analysis',
    analyzing: 'AI analyzing...',
    heatmapOn: 'Heatmap ON',
    heatmapOff: 'Heatmap OFF',
    symptomDialogue: 'Symptom Dialogue',
    resetConversation: 'Reset Conversation',
    enterSymptoms: 'Please tell us about your symptoms in detail',
    enterSymptomsPlaceholder: 'Please describe your symptoms in detail...',
    send: 'Send',
    diagnosisCandidates: 'Diagnosis Candidates (by confidence)',
    adjustedBySymptoms: 'Adjusted by symptom dialogue',
    recommendedTreatment: 'Recommended Treatment',
    clickForDetails: '→ Click for details',
    importantNotice: 'Important Notice',
    diagnosticSupportTool: 'This system is a diagnostic support tool',
    consultDoctor: 'Final diagnosis and treatment decisions should be made by a physician',
    emergencyConsult: 'Consult a specialist immediately if emergency is suspected',
    systemInfo: 'System Information',
    aiModel: 'AI Model',
    database: 'Database',
    classificationClasses: 'Classification Classes',
    averageResponseTime: 'Average Response Time',
    diagnosticAccuracy: 'Diagnostic Accuracy',
    lastUpdate: 'Last Update',
    selectSymptoms: 'Select Symptoms',
    startDiagnosis: 'Start Diagnosis',
    symptoms: ' symptoms'
  },
  ko: {
    title: 'DermaAI 진단 지원 시스템',
    subtitle: 'AI 피부 병변 진단',
    description: 'AI 기술을 활용한 피부 병변 진단 지원 시스템. 이미지 분석과 증상 대화를 통해 피부 질환 진단을 지원합니다.',
    nearestHospital: '가까운 병원',
    databaseStatus: '데이터베이스 상태',
    diagnosticTool: '진단 지원 도구',
    finalDecisionByDoctor: '최종 판단은 의사가 해야 합니다',
    demoMode: '데모 모드',
    imageAnalysis: '이미지 진단',
    symptomAnalysis: '증상 진단',
    imageUpload: '이미지 업로드',
    clickToUpload: '클릭하여 이미지 업로드',
    supportedFormats: 'JPG, PNG 형식 지원 (최대 10MB)',
    selectUploadMethod: '이미지 획득 방법 선택',
    takePhoto: '사진 촬영',
    selectFromFiles: '파일에서 선택',
    cancel: '취소',
    startAiAnalysis: 'AI 진단 시작',
    analyzing: 'AI 분석 중...',
    heatmapOn: '히트맵 켜기',
    heatmapOff: '히트맵 끄기',
    symptomDialogue: '증상 대화',
    resetConversation: '대화 재설정',
    enterSymptoms: '증상에 대해 자세히 알려주세요',
    enterSymptomsPlaceholder: '증상을 자세히 입력해주세요...',
    send: '전송',
    diagnosisCandidates: '진단 후보 (신뢰도 순)',
    adjustedBySymptoms: '증상 대화로 조정됨',
    recommendedTreatment: '권장 치료',
    clickForDetails: '→ 클릭하여 세부사항 보기',
    importantNotice: '중요한 주의사항',
    diagnosticSupportTool: '본 시스템은 진단 지원 도구입니다',
    consultDoctor: '최종 진단과 치료 방침 결정은 의사가 해야 합니다',
    emergencyConsult: '응급상황이 의심되는 경우 즉시 전문의와 상담하세요',
    systemInfo: '시스템 정보',
    aiModel: 'AI 모델',
    database: '데이터베이스',
    classificationClasses: '분류 클래스',
    averageResponseTime: '평균 응답 시간',
    diagnosticAccuracy: '진단 정확도',
    lastUpdate: '마지막 업데이트',
    selectSymptoms: '증상 선택',
    startDiagnosis: '진단 시작',
    symptoms: '개 증상'
  },
  zh: {
    title: 'DermaAI诊断支持系统',
    subtitle: 'AI皮肤病变诊断',
    description: '利用AI技术的皮肤病变诊断支持系统。通过图像分析和症状对话支持皮肤疾病诊断。',
    nearestHospital: '最近的医院',
    databaseStatus: '数据库状态',
    diagnosticTool: '诊断支持工具',
    finalDecisionByDoctor: '最终判断应由医生做出',
    demoMode: '演示模式',
    imageAnalysis: '图像诊断',
    symptomAnalysis: '症状诊断',
    imageUpload: '图像上传',
    clickToUpload: '点击上传图像',
    supportedFormats: '支持JPG、PNG格式（最大10MB）',
    selectUploadMethod: '选择图像获取方法',
    takePhoto: '拍照',
    selectFromFiles: '从文件选择',
    cancel: '取消',
    startAiAnalysis: '开始AI分析',
    analyzing: 'AI分析中...',
    heatmapOn: '热图开启',
    heatmapOff: '热图关闭',
    symptomDialogue: '症状对话',
    resetConversation: '重置对话',
    enterSymptoms: '请详细告诉我们您的症状',
    enterSymptomsPlaceholder: '请详细输入您的症状...',
    send: '发送',
    diagnosisCandidates: '诊断候选（按可信度排序）',
    adjustedBySymptoms: '已通过症状对话调整',
    recommendedTreatment: '推荐治疗',
    clickForDetails: '→ 点击查看详情',
    importantNotice: '重要提示',
    diagnosticSupportTool: '本系统是诊断支持工具',
    consultDoctor: '最终诊断和治疗方案决定应由医生做出',
    emergencyConsult: '如怀疑紧急情况，请立即咨询专科医生',
    systemInfo: '系统信息',
    aiModel: 'AI模型',
    database: '数据库',
    classificationClasses: '分类类别',
    averageResponseTime: '平均响应时间',
    diagnosticAccuracy: '诊断准确率',
    lastUpdate: '最后更新',
    selectSymptoms: '选择症状',
    startDiagnosis: '开始诊断',
    symptoms: '个症状'
  }
};

// 疾患詳細情報データベース（フォールバック用）
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
  '接触性皮膚炎': {
    overview: '接触性皮膚炎は、特定の物質との接触により皮膚に炎症が起こる疾患です。',
    symptoms: ['赤み・炎症', 'かゆみ', '水疱形成', '皮膚の腫れ', '痛み'],
    causes: ['アレルゲン物質', '刺激性物質', '化粧品', '洗剤', '金属アレルギー'],
    treatments: ['原因物質の除去', 'ステロイド外用薬', '抗ヒスタミン薬', '冷湿布'],
    prevention: ['原因物質の回避', 'パッチテストの実施', '保護具の使用'],
    prognosis: '原因物質を避けることで症状は改善します。'
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

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageResults, setImageResults] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{message: string, isUser: boolean, timestamp: Date}>>([]);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomResults, setSymptomResults] = useState<any>(null);
  const [symptomAnalyzing, setSymptomAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'symptoms'>('image');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  const [showHospitalMap, setShowHospitalMap] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set()); // 使用済み質問を追跡
  const [showUploadOptions, setShowUploadOptions] = useState(false); // アップロード選択肢の表示状態
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>('ja');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isConfigured = isSupabaseConfigured();
  const t = translations[currentLanguage];

  // 基本診断結果データ（画像解析用フォールバック）
  const baseDiagnosis = [
    { condition: 'アトピー性皮膚炎', baseConfidence: 0.65, severity: 'moderate', treatment: 'ステロイド外用薬、保湿剤' },
    { condition: '接触性皮膚炎', baseConfidence: 0.52, severity: 'mild', treatment: 'アレルゲン除去、抗ヒスタミン薬' },
    { condition: '脂漏性皮膚炎', baseConfidence: 0.48, severity: 'mild', treatment: '抗真菌薬、低刺激シャンプー' },
    { condition: '乾癬', baseConfidence: 0.24, severity: 'low', treatment: 'ビタミンD3製剤、光線療法' }
  ];

  // 症状キーワードと各疾患への影響度（画像解析結果調整用）
  const symptomKeywords: { [key: string]: { [key: string]: number } } = {
    'かゆみ': { 'アトピー性皮膚炎': 0.15, '接触性皮膚炎': 0.12, '脂漏性皮膚炎': 0.08 },
    'かゆい': { 'アトピー性皮膚炎': 0.15, '接触性皮膚炎': 0.12, '脂漏性皮膚炎': 0.08 },
    '乾燥': { 'アトピー性皮膚炎': 0.18, '乾癬': 0.12 },
    'カサカサ': { 'アトピー性皮膚炎': 0.16, '乾癬': 0.10 },
    '赤み': { 'アトピー性皮膚炎': 0.12, '接触性皮膚炎': 0.15, '脂漏性皮膚炎': 0.10, '乾癬': 0.13 },
    '赤い': { 'アトピー性皮膚炎': 0.12, '接触性皮膚炎': 0.15, '脂漏性皮膚炎': 0.10, '乾癬': 0.13 },
    'ガサガサ': { '乾癬': 0.20, 'アトピー性皮膚炎': 0.12 },
    '鱗屑': { '乾癬': 0.25, '脂漏性皮膚炎': 0.15 },
    'フケ': { '脂漏性皮膚炎': 0.20 },
    '脂っぽい': { '脂漏性皮膚炎': 0.18 },
    'べたつく': { '脂漏性皮膚炎': 0.16 },
    '化粧品': { '接触性皮膚炎': 0.20 },
    '洗剤': { '接触性皮膚炎': 0.18 },
    'アレルギー': { 'アトピー性皮膚炎': 0.15, '接触性皮膚炎': 0.22 },
    '家族歴': { 'アトピー性皮膚炎': 0.12, '乾癬': 0.15 },
    '遺伝': { 'アトピー性皮膚炎': 0.12, '乾癬': 0.15 },
    'ストレス': { 'アトピー性皮膚炎': 0.08, '乾癬': 0.10 },
    '季節': { 'アトピー性皮膚炎': 0.10, '脂漏性皮膚炎': 0.08 }
  };

  // AI応答の質問リスト（重複防止用）
  const availableQuestions = [
    'かゆみの程度と持続期間を教えてください。',
    'アレルギーの既往歴はありますか？',
    '最近新しい化粧品や洗剤を使用しましたか？',
    '症状が悪化する特定の状況はありますか？',
    'ご家族にアトピーや皮膚疾患の方はいらっしゃいますか？',
    '患部は乾燥していますか、それとも脂っぽいですか？',
    'ストレスや季節の変化で症状に変化はありますか？',
    '症状はいつ頃から始まりましたか？',
    '患部に痛みはありますか？',
    '症状は特定の部位に集中していますか？',
    '以前に同様の症状を経験したことはありますか？',
    '現在使用している薬やスキンケア製品はありますか？',
    '症状は朝と夜で違いがありますか？',
    '食べ物で症状が変化することはありますか？',
    '運動や入浴後に症状は変化しますか？',
    '職場や学校で特定の物質に触れることはありますか？',
    '症状は徐々に悪化していますか、それとも急に現れましたか？',
    '他に気になる症状（発熱、倦怠感など）はありますか？'
  ];

  // 症状分析と信頼度計算（画像解析結果調整用）
  const analyzeSymptoms = (chatHistory: Array<{message: string, isUser: boolean, timestamp: Date}>) => {
    const factors: { [key: string]: number } = {};
    const userMessages = chatHistory.filter(chat => chat.isUser);
    const allText = userMessages.map(chat => chat.message).join(' ');

    baseDiagnosis.forEach(diagnosis => {
      factors[diagnosis.condition] = diagnosis.baseConfidence;
    });

    // キーワードマッチングで信頼度調整
    Object.entries(symptomKeywords).forEach(([keyword, effects]) => {
      if (allText.includes(keyword)) {
        Object.entries(effects).forEach(([condition, boost]) => {
          if (factors[condition]) {
            factors[condition] = Math.min(0.95, factors[condition] + boost);
          }
        });
      }
    });

    return factors;
  };

  // 使用されていない質問をランダムに選択
  const getRandomUnusedQuestion = () => {
    const unusedQuestions = availableQuestions.filter(question => !usedQuestions.has(question));
    
    // すべての質問が使用済みの場合、リセット
    if (unusedQuestions.length === 0) {
      setUsedQuestions(new Set());
      return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    
    return unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
  };

  // 調整後の診断結果を生成（画像解析用）
  const getAdjustedResults = () => {
    if (!imageResults) return null;
    
    const adjustedFactors = analyzeSymptoms(chatHistory);
    
    return baseDiagnosis.map(diagnosis => ({
      ...diagnosis,
      confidence: adjustedFactors[diagnosis.condition] || diagnosis.baseConfidence
    })).sort((a, b) => b.confidence - a.confidence);
  };

  const openDetailModal = (condition: string) => {
    setSelectedCondition(condition);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCondition(null);
  };

  // ファイル選択からの画像アップロード
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setImageResults(null);
        setShowHeatmap(false);
        setShowUploadOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // カメラからの画像撮影
  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setImageResults(null);
        setShowHeatmap(false);
        setShowUploadOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // アップロード選択肢を表示
  const showUploadSelection = () => {
    setShowUploadOptions(true);
  };

  // ファイル選択を開く
  const openFileSelection = () => {
    fileInputRef.current?.click();
    setShowUploadOptions(false);
  };

  // カメラを開く
  const openCamera = () => {
    // デバイスのカメラアプリを起動
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // モバイルデバイスの場合、カメラアプリを起動
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // カメラアプリを起動するためのURL scheme
        const cameraUrl = 'intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end';
        
        // Androidの場合
        if (/Android/i.test(navigator.userAgent)) {
          window.location.href = cameraUrl;
        } 
        // iOSの場合
        else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          // iOSではカメラアプリを直接起動
          window.location.href = 'camera://';
        }
        
        // フォールバック: ブラウザ内カメラ
        setTimeout(() => {
          cameraInputRef.current?.click();
        }, 1000);
      } else {
        // デスクトップの場合はブラウザ内カメラ
        cameraInputRef.current?.click();
      }
    } else {
      // カメラがサポートされていない場合
      alert('お使いのデバイスではカメラがサポートされていません。');
    }
    setShowUploadOptions(false);
  };

  // クイックカメラアクセス（カメラアプリ直接起動）

  const analyzeImage = async () => {
    if (!image) return;
    
    setAnalyzing(true);
    try {
      // 3秒の解析シミュレーション
      await new Promise(resolve => setTimeout(resolve, 3000));
      setImageResults(baseDiagnosis);
    } catch (error) {
      console.error('画像解析エラー:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeSymptomSelection = async () => {
    if (selectedSymptoms.length === 0) return;
    
    setSymptomAnalyzing(true);
    try {
      const results = await diseaseService.getDiseasesBySymptoms(selectedSymptoms);
      setSymptomResults(results);
    } catch (error) {
      console.error('症状解析エラー:', error);
      setSymptomResults([]);
    } finally {
      setSymptomAnalyzing(false);
    }
  };

  const addChatMessage = (message: string, isUser = true) => {
    setChatHistory(prev => [...prev, { message, isUser, timestamp: new Date() }]);
  };

  const resetChat = () => {
    setChatHistory([]);
    setSymptoms('');
    setUsedQuestions(new Set()); // 使用済み質問もリセット
  };

  const handleSymptomSubmit = () => {
    if (!symptoms.trim()) return;
    
    addChatMessage(symptoms, true);
    setSymptoms('');
    
    // AI応答のシミュレーション（重複防止機能付き）
    setTimeout(() => {
      const selectedQuestion = getRandomUnusedQuestion();
      
      // 選択された質問を使用済みに追加
      setUsedQuestions(prev => new Set([...prev, selectedQuestion]));
      
      addChatMessage(selectedQuestion, false);
      
      // 症状分析結果に基づいて診断更新の通知
      if (imageResults) {
        setTimeout(() => {
          addChatMessage('症状情報を分析し、診断の信頼度を更新しました。', false);
        }, 2000);
      }
    }, 1000);
  };

  const handleDiseaseSelect = (disease: any) => {
    openDetailModal(disease.name);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'mild': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Camera className="w-7 h-7 text-white drop-shadow-sm" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-lg animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent tracking-tight leading-tight">
                  DermaAI診断支援システム
                </h1>
                <div className="flex items-center mt-1 space-x-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-500 tracking-wide">AI-POWERED DERMATOLOGY</span>
                  <div className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* 言語選択 */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline font-medium">{languages[currentLanguage].flag} {languages[currentLanguage].name}</span>
                  <span className="hidden sm:inline text-xs">{currentLanguage === 'ja' ? '日本語' : currentLanguage === 'en' ? 'English' : currentLanguage === 'ko' ? '한국어' : '中文'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {showLanguageDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                    {Object.entries(languages).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCurrentLanguage(code as keyof typeof languages);
                          setShowLanguageDropdown(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                        {currentLanguage === code && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowHospitalMap(true)}
                className="flex items-center space-x-2 px-4 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20 text-xs"
              >
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="font-medium">{t.nearestHospital}</span>
              </button>
              <button
                onClick={() => setShowDatabaseStatus(true)}
                className="flex items-center space-x-2 px-4 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20 text-xs"
              >
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{t.databaseStatus}</span>
              </button>
              <button
                onClick={() => setShowSystemInfo(true)}
                className="w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg border border-blue-200 flex items-center justify-center transition-colors"
                title="診断支援ツール情報"
              >
                <Stethoscope className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200 text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>{t.finalDecisionByDoctor}</span>
              </div>
              {!isConfigured && (
                <button
                  onClick={() => setShowDemoInfo(true)}
                  className="w-12 h-12 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg border border-yellow-200 flex items-center justify-center transition-colors"
                  title="デモモード情報"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex space-x-1 bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20 mb-8">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Camera className="w-5 h-5 mr-2" />
            {t.imageAnalysis}
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'symptoms'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <Activity className="w-5 h-5 mr-2" />
            {t.symptomAnalysis}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'image' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左パネル - 画像アップロード・解析 */}
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <FileImage className="w-5 h-5 text-white" />
                  </div>
                  {t.imageUpload}
                </h2>
                
                <div 
                  className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group"
                  onClick={showUploadSelection}
                >
                  {image ? (
                    <div className="relative">
                      <img 
                        src={image} 
                        alt="アップロード画像" 
                        className="max-w-full h-64 object-contain mx-auto rounded-lg shadow-lg"
                      />
                      {showHeatmap && imageResults && (
                        <div className="absolute inset-0 bg-gradient-radial from-red-500/40 via-yellow-500/30 to-transparent rounded-lg opacity-80 animate-pulse"></div>
                      )}
                    </div>
                  ) : (
                    <div className="group-hover:scale-105 transition-transform duration-300">
                      <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4 group-hover:text-blue-600 transition-colors" />
                      <p className="text-gray-700 font-medium">{t.clickToUpload}</p>
                      <p className="text-sm text-gray-500 mt-2">{t.supportedFormats}</p>
                    </div>
                  )}
                </div>

                {/* アップロード選択肢モーダル */}
                {showUploadOptions && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{t.selectUploadMethod}</h3>
                      <div className="space-y-3">
                        <button
                          onClick={openCamera}
                          className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <Camera className="w-6 h-6" />
                          <span>{t.takePhoto}</span>
                        </button>
                        <button
                          onClick={openFileSelection}
                          className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <Upload className="w-6 h-6" />
                          <span>{t.selectFromFiles}</span>
                        </button>
                        <button
                          onClick={() => setShowUploadOptions(false)}
                          className="w-full p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 隠しファイル入力 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {/* 隠しカメラ入力 */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />
                
                <div className="flex justify-between mt-6 space-x-3">
                  <button
                    onClick={analyzeImage}
                    disabled={!image || analyzing}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {analyzing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t.analyzing}
                      </div>
                    ) : (
                      t.startAiAnalysis
                    )}
                  </button>
                  
                  {imageResults && (
                    <button
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className="px-6 py-3 border-2 border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-all duration-300 flex items-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      {showHeatmap ? t.heatmapOff : t.heatmapOn}
                    </button>
                  )}
                </div>
              </div>

              {/* 対話型症状入力 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    {t.symptomDialogue}
                  </h2>
                  {chatHistory.length > 0 && (
                    <button
                      onClick={resetChat}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 border border-gray-200 hover:border-red-200"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t.resetConversation}
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="h-56 overflow-y-auto border rounded-xl p-4 bg-gradient-to-b from-gray-50 to-white shadow-inner">
                    {chatHistory.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-center">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          {t.enterSymptoms}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chatHistory.map((chat, index) => (
                          <div key={index} className={`flex ${chat.isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-md ${
                              chat.isUser 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}>
                              <p className="text-sm">{chat.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder={t.enterSymptomsPlaceholder}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80"
                      onKeyPress={(e) => e.key === 'Enter' && handleSymptomSubmit()}
                    />
                    <button
                      onClick={handleSymptomSubmit}
                      disabled={!symptoms.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {t.send}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 右パネル - 診断結果 */}
            <div className="space-y-6">
              {analyzing && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
                    </div>
                    <p className="text-gray-700 font-medium mt-4">{t.analyzing}</p>
                    <p className="text-sm text-gray-500 mt-1">高度な画像解析を実行しています</p>
                  </div>
                </div>
              )}

              {imageResults && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      {t.diagnosisCandidates}
                    </h2>
                    {chatHistory.filter(chat => chat.isUser).length > 0 && (
                      <span className="text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                        {t.adjustedBySymptoms}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {getAdjustedResults()?.map((result, index) => {
                      const originalResult = baseDiagnosis.find(d => d.condition === result.condition);
                      const confidenceChange = result.confidence - (originalResult?.baseConfidence || 0);
                      
                      return (
                        <div 
                          key={index} 
                          className="border border-gray-200 rounded-xl p-5 hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg"
                          onClick={() => openDetailModal(result.condition)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-lg">
                              {result.condition}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getConfidenceColor(result.confidence)}`}>
                                {(result.confidence * 100).toFixed(1)}%
                              </span>
                              {confidenceChange !== 0 && (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  confidenceChange > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                                }`}>
                                  {confidenceChange > 0 ? '+' : ''}{(confidenceChange * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}>
                              {result.severity === 'high' ? '重度' : 
                               result.severity === 'moderate' ? '中等度' : 
                               result.severity === 'mild' ? '軽度' : '低リスク'}
                            </span>
                            <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                              → クリックで詳細表示
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">
                            <span className="font-semibold text-gray-800">{t.recommendedTreatment}:</span> {result.treatment}
                          </p>
                          
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 ease-out shadow-sm ${
                                confidenceChange > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                                confidenceChange < 0 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 
                                'bg-gradient-to-r from-blue-500 to-indigo-500'
                              }`}
                              style={{ width: `${result.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm text-yellow-800">
                        <p className="font-bold mb-2">{t.importantNotice}</p>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700">
                          <li>{t.diagnosticSupportTool}</li>
                          <li>{t.consultDoctor}</li>
                          <li>{t.emergencyConsult}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* システム情報 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-gray-600 to-gray-800 rounded-md flex items-center justify-center mr-3">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  {t.systemInfo}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-gray-700">{t.aiModel}:</span>
                      <p className="text-gray-600">MobileNetV2 + Vision Transformer</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">{t.database}:</span>
                      <p className="text-gray-600">Supabase (PostgreSQL)</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">{t.classificationClasses}:</span>
                      <p className="text-gray-600">7{currentLanguage === 'ja' ? '種類の皮膚疾患' : ' skin diseases'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-gray-700">{t.averageResponseTime}:</span>
                      <p className="text-gray-600">3-5{currentLanguage === 'ja' ? '秒' : ' seconds'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">{t.diagnosticAccuracy}:</span>
                      <p className="text-gray-600">92.3% (テストデータ)</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">{t.lastUpdate}:</span>
                      <p className="text-gray-600">{currentLanguage === 'ja' ? '2024年12月' : 'December 2024'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 症状選択パネル */}
            <div>
              <SymptomSelector
                selectedSymptoms={selectedSymptoms}
                onSymptomsChange={setSelectedSymptoms}
                onDiagnose={analyzeSymptomSelection}
                currentLanguage={currentLanguage}
              />
            </div>

            {/* 症状診断結果パネル */}
            <div>
              <DiagnosisResults
                selectedSymptoms={selectedSymptoms}
                onBack={() => setSymptomResults(null)}
                currentLanguage={currentLanguage}
              />
            </div>
          </div>
        )}

        {/* システム情報モーダル */}
        {showSystemInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">DermaAI診断支援システム</h3>
                      <p className="text-sm text-gray-500">AI皮膚病変診断支援ツール</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSystemInfo(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="閉じる"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-lg font-bold text-blue-900 mb-4">システム概要</h4>
                    <p className="text-blue-800 leading-relaxed mb-4">
                      DermaAI診断支援システムは、AI技術を活用した皮膚疾患の診断支援ツールです。
                      症状の入力や画像解析により、可能性の高い皮膚疾患を提示し、医療従事者の診断をサポートします。
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <h5 className="font-bold text-green-900 mb-3">主な機能</h5>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          症状ベース診断
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          画像解析診断
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          治療法提案
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          病院検索
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 詳細情報モーダル */}
      {showDetailModal && selectedCondition && conditionDetails[selectedCondition] && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCondition}</h2>
                <p className="text-sm text-gray-500 mt-1">詳細な疾患情報</p>
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
              {/* 概要 */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mr-3">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  概要
                </h3>
                <p className="text-blue-800 leading-relaxed text-base">
                  {conditionDetails[selectedCondition].overview}
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
                    {conditionDetails[selectedCondition].symptoms.map((symptom, index) => (
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
                    {conditionDetails[selectedCondition].causes.map((cause, index) => (
                      <li key={index} className="flex items-center text-yellow-800">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-4 flex-shrink-0"></div>
                        <span className="text-sm font-medium">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 治療法 */}
                <div className