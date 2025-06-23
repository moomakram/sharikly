import React from 'react';
import { useTranslation } from 'react-i18next';

const DynamicSentence = () => {
  const { t } = useTranslation();

  return (
    <div className="dynamic-sentence">
      <p>{t('dynamic_sentence')}</p>
    </div>
  );
};

export default DynamicSentence;
