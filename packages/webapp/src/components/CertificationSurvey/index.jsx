import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../Form/Button';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import Layout from '../Layout';
import RegisteredCertifierQuestionsSurvey from './RegisteredCertifierQuestions';
import RegisteredCertifierNoQuestionsSurvey from './RegisteredCertifierNoQuestions';
import UnregisteredCertifierSurvey from './UnregisteredCertifier';

const PureCertificationSurveyPage = ({
  onExport,
  handleGoBack,
  handleCancel,
  certifier,
  requested_certifier,
  persistedFormData,
  useHookFormPersist,
  onSurveyComplete,
  email,
}) => {
  const { t } = useTranslation();
  const [submissionId, setSubmissionId] = useState(persistedFormData?.submission_id);

  const persistedPath = ['/certification/report_period'];
  useHookFormPersist(() => ({}), persistedPath);

  const progress = 67;

  useEffect(() => {
    const handler = (event) => {
      // if (typeof event.data !== 'string') return; // TODO: figure out better way to filter iframe message. maybe source?
      // const data = JSON.parse(event.data);
      const { type, payload } = event.data;
      if (type === 'SUBMISSION_RESULT_SUCCESS_CLOSE') {
        setSubmissionId(payload.submissionId);
        onSurveyComplete(payload.submissionId);
      }
    };

    window.addEventListener('message', handler);

    // clean up
    return () => window.removeEventListener('message', handler);
  }, []);

  const { certifier_acronym, survey_id } = certifier ?? {};
  const [isSurveySkipped, setSurveySkipped] = useState(false);

  return (
    <>
      <Layout
        buttonGroup={<>
          {survey_id && !isSurveySkipped &&
            <Button color={'secondary'} fullLength onClick={() => setSurveySkipped(true)}>{t('common:SKIP')}</Button>}
          <Button
            fullLength
            onClick={() =>
              onExport({
                ...persistedFormData,
                submission_id: submissionId,
              })
            }
            disabled={survey_id && !submissionId && !isSurveySkipped}
          >
            {t('CERTIFICATIONS.EXPORT')}
          </Button>
        </>
        }
      >
        <MultiStepPageTitle
          style={{ marginBottom: '24px' }}
          onGoBack={handleGoBack}
          onCancel={handleCancel}
          title={t('CERTIFICATIONS.EXPORT_DOCS')}
          cancelModalTitle={t('CERTIFICATIONS.FLOW_TITLE')}
          value={progress}
        />

        <SurveyBody
          requested_certifier={requested_certifier}
          certifier_acronym={certifier_acronym}
          surveyId={survey_id}
          isSurveySkipped={isSurveySkipped}
          submissionId={submissionId}
          email={email}
          // TODO: use hook form email when we make it dynamic
          // email={persistedFormData.email}
        />
      </Layout>
    </>
  );
};

const SurveyBody = ({ requested_certifier, certifier_acronym, surveyId, submissionId, email, isSurveySkipped }) => {
  if (requested_certifier) {
    return <UnregisteredCertifierSurvey email={email} />;
  } else {
    if (surveyId) {
      // TODO: this is hard coded for the purpose of proof-of-concept
      return (
        <RegisteredCertifierQuestionsSurvey
          certiferAcronym={certifier_acronym}
          surveyId={surveyId}
          submissionId={submissionId}
          isSurveySkipped={isSurveySkipped}
          email={email}
        />
      );
    } else {
      return <RegisteredCertifierNoQuestionsSurvey email={email} />;
    }
  }
};

PureCertificationSurveyPage.propTypes = {
  onExport: PropTypes.func,
  handleGoBack: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default PureCertificationSurveyPage;
