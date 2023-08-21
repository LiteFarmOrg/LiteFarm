import React from 'react';
import { useTranslation } from 'react-i18next';
import { Main, Semibold } from '../../Typography';
import { colors } from '../../../assets/theme';
import { ReactComponent as PostSurveySplash } from '../../../assets/images/certification/CompleteSurveySplash.svg';

const RegisteredCertifierNoQuestionsSurvey = ({ email }) => {
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
        {t('CERTIFICATIONS.GOOD_NEWS')}
      </Semibold>

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
        {t('CERTIFICATIONS.HAVE_ALL_INFO')}
      </Main>

      <Semibold>{email}</Semibold>
    </>
  );
};

RegisteredCertifierNoQuestionsSurvey.propTypes = {};

export default RegisteredCertifierNoQuestionsSurvey;
