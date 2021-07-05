import React, { useState } from 'react';
import CertifierSelectionMenuItem from '../../CertifierSelection/CertifierSelectionMenu/CertiferSelectionMenuItem';
import { useTranslation } from 'react-i18next';
import { Semibold, Text, Title, Underlined } from '../../Typography';
import Button from '../../Form/Button';
import Layout from '../../Layout';

export default function PureViewSupportedCertification({
  supportedCertifier,
  supportedCertification,
  onExport,
  onChangeCertification,
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
        {t('CERTIFICATION.CERTIFICATION_EXPORT.TITLE_ONE')}
        <span style={{ fontWeight: 'bold' }}>
          {' ' + `${supportedCertification.certification_type}` + ' '}
        </span>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.TITLE_TWO')}
      </Semibold>

      <CertifierSelectionMenuItem
        style={{ marginBottom: '16px' }}
        certifierName={
          supportedCertifier.certifier_name + ' ' + '(' + supportedCertifier.certifier_acronym + ')'
        }
        color={'active'}
      />

      <Semibold style={{ paddingBottom: '5px', fontSize: '16px', fontWeight: 'normal' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.NO_LONGER_WORKING')}
      </Semibold>

      <div
        style={{
          width: 'fit-content',
          fontSize: '16px',
          color: 'var(--iconActive)',
          lineHeight: '16px',
          cursor: 'pointer',
        }}
        onClick={onChangeCertification}
      >
        <Underlined>{t('CERTIFICATION.CERTIFICATION_EXPORT.CHANGE_CERT')}</Underlined>
      </div>
    </Layout>
  );
}
