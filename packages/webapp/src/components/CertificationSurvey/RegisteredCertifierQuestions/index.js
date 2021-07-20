import React from 'react';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main, Semibold } from '../../Typography';
import { colors } from '../../../assets/theme';
import { ReactComponent as PostSurveySplash } from '../../../assets/images/certification/CompleteSurveySplash.svg';

const RegisteredCertifierQuestionsSurvey = ({ certiferAcronym, submissionId, email }) => {
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

      {submissionId ? <PostSurveyBody email={email} /> : <PreSurveyBody />}
    </>
  );
};

const PreSurveyBody = () => {
  const { t } = useTranslation();

  return (
    <>
      <Main style={{ marginBottom: '24px', lineHeight: '20px' }}>
        {t('CERTIFICATIONS.WOULD_LIKE_ANSWERS')}
      </Main>

      <iframe
        title="temp iframe title"
        // src="https://app.surveystack.io/surveys/60da1692e5a5180001008566"
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <script>
              console.log("hello world from an iframe!");
              setTimeout(() => {
                window.top.postMessage(
                  {
                    type: 'SUBMISSION_RESULT_SUCCESS_CLOSE',
                    payload: {
                      submissionId: '60df45608b55990001f24afd',
                    },
                  },
                  '*'
                );
              }, 5000);
              </script>
            </head>
            <body>
              <h1>This is a sample survey</h1>
              <h2>Please wait 5 seconds for a demo submission (export button will be enabled)</h2>
            </body>
          </html>
        `}
        className={styles.surveyFrame}
      />
    </>
  );
};

const PostSurveyBody = ({ email }) => {
  const { t } = useTranslation();

  return (
    <>
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
    </>
  );
};

RegisteredCertifierQuestionsSurvey.propTypes = {
  certiferAcronym: PropTypes.string,
};

export default RegisteredCertifierQuestionsSurvey;
