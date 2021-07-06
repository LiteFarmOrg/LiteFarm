import React from 'react';
import { useTranslation } from 'react-i18next';
import { Main, Semibold } from '../../Typography';
import { colors } from '../../../assets/theme';

const RegisteredCertifierNoQuestionsSurvey = () => {
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

      <Main style={{ marginBottom: '24px', lineHeight: '20px' }}>
        {t('CERTIFICATIONS.HAVE_ALL_INFO')}
      </Main>
    </>
  );
};

RegisteredCertifierNoQuestionsSurvey.propTypes = {};

export default RegisteredCertifierNoQuestionsSurvey;
