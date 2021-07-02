import React, { useState } from 'react';
import CertifierSelectionMenuItem from '../../CertifierSelection/CertifierSelectionMenu/CertiferSelectionMenuItem';
import { useTranslation } from 'react-i18next';
import { Semibold, Text, Title, Underlined } from '../../Typography';
import Button from '../../Form/Button';
import Layout from '../../Layout';

export default function PureViewSupportedCertification({
  supportedCertifier,
  history,
  onBack,
  onSubmit,
  selectedCertifier,
  certifierType,
  role_id,
  supportedCertification,
  onAddCertification,
}) {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <Layout
      hasWhiteBackground
      buttonGroup={
        <Button onClick={onSubmit} color={'primary'} fullLength>
          {t('common:Export')}
        </Button>
      }
    >
      <Title style={{ marginBottom: '16px' }}>{t('MY_FARM.CERTIFICATIONS')}</Title>
      <Semibold style={{ paddingBottom: '20px', fontSize: '16px', fontWeight: 'normal' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.TITLE_ONE') +
          ' ' +
          `${supportedCertification.certification_type}` +
          ' ' +
          t('CERTIFICATION.CERTIFICATION_EXPORT.TITLE_TWO')}
      </Semibold>

      <Semibold style={{ paddingBottom: '20px', fontSize: '16px', fontWeight: 'normal' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.NO_LONGER_WORKING')}
      </Semibold>

      <CertifierSelectionMenuItem
        style={{ marginBottom: '16px' }}
        certifierName={
          supportedCertifier.certifier_name + ' ' + '(' + supportedCertifier.certifier_acronym + ')'
        }
        color={'active'}
      />

      {role_id !== 3 && (
        <div
          style={{
            width: 'fit-content',
            fontSize: '16px',
            color: 'var(--iconActive)',
            lineHeight: '16px',
            cursor: 'pointer',
          }}
          onClick={onAddCertification}
        >
          <Underlined>{t('CERTIFICATION.CERTIFICATION_EXPORT.CHANGE_CERT')}</Underlined>
        </div>
      )}
    </Layout>
  );
}
