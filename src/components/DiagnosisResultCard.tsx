import React from 'react';
import { ChevronRight } from 'lucide-react';

// Define the structure of the 'result' prop
interface DiagnosisResult {
  disease: {
    id: string;
    name: string;
    name_en: string;
    overview: string;
  };
  confidence: number;
}

interface DiagnosisResultCardProps {
  result: DiagnosisResult;
  onClick: () => void;
}

const DiagnosisResultCard: React.FC<DiagnosisResultCardProps> = ({ result, onClick }) => {
  const confidence = result.confidence * 100;

  return (
    <div 
      onClick={onClick}
      className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer group"
    >
      {/* Circular Progress for Confidence */}
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="text-blue-600"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${confidence}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-blue-600">{confidence.toFixed(0)}</span>
          <span className="text-xs font-bold text-blue-600">%</span>
        </div>
      </div>

      {/* Disease Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
          {result.disease?.name}
        </h3>
        <p className="text-sm text-gray-500 truncate">{result.disease?.name_en}</p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{result.disease?.overview}</p>
      </div>
      
      {/* Arrow Icon */}
      <div className="text-gray-300 group-hover:text-blue-600 transition-transform duration-300 transform group-hover:translate-x-1">
        <ChevronRight className="w-6 h-6" />
      </div>
    </div>
  );
};

export default DiagnosisResultCard;
