import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

const AdminChat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const prevLastMessageIdRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // تشغيل الصوت إذا وصلت رسالة جديدة من الزائر
      const lastMsg = msgs[msgs.length - 1];
      if (
        lastMsg &&
        lastMsg.id !== prevLastMessageIdRef.current &&
        lastMsg.sender !== 'admin'
      ) {
        const audio = new Audio('/sound/mixkit-bell-notification-933.wav');
        audio.play().catch((err) => console.log('فشل تشغيل الصوت:', err));
      }

      prevLastMessageIdRef.current = lastMsg?.id;
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text: newMessage,
      sender: 'admin',
      timestamp: serverTimestamp(),
    });
    setNewMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="container py-4">
      <h3 className="mb-3">الرسائل الخاصة بالشات</h3>
      <p className="text-muted">Chat ID: {chatId}</p>

      <div className="border p-3 mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded ${
              msg.sender === 'admin' ? 'bg-light text-end' : 'bg-primary text-white'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <form onSubmit={handleSend} className="d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="اكتب رسالة..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="btn btn-success">إرسال</button>
      </form>
    </div>
  );
};

export default AdminChat;