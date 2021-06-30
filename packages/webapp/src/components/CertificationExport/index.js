import React from 'react';
import CertifierSelectionMenuItem from '../CertifierSelection/CertifierSelectionMenu/CertiferSelectionMenuItem';
import Input from '../Form/Input';
import { useTranslation } from 'react-i18next';
import { Semibold, Text, Title, Underlined } from '../Typography';
import Button from '../Form/Button';
import Layout from '../Layout';

export default function PureCertificationExportView({
  allSupportedCertifiers,
  history,
  onBack,
  onSubmit,
  selectedCertifier,
  certifierType,
  role_id,
  allSupportedCertificationTypes,
  certificationType,
}) {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <Layout
      hasWhiteBackground
      buttonGroup={
        <Button onClick={onBack} color={'primary'} fullLength>
          {t('common:Export')}
        </Button>
      }
    >
      <Title style={{ marginBottom: '16px' }}>{t('MY_FARM.CERTIFICATIONS')}</Title>
      <Semibold style={{ paddingBottom: '20px', fontSize: '16px', fontWeight: 'normal' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.TITLE_ONE') +
          ' ' +
          'Organic' + // need to be replaced with selectedCertificationTranslation/allSupportedCertificationTypes
          ' ' +
          t('CERTIFICATION.CERTIFICATION_EXPORT.TITLE_TWO')}
      </Semibold>

      <Semibold style={{ paddingBottom: '20px', fontSize: '16px', fontWeight: 'normal' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.NO_LONGER_WORKING')}
      </Semibold>

      <CertifierSelectionMenuItem
        style={{ marginBottom: '16px' }}
        certifierName={'Fraser Valley Organic Producers Association (FVOPA)'}
        color={'active'}
        // TODO: NEED TO ADD onClick
      />

      <div
        style={{
          width: 'fit-content',
          fontSize: '16px',
          color: 'var(--iconActive)',
          lineHeight: '16px',
          cursor: 'pointer',
        }}
        // TODO: NEED TO ADD onClick for link div
      >
        <Underlined>{t('CERTIFICATION.CERTIFICATION_EXPORT.CHANGE_CERT')}</Underlined>
      </div>
    </Layout>
  );
}
