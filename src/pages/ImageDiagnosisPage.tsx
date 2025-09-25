import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, FileImage, Sparkles, MessageSquare, BrainCircuit, ChevronRight } from 'lucide-react';
import CameraModal from '../components/CameraModal';
import SymptomSelector from '../components/SymptomSelector';
import { diseaseService } from '../services/diseaseService';
import DiseaseDetailModal from '../components/DiseaseDetailModal';
import DiagnosisResultCard from '../components/DiagnosisResultCard';

interface Symptom {
  id: string;
  name: string;
  name_en: string;
}

// 一時的な修正: RenderのバックエンドURLを直接設定
const API_URL = import.meta.env.VITE_API_URL || 'https://dermaai-backend.onrender.com';

export default function ImageDiagnosisPage() {
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [originalDiagnosisResult, setOriginalDiagnosisResult] = useState<any[] | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [allSymptoms, setAllSymptoms] = useState<Symptom[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<any | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>('未確認');

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (originalDiagnosisResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [originalDiagnosisResult]);

  useEffect(() => {
    diseaseService.getSymptoms().then(setAllSymptoms);
    
    // バックエンドの接続テスト
    const testBackendConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
          setBackendStatus('接続OK');
        } else {
          setBackendStatus(`エラー: ${response.status}`);
        }
      } catch (error) {
        setBackendStatus('接続失敗');
        console.error('Backend connection test failed:', error);
      }
    };
    
    testBackendConnection();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setDiagnosisResult(null);
        setOriginalDiagnosisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (imageSrc: string) => {
    setImage(imageSrc);
    setDiagnosisResult(null);
    setOriginalDiagnosisResult(null);
    setShowCamera(false);
  };

  const handleDiagnose = async () => {
    if (!image) return;
    setIsLoading(true);
    setDiagnosisResult(null);
    setOriginalDiagnosisResult(null);

    try {
      console.log('API URL:', API_URL);
      const response = await fetch(`${API_URL}/predict_image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      setOriginalDiagnosisResult(data.results);
      setDiagnosisResult(data.results);
    } catch (error) {
      console.error("Diagnosis failed:", error);
      alert(`診断に失敗しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineDiagnosis = async () => {
    if (!originalDiagnosisResult || selectedSymptomIds.length === 0) return;
    
    const selectedSymptomNames = selectedSymptomIds.map(id => {
      const symptom = allSymptoms.find(s => s.id === id);
      return symptom ? symptom.name_en : '';
    }).filter(name => name !== '');

    if (selectedSymptomNames.length === 0) return;

    setIsRefining(true);
    try {
      const response = await fetch(`${API_URL}/refine_diagnosis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initial_results: originalDiagnosisResult,
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

  const handleOpenModal = async (disease: any) => {
    // Fetch full details before opening the modal
    const fullDetails = await diseaseService.getDiseaseById(disease.id);
    setSelectedDisease(fullDetails);
  };

  return (
    <div className="space-y-8">
      {/* Start: Image Upload Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image Preview and Upload Area */}
          <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
            {image ? (
              <img src={image} alt="Uploaded skin condition" className="object-contain w-full h-full" />
            ) : (
              <div className="text-center p-8">
                <FileImage className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-700">画像をアップロード</h3>
                <p className="mt-1 text-sm text-gray-500">診断したい皮膚の画像をここに表示します。</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">画像診断</h2>
              <p className="mt-2 text-gray-600">AIを使用して皮膚の状態を分析します。画像をアップロードするか、カメラで撮影してください。</p>
              <p className="mt-2 text-xs text-gray-500">API URL: {API_URL}</p>
              <p className="mt-1 text-xs text-gray-500">バックエンド状態: 
                <span className={`ml-1 font-semibold ${
                  backendStatus === '接続OK' ? 'text-green-600' : 
                  backendStatus === '接続失敗' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {backendStatus}
                </span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label htmlFor="file-upload" className="cursor-pointer bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5 mr-2" />
                ファイルを選択
              </label>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
              
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm flex items-center justify-center transition-colors"
              >
                <Camera className="w-5 h-5 mr-2" />
                カメラで撮影
              </button>
            </div>

            <button
              onClick={handleDiagnose}
              disabled={!image || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-4 rounded-lg shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>診断中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  <span>AI診断を開始</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* End: Image Upload Section */}

      {diagnosisResult && (
        <div ref={resultsRef} className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
          <div className="w-full md:w-3/5">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">診断候補 (信頼度順)</h2>
              <div className="space-y-4">
                {diagnosisResult.map((result, index) => (
                  <DiagnosisResultCard 
                    key={result?.disease?.id || index} 
                    result={result} 
                    onClick={() => result?.disease && handleOpenModal(result.disease)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Start: Symptom Interaction Section */}
          <div className="w-full md:w-2/5">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 h-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">症状で絞り込む</h3>
              <p className="text-sm text-gray-600 mb-6">画像診断の結果を、自覚症状を追加してさらに絞り込みます。</p>
              <SymptomSelector
                selectedSymptoms={selectedSymptomIds}
                onSymptomsChange={setSelectedSymptomIds}
                onSubmit={handleRefineDiagnosis}
                currentLanguage={'ja'}
              />
            </div>
          </div>
          {/* End: Symptom Interaction Section */}
        </div>
      )}

      {selectedDisease && (
        <DiseaseDetailModal 
          disease={selectedDisease} 
          onClose={() => setSelectedDisease(null)} 
          currentLanguage={'ja'} 
        />
      )}

      {showCamera && (
        <CameraModal 
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}