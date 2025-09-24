import React, { useState } from 'react';
import { Bot, AlertTriangle, CheckCircle } from 'lucide-react';

// Type definition
interface PredictionResult {
  prediction: string;
  confidence: number;
}

const featureNames = [
    'erythema', 'scaling', 'definite_borders', 'itching', 'koebner_phenomenon', 'polygonal_papules', 'follicular_papules', 'oral_mucosal_involvement', 'knee_and_elbow_involvement', 'scalp_involvement', 'family_history', 'melanin_incontinence', 'eosinophils_infiltrate', 'PNL_infiltrate', 'fibrosis_papillary_dermis', 'exocytosis', 'acanthosis', 'hyperkeratosis', 'parakeratosis', 'clubbing_rete_ridges', 'elongation_rete_ridges', 'thinning_suprapapillary_epidermis', 'spongiform_pustule', 'munro_microabcess', 'focal_hypergranulosis', 'disappearance_granular_layer', 'vacuolisation_damage_basal_layer', 'spongiosis', 'saw_tooth_appearance_retes', 'follicular_horn_plug', 'perifollicular_parakeratosis', 'inflammatory_mononuclear_infiltrate', 'band_like_infiltrate', 'age'
];

export default function TabularDiagnosis() {
  const [features, setFeatures] = useState<number[]>(Array(34).fill(0));
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = Number(value);
    setFeatures(newFeatures);
  };

  const handleDiagnose = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.statusText}`);
      }

      const data: PredictionResult = await response.json();
      setResult(data);

    } catch (err) {
      console.error('診断エラー:', err);
      setError('診断の実行中にエラーが発生しました。バックエンドサーバーが起動しているか確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">AI診断 (Kaggleデータセット)</h2>
      
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left side: Feature inputs */}
        <div className="grid grid-cols-2 gap-4">
          {featureNames.map((name, index) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700">{name}</label>
              <input
                type="number"
                id={name}
                name={name}
                value={features[index]}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          ))}
        </div>

        {/* Right side: Diagnosis execution and results */}
        <div className="space-y-6">
          <button
            onClick={handleDiagnose}
            disabled={loading}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Bot className="mr-3 h-6 w-6" />
            {loading ? 'AI解析中...' : 'AI診断を実行'}
          </button>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <p className="font-bold">エラー</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-inner">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                AI診断結果
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-600">最も可能性の高い疾患:</span>
                  <p className="text-2xl font-bold text-gray-900">{result.prediction}</p>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-600">信頼度:</span>
                  <p className="text-2xl font-bold text-green-700">{(result.confidence * 100).toFixed(2)} %</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(result.confidence * 100).toFixed(2)}%` }}></div>
              </div>
            </div>
          )}
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg text-sm">
            <p><span className="font-bold">注意:</span> このAI診断は医療専門家の診断に代わるものではありません。あくまで参考情報としてご利用ください。</p>
          </div>
        </div>
      </div>
    </div>
  );
}