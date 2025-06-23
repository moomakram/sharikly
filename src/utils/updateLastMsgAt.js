import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const updateLastMsgAt = async (chatId) => {
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, { lastMsgAt: serverTimestamp() });
};
