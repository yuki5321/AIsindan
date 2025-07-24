import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, ExternalLink, AlertCircle, Loader2, Search, Target, Building } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  distance: number;
  openHours: string;
  specialties: string[];
  lat: number;
  lng: number;
  website?: string;
  isOpen: boolean;
}

interface HospitalMapProps {
  onClose: () => void;
}

const HospitalMap: React.FC<HospitalMapProps> = ({ onClose }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 35.6762, lng: 139.6503 }); // 東京駅をデフォルト
  const [searchLocation, setSearchLocation] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentLocationName, setCurrentLocationName] = useState('東京駅周辺');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 詳細な地名データベース
  const locationDatabase: { [key: string]: { lat: number; lng: number; name: string; prefecture: string } } = {
    // 東京都
    '新宿': { lat: 35.6896, lng: 139.6917, name: '新宿', prefecture: '東京都' },
    '渋谷': { lat: 35.6580, lng: 139.7016, name: '渋谷', prefecture: '東京都' },
    '池袋': { lat: 35.7295, lng: 139.7109, name: '池袋', prefecture: '東京都' },
    '銀座': { lat: 35.6762, lng: 139.7649, name: '銀座', prefecture: '東京都' },
    '上野': { lat: 35.7074, lng: 139.7736, name: '上野', prefecture: '東京都' },
    '品川': { lat: 35.6284, lng: 139.7387, name: '品川', prefecture: '東京都' },
    '秋葉原': { lat: 35.6983, lng: 139.7731, name: '秋葉原', prefecture: '東京都' },
    '六本木': { lat: 35.6627, lng: 139.7314, name: '六本木', prefecture: '東京都' },
    '表参道': { lat: 35.6657, lng: 139.7128, name: '表参道', prefecture: '東京都' },
    '恵比寿': { lat: 35.6466, lng: 139.7100, name: '恵比寿', prefecture: '東京都' },
    '中野': { lat: 35.7056, lng: 139.6659, name: '中野', prefecture: '東京都' },
    '吉祥寺': { lat: 35.7033, lng: 139.5797, name: '吉祥寺', prefecture: '東京都' },
    '立川': { lat: 35.6939, lng: 139.4081, name: '立川', prefecture: '東京都' },
    '町田': { lat: 35.5439, lng: 139.4267, name: '町田', prefecture: '東京都' },
    
    // 神奈川県
    '横浜': { lat: 35.4437, lng: 139.6380, name: '横浜', prefecture: '神奈川県' },
    '川崎': { lat: 35.5308, lng: 139.7029, name: '川崎', prefecture: '神奈川県' },
    '藤沢': { lat: 35.3388, lng: 139.4889, name: '藤沢', prefecture: '神奈川県' },
    '鎌倉': { lat: 35.3193, lng: 139.5519, name: '鎌倉', prefecture: '神奈川県' },
    '相模原': { lat: 35.5731, lng: 139.3699, name: '相模原', prefecture: '神奈川県' },
    
    // 大阪府
    '大阪': { lat: 34.6937, lng: 135.5023, name: '大阪', prefecture: '大阪府' },
    '梅田': { lat: 34.7024, lng: 135.4959, name: '梅田', prefecture: '大阪府' },
    '難波': { lat: 34.6661, lng: 135.5000, name: '難波', prefecture: '大阪府' },
    '天王寺': { lat: 34.6452, lng: 135.5066, name: '天王寺', prefecture: '大阪府' },
    '新大阪': { lat: 34.7326, lng: 135.5003, name: '新大阪', prefecture: '大阪府' },
    
    // 京都府
    '京都': { lat: 35.0116, lng: 135.7681, name: '京都', prefecture: '京都府' },
    '四条': { lat: 35.0037, lng: 135.7681, name: '四条', prefecture: '京都府' },
    '河原町': { lat: 35.0037, lng: 135.7681, name: '河原町', prefecture: '京都府' },
    
    // 愛知県
    '名古屋': { lat: 35.1815, lng: 136.9066, name: '名古屋', prefecture: '愛知県' },
    '栄': { lat: 35.1677, lng: 136.9089, name: '栄', prefecture: '愛知県' },
    
    // 福岡県
    '福岡': { lat: 33.5904, lng: 130.4017, name: '福岡', prefecture: '福岡県' },
    '博多': { lat: 33.5904, lng: 130.4017, name: '博多', prefecture: '福岡県' },
    '天神': { lat: 33.5904, lng: 130.4017, name: '天神', prefecture: '福岡県' },
    
    // その他主要都市
    '札幌': { lat: 43.0642, lng: 141.3469, name: '札幌', prefecture: '北海道' },
    '仙台': { lat: 38.2682, lng: 140.8694, name: '仙台', prefecture: '宮城県' },
    '広島': { lat: 34.3853, lng: 132.4553, name: '広島', prefecture: '広島県' },
    '神戸': { lat: 34.6901, lng: 135.1956, name: '神戸', prefecture: '兵庫県' }
  };

  // 位置情報取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          setCurrentLocationName('現在地');
          findNearbyHospitals(location);
        },
        (error) => {
          console.warn('位置情報取得エラー:', error.message);
          findNearbyHospitals(mapCenter);
        }
      );
    } else {
      findNearbyHospitals(mapCenter);
    }
  }, []);

  // 検索候補の生成
  const generateSuggestions = (query: string) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const suggestions = Object.keys(locationDatabase)
      .filter(location => 
        location.includes(query) || 
        locationDatabase[location].name.includes(query) ||
        locationDatabase[location].prefecture.includes(query)
      )
      .slice(0, 8)
      .map(key => {
        const loc = locationDatabase[key];
        return `${loc.name}（${loc.prefecture}）`;
      });

    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  // 検索入力の処理
  const handleSearchInput = (value: string) => {
    setSearchLocation(value);
    generateSuggestions(value);
  };

  // 候補選択の処理
  const selectSuggestion = (suggestion: string) => {
    const locationName = suggestion.split('（')[0];
    setSearchLocation(locationName);
    setShowSuggestions(false);
    searchForSpecificLocation(locationName);
  };

  // 特定の場所を検索
  const searchForSpecificLocation = async (locationName: string) => {
    setSearchLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const locationKey = Object.keys(locationDatabase).find(key => 
        locationDatabase[key].name === locationName || key === locationName
      );
      
      if (locationKey) {
        const location = locationDatabase[locationKey];
        setMapCenter(location);
        setCurrentLocationName(`${location.name}（${location.prefecture}）`);
        setUserLocation(null);
        await findNearbyHospitals(location);
        setSearchLocation('');
        setShowSuggestions(false);
      } else {
        setError(`「${locationName}」の検索結果が見つかりませんでした。`);
      }
    } catch (error) {
      setError('場所の検索に失敗しました。');
    } finally {
      setSearchLoading(false);
    }
  };

  // 場所検索機能
  const searchForLocation = async () => {
    if (!searchLocation.trim()) return;
    await searchForSpecificLocation(searchLocation.trim());
  };

  // 現在地を使用
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setSearchLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          setCurrentLocationName('現在地');
          findNearbyHospitals(location);
          setSearchLoading(false);
        },
        (error) => {
          setError('現在地の取得に失敗しました。位置情報の許可を確認してください。');
          setSearchLoading(false);
        }
      );
    }
  };

  // 近くの皮膚科病院を検索（モックデータ）- 検索範囲を大幅に拡大
  const findNearbyHospitals = async (location: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockHospitals: Hospital[] = [
        {
          id: '1',
          name: `${currentLocationName.split('（')[0]}皮膚科クリニック`,
          address: `${currentLocationName.split('（')[0]}1-1-1`,
          phone: '03-1234-5678',
          rating: 4.5,
          distance: 0.3,
          openHours: '9:00-18:00',
          specialties: ['一般皮膚科', 'アトピー治療', '美容皮膚科'],
          lat: location.lat + 0.002,
          lng: location.lng + 0.002,
          website: 'https://example.com',
          isOpen: true
        },
        {
          id: '2',
          name: 'さくら皮膚科医院',
          address: `${currentLocationName.split('（')[0]}2-2-2`,
          phone: '03-2345-6789',
          rating: 4.2,
          distance: 0.7,
          openHours: '10:00-19:00',
          specialties: ['一般皮膚科', '小児皮膚科'],
          lat: location.lat - 0.005,
          lng: location.lng + 0.003,
          isOpen: true
        },
        {
          id: '3',
          name: 'みどり皮膚科病院',
          address: `${currentLocationName.split('（')[0]}3-3-3`,
          phone: '03-3456-7890',
          rating: 4.7,
          distance: 1.1,
          openHours: '8:30-17:30',
          specialties: ['一般皮膚科', '皮膚外科', 'レーザー治療'],
          lat: location.lat + 0.008,
          lng: location.lng - 0.006,
          isOpen: false
        },
        {
          id: '4',
          name: 'あおば皮膚科クリニック',
          address: `${currentLocationName.split('（')[0]}4-4-4`,
          phone: '03-4567-8901',
          rating: 4.0,
          distance: 1.8,
          openHours: '9:30-18:30',
          specialties: ['一般皮膚科', 'アレルギー科'],
          lat: location.lat - 0.010,
          lng: location.lng - 0.004,
          isOpen: true
        },
        {
          id: '5',
          name: 'ひまわり皮膚科',
          address: `${currentLocationName.split('（')[0]}5-5-5`,
          phone: '03-5678-9012',
          rating: 3.8,
          distance: 2.3,
          openHours: '10:00-20:00',
          specialties: ['一般皮膚科', '美容皮膚科', 'ニキビ治療'],
          lat: location.lat + 0.012,
          lng: location.lng + 0.009,
          isOpen: true
        },
        {
          id: '6',
          name: 'すみれ皮膚科',
          address: `${currentLocationName.split('（')[0]}6-6-6`,
          phone: '03-6789-0123',
          rating: 4.3,
          distance: 2.9,
          openHours: '9:00-17:00',
          specialties: ['一般皮膚科', '乾癬治療'],
          lat: location.lat - 0.015,
          lng: location.lng + 0.008,
          isOpen: true
        },
        {
          id: '7',
          name: 'つばき皮膚科クリニック',
          address: `${currentLocationName.split('（')[0]}7-7-7`,
          phone: '03-7890-1234',
          rating: 4.1,
          distance: 3.5,
          openHours: '9:00-18:00',
          specialties: ['一般皮膚科', '帯状疱疹治療'],
          lat: location.lat + 0.020,
          lng: location.lng - 0.012,
          isOpen: true
        },
        {
          id: '8',
          name: 'もみじ皮膚科医院',
          address: `${currentLocationName.split('（')[0]}8-8-8`,
          phone: '03-8901-2345',
          rating: 3.9,
          distance: 4.2,
          openHours: '10:00-19:00',
          specialties: ['一般皮膚科', '脂漏性皮膚炎治療'],
          lat: location.lat - 0.025,
          lng: location.lng + 0.015,
          isOpen: true
        },
        {
          id: '9',
          name: 'かえで皮膚科病院',
          address: `${currentLocationName.split('（')[0]}9-9-9`,
          phone: '03-9012-3456',
          rating: 4.4,
          distance: 5.1,
          openHours: '8:00-17:00',
          specialties: ['一般皮膚科', '皮膚がん検診', '形成外科'],
          lat: location.lat + 0.030,
          lng: location.lng + 0.020,
          isOpen: true
        },
        {
          id: '10',
          name: 'いちょう皮膚科クリニック',
          address: `${currentLocationName.split('（')[0]}10-10-10`,
          phone: '03-0123-4567',
          rating: 4.6,
          distance: 6.3,
          openHours: '9:30-18:30',
          specialties: ['一般皮膚科', '美容皮膚科', 'レーザー脱毛'],
          lat: location.lat - 0.035,
          lng: location.lng - 0.025,
          isOpen: false
        },
        {
          id: '11',
          name: 'けやき皮膚科医院',
          address: `${currentLocationName.split('（')[0]}11-11-11`,
          phone: '03-1234-5670',
          rating: 4.0,
          distance: 7.8,
          openHours: '10:00-20:00',
          specialties: ['一般皮膚科', '小児皮膚科', 'アトピー専門'],
          lat: location.lat + 0.040,
          lng: location.lng - 0.030,
          isOpen: true
        },
        {
          id: '12',
          name: 'さざんか皮膚科クリニック',
          address: `${currentLocationName.split('（')[0]}12-12-12`,
          phone: '03-2345-6781',
          rating: 3.7,
          distance: 8.9,
          openHours: '9:00-17:30',
          specialties: ['一般皮膚科', '接触皮膚炎治療'],
          lat: location.lat - 0.045,
          lng: location.lng + 0.035,
          isOpen: true
        },
        {
          id: '13',
          name: 'ばら皮膚科病院',
          address: `${currentLocationName.split('（')[0]}13-13-13`,
          phone: '03-3456-7892',
          rating: 4.8,
          distance: 9.5,
          openHours: '8:30-18:00',
          specialties: ['一般皮膚科', '皮膚外科', '皮膚病理'],
          lat: location.lat + 0.050,
          lng: location.lng + 0.040,
          isOpen: true
        },
        {
          id: '14',
          name: 'ゆり皮膚科クリニック',
          address: `${currentLocationName.split('（')[0]}14-14-14`,
          phone: '03-4567-8903',
          rating: 4.2,
          distance: 10.7,
          openHours: '10:00-19:30',
          specialties: ['一般皮膚科', '女性専門外来'],
          lat: location.lat - 0.055,
          lng: location.lng - 0.045,
          isOpen: true
        },
        {
          id: '15',
          name: 'あじさい皮膚科医院',
          address: `${currentLocationName.split('（')[0]}15-15-15`,
          phone: '03-5678-9014',
          rating: 3.6,
          distance: 12.3,
          openHours: '9:00-18:00',
          specialties: ['一般皮膚科', '高齢者皮膚科'],
          lat: location.lat + 0.060,
          lng: location.lng - 0.050,
          isOpen: false
        }
      ];

      setHospitals(mockHospitals);
    } catch (error) {
      setError('病院情報の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}&destination_place_id=${hospital.name}`;
    window.open(url, '_blank');
  };

  const openMapWithAllHospitals = () => {
    const searchQuery = `皮膚科 ${currentLocationName}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}/@${mapCenter.lat},${mapCenter.lng},15z`;
    window.open(url, '_blank');
  };

  const callHospital = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchForLocation();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 z-50">
      <div className="bg-white rounded-2xl w-full h-full max-w-[95vw] max-h-[95vh] overflow-hidden shadow-2xl">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">最寄りの皮膚科病院</h2>
              <p className="text-blue-100 text-sm">
                {currentLocationName}周辺の検索結果（半径15km圏内）
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 詳細検索バー */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="詳細な場所を検索（例: 新宿、渋谷、梅田）"
                value={searchLocation}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                onFocus={() => generateSuggestions(searchLocation)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={searchLoading}
              />
              
              {/* 検索候補 */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-2"
                    >
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={searchForLocation}
              disabled={searchLoading || !searchLocation.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {searchLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span>検索</span>
            </button>
            
            <button
              onClick={useCurrentLocation}
              disabled={searchLoading}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
            >
              <Target className="w-5 h-5" />
              <span>現在地</span>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-220px)]">
          {/* 左パネル - 病院リスト（拡大） */}
          <div className="w-2/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-800 text-sm">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600">近くの皮膚科病院を検索中...</p>
                  <p className="text-sm text-gray-500 mt-1">半径15km圏内で検索しています</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    検索結果 ({hospitals.length}件) - 半径15km圏内
                  </h3>
                  
                  {hospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedHospital?.id === hospital.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedHospital(hospital)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-900">{hospital.name}</h4>
                        <div className="flex items-center space-x-1">
                          {getRatingStars(hospital.rating)}
                          <span className="text-sm text-gray-600 ml-1">
                            {hospital.rating}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{hospital.address}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Navigation className="w-4 h-4" />
                          <span>{hospital.distance}km</span>
                          <span className="text-gray-400">•</span>
                          <Clock className="w-4 h-4" />
                          <span className={hospital.isOpen ? 'text-green-600' : 'text-red-600'}>
                            {hospital.isOpen ? '営業中' : '営業時間外'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hospital.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            callHospital(hospital.phone);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>電話</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInMaps(hospital);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>経路</span>
                        </button>
                        
                        {hospital.website && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(hospital.website, '_blank');
                            }}
                            className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>サイト</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右パネル - 外部マップ開くボタン（縮小・スクロール可能） */}
          <div className="w-1/3 relative overflow-y-auto">
            <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <div className="space-y-6">
                {/* メインマップボタン */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    詳細マップ
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Google Mapsで{currentLocationName}周辺の皮膚科を詳しく確認
                  </p>
                  
                  <button
                    onClick={openMapWithAllHospitals}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Google Mapsで開く</span>
                  </button>
                </div>

                {/* 機能説明 */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm">確認できること</h4>
                  <ul className="text-gray-600 space-y-2 text-xs">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>リアルタイムの営業状況</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>患者の口コミ・評価</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>クリニックの写真</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>詳細な経路案内</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>混雑状況の予測</span>
                    </li>
                  </ul>
                </div>

                {/* 使い方ガイド */}
                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                  <h4 className="font-medium text-green-900 mb-3 text-sm">使い方ガイド</h4>
                  <div className="space-y-2 text-xs text-green-800">
                    <div className="flex items-start space-x-2">
                      <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">1</span>
                      <span>上記ボタンでGoogle Mapsを開く</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">2</span>
                      <span>気になる病院をタップして詳細確認</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">3</span>
                      <span>「経路」ボタンで道案内を開始</span>
                    </div>
                  </div>
                </div>

                {/* 注意事項 */}
                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                  <h4 className="font-medium text-yellow-900 mb-2 text-sm">ご注意</h4>
                  <ul className="text-yellow-800 space-y-1 text-xs">
                    <li className="flex items-start space-x-2">
                      <span>•</span>
                      <span>営業時間は変更される場合があります</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span>•</span>
                      <span>事前に電話で確認することをお勧めします</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span>•</span>
                      <span>緊急時は救急外来をご利用ください</span>
                    </li>
                  </ul>
                </div>

                {/* 追加情報 */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">皮膚科受診のポイント</h4>
                  <ul className="text-gray-700 space-y-1 text-xs">
                    <li className="flex items-start space-x-2">
                      <span>•</span>
                      <span>症状の写真を撮っておく</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span>•</span>
                      <span>いつから症状があるか記録</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span>•</span>
                      <span>使用中の薬やアレルギーを伝える</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span>•</span>
                      <span>保険証を忘れずに持参</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細情報パネル */}
        {selectedHospital && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {selectedHospital.name}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{selectedHospital.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{selectedHospital.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{selectedHospital.openHours}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedHospital.isOpen 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedHospital.isOpen ? '営業中' : '営業時間外'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Navigation className="w-4 h-4 text-gray-500" />
                      <span>距離: {selectedHospital.distance}km</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>評価: {selectedHospital.rating}/5.0</span>
                    </div>
                    <div>
                      <span className="text-gray-500">専門分野:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedHospital.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => callHospital(selectedHospital.phone)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>電話</span>
                </button>
                <button
                  onClick={() => openInMaps(selectedHospital)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>経路</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p className="flex items-center">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              診断結果に基づいて適切な医療機関を受診してください
            </p>
            <p>データ提供: 医療機関データベース</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalMap;