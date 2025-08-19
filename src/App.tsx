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

function App() {
  const [activeTab, setActiveTab] = useState('symptoms');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHospitalMap, setShowHospitalMap] = useState(false);
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const symptoms = [
    '発疹', '湿疹', 'かゆみ', '赤み', '腫れ', '痛み', '乾燥', 'ただれ',
    '水ぶくれ', 'かさぶた', '色素沈着', '脱色', 'しこり', '潰瘍'
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴとタイトル */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'symptoms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              症状選択
            </button>
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'diagnosis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              診断結果
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
        {activeTab === 'symptoms' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">症状を選択してください</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {symptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
              {selectedSymptoms.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">選択された症状:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {symptom}
                        <button
                          onClick={() => toggleSymptom(symptom)}
                          className="ml-2 hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    診断を開始
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'diagnosis' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">診断結果</h2>
            <p className="text-gray-600">症状を選択して診断を開始してください。</p>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">疾患検索</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="疾患名を入力してください..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* システム情報モーダル */}
      {showSystemInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">診断支援ツール</h2>
                <button
                  onClick={() => setShowSystemInfo(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  DermaAI診断支援システムは、皮膚科診療をサポートするAI搭載の診断支援ツールです。
                </p>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">主な機能</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>症状ベースの疾患推定</li>
                    <li>画像診断支援</li>
                    <li>治療法提案</li>
                    <li>疾患データベース検索</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* デモモード情報モーダル */}
      {showDemoInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">デモモード</h2>
                <button
                  onClick={() => setShowDemoInfo(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-800">現在デモモードで動作中</span>
                  </div>
                </div>
                <p className="text-gray-600">
                  このシステムは現在デモモードで動作しており、実際の医療診断には使用できません。
                </p>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">制限事項</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>診断結果は参考情報のみ</li>
                    <li>実際の医療行為には使用不可</li>
                    <li>データは保存されません</li>
                  </ul>
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