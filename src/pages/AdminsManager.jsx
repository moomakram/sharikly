import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

const AdminsManager = () => {
  const [tab, setTab] = useState('online');
  const [blocked, setBlocked] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const [onlineSupervisors, setOnlineSupervisors] = useState([]);

  useEffect(() => {
    fetchBlocked();
    fetchOnline();
  }, []);

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

  return (
    <div className="container py-4">
      <div className="mb-3">
        <button className={`btn btn-sm me-2 ${tab === 'online' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('online')}>الأونلاين</button>
        <button className={`btn btn-sm ${tab === 'blocked' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('blocked')}>المحظورين</button>
      </div>

      {tab === 'online' && (
        <>
          <h3>الأشخاص الأونلاين</h3>
          <div className="mb-2">المستخدمون: {onlineUsers.length}</div>
          <div className="mb-2">الأدمنات: {onlineAdmins.length}</div>
          <div className="mb-2">المشرفون: {onlineSupervisors.length}</div>
        </>
      )}

      {tab === 'blocked' && (
        <>
          <h3>المحادثات المحظورة</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Chat ID</th>
                <th>تاريخ الحظر</th>
              </tr>
            </thead>
            <tbody>
              {blocked.map(b => (
                <tr key={b.id}>
                  <td>{b.chatId}</td>
                  <td>{b.blockedAt?.toDate ? b.blockedAt.toDate().toLocaleString() : b.blockedAt?.toString?.() || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AdminsManager;
