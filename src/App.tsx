import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  Database, 
  Stethoscope, 
  AlertTriangle,
  Search,
  Filter,
  X,
  ChevronDown,
  Info,
  Clock,
  User,
  Activity
} from 'lucide-react';
import SymptomSelector from './components/SymptomSelector';
import DiagnosisResults from './components/DiagnosisResults';
import HospitalMap from './components/HospitalMap';
import DatabaseStatus from './components/DatabaseStatus';
import AdvancedSearch from './components/AdvancedSearch';

function App() {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'diagnosis' | 'search'>('symptoms');
  const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en' | 'ko' | 'zh'>('ja');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHospitalMap, setShowHospitalMap] = useState(false);
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosisStarted, setDiagnosisStarted] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const languages = [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const handleLanguageChange = (langCode: 'ja' | 'en' | 'ko' | 'zh') => {
    setCurrentLanguage(langCode);
    setShowLanguageMenu(false);
  };

  const handleSymptomsChange = (symptoms: string[]) => {
    setSelectedSymptoms(symptoms);
  };

  const handleDiagnose = () => {
    setDiagnosisStarted(true);
    setActiveTab('diagnosis');
  };

  const handleBackToSymptoms = () => {
    setDiagnosisStarted(false);
    setActiveTab('symptoms');
  };

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
  };

  const handleSearchLoading = (loading: boolean) => {
    setSearchLoading(loading);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴとタイトル */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">DermaAI診断支援システム</h1>
              </div>
            </div>

            {/* ヘッダーボタン */}
            <div className="flex items-center space-x-2">
              {/* 言語変更 */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                  title="言語変更"
                >
                  <Globe className="w-6 h-6 text-gray-600" />
                </button>
                
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code as any)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                          currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 位置情報・病院検索 */}
              <button
                onClick={() => setShowHospitalMap(!showHospitalMap)}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                title="病院検索"
              >
                <MapPin className="w-6 h-6 text-gray-600" />
              </button>

              {/* データベース状態 */}
              <button
                onClick={() => setShowDatabaseStatus(!showDatabaseStatus)}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                title="データベース状況"
              >
                <Database className="w-6 h-6 text-gray-600" />
              </button>

              {/* 診断支援ツール情報 */}
              <button
                onClick={() => setShowSystemInfo(!showSystemInfo)}
                className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors"
                title="診断支援ツール"
              >
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </button>

              {/* デモモード */}
              <button
                onClick={() => setShowDemoInfo(!showDemoInfo)}
                className="w-12 h-12 bg-yellow-100 hover:bg-yellow-200 rounded-lg flex items-center justify-center transition-colors"
                title="デモモード"
              >
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeTab === 'symptoms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              症状選択
            </button>
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeTab === 'diagnosis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              診断結果
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              疾患検索
            </button>
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'symptoms' && !diagnosisStarted && (
          <SymptomSelector
            selectedSymptoms={selectedSymptoms}
            onSymptomsChange={handleSymptomsChange}
            onDiagnose={handleDiagnose}
            currentLanguage={currentLanguage}
          />
        )}

        {activeTab === 'diagnosis' && diagnosisStarted && (
          <DiagnosisResults
            selectedSymptoms={selectedSymptoms}
            onBack={handleBackToSymptoms}
            currentLanguage={currentLanguage}
          />
        )}

        {activeTab === 'diagnosis' && !diagnosisStarted && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">診断結果</h2>
            <p className="text-gray-600 mb-4">症状を選択して診断を開始してください。</p>
            <button
              onClick={() => setActiveTab('symptoms')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              症状選択に戻る
            </button>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <AdvancedSearch
              onResults={handleSearchResults}
              onLoading={handleSearchLoading}
            />
            
            {searchLoading && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">検索中...</p>
              </div>
            )}

            {searchResults.length > 0 && !searchLoading && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">検索結果 ({searchResults.length}件)</h3>
                <div className="space-y-4">
                  {searchResults.map((disease, index) => (
                    <div key={disease.id || index} className="border border-gray-200 rounded-xl p-4 hover:bg-blue-50/50 transition-colors">
                      <h4 className="font-bold text-gray-900 mb-2">{disease.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{disease.name_en}</p>
                      <p className="text-sm text-gray-700">{disease.overview}</p>
                      {disease.disease_categories && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {disease.disease_categories.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 病院マップモーダル */}
      {showHospitalMap && (
        <HospitalMap onClose={() => setShowHospitalMap(false)} />
      )}

      {/* データベース状態モーダル */}
      {showDatabaseStatus && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <DatabaseStatus onClose={() => setShowDatabaseStatus(false)} />
          </div>
        </div>
      )}

      {/* システム情報モーダル */}
      {showSystemInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">診断支援ツール</h2>
                    <p className="text-sm text-gray-500">AI搭載皮膚疾患診断支援システム</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSystemInfo(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">システム概要</h3>
                  <p className="text-blue-800 leading-relaxed">
                    DermaAI診断支援システムは、最新のAI技術を活用した皮膚科診療支援ツールです。
                    症状ベースの診断支援、画像解析、治療法提案など、包括的な診断サポートを提供します。
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      主な機能
                    </h3>
                    <ul className="space-y-2 text-green-800">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        症状ベースの疾患推定
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        AI画像診断支援
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        治療法提案・ガイドライン
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        疾患データベース検索
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        近隣医療機関検索
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                      <Database className="w-5 h-5 mr-2" />
                      対応疾患
                    </h3>
                    <ul className="space-y-2 text-purple-800">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        炎症性皮膚疾患
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        感染性皮膚疾患
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        腫瘍性皮膚疾患
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        自己免疫性皮膚疾患
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        遺伝性皮膚疾患
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm text-orange-800">
                      <p className="font-bold mb-2 text-base">重要な注意事項</p>
                      <ul className="space-y-1 leading-relaxed">
                        <li>• このシステムは診断支援ツールであり、最終的な診断は医師が行います</li>
                        <li>• 緊急性が疑われる場合は、直ちに専門医にご相談ください</li>
                        <li>• 自己判断による治療は避け、必ず医療機関を受診してください</li>
                        <li>• システムの提案は参考情報として活用してください</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* デモモード情報モーダル */}
      {showDemoInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">デモモード</h2>
                    <p className="text-sm text-gray-500">現在の動作状況とご利用について</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoInfo(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
                    <span className="font-bold text-yellow-800 text-lg">現在デモモードで動作中</span>
                  </div>
                  <p className="text-yellow-800 leading-relaxed">
                    このシステムは現在デモモードで動作しており、サンプルデータを使用しています。
                    基本的な機能をお試しいただけますが、実際の医療診断には使用できません。
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      利用可能な機能
                    </h3>
                    <ul className="space-y-2 text-green-800">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        症状選択と診断候補表示
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        疾患情報の詳細表示
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        治療法・予防法の提案
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        疾患データベース検索
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        近隣病院検索（モック）
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                    <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                      <X className="w-5 h-5 mr-2" />
                      制限事項
                    </h3>
                    <ul className="space-y-2 text-red-800">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        診断結果は参考情報のみ
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        実際の医療行為には使用不可
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        データは保存されません
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        画像診断機能は未実装
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        リアルタイム病院情報なし
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    完全版をご利用いただくには
                  </h3>
                  <div className="text-blue-800 space-y-3">
                    <p className="leading-relaxed">
                      完全な機能をご利用いただくには、画面右上の「Connect to Supabase」ボタンをクリックして
                      データベースに接続してください。
                    </p>
                    <div className="bg-blue-100 rounded-lg p-4">
                      <h4 className="font-medium mb-2">完全版で追加される機能：</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• 実際の医学データベースとの連携</li>
                        <li>• より精密な診断アルゴリズム</li>
                        <li>• 診断履歴の保存・管理</li>
                        <li>• 画像診断AI機能</li>
                        <li>• リアルタイム医療機関情報</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    デモデータについて
                  </h3>
                  <div className="text-gray-700 space-y-2 text-sm">
                    <p>現在表示されているデータはすべてデモ用のサンプルデータです：</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>疾患情報：一般的な皮膚疾患の基本情報</li>
                      <li>症状データ：代表的な皮膚症状のサンプル</li>
                      <li>治療法：標準的な治療アプローチの例</li>
                      <li>病院情報：架空の医療機関データ</li>
                    </ul>
                    <p className="mt-3 font-medium text-gray-800">
                      実際の診断や治療には、必ず医療機関を受診してください。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;