import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, AlertCircle, X } from 'lucide-react';

interface HospitalMapProps {
  onClose: () => void;
}

const HospitalMap: React.FC<HospitalMapProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://www.google.com/maps/search/皮膚科/@${latitude},${longitude},15z`;
          window.open(url, '_blank');
          setStatus('success');
          onClose(); // Automatically close the modal on success
        },
        (error) => {
          let message = '不明なエラーが発生しました。';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = '現在地情報の利用が拒否されました。ブラウザの設定を確認してください。';
              break;
            case error.POSITION_UNAVAILABLE:
              message = '現在地情報を取得できませんでした。';
              break;
            case error.TIMEOUT:
              message = '現在地情報の取得がタイムアウトしました。';
              break;
          }
          setErrorMessage(message);
          setStatus('error');
        }
      );
    } else {
      setErrorMessage('お使いのブラウザは現在地情報に対応していません。');
      setStatus('error');
    }
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">現在地を取得中...</h2>
            <p className="text-gray-600 mt-2">近隣の病院を検索しています。</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">エラー</h2>
            <p className="text-gray-600 mt-2">{errorMessage}</p>
            <button 
              onClick={onClose} 
              className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              閉じる
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default HospitalMap;