import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Button from '../Form/Button';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { Main, Semibold } from '../Typography';
import Layout from '../Layout';
import { colors } from '../../assets/theme';
import RegisteredCertifierQuestionsSurvey from './RegisteredCertifierQuestions';
import RegisteredCertifierNoQuestionsSurvey from './RegisteredCertifierNoQuestions';
import UnregisteredCertifierSurvey from './UnregisteredCertifier';

const PureCertificationSurveyPage = ({ onExport, handleGoBack, handleCancel, certiferAcronym }) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const progress = 33;

  useEffect(() => {
    const handler = (event) => {
      // console.log(event);
      if (typeof event.data !== 'string') return; // TODO: figure out better way to filter iframe message. maybe source?
      const data = JSON.parse(event.data);
      console.log('Hello World?', data);
      setSubmitted(true);
    };

    window.addEventListener('message', handler);

    // clean up
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <Layout
      buttonGroup={
        <Button fullLength onClick={onExport} disabled={!submitted}>
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

      <RegisteredCertifierQuestionsSurvey />
      {/* <RegisteredCertifierNoQuestionsSurvey /> */}
      {/* <UnregisteredCertifierSurvey /> */}
    </Layout>
  );
};

PureCertificationSurveyPage.propTypes = {
  onExport: PropTypes.func,
  handleGoBack: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default PureCertificationSurveyPage;
