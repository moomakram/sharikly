import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase'; // تحديث المسار
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import ChatsTable from '../components/ChatsTable'; // استيراد المكون المشترك

const AdminDashboard = () => {
  const [chats, setChats] = useState([]);

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

      {/* زر لعرض صفحة الطلبات */}
      <div className="text-center mb-4">
        <Link to="/admin/requests" className="btn btn-outline-primary">
          عرض الطلبات
        </Link>
      </div>

      <ChatsTable chats={chats} />
    </div>
  );
};

export default AdminDashboard;
