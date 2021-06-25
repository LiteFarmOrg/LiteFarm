import React from 'react';
// import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Button from '../Form/Button';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { Main, Semibold } from '../Typography';
import Layout from '../Layout';
import { colors } from '../../assets/theme';

const PureCertificationAllInfoReady = ({ onExport, handleGoBack, handleCancel }) => {
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
          color: colors.teal700,
          marginBottom: '16px',
          display: 'inline-flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {t('CERTIFICATIONS.GOOD_NEWS')}
      </Semibold>

      <Main style={{ marginBottom: '24px', lineHeight: '20px' }}>
        {t('CERTIFICATIONS.HAVE_ALL_INFO')}
      </Main>
    </Layout>
  );
};

PureCertificationAllInfoReady.propTypes = {
  onExport: PropTypes.func,
  handleGoBack: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default PureCertificationAllInfoReady;
