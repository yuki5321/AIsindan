import { Link } from 'react-router-dom';
import { Stethoscope, FileImage, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold">DermaAIへようこそ</h1>
      <p className="mt-4 text-lg">AIによる皮膚画像診断を始めましょう。</p>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold">デバッグ情報</h2>
        <p className="text-sm">Vercelに設定されているSupabase URL:</p>
        <p className="font-mono bg-gray-200 p-2 rounded mt-2 break-all">{supabaseUrl || "未設定"}</p>
      </div>
    </div>
  );
};

export default HomePage;
