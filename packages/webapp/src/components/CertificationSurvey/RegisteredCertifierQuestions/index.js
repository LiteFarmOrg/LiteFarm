import React from 'react';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main, Semibold } from '../../Typography';
import { colors } from '../../../assets/theme';

const RegisteredCertifierQuestionsSurvey = ({ certiferAcronym }) => {
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
                  JSON.stringify({
                    error: false,
                    message: "Hello World"
                  }),
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

RegisteredCertifierQuestionsSurvey.propTypes = {
  certiferAcronym: PropTypes.string,
};

export default RegisteredCertifierQuestionsSurvey;
