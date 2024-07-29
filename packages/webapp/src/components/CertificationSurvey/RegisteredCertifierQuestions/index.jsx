import React from 'react';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Info, Main, Semibold } from '../../Typography';
import { colors } from '../../../assets/theme';
import { ReactComponent as PostSurveySplash } from '../../../assets/images/certification/CompleteSurveySplash.svg';
const surveyGroupId = import.meta.env.VITE_SURVEY_GROUP_ID;

const RegisteredCertifierQuestionsSurvey = ({
  certiferAcronym,
  surveyId,
  submissionId,
  isSurveySkipped,
  email,
}) => {
  const { t } = useTranslation();

  return (
    <>
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

      <Main style={{ marginBottom: '16px', lineHeight: '20px' }}>
        {t('CERTIFICATIONS.WOULD_LIKE_ANSWERS')}
      </Main>

      <Info style={{ marginBottom: '24px' }}>{t('CERTIFICATIONS.NOTE_CANNOT_RESUBMIT')}</Info>

      {submissionId || isSurveySkipped ? (
        <PostSurveyBody email={email} />
      ) : (
        <PreSurveyBody surveyId={surveyId} />
      )}
    </>
  );
};

const PreSurveyBody = ({ surveyId }) => {
  return (
    <iframe
      title="temp iframe title"
      src={`https://staging.surveystack.io/groups/${surveyGroupId}/surveys/${surveyId}/submissions/new?minimal_ui=true`}
      className={styles.surveyFrame}
      allow="geolocation"
    />
  );
};

const PostSurveyBody = ({ email }) => {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.surveyFrame, styles.iframeBorder)}>
      <PostSurveySplash
        style={{
          height: '27.3vh',
          margin: '1vh 0 5vh 0',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      />
      <Main style={{ marginBottom: '24px', lineHeight: '20px' }}>
        {t('CERTIFICATIONS.FILES_ARE_READY')}
      </Main>

      <Semibold>{email}</Semibold>
    </div>
  );
};

RegisteredCertifierQuestionsSurvey.propTypes = {
  certiferAcronym: PropTypes.string,
};

export default RegisteredCertifierQuestionsSurvey;
