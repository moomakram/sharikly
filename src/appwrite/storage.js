import { storage } from './appwrite';

/** رفع ملف */
export async function uploadFile(bucketId, file) {
  const response = await storage.createFile(bucketId, 'unique()', file);
  return response;
}

/** الحصول على رابط الملف */
export async function getFileUrl(bucketId, fileId) {
  return storage.getFileView(bucketId, fileId);
}
