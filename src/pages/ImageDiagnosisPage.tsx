import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, FileImage, Sparkles, MessageSquare, BrainCircuit } from 'lucide-react';
import CameraModal from '../components/CameraModal';
import SymptomSelector from '../components/SymptomSelector';
import { diseaseService } from '../services/diseaseService';
import DiseaseDetailModal from '../components/DiseaseDetailModal';

interface Symptom {
  id: string;
  name: string;
  name_en: string;
}

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

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (originalDiagnosisResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [originalDiagnosisResult]);

  useEffect(() => {
    diseaseService.getSymptoms().then(setAllSymptoms);
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

  const handleDiagnose = async () => {
    if (!image) return;
    setIsLoading(true);
    setDiagnosisResult(null);
    setOriginalDiagnosisResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setOriginalDiagnosisResult(data.results);
      setDiagnosisResult(data.results);
    } catch (error) {
      console.error("Diagnosis failed:", error);
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
      const response = await fetch('http://127.0.0.1:5000/refine_diagnosis', {
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
      {/* ... (Image Upload Section) ... */}

      {diagnosisResult && (
        <div ref={resultsRef} className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
          <div className="w-full md:w-3/5">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">診断候補 (信頼度順)</h2>
              <div className="space-y-4">
                {diagnosisResult.map((result, index) => (
                  <div 
                    key={result?.disease?.id || index} 
                    className="border border-gray-200 rounded-xl p-5 hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => result?.disease && handleOpenModal(result.disease)}
                  >
                    {/* ... (Card content) ... */}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ... (Symptom Interaction Section) ... */}
        </div>
      )}

      {selectedDisease && (
        <DiseaseDetailModal 
          disease={selectedDisease} 
          onClose={() => setSelectedDisease(null)} 
          currentLanguage={'ja'} 
        />
      )}

      {/* ... (Camera Modal) ... */}
    </div>
  );
}
