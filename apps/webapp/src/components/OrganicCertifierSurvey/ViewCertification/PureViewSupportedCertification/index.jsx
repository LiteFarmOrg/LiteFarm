import React, { useState } from 'react';
import CertifierSelectionMenuItem from '../../CertifierSelection/CertifierSelectionMenu/CertiferSelectionMenuItem';
import { useTranslation } from 'react-i18next';
import { Main, Title, Underlined } from '../../../Typography';
import Button from '../../../Form/Button';
import Layout from '../../../Layout';
import PropTypes from 'prop-types';
import PureViewUnsupportedCertification from '../PureViewUnsupportedCertification';
import { PureSnackbar } from '../../../PureSnackbar';

export default function PureViewSupportedCertification({
  supportedCertifier,
  supportedCertificationName,
  onExport,
  onChangeCertificationPreference,
  showSuccessSnackBar,
}) {
  const { t } = useTranslation(['translation', 'common']);
  const [showSnackBar, setShowSnackBar] = useState(showSuccessSnackBar);
  const onDismiss = () => setShowSnackBar(false);
  return (
    <Layout
      buttonGroup={
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: '16px', flexGrow: 1 }}>
          {showSnackBar && (
            <PureSnackbar
              onDismiss={onDismiss}
              type={'success'}
              message={t('CERTIFICATION.CERTIFICATION_EXPORT.UPDATE_SUCCESS')}
            />
          )}
          <Button onClick={onExport} color={'primary'} fullLength>
            {t('common:EXPORT')}
          </Button>
        </div>
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
