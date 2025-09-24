import { Link } from 'react-router-dom';
import { Stethoscope, FileImage, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">DermaAIへようこそ</h1>
        {user ? (
          <p className="text-lg text-gray-600">こんにちは、{user.email}さん。どの機能を利用しますか？</p>
        ) : (
          <p className="text-lg text-gray-600">AIによる皮膚疾患診断支援システム</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Diagnosis Card */}
        <Link to="/image-diagnosis" className="group block bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:bg-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <FileImage className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">画像診断</h2>
          <p className="text-gray-600">皮膚の画像をアップロードして、AIによる診断候補を確認します。</p>
        </Link>

        {/* Symptom Diagnosis Card */}
        <Link to="/symptom-diagnosis" className="group block bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:bg-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">症状診断</h2>
          <p className="text-gray-600">気になる症状を選択して、関連する可能性のある疾患を調べます。</p>
        </Link>
      </div>

      {user && (
        <div className="text-center">
            <Link to="/diary" className="inline-block bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 px-8 py-4 hover:bg-white transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl font-medium text-gray-700">
                <div className="flex items-center">
                    <User className="w-5 h-5 mr-3 text-purple-600"/>
                    <span>症状日記を確認する</span>
                </div>
            </Link>
        </div>
      )}
    </div>
  );
}
