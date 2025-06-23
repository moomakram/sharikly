import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getOrCreateUserId } from '../utils/userId';
import { uploadToCloudinary } from '../firebase/storageCloudinary';

const SectionChat = ({ category }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userId = getOrCreateUserId();
    const chatId = `${userId}_${category}`;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [category]);

  const sendMessage = async (newMessage, category, selectedFile) => {
    try {
      const userId = getOrCreateUserId();
      const chatId = `${userId}_${category}`;
      // إذا كان هناك ملف، أرسل فقط الملف (صورة/فيديو/صوت)
      if (selectedFile) {
        const { url, type } = await uploadToCloudinary(chatId, selectedFile);
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          url,
          type,
          sender: userId,
          timestamp: serverTimestamp(),
        });
        return;
      }
      // إذا كانت رسالة نصية فقط
      if (!newMessage || !newMessage.trim()) {
        // لا ترسل رسالة فارغة
        return;
      }
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        sender: userId,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    await sendMessage(newMessage, category, selectedFile);
    setNewMessage('');
    setSelectedFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const renderMessage = (msg) => {
    // صورة (url/type)
    if (msg.type && msg.type.startsWith('image') && msg.url) {
      return (
        <img
          src={msg.url}
          alt="uploaded"
          style={{ maxWidth: 300, borderRadius: 8 }}
        />
      );
    }
    // فيديو (url/type)
    if (msg.type && msg.type.startsWith('video') && msg.url) {
      return (
        <video controls style={{ maxWidth: 300, borderRadius: 8 }}>
          <source src={msg.url} type={msg.type} />
          المتصفح لا يدعم تشغيل الفيديو.
        </video>
      );
    }
    // صوت (url/type)
    if (msg.type && msg.type.startsWith('audio') && msg.url) {
      return (
        <audio controls style={{ maxWidth: 300 }}>
          <source src={msg.url} type={msg.type} />
          المتصفح لا يدعم تشغيل الصوت.
        </audio>
      );
    }
    // صورة كنص HTML (دعم النظام القديم)
    if (msg.text && msg.text.includes('<img')) {
      const srcMatch = msg.text.match(/src="([^"]+)"/);
      const src = srcMatch ? srcMatch[1] : null;
      return (
        <img
          src={src}
          alt="uploaded"
          style={{ maxWidth: 300, borderRadius: 8 }}
        />
      );
    }
    // نص عادي
    if (msg.text) {
      return <span>{msg.text}</span>;
    }
    return null;
  };

  return (
    <div>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            {renderMessage(msg)}
            <div style={{ fontSize: 12, color: '#888' }}>
              {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString() : ''}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <button type="button" onClick={() => fileInputRef.current.click()}>
          📎 ارفاق
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالة..."
        />
        <button type="submit">إرسال</button>
      </form>
      {selectedFile && <div>ملف محدد: {selectedFile.name}</div>}
    </div>
  );
};

export default SectionChat;