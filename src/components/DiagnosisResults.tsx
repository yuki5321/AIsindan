import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { diseaseService } from '../services/diseaseService';
import DiseaseDetailModal from './DiseaseDetailModal';
import { Disease } from '../lib/supabase';
import DiagnosisResultCard from './DiagnosisResultCard'; // Import the new component

interface DiagnosisResultsProps {
  selectedSymptoms: string[];
  onBack: () => void;
  currentLanguage: 'ja' | 'en' | 'ko' | 'zh';
}

const DiagnosisResults: React.FC<DiagnosisResultsProps> = ({ selectedSymptoms, onBack, currentLanguage }) => {
  const [results, setResults] = useState<{ disease: Disease; confidence: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  useEffect(() => {
    const performDiagnosis = async () => {
      if (selectedSymptoms.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }
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

    performDiagnosis();
  }, [selectedSymptoms]);

  const handleOpenModal = async (disease: Disease) => {
    try {
      const fullDetails = await diseaseService.getDiseaseById(disease.id);
      setSelectedDisease(fullDetails);
    } catch (error) {
      console.error("Failed to fetch disease details:", error);
      setSelectedDisease(disease); // Fallback to partial data
    }
  };

  if (loading) {
    return <div>AI解析処理中...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">診断候補（信頼度順）</h2>
          <button onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-blue-600">
            <RotateCcw className="w-4 h-4 mr-2" />
            症状選択に戻る
          </button>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-8">
            <p>該当する疾患が見つかりませんでした</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <DiagnosisResultCard 
                key={result.disease.id}
                result={result} 
                onClick={() => handleOpenModal(result.disease)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedDisease && (
        <DiseaseDetailModal 
          disease={selectedDisease} 
          onClose={() => setSelectedDisease(null)} 
          currentLanguage={currentLanguage} 
        />
      )}
    </div>
  );
};


export default DiagnosisResults;
