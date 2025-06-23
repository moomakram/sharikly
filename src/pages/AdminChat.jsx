import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { uploadToCloudinary } from '../firebase/storageCloudinary';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import EmojiPicker from 'emoji-picker-react';
import { updateLastMsgAt } from '../utils/updateLastMsgAt';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';

/**
 * ScrollButton component
 * - Shows ⬆ or ⬇ according to scroll direction
 * - Appears while scrolling, hides after 2 s of inactivity
 * - Smooth‑scrolls to top (oldest) or bottom (latest) on click
 */
const ScrollButton = ({ containerRef, bottomRef, darkMode }) => {
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState("down"); // "up" → go to oldest, "down" → go to latest
  const lastScrollTop = useRef(0);
  const hideTimeout = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const current = el.scrollTop;
      if (current < lastScrollTop.current) {
        setDirection("down");
      } else if (current > lastScrollTop.current) {
        setDirection("up");
      }
      lastScrollTop.current = current;
      setVisible(true);

      clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => setVisible(false), 2000);
    };

    el.addEventListener("scroll", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(hideTimeout.current);
    };
  }, [containerRef]);

  const handleClick = () => {
    if (!containerRef.current) return;
    if (direction === "up") {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "none",
        fontSize: 24,
        cursor: "pointer",
        display: visible ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 4px 16px ${direction === "up" ? "#6c757d55" : "#0d6efd55"}`,
        background: direction === "up"
          ? darkMode
            ? "#6c757d"
            : "#6c757d"
          : darkMode
            ? "#0d6efd"
            : "#0d6efd",
        color: "#fff",
        transition: "opacity 0.3s",
        zIndex: 2000,
        opacity: visible ? 1 : 0,
      }}
      title={direction === "up" ? "النزول لآخر رسالة" : "الصعود لأول رسالة"}
    >
      {direction === "up" ? "⬇" : "⬆"}
    </button>
  );
};

const AdminChat = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const chatIndex = Number(params.get('index')) || 1;
  const section = params.get('section') || (chatId && chatId.includes('_') ? chatId.split('_').pop() : '');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const prevLastMessageIdRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // زر التمرير الذكي
  const [showShadow, setShowShadow] = useState(false);

  const authInstance = getAuth();
  const currentAdminEmail = authInstance.currentUser?.email || "admin";
  const currentAdminName = "Admin Name";
  const { darkMode } = useTheme();

  // مراقبة الرسائل وتفعيل صوت الإشعار
  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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

      // إظهار الظل عند وصول رسالة جديدة
      setShowShadow(true);
      setTimeout(() => setShowShadow(false), 1500);
    });

    return () => unsubscribe();
  }, [chatId]);

  // تغيير ألوان الخلفية حسب الوضع الليلي
  useEffect(() => {
    document.body.style.background = darkMode ? '#181a1b' : '#fff';
    document.body.style.color = darkMode ? '#fff' : '#222';
    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, [darkMode]);

  // حفظ بيانات فتح الشات
  useEffect(() => {
    if (chatId && section) {
      const chatOpenedKey = `opened_chat_${chatId}`;
      const lastMsgTime = messages.length > 0 && messages[messages.length - 1].timestamp?.toDate
        ? messages[messages.length - 1].timestamp.toDate().getTime()
        : Date.now();
      localStorage.setItem(chatOpenedKey, String(lastMsgTime));
      let opened = [];
      try {
        opened = JSON.parse(localStorage.getItem(`openedChats_${section}`) || '[]');
      } catch {}
      if (!opened.includes(chatId)) {
        opened.push(chatId);
        localStorage.setItem(`openedChats_${section}`, JSON.stringify(opened));
      }
    }
  }, [chatId, section, messages]);

  const firstMsgTime = messages.length > 0 && messages[0].timestamp?.toDate
    ? messages[0].timestamp.toDate()
    : null;
  const lastMsgTime = messages.length > 0 && messages[messages.length - 1].timestamp?.toDate
    ? messages[messages.length - 1].timestamp.toDate()
    : null;

  // عند فتح الشات أو وصول رسالة جديدة: مرر للأسفل تلقائياً
  useEffect(() => {
    if (messagesBoxRef.current) {
      messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
      setShowShadow(true);
      setTimeout(() => setShowShadow(false), 1500);
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    if (!chatId) {
      alert("حدث خطأ: chatId غير معرف");
      return;
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');

    if (selectedFile) {
      try {
        setUploadProgress(0);
        const { url, type } = await uploadToCloudinary(
          chatId,
          selectedFile,
          (percent) => {
            let progress = percent;
            if (typeof progress === 'string') progress = parseFloat(progress);
            if (progress > 0 && progress <= 1) {
              setUploadProgress(Math.round(progress * 100));
            } else if (progress > 1 && progress <= 100) {
              setUploadProgress(Math.round(progress));
            } else if (progress === 0) {
              setUploadProgress(0);
            } else if (progress > 100) {
              setUploadProgress(100);
            }
          }
        );
        await addDoc(messagesRef, {
          url,
          type,
          sender: 'admin',
          adminName: currentAdminName,
          adminEmail: currentAdminEmail,
          timestamp: serverTimestamp(),
        });
        await updateLastMsgAt(chatId);
        setSelectedFile(null);
        setNewMessage('');
        setUploadProgress(null);
        if (uploadPreview?.url) {
          URL.revokeObjectURL(uploadPreview.url);
        }
        setUploadPreview(null);
        return;
      } catch (error) {
        setUploadProgress(null);
        if (uploadPreview?.url) {
          URL.revokeObjectURL(uploadPreview.url);
        }
        setUploadPreview(null);
        setSelectedFile(null);
        setNewMessage('');
        console.error('File upload failed:', error);
        return;
      }
    }

    await addDoc(messagesRef, {
      text: newMessage,
      sender: 'admin',
      adminName: currentAdminName,
      adminEmail: currentAdminEmail,
      timestamp: serverTimestamp(),
    });
    await updateLastMsgAt(chatId);
    setNewMessage('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (uploadPreview?.url) {
        URL.revokeObjectURL(uploadPreview.url);
      }
      if (file.type.startsWith('image/')) {
        setUploadPreview({ type: 'image', url: URL.createObjectURL(file) });
      } else if (file.type.startsWith('video/')) {
        const videoUrl = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = videoUrl;
        video.currentTime = 1;
        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          setUploadPreview({ type: 'video', url: canvas.toDataURL('image/png') });
        };
      } else {
        setUploadPreview(null);
      }
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    const chunks = [];
    mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
      setRecording(false);
    };
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current && mediaRecorderRef.current.stop();
  };

  const sendAudio = async () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
    const { url, type } = await uploadToCloudinary(chatId, file);
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      url,
      type,
      sender: 'admin',
      adminName: currentAdminName,
      adminEmail: currentAdminEmail,
      timestamp: serverTimestamp(),
    });
    setAudioBlob(null);
  };

  const handleBlockChat = async () => {
    await addDoc(collection(db, 'blockedChats'), {
      chatId,
      blockedAt: new Date(),
    });
    alert('تم حظر المحادثة بنجاح');
  };

  const renderMessage = (msg) => {
    if (
      (msg.image && msg.image.url) ||
      (msg.type && msg.type.startsWith('image') && msg.url) ||
      (msg.mediaType && msg.mediaType.startsWith('image') && msg.mediaUrl)
    ) {
      const imgUrl = msg.image?.url || msg.url || msg.mediaUrl;
      return (
        <img
          src={imgUrl}
          alt="uploaded"
          style={{ maxWidth: 300, borderRadius: 8 }}
        />
      );
    }
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
    if (
      (msg.video && msg.video.url) ||
      (msg.type && msg.type.startsWith('video') && msg.url) ||
      (msg.mediaType && msg.mediaType.startsWith('video') && msg.mediaUrl)
    ) {
      const videoUrl = msg.video?.url || msg.url || msg.mediaUrl;
      const videoType = msg.video?.type || msg.type || msg.mediaType || "video/mp4";
      return (
        <video controls style={{ maxWidth: 300, borderRadius: 8 }}>
          <source src={videoUrl} type={videoType} />
          المتصفح لا يدعم تشغيل الفيديو.
        </video>
      );
    }
    if (
      (msg.audio && msg.audio.url) ||
      (msg.type && msg.type.startsWith('audio') && msg.url) ||
      (msg.mediaType && msg.mediaType.startsWith('audio') && msg.mediaUrl)
    ) {
      const audioUrl = msg.audio?.url || msg.url || msg.mediaUrl;
      const audioType = msg.audio?.type || msg.type || msg.mediaType || "audio/mp3";
      return (
        <audio controls style={{ maxWidth: 300 }}>
          <source src={audioUrl} type={audioType} />
          المتصفح لا يدعم تشغيل الصوت.
        </audio>
      );
    }
    if (msg.text) {
      return <span>{msg.text}</span>;
    }
    return null;
  };

  return (
    <div
      className={`container py-4 ${darkMode ? 'bg-dark text-white' : ''}`}
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, #23272f 0%, #181a1b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e3e9f7 100%)',
        minHeight: '100vh',
        fontFamily: 'Cairo, Tahoma, Arial, sans-serif',
        color: darkMode ? '#e0e0e0' : '#222',
        transition: 'background 0.3s,color 0.3s'
      }}
    >
      <style>
        {`
          @media (max-width: 600px) {
            .adminchat-main-card {
              padding: 0.5rem !important;
              margin: 0 !important;
              border-radius: 0 !important;
            }
            .adminchat-messages {
              max-height: 300px !important;
              padding: 0.5rem !important;
            }
            .adminchat-form {
              padding: 0.5rem !important;
            }
          }
          .adminchat-messages, .adminchat-form {
            background: ${darkMode ? '#23272f' : 'rgba(255,255,255,0.95)'} !important;
            color: ${darkMode ? '#f5f5f5' : '#222'} !important;
          }
          .chat-shadow-effect {
            position: absolute;
            left: 0; right: 0; bottom: 0;
            height: 40px;
            pointer-events: none;
            background: linear-gradient(to top, #0003 60%, transparent 100%);
            opacity: 0.7;
            z-index: 10;
            border-radius: 0 0 16px 16px;
            transition: opacity 0.5s;
          }
        `}
      </style>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <button
          className="btn btn-outline-secondary mb-3"
          onClick={() => navigate(-1)}
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            borderRadius: 8,
            boxShadow: '0 1px 4px #0001',
            background: darkMode ? '#23272f' : '#fff',
            color: darkMode ? '#fff' : '#222',
            border: darkMode ? '1px solid #444' : undefined,
          }}
        >
          ← رجوع
        </button>
        <button
          className="btn btn-danger mb-3"
          onClick={handleBlockChat}
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            borderRadius: 8,
            boxShadow: '0 1px 4px #0001',
          }}
        >
          حظر المحادثة
        </button>
      </div>
      <h3
        className="mb-3"
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          color: darkMode ? '#ffe082' : '#2d3a4b',
          letterSpacing: 1,
          marginBottom: 18,
        }}
      >
        الرسائل الخاصة بالشات
      </h3>

      <div
        style={{
          marginBottom: 10,
          marginTop: 8,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <div style={{ textAlign: 'center', direction: 'rtl' }}>
          <span style={{
            display: 'block',
            fontSize: 13,
            color: '#fff',
            background: '#28a745',
            borderRadius: 6,
            padding: '2px 8px',
            marginBottom: 4
          }}>
            بداية المحادثة
          </span>
          <span style={{
            fontWeight: 700,
            color: '#222',
            background: '#ffe082',
            borderRadius: 6,
            padding: '2px 8px'
          }}>
            {firstMsgTime
              ? firstMsgTime.toLocaleString()
              : '--'}
          </span>
        </div>
        <div style={{ textAlign: 'center', direction: 'rtl' }}>
          <span style={{
            display: 'block',
            fontSize: 13,
            color: '#fff',
            background: '#28a745',
            borderRadius: 6,
            padding: '2px 8px',
            marginBottom: 4
          }}>
            نهاية المحادثة
          </span>
          <span style={{
            fontWeight: 700,
            color: '#222',
            background: '#ffe082',
            borderRadius: 6,
            padding: '2px 8px'
          }}>
            {lastMsgTime
              ? lastMsgTime.toLocaleString()
              : '--'}
          </span>
        </div>
      </div>

      <div
        style={{
          background: darkMode ? '#23272f' : '#e3f2fd',
          color: darkMode ? '#ffe082' : '#1976d2',
          borderRadius: 12,
          padding: '14px 24px',
          marginBottom: 10,
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.5fr 1.2fr',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: 16,
          boxShadow: '0 1px 6px #0001',
          justifyItems: 'center',
          gap: 0,
          direction: 'ltr'
        }}
      >
        <div style={{ textAlign: 'center', direction: 'rtl' }}>
          <span style={{
            display: 'inline-block',
            fontSize: 13,
            color: '#fff',
            background: '#28a745',
            borderRadius: 6,
            padding: '2px 8px',
            marginBottom: 4
          }}>
            رقم الشات
          </span>
          <div style={{ fontWeight: 700 }}>{chatIndex}</div>
        </div>
        <div style={{ textAlign: 'center', direction: 'ltr', wordBreak: 'break-all' }}>
          <span
            className="badge mb-1"
            style={{
              fontSize: 13,
              borderRadius: 6,
              padding: '4px 12px',
              letterSpacing: 1,
              display: 'inline-block',
              marginBottom: 4,
              background: '#198754',
              color: '#fff'
            }}
          >
            ID
          </span>
          <div style={{ fontWeight: 700 }}>{chatId}</div>
        </div>
        <div style={{ textAlign: 'center', direction: 'rtl' }}>
          <span style={{
            display: 'inline-block',
            fontSize: 13,
            color: '#fff',
            background: '#28a745',
            borderRadius: 6,
            padding: '2px 8px',
            marginBottom: 4
          }}>
            القسم
          </span>
          <div style={{ fontWeight: 700 }}>{section || 'غير محدد'}</div>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          className="border p-3 mb-3 adminchat-messages"
          style={{
            maxHeight: 450,
            overflowY: 'auto',
            background: darkMode ? '#23272f' : 'rgba(255,255,255,0.95)',
            borderRadius: 16,
            boxShadow: '0 2px 12px #0001',
            border: '1px solid #e3e8ee',
            marginBottom: 28,
            display: 'flex',
            flexDirection: 'column-reverse',
            position: 'relative'
          }}
          ref={messagesBoxRef}
        >
          {/* ظل احترافي أسفل الرسائل */}
          {showShadow && <div className="chat-shadow-effect"></div>}

          {[...messages].reverse().map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 d-flex ${msg.sender === 'admin' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                style={{
                  background: msg.sender === 'admin'
                    ? (darkMode
                        ? 'linear-gradient(135deg, #263238 60%, #37474f 100%)'
                        : 'linear-gradient(135deg, #e1ffc7 60%, #b2f7ef 100%)')
                    : (darkMode
                        ? 'linear-gradient(135deg, #23272f 60%, #181a1b 100%)'
                        : 'linear-gradient(135deg, #fff 60%, #f4f6fb 100%)'),
                  color: darkMode ? '#e0e0e0' : '#222',
                  borderRadius: 16,
                  boxShadow: '0 1px 6px #0001',
                  padding: '12px 18px',
                  maxWidth: 370,
                  wordBreak: 'break-word',
                  border: msg.sender === 'admin' ? '1px solid #b2f7ef' : '1px solid #e3e8ee',
                  margin: '4px 0',
                  transition: 'background 0.2s',
                  position: 'relative'
                }}
              >
                {msg.section && (
                  <div style={{
                    fontSize: 12,
                    color: '#ff9800',
                    fontWeight: 'bold',
                    marginBottom: 2,
                    marginTop: -8,
                    marginRight: -8,
                    marginLeft: -8,
                    textAlign: msg.sender === 'admin' ? 'right' : 'left'
                  }}>
                    قسم: {msg.section}
                  </div>
                )}
                {msg.sender === 'admin' && msg.adminEmail && (
                  <div style={{ fontSize: 12, color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
                    {msg.adminEmail}
                  </div>
                )}
                {renderMessage(msg)}
                <div style={{ fontSize: 11, color: '#888', marginTop: 4, textAlign: 'right' }}>
                  {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : ''}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
          {/* زر التمرير الذكي الجديد داخل صندوق الرسائل */}
          <ScrollButton containerRef={messagesBoxRef} bottomRef={messagesEndRef} darkMode={darkMode} />
        </div>
      </div>

      <form
        onSubmit={handleSend}
        className="d-flex flex-column align-items-start w-100 adminchat-form"
        style={{
          background: darkMode ? '#23272f' : 'rgba(255,255,255,0.98)',
          borderRadius: 14,
          boxShadow: '0 1px 8px #0001',
          padding: '18px 16px',
          marginBottom: 24,
        }}
      >
        {(uploadPreview || selectedFile) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '12px 0'
          }}>
            {uploadPreview && (
              <div style={{ position: 'relative', width: 70, height: 70 }}>
                <img
                  src={uploadPreview.url}
                  alt="preview"
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 12,
                    objectFit: 'cover',
                    boxShadow: '0 2px 8px #0001'
                  }}
                />
                {uploadProgress !== null && (
                  <>
                    <svg
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 70,
                        height: 70,
                        pointerEvents: 'none'
                      }}
                    >
                      <circle
                        cx="35"
                        cy="35"
                        r="32"
                        stroke="#0d6efd"
                        strokeWidth="5"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 32}
                        strokeDashoffset={2 * Math.PI * 32 * (1 - uploadProgress / 100)}
                        style={{ transition: 'stroke-dashoffset 0.3s' }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, width: 70, height: 70,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', color: '#0d6efd', fontSize: 18
                    }}>
                      {uploadProgress}%
                    </div>
                  </>
                )}
              </div>
            )}
            <span style={{ color: '#888', fontSize: 15 }}>
              {uploadPreview
                ? (uploadProgress === null
                    ? (uploadPreview.type === 'image' ? 'صورة محددة' : 'فيديو محدد')
                    : (uploadPreview.type === 'image' ? 'جاري إرسال الصورة' : 'جاري إرسال الفيديو'))
                : ''}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              style={{ fontWeight: 'bold', marginRight: 8 }}
              onClick={() => {
                if (uploadPreview?.url) {
                  URL.revokeObjectURL(uploadPreview.url);
                }
                setSelectedFile(null);
                setUploadPreview(null);
                setUploadProgress(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              title="إلغاء"
            >
              إلغاء
            </button>
          </div>
        )}
        <div className="d-flex align-items-center w-100" style={{ position: 'relative', gap: 8 }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <button
            type="button"
            className="btn btn-outline-primary me-2"
            style={{ borderRadius: 8, fontWeight: 'bold' }}
            onClick={() => fileInputRef.current.click()}
          >
            📎 ملف
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary me-2"
            style={{ borderRadius: 8, fontWeight: 'bold' }}
            onClick={() => setShowEmoji((v) => !v)}
          >
            😊
          </button>
          {showEmoji && (
            <div style={{ position: 'absolute', bottom: 50, left: 0, zIndex: 10 }}>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setNewMessage((m) => m + emojiData.emoji);
                  setShowEmoji(false);
                }}
                theme={darkMode ? 'dark' : 'light'}
              />
            </div>
          )}
          {!recording ? (
            <button
              type="button"
              className="btn btn-outline-danger me-2"
              style={{ borderRadius: 8, fontWeight: 'bold' }}
              onClick={startRecording}
            >
              🎤
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-danger me-2"
              style={{ borderRadius: 8, fontWeight: 'bold' }}
              onClick={stopRecording}
            >
              ⏹️
            </button>
          )}
          <input
            type="text"
            className="form-control me-2"
            style={{
              borderRadius: 8,
              border: '1px solid #e3e8ee',
              boxShadow: '0 1px 4px #0001',
              fontSize: 16,
              padding: '8px 12px',
              background: darkMode ? '#181a1b' : '#f8fafc',
              color: darkMode ? '#fff' : '#222',
              transition: 'border 0.2s, background 0.2s, color 0.2s',
            }}
            placeholder="اكتب رسالة..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-success"
            style={{
              borderRadius: 8,
              fontWeight: 'bold',
              padding: '8px 18px',
              fontSize: 16,
              boxShadow: '0 1px 4px #0001',
            }}
          >
            إرسال
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminChat;