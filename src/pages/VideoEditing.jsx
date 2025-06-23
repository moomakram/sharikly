import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase/firebase';
import { uploadToCloudinary as uploadFile } from '../firebase/storageCloudinary';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { createChat } from '../firebase/chat';

const VideoEditing = () => {
  const { darkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [details, setDetails] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage); // تحميل اللغة المحفوظة
    }
  }, [i18n]);

  useEffect(() => {
    async function initChat() {
      const storedChatId = sessionStorage.getItem('chatId-video-editing');
      if (storedChatId) {
        setChatId(storedChatId);
      } else {
        const newChatId = await createChat('video-editing');
        sessionStorage.setItem('chatId-video-editing', newChatId);
        setChatId(newChatId);
      }
    }
    initChat();
  }, []);

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    let messageContent = newMessage;

    if (selectedFile) {
      try {
        const { url, type } = await uploadFile(chatId, selectedFile);
        if (type && type.startsWith('image')) {
          messageContent = `<img src="${url}" alt="uploaded image" style="max-width:100%; border-radius: 8px;"/>`;
        } else if (type && type.startsWith('video')) {
          messageContent = `<video controls src="${url}" style="max-width:100%; border-radius: 8px;"></video>`;
        } else {
          messageContent = `<a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">Download file</a>`;
        }
      } catch (error) {
        console.error('File upload failed:', error);
        alert('فشل رفع الملف. يرجى التحقق من الاتصال أو المحاولة لاحقاً.');
        return;
      }
    }

    await addDoc(messagesRef, {
      text: messageContent,
      sender: 'client',
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
    setSelectedFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const sendOrderDetails = async (e) => {
    e.preventDefault();
    if (!details.trim() && !selectedFile) return;

    const requestsRef = collection(db, 'requests-video-editing');
    let requestContent = details;

    if (selectedFile) {
      try {
        const { url, type } = await uploadFile(chatId, selectedFile);
        if (type.startsWith('image')) {
          requestContent += `<br/><img src="${url}" alt="uploaded image" style="max-width:100%; border-radius: 8px;"/>`;
        } else if (type.startsWith('video')) {
          requestContent += `<br/><video controls src="${url}" style="max-width:100%; border-radius: 8px;"></video>`;
        } else {
          requestContent += `<br/><a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">Download file</a>`;
        }
      } catch (error) {
        console.error('File upload failed:', error);
        return;
      }
    }

    await addDoc(requestsRef, {
      chatId,
      details: requestContent,
      timestamp: serverTimestamp(),
    });

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: `✍️ ${t('order_details')}: ${requestContent}`,
      sender: 'client',
      timestamp: serverTimestamp(),
    });

    setDetails('');
    setSelectedFile(null);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  return (
    <div className={`${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`} style={{ minHeight: '100vh', width: '100vw' }}>
      <div className="container py-4">
        <h2 className="text-center mb-4">🎥 {t('video_editing')}</h2>
        <p className="text-center mb-5">{t('video_description')}</p>
        <div className="d-flex flex-wrap justify-content-center gap-4">
          {/* Chat Section */}
          <div className="card shadow-sm flex-grow-1" style={{ maxWidth: '45%' }}>
            <div className="card-header bg-primary text-white text-center">
              <h5 className="mb-0">{t('chat_section')}</h5>
            </div>
            <div className="card-body d-flex flex-column" style={{ overflowY: 'auto', maxHeight: '300px' }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`py-2 px-3 my-1 d-inline-block ${
                    msg.sender === 'client' ? 'align-self-start' : 'align-self-end'
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                  style={{
                    maxWidth: '80%',
                    borderRadius: '9999px',
                    backgroundColor: msg.sender === 'client' ? '#cce5ff' : '#b2f2bb',
                    color: '#000',
                    wordBreak: 'break-word',
                    border: '1px solid #aaa',
                    whiteSpace: 'pre-wrap',
                  }}
                ></div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="card-footer">
              <div className="mb-2 d-flex align-items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary me-2"
                  onClick={() => fileInputRef.current.click()}
                >
                  📎 {t('attach_file')}
                </button>
                <input
                  type="text"
                  className="form-control mx-2"
                  placeholder={t('write_message')}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(e); }}
                />
                <button className="btn btn-primary" onClick={handleSend}>
                  {t('send')}
                </button>
              </div>
              {selectedFile && (
                <div className="mt-2">
                  <strong>{t('selected_file')}:</strong> {selectedFile.name}
                </div>
              )}
            </div>
          </div>

          {/* Request Form Section */}
          <div className="card shadow-sm flex-grow-1" style={{ maxWidth: '45%' }}>
            <div className="card-header bg-primary text-white text-center">
              <h5 className="mb-0">{t('request_service')}</h5>
            </div>
            <div className="card-body">
              {formSuccess && <div className="alert alert-success">{t('request_sent_success')}</div>}
              <form onSubmit={sendOrderDetails}>
                <div className="mb-3">
                  <label className="form-label">{t('order_details')}</label>
                  <textarea
                    className="form-control"
                    rows="8"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}>
                  </textarea>
                </div>
                <div className="mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={() => fileInputRef.current.click()}
                  >
                    📎 {t('attach_file')}
                  </button>
                  {selectedFile && (
                    <div className="mt-2">
                      <strong>{t('selected_file')}:</strong> {selectedFile.name}
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  {t('send_request')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditing;
