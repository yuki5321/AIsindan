import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Globe, 
  MapPin, 
  Database, 
  Stethoscope, 
  User,
  LogIn, LogOut
} from 'lucide-react';

// Page Components
import HomePage from './pages/HomePage';
import SymptomDiagnosisPage from './pages/SymptomDiagnosisPage';
import ImageDiagnosisPage from './pages/ImageDiagnosisPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DiaryPage from './pages/DiaryPage';
import AccountPage from './pages/AccountPage';
import ProtectedRoute from './components/ProtectedRoute';

// Other Components
import HospitalMap from './components/HospitalMap';
import DatabaseStatus from './components/DatabaseStatus';

// Auth
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en' | 'ko' | 'zh'>('ja');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHospitalMap, setShowHospitalMap] = useState(false);
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);

  const languages = [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const handleLanguageChange = (langCode: 'ja' | 'en' | 'ko' | 'zh') => {
    setCurrentLanguage(langCode);
    setShowLanguageMenu(false);
  };

  const getNavClass = (path: string) => {
    return location.pathname === path
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">DermaAI</h1>
              </div>
            </Link>

            <div className="flex items-center space-x-2">
              {/* Language */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Globe className="w-6 h-6 text-gray-600" />
                </button>
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code as 'ja' | 'en' | 'ko' | 'zh')}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                          currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hospital Map */}
              <button
                onClick={() => setShowHospitalMap(!showHospitalMap)}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <MapPin className="w-6 h-6 text-gray-600" />
              </button>

              {/* DB Status */}
              <button
                onClick={() => setShowDatabaseStatus(!showDatabaseStatus)}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <Database className="w-6 h-6 text-gray-600" />
              </button>

              {/* Auth buttons */}
              {user ? (
                <>
                  <Link to="/account" className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                    <User className="w-6 h-6 text-blue-600" />
                  </Link>
                  <button onClick={logout} className="w-12 h-12 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                    <LogOut className="w-6 h-6 text-red-600" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="w-12 h-12 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                  <LogIn className="w-6 h-6 text-green-600" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <Link to="/" className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${getNavClass('/')}`}>
              ホーム
            </Link>
            <Link to="/image-diagnosis" className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${getNavClass('/image-diagnosis')}`}>
              画像診断
            </Link>
            <Link to="/symptom-diagnosis" className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${getNavClass('/symptom-diagnosis')}`}>
              症状診断
            </Link>
            {user && (
              <Link to="/diary" className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${getNavClass('/diary')}`}>
                症状日記
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/symptom-diagnosis" element={<SymptomDiagnosisPage />} />
          <Route path="/image-diagnosis" element={<ImageDiagnosisPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/account" element={<ProtectedRoute />}>
            <Route index element={<AccountPage />} />
          </Route>
          <Route path="/diary" element={<ProtectedRoute />}>
            <Route index element={<DiaryPage />} />
          </Route>
        </Routes>
      </main>

      {/* Modals */}
      {showHospitalMap && <HospitalMap onClose={() => setShowHospitalMap(false)} />}
      {showDatabaseStatus && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <DatabaseStatus onClose={() => setShowDatabaseStatus(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
