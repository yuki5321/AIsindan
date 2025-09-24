import React, { useEffect, useState, useMemo } from 'react';
import { getDiaryRecords, addDiaryRecord, deleteDiaryRecord, DiaryRecord } from '../services/diaryService';
import Calendar from '../components/Calendar';
import { Plus, Trash2, X } from 'lucide-react';

// Add Record Modal Component
const AddRecordModal = ({ date, onClose, onSave }: {
  date: Date;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [memo, setMemo] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const record: Omit<DiaryRecord, 'user_id'> = {
        record_date: date.toISOString().split('T')[0],
        memo: memo,
      };
      await addDiaryRecord(record, imageFile || undefined);
      onSave(); // Refresh the list
    } catch (error) {
      console.error("Failed to save record:", error);
      // Here you could show an error message inside the modal
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">記録を追加</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="font-medium">日付</label>
              <p>{date.toLocaleDateString('ja-JP')}</p>
            </div>
            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
              <textarea id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} rows={4} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">画像</label>
              <input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium">キャンセル</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:bg-blue-300">
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function DiaryPage() {
  const [records, setRecords] = useState<DiaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await getDiaryRecords();
      setRecords(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (recordId: string) => {
    if (window.confirm('この記録を削除しますか？')) {
      try {
        await deleteDiaryRecord(recordId);
        fetchRecords(); // Refresh list
      } catch (error) {
        console.error("Failed to delete record:", error);
      }
    }
  };

  const recordsForSelectedDate = useMemo(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return records.filter(r => r.record_date === dateString);
  }, [records, selectedDate]);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">症状日記</h2>
      
      {loading && <p>データを読み込んでいます...</p>}
      {error && <p className="text-red-500">エラー: {error}</p>}
      
      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Calendar 
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              setSelectedDate={setSelectedDate}
              records={records}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} の記録
              </h3>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                <Plus className="w-5 h-5 mr-2" />
                記録を追加
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {recordsForSelectedDate.length > 0 ? (
                recordsForSelectedDate.map(record => (
                  <div key={record.id} className="bg-white p-4 rounded-lg shadow-md border">
                    {record.image_url && <img src={record.image_url} alt="Diary entry" className="rounded-md mb-3 w-full"/>}
                    <p className="text-gray-700 whitespace-pre-wrap">{record.memo}</p>
                    <div className="text-right mt-2">
                      <button onClick={() => handleDelete(record.id!)} className="p-2 rounded-full hover:bg-red-100">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
                  <p>この日の記録はありません。</p>
                  <p>「記録を追加」ボタンから最初の記録を作成しましょう。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <AddRecordModal 
          date={selectedDate} 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => {
            setIsModalOpen(false);
            fetchRecords();
          }}
        />
      )}
    </div>
  );
}
