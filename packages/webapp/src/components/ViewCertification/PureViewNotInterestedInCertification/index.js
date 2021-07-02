import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Semibold, Text, Title, Underlined } from '../../Typography';

import Layout from '../../Layout';

export default function PureViewNotInterestedInCertification({ onAddCertification }) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Layout>
      <Title style={{ marginBottom: '16px' }}>{t('MY_FARM.CERTIFICATIONS')}</Title>
      <text style={{ fontSize: '16px', paddingBottom: '15px' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.NO_CERTIFICATIONS')}
      </text>

      <span
        style={{
          textDecorationLine: 'underline',
          color: 'var(--iconActive)',
          cursor: 'pointer',
          fontSize: '14px',
        }}
        onClick={onAddCertification}
      >
        {' '}
        + {t('CERTIFICATION.CERTIFICATION_EXPORT.ADD')}{' '}
      </span>
    </Layout>
  );
}
