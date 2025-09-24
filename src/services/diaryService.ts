import { supabase } from '../lib/supabase';

export interface DiaryRecord {
  id?: string;
  user_id: string;
  record_date: string; // YYYY-MM-DD
  memo?: string;
  image_url?: string;
}

// Fetch all records for the logged-in user
export const getDiaryRecords = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('diary_records')
    .select('*')
    .eq('user_id', user.id)
    .order('record_date', { ascending: false });

  if (error) throw error;
  return data;
};

// Add a new diary record, including image upload
export const addDiaryRecord = async (record: Omit<DiaryRecord, 'user_id'>, imageFile?: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not logged in');

  let imageUrl: string | undefined = undefined;

  // 1. Upload image if it exists
  if (imageFile) {
    const fileName = `${user.id}/${Date.now()}_${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('diary-images') // Assumes a bucket named 'diary-images'
      .upload(fileName, imageFile);

    if (uploadError) throw uploadError;

    // 2. Get the public URL of the uploaded image
    const { data: urlData } = supabase.storage
      .from('diary-images')
      .getPublicUrl(uploadData.path);
    imageUrl = urlData.publicUrl;
  }

  // 3. Insert the record into the database
  const recordToInsert = {
    ...record,
    user_id: user.id,
    image_url: imageUrl,
  };

  const { data, error } = await supabase
    .from('diary_records')
    .insert(recordToInsert)
    .select();

  if (error) throw error;
  return data[0];
};

// Delete a diary record
export const deleteDiaryRecord = async (recordId: string) => {
  const { error } = await supabase
    .from('diary_records')
    .delete()
    .eq('id', recordId);

  if (error) throw error;
};
