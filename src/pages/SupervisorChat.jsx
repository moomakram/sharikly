import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // تأكد من استيراد db بشكل صحيح

const handleDeleteMessage = async (msgId) => {
  if (window.confirm('هل أنت متأكد من حذف الرسالة؟')) {
    // حذف من رسائل الشات العادية
    await deleteDoc(doc(db, 'chats', chatId, 'messages', msgId));
    // حذف من بلاغات الدعم إذا كانت الرسالة بلاغ دعم
    await deleteDoc(doc(db, 'support_chats', msgId));
  }
};

{messages.map((msg) => (
  <div key={msg.id} className={`mb-2 d-flex ${msg.sender === 'admin' ? 'justify-content-end' : 'justify-content-start'}`}>
    <div
      style={{
        // ...existing style...
      }}
    >
      {msg.sender === 'admin' && msg.adminName && (
        <div style={{ fontSize: 12, color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
          {msg.adminName}
        </div>
      )}
      {renderMessage(msg)}
      <div style={{ fontSize: 11, color: '#888', marginTop: 4, textAlign: 'right' }}>
        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : ''}
        {role === 'supervisor' && (
          <button
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={() => handleDeleteMessage(msg.id)}
            style={{ marginRight: 8 }}
          >
            حذف
          </button>
        )}
      </div>
    </div>
  </div>
))}
