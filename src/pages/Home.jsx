import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';

import mainImage from '../images/acd0698c-8b14-4b99-8441-225002664d7f.jpg';

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [textColor, setTextColor] = useState('black'); // اللون الافتراضي
  const [showSentence, setShowSentence] = useState(true); // حالة للتحكم في ظهور الجملة
  const navigate = useNavigate();

  // تغيير لون النص كل 5 ثوانٍ
  useEffect(() => {
    const colors = ['red', 'blue', 'green', 'purple', 'orange'];
    let colorIndex = 0;

    const interval = setInterval(() => {
      setTextColor(colors[colorIndex]);
      colorIndex = (colorIndex + 1) % colors.length; // التكرار على الألوان
    }, 5000);

    return () => clearInterval(interval); // تنظيف عند إلغاء المكون
  }, []);

  // التحكم في ظهور واختفاء الجملة
  useEffect(() => {
    if (!showSentence) {
      const timeout = setTimeout(() => {
        setShowSentence(true); // إعادة إظهار الجملة بعد الاختفاء
      }, 1000); // مدة الاختفاء قبل إعادة العرض
      return () => clearTimeout(timeout); // تنظيف عند إلغاء المكون
    }
  }, [showSentence]);

  const services = [
    { name: 'البرمجة', path: '/programming', icon: '💻', image: require('../images/fe0429fc-4457-4213-aba7-7227532573f5.jpg') },
    { name: 'تصميم واجهات المستخدم', path: '/uiux', icon: '🎨', image: require('../images/df04e591-2aa9-4e02-a8d6-f0f850577298.jpg') },
    { name: 'الجرافيك', path: '/graphic', icon: '🖌️', image: require('../images/8ed6bebf-cff1-4cf9-bc9e-41a189a9f712.jpg') },
    { name: 'الفيديو والمونتاج', path: '/video', icon: '🎥', image: require('../images/c6f82d64-0c3e-4bdc-9f62-fadbb804d03b.jpg') },
    { name: 'التصميم الهندسي', path: '/engineering', icon: '📐', image: require('../images/4b1bc2bd-f686-49ec-a82f-931d1ce05213.jpg') },
  ];

  const sentence = "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه.";

  return (
    <div className={`min-vh-100 d-flex flex-column ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
      {/* Navbar */}
      <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Sharikly</Link>
          <div className="mx-auto text-center">
            <motion.div
              className="navbar-text"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.3,
                    repeat: Infinity,
                    repeatDelay: 4,
                  },
                },
              }}
            >
              {'Sharikly – We devour the peaks and lead success with a spirit that knows no limits 🐺💥'.split(' ').map((word, index) => (
                <motion.span
                  key={index}
                  style={{ display: 'inline-block', marginRight: '5px' }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
          </div>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/admin-login">دخول الأدمن</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/supervisor-login">دخول المشرف</Link>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-primary ms-3" onClick={() => setDarkMode((prev) => !prev)}>
                  {darkMode ? <FaSun /> : <FaMoon />}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="d-flex justify-content-between align-items-start flex-wrap">

        {/* Cards on the right */}
        <div className={`cards-container ${darkMode ? 'dark-mode' : ''}`}>
          {services.slice(3).map((service, index) => (
            <motion.div
              key={service.name}
              className="card-item mb-3"
              initial={{ x: '-100vw' }}
              animate={{ x: 0 }}
              transition={{ delay: index * 0.3, type: 'spring', stiffness: 50 }}
              onClick={() => navigate(service.path)}
            >
              <div className="card shadow-sm text-center h-100">
                <div className="card-header">{service.icon} {service.name}</div>
                <div className="card-body" style={{
                  backgroundImage: `url(${service.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Text Section */}
        <div className="text-section mx-4 my-4" style={{ flex: '1', maxWidth: '220px', marginTop: '40px' }}>
          <div
            className="motion-div"
            style={{
              textAlign: 'left', // تغيير المحاذاة إلى اليسار
              direction: 'rtl',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: textColor,
              marginLeft: '20px', // إضافة مسافة من اليسار
            }}
          >
            {showSentence && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 }, // البداية: الجملة مخفية
                  visible: {
                    opacity: 1, // الجملة مرئية
                    transition: {
                      staggerChildren: 0.5, // ظهور الكلمات واحدة تلو الأخرى
                      delayChildren: 0, // بدون تأخير أولي
                    },
                  },
                }}
                onAnimationComplete={() => {
                  setTimeout(() => {
                    setShowSentence(false); // إخفاء الجملة بعد 9 ثوانٍ
                  }, 9000);
                }}
              >
                {sentence.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    style={{ display: 'inline-block', marginRight: '5px' }}
                    variants={{
                      hidden: { opacity: 0, y: 20 }, // البداية: غير مرئية ومنخفضة قليلاً
                      visible: { opacity: 1, y: 0 }, // النهاية: مرئية وفي مكانها
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
            هذا ما تسعي إليه الشركه لإرضاء الله ثم العميل
          </p>
          
          <h4 className="mt-3" style={{ fontSize: '1.1rem' }}>*ميزات الشركه*</h4>
          <ul style={{ paddingLeft: '8px', fontSize: '0.85rem', lineHeight: '1.4' }}>
            <li>لا تحتاج منك تسجيل دخول بالبريد الالكتروني، فمجرد تحدثك في الشات أو إرسال طلبك يتخزن في قاعدة البيانات ب<strong> Id </strong>فريد ويتم حفظ الشات أيضاً على هاتفك.</li>
            <li>لا نطلب منك 20% على إجراء العمل مثل بعض الشركات، بل إذا عدت مرة أخرى يخصم لك 10%، يعني وفرت <strong>%30</strong>.</li>
            <li>لدينا موظفون متخصصون في هذه المجالات، وعليهم ليدر تيم لمراجعة عملك ليكون كما تريد وأفضل.</li>
            <li>لدينا خدمة عملاء مميزة للرد عليك، وإذا أردت التعديل تحدث في الشات 😊👌.</li>
          </ul>
        </div>

        {/* Central Full Image with Title */}
        <div className="text-center my-4 central-image-wrapper d-flex flex-wrap justify-content-center align-items-center" style={{ position: 'relative' }}>
          {/* الصورة والعنوان داخل نفس الـ div */}
          <div 
            className="image-and-title-wrapper" 
            style={{
              position: 'relative', // لجعل المحتوى يتحرك كوحدة واحدة
              textAlign: 'center',
              transform: 'translate(-10%, -10%)', // تحريك العنصر للأعلى ولليسار
              marginTop: '-490px', // رفع العنصر للأعلى قليلاً
              marginLeft: '-20px', // تحريك العنصر لليسار قليلاً
            }}
          >
            {/* النصوص */}
            <div 
              className="image-title-wrapper" 
              style={{ 
                marginBottom: '20px', // مسافة بين النصوص والصورة
                color: darkMode ? 'white' : 'black', 
                fontWeight: 'bold',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>Sharikly! مرحباً بك في</h2>
              <h3 style={{ fontSize: '1rem' }}>اختر خدمتك وابدأ التحدث عبر الشات</h3>
            </div>

            {/* الصورة */}
            <motion.img
              src={mainImage}
              alt="Main visual"
              className="central-image"
              style={{
                width: '80%', // عرض الصورة يتكيف مع الشاشة
                maxWidth: '350px', // الحد الأقصى لعرض الصورة
                height: 'auto', // الحفاظ على نسبة العرض إلى الارتفاع
                margin: '0 auto', // توسيط الصورة
              }}
              initial={{ y: 0 }} // البداية
              animate={{ y: 0 }} // إزالة التحرك العمودي
              transition={{ duration: 1, type: 'spring', stiffness: 50 }} // مدة الحركة ونوعها
            />
          </div>

          {/* النصوص على يمين الصورة */}
          <div 
            className="wolf-description" 
            style={{
              flex: '1',
              maxWidth: '400px',
              marginLeft: '20px', // مسافة بين النص والصورة
              textAlign: 'right', // محاذاة النص إلى اليمين
              fontSize: '1rem',
              lineHeight: '1.6',
              color: darkMode ? 'white' : 'black',
            }}
          >
            <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>لماذا اخترنا الذئب لوجو؟ 🤔</h4>
            <p>الذئب يُعرف بعدة صفات مميزة جعلته رمزًا في الثقافات والقصص، ومنها:</p>
            <ul style={{ paddingLeft: '1rem' }}>
              <li>الذكاء: يتمتع بذكاء حاد، ويُعرف بقدرته على التخطيط والمراوغة، خصوصًا أثناء الصيد.</li>
              <li>القوة: يتميز بجسم قوي يمكنه من ملاحقة الفريسة والتغلب عليها.</li>
              <li>الولاء: يعيش في جماعات منظمة ويُظهر ولاءً كبيرًا لأسرته، ويعتني بصغاره.</li>
              <li>الشجاعة: لا يخاف بسهولة، ويُعرف بمواجهته للتهديدات إذا لزم الأمر.</li>
              <li>الكرامة: لا يأكل الجيفة غالبًا، ويفضّل الصيد على التسوّل أو التطفل.</li>
              <li>الحذر: لا يقترب من البشر بسهولة، ويتصرف بحذر شديد عند استكشاف بيئته.</li>
              <li>الحرية: يحب العيش في البرية، ولا يتحمّل القيود، لذا من الصعب ترويضه.</li>
              <li>الاستقلالية: يمكنه الاعتماد على نفسه في الصيد والبقاء حتى لو انفصل عن القطيع.</li>
            </ul>
            <p>هذه صفاته تعكس شركتنا تمامًا، فلا يوجد لوجو أفضل من هذا.</p>
          </div>
        </div>

        {/* Cards on the left */}
        <div className={`cards-container ${darkMode ? 'dark-mode' : ''}`}>
          {services.slice(0, 3).map((service, index) => (
            <motion.div
              key={service.name}
              className="card-item mb-3"
              initial={{ x: '100vw' }}
              animate={{ x: 0 }}
              transition={{ delay: index * 0.3, type: 'spring', stiffness: 50 }}
              onClick={() => navigate(service.path)}
            >
              <div className="card shadow-sm text-center h-100">
                <div className="card-header">{service.icon} {service.name}</div>
                <div className="card-body" style={{
                  backgroundImage: `url(${service.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
