import { useState } from 'react';
import SymptomSelector from '../components/SymptomSelector';
import DiagnosisResults from '../components/DiagnosisResults';

// 症状の型定義を追加

export default function SymptomDiagnosisPage() {
  // string[] に戻す（SymptomSelectorがstring[]を期待しているため）
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosisStarted, setDiagnosisStarted] = useState(false);
  const currentLanguage = 'ja'; // Or get from a context

  const handleDiagnose = () => {
    setDiagnosisStarted(true);
  };

  const handleBackToSymptoms = () => {
    setDiagnosisStarted(false);
  };

  if (!diagnosisStarted) {
    return (
      <SymptomSelector
        selectedSymptoms={selectedSymptoms}
        onSymptomsChange={setSelectedSymptoms}
        onSubmit={handleDiagnose}
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