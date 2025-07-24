import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, Loader2 } from 'lucide-react';
import { DiseaseService } from '../services/diseaseService';
import { Disease, SearchFilters } from '../lib/supabase';

interface AdvancedSearchProps {
  onResults: (results: Disease[]) => void;
  onLoading: (loading: boolean) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onResults, onLoading }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searching, setSearching] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // カテゴリ一覧を取得（実際の実装では別途APIを作成）
    setCategories(['炎症性皮膚疾患', '感染性皮膚疾患', '腫瘍性皮膚疾患', '自己免疫性皮膚疾患']);
  }, []);

  const handleSearch = async () => {
    if (!query.trim() && Object.keys(filters).length === 0) return;

    setSearching(true);
    onLoading(true);

    try {
      const { diseases } = await DiseaseService.searchDiseases(
        query,
        filters.category,
        1,
        50
      );
      
      // フィルターを適用
      let filteredResults = diseases;
      
      if (filters.severity && filters.severity.length > 0) {
        filteredResults = filteredResults.filter(d => 
          filters.severity!.includes(d.severity_level)
        );
      }
      
      if (filters.isCommon !== undefined) {
        filteredResults = filteredResults.filter(d => d.is_common === filters.isCommon);
      }
      
      if (filters.isEmergency !== undefined) {
        filteredResults = filteredResults.filter(d => d.is_emergency === filters.isEmergency);
      }

      onResults(filteredResults);
    } catch (error) {
      console.error('検索エラー:', error);
      onResults([]);
    } finally {
      setSearching(false);
      onLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
    onResults([]);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          高度な疾患検索
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
        >
          <Filter className="w-4 h-4" />
          <span>フィルター</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 検索バー */}
      <div className="flex space-x-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="疾患名、症状、キーワードで検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            '検索'
          )}
        </button>
        {(query || activeFilterCount > 0) && (
          <button
            onClick={clearFilters}
            className="px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* カテゴリフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">疾患カテゴリ</label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">すべて</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* 重症度フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">重症度</label>
              <div className="space-y-2">
                {['low', 'mild', 'moderate', 'high', 'severe'].map(severity => (
                  <label key={severity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.severity?.includes(severity) || false}
                      onChange={(e) => {
                        const current = filters.severity || [];
                        if (e.target.checked) {
                          updateFilter('severity', [...current, severity]);
                        } else {
                          updateFilter('severity', current.filter(s => s !== severity));
                        }
                      }}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {severity === 'low' ? '軽微' :
                       severity === 'mild' ? '軽度' :
                       severity === 'moderate' ? '中等度' :
                       severity === 'high' ? '重度' : '重篤'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* その他のフィルター */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isCommon || false}
                  onChange={(e) => updateFilter('isCommon', e.target.checked || undefined)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">一般的な疾患のみ</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isEmergency || false}
                  onChange={(e) => updateFilter('isEmergency', e.target.checked || undefined)}
                  className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">緊急性のある疾患</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;