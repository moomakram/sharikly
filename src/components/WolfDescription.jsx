import React from 'react';

const WolfDescription = ({ darkMode }) => {
  return (
    <div
      className="wolf-description my-4"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // تعديل لجعل المحتوى في المنتصف
        flex: '1',
        maxWidth: '400px',
        marginTop: '1rem',
        textAlign: 'center', // تعديل لجعل النص في المنتصف
        lineHeight: '1.6',
        color: darkMode ? 'white' : 'black',
      }}
    >
      <h4 style={{ fontSize: '0.65rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        لماذا اخترنا الذئب لوجو؟ 🤔
      </h4>
      <p>
        الذئب يُعرف بعدة صفات مميزة جعلته رمزًا في الثقافات والقصص، ومنها:
      </p>
      <ul style={{ paddingLeft: '1rem' }}>
        <li>الذكاء: يتمتع بذكاء حاد، ويعرف بقدرته على التخطيط والمراوغة، خصوصًا أثناء الصيد.</li>
        <li>القوة: يتميز بجسم قوي يمكنه من ملاحقة الفريسة والتغلب عليها.</li>
        <li>الولاء: يعيش في جماعات منظمة ويظهر ولاءً لأسرته، ويعتني بصغاره.</li>
        <li>الشجاعة: لا يخاف بسهولة، ويعرف بمواجهته للتهديدات إذا لزم الأمر.</li>
        <li>الكرامة: لا يأكل الجيفة غالباً، ويفضل الصيد على التسول أو التطفل.</li>
        <li>الحذر: لا يقترب من البشر بسهولة، ويتصرف بحذر شديد عند استكشاف بيئته.</li>
        <li>الحرية: يحب العيش في البرية، ولا يتحمل القيود، لذا من الصعب ترويضه.</li>
        <li>الاستقلالية: يمكنه الاعتماد على نفسه في الصيد والبقاء حتى لو انفصل عن القطيع.</li>
      </ul>
      <p style={{ marginTop: 'auto' }}>
        هذه صفاته تعكس شركتنا تمامًا، فلا يوجد لوجو أفضل من هذا.
      </p>
    </div>
  );
};

export default WolfDescription;