import React from 'react';
// import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Button from '../Form/Button';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { Main, Semibold } from '../Typography';
import Layout from '../Layout';
import { VscWarning } from 'react-icons/all';
import { colors } from '../../assets/theme';

const PureCertificationContactCertifierFailed = ({ onExport, handleGoBack, handleCancel }) => {
  const { t } = useTranslation();

  const progress = 33;
  return (
    <Layout
      buttonGroup={
        <Button fullLength onClick={onExport}>
          {t('CERTIFICATIONS.EXPORT')}
        </Button>
      }
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={handleGoBack}
        onCancel={handleCancel}
        title={t('CERTIFICATIONS.EXPORT_DOCS')}
        value={progress}
      />

      <Semibold
        style={{
          color: colors.brown700,
          marginBottom: '16px',
          display: 'inline-flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <VscWarning style={{ fontSize: '20px' }} />
        {t('CERTIFICATIONS.UH_OH')}
      </Semibold>

      <Main style={{ marginBottom: '24px', lineHeight: '20px' }}>
        {t('CERTIFICATIONS.COULD_NOT_CONTACT_CERTIFIER')}
      </Main>
    </Layout>
  );
};

PureCertificationContactCertifierFailed.propTypes = {
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  handleGoBack: PropTypes.func,
  handleCancel: PropTypes.func,
  defaultEmail: PropTypes.string,
};

export default PureCertificationContactCertifierFailed;
