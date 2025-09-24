import { supabase } from '../lib/supabase';

// Helper to convert data URL to Blob
const dataUrlToBlob = async (dataUrl: string) => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return blob;
};

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

// Add a new diary record, including image upload from base64 string
export const addDiaryRecord = async (record: Omit<DiaryRecord, 'user_id' | 'id'>, imageBase64?: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not logged in');

  let imageUrl: string | undefined = undefined;

  // 1. Upload image if it exists
  if (imageBase64) {
    const imageBlob = await dataUrlToBlob(imageBase64);
    const fileExt = imageBlob.type.split('/')[1] || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('diary-images') // Assumes a bucket named 'diary-images'
      .upload(fileName, imageBlob, { contentType: imageBlob.type });

    if (uploadError) throw uploadError;

    // 2. Get the public URL of the uploaded image
    const { data: urlData } = supabase.storage
      .from('diary-images')
      .getPublicUrl(fileName);
      
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

// Update an existing diary record
export const updateDiaryRecord = async (recordId: string, updates: Partial<Omit<DiaryRecord, 'id' | 'user_id'>>) => {
  const { data, error } = await supabase
    .from('diary_records')
    .update(updates)
    .eq('id', recordId)
    .select();
  
  if (error) throw error;
  return data[0];
};
