import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();

  // ユーザーがいない（未ログイン）場合は、ログインページにリダイレクト
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ログイン済みの場合は、子ルート（アカウントページなど）を表示
  return <Outlet />;
}
