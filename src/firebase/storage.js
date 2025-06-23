import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/** رفع ملف مباشرة إلى Firebase Storage */
export const uploadFile = async (chatId, file) => {
  try {
    const path = `${chatId}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, path);

    // رفع الملف إلى Firebase Storage
    await uploadBytes(fileRef, file);

    // الحصول على رابط التنزيل
    const url = await getDownloadURL(fileRef);

    console.log('File uploaded successfully:', { url, type: file.type });
    return { url, type: file.type };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
