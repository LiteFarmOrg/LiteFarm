import React, { useState } from 'react';
import CertifierSelectionMenuItem from '../../CertifierSelection/CertifierSelectionMenu/CertiferSelectionMenuItem';
import { useTranslation } from 'react-i18next';
import { Semibold, Text, Title, Underlined } from '../../Typography';
import Button from '../../Form/Button';
import Layout from '../../Layout';

export default function PureViewUnsupportedCertification({
  onExport,
  onChangeCertificationPreference,
  unsupportedCertifier,
  unsupportedCertification,
}) {
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
        {t('CERTIFICATION.CERTIFICATION_EXPORT.REQUEST_ONE')}
        <span style={{ fontWeight: 'bold' }}>
          {' ' + `${unsupportedCertification.certification_type}` + ' '}
        </span>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.REQUEST_TWO')}
        <span style={{ fontWeight: 'bold' }}>
          {' ' + `${unsupportedCertifier.certifier_name}` + ' '}
        </span>
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
          onClick={onChangeCertificationPreference}
        >
          {' '}
          {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_CHANGE_PREFERENCE')}{' '}
        </span>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_TWO')}
      </Text>
    </Layout>
  );
}
