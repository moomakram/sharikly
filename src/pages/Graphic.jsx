import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import Picker from 'emoji-picker-react';

const Graphic = () => {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [details, setDetails] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedChatId = sessionStorage.getItem('chatId-graphic');
    if (storedChatId) {
      setChatId(storedChatId);
    } else {
      const newId = uuidv4();
      sessionStorage.setItem('chatId-graphic', newId);
      setChatId(newId);
      setDoc(doc(db, 'chats', newId), {
        category: 'graphic',
        createdAt: serverTimestamp(),
      });
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: newMessage,
      sender: 'client',
      timestamp: serverTimestamp(),
    });
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const sendOrderDetails = async (e) => {
    e.preventDefault();
    if (!details.trim()) return;

    await addDoc(collection(db, 'requests-graphic'), {
      chatId,
      details,
      timestamp: serverTimestamp(),
    });

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: `✍️ تفاصيل الطلب: ${details}`,
      sender: 'client',
      timestamp: serverTimestamp(),
    });

    setDetails('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">شات قسم الجرافيك</h2>

      <div className="row d-flex justify-content-center gap-5">
        {/* Chat Section */}
        <div className="card shadow-sm col-md-5" style={{ marginBottom: '30px' }}>
          <div className="card-header bg-primary text-white text-center">
            <h5 className="mb-0">محادثة قسم الجرافيك</h5>
          </div>
          <div className="card-body d-flex flex-column" style={{ overflowY: 'auto', maxHeight: '300px' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`py-2 px-3 my-1 d-inline-block ${msg.sender === 'client' ? 'align-self-start' : 'align-self-end'}`}
                style={{
                  maxWidth: '80%',
                  borderRadius: '9999px',
                  backgroundColor: msg.sender === 'client' ? '#cce5ff' : '#b2f2bb',
                  color: '#000',
                  wordBreak: 'break-word',
                  border: '1px solid #aaa',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="card-footer d-flex align-items-center position-relative">
            <button
              type="button"
              className="btn btn-light me-2"
              onClick={() => setShowEmojiPicker((val) => !val)}
            >
              😀
            </button>
            {showEmojiPicker && (
              <div style={{ position: 'absolute', bottom: '60px', left: '10px', zIndex: 999 }}>
                <Picker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <input
              type="text"
              className="form-control"
              placeholder="اكتب رسالتك..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage(e);
              }}
            />
            <button className="btn btn-primary" onClick={sendMessage}>
              إرسال
            </button>
          </div>
        </div>

        {/* Request Form Section */}
        <div className="card shadow-sm col-md-5" style={{ marginBottom: '30px' }}>
          <div className="card-header bg-primary text-white text-center">
            <h5 className="mb-0">طلب خدمة تصميم جرافيك</h5>
          </div>
          <div className="card-body">
            {formSuccess && <div className="alert alert-success">تم إرسال الطلب بنجاح!</div>}
            <form onSubmit={sendOrderDetails}>
              <div className="mb-3">
                <label className="form-label">تفاصيل الطلب</label>
                <textarea
                  className="form-control"
                  rows="8"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                إرسال الطلب
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graphic;
