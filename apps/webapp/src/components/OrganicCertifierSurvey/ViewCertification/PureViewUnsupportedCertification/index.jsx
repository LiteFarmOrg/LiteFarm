import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Main, Title } from '../../../Typography';
import Button from '../../../Form/Button';
import Layout from '../../../Layout';
import PropTypes from 'prop-types';
import { PureSnackbar } from '../../../PureSnackbar';

export default function PureViewUnsupportedCertification({
  onExport,
  onChangeCertificationPreference,
  unsupportedCertifierName,
  unsupportedCertificationName,
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
        {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_CERTIFICATION_REQUEST_ONE')}
        <strong>{` ${unsupportedCertificationName} `}</strong>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_CERTIFICATION_REQUEST_TWO')}
        <strong style={{ fontWeight: 'bold' }}>{` ${unsupportedCertifierName} `}</strong>
      </Main>

      <Main>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_CERTIFICATION_MESSAGE_ONE')}{' '}
        <span
          style={{
            textDecorationLine: 'underline',
            color: 'var(--iconActive)',
            cursor: 'pointer',
          }}
          onClick={onChangeCertificationPreference}
        >
          {t('CERTIFICATION.CERTIFICATION_EXPORT.CHANGE_CERTIFICATION_PREFERENCE')}
        </span>{' '}
        {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_CERTIFICATION_MESSAGE_TWO')}
      </Main>
    </Layout>
  );
}
PureViewUnsupportedCertification.propTypes = {
  onExport: PropTypes.func,
  onChangeCertificationPreference: PropTypes.func,
  unsupportedCertifierName: PropTypes.string,
  unsupportedCertificationName: PropTypes.string,
};
