import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';

const ChatDetail = ({ chatId, chatType }) => {
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [userRole, setUserRole] = useState('admin'); // أو 'customer' حسب من دخل المحادثة

  // الحصول على المحادثة من Firestore
  useEffect(() => {
    const fetchChat = async () => {
      const chatRef = doc(db, 'chats', chatType, chatId);  // استخدام التخصص للبحث عن المحادثة
      const chatDoc = await getDoc(chatRef);
      setChat(chatDoc.data());
    };

    fetchChat();
  }, [chatId, chatType]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const chatRef = doc(db, 'chats', chatType, chatId);
    await updateDoc(chatRef, {
      messages: arrayUnion({
        sender: userRole,  // المستخدم المرسل (عميل أو إداري)
        message: newMessage,
        timestamp: Timestamp.now(),
      }),
    });

    setNewMessage('');
  };

  if (!chat) return <p>Loading...</p>;

  return (
    <div>
      <h1>Chat - {chatType} Support</h1>
      <div>
        {chat.messages.map((msg, index) => (
          <div key={index}>
            <p>
              <strong>{msg.sender === 'admin' ? 'Admin' : 'Customer'}:</strong> {msg.message}
            </p>
            <p><em>{new Date(msg.timestamp.seconds * 1000).toLocaleString()}</em></p>
          </div>
        ))}
      </div>

      {/* نموذج إرسال الرسالة الجديدة */}
      <textarea 
        value={newMessage} 
        onChange={(e) => setNewMessage(e.target.value)} 
        placeholder="Type your message..." 
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatDetail;
