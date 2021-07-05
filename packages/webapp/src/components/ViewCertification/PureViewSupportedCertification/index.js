import React from 'react';
import CertifierSelectionMenuItem from '../../CertifierSelection/CertifierSelectionMenu/CertiferSelectionMenuItem';
import { useTranslation } from 'react-i18next';
import { Main, Title, Underlined } from '../../Typography';
import Button from '../../Form/Button';
import Layout from '../../Layout';
import PropTypes from 'prop-types';
import PureViewUnsupportedCertification from '../PureViewUnsupportedCertification';

export default function PureViewSupportedCertification({
  supportedCertifier,
  supportedCertificationName,
  onExport,
  onChangeCertificationPreference,
}) {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <Layout
      buttonGroup={
        <Button onClick={onExport} color={'primary'} fullLength>
          {t('common:EXPORT')}
        </Button>
      }
    >
      <Title style={{ marginBottom: '16px' }}>{t('MY_FARM.CERTIFICATIONS')}</Title>
      <Main style={{ paddingBottom: '20px' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.SUPPORTED_CERTIFICATION_ONE')}
        <strong>{` ${supportedCertificationName} `}</strong>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.SUPPORTED_CERTIFICATION_TWO')}
      </Main>

      <CertifierSelectionMenuItem
        style={{ marginBottom: '16px' }}
        certifierName={`${supportedCertifier.certifier_name} (${supportedCertifier.certifier_acronym})`}
        color={'active'}
      />

      <Main style={{ paddingBottom: '5px' }}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.NO_LONGER_WORKING')}
      </Main>

      <Underlined onClick={onChangeCertificationPreference}>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.CHANGE_CERTIFICATION_PREFERENCE_CAPITAL')}
      </Underlined>
    </Layout>
  );
}
PureViewUnsupportedCertification.propTypes = {
  onExport: PropTypes.func,
  onChangeCertificationPreference: PropTypes.func,
  supportedCertifier: PropTypes.shape({
    certifier_acronym: PropTypes.string,
    certifier_name: PropTypes.string,
  }),
  supportedCertificationName: PropTypes.string,
};
