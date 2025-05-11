import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


const AdminDashboard = () => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      const q = query(collection(db, 'chats'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
    };

    fetchChats();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">لوحة تحكم المشرف - الشاتات</h2>
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Chat ID</th>
              <th>القسم</th>
              <th>وقت الإنشاء</th>
              <th>الرسائل</th>
            </tr>
          </thead>
          <tbody>
            {chats.map((chat, index) => (
              <tr key={chat.id}>
                <td>{index + 1}</td>
                <td style={{ wordBreak: 'break-all' }}>{chat.id}</td>
                <td>{chat.category}</td>
                <td>
                  {chat.createdAt?.toDate
                    ? chat.createdAt.toDate().toLocaleString()
                    : 'غير متوفر'}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/admin/chat/${chat.id}`)}
                  >
                    عرض الرسائل
                  </button>
                </td>
              </tr>
            ))}
            {chats.length === 0 && (
              <tr>
                <td colSpan="5">لا توجد شاتات حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
