import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, addDoc, getDoc, updateDoc } from 'firebase/firestore';
import ChatsTable from '../components/ChatsTable';
import { useTheme } from '../context/ThemeContext'; // أضف هذا السطر
import { useTranslation } from 'react-i18next'; // أضف هذا السطر

const SupervisorDashboard = () => {
  const { darkMode } = useTheme(); // استخدم الثيم هنا
  const { t } = useTranslation(); // أضف هذا السطر
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [chatsByCategory, setChatsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [blocked, setBlocked] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const [onlineSupervisors, setOnlineSupervisors] = useState([]);
  const [showOnline, setShowOnline] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = useState([]);
  const [replyChatId, setReplyChatId] = useState(null);
  const [replyMsg, setReplyMsg] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);
  const [search, setSearch] = useState(''); // بحث الجدول
  const [adminEmail, setAdminEmail] = useState('');
  const navigate = useNavigate();

  const categoryDisplayName = (cat) => {
    switch (cat) {
      case 'programming': return '💻 ' + t('programming_chat');
      case 'uiux': return '🎨 ' + t('uiux_design');
      case 'graphic': return '🖌️ ' + t('graphics');
      case 'video': return '🎥 ' + t('video_editing');
      case 'engineering': return '📐 ' + t('engineering_chat');
      case 'غير محدد': return '❓ ' + t('undefined_category', 'غير محدد');
      default: return cat;
    }
  };

  const fetchChats = async () => {
    const chatsRef = collection(db, 'chats');
    const snapshot = await getDocs(chatsRef);
    const chatsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const grouped = {};
    chatsData.forEach(chat => {
      const cat = chat.category || 'غير محدد';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(chat);
    });
    setChatsByCategory(grouped);

    if (!selectedCategory && Object.keys(grouped).length > 0) {
      setSelectedCategory(Object.keys(grouped)[0]);
    }
  };

  const fetchBlocked = async () => {
    const snapshot = await getDocs(collection(db, 'blockedChats'));
    setBlocked(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchOnline = async () => {
    const usersSnap = await getDocs(collection(db, 'users'));
    setOnlineUsers(usersSnap.docs.filter(d => d.data().online).map(d => d.data()));
    const adminsSnap = await getDocs(collection(db, 'admins'));
    setOnlineAdmins(adminsSnap.docs.filter(d => d.data().online).map(d => d.data()));
    const supSnap = await getDocs(collection(db, 'supervisors'));
    setOnlineSupervisors(supSnap.docs.filter(d => d.data().online).map(d => d.data()));
  };

  const fetchReports = async () => {
    const snapshot = await getDocs(collection(db, 'support_chats'));
    setReports(
      snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.timestamp?.toDate?.() || 0) - (a.timestamp?.toDate?.() || 0))
    );
  };

  useEffect(() => {
    const storedRole = localStorage.getItem('user-role');
    if (storedRole) setRole(storedRole);

    // اجبر React على إعادة تعيين القسم عند كل دخول للصفحة
    const lastSection = localStorage.getItem('lastSection');
    if (lastSection) setSelectedCategory(lastSection);
    else if (Object.keys(chatsByCategory).length > 0) setSelectedCategory(Object.keys(chatsByCategory)[0]);

    const fetchUsers = async () => {
      const adminsSnap = await getDocs(collection(db, 'admins'));
      const supervisorsSnap = await getDocs(collection(db, 'supervisors'));
      const admins = adminsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'admin' }));
      const supervisors = supervisorsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'supervisor' }));
      setUsers([...admins, ...supervisors]);
    };
    fetchUsers();
  }, [chatsByCategory]);

  useEffect(() => {
    fetchChats();
    fetchBlocked();
    fetchOnline();
  }, []);

  useEffect(() => {
    if (showReports) fetchReports();
  }, [showReports]);

  useEffect(() => {
    document.body.style.background = darkMode ? '#181a1b' : '#fff';
    document.body.style.color = darkMode ? '#e0e0e0' : '#222';
    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, [darkMode]);

  useEffect(() => {
    // معالجة الشاتات القديمة التي ليس لديها category
    const fixChatsWithoutCategory = async () => {
      const chatsRef = collection(db, 'chats');
      const snapshot = await getDocs(chatsRef);
      const updates = [];
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (!data.category) {
          // اختر القسم المناسب هنا أو اجعلها "programming" كمثال
          updates.push(
            updateDoc(doc(db, 'chats', docSnap.id), { category: 'programming' })
          );
        }
      });
      if (updates.length > 0) {
        await Promise.all(updates);
        // يمكنك إعادة تحميل الشاتات بعد التحديث
        fetchChats();
      }
    };
    fixChatsWithoutCategory();
    // eslint-disable-next-line
  }, [fetchChats]);

  useEffect(() => {
    // جلب البريد الإلكتروني للمشرف الحالي من localStorage أو auth
    const fetchSupervisorEmail = async () => {
      const email = localStorage.getItem('supervisor-email');
      if (email) {
        setAdminEmail(email);
      } else if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
      }
    };
    fetchSupervisorEmail();
  }, [chatsByCategory, navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('supervisor-auth');
    localStorage.removeItem('user-role');
    navigate('/supervisor-login');
  };

  const handleUnblock = async (blockId) => {
    await getDocs(collection(db, 'blockedChats'))
      .then(snapshot => {
        const docToDelete = snapshot.docs.find(doc => doc.id === blockId);
        if (docToDelete) {
          return deleteDoc(doc(db, 'blockedChats', blockId));
        }
      });
    setBlocked(blocked.filter(b => b.id !== blockId));
  };

  const getLastOpened = (category) => {
    return localStorage.getItem(`lastOpened_${category}`) || 0;
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    localStorage.setItem(`lastOpened_${cat}`, Date.now());
    localStorage.setItem('lastSection', cat);
  };

  const getOpenedChatIds = (category) => {
    try {
      return JSON.parse(localStorage.getItem(`openedChats_${category}`) || '[]');
    } catch {
      return [];
    }
  };

  // دالة لحساب عدد الشاتات غير المقروءة فعلياً (نفس منطق ChatsTable)
  const getUnopenedCount = (category) => {
    const chats = chatsByCategory[category] || [];
    let count = 0;
    for (const chat of chats) {
      const chatOpenedKey = `opened_chat_${chat.id}`;
      const openedAt = Number(localStorage.getItem(chatOpenedKey) || 0);
      const lastMsgTime = chat.lastMsgAt?.toDate ? chat.lastMsgAt.toDate().getTime() : 0;
      const lastMsgSender = chat.lastMsgSender || '';
      if (lastMsgSender === 'client' && lastMsgTime > openedAt) {
        count++;
      }
    }
    return count;
  };

  const totalUnopened = Object.keys(chatsByCategory).reduce(
    (sum, cat) => sum + getUnopenedCount(cat), 0
  );

  const handleReply = (chatId) => {
    setReplyChatId(chatId);
    setReplyMsg('');
    setReplySuccess(false);
  };

  const sendReply = async () => {
    if (!replyMsg.trim() || !replyChatId) return;
    try {
      const chatDocRef = doc(db, 'chats', replyChatId);
      const chatDocSnap = await getDoc(chatDocRef);
      if (!chatDocSnap.exists()) {
        alert('لا يوجد شات مرتبط بهذا البلاغ');
        return;
      }
      await addDoc(collection(db, 'chats', replyChatId, 'messages'), {
        text: replyMsg,
        sender: 'supervisor',
        timestamp: new Date(),
      });
      setReplySuccess(true);
      setReplyMsg('');
      setTimeout(() => setReplyChatId(null), 1200);
    } catch (e) {
      alert('حدث خطأ أثناء إرسال الرد');
    }
  };

  // احسب عدد الشاتات التي جميع رسائلها مقروءة
  const getFullyReadChatsCount = (category) => {
    const chats = chatsByCategory[category] || [];
    let count = 0;
    for (const chat of chats) {
      const opened = getOpenedChatIds(category);
      if (opened.includes(chat.id)) {
        count++;
      }
    }
    return count;
  };

  const ALL_CATEGORIES = [
    'programming',
    'uiux',
    'graphic',
    'video',
    'engineering',
    'غير محدد'
  ];

  const isMultiSection = (chat) => Array.isArray(chat.sections) && chat.sections.length > 1;

  return (
    <div className={`${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'} container-fluid py-3`} style={{
      position: 'relative',
      minHeight: '100vh',
      background: darkMode ? '#181a1b' : '#fff',
      color: darkMode ? '#e0e0e0' : '#222'
    }}>
      <style>
        {`
          @media (max-width: 600px) {
            .supervisor-table-responsive {
              padding: 0 !important;
            }
            .supervisor-table-responsive table {
              font-size: 14px !important;
            }
          }
          .table-dark th, .table-dark td {
            color: #f5f5f5 !important;
            background-color: #23272f !important;
            border-color: #444 !important;
          }
        `}
      </style>
      {/* شريط معلومات المشرف في الأعلى */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8
      }}>
        {adminEmail && (
          <div style={{
            background: '#e3f2fd',
            color: '#1976d2',
            borderRadius: 20,
            padding: '4px 18px',
            fontWeight: 600,
            fontSize: 15,
            boxShadow: '0 1px 4px #0001'
          }}>
            <i className="bi bi-person-circle" style={{ marginLeft: 6 }}></i>
            {adminEmail}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-danger" onClick={handleLogout}>
          تسجيل الخروج
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <button
          className={`btn btn-sm ${showOnline ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setShowOnline(v => !v)}
        >
          {showOnline ? 'إخفاء الأونلاين' : 'عرض الأونلاين'}
        </button>
        <button
          className={`btn btn-sm ${showBlocked ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setShowBlocked(v => !v)}
        >
          {showBlocked ? 'إخفاء المحظورين' : 'عرض المحظورين'}
        </button>
        <button
          className={`btn btn-sm ${showReports ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setShowReports(v => !v)}
        >
          {showReports ? 'إخفاء البلاغات' : 'عرض البلاغات'}
          {reports.length > 0 && !showReports && (
            <span className="badge bg-danger ms-2">{reports.length}</span>
          )}
        </button>
      </div>

      {showOnline && (
        <div style={{
          background: '#f5f5f5',
          borderRadius: 12,
          padding: 20,
          minWidth: 220,
          boxShadow: '0 1px 6px #0001',
          marginBottom: 24
        }}>
          <h5 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 12 }}>الأشخاص الأونلاين</h5>
          <div style={{ fontSize: 16, marginBottom: 4 }}>المستخدمون: <span style={{ fontWeight: 'bold', color: '#43a047' }}>{onlineUsers.length}</span></div>
          <div style={{ fontSize: 16, marginBottom: 4 }}>الأدمنات: <span style={{ fontWeight: 'bold', color: '#007bff' }}>{onlineAdmins.length}</span></div>
          <div style={{ fontSize: 16 }}>المشرفون: <span style={{ fontWeight: 'bold', color: '#ff9800' }}>{onlineSupervisors.length}</span></div>
        </div>
      )}

      {showBlocked && (
        <div style={{
          background: '#f5f5f5',
          borderRadius: 12,
          padding: 20,
          minWidth: 320,
          boxShadow: '0 1px 6px #0001',
          marginBottom: 24
        }}>
          <h5 style={{ color: '#d32f2f', fontWeight: 700, marginBottom: 12 }}>المحادثات المحظورة</h5>
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>Chat ID</th>
                <th>تاريخ الحظر</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {blocked.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ color: '#888' }}>لا توجد محادثات محظورة</td>
                </tr>
              )}
              {blocked.map(b => (
                <tr key={b.id}>
                  <td>{b.chatId}</td>
                  <td>{b.blockedAt?.toDate ? b.blockedAt.toDate().toLocaleString() : b.blockedAt?.toString?.() || ''}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleUnblock(b.id)}
                    >
                      إلغاء الحظر
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showReports && (
        <div
          style={{
            background: '#fffbe7',
            borderRadius: 12,
            padding: 20,
            minWidth: 320,
            boxShadow: '0 1px 6px #0001',
            marginBottom: 24,
            maxHeight: 350,
            overflowY: 'auto'
          }}
        >
          <h5 style={{ color: '#b85c00', fontWeight: 700, marginBottom: 12 }}>
            رسائل البلاغات ({reports.length})
          </h5>
          {reports.length === 0 && (
            <div style={{ color: '#888' }}>لا توجد بلاغات حالياً</div>
          )}
          {reports.map(r => (
            <div
              key={r.id}
              style={{
                background: '#fff8e1',
                border: '1px solid #ffe0b2',
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
                boxShadow: '0 1px 4px #0001'
              }}
            >
              <div style={{ fontWeight: 500, color: '#d84315', marginBottom: 6 }}>
                {r.message}
              </div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 2 }}>
                {r.chatId && (
                  <span>
                    <b>Chat ID:</b> <span style={{ direction: 'ltr' }}>{r.chatId}</span>
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {r.timestamp?.toDate?.() ? r.timestamp.toDate().toLocaleString() : ''}
              </div>
              <button
                className="btn btn-sm btn-primary mt-2"
                onClick={() => handleReply(r.chatId)}
              >
                رد على البلاغ
              </button>
            </div>
          ))}
          {replyChatId && (
            <div style={{
              background: '#fff',
              border: '1px solid #b85c00',
              borderRadius: 8,
              padding: 16,
              marginTop: 12
            }}>
              <h6 style={{ color: '#b85c00', marginBottom: 8 }}>رد على البلاغ (Chat ID: {replyChatId})</h6>
              <textarea
                className="form-control mb-2"
                rows={3}
                value={replyMsg}
                onChange={e => setReplyMsg(e.target.value)}
                placeholder="اكتب الرد هنا..."
              />
              {replySuccess && <div className="alert alert-success py-1">تم إرسال الرد بنجاح</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-success btn-sm" onClick={sendReply} disabled={!replyMsg.trim()}>
                  إرسال الرد
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setReplyChatId(null)}>
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <h4>كل المستخدمين:</h4>
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th>البريد الإلكتروني</th>
              <th>الدور</th>
              <th>النوع</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              let isOnline = false;
              if (user.type === 'admin') {
                isOnline = onlineAdmins.some(a => a.email === user.email);
              } else if (user.type === 'supervisor') {
                isOnline = onlineSupervisors.some(s => s.email === user.email);
              }
              return (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.type}</td>
                  <td>
                    <span
                      title={isOnline ? "أونلاين" : "أوفلاين"}
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: isOnline ? '#43a047' : '#bbb',
                        border: '2px solid #fff',
                        boxShadow: isOnline ? '0 0 2px #43a047' : '0 0 2px #bbb',
                        margin: '0 2px'
                      }}
                    ></span>
                  </td>
                  <td>
                    {(role === 'primaryAdmin' || (role === 'moderator' && user.role !== 'primaryAdmin')) && (
                      <button className="btn btn-danger btn-sm">حذف</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(role === 'primaryAdmin' || role === 'moderator') && (
        <button className="btn btn-primary mt-3">إضافة مشرف/أدمن جديد</button>
      )}

      <h2 className="text-center mb-4">لوحة تحكم الشاتات الخاصة بالمشرف</h2>
      <div className="mb-3 d-flex align-items-center" style={{ gap: 16 }}>
        <label>اختر القسم:</label>
        <select
          className="form-select w-auto d-inline-block ms-2"
          value={selectedCategory}
          onChange={e => handleCategoryChange(e.target.value)}
        >
          {[...new Set([...ALL_CATEGORIES, ...Object.keys(chatsByCategory)])]
            .map(cat => {
              const unopenedCount = getUnopenedCount(cat);
              return (
                <option key={cat} value={cat}>
                  {categoryDisplayName(cat)}
                  {unopenedCount > 0 && ' 🟢'}
                  {unopenedCount > 0 && ` (${unopenedCount} جديد)`}
                </option>
              );
            })}
        </select>
        {totalUnopened > 0 && (
          <button
            type="button"
            className="bell-btn ms-3"
            title="رسائل جديدة"
            style={{ marginRight: 8 }}
          >
            <i className="bi bi-bell-fill"></i>
            <span className="bell-badge">{totalUnopened}</span>
          </button>
        )}
      </div>

      {selectedCategory && (
        <div style={{
          background: darkMode ? '#23272f' : '#e3f2fd',
          borderRadius: 8,
          padding: '10px 18px',
          marginBottom: 12,
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          fontWeight: 500,
          fontSize: 16
        }}>
          <span>إجمالي المحادثات: <b>{(chatsByCategory[selectedCategory] || []).length}</b></span>
          <span>تمت قراءتها: <b style={{ color: '#43a047' }}>
            {getFullyReadChatsCount(selectedCategory)}
          </b></span>
          <span>غير مقروءة: <b style={{ color: '#d32f2f' }}>
            {getUnopenedCount(selectedCategory)}
          </b></span>
          {getUnopenedCount(selectedCategory) > 0 && (
            <span style={{
              background: '#d32f2f',
              color: '#fff',
              borderRadius: 12,
              padding: '2px 10px',
              marginRight: 8,
              fontWeight: 700
            }}>
              لديك رسائل جديدة!
            </span>
          )}
        </div>
      )}

      {/* شريط البحث */}
      <div className="mb-3" style={{ maxWidth: 400 }}>
        <input
          type="text"
          className="form-control"
          placeholder="بحث بالاسم أو ID أو التاريخ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="supervisor-table-responsive table-responsive">
        <ChatsTable
          chats={
            (chatsByCategory[selectedCategory] || [])
              .slice()
              .sort((a, b) => {
                const aTime = a.lastMsgAt?.toDate?.().getTime?.() || 0;
                const bTime = b.lastMsgAt?.toDate?.().getTime?.() || 0;
                return bTime - aTime;
              })
          }
          lastOpened={getLastOpened(selectedCategory)}
          role="supervisor"
          rowClassName={chat => isMultiSection(chat) ? 'table-warning' : ''}
          openedChatIds={getOpenedChatIds(selectedCategory)}
          currentCategory={selectedCategory}
          search={search}
        />
      </div>
    </div>
  );
};

export default SupervisorDashboard;
