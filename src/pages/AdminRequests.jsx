// src/pages/AdminRequests.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase'; // تحديث المسار
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const categories = [
  { label: 'برمجة', value: 'programming' },
  { label: 'تصميم واجهات', value: 'uiux' },
  { label: 'جرافيك', value: 'graphic' },
  { label: 'فيديو', value: 'video' },
  { label: 'تصميم هندسي', value: 'engineering' },
];

const AdminRequests = () => {
  const [selectedCategory, setSelectedCategory] = useState('programming');
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      const q = query(collection(db, `requests-${selectedCategory}`), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(data);
    };

    fetchRequests();
  }, [selectedCategory]);

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">طلبات الخدمات</h2>

      <div className="mb-4 text-center">
        <select
          className="form-select w-auto mx-auto"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>تفاصيل الطلب</th>
              <th>Chat ID</th>
              <th>وقت الإرسال</th>
              <th>الرسائل</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <tr key={req.id}>
                <td>{index + 1}</td>
                <td style={{ whiteSpace: 'pre-wrap' }}>
                  {req.details}
                  {req.file && (
                    req.fileType.startsWith('image') ? (
                      <img src={req.file} alt="request file" style={{ maxWidth: '100px', marginLeft: '10px' }} />
                    ) : req.fileType.startsWith('video') ? (
                      <video controls src={req.file} style={{ maxWidth: '100px', marginLeft: '10px' }}></video>
                    ) : (
                      <a href={req.file} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px' }}>
                        Download File
                      </a>
                    )
                  )}
                </td>
                <td style={{ wordBreak: 'break-all' }}>{req.chatId}</td>
                <td>
                  {req.timestamp?.toDate
                    ? req.timestamp.toDate().toLocaleString()
                    : 'غير متوفر'}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/admin/chat/${req.chatId}`)}
                  >
                    عرض الرسائل
                  </button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="5">لا توجد طلبات حالياً لهذا التخصص</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRequests;
