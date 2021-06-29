import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Button from '../Form/Button';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { Main, Semibold } from '../Typography';
import Layout from '../Layout';
import { colors } from '../../assets/theme';

const PureCertificationSurveyPage = ({ onExport, handleGoBack, handleCancel, certiferAcronym }) => {
  const { t } = useTranslation();

  const progress = 33;

  return (
    <Layout
      buttonGroup={
        <Button fullLength onClick={onExport} disabled>
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
        {`${t('CERTIFICATIONS.ORGANIC_CERTIFICATION_FROM')} ${certiferAcronym}`}
      </Semibold>

      <Main style={{ marginBottom: '24px', lineHeight: '20px' }}>
        {t('CERTIFICATIONS.WOULD_LIKE_ANSWERS')}
      </Main>

      <iframe
        title="temp iframe title"
        src="https://app.surveystack.io/surveys/60da1692e5a5180001008566"
        className={styles.surveyFrame}
      />
    </Layout>
  );
};

PureCertificationSurveyPage.propTypes = {
  onExport: PropTypes.func,
  handleGoBack: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default PureCertificationSurveyPage;
