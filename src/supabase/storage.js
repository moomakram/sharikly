import { supabase } from './supabase';

/** رفع ملف */
export async function uploadFile(filePath, file) {
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { publicUrl } = supabase.storage.from('uploads').getPublicUrl(filePath);
  return publicUrl;
}
