import React, { useState, useEffect } from 'react';
import SymptomSelector from '../components/SymptomSelector';
import DiagnosisResults from '../components/DiagnosisResults';
import { diseaseService } from '../services/diseaseService';

interface Symptom {
  id: string;
  name: string;
  name_en: string;
}

export default function SymptomDiagnosisPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosisStarted, setDiagnosisStarted] = useState(false);
  const [availableSymptoms, setAvailableSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentLanguage = 'ja'; // Or get from a context

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const symptoms = await diseaseService.getSymptoms();
        setAvailableSymptoms(symptoms);
      } catch (err) {
        setError('症状リストの読み込みに失敗しました。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDiagnose = () => {
    setDiagnosisStarted(true);
  };

  const handleBackToSymptoms = () => {
    setDiagnosisStarted(false);
  };

  if (loading) {
    return <p>症状リストを読み込んでいます...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!diagnosisStarted) {
    return (
      <SymptomSelector
        selectedSymptoms={selectedSymptoms}
        onSymptomsChange={setSelectedSymptoms}
        onSubmit={handleDiagnose}
        availableSymptoms={availableSymptoms}
        currentLanguage={currentLanguage}
      />
    );
  } else {
    return (
      <DiagnosisResults
        selectedSymptoms={selectedSymptoms}
        onBack={handleBackToSymptoms}
        currentLanguage={currentLanguage}
      />
    );
  }
}