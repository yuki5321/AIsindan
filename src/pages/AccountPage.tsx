import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); // ログアウト後、ホームページに遷移
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">アカウント情報</h2>
      {user && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">メールアドレス</p>
            <p className="text-lg text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">ユーザーID</p>
            <p className="text-sm text-gray-700">{user.id}</p>
          </div>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="mt-8 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        ログアウト
      </button>
    </div>
  );
}
