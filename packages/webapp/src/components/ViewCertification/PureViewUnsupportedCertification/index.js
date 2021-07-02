import React, { useState } from 'react';
import CertifierSelectionMenuItem from '../../CertifierSelection/CertifierSelectionMenu/CertiferSelectionMenuItem';
import { useTranslation } from 'react-i18next';
import { Semibold, Text, Title, Underlined } from '../../Typography';
import Button from '../../Form/Button';
import Layout from '../../Layout';

export default function PureViewUnsupportedCertification({ onExport, onChangePreference }) {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <Layout
      hasWhiteBackground
      buttonGroup={
        <Button onClick={onExport} color={'primary'} fullLength>
          {t('common:Export')}
        </Button>
      }
    >
      <Title style={{ marginBottom: '16px' }}>{t('MY_FARM.CERTIFICATIONS')}</Title>
      <Semibold style={{ paddingBottom: '20px', fontSize: '16px', fontWeight: 'normal' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.REQUEST_ONE') +
          ' ' +
          `Organic` +
          ' ' +
          t('CERTIFICATION.CERTIFICATION_EXPORT.REQUEST_TWO') +
          ' ' +
          'Oregon Tilth'}
      </Semibold>

      <Text style={{ fontSize: '16px' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_ONE')}
        <span
          style={{
            textDecorationLine: 'underline',
            color: 'var(--iconActive)',
            cursor: 'pointer',
            fontSize: '16px',
          }}
          onClick={onChangePreference}
        >
          {' '}
          {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_CHANGE_PREFERENCE')}{' '}
        </span>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_TWO')}
      </Text>
    </Layout>
  );
}
