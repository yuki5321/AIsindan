import React, { useState, useEffect } from 'react';
import { Camera, Upload, FileImage, Sparkles, MessageSquare, BrainCircuit } from 'lucide-react';
import CameraModal from '../components/CameraModal';
import SymptomSelector from '../components/SymptomSelector';
import { diseaseService } from '../services/diseaseService';

interface Symptom {
  id: string;
  name: string;
  name_en: string;
}

export default function ImageDiagnosisPage() {
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [allSymptoms, setAllSymptoms] = useState<Symptom[]>([]);

  // Fetch all symptoms once when the component mounts
  useEffect(() => {
    diseaseService.getSymptoms().then(setAllSymptoms);
  }, []);

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
    if (!diagnosisResult || selectedSymptomIds.length === 0) return;
    
    // Convert selected IDs to English names for the backend
    const selectedSymptomNames = selectedSymptomIds.map(id => {
      const symptom = allSymptoms.find(s => s.id === id);
      return symptom ? symptom.name_en : '';
    }).filter(name => name !== '');

    if (selectedSymptomNames.length === 0) return;

    setIsRefining(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/refine_diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          initial_results: diagnosisResult,
          symptoms: selectedSymptomNames 
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
      {/* Image Upload Section */}
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

      {/* Diagnosis Results Section */}
      {diagnosisResult && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">診断候補 (信頼度順)</h2>
          <div className="space-y-4">
            {diagnosisResult.map((result, index) => (
              <div 
                key={result.disease.name_en || index} 
                className="border border-gray-200 rounded-xl p-5 hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg"
                // onClick={() => openDetailModal(result.disease)} // Future implementation
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-lg">
                    {result.disease.name} <span className="text-sm font-normal text-gray-500">({result.disease.name_en})</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${result.confidence > 0.7 ? 'text-green-600 bg-green-100' : (result.confidence > 0.3 ? 'text-orange-600 bg-orange-100' : 'text-red-600 bg-red-100')}`}>
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-semibold text-gray-800">概要:</span> {result.disease.overview}
                </p>
                
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 rounded-full transition-all duration-1000 ease-out shadow-sm bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${(result.confidence * 100).toFixed(1)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symptom Interaction Section */}
      {diagnosisResult && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-blue-600" />
            症状対話による絞り込み
          </h2>
          <p className="text-gray-600 mb-6">当てはまる症状を選択すると、診断候補の信頼度が更新されます。</p>
          <SymptomSelector 
            selectedSymptoms={selectedSymptomIds} 
            onSymptomsChange={setSelectedSymptomIds} 
            onSubmit={handleRefineDiagnosis}
            currentLanguage={'ja'} 
          />
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
