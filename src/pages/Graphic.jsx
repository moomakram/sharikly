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
  doc,
  getDoc,
  setDoc,
  getDocs,
  where,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';

// ScrollButton Component
const ScrollButton = ({ containerRef, bottomRef, darkMode, small, fullColor }) => {
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState("down");
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
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  let bgColor = "#0d6efd";
  let color = "#fff";
  if (fullColor) {
    if (direction === "up") {
      bgColor = "#6c757d";
      color = "#fff";
    } else {
      bgColor = "#0d6efd";
      color = "#fff";
    }
  }

  return (
    <button
      onClick={handleClick}
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        width: small ? 32 : 44,
        height: small ? 32 : 44,
        borderRadius: "50%",
        border: "none",
        fontSize: small ? 16 : 22,
        cursor: "pointer",
        display: visible ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        background: bgColor,
        color,
        transition: "opacity 0.3s, background 0.2s, color 0.2s",
        zIndex: 10,
        opacity: visible ? 1 : 0,
        boxShadow: "0 2px 8px #0002"
      }}
      title={direction === "up" ? "النزول لآخر رسالة" : "الصعود لأول رسالة"}
    >
      {direction === "up" ? (
        <svg width={small ? 18 : 24} height={small ? 18 : 24} viewBox="0 0 24 24" fill="none">
          <path d="M12 16l-6-6h12l-6 6z" fill="#0d6efd" />
        </svg>
      ) : (
        <svg width={small ? 18 : 24} height={small ? 18 : 24} viewBox="0 0 24 24" fill="none">
          <path d="M12 8l6 6H6l6-6z" fill="#6c757d" />
        </svg>
      )}
    </button>
  );
};

const getUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('userId', userId);
  }
  return userId;
};

const Graphic = () => {
  const { darkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatSelectedFile, setChatSelectedFile] = useState(null);
  const [orderSelectedFile, setOrderSelectedFile] = useState(null);
  const [details, setDetails] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const messagesEndRef = useRef(null);
  const chatFileInputRef = useRef(null);
  const orderFileInputRef = useRef(null);

  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [orderUploadProgress, setOrderUploadProgress] = useState(null);
  const [orderUploadPreview, setOrderUploadPreview] = useState(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const [showReport, setShowReport] = useState(false);
  const [reportMsg, setReportMsg] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const requestCardRef = useRef(null);
  const [chatCardHeight, setChatCardHeight] = useState(null);

  const [recording, setRecording] = useState(false);

  // زر التمرير
  const messagesBoxRef = useRef(null);

  useEffect(() => {
    if (requestCardRef.current) {
      setChatCardHeight(requestCardRef.current.offsetHeight);
    }
  }, [details, orderSelectedFile, formSuccess]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  useEffect(() => {
    // دعم مشاركة الشات عبر رابط chatId
    const params = new URLSearchParams(location.search);
    const urlChatId = params.get('chatId');
    if (urlChatId) {
      setChatId(urlChatId);
      if (sessionStorage.getItem('chatId-graphic') !== urlChatId) {
        sessionStorage.setItem('chatId-graphic', urlChatId);
      }
      if (localStorage.getItem('chatId-graphic') !== urlChatId) {
        localStorage.setItem('chatId-graphic', urlChatId);
      }
    } else {
      const userId = getUserId();
      async function findChat() {
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const chatDocId = snapshot.docs[0].id;
          setChatId(chatDocId);
          sessionStorage.setItem('chatId-graphic', chatDocId);
          localStorage.setItem('chatId-graphic', chatDocId);
          navigate(`?chatId=${chatDocId}`, { replace: true });
        }
      }
      findChat();
    }
  }, [location.search, navigate]);

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

  useEffect(() => {
    if (chatId) {
      (async () => {
        const chatDocRef = doc(db, 'chats', chatId);
        const chatDocSnap = await getDoc(chatDocRef);
        if (!chatDocSnap.exists() || !chatDocSnap.data().category) {
          await setDoc(chatDocRef, {
            category: 'graphic',
            createdAt: serverTimestamp(),
          }, { merge: true });
        }
      })();
    }
  }, [chatId]);

  // رد ذكي تلقائي بعد 3 ثواني (لكن لا يرد في أول شات بين العميل والموقع)
  useEffect(() => {
    if (!chatId || messages.length === 0) return;
    if (messages.length === 1) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === 'client') {
      const chatDocRef = doc(db, 'chats', chatId);
      getDoc(chatDocRef).then((docSnap) => {
        if (docSnap.exists() && docSnap.data().autoReplySent) {
          return;
        }
        setTimeout(async () => {
          let autoReply = "";
          switch (i18n.language) {
            case "en":
              autoReply = "Your message has been received and our team will contact you. Please follow the chat.";
              break;
            case "fr":
              autoReply = "Votre message a été reçu et notre équipe vous contactera. Veuillez suivre la discussion.";
              break;
            case "de":
              autoReply = "Ihre Nachricht wurde erhalten und unser Team wird Sie kontaktieren. Bitte verfolgen Sie den Chat.";
              break;
            case "es":
              autoReply = "Su mensaje ha sido recibido y nuestro equipo se pondrá en contacto con usted. Por favor, siga el chat.";
              break;
            case "it":
              autoReply = "Il tuo messaggio è stato ricevuto e il nostro team ti contatterà. Segui la chat.";
              break;
            case "tr":
              autoReply = "Mesajınız alındı ve ekibimiz sizinle iletişime geçecek. Sohbeti takip edin.";
              break;
            case "ru":
              autoReply = "Ваше сообщение получено, и наша команда свяжется с вами. Пожалуйста, следите за чатом.";
              break;
            case "zh":
              autoReply = "您的消息已收到，我们的团队会与您联系。请关注聊天。";
              break;
            case "ja":
              autoReply = "メッセージを受け取りました。担当チームよりご連絡いたします。チャットをご確認ください。";
              break;
            case "ko":
              autoReply = "메시지가 접수되었으며, 저희 팀이 연락드릴 예정입니다. 채팅을 확인해 주세요.";
              break;
            case "hi":
              autoReply = "आपका संदेश प्राप्त हो गया है और हमारी टीम आपसे संपर्क करेगी। कृपया चैट पर ध्यान दें।";
              break;
            case "ar":
              autoReply = "تم استلام رسالتك وسيتم التواصل معك من فريقنا. تابع الشات.";
              break;
            default:
              autoReply = "تم استلام رسالتك وسيتم التواصل معك من فريقنا. تابع الشات.";
          }
          await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text: autoReply,
            sender: 'bot',
            timestamp: serverTimestamp(),
          });
          await setDoc(chatDocRef, { autoReplySent: true }, { merge: true });
        }, 3000);
      });
    }
    // eslint-disable-next-line
  }, [messages, chatId, i18n.language]);

  // ----------- UI/UX: Preview & Progress for Chat File -----------
  const handleChatFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (uploadPreview?.url) {
        URL.revokeObjectURL(uploadPreview.url);
      }
      setChatSelectedFile(file);
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
      if (chatFileInputRef.current) {
        chatFileInputRef.current.value = '';
      }
    }
  };

  // ----------- UI/UX: Preview & Progress for Order File -----------
  const handleOrderFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (orderUploadPreview?.url) {
        URL.revokeObjectURL(orderUploadPreview.url);
      }
      setOrderSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setOrderUploadPreview({ type: 'image', url: URL.createObjectURL(file) });
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
          setOrderUploadPreview({ type: 'video', url: canvas.toDataURL('image/png') });
        };
      } else {
        setOrderUploadPreview(null);
      }
      setOrderUploadProgress(null);
      if (orderFileInputRef.current) {
        orderFileInputRef.current.value = '';
      }
    }
  };

  // إرسال رسالة الشات مع UI/UX احترافي
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !chatSelectedFile) return;

    let currentChatId = chatId;
    const userId = getUserId();

    if (!currentChatId) {
      const chatsRef = collection(db, 'chats');
      const docRef = await addDoc(chatsRef, {
        userId,
        category: 'graphic',
        sections: ['graphic'],
        createdAt: serverTimestamp(),
      });
      currentChatId = docRef.id;
      setChatId(currentChatId);
      sessionStorage.setItem('chatId-graphic', currentChatId);
      localStorage.setItem('chatId-graphic', currentChatId);
      navigate(`?chatId=${currentChatId}`, { replace: true });
    }

    const messagesRef = collection(db, 'chats', currentChatId, 'messages');
    let messageContent = newMessage;
    let mediaUrl = null;
    let mediaType = null;

    if (chatSelectedFile) {
      try {
        setUploadProgress(0);
        const { url, type } = await uploadFile(
          currentChatId,
          chatSelectedFile,
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
        mediaUrl = url;
        mediaType = type;
        if (!newMessage.trim()) messageContent = '';
      } catch (error) {
        setUploadProgress(null);
        if (uploadPreview?.url) {
          URL.revokeObjectURL(uploadPreview.url);
        }
        setUploadPreview(null);
        alert('File upload failed. Please check your connection or try again later.');
        return;
      }
      setUploadProgress(null);
      if (uploadPreview?.url) {
        URL.revokeObjectURL(uploadPreview.url);
      }
      setUploadPreview(null);
      setChatSelectedFile(null);
      if (chatFileInputRef.current) {
        chatFileInputRef.current.value = '';
      }
    }

    await addDoc(messagesRef, {
      text: messageContent,
      sender: 'client',
      timestamp: serverTimestamp(),
      mediaUrl,
      mediaType,
    });

    await setDoc(doc(db, 'chats', currentChatId), {
      lastMsgAt: serverTimestamp(),
      lastMsgSender: 'client',
      lastMsgSection: 'graphic',
    }, { merge: true });

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
    setChatSelectedFile(null);
  };

  // إرسال الطلب مع UI/UX احترافي
  const sendOrderDetails = async (e) => {
    e.preventDefault();
    if (!details.trim() && !orderSelectedFile) return;

    const requestsRef = collection(db, 'requests-graphic');
    let requestContent = details;

    if (orderSelectedFile) {
      try {
        setOrderUploadProgress(0);
        const { url, type } = await uploadFile(
          chatId,
          orderSelectedFile,
          (percent) => {
            let progress = percent;
            if (typeof progress === 'string') progress = parseFloat(progress);
            if (progress > 0 && progress <= 1) {
              setOrderUploadProgress(Math.round(progress * 100));
            } else if (progress > 1 && progress <= 100) {
              setOrderUploadProgress(Math.round(progress));
            } else if (progress === 0) {
              setOrderUploadProgress(0);
            } else if (progress > 100) {
              setOrderUploadProgress(100);
            }
          }
        );
        if (type.startsWith('image')) {
          requestContent += `<br/><img src="${url}" alt="uploaded image" style="max-width:100%; border-radius: 8px;"/>`;
          await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text: '',
            sender: 'client',
            timestamp: serverTimestamp(),
            mediaUrl: url,
            mediaType: type,
          });
        } else if (type.startsWith('video')) {
          requestContent += `<br/><video controls src="${url}" style="max-width:100%; border-radius: 8px;"></video>`;
          await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text: '',
            sender: 'client',
            timestamp: serverTimestamp(),
            mediaUrl: url,
            mediaType: type,
          });
        } else {
          requestContent += `<br/><a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">Download file</a>`;
          await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text: '',
            sender: 'client',
            timestamp: serverTimestamp(),
            mediaUrl: url,
            mediaType: type,
          });
        }
      } catch (error) {
        setOrderUploadProgress(null);
        if (orderUploadPreview?.url) {
          URL.revokeObjectURL(orderUploadPreview.url);
        }
        setOrderUploadPreview(null);
        return;
      }
      setOrderUploadProgress(null);
      if (orderUploadPreview?.url) {
        URL.revokeObjectURL(orderUploadPreview.url);
      }
      setOrderUploadPreview(null);
      setOrderSelectedFile(null);
      if (orderFileInputRef.current) {
        orderFileInputRef.current.value = '';
      }
    } else {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: `✍️ ${t('order_details')}: ${requestContent}`,
        sender: 'client',
        timestamp: serverTimestamp(),
      });
    }

    await addDoc(requestsRef, {
      chatId,
      details: requestContent,
      timestamp: serverTimestamp(),
    });

    setDetails('');
    setOrderSelectedFile(null);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  // دالة إرسال البلاغ
  const handleSendReport = async () => {
    if (!reportMsg.trim()) return;
    try {
      await addDoc(collection(db, 'support_chats'), {
        chatId,
        message: reportMsg,
        from: 'user',
        timestamp: serverTimestamp(),
      });
      setReportSent(true);
      setReportMsg('');
      setTimeout(() => setShowReport(false), 1500);
    } catch (error) {
      alert('حدث خطأ أثناء إرسال البلاغ');
    }
  };

  // دالة التسجيل الصوتي (لتجنب خطأ undefined)
  const handleVoiceRecord = () => {
    alert('تسجيل الصوت غير مفعل حالياً');
  };

  return (
    <div
      className={`${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: darkMode ? '#181a1b' : '#f5f7fa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container py-4" style={{ position: 'relative', zIndex: 1 }}>
        <h2
          className="text-center mb-4"
          style={{
            color: '#0d6efd',
            fontWeight: 'bold',
            letterSpacing: '1px',
          }}
        >
          🎨 {t('graphics')}
        </h2>
        <p
          className="text-center mb-5 fw-bold"
          style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.6rem)',
            lineHeight: 1.5,
            margin: 0,
            opacity: 1,
            transform: 'translateY(0)',
            animation: 'slideUpFadeIn 1s cubic-bezier(0.23, 1, 0.32, 1) forwards',
          }}
        >
          {t('graphics_description')}
        </p>
        <style>
          {`
            @keyframes slideUpFadeIn {
              from {
                opacity: 0;
                transform: translateY(40px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            body {
              background: ${darkMode ? '#181a1b' : '#fff'} !important;
              color: ${darkMode ? '#fff' : '#222'} !important;
              transition: background 0.3s, color 0.3s;
            }
            .video-flex-responsive {
              flex-direction: row;
              align-items: flex-start;
              justify-content: center;
            }
            .video-flex-responsive > .card {
              max-width: 97% !important;
              width: 97% !important;
              margin-bottom: 18px;
              margin-left: auto;
              margin-right: auto;
            }
            @media (min-width: 992px) {
              .video-flex-responsive {
                flex-direction: row !important;
                align-items: flex-start !important;
                justify-content: center !important;
              }
              .video-flex-responsive > .card {
                max-width: 47.5% !important;
                width: 47.5% !important;
                margin-bottom: 18px;
                margin-left: 1%;
                margin-right: 1%;
              }
            }
            @media (max-width: 991px) {
              .video-flex-responsive {
                flex-direction: column !important;
                align-items: center !important;
              }
              .video-flex-responsive > .card {
                max-width: 97% !important;
                width: 97% !important;
                margin-bottom: 18px;
                margin-left: auto;
                margin-right: auto;
              }
            }
          `}
        </style>
        {chatId && (
          <div className="alert alert-info mt-3" style={{ fontSize: 15, direction: 'ltr', position: 'relative', zIndex: 2 }}>
            <strong style={{ color: '#0d6efd' }}>
              {t('your_chat_link') || 'رابط الشات الخاص بك'}:
            </strong>
            <div style={{ wordBreak: 'break-all', margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <a
                href={`${window.location.origin}/graphic?chatId=${chatId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 'bold', color: '#0d6efd', textDecoration: 'underline' }}
              >
                {`${window.location.origin}/graphic?chatId=${chatId}`}
              </a>
              <button
                className="btn btn-sm btn-outline-secondary"
                style={{ marginLeft: 8, fontSize: 13 }}
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/graphic?chatId=${chatId}`);
                }}
                title={t('copy_link') || 'نسخ الرابط'}
              >
                {t('copy_link') || 'نسخ الرابط'}
              </button>
            </div>
            <div style={{ color: '#b85c00', fontWeight: 'bold', fontSize: 13, marginTop: 6 }}>
              {t('chat_link_notice') ||
                'يمكنك متابعة المحادثة من نفس المتصفح دائماً، وإذا أردت فتح الشات من أي جهاز أو متصفح آخر احفظ هذا الرابط جيداً وشاركه مع نفسك أو مع من تريد.'}
            </div>
          </div>
        )}
        <div className="d-flex flex-wrap justify-content-center gap-4 video-flex-responsive align-items-stretch">
          {/* Chat Section */}
          <div
            className="card shadow-sm flex-grow-1"
            style={{
              maxWidth: '97%',
              margin: '0 auto',
              height: chatCardHeight ? `${chatCardHeight}px` : 'auto'
            }}
          >
            <div className="card-header bg-primary text-white text-center d-flex justify-content-between align-items-center" style={{ position: 'relative' }}>
              <h5 className="mb-0">{t('chat_section')}</h5>
              <button
                className="btn btn-sm btn-warning"
                style={{ fontWeight: 'bold' }}
                onClick={() => setShowReport(true)}
                title={t('report_tooltip') || "يتم ارسال الابلاغ الي المشرف وسيتم الرد عليك مباشره في اقرب وقت"}
              >
                {t('report_problem') || "ابلاغ عن مشكله"} 🚩
              </button>
              {/* زر التمرير */}
              <div style={{
                position: "absolute",
                right: 18,
                bottom: -60,
                zIndex: 20
              }}>
                <ScrollButton
                  containerRef={messagesBoxRef}
                  bottomRef={messagesEndRef}
                  darkMode={darkMode}
                  small
                  fullColor
                />
              </div>
            </div>
            <div className="card-body d-flex flex-column" style={{ overflowY: 'auto', maxHeight: '300px', position: 'relative' }} ref={messagesBoxRef}>
              {messages.map((msg, idx) => {
                const mediaUrl = msg.mediaUrl || msg.url;
                const mediaType = msg.mediaType || msg.type;
                const isImage = mediaType?.startsWith("image/") || (!mediaType && /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl));
                const isVideo = mediaType?.startsWith("video/");
                const isAudio = mediaType?.startsWith("audio/");
                const isText = !!msg.text && !isImage && !isVideo && !isAudio;

                return (
                  <div
                    key={idx}
                    className={`py-2 px-3 my-1 d-flex flex-column ${
                      msg.sender === 'client' ? 'align-self-start' : 'align-self-end'
                    }`}
                    style={{
                      maxWidth: '80%',
                      borderRadius: 16,
                      backgroundColor: msg.sender === 'client' ? '#e3f2fd' : '#fffbe7',
                      color: '#222',
                      wordBreak: 'break-word',
                      border: '1px solid #e0e0e0',
                      whiteSpace: 'pre-wrap',
                      boxShadow: '0 1px 6px #0001',
                      alignItems: isImage || isVideo || isAudio ? 'center' : 'flex-start',
                    }}
                  >
                    {isText && (
                      <span style={{ fontSize: 16, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: msg.text }} />
                    )}
                    {isImage && (
                      <img
                        src={mediaUrl}
                        alt="صورة"
                        style={{
                          maxWidth: 180,
                          maxHeight: 180,
                          borderRadius: 12,
                          margin: '6px 0',
                          display: 'block',
                          objectFit: 'cover',
                          boxShadow: '0 2px 8px #0001'
                        }}
                      />
                    )}
                    {isVideo && (
                      <video
                        controls
                        src={mediaUrl}
                        style={{
                          width: 180,
                          maxWidth: '100%',
                          borderRadius: 12,
                          margin: '6px 0',
                          background: '#000',
                          boxShadow: '0 2px 8px #0001'
                        }}
                      />
                    )}
                    {isAudio && (
                      <audio
                        controls
                        src={mediaUrl}
                        style={{
                          width: 180,
                          minWidth: 120,
                          maxWidth: "100%",
                          margin: "6px 0",
                          display: "block",
                          background: "#f1f3f4",
                          borderRadius: 8,
                          outline: "none"
                        }}
                      />
                    )}
                    {!isImage && !isVideo && !isAudio && mediaUrl && !isText && (
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#0d6efd",
                          textDecoration: "underline",
                          display: "block",
                          margin: "6px 0",
                          fontSize: 15
                        }}
                      >
                        عرض الملف
                      </a>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: '#888' }}>
                        {msg.timestamp?.toDate
                          ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="card-footer" style={{ position: 'relative' }}>
              <div className="mb-2 d-flex align-items-center">
                <input
                  type="file"
                  ref={chatFileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*,audio/*"
                  onChange={handleChatFileSelect}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary me-2"
                  onClick={() => chatFileInputRef.current.click()}
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
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    title="إدراج إيموجي"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    😊
                  </button>
                  {showEmojiPicker && (
                    <div style={{
                      position: 'absolute',
                      zIndex: 1000,
                      bottom: 45,
                      left: 0,
                      direction: 'ltr'
                    }}>
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setNewMessage((prev) => prev + emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                        theme={darkMode ? 'dark' : 'light'}
                        locale={i18n.language}
                        searchDisabled={false}
                        width={320}
                        height={400}
                      />
                    </div>
                  )}
                </div>
                <textarea
                  className="form-control mx-2"
                  placeholder={t('write_message')}
                  value={newMessage}
                  onChange={e => {
                    setNewMessage(e.target.value);
                    setTimeout(() => {
                      const textarea = e.target;
                      textarea.scrollTop = textarea.scrollHeight;
                    }, 0);
                  }}
                  rows={1}
                  style={{
                    minHeight: 38,
                    maxHeight: 120,
                    resize: 'none',
                    overflowY: 'auto'
                  }}
                  ref={input => {
                    if (input) {
                      input.scrollTop = input.scrollHeight;
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button className="btn btn-primary" onClick={handleSend}>
                  {t('send')}
                </button>
              </div>
              {(uploadPreview || chatSelectedFile) && (
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
                          ? (uploadPreview.type === 'image' ? t('selected_image') : t('selected_video'))
                          : (uploadPreview.type === 'image' ? t('sending_image') : t('sending_video')))
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
                      setChatSelectedFile(null);
                      setUploadPreview(null);
                      setUploadProgress(null);
                      if (chatFileInputRef.current) {
                        chatFileInputRef.current.value = '';
                      }
                    }}
                    title={t('cancel_upload') || 'إلغاء'}
                  >
                    {t('cancel_upload') || 'إلغاء'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Request Form Section */}
          <div
            className="card shadow-sm flex-grow-1"
            style={{ maxWidth: '97%', margin: '0 auto' }}
            ref={requestCardRef}
          >
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
                    ref={orderFileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleOrderFileSelect}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={() => orderFileInputRef.current.click()}
                  >
                    📎ارفاق {t('attach_file')}
                  </button>
                  {(orderUploadPreview || orderSelectedFile) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      margin: '12px 0'
                    }}>
                      {orderUploadPreview && (
                        <div style={{ position: 'relative', width: 70, height: 70 }}>
                          <img
                            src={orderUploadPreview.url}
                            alt="preview"
                            style={{
                              width: 70,
                              height: 70,
                              borderRadius: 12,
                              objectFit: 'cover',
                              boxShadow: '0 2px 8px #0001'
                            }}
                          />
                          {orderUploadProgress !== null && (
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
                                  strokeDashoffset={2 * Math.PI * 32 * (1 - orderUploadProgress / 100)}
                                  style={{ transition: 'stroke-dashoffset 0.3s' }}
                                />
                              </svg>
                              <div style={{
                                position: 'absolute',
                                top: 0, left: 0, width: 70, height: 70,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', color: '#0d6efd', fontSize: 18
                              }}>
                                {orderUploadProgress}%
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      <span style={{ color: '#888', fontSize: 15 }}>
                        {orderUploadPreview
                          ? (orderUploadProgress === null
                              ? (orderUploadPreview.type === 'image' ? t('selected_image') : t('selected_video'))
                              : (orderUploadPreview.type === 'image' ? t('sending_image') : t('sending_video')))
                          : ''}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        style={{ fontWeight: 'bold', marginRight: 8 }}
                        onClick={() => {
                          if (orderUploadPreview?.url) {
                            URL.revokeObjectURL(orderUploadPreview.url);
                          }
                          setOrderSelectedFile(null);
                          setOrderUploadPreview(null);
                          setOrderUploadProgress(null);
                          if (orderFileInputRef.current) {
                            orderFileInputRef.current.value = '';
                          }
                        }}
                        title={t('cancel_upload') || 'إلغاء'}
                      >
                        {t('cancel_upload') || 'إلغاء'}
                      </button>
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

      {/* نافذة البلاغ */}
      <Modal show={showReport} onHide={() => setShowReport(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('report_problem') || "ابلاغ عن مشكله"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            className="form-control"
            rows={4}
            placeholder={t('write_problem') || "اكتب المشكلة التي تواجهك..."}
            value={reportMsg}
            onChange={e => setReportMsg(e.target.value)}
          />
          {reportSent && <div className="alert alert-success mt-2">{t('report_sent_success') || "تم إرسال البلاغ للمشرف بنجاح"}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReport(false)}>
            {t('close') || "إغلاق"}
          </Button>
          <Button variant="primary" onClick={handleSendReport} disabled={!reportMsg.trim()}>
            {t('send_report') || "إرسال البلاغ"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Graphic;
