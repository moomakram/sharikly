// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const sections = [
  { name: "برمجة", key: "programming" },
  { name: "واجهات المستخدم", key: "uiux" },
  { name: "جرافيك", key: "graphic" },
  { name: "فيديو", key: "video" },
  { name: "هندسي", key: "engineering" },
];

const Admin = () => {
  const [activeSection, setActiveSection] = useState("programming");
  const [messages, setMessages] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const chatRef = collection(db, `chats-${activeSection}`);
    const requestRef = collection(db, `requests-${activeSection}`);

    const q1 = query(chatRef, orderBy("timestamp"));
    const q2 = query(requestRef, orderBy("timestamp"));

    const unsub1 = onSnapshot(q1, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setMessages(data);
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setRequests(data);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [activeSection]);

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center fw-bold">لوحة تحكم المشرف</h2>
      <div className="mb-4 d-flex justify-content-center gap-2 flex-wrap">
        {sections.map((section) => (
          <button
            key={section.key}
            className={`btn ${
              section.key === activeSection ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setActiveSection(section.key)}
          >
            {section.name}
          </button>
        ))}
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <h4 className="text-success">المحادثات ({messages.length})</h4>
          <ul className="list-group">
            {messages.map((msg, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{msg.text}</span>
                <small className="text-muted">ID: {msg.chatId}</small>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-6 mb-4">
          <h4 className="text-info">طلبات الخدمة ({requests.length})</h4>
          <ul className="list-group">
            {requests.map((req, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{req.details}</span>
                <small className="text-muted">ID: {req.chatId}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Admin;
