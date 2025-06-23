import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
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
import { createChat } from '../firebase/chat';

const Graphics = () => {
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

  // Voice recording state
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // حفظ واسترجاع الرسائل من localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('graphics-messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('graphics-messages', JSON.stringify(messages));
  }, [messages]);

  // حفظ واسترجاع اللغة
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // تهيئة الدردشة
  useEffect(() => {
    async function initChat() {
      const storedChatId = sessionStorage.getItem('chatId-graphics');
      if (storedChatId) {
        setChatId(storedChatId);
      } else {
        const newChatId = await createChat('graphics');
        sessionStorage.setItem('chatId-graphics', newChatId);
        setChatId(newChatId);
      }
    }
    initChat();
  }, []);

  // جلب الرسائل من Firestore
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

  // دالة حفظ رسالة صوتية في Firestore
  const saveMessageToFirestore = async (mediaUrl, mediaType) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text: '',
      sender: 'client',
      timestamp: serverTimestamp(),
      mediaUrl,
      mediaType,
    });
    setMessages((prev) => [
      ...prev,
      {
        text: '',
        sender: 'client',
        timestamp: new Date().toISOString(),
        mediaUrl,
        mediaType,
      }
    ]);
  };

  // دالة التسجيل الصوتي
  const handleVoiceRecord = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new window.MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          const file = new File([audioBlob], 'voiceMessage.webm', { type: 'audio/webm' });
          try {
            const result = await uploadFile(chatId, file);
            await saveMessageToFirestore(result.url, result.type);
          } catch (error) {
            console.error("فشل رفع الصوت:", error);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        console.error("فشل بدء التسجيل:", err);
      }
    } else {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    let messageContent = newMessage;
    let mediaUrl = null;
    let mediaType = null;

    if (selectedFile) {
      try {
        const { url, type } = await uploadFile(chatId, selectedFile);
        mediaUrl = url;
        mediaType = type;
        if (!newMessage.trim()) messageContent = '';
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
      mediaUrl,
      mediaType,
    });

    setMessages((prev) => [
      ...prev,
      {
        text: messageContent,
        sender: 'client',
        timestamp: new Date().toISOString(),
        mediaUrl,
        mediaType,
      }
    ]);

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

    const requestsRef = collection(db, 'requests-graphics');
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
        <h2 className="text-center mb-4" style={{ color: '#0d6efd' }}>
          🎨 {t('graphics_chat')}
        </h2>
        <p className="text-center mb-5">{t('graphics_chat_description')}</p>
        <div className="row d-flex justify-content-center gap-5">
          {/* Chat Section */}
          <div className="card shadow-sm col-md-5" style={{ marginBottom: '30px' }}>
            <div className="card-header bg-primary text-white text-center">
              <h5 className="mb-0">{t('chat_section')}</h5>
            </div>
            <div className="card-body d-flex flex-column" style={{ overflowY: 'auto', maxHeight: '300px' }}>
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`py-2 px-3 my-1 d-inline-block ${
                    message.sender === 'client' ? 'align-self-start' : 'align-self-end'
                  }`}
                  style={{
                    maxWidth: '80%',
                    borderRadius: '9999px',
                    backgroundColor: message.sender === 'client' ? '#cce5ff' : '#b2f2bb',
                    color: '#000',
                    wordBreak: 'break-word',
                    border: '1px solid #aaa',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {/* نص الرسالة */}
                  {message.text && (
                    <span dangerouslySetInnerHTML={{ __html: message.text }} />
                  )}
                  {/* ميديا الرسالة */}
                  {message?.mediaUrl && (
                    message?.mediaType?.startsWith("image/") ? (
                      <img src={message.mediaUrl} alt="صورة" style={{ maxWidth: "200px", borderRadius: 8, display: "block", marginTop: 8 }} />
                    ) : message?.mediaType?.startsWith("video/") ? (
                      <video controls src={message.mediaUrl} style={{ maxWidth: "250px", borderRadius: 8, display: "block", marginTop: 8 }} />
                    ) : message?.mediaType?.startsWith("audio/") ? (
                      <audio
                        controls
                        src={message.mediaUrl}
                        style={{
                          width: 220,
                          minWidth: 180,
                          maxWidth: "100%",
                          marginTop: 8,
                          display: "block",
                          background: "#f1f3f4",
                          borderRadius: 8,
                          outline: "none"
                        }}
                      />
                    ) : (
                      <a href={message.mediaUrl} target="_blank" rel="noreferrer" style={{ color: "#0d6efd", textDecoration: "underline", display: "block", marginTop: 8 }}>
                        عرض الملف
                      </a>
                    )
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="card-footer">
              <div className="mb-2 d-flex align-items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary me-2"
                  onClick={() => fileInputRef.current.click()}
                >
                  📎 {t('attach_file')}
                </button>
                <button
                  type="button"
                  className={`btn ${recording ? 'btn-danger' : 'btn-outline-secondary'} me-2`}
                  onClick={handleVoiceRecord}
                >
                  {recording ? '⏹️ ' + t('stop') : '🎙️ ' + t('voice_record')}
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
          <div className="card shadow-sm col-md-5" style={{ marginBottom: '30px' }}>
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

export default Graphics;
