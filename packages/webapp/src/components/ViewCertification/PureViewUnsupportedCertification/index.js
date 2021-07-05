import React from 'react';
import { useTranslation } from 'react-i18next';
import { Main, Title } from '../../Typography';
import Button from '../../Form/Button';
import Layout from '../../Layout';
import PropTypes from 'prop-types';

export default function PureViewUnsupportedCertification({
  onExport,
  onChangeCertificationPreference,
  unsupportedCertifierName,
  unsupportedCertificationName,
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
        {t('CERTIFICATION.CERTIFICATION_EXPORT.REQUEST_ONE')}
        <strong>{` ${unsupportedCertificationName} `}</strong>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.REQUEST_TWO')}
        <strong style={{ fontWeight: 'bold' }}>{` ${unsupportedCertifierName} `}</strong>
      </Main>

      <Main>
        {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_ONE')}{' '}
        <span
          style={{
            textDecorationLine: 'underline',
            color: 'var(--iconActive)',
            cursor: 'pointer',
          }}
          onClick={onChangeCertificationPreference}
        >
          {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_CHANGE_PREFERENCE')}
        </span>{' '}
        {t('CERTIFICATION.CERTIFICATION_EXPORT.UNSUPPORTED_TWO')}
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
