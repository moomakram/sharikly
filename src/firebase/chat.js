// src/firebase/chat.js
import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { uploadFile } from './storage';

/** إنشاء شات جديد (يرجع chatId) ويُسجل الميتاداتا */
export async function createChat(category = 'general') {
  const chatId = uuidv4();
  await setDoc(doc(db, 'chats', chatId), {
    category,
    createdAt: serverTimestamp(),
  });
  return chatId;
}

/** إرسال رسالة نصيّة */
export async function sendMessage(chatId, text, sender = 'client', category = 'general') {
  // تحقق من وجود وثيقة الشات، إذا لم تكن موجودة أنشئها
  const chatDocRef = doc(db, 'chats', chatId);
  const chatDocSnap = await getDoc(chatDocRef);
  if (!chatDocSnap.exists()) {
    await setDoc(chatDocRef, {
      category,
      createdAt: serverTimestamp(),
    });
  }
  return addDoc(collection(db, 'chats', chatId, 'messages'), {
    text,
    sender,
    timestamp: serverTimestamp(),
  });
}

/** الاشتراك اللحظي في رسائل شات */
export function listenToMessages(chatId, callback) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  return onSnapshot(q, snapshot =>
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  );
}

/** إضافة تفاصيل طلب خدمة معينة */
export async function addServiceRequest(chatId, details, file) {
  try {
    let fileData = null;
    if (file) {
      fileData = await uploadFile(chatId, file);
    }

    return addDoc(collection(db, 'chats', chatId, 'requests'), {
      details,
      file: fileData ? fileData.url : null,
      fileType: fileData ? fileData.type : null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding service request:', error);
    throw error;
  }
}
