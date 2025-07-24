import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { checkDatabaseInitialization, testDatabaseConnection, isSupabaseConfigured } from '../lib/supabase';

interface DatabaseStatusProps {
  onClose: () => void;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ onClose }) => {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    isInitialized: boolean;
    tableStatus: Record<string, boolean>;
    dataStatus: Record<string, number>;
    loading: boolean;
    error?: string;
  }>({
    isConnected: false,
    isInitialized: false,
    tableStatus: {},
    dataStatus: {},
    loading: true
  });

  const checkStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const isConfigured = isSupabaseConfigured();
      
      if (!isConfigured) {
        setStatus({
          isConnected: false,
          isInitialized: false,
          tableStatus: {},
          dataStatus: {},
          loading: false,
          error: 'Supabase環境変数が設定されていません'
        });
        return;
      }

      const isConnected = await testDatabaseConnection();
      
      if (isConnected) {
        const dbStatus = await checkDatabaseInitialization();
        setStatus({
          isConnected: true,
          isInitialized: dbStatus.isInitialized,
          tableStatus: dbStatus.tableStatus,
          dataStatus: dbStatus.dataStatus,
          loading: false
        });
      } else {
        setStatus({
          isConnected: false,
          isInitialized: false,
          tableStatus: {},
          dataStatus: {},
          loading: false,
          error: 'データベースに接続できません'
        });
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      }));
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusIcon = (isOk: boolean) => {
    return isOk ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusColor = (isOk: boolean) => {
    return isOk ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">データベース状態</h3>
            <p className="text-sm text-gray-500">Supabase接続・初期化状況</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={checkStatus}
            disabled={status.loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="状態を更新"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${status.loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="閉じる"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {status.loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">データベース状態を確認中...</span>
        </div>
      )}

      {!status.loading && (
        <>
          {status.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">{status.error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* 接続状態 */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(status.isConnected)}`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.isConnected)}
                <span className="font-medium">データベース接続</span>
              </div>
              <span className="text-sm font-medium">
                {status.isConnected ? '接続済み' : '未接続'}
              </span>
            </div>

            {/* 初期化状態 */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(status.isInitialized)}`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.isInitialized)}
                <span className="font-medium">データベース初期化</span>
              </div>
              <span className="text-sm font-medium">
                {status.isInitialized ? '完了' : '未完了'}
              </span>
            </div>

            {/* テーブル状態詳細 */}
            {Object.keys(status.tableStatus).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">テーブル状態</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(status.tableStatus).map(([table, isOk]) => (
                    <div key={table} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{table}</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(isOk)}
                        <span className="text-gray-500">
                          ({status.dataStatus[table] || 0}件)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 接続方法の案内 */}
            {!status.isConnected && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Supabaseに接続するには</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>1. 画面右上の「Connect to Supabase」ボタンをクリック</p>
                  <p>2. Supabaseプロジェクトの設定を行う</p>
                  <p>3. 環境変数が正しく設定されていることを確認</p>
                </div>
              </div>
            )}

            {/* デモモードの説明 */}
            {!isSupabaseConfigured() && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">現在の動作モード</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>• デモモード: サンプルデータを使用</p>
                  <p>• 基本的な機能は利用可能</p>
                  <p>• 完全な機能にはSupabase接続が必要</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DatabaseStatus;