import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useTheme } from '../context/ThemeContext'; // أضف هذا السطر

const ChatsTable = ({
  chats,
  lastOpened,
  role,
  rowClassName = () => '',
  openedChatIds = [],
  currentCategory, // أضف هذا البراميتر
  search = '' // أضف هذا البراميتر
}) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme(); // استخدم الثيم هنا

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('هل أنت متأكد من حذف جميع رسائل هذا الشات؟')) {
      // حذف جميع الرسائل داخل الشات
      const msgsSnap = await getDocs(collection(db, 'chats', chatId, 'messages'));
      for (const msg of msgsSnap.docs) {
        await deleteDoc(doc(db, 'chats', chatId, 'messages', msg.id));
      }
      // حذف وثيقة الشات نفسها (اختياري)
      await deleteDoc(doc(db, 'chats', chatId));
      alert('تم حذف الشات بالكامل');
      window.location.reload();
    }
  };

  const handleDeleteAllMessages = async (chatId) => {
    if (window.confirm('هل أنت متأكد من حذف جميع الرسائل في هذا الشات؟')) {
      const msgsSnap = await getDocs(collection(db, 'chats', chatId, 'messages'));
      for (const msg of msgsSnap.docs) {
        await deleteDoc(doc(db, 'chats', chatId, 'messages', msg.id));
      }
      alert('تم حذف جميع الرسائل في هذا الشات');
      window.location.reload();
    }
  };

  const handleDeleteAllChats = async () => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف جميع الشاتات وجميع الرسائل؟ هذا الإجراء لا يمكن التراجع عنه!')) return;
    for (const chat of chats) {
      // حذف جميع الرسائل داخل الشات
      const msgsSnap = await getDocs(collection(db, 'chats', chat.id, 'messages'));
      for (const msg of msgsSnap.docs) {
        await deleteDoc(doc(db, 'chats', chat.id, 'messages', msg.id));
      }
      // حذف وثيقة الشات نفسها
      await deleteDoc(doc(db, 'chats', chat.id));
    }
    alert('تم حذف جميع الشاتات والرسائل بنجاح');
    window.location.reload();
  };

  // فلترة حسب البحث (ID أو اسم أو تاريخ)
  let filteredChats = chats.filter(chat => {
    if (!search) return true;
    const id = (chat.id || '').toString();
    const user = (chat.userId || '').toString();
    const createdAt = chat.createdAt?.toDate
      ? chat.createdAt.toDate().toLocaleDateString('en-CA')
      : '';
    const createdAtTime = chat.createdAt?.toDate
      ? chat.createdAt.toDate().toLocaleString()
      : '';
    const searchLower = search.toLowerCase();
    return (
      id.includes(searchLower) ||
      user.toLowerCase().includes(searchLower) ||
      createdAt.includes(searchLower) ||
      createdAtTime.includes(searchLower)
    );
  });

  // ترتيب الشاتات: الأحدث أولاً
  filteredChats = filteredChats.slice().sort((a, b) => {
    const aTime = a.lastMsgAt?.toDate?.().getTime?.() || a.createdAt?.toDate?.().getTime?.() || 0;
    const bTime = b.lastMsgAt?.toDate?.().getTime?.() || b.createdAt?.toDate?.().getTime?.() || 0;
    return bTime - aTime;
  });

  return (
    <div>
      <style>
        {`
          @media (max-width: 600px) {
            .table {
              font-size: 13px !important;
              width: 100% !important;
            }
            .table th, .table td {
              padding: 6px 4px !important;
            }
          }
          .table-dark th, .table-dark td {
            color: #f5f5f5 !important;
            background-color: #23272f !important;
            border-color: #444 !important;
          }
        `}
      </style>
      {role === 'supervisor' && filteredChats.length > 0 && (
        <div style={{ marginBottom: 16, textAlign: 'left' }}>
          <button
            className="btn btn-danger"
            style={{
              fontWeight: 'bold',
              background: '#b71c1c',
              borderColor: '#b71c1c',
              fontSize: 16,
              padding: '8px 24px',
              borderRadius: 8,
              boxShadow: '0 2px 8px #b71c1c22'
            }}
            onClick={handleDeleteAllChats}
          >
            حذف جميع الشاتات والرسائل
          </button>
        </div>
      )}
      <div className="table-responsive">
        <table className={`table table-bordered text-center${darkMode ? ' table-dark' : ''}`}>
          <thead>
            <tr>
              <th>#</th>
              <th>Chat ID</th>
              <th>القسم</th>
              <th>المستخدم</th>
              <th>وقت الإنشاء</th>
              <th>جديد</th>
              <th>الأقسام</th>
              <th>عرض الرسائل</th>
            </tr>
          </thead>
          <tbody>
            {filteredChats.map((chat, idx) => {
              const chatOpenedKey = `opened_chat_${chat.id}`;
              const openedAt = Number(localStorage.getItem(chatOpenedKey) || 0);
              const lastMsgTime = chat.lastMsgAt?.toDate ? chat.lastMsgAt.toDate().getTime() : 0;
              const lastMsgSender = chat.lastMsgSender || '';
              // الشات غير مقروء إذا آخر رسالة من العميل ووقتها أحدث من آخر فتح
              const isNew = lastMsgSender === 'client' && lastMsgTime > openedAt;

              // لون الصف مباشرة عبر style إذا كان غير مقروء
              const rowStyle = isNew
                ? { backgroundColor: '#fff700', borderLeft: '6px solid #ff9800' }
                : {};

              return (
                <tr key={chat.id} className={isNew ? '' : ''} style={rowStyle}>
                  <td>
                    {filteredChats.length - idx}
                    {isNew && (
                      <span
                        title="رسائل جديدة من المستخدم لم تُفتح"
                        style={{
                          display: 'inline-block',
                          width: 18,
                          height: 18,
                          background: '#43a047',
                          borderRadius: '50%',
                          verticalAlign: 'middle',
                          border: '2px solid #fff',
                          boxShadow: '0 0 4px #43a047',
                          marginRight: 4,
                          marginLeft: 4
                        }}
                      ></span>
                    )}
                  </td>
                  <td>{chat.id}</td>
                  <td>{chat.category || 'غير محدد'}</td>
                  <td>{chat.userId || 'غير محدد'}</td>
                  <td>
                    {chat.createdAt?.toDate
                      ? chat.createdAt.toDate().toLocaleString()
                      : '---'}
                  </td>
                  <td>
                    {isNew && (
                      <>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 18,
                            height: 18,
                            background: '#43a047',
                            borderRadius: '50%',
                            verticalAlign: 'middle',
                            border: '2px solid #fff',
                            boxShadow: '0 0 4px #43a047',
                            marginRight: 4,
                            marginLeft: 2
                          }}
                        ></span>
                        <span style={{ color: '#43a047', fontWeight: 'bold', fontSize: 15 }}>جديد</span>
                      </>
                    )}
                  </td>
                  <td>
                    {Array.isArray(chat.sections) && chat.sections.length > 1
                      ? chat.sections.join(', ') + ' ⭐'
                      : (Array.isArray(chat.sections) ? chat.sections[0] : '')}
                    {chat.lastMsgSection && (
                      <span style={{ color: '#1976d2', fontWeight: 'bold', marginRight: 6 }}>
                        ({chat.lastMsgSection})
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => {
                        // عند الضغط على عرض الرسائل، اعتبر الشات "مقروء"
                        if (lastMsgTime) {
                          localStorage.setItem(chatOpenedKey, String(lastMsgTime));
                          if (chat.category) {
                            localStorage.setItem(`lastOpened_${chat.category}`, String(Date.now()));
                            // تحديث مصفوفة الشاتات المفتوحة
                            let opened = [];
                            try {
                              opened = JSON.parse(localStorage.getItem(`openedChats_${chat.category}`) || '[]');
                            } catch {}
                            if (!opened.includes(chat.id)) {
                              opened.push(chat.id);
                              localStorage.setItem(`openedChats_${chat.category}`, JSON.stringify(opened));
                            }
                          }
                        }
                        // حفظ القسم الحالي قبل الانتقال
                        if (currentCategory) {
                          localStorage.setItem('lastSection', currentCategory);
                        }
                        navigate(`/admin/chat/${chat.id}?index=${idx + 1}&section=${chat.category || ''}`);
                      }}
                    >
                      عرض الرسائل
                    </button>
                    {role === 'supervisor' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteChat(chat.id)}
                      >
                        حذف الشات
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredChats.length === 0 && (
              <tr>
                <td colSpan={8}>لا توجد شاتات حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChatsTable;
