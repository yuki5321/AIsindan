import React, { useState } from 'react';
import { Camera, Upload, FileImage, Sparkles, MessageSquare, BrainCircuit } from 'lucide-react';
import CameraModal from '../components/CameraModal';
import SymptomSelector from '../components/SymptomSelector';
import DiagnosisResults from '../components/DiagnosisResults';

// Mock data for now
const mockDiagnosis = [
  { disease: { name: '脂漏性角化症', overview: '良性の皮膚腫瘍で、高齢者によく見られます。' }, confidence: 0.85 },
  { disease: { name: 'メラノーマ', overview: '悪性度の高い皮膚がんで、早期発見が重要です。' }, confidence: 0.10 },
  { disease: { name: '基底細胞がん', overview: '最も一般的な皮膚がんですが、転移は稀です。' }, confidence: 0.05 },
];

export default function ImageDiagnosisPage() {
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setDiagnosisResult(null); // Reset previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    if (!image) return;
    setIsLoading(true);
    setDiagnosisResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDiagnosisResult(data.results);
    } catch (error) {
      console.error("Diagnosis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineDiagnosis = async () => {
    if (!diagnosisResult || selectedSymptoms.length === 0) return;
    setIsRefining(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/refine_diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          initial_results: diagnosisResult,
          symptoms: selectedSymptoms 
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDiagnosisResult(data.results);
    } catch (error) {
      console.error("Refine diagnosis failed:", error);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ... (Image Upload Section remains the same) ... */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FileImage className="w-6 h-6 mr-3 text-blue-600" />
          画像診断
        </h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              {image ? (
                <img src={image} alt="Uploaded preview" className="max-h-full max-w-full object-contain rounded-lg" />
              ) : (
                <p className="text-gray-500">画像プレビュー</p>
              )}
            </div>
            <div className="flex space-x-4">
              <label htmlFor="file-upload" className="flex-1 cursor-pointer bg-white hover:bg-gray-50 text-blue-600 font-medium py-2 px-4 rounded-lg border border-blue-500 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5 mr-2" />
                ファイルを選択
              </label>
              <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button onClick={() => setShowCamera(true)} className="flex-1 bg-white hover:bg-gray-50 text-blue-600 font-medium py-2 px-4 rounded-lg border border-blue-500 flex items-center justify-center transition-colors">
                <Camera className="w-5 h-5 mr-2" />
                カメラで撮影
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center"><BrainCircuit className="w-5 h-5 mr-2"/>AIシステム情報</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                    <li><strong>AIモデル:</strong> MobileNetV2 + ViT</li>
                    <li><strong>データベース:</strong> Supabase (PostgreSQL)</li>
                    <li><strong>平均応答時間:</strong> 1.5秒</li>
                    <li><strong>最終更新日:</strong> 2025-09-20</li>
                </ul>
            </div>
            <button 
              onClick={handleDiagnose} 
              disabled={!image || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  診断中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI診断を開始
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Diagnosis Results Section */}
      {diagnosisResult && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">診断候補 (信頼度順)</h2>
          <div className="space-y-4">
            {diagnosisResult.map((result, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">{result.disease}</h3>
                  <span className={`font-bold text-lg ${result.confidence > 0.7 ? 'text-green-600' : (result.confidence > 0.3 ? 'text-orange-500' : 'text-red-500')}`}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Symptom Interaction Section */}
      {diagnosisResult && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-blue-600" />
            症状対話による絞り込み
          </h2>
          <p className="text-gray-600 mb-6">当てはまる症状を選択すると、診断候補の信頼度が更新されます。</p>
          <SymptomSelector 
            selectedSymptoms={selectedSymptoms} 
            onSymptomsChange={setSelectedSymptoms} 
            onSubmit={handleRefineDiagnosis} // Pass the refine function to the new prop
            currentLanguage={'ja'} 
          />
          <div className="mt-6 text-center">
            <button 
              onClick={handleRefineDiagnosis} 
              disabled={selectedSymptoms.length === 0 || isRefining}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-0.5"
            >
              {isRefining ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  絞り込み中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  診断を絞り込む
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <CameraModal 
          onClose={() => setShowCamera(false)} 
          onCapture={(img) => { setImage(img); setDiagnosisResult(null); }}
        />
      )}
    </div>
  );
}
